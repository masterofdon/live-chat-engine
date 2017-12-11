var outzrandom = require("../utils/outzrandom.js");
var dbmodule = require("../db/dbmodule.js");
var outzdate = require("../utils/outzdatetime.js");

var LiveChatEngineModule = (function init(MODULE){

	var appEngine = {};
	var contextMap = [];
	var logger;						// Logging interface.
	//===EVENTLISTENERS===//
	var eventhandlers = [];			
	const EVENTSOCKETCONNECTED = "socketconnected";
	const EVENTSOCKETDISCONNECTED = "socketdisconnected";
	const EVENTUSERLOGGEDIN = "userloggedin";
	const EVENTUSERLOGGEDOUT = "userloggedout";
	const EVENTUSERDISCONECTED = "userdisconnected";
	const EVENTSIGNALRECEIVED = "signalreceived";
	const events = [EVENTSOCKETCONNECTED,EVENTSOCKETDISCONNECTED,EVENTUSERLOGGEDIN,EVENTUSERLOGGEDOUT,EVENTUSERDISCONECTED,EVENTSIGNALRECEIVED];
	(function initEventhandlers(){
		for(var i=0;i < events.length; i++){
			eventhandlers[events[i]] = [];
		}
	})();
	function emitEvent(event,evdata){
		if(events.indexOf(event) != -1){
			var length = eventhandlers[events[event]].length;
			for(var i = 0; i < length; i++) {
				var temp =eventhandlers[events[event]][i];
				if(typeof temp === 'function')
					temp(evdata);
			}
		}else {
			if(logger != null || logger != 'undefined')
				logger.error("EventProcessor Error: No Such Event: " + event);
		}
	}
	function indexOfSocketInContextMap(socket){
		for(var i = 0; i < contextMap.length; i++){
			if(contexMap[i].getConnection() == socket){
				return i;
			}
		}
		return -1;
	}
	function indexOfUserIDInContextMap(userid){
		var i = 0;
		var length = contextMap.length;
		for(;i < length; i++){
			if( userid === contextMap[i].userdetails.userid ){
				return i;
			}
		}
		return -1;
	}
	//==SOCKET.io EventHandlers==//
	appEngine.onSocketConnected = function(socket){
		//- Create a context for the socket and add the socket to the context.
		var newContext = new Context();
		newContext.setConnection(socket);
		contextMap.push(newContext);
		// Emit Socket-Connected signal.
	};
	appEngine.onSocketDisconnected = function(socket){
		//- Check if the socket exists on ContextMap.
		//- If the socket does not exist we will hope the ContextMapCleaner will clean it later.
		var index = indexOfSocketInContextMap(socket);
		if(index != -1){
			contextMap.splice(index,1);
			// Emit User-Disconnected-Signal
		} else {
			// No such socket in ContextMap.
			if(logger != null || logger != 'undefined')
				logger.error("NoSuchElement Error: Socket Not Found in ContextMap: " + socket);
		}
	};
	appEngine.onUserLogin = function(socket,userdetails){
		//- Check if socket exits in our ContextMap.
		//- If exists, setUserDetails of relevant Context.
		var index = indexOfSocketInContextMap(socket);
		if(index != -1){
			var context = contextMap[index];
			context.setUserDetails(userdetails);
			//Emit User-Login-Signal
		} else{
			// No such socket in ContextMap.
			if(logger != null || logger != 'undefined')
				logger.error("NoSuchElement Error: Socket Not Found in ContextMap: " + socket);
		}
	};
	appEngine.onUserLogout = function(userid){
		//- Check if userdetails exists on ContextMap.
		//- If exists, remove Context from ContextMap.
		var index = indexOfUserIDInContextMap(userid);
		if(index != -1){
			contextMap.splice(index,1);
			// Emit User-Logout-Signal
		}else {
			// No such User in ContextMap.
			if(logger != null || logger != 'undefined')
				logger.error("NoSuchElement Error: Socket Not Found in ContextMap: " + socket);
		}
	};
	appEngine.onUserDisconnected = function(){
		// Nothing to do at the moment.
	};
	appEngine.onFromClientToServerMessage = function(data){
		var incMessage = data;
		emitEvent(EVENTSIGNALRECEIVED,signal);
		// Emit signalreceived
	};
	//===========================//
	appEngine.tagContextByUserID = function(userid,session){
		//- Check if userdetails of given userid exists on ContextMap.
		//- If exists, create a tag to Context and map it with session.
		var index = indexOfUserIDInContextMap(userid);
		if(index != -1){
			var context = contextMap[index];
			var tag = outzrandom.getRandomAlphaNumeric(8);
			context.addContextTag(tag,session);
		} else{
			// No such User in ContextMap.
			if(logger != null || logger != 'undefined')
				logger.error("NoSuchElement Error: Socket Not Found in ContextMap: " + socket);
		}
	};
	appEngine.removeTagContextByUserID = function(tag){
		//- Check if 
	};
	appEngine.tagContextBySocketID = function(tag,socket){

	};
	appEngine.on = function(event,eventhandler){
		if(events.indexOf(event) != null){
			eventhandlers[event].push(eventhandler);
		} else {
			if(logger != null || logger != 'undefined')
				logger.error("EventProcessor Error: No Such Event: " + event);
			return true;
		}
	};


})(LiveChatEngineModule || {});

// User's Logical Endpoint to our Server. User details and socket information are hold here.
// This is also the place where user profiles are held.
function Context(){

	var app;
	var userdetails;
	var connection = {};
	var tagsSessionMap = [];
	var chatManager = {};
	app.getUserDetails = function(){

	};
	app.setUserDetails = function(p_userdetails){

	};
	app.getConnection = function(){
		connection.socket;
	};
	app.setConnection = function(p_connection){

	};
	app.setChatManager = function(p_chatmanager){

	};
	app.getChatManager = function(p_chatmanager){

	}
	app.addContextTag = function(tag,session){
		var tagsession = new TagSession();
		tagsession.setTag(tag);
		tagsession.setSession(session);
		tagsSessionMap.push(tagsession);
	};
	app.addContextTag_test = function(tag,session){
		tagsSessionMap[tag] = session;
	}
	return app;
}

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

function AuthenticationService(){

	var app = {};
	var authenticationmap = [];
	const EVENTAUTHENTICATING = "authenticating";
	const EVENTAUTHSUCCESS = "auth-success";
	const EVENTAUTHFAILED = "auth-failure";
	const events = [EVENTAUTHENTICATING,EVENTAUTHSUCCESS,EVENTAUTHFAILED];
	app.authenticateUserByUserID = function(userid,chatkey,success,fail){
		dbmodule.findChatUserByUserIDAndChatKey(userid,chatkey,function(authUser){
			var authentication = {};
			authentication.user = authUser;
			authentication.expires = outzdate.createTimestampFromNow(3600 * 0.8 + outzrandom.getRandomNumber(1000,3000));
			authenticationmap[userid] = authUser;
			success();
		},function(failcode){
			fail();
		});
	};
	app.verifyAuthentication = function(userid,chatkey){
		if(authenticationmap[userid] == 'undefined')
			return false;
		if(chatkey != authenticationmap[userid].user.chatkey)
			return false;
		var expires = authenticationmap[userid].expires;
		if(outzdate.isBeforeNow(expires))
			return false;
		return true;
	};
	app.authenticateUserByAccountID = function(accountid,chatkey,success,fail){
		// NO need for now.
	};

	return app;
}


function DebugSession(){

}

function TagSession(){
	var tag;
	var session;

	var app = {};
	app.getTag = function(){
		return tag;
	}
	app.setTag = function(p_tag){
		tag = p_tag;
	}
	app.getSession = function(){
		return session;
	}
	app.setSession = function(p_session){
		session = p_session;
	}
}