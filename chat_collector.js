"use strict"
var irc = require('tmi.js');
var schedule = require('node-schedule');
var time_utils = require('./utils/time_utils.js');
var firebase_utils = require('./utils/firebase_utils.js');
var request = require('request');
var channel = require('./utils/channel.js');
var includes = require('array-includes');

// Initialize IRC client
var client = irc.client({
  channels: [channel.channel()],
  reconnect: true
});
client.connect();

var emoteList = [];
request('https://api.twitch.tv/kraken/chat/emoticon_images', (err, res, body)=>{
  console.log("*Downloaded emote definitions")
  emoteList = JSON.parse(body)['emoticons'].map(x=>{return x.code});
});

var chats = [];
var numEmotes = 0;
client.on("chat", function (channel, user, message, self) {
  chats.push(message);
  numEmotes += message.split(" ").filter(function(x){return includes(emoteList, x)}).length;
});

var db = firebase_utils.database;
var extras = db.ref("extras");
var stats = db.ref("stats");

// Download initial totals
var totalChats  = 0;
var totalEmotes = 0;
extras.once('value', function(data){
  var extrasList = data.val();
  if(extrasList){
    for(var i in extrasList){
      totalChats  += extrasList[i]['c'] || 0;
      totalEmotes += extrasList[i]['e'] || 0;
    }
  }
  else{
    totalChats = 0;
    totalEmotes = 0;
  }
  console.log("*Starting with - " + totalChats + " chats, " + totalEmotes + " emotes")
});

function chatCollect() {
  var timestamp = time_utils.getTimeStamp();
  // Update totals
  totalChats += chats.length;
  totalEmotes += numEmotes;
  console.log((new Date(timestamp)).toString() + " - Chats: " + chats.length + " (" + totalChats + ") Emotes: " + numEmotes
    + " (" + totalEmotes + ")");

  // Set extras data
  extras.child(timestamp).child('e').set(numEmotes);
  extras.child(timestamp).child('c').set(chats.length);
  // Set stats data
  stats.child("total_chats").set(totalChats);
  stats.child("total_emotes").set(totalEmotes);
  // Reset minutely counters
  chats = [];
  numEmotes = 0;

  var chan = channel.channel()
  if(!includes(client.getChannels(), chan)) {
    client.part(client.getChannels()[0])
    client.join(chan);
  }
}

console.log("*Chat collector started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  chatCollect();
});