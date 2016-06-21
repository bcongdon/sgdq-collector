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
var dateutils = require('../utils/time_utils.js')

var backup_directory = "~/sgdq-backup/"

backup_directory = expandHomeDir(backup_directory)
mkdirp(backup_directory, function(err) { 
  if(err) console.log(err)
  else console.log("Created backup directory")
});

function doBackup(cb) {
  ref.once("value", function(data){
    var timestamp = dateutils.getTimeStamp();
    fs.writeFile(backup_directory + (new Date(timestamp)).toString() + '.json', JSON.stringify(data.val()), function(err) {
      if(err) console.log(err);
    });
    cb(data.val());
  });
}

function healthCheck(data_in){
  var data = data_in.data;
  var extras = data_in.extras;
  var entry, zeros = {};
}

// console.log("*Backup started.")
// schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  var timestamp = dateutils.getTimeStamp();
  console.log((new Date(timestamp)).toString() + " - Creating backup");
  doBackup(healthCheck);
// }