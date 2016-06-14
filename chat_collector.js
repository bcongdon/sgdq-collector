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
var extras = db.ref("/extras");

function chatCollect() {
  var timestamp = time_utils.getTimeStamp();
  console.log((new Date(timestamp)).toString() + " - Chats: " + chats.length + " Emotes: " + numEmotes);
  extras.child(timestamp).child('c').set(numEmotes);
  extras.child(timestamp).child('e').set(chats.length);
  chats = [];
  numEmotes = 0;
}

console.log("*Chat collector started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  chatCollect();
});