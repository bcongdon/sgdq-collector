var irc = require('tmi.js');
var schedule = require('node-schedule');
var time_utils = require('./utils/time_utils.js');
var firebase_utils = require('./utils/firebase_utils.js');
var request = require('request');

// Initialize IRC client
var client = irc.client({
  channels: ["#MLG", "#IGN", "#Twitch"],
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
  numEmotes += message.split(" ").filter(function(x){return emoteList.includes(x)}).length;
});

var db = firebase_utils.database;
var extras = db.ref("extras");
var stats = db.ref("stats");

// Download initial totals
var totalChats  = 0;
var totalEmotes = 0;
stats.once('value', function(data){
  var stats = data.val();
  totalChats = stats['total_chats'] || 0;
  totalEmotes = stats['total_emotes'] || 0;
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
  extras.child(timestamp).child('c').set(numEmotes);
  extras.child(timestamp).child('e').set(chats.length);
  // Set stats data
  stats.child("total_chats").set(totalChats);
  stats.child("total_emotes").set(totalEmotes);
  // Reset minutely counters
  chats = [];
  numEmotes = 0;
}

console.log("*Chat collector started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  chatCollect();
});