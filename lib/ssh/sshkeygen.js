var keygen = require('ssh-keygen');
var fs = require('fs');

var location = __dirname + '/host_rsa';
var comment = 'erdem';
var password = 'westwood'; // false and undefined will convert to an empty pw

keygen({
  	location: location,
  	comment: comment,
	password: password,
  	read: true
}, function(err, out){
	if(err) return console.log('Something went wrong: '+err);
	console.log('Keys created!');
	console.log('private key: '+out.key);
	console.log('public key: '+out.pubKey);
});