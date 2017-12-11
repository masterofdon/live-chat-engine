var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
var dbmodule = require("./db/dbmodule.js");
var utils = require("./utils/outzrandom.js");
var dbutils = require("./db/dbutil.js");
var bodyParser = require('body-parser');
var chatEngine = require('./livechatengine/livechatengine.js');
//var keygen = require('./ssh/sshkeygen.js');
//var sshServer = require('./ssh/sshserver.js');
var users = [];
var connectedUsers = [];
var dbcon;
var outz_connections = [];
var contextmap = [];
var livechatengine = [];
var instanceData = {};
//==============================================================//
//==========================MAIN================================//
//==============================================================//
console.log("Server Bootstrapping...");
(function serverInitialize(){
	fs.readFile('server.config' , function(err,data){
		if(err) throw err;
		console.log(data.toString("utf8"));
	});
})();
(function serverBootstrap(){
	if(express == null || app == null){
		return; 
	}
	console.log("BOOTSTRAPPER: ExpressModule Initiation Succcessful.");
	if(dbmodule == null){
		return;
	}
	console.log("BOOTSTRAPPER: DBModule Initiation Succcessful.");
	if(utils == null){
		return;
	}
	console.log("BOOTSTRAPPER: UtilitiesModule Initiation Succcessful.");
	if(io == null){
		return;
	}
	console.log("BOOTSTRAPPER: WebSocketModule Initiation Succcessful.");
})();

(function setupExpressRouter(){
	app.use("/web" , express.static(__dirname + '/web'));
	app.get('/' , function(req,res){
		res.sendFile(__dirname + "/web/index.html");
	});

	app.get('/api/conversations' , function(req,res){
		var userid = req.query.userid;
		var chatkey = req.query.chatkey;
		dbmodule.getAutheticationObject(userid,function(res){
			console.log(res);
		},function(err){
			console.error(err);
		});
	});
})();

(function startBodyParser(){
	app.use(bodyParser.json() );        // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	  extended: true
	}));
})();

(function startServer(){
	server.listen(process.env.PORT || 3000);
})();

(function startLiveChatEngine(){

})();


(function connectToMysqlDB(){
	dbmodule.connectToMySqlDatabase(function(){
		console.log("Connected!");
	},function(error){
		console.error("Error occurred during DB Connection");
	});
})();

function ChatManager(){

	var socket;
	var danglingConnections = [];
	var eventhandlers = [];
	var userAccount = {};
	(function initEvents(){
		eventhandlers["connect"] = [];
		eventhandlers["disconnect"] = [];
	})();
	var app = {};
	emitEvent = function(event,data){
		for(var i = 0;i < eventhandlers[event].length; i++){
			eventhandlers[event][i](app);
		}
	};
	app.onUserLoginRequestHandler = function(data){
		console.log(data);
		var userid = data.user.userid;
		var chatkey = data.user.chatkey;
		dbmodule.authenticateChatUser(userid,chatkey,function(authUser){
			var outz_connection = {};
			outz_connection.socket = socket;
			outz_connection.user = authUser;
			outz_connections.push(outz_connection);
			danglingConnections.splice(danglingConnections.indexOf(socket) , 1);
			console.log("Connected User: %s " , outz_connection.user.pubuser.displayname);
			socket.emit("user-login-res", { response: "success" , userdetails : outz_connection.user.pubuser});
		},function(){
			socket.emit("user-login-res" , { response : "failure" });
		});
	};
	app.onFromClientToServerMessage = function(data){
		console.log(data);
		var conversation = data.conversation;
		var incUserID = data.user.userid;
		var incUserChatKey = data.user.chatkey;
		var result = app.verifyAuthUser(incUserID,incUserChatKey);
		console.log("Verification Result: " + result);
		if(result){
			dbmodule.findAccountsByConversationIDExcludeSelf(conversation,incUserID,function(res){
				var endUsers = res;
				var i =0;
				for(;i < outz_connections.length; i++){
					var userid = outz_connections[i].user.userid;
					if(userid == endUsers.user_id){
						var socketOut = outz_connections[i].socket;
						sendMessageToSocket(socketOut,{msg : data.msg});
					}
				}
			});
		}		
		sendMessageToSocket(socket,{msg : data});
	};
	app.onUserLogoutRequestHandler = function(data){

	};
	app.onDisconnectHandler = function(data){
		var index = findSocketInArray(socket);
		if(index == -1){
			danglingConnections.splice(danglingConnections.indexOf(socket) , 1);
			console.log("Disconnected Unknown User");
			return;
		}
		var connection_to_be_removed = outz_connections[index];
		outz_connections.splice(index,1);
		console.log("User " + connection_to_be_removed.user.displayname + " disconnected.");
		emitEvent("disconnect");
	};
	app.sendMessageFromServerToClient = function(){

	};
	app.getSoket = function(){
		return socket;
	}
	app.setSocket = function(p_socket){
		socket = p_socket;
	};
	app.addToDanglingConnections = function(p_socket){
		danglingConnections.push(p_socket);
		console.log("Connected Dangling: %s sockets connected" , danglingConnections.length);
	};
	app.removeFromDanglingConnections = function(p_socket){

	};
	app.on = function(event,handler){
		eventhandlers[event].push(handler);
	}

	app.verifyAuthUser = function(userid,chatkey){
		console.log("IncUser: " + userid + " , IncChatKey: " + chatkey);
		for(var i = 0; i < outz_connections.length ; i++){
			console.log("Checking User:");
			console.log(outz_connections[i].user);
			if(outz_connections[i].user.userid == userid && outz_connections[i].user.chatkey == chatkey){
				console.log("Verified User: " + userid );
				return true;
			}
		}
		return false;

	}
	
	return app;
}


io.sockets.on("connection" , function(socket){
	var chatmanager = new ChatManager();	
	chatmanager.addToDanglingConnections(socket);
	chatmanager.setSocket(socket);	
	socket.on('fromclienttoserver' , chatmanager.onFromClientToServerMessage);
	socket.on('user-login' , chatmanager.onUserLoginRequestHandler);
	socket.on('user-logout' , chatmanager.onUserLogoutRequestHandler);
	socket.on("disconnect" , chatmanager.onDisconnectHandler);
	socket.on('get-chatkey', function(data){
		var username = data.user.userid;
	});
	livechatengine.push(chatmanager);
	chatmanager.on("disconnect",onChatManagerDisconnectedHandler);
	var client = socket.request.connection;
	console.log(client);
});

function onChatManagerDisconnectedHandler(data){
	console.log("Disconnect enginer. ");
	livechatengine.splice(livechatengine.indexOf(data),1);
}

function sendMessageToSocket(socket,message){
	socket.emit("servertoclient" , message);
}

function findSocketInArray(element){
	for(var i = 0;i < outz_connections.length;i++){
		if(outz_connections[i].socket == element){
			return i;
		}
	}
	return -1;
}

