"use strict";

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

var firebase = require('firebase');
firebase.initializeApp({
  serviceAccount: "../credentials.json",
  databaseURL: "https://sgdq-backend.firebaseio.com"
});
var data_ref = firebase.database().ref("data");

var start = new Date("9:30:00 July 3, 2016")
var end   = new Date("21:18:00 July 9, 2016")
var payload = {}
var i = 0, v = 10000;
while(start < end) {
    start.setMinutes(start.getMinutes() + 1)
    // console.log(start)
    i = i + randomIntInc(0, 1000)
    v = v + randomIntInc(-100, 100);
    payload[start.getTime()] = {
        m: i,
        d: 2,
        v: v,
    }
}

data_ref.set(payload).then(function(){
    process.exit();
})