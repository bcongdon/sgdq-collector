"use strict";
var Twitter = require('twitter');
var t_creds = require("./twitter_credentials.json");
var client = new Twitter(t_creds);
var firebase_utils = require('./utils/firebase_utils.js');
var merge = require('merge');
var shuffle = require('shuffle-array');
var schedule = require('node-schedule');
var time_utils = require('./utils/time_utils.js');

var db = firebase_utils.database;
var client = new Twitter(t_creds);

function viewerSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var max = undefined;
    for(var i in keys) if(!max || data[keys[i]].v > max.v) max = data[keys[i]];
    var strings = [
      "Highest number of viewers in last hour: " + max.v + " #SGDQ2016🎮",
      "Lots of people tuning in to #SGDQ2016🎮. " + max.v + " in the past hour, to be precise!",
      "#SGDQ2016🎮 has a crew of " + max.v + " viewers watching some awesome runners destroy our favorite games."
    ];
    cb(shuffle.pick(strings));
  });
}

function donatorSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var donators = data[keys[keys.length - 1]].d - data[keys[0]].d;
    var strings = [
      "There were " + parseInt(donators) + " donations in the last hour! #SGDQ2016🎮",
      "Lots of charitable gamers: " + parseInt(donators) + " donations made in the last hour! #SGDQ2016🎮",
      parseInt(donators) + " donations made in the last hour. Destroying games and raising money for #charity. #SGDQ2016🎮"
    ]
    cb(shuffle.pick(strings));
  });
}

function donationSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var donations = data[keys[keys.length - 1]].m - data[keys[0]].m
    var strings = [
      "$" + parseInt(donations) + " was donated to @MSF_USA in the last hour! #SGDQ2016🎮",
      "Lots of charitable gamers: $" + parseInt(donations) + " donated in the last hour! #SGDQ2016🎮",
      "Keep donating! $" + parseInt(donations) + " donated to #charity the last hour! #SGDQ2016🎮",
    ];
    cb(shuffle.pick(strings));
  });
}

function tweetSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var tweets = data[keys[keys.length - 1]].t - data[keys[0]].t
    var strings = [
      tweets + " tweets were sent about #SGDQ2016🎮 in the last hour!",
      "Lots of tweets flying around about #SGDQ2016🎮! " + tweets + " were sent in the last hour."
    ]
    cb(shuffle.pick(strings));
  });
}

function chatSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var chats = 0,
        emotes = 0;
    keys.map(function(d) { chats += data[d].c; emotes += data[d].e; });
    var strings = [
      chats + " chats and " + emotes + " emotes were sent in the #SGDQ2016🎮 @twitch chat in the last hour!",
      "The #SGDQ2016🎮 @twitch chat sent " + emotes + " emotes in the past hour. Kappa.",
      "The #SGDQ2016🎮 @twitch chat sent " + chats + " chats in the past hour. Great games to talk about!"
    ]
    cb(shuffle.pick(strings));
  });
}

function getData(cb){
  db.ref().once('value', function(data){
    data = data.val();
    cb(merge.recursive(data.data, data.extras));
  });
}

function sendTweet(status) {
  client.post('statuses/update', {status: status}, function(error, tweet, response) {
    if (error) { console.log(error); }
    else { console.log("[Tweet Sender] Sent tweet: '" + status + "'")}
  });
}

var timeFuncMap = [ 
  { func: viewerSummary, minute: 5, hour: 1 },
  { func: donatorSummary, minute: 12, hour: 2 },
  { func: donationSummary, minute: 24, hour: 1 },
  { func: tweetSummary, minute: 36, hour: 1 },
  { func: chatSummary, minute: 48, hour: 2 },
]

function onSchedule() {
  var minute = (new Date(time_utils.getTimeStamp())).getMinutes(), 
      hour = (new Date(time_utils.getTimeStamp())).getHours()
  timeFuncMap.forEach(function(d) {
    if(minute == d.minute && hour % d.hour == 0){
      d.func(sendTweet)
    }
  });
}

onSchedule();

console.log("*[Tweet Sender] Started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  onSchedule();
});
