var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});
var schedule = require('node-schedule');
var mkdirp = require('mkdirp');
var expandHomeDir = require('expand-home-dir');
var ref = firebase.database().ref();
var fs = require('fs');
var dateutils = require('./utils/time_utils.js');
var path = require('path');
var health_check = require('./health_check.js')

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



// console.log("*Backup started.")
// schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  var timestamp = dateutils.getTimeStamp();
  console.log((new Date(timestamp)).toString() + " - Creating backup");
  doBackup(health_check.check);
// }