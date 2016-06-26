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

function doUpload(cb) {
  ref.once("value", function(data){
    data = data.val();
    var timestamp = dateutils.getTimeStamp();
    var timestamp_str = (new Date(timestamp)).toString();
    var file = bucket.file(timestamp_str + '.json');
    var latest = bucket.file('latest.json');
    var options = { 
      metadata: { contentType: 'application/json'},
      public: true
    };

    file.save(JSON.stringify(data), options, function(err){
      if(err) console.log(err);
      else{
        console.log("[Storage Link] Upload successful.")
        latest.delete(function(err){
          if(err) console.log(err);
          else{
            console.log("[Storage Link] Deletion successful.")
            file.copy('latest.json', function(err){
              if(err) console.log(err);
              else console.log("[Storage Link] Copy successful.")
            });
          }
        });
      }
    });
    // Callback for health check
    if(cb) cb(data);
  });
}

// console.log("*Backup started.")
// schedule.scheduleJob({second: (new Date()).getSeconds()}, function(){
  var timestamp = dateutils.getTimeStamp();
  console.log((new Date(timestamp)).toString() + " - Creating backup");
  doUpload(health_check.check);
// }