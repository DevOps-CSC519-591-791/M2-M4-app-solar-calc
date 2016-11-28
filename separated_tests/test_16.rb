'use strict';

var assert = require("assert"); // node.js core module
var SolarCalc = require('../'); // our module

describe('suncalc', function() {
  
  describe('2015-06-23 in extreme latitude', function() {
    var solarCalc;
    beforeEach(function() {
      solarCalc = new SolarCalc(
        new Date('Jun 23 2015'),
        82.4508,
        -62.5056,
        -4,
        false
      );
    });
    it('get solar noon2', function() {
      assert.equal(1435075933000, solarCalc.solarNoon.getTime());
    });
  });
});
