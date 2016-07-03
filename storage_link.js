"use strict"
var schedule = require('node-schedule');
var dateutils = require('./utils/time_utils.js');
var health_check = require('./health_check.js');
var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});
var ref = firebase.database().ref();
var gcloud = require('gcloud')({
  projectId: 'sgdq-backend',
  keyFilename: './credentials.json'
});

var bucket = gcloud.storage().bucket('sgdq-backend.appspot.com');

function doUpload(data) {
  var timestamp = dateutils.getTimeStamp();
  var timestamp_str = (new Date(timestamp)).toString();
  var file = bucket.file(timestamp_str + '.json');
  var latest = bucket.file('latest.json');
  
  var options = { 
    metadata: { contentType: 'application/json'},
    // Should be public
    public: true
  };

  // Save new file to bucket
  file.save(JSON.stringify(data), options, function(err){
    if(err) console.log(err);
    else{
      console.log("[Storage Link] Upload successful.")
      // Delete old 'latest.json'
      latest.delete(function(err){
        if(err) console.log(err);
        else{
          console.log("[Storage Link] Deletion successful.")
          // Copy new upload to 'latest.json'
          file.copy('latest.json', function(err, copiedFile){
            if(err) console.log(err);
            else {
              copiedFile.makePublic();
              console.log("[Storage Link] Copy successful.")
            }
            // Only keep every 10th backup to prevent insanity
            if((new Date(timestamp)).getMinutes() % 10 != 0) {
              file.delete(function(err) { if(err) console.log(err); });
            }
          });
        }
      });
    }
  });
}

function onSchedule() {
  var timestamp = dateutils.getTimeStamp();
  console.log((new Date(timestamp)).toString() + " - Creating backup");
  ref.once("value", function(data){
    data = data.val();
    // Do file upload and then health check
    doUpload(data);
    health_check.check(data);
  });
}

console.log("*[Storage Link] Started.")
schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  onSchedule();
});

if (require.main === module) {
  onSchedule();
}