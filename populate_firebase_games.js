// Pushes contents of data_file.json up to Firebase
// Purpose of this is to have scraped schedule available in the data
var PythonShell = require('python-shell');
var pyshell = new PythonShell('misc/time_scraper.py');

pyshell.on('message', function(d){
  sendGames(JSON.parse(d));
  console.log('Received games.')
})

var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});
var moment = require('moment')

var db = firebase.database();
var games_ref = db.ref("/games");

function sendGames(games) {
  games = games || require('./data_file.json')
  var payload = {}
  total_payload = {}

  games.forEach(function(item){
    payload = {
      runner: item.runner,
      start_time: (new Date(item.start_time)).getTime(),
          // start_time: moment(item.start_time).subtract(15, 'days').valueOf(),
          duration: item.duration,
          title: item.title
        }
      // console.log(payload.start_time)
      total_payload[payload.start_time] = payload
    });
  console.log("Sending " + Object.keys(total_payload).length + " games.")
  games_ref.set(total_payload, function(err){
    if(err) console.log(err);
    else console.log("Set successfully");
    process.exit();
  });
}
