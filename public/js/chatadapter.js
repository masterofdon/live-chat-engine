var ChatAdapter = {
	name : "ERDEM",
	greet : function(){
		console.log("Hello " + ChatAdapter.name);
	}

}

var $ChatModule = (function(module){

	var initConfig 		= {},
		chatConfig 		= {},
		chatUITheme 	= {},
		chatUserAuth	= {};
	var socket;
	var connected;
	(function init(){
		socket = io.connect();			
		socket.on('servertoclient' , function(data){
			console.log(data);
		});
		socket.on('user-login-res' , function(data){
			console.log(data);
			if(messageQueue.length != 0){
				for(var i =0;i < messageQueue.length;i++){
					socket.emit('fromclienttoserver', messageQueue[i]);
				}
			}
		});
		connected = true;
		socket.on('disconnect' , function(data){
			alert("alert");
			connected = false;
		});
		socket.on('connect',function(data){
			socket.emit('user-login', {user : sendData });
		});
	});
	
	this.init = function(){

	}
})($ChatModule || {});
