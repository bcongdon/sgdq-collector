var irc = require('tmi.js');
var client = irc.client();

var exports = module.exports;

var channel = "gamesdonequick";

exports.channel = function(){
  // getChannel();
  return channel;
}

function getChannel(cb) {
  client.api({
      url: "https://api.twitch.tv/kraken/streams",
  }, function(err, res, body) {
      channel = JSON.parse(body).streams[0].channel.display_name;
      console.log("Channel: " + channel)
      if(cb) cb(channel);
  });
}

getChannel();

if (require.main === module) {
  getChannel(function(e){
    console.log(e);
  });
}