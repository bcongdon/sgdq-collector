var twilioCreds = require('./twilio_creds.json');
var twilio = require('twilio');
var client = new twilio.RestClient(twilioCreds.accountSid, twilioCreds.authToken);
var includes = require('array-includes');

var exports = module.exports;
var start_time = (new Date()).getTime();

exports.check = function(data_in){
  var data = [],
      extras = [],
      zeros = {'donators': 0,
               'donations': 0,
               'viewers': 0,
               'tweets': 0,
               'emotes': 0,
               'chats': 0};
  for(var key in data_in.data)   if(key > start_time) data.push(data_in.data[key]);
  for(var key in data_in.extras) if(key > start_time) extras.push(data_in.extras[key]);
  data = data.reverse();
  extras = extras.reverse()
  for(var i = 0; i < 5 && i < data.length && i < extras.length; i++){
    if(data[i].d <= 0) zeros['donators'] += 1;
    if(data[i].m <= 0) zeros['donations'] += 1;
    if(data[i].v <= 0) zeros['viewers'] += 1;
    if(extras[i].t <= 0) zeros['tweets'] += 1;
    if(extras[i].e <= 0) zeros['emotes'] += 1;
    if(extras[i].c <= 0) zeros['chats'] += 1;
  }
  var alarms = []
  for(var key in zeros) if(zeros[key] >= 3) alarms.push([key, "No data from *" + key + "* in " + zeros[key] + " minutes!"]);
  if(alarms.length > 0) exports.sendAlarms(alarms);
}

var triggered = []

exports.sendAlarms = function(alarms) {
  alarms = alarms.filter(function(d) { return !includes(triggered, d[0]) });
  if(alarms.length == 0) return;
  var message = alarms.map(function(d) { return d[1]; }).join("\n");
  client.messages.create({
      body: message,
      to: twilioCreds.alertNumber,
      from: twilioCreds.twilioNumber
  }, function(err, message) {
      if(err) {
        console.log(err);
        return;
      }
      alarms.forEach(function(d) { 
        console.log("Alarm triggered on: " + d[0]);
        triggered.push(d[0]);
      });
  });
}