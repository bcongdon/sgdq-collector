var Twitter = require('twitter');
var schedule = require('node-schedule');
var t_creds = require("./twitter_credentials.json");
var firebase_utils = require('./utils/firebase_utils.js');
var time_utils = require('./utils/time_utils.js');

var client = new Twitter(t_creds);

function likeTweet(tweet){
  var timestamp = time_utils.getTimeStamp();
  client.post('favorites/create', {id: tweet.id_str}, (err, data, res)=>{
    if(!err) console.log((new Date(timestamp)).toString() + " Liked tweet: " + tweet.id);
  });
}

var num_tweets = 0;
var stream = client.stream('statuses/filter', {track: 'sgdq, summergamesdonequick, sgdq2016, #sgdq2016, pizza'});
stream.on('data', function(tweet) {
  likeTweet(tweet);
  num_tweets += 1;
});
 
stream.on('error', function(err) {
  console.log("ERROR: " + err);
  throw err;
});

var db = firebase_utils.database;
var extras = db.ref("extras");
var stats  = db.ref("stats");

// Load initial total tweets
var totalTweets = 0;
db.ref("/extras").once('value', function(val){
  var extrasList = val.val();
  if(extrasList){
    for(var i in extrasList){
      totalTweets += extrasList[i]['t'] || 0;
    }
  }
  else{
    totalTweets = 0;
  }
  console.log("*Total Tweets starting at: " + totalTweets);
});

function collectTweets(){
  var timestamp = time_utils.getTimeStamp();
  console.log((new Date(timestamp)).toString() + " - Tweets: " + num_tweets);
  extras.child(timestamp).child("t").set(num_tweets);
  totalTweets += num_tweets;
  stats.child("total_tweets").set(totalTweets);

  num_tweets = 0;
}

console.log("*Tweet collector started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  collectTweets();
});