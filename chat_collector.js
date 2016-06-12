var irc = require('tmi.js');
var schedule = require('node-schedule');
var gcloud = require('gcloud');
var time_utils = require('./utils/time_utils.js')
var datastore = gcloud.datastore({
  projectId: 'sgdq-backend',
  keyFilename: 'credentials.json'
});

// Initialize IRC client
var client = irc.client({
  channels: ["#ESL_CSGO"],
  reconnect: true
});
client.connect();

var chats = [];
client.on("chat", function (channel, user, message, self) {
  chats.push(message);
});

schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  datastore.save({
    key: datastore.key("ChatLog"),
    data: {
      numMessages: chats.length,
      chats: chats,
      timestamp: time_utils.getTimeStamp()
    }
  },function(err){if(err) throw err});
  console.log("Chats at " + (new Date(time_utils.getTimeStamp())).toString() + ": " + chats.length)
  chats = [];
});