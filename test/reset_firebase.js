var prompt = require('prompt')
var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "./../credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});

prompt.start();

prompt.get(['I_am_sure', 'really_I_am'], function (err, result) {
  if(result.I_am_sure == "I am sure" & result.really_I_am == "really I am") {
    var data_ref = firebase.database().ref("data");
    var extras_ref = firebase.database().ref("extras");
    data_ref.set({}).then(function() {
      extras_ref.set({}).then(function() {console.log("nuked everything"); process.exit()});
    });
  }
});