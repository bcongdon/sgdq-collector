var prompt = require('prompt')
var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "./../credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});

prompt.start();

prompt.get(['I_am_sure', 'really_I_am', 'games_too'], function (err, result) {
  if(result.I_am_sure == "I am sure" & result.really_I_am == "really I am") {
    var data_ref = firebase.database().ref("data");
    var extras_ref = firebase.database().ref("extras");
    var games_ref = firebase.database().ref("games");
    data_ref.set({}).then(function() {
      extras_ref.set({}).then(function() {
        console.log("nuked data and extras");
        if(result.games_too == "yes") {
          games_ref.set({}).then(function(){
            process.exit()
          })
        } else{
          process.exit()
        }
      });
    });
  }
});