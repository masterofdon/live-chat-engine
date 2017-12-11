/*
Randomizer Module for OutzChat Application
*/

exports.getRandomAlphaNumeric = function(limit) {
	if(limit == null || limit === 'undefined')
		limit = 15
	var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var result = '';
    for (var i = limit ; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

exports.getRandomNumeric = function() {
	var chars = '0123456789';
	var result = '';
    for (var i = 8; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

exports.getRandomNumber = function(min,max){
	if(min == 'undefined')
		min = 0;
	if(max == 'undefined')
		max = 10000;
	return Math.random() * (max - min) + min;

}