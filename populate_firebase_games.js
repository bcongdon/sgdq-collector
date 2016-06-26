// Pushes contents of data_file.json up to Firebase
// Purpose of this is to have scraped schedule available in the data

var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});
var moment = require('moment')

var db = firebase.database();
var games_ref = db.ref("/games");

var games = require('./data_file.json')
var payload = {}

games.forEach(function(item){
    payload = {
        runner: item.runner,
        start_time: (new Date(item.start_time)).getTime(),
        // start_time: moment(item.start_time).subtract(15, 'days').valueOf(),
        duration: item.duration,
        title: item.title
    }
    // console.log(payload.start_time)
    console.log("Sending '" + item.title + "'");
    games_ref.child(payload.start_time).set(payload, function(err){
        if(err) console.log(err);
    });
});