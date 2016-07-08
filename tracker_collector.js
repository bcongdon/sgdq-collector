"use strict";
var tracker = require("gdq_tracker_scraper");
var schedule = require('node-schedule');

var gcloud = require('gcloud')({
  projectId: 'sgdq-backend',
  keyFilename: './credentials.json'
});

var SUPER_METROID_BID_ID = 4792;

function getChoiceSeries(bid) {
  return new Promise(function(resolve, reject) {
      tracker.getBidDetail(bid).then(function(res){
      console.log("[Tracker Collector] Got first page")
      var promises = []
      res.data.forEach(function(d){
        promises.push(tracker.getBidDetail(d.link.split('/').pop()));
      });
      Promise.all(promises).then(function(values){
        resolve(values)
      })
    });
  });
}

function processChoiceSeries(data) {
  console.log('[Tracker Collector] Parsing choice series')
  var xArrs = data.map(function(d){return d.data.map(function(e){return e.date})})
  var end = xArrs.reduce(function(prev, curr) { return curr[0] < prev ? curr[0] : prev}, Infinity);
  var start   = xArrs.reduce(function(prev, curr) { return curr[curr.length - 1] > prev ? curr[curr.length - 1] : prev }, 0)
  var windowLength = 1000 * 60 * 10 // 10 min windows
  var trueX = []
  for(var i = start; i < end; i+= windowLength) trueX.push(i)
  var values = data.map(function(d){return d.data.map(function(e){return e.amount})})
  var aggregatedValues = [];

  values.forEach(function(series, seriesIdx) {
    var aggregatedSeries = []
    trueX.forEach(function(windowStart, idx){
      aggregatedSeries.push(series.reduce(function(prev, curr, idx){
        if(xArrs[seriesIdx][idx] >= windowStart && xArrs[seriesIdx][idx] < windowStart + windowLength){
          prev += curr;
        }
        return prev; 
      }, 0))
    })
    aggregatedValues.push(aggregatedSeries)
  });
  trueX.unshift('x');
  aggregatedValues.forEach(function(series, idx){
    series.unshift(data[idx].bid)
  })
  var payload = {
    x: trueX,
    ys: aggregatedValues
  }
  return payload;
}

var bucket = gcloud.storage().bucket('sgdq-backend.appspot.com');
function onSchedule() {
  getChoiceSeries(SUPER_METROID_BID_ID).then(function(data){
    console.log('[Tracker Collector] Got data')
    var series = processChoiceSeries(data)
    var file = bucket.file('killVsSave.json');
    file.save(JSON.stringify(series), function(err){
      if(err) console.log(err)
      else {
        console.log('[Tracker Collector] Upload successful')
        file.makePublic();
      }
    })
  });
}

console.log("[Tracker Collector] started.")
// Run every 10 minutes
schedule.scheduleJob({minute: [0, 10, 20, 30, 40, 50]}, function(){
  onSchedule();
});