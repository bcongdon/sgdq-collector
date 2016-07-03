var Twitter = require('twitter');
var t_creds = require("./twitter_credentials.json");
var client = new Twitter(t_creds);
var firebase_utils = require('./utils/firebase_utils.js');
var merge = require('merge');

var db = firebase_utils.database;

function viewerSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var max = undefined;
    for(var i in keys) if(!max || data[keys[i]].v > max.v) max = data[keys[i]];
    cb("Highest number of viewers in last hour: " + max.v + " #SGDQ2016🎮");
  });
}

function donatorSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var donators = data[keys[keys.length - 1]].d - data[keys[0]].d
    cb("There were " + parseInt(donators) + " donations in the last hour! #SGDQ2016🎮");
  });
}

function donationSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var donations = data[keys[keys.length - 1]].m - data[keys[0]].m
    cb("$" + parseInt(donations) + " was donated to @MSF_USA in the last hour! #SGDQ2016🎮");
  });
}

function tweetSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var tweets = data[keys[keys.length - 1]].t - data[keys[0]].t
    cb(parseInt(tweets) + " tweets were sent about #SGDQ2016🎮 in the last hour!");
  });
}

function chatSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var chats = 0,
        emotes = 0;
    keys.map(function(d) { chats += data[d].c; emotes += data[d].e; });
    cb(chats + " chats and " + emotes + " emotes were sent in the #SGDQ2016🎮 @twitch chat in the last hour!");
  });
}

function getData(cb){
  db.ref().once('value', function(data){
    data = data.val();
    cb(merge.recursive(data.data, data.extras));
  });
}

viewerSummary(console.log);
donatorSummary(console.log);
donationSummary(console.log);
tweetSummary(console.log);
chatSummary(console.log);