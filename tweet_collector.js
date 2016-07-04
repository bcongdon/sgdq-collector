var Twitter = require('twitter');
var schedule = require('node-schedule');
var t_creds = require("./twitter_credentials.json");
var firebase_utils = require('./utils/firebase_utils.js');
var time_utils = require('./utils/time_utils.js');
var sentiment = require('sentiment');
var shuffle = require('shuffle-array');

var client = new Twitter(t_creds);
var likeLimit = false,
    followLimit = false;

function interactWith(tweet){
  // Don't interact with negative tweets
  if(sentiment(tweet.text) < 0) return;
  var func = shuffle.pick([like, follow]);
  func(tweet);
}

function like(tweet) {
  if(likeLimit) return;
  var timestamp = time_utils.getTimeStamp();
  client.post('favorites/create', {id: tweet.id_str}, (err, data, res)=>{
    if(err) { likeLimit = true; console.log("[Tweet Sender] Imposing rate limit on likes"); }
    if(!err) console.log((new Date(timestamp)).toString() + " Liked tweet: " + tweet.id);
    // else { console.log(err); }
  });
}

function follow(tweet) {
  if(followLimit) return;
  var timestamp = time_utils.getTimeStamp();
  client.post('friendships/create', {user_id: tweet.user.id}, (err, data, res)=>{
    if(err) { followLimit = true; console.log("[Tweet Sender] Imposing rate limit on follows"); }
    if(!err) console.log((new Date(timestamp)).toString() + " Followed user: " + tweet.user.id);
    // else { console.log(err); }
  });
}

var num_tweets = 0;
var zero_minutes = 0;

var stream;
function setupStream(){
  if(stream) {
    console.log("*Restarting twitter stream.")
    stream.destroy()
  }
  stream = client.stream('statuses/filter', {track: 'sgdq, summergamesdonequick, sgdq2016, #sgdq2016'});
  stream.on('data', function(tweet) {
    interactWith(tweet);
    num_tweets += 1;
  });
   
  stream.on('error', function(err) {
    console.log("ERROR: " + err);
    throw err;
  });
}

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

  if(num_tweets == 0) zero_minutes += 1;
  if(zero_minutes > 5) setupStream();
  num_tweets = 0;
}

setupStream();
console.log("*Tweet collector started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  collectTweets();
});

// Restart twitter stream & client every hour
schedule.scheduleJob({minute: 0}, function() {
  client = new Twitter(t_creds);
  setupStream();
});

// Reset rate limiting
schedule.scheduleJob({minute: [0, 20, 40]}, function() {
  likeLimit = false;
  followLimit = false;
  console.log('[Tweet Sender] Reset internal rate limit')
});