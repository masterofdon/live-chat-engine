// Modules
var mysql = require('mysql');

// Variables
var dbcon;

exports.connectToMySqlDatabase = function(success,failure){
	var con = mysql.createConnection({
	  host: "127.0.0.1",
	  user: "root",
	  password: "",
	  database : 'outz_db'
	});

	con.connect(function(err) {
	  if (err) throw err;
	  console.log("Connected To MySqlDB Successfully.");
	  dbcon = con;
	  success();
	});
}
exports.isConnected = function(){
	
}
//========================================================//
//=====================USERS==============================//
//========================================================//
exports.getAllUsers = function(userid,chatkey){
	var query = 'SELECT * FROM outz_companyentity_colleagues WHERE companyentity_id="7I49EFH3JNAA6S5FV3"';
	dbcon.query(query, function (error, results, fields) {
	  if (error) throw error;
	  console.log(results);
	});
}

exports.getAllColleagues = function(userid,chatkey,success,failure){

}

exports.getAccountFromUserID = function(userid,chatkey,success,failure){
	dbcon.query('SELECT * FROM outz_account WHERE user_id="' + userid +'"', function (error, results, fields) {
	  	if (error) throw error;
	  	// connected! 
	  	console.log(results);
	  	var account_id = results[0].id;
		queryChatKey(account_id,function(data){
			console.log("Retrieved ChatKey: " + data.chatkey);
			if(data.chatkey === chatkey){
				retrieveUserDetails(userid,function(userdetails){
					success(userdetails);
				},function(error){
					console.log("ERROR: Error Occurred with DB.");
				});
				
			}else{
				failure();
			}
		});
	});
}

exports.getAutheticationObject = function(userid,success,failure){
	dbcon.query('SELECT * FROM outz_account INNER JOIN outz_user ON outz_account.user_id=outz_user.id AND outz_account.user_id="' + userid +'"', function (error, results, fields) {
	  	if (error) throw error;
	  	// connected! 
	  	console.log(results);
	});
}

exports.getUserdetailsFromUserID = function(userid,chatkey,success,failure){

}

exports.authenticateChatUser = function(userid,chatkey,success,failure){
	dbcon.query('SELECT * FROM outz_account account INNER JOIN outz_messaging_chatkey chatkey ON account.id=chatkey.account_id WHERE (account.user_id="' + userid +'" AND chatkey.status="ACTIVE")', function (error, results, fields) {
	  	if (error) throw error;
	  	console.log("Authenticate User Results:");
	  	console.log(results);
	  	var authUser = {};
	  	if(results[0].chatkey === chatkey){
		  	authUser.userid = results[0].user_id;
		  	authUser.chatkey = results[0].chatkey;
		  	authUser.accountid = results[0].account_id;
			exports.findUserDetailsFromUserID(userid,function(userdetails){
				var privUserDetails = deleteUserDetailsPublic(userdetails);
				authUser.pubuser =  userdetails;
				authUser.privuser = privUserDetails;
			  	console.log("PubUser:");
	  			console.log(authUser.pubuser);
	  			console.log("PrivUser:");
	  			console.log(authUser.privuser);
				success(authUser);
			},function(error){
				console.log("ERROR: Error Occurred with DB.");
				failure();
			});
		}else{
			failure();
		}
	});
}

function deleteUserDetailsPublic(userdetails){
	var reducedDetails = userdetails;
	delete reducedDetails.id;
	delete reducedDetails.creation_date;
	delete reducedDetails.expiration_date;
	delete reducedDetails.state;
	delete reducedDetails.type;
	return reducedDetails;
}

exports.getAccountFromUserID = function(userid,success,failure){
	dbcon.query('SELECT * FROM outz_account WHERE user_id="' + userid +'"', function (error, results, fields) {
	  	if (error) failure(error);
	  	var account = results[0];
		success(account);
	});
}

exports.verifyUserIDChatKey = function(userid,chatkey,success,failure){
	dbcon.query('SELECT * FROM outz_account WHERE user_id="' + userid +'"', function (error, results, fields) {
	  	if (error) throw error;
	  	var account_id = results[0].id;
		exports.queryChatKey(account_id,function(data){
			console.log("Retrieved ChatKey: " + data.chatkey);
			if(data.chatkey === chatkey){
				success();				
			}else{
				failure();
			}
		});
	});
}

exports.queryChatKey = function(account_id,success){
	dbcon.query('SELECT * FROM outz_messaging_chatkey WHERE account_id="' + account_id +'"', function (error, results, fields) {
  		if (error) throw error;
  		// connected! 
  		for(var i = 0;i < results.length;i++){
  			if(!(results[i].status === "ACTIVE")){
  				console.log("Removing..." + results[i].id);
  				results.splice(i,1);
  			}
  		}
  		success(results[0]);
	});
}

exports.findActiveChatKeyByAccountId = function(account_id,success,failure){
	dbcon.query('SELECT * FROM outz_messaging_chatkey WHERE account_id="' + account_id +'"', function (error, results, fields) {
		if(error) throw error;
		for(var i = 0;i < results.length;i++){
  			if(!(results[i].status === "ACTIVE")){
  				console.log("Removing..." + results[i].id);
  				results.splice(i,1);
  			}
  		}
  		success(results[0]);
	});
}

exports.findUserDetailsFromUserID = function(userid,success,failure){
	dbcon.query('SELECT * FROM outz_user WHERE id="' + userid +'"', function (error, results, fields) {
  		if (error) throw error;
  		// connected! 
  		var userdetails = results[0];  		
  		console.log(userdetails);
  		success(userdetails);
	});
}

exports.findUserDetailsFromUserID = function(userid,success,failure){
	dbcon.query('SELECT * FROM outz_user WHERE id="' + userid +'"', function (error, results, fields) {
  		if (error) throw error;
  		// connected! 
  		var userdetails = results[0];
  		delete userdetails.id;
  		delete userdetails.creation_date;
  		delete userdetails.expiration_date;
  		delete userdetails.state;
  		delete userdetails.type;
  		console.log(userdetails);
  		success(userdetails);
	});
}

exports.findAccountsByConversationID = function(conversation_id,success,failure){
	dbcon.query('SELECT parties.conversation_id, parties.account_id, accounts.deviceid, accounts.user_id, user.creation_date, user.expiration_date, user.displayname, user.state, user.type, user.username ' +
				'FROM outz_messaging_conversation_parties parties ' + 
				'INNER JOIN outz_account accounts ON parties.account_id=accounts.id ' + 
				'INNER JOIN outz_user user ON user.id=accounts.user_id ' + 
				'WHERE conversation_id="' + conversation_id +'" AND user.id != "' +  +'"', function (error, results, fields) {
  		if (error) throw error;
  		// connected! 
  		success(results);
	});
}

exports.findAccountsByConversationIDExcludeSelf = function(conversation_id,userid,success,failure){
	dbcon.query('SELECT parties.conversation_id, parties.account_id, accounts.deviceid, accounts.user_id, user.creation_date, user.expiration_date, user.displayname, user.state, user.type, user.username ' +
				'FROM outz_messaging_conversation_parties parties ' + 
				'INNER JOIN outz_account accounts ON parties.account_id=accounts.id ' + 
				'INNER JOIN outz_user user ON user.id=accounts.user_id ' + 
				'WHERE conversation_id="' + conversation_id +'" AND user.id != "' + userid +'"', function (error, results, fields) {
  		if (error) throw error;
  		// connected! 
  		success(results);
	});
}

exports.findUserIDByAccountID = function(account_id,success,failure){
	dbcon.query('SELECT * FROM outz_account WHERE id="' + account_id +'"', function (error, results, fields) {
  		if (error) throw error;
  		// connected! 
  		success(results);
	});
}

exports.findAllConversationsForAccountID = function(account,success,failure){
	
}

exports.findChatKeyInAuthMap = function(userid,chatkey){

}