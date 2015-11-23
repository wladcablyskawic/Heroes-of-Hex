var skylink = new Skylink();

var PLAYER_NAME;

skylink.on('peerJoined', function(peerId, peerInfo, isSelf) {
  var user = 'You';
  if(!isSelf) {
    user = peerInfo.userData.name || peerId;
  }
  addMessage(user + ' joined the room', 'action');
  
  if(!isSelf) {
		skylink.sendP2PMessage(showArmyList());	  
  }
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
		
	} else if(mess.Action=='SHOT') {
	console.log('shot odebrany');
			hexagonGrid.animateShot(mess.shoter, mess.target);
			
	}else if(mess.Action=='SHOW_ARMY'  && !isSelf) {
		if(mess.isSource==undefined) skylink.sendP2PMessage(showArmyList(true));
		
		for(i=0; i<mess.MOBS.length; i++) {
			if(mess.MOBS[i].player!=PLAYER_NAME) {
			hexagonGrid.addMob(mess.MOBS[i].player, mess.MOBS[i].type, 
			mess.MOBS[i].Tile.column,mess.MOBS[i].Tile.row,mess.MOBS[i].name, mess.MOBS[i].unitsize);	
			}
		}
			console.log(MOBS.length);
			MOBS.sort(compare);
			startgame();
		
		
		hexagonGrid.refreshHexGrid();
	}
}


});

function compare(a,b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}

function startgame() {
	hexagonGrid.selectMob('mob10');
	hexagonGrid.refreshHexGrid();
}

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
			defaultroom:'testroom2'}, function()
			{
				skylink.joinRoom('room3')
					   
				setTimeout(function(){
				skylink.sendP2PMessage(showArmyList());	
				}, 2000);				
			});
			
function setName() {
  var input = sessionStorage.getItem('player-name');
  skylink.setUserData({
    name: input
  });
}


function bePlayer(which) {
	PLAYER_NAME=which;
	var mobs = JSON.parse(sessionStorage.getItem('army-cart')).items;
	var row = 0;
	var column = 0;
	if(which=='2') row = MAX_ROW-1;
	console.log(row);
	for(i=0; i<mobs.length; i++) {
		column=1+2*i;
		if(column>MAX_COLUMN) {
			column=1+2*i - MAX_COLUMN;			
			if(which=='1') row++;
			else row--;
		}
		hexagonGrid.addMob(which, mobs[i].product, row,column,'mob'+which+i,mobs[i].qty);	
	}
	
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

function sendShotCommunicate(shoter, target) {
	var communicate = {};
	communicate.Action='SHOT';
	communicate.shoter=shoter;
	communicate.target=target;
	skylink.sendP2PMessage(JSON.stringify(communicate)); 
}

function declareCharge(attacker, target, tile) {
	var charge = {};
	charge.Action='CHARGE_DECLARATION';
	charge['attacker']=attacker;
	charge['target']=target;
	charge['tile']=tile;
	return JSON.stringify(charge); 	
};

function showArmyList(isSource) {
	var army = {};
	army.Action='SHOW_ARMY';
	var myMobs = [];
	army['MOBS']=MOBS;
	army.isSource=isSource;
	return JSON.stringify(army); 
}