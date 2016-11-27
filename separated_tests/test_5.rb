'use strict';

var assert = require("assert"); // node.js core module
var SolarCalc = require('../'); // our module

describe('suncalc', function() {
  
  describe('2015-03-08 in North Carolina', function() {
    var solarCalc;
    beforeEach(function() {
      solarCalc = new SolarCalc(
        new Date('Mar 08 2015'),
        35.78,
        -78.649999
      );
    });
    it('get nautical dawn', function() {
      assert.equal(1425811226000, solarCalc.nauticalDawn.getTime());
    });
  });
});
