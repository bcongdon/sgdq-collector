var irc = require('tmi.js');
var client = irc.client();

var exports = module.exports;

var channel = "NALCS1";

exports.channel = function(){
  getChannel();
  return channel;
}

function getChannel(cb) {
  client.api({
      url: "https://api.twitch.tv/kraken/streams/featured",
  }, function(err, res, body) {
      channel = JSON.parse(body)['featured'][0]['stream']['channel']['display_name'];
      if(cb) cb(channel);
  });
}

getChannel();

if (require.main === module) {
  getChannel(function(e){
    console.log(e);
  });
}