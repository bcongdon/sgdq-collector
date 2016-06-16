// Grabs Twitch / Donation data every minute
// Pushes this data both to a MongoDB server and to Firebase

"use strict"
var irc = require('tmi.js');
const scrapeIt = require("scrape-it");
var scheduler = require('node-schedule');
var time_utils = require('./utils/time_utils.js')
var firebase_utils = require('./utils/firebase_utils.js')

var exports = module.exports;

var client = irc.client();
var CHANNEL = "Twitch"
exports.DONATION_URL = "https://gamesdonequick.com/tracker/index/sgdq2015"

exports.getTwitchViewers = function(cb) {
  client.api({
    url: "https://api.twitch.tv/kraken/streams/" + CHANNEL
  }, function(err, res, body) {
    body = JSON.parse(body);
    if(body && body['stream'] && "viewers" in body['stream']){
        cb(body['stream']['viewers']);
    }
    else{
        console.log("Couldn't get viewers.")
        cb(-1); 
    }
  });
}

exports.getCurrentDonations = function(cb) {
  scrapeIt(exports.DONATION_URL, {
    donation_string: "small"
  }).then(function(results) {
    var res_arr   = results['donation_string'].split('\n');
    var total_str = res_arr[1];
    var avg_str   = res_arr[3];

    var total_donations = total_str.split('(')[0].substring(1).replace(/,/g,"");
    var num_donators    = /\(.+\)/.exec(total_str)[0].slice(1, -1);

    var max_donation = avg_str.split('/')[0].substring(1).replace(/,/g,"");
    var avg_donation = avg_str.split('/')[1].substring(1).replace(/,/g,"");

    cb({
      total:    parseFloat(total_donations),
      donators: parseInt(num_donators), 
      max:      parseFloat(max_donation),
      avg:      parseFloat(avg_donation)
    });
  });
}

//// Firebase
var db = firebase_utils.database;
// Data maintained over time
var data = db.ref("/data");
// Data most current
var stats = db.ref("/stats")
// List of Games
var games = db.ref("/games")

var time;

// Run every 1 minute
var currSeconds = new Date().getSeconds();
console.log("*SGDQ Collector started")
scheduler.scheduleJob(currSeconds + " * * * * *", function(){
  var timestamp = time_utils.getTimeStamp();
  // Update twitch viewer numbers
  exports.getTwitchViewers(function(viewers){
    console.log((new Date(timestamp)).toString() + " - Viewers: " + viewers);
    data.child(timestamp).child('v').set(viewers);
  });

  // Update donation numbers
  exports.getCurrentDonations(function(don_obj){
    // Send data to firebase
    data.child(timestamp).child('m').set(don_obj.total);
    data.child(timestamp).child('d').set(don_obj.donators);
    stats.child("total_donations").set(don_obj.total);
    stats.child("num_donators").set(don_obj.donators);
    stats.child("max_donation").set(don_obj.max);
    stats.child("avg_donation").set(don_obj.avg);
    console.log((new Date(timestamp)).toString() + " - Donations: " + don_obj.total + " Donators: " + don_obj.donators);
  });

  // Update games played
  games.once('value', function(values){
    var dict = values.val();
    var games_played = 0;
    for(var key in dict){
      if (dict[key].start_time < (new Date()).getTime()){
        games_played += 1;
        console.log((new Date(timestamp)).toString() + " - Games played increased: " + games_played);
      }
    }
    stats.child("games_played").set(games_played);
  });
});