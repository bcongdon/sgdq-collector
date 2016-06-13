var Twitter = require('twitter');
var schedule = require('node-schedule');
var t_creds = require("./twitter_credentials.json")

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

function collectTweets(){
  console.log(num_tweets);
  num_tweets = 0;
}

schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  collectTweets();
});