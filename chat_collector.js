var irc = require('tmi.js');
var schedule = require('node-schedule');
var time_utils = require('./utils/time_utils.js')
var gcloud = require('gcloud');
var request = require('request')
var datastore = gcloud.datastore({
  projectId: 'sgdq-backend',
  keyFilename: 'credentials.json'
});

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


function chatCollect() {
  console.log((new Date()).toString() + " - Chats: " + chats.length + " Emotes: " + numEmotes);
  chats = [];
  numEmotes = 0;
}

console.log("*Chat collector started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  chatCollect();
});