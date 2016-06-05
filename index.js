"use strict"
var irc = require('tmi.js');
const scrapeIt = require("scrape-it");
var scheduler = require('node-schedule');
var firebase = require('firebase');
var MongoClient = require('mongodb').MongoClient;

firebase.initializeApp({
  serviceAccount: "credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});

var exports = module.exports;

var client = irc.client();
var CHANNEL = "GosuGamers"
exports.DONATION_URL = "https://gamesdonequick.com/tracker/index/sgdq2014"

exports.getTwitchViewers = function(cb) {
    client.api({
        url: "https://api.twitch.tv/kraken/streams/" + CHANNEL
    }, function(err, res, body) {
        body = JSON.parse(body);
        if(body && 'stream' in body && "viewers" in body['stream']){
            cb(body['stream']['viewers'])
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

        var total_donations = total_str.split('(')[0].substring(1).replace(",","");
        var num_donators    = /\(.+\)/.exec(total_str)[0].slice(1, -1);

        var max_donation = avg_str.split('/')[0].substring(1).replace(",","");
        var avg_donation = avg_str.split('/')[1].substring(1).replace(",","");

        cb({
            total:    parseFloat(total_donations),
            donators: parseInt(num_donators), 
            max:      parseFloat(max_donation),
            avg:      parseFloat(avg_donation)
        });
    });
}

//// Firebase
var db = firebase.database();
// Data maintained over time
var data = db.ref("/data");
// Data most current
var stats = db.ref("/stats")

//// MongoDB
var url = 'mongodb://localhost:27017/sgdq2016'
function insertDocument(data) {
    MongoClient.connect(url, function(err, db) {
        db.collection('data').insertOne(data);
        db.close();
    });
}

var time;

// Run every 1 minute
var currSeconds = new Date().getSeconds();
scheduler.scheduleJob(currSeconds + " * * * * *", function(){
    time = new Date();
    console.log("Running scheduled check at " + time.toString("yyyy-MM-dd HH:mm:ss"));
    exports.getTwitchViewers(function(viewers){
        data.child(time.getTime()).child('v').set(viewers);

        exports.getCurrentDonations(function(obj){
            data.child(time.getTime()).child('m').set(obj.total);
            data.child(time.getTime()).child('d').set(obj.donators);

            stats.child("total_donations").set(obj.total);
            stats.child("num_donators").set(obj.donators);
            stats.child("max_donation").set(obj.max);
            stats.child("avg_donation").set(obj.avg);

            insertDocument({
                date:         time.getTime(),
                donations:    obj.total,
                avg_donation: obj.avg,
                max_donation: obj.max,
                donators:     obj.donators
            })
        });
    });
});