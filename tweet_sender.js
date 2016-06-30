var Twitter = require('twitter');
var t_creds = require("./twitter_credentials.json");
var client = new Twitter(t_creds);
var firebase_utils = require('./utils/firebase_utils.js');
var merge = require('merge');

var db = firebase_utils.database;

function viewerSummary(cb) {
  getData(function(data){
    var max = undefined;
    for(var i in data) if(!max || data[i].v > max.v) max = data[i];
    console.log(data)
    cb("Highest number of viewers in last hour: " + max.v + " #SGDQ2016🎮");
  });
}

function getData(cb){
  db.ref().once('value', function(data){
    data = data.val();
    cb(merge.recursive(data.data, data.extras));
  });
}

viewerSummary(console.log);