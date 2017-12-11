var utils = require("../utils/outzrandom.js");

exports.insertNewMessage = function(id,message,timestamp,conversation_id,sender_id){
	var timestamp = Math.floor(Date.now());
	var newId = utils.getRandomAlphaNumeric();
	return "INSERT INTO outz_messaging_messages (id,message,timestamp,conversation_id,sender_id) VALUES('" + newId +"','" + content.msg + "','" + timestamp + "','" + conversation_id + "','" + from + "')"
}