"use strict";
var tracker = require("gdq_tracker_scraper")

var SUPER_METROID_BID_ID = 4792;

function getChoiceSeries(bid) {
  return new Promise(function(resolve, reject) {
      tracker.getBidDetail(bid).then(function(res){
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
  var xArrs = data.map(function(d){return d.data.map(function(e){return e.date})})
  xArrs.forEach(function(arr, idx){
    arr.unshift('x' + idx);
  }); 
  var values = data.map(function(d){return d.data.map(function(e){return e.amount})})
  values.forEach(function(arr, idx){
    arr.unshift(data[idx].bid)
  });
  var payload = {
    xs: xArrs,
    ys: values
  }
  return payload;
}

getChoiceSeries(SUPER_METROID_BID_ID).then(function(data){
  var series = processChoiceSeries(data)
  console.log(series)
})
