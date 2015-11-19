var skylink = new Skylink();

var PLAYER_NAME='1';

skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    user = peerInfo.userData.name || peerId;
  }
  addMessage(user + ' joined the room', 'action');
});

skylink.on('peerUpdated', function(peerId, peerInfo, isSelf) {
  if(isSelf) {
    user = peerInfo.userData.name || peerId;
	PLAYER_NAME = user;
    addMessage('You\'re now known as ' + user, 'action');
  }
});

skylink.on('peerLeft', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    user = peerInfo.userData.name || peerId;
  }
  addMessage(user + ' left the room', 'action');
});

skylink.on('incomingMessage', function(message, peerId, peerInfo, isSelf) {
  var user = 'You',
      className = 'you';
  if(!isSelf) {
    user = peerInfo.userData.name || peerId;
    className = 'message';
  }
  addMessage(user + ': ' + message.content, className);
  
var mess = JSON.parse(message.content);
if(mess!=undefined) {
console.log(mess);
	if(mess.MOBS != undefined) {
	console.log('messMOBS defined');
		for(i=0; i<mess.MOBS.length; i++) {
			MOBS[i].unitsize = mess.MOBS[i].unitsize;
			MOBS[i].hp = mess.MOBS[i].hp;
			MOBS[i].Tile.column = mess.MOBS[i].Tile.column;
			MOBS[i].Tile.row = mess.MOBS[i].Tile.row;		
			if(mess.ACTIVE_MOB.name==MOBS[i].name) {
				console.log('ACTIVE_MOB ustlono na '+MOBS[i].name);
				ACTIVE_MOB=MOBS[i];
			}
		}
		hexagonGrid.refreshHexGrid();
	} 
	}


});

skylink.init({apiKey:'8079fc56-2654-4d2d-8504-72a4b96d5456',
			defaultroom:'testroom'}); // Get your own key at developer.temasys.com.sg

function setName() {
  var input = document.getElementById('name');
  skylink.setUserData({
    name: input.value
  });
}

function joinRoom() {
  skylink.joinRoom("room2");
}

function leaveRoom() {
  skylink.leaveRoom();
}

function sendMessage() {
  var input = document.getElementById('message');
  skylink.sendP2PMessage(input.value);
  input.value = '';
  input.select();
}

function addMessage(message, className) {
  var chatbox = document.getElementById('chatbox'),
    div = document.createElement('div');
  div.className = className;
  div.textContent = message;
  chatbox.appendChild(div);
}

function sendGameState() {
	//var input ='{json: aa, json2: bb}';
	  skylink.sendP2PMessage(describeGame());
}

function describeGame() {
	var game = {};
	game['ACTIVE_MOB']=ACTIVE_MOB;
	game['MOBS']=MOBS;
	return JSON.stringify(game); 
}