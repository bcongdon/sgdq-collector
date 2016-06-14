var Twitter = require('twitter');
var schedule = require('node-schedule');
var t_creds = require("./twitter_credentials.json");
var firebase_utils = require('./utils/firebase_utils.js');
var time_utils = require('./utils/time_utils.js');

var client = new Twitter(t_creds);

var num_tweets = 0;
var stream = client.stream('statuses/filter', {track: 'sgdq, summergamesdonequick, sgdq2016, #sgdq2016, pizza'});
stream.on('data', function(tweet) {
  num_tweets += 1;
});
 
stream.on('error', function(err) {
  console.log("ERROR: " + err);
  throw err;
});

var db = firebase_utils.database;
var extras = db.ref("/extras");

function collectTweets(){
  var timestamp = time_utils.getTimeStamp();
  console.log((new Date(timestamp)).toString() + " - Tweets: " + num_tweets);
  extras.child(timestamp).child("t").set(num_tweets)
  num_tweets = 0;
}

console.log("*Tweet collector started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  collectTweets();
});