var assert = require('assert');
var expect = require('chai').expect;

var collector = require('./sgdq_collector.js');

describe('sgdq_collector.js', function(){
  describe("getCurrentDonations()", function() {
    it('should get 2014 data correctly', function(done){
      collector.DONATION_URL = "https://gamesdonequick.com/tracker/index/sgdq2014"
      collector.getCurrentDonations(function(res){
        console.log(res)
        assert.equal(res.total, 718235.07)
        assert.equal(res.donators, 19104)
        assert.equal(res.max, 82984.71)
        assert.equal(res.avg, 37.6)
        done();
      });
    });
  });
});

var time = require("./utils/time_utils.js")

describe('time_utils.js', function() {
  describe("getTimeStamp()", function() {
    it('should correctly drop current seconds', function() {
      assert.equal(time.getTimeStamp(new Date(Date.parse("3:14:14 7-8-16"))), 1467972840000)
    });
  });
})