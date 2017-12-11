exports.createTimestampFromNow = function(seconds){

	var t = new Date();
	t.setSeconds(t.getSeconds() + seconds);
	return t.getTime();
}

exports.isBeforeNow = function(timestamp){
	var t = new Date();
	if(t > timestamp){
		return true;
	}
	return false;
}