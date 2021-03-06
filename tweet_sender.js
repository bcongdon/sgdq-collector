"use strict";
var Twitter = require('twitter');
var t_creds = require("./twitter_credentials.json");
var client = new Twitter(t_creds);
var firebase_utils = require('./utils/firebase_utils.js');
var merge = require('merge');
var shuffle = require('shuffle-array');
var schedule = require('node-schedule');
var time_utils = require('./utils/time_utils.js');
var numeral = require('numeral');

var db = firebase_utils.database;
var client = new Twitter(t_creds);

function format(num){
  return numeral(parseFloat(num)).format('0,0')
}

function viewerSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var max = undefined;
    for(var i in keys) if(!max || data[keys[i]].v > max.v) max = data[keys[i]];
    max.v = format(max.v);
    var strings = [
      "Highest number of viewers in last hour: " + max.v + " #SGDQ2016🎮",
      "Lots of people tuning in to #SGDQ2016🎮. " + max.v + " in the past hour, to be precise!",
      "#SGDQ2016🎮 has a crew of " + max.v + " viewers watching some awesome runners destroy our favorite games.",
      "Enjoying all the runs? Well, you have " + max.v  + " other #SGDQ2016🎮 enthusiests watching along!"
    ];
    cb(shuffle.pick(strings));
  });
}

function donatorSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var donators = data[keys[keys.length - 1]].d - data[keys[0]].d;
    donators = format(donators);
    var strings = [
      "There were " + donators + " donations in the last hour! #SGDQ2016🎮",
      "Lots of charitable gamers: " + donators + " donations made in the last hour! #SGDQ2016🎮",
      donators + " donations made in the last hour. Destroying games and raising money for #charity. #SGDQ2016🎮",
      "#SGDQ2016🎮: Come for the cause, stay for the games. The " + donators + " people that donated in the last hour agree."
    ]
    cb(shuffle.pick(strings));
  });
}

function donationSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var donations = data[keys[keys.length - 1]].m - data[keys[0]].m
    donations = format(donations)
    var strings = [
      "$" + donations + " was donated to @MSF_USA in the last hour! #SGDQ2016🎮",
      "Lots of charitable gamers: $" + donations + " donated in the last hour! #SGDQ2016🎮",
      "Keep donating! $" + donations + " donated to #charity the last hour! #SGDQ2016🎮",
      "Whether or not you vote to save the animals, it's amazing that $" + donations + " was donated at #SGDQ2016🎮 in the last hour!"
    ];
    cb(shuffle.pick(strings));
  });
}

function tweetSummary(cb) {
  getData(function(data){
    var keys = Object.keys(data).sort().slice(-60)
    var tweets = 0;
    keys.map(function(d) { tweets += data[d].t; });
    tweets = format(tweets);
    var strings = [
      tweets + " tweets were sent about #SGDQ2016🎮 in the last hour!",
      "Lots of tweets flying around about #SGDQ2016🎮! " + tweets + " were sent in the last hour.",
      "#SGDQ2016🎮 got " + tweets + " mentions on twitter in the last hour. Guess we're pretty popular!"
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
    emotes = format(emotes);
    chats = format(chats)
    var strings = [
      chats + " chats and " + emotes + " emotes were sent in the #SGDQ2016🎮 @twitch chat in the last hour!",
      "The #SGDQ2016🎮 @twitch chat sent " + emotes + " emotes in the past hour. Kappa.",
      "The #SGDQ2016🎮 @twitch chat sent " + chats + " chats in the past hour. Great games to talk about!",
      chats + " chats sent on @twitch in #SGDQ2016🎮 in the last hour. What a chatty bunch of speedrun enthusiests..."
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
  { func: viewerSummary, minute: 0, hour: 1 },
  { func: donatorSummary, minute: 12, hour: 2 },
  { func: donationSummary, minute: 24, hour: 1 },
  { func: tweetSummary, minute: 36, hour: 3 },
  { func: chatSummary, minute: 48, hour: 1 },
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

// if (require.main === module) {
//   timeFuncMap.forEach(function(d){
//     d.func(console.log)
//   }); 
// }
// else{
  console.log("*[Tweet Sender] Started.")
  schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
    onSchedule();
  });
// }