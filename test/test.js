var assert = require('assert');
var chatengine = require("../livechatengine/livechatengine.js");
var outzdatetime = require("../utils/outzdatetime.js");
describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
it('should return plus seconds after entyr',function(){
	console.log(outzdatetime.createTimestampFromNow(200));
});
it('should return true if before now',function(){
	var date = outzdatetime.createTimestampFromNow(200)
	assert.equal(false,outzdatetime.isBeforeNow(date));
});