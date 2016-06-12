var assert = require('assert');
var expect = require('chai').expect;

var collector = require('./index.js');

describe('index.js', function(){
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