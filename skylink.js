var skylink = new Skylink();

var PLAYER_NAME;

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

	if(mess.Action=='DESCRIBE_GAME' && mess.MOBS != undefined) {
		for(i=0; i<mess.MOBS.length; i++) {
			MOBS[i].unitsize = mess.MOBS[i].unitsize;
			MOBS[i].hp = mess.MOBS[i].hp;
			MOBS[i].Tile.column = mess.MOBS[i].Tile.column;
			MOBS[i].Tile.row = mess.MOBS[i].Tile.row;		
			if(mess.ACTIVE_MOB.name==MOBS[i].name) {
				ACTIVE_MOB=MOBS[i];
			}
		}
		hexagonGrid.refreshHexGrid();
		}
	else if(mess.Action=='CHARGE_DECLARATION' && mess.target.player==PLAYER_NAME) {
			respondCharge(mess);
		}
	else if(mess.Action=='CHARGE_RESPOND' && !isSelf) {
		if(mess.respond=='hold') 
			hexagonGrid.moveCharge(mess.attacker, mess.target, mess.tile);
		else if(mess.respond=='sns') {
			target = new Mob();
			target = target.parse(mess.target);
			attacker = new Mob();
			attacker = attacker.parse(mess.attacker);
			target.standAndShot(ACTIVE_MOB);
			if(ACTIVE_MOB.unitsize>0)	hexagonGrid.moveCharge(ACTIVE_MOB, target, mess.tile);
			else selectNextMob(ACTIVE_MOB);

		}
		else if(mess.respond=='flee') {
			hexagonGrid.moveFlee(mess.target, mess.tile);
		}
		
	}
}


});

function respondCharge(mess) {
		alert(mess.attacker.type+'['+mess.attacker.Tile.column
		+','+mess.attacker.Tile.row+'] is charging '+mess.target.type
		+'['+mess.tile.column
		+','+mess.tile.row+']');
		var respond = prompt('Your decision? hold, flee, sns', 'hold');
		var tmp={};
		tmp.respond = respond;
		tmp.Action = 'CHARGE_RESPOND';
		tmp['attacker']=mess.attacker;
		tmp['target']=mess.target;
		tmp['tile']=mess.tile;
		
		skylink.sendP2PMessage(JSON.stringify(tmp));	

};

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

function bePlayer(which) {
	PLAYER_NAME=which;
	joinRoom();
	hexagonGrid.refreshHexGrid();	
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

function sendChargeDeclaration(attacker, target, tile) {
	var tmp=declareCharge(attacker, target, tile);
	console.log(tmp);
	  skylink.sendP2PMessage(tmp);
}

function describeGame() {
	var game = {};
	game.Action='DESCRIBE_GAME';
	game['ACTIVE_MOB']=ACTIVE_MOB;
	game['MOBS']=MOBS;
	return JSON.stringify(game); 
}

function declareCharge(attacker, target, tile) {
	var charge = {};
	charge.Action='CHARGE_DECLARATION';
	charge['attacker']=attacker;
	charge['target']=target;
	charge['tile']=tile;
	return JSON.stringify(charge); 	
};