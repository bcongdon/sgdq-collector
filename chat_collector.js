var irc = require('tmi.js');
var schedule = require('node-schedule');
var time_utils = require('./utils/time_utils.js')
var gcloud = require('gcloud');
var datastore = gcloud.datastore({
  projectId: 'sgdq-backend',
  keyFilename: 'credentials.json'
});

// Initialize IRC client
var client = irc.client({
  channels: ["#MLG", "#IGN"],
  reconnect: true
});
client.connect();

var chats = [];
client.on("chat", function (channel, user, message, self) {
  chats.push(message);
});

function chatCollect() {
  var timestamp = time_utils.getTimeStamp();
  datastore.save({
    key: datastore.key(["ChatLog", timestamp]),
    data: {
      numMessages: chats.length,
      chats: chats,
      timestamp: (new Date(timestamp))
    }
  },function(err){if(err) throw err});
  console.log("Chats at " + (new Date(timestamp)).toString() + ": " + chats.length)
  chats = [];
}

schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  chatCollect();
});