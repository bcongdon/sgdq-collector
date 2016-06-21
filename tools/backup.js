var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "../credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});
var schedule = require('node-schedule');
var mkdirp = require('mkdirp');
var expandHomeDir = require('expand-home-dir');
var ref = firebase.database().ref();
var fs = require('fs');
var dateutils = require('../utils/time_utils.js');
var path = require('path');

var backup_directory = "~/sgdq-backup/"

backup_directory = expandHomeDir(backup_directory)
mkdirp(backup_directory, function(err) { 
  if(err) console.log(err)
  else console.log("Created backup directory")
});

function doBackup(cb) {
  ref.orderByKey().once("value", function(data){
    var timestamp = dateutils.getTimeStamp();
    fs.writeFile(backup_directory + (new Date(timestamp)).toString() + '.json', JSON.stringify(data.val()), function(err) {
      if(err) console.log(err);
      // Delete old logs
      fs.readdir(backup_directory, function(err, files){
        files.sort(function(a, b) {
               return fs.statSync(backup_directory + b).mtime.getTime() - 
                      fs.statSync(backup_directory + a).mtime.getTime();
        });
        // Delete all but the 60 most recent files
        files = files.filter(function(a) { return path.extname(a) == '.json'}).slice(60);
        files.forEach(function(d) { fs.unlink(backup_directory + d); console.log("Deleting: " + d) });
      });
    });
    if(cb) cb(data.val());
  });
}

function healthCheck(data_in){
  var data = [],
      extras = [],
      zeros = {'donators': 0,
               'donations': 0,
               'viewers': 0,
               'tweets': 0,
               'emotes': 0,
               'chats': 0};
  for(var key in data_in.data)   data.push(data_in.data[key]);
  for(var key in data_in.extras) extras.push(data_in.extras[key]);
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
  for(var key in zeros) if(zeros[key] >= 3) alarms.push("No data from " + key + " in " + zeros[key] + " minutes!")
  console.log(alarms);
}

// console.log("*Backup started.")
// schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  var timestamp = dateutils.getTimeStamp();
  console.log((new Date(timestamp)).toString() + " - Creating backup");
  doBackup(healthCheck);
// }