var irc = require('tmi.js');
var client = irc.client();

var exports = module.exports;

var channel = "#ESL_DOTA2";

exports.channel = function(){
  getChannel();
  return channel;
}

function getChannel() {
  client.api({
      url: "https://api.twitch.tv/kraken/streams/featured",
  }, function(err, res, body) {
      channel = JSON.parse(body)['featured'][0]['stream']['channel']['display_name'];
  });
}

getChannel();