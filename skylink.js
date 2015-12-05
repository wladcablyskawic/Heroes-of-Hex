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
	var mess = JSON.parse(message.content);
	if(mess!=undefined) {
		commandManager.execute(mess.Action, mess, isSelf, peerId, peerInfo);	
	} 
});



function startgame() {
	hexagonGrid.selectMob('mob10');
	hexagonGrid.refreshHexGrid();
}

function respondCharge(mess) {


		var tmp={};
		tmp.Action = 'chargeRespond';
		tmp.attacker=mess.attacker;
		tmp.target=mess.target;
		tmp.tile=mess.tile;

		target = new Mob().parse(mess.target);
		attacker = new Mob().parse(mess.attacker);
		
		if(target.isSurrounded()==true) {
			tmp.respond = 'hold';		
			skylink.sendP2PMessage(JSON.stringify(tmp));	
			return;
		}		

		autoRespond = setTimeout(function(){ 
				tmp.respond='hold';
				skylink.sendP2PMessage(JSON.stringify(tmp));
				$("#chargeRespondDialog").dialog('close');				
		}, 3000);

		
		var communicate = mess.attacker.type+'['+mess.attacker.Tile.column
		+','+mess.attacker.Tile.row+'] is charging '+mess.target.type
		+'['+mess.tile.column
		+','+mess.tile.row+']. What is your answer?';
		
		$("#chargeRespondDialog").text(communicate);

		var buttons = {
			'hold': function() {
				tmp.respond='hold';
				skylink.sendP2PMessage(JSON.stringify(tmp));
//				$(this).dialog('close');
				clearTimeout(autoRespond);
			}
		};
		
		if(target.isFleePossible(mess.attacker.Tile)) buttons['flee'] = function() {
				tmp.respond='flee';
				skylink.sendP2PMessage(JSON.stringify(tmp));
				$(this).dialog('close');
				clearTimeout(autoRespond);				
			};		
		
		
		
		if(target.shots>0) buttons['stand&shoot'] = function() {
				tmp.respond='sns';
				skylink.sendP2PMessage(JSON.stringify(tmp));
				$(this).dialog('close');
				clearTimeout(autoRespond);				
			};		
		
		$( "#chargeRespondDialog" ).dialog({
		modal:true,
		buttons: buttons
		});
		
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
  var communicate = {};
  communicate.Action = 'chat';
  communicate.message = input.value;
  skylink.sendP2PMessage(JSON.stringify(communicate));
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

function sendChargeDeclaration(attacker, target, tile) {

		$( "#chargeRespondDialog" ).text('The charge was declared. Waiting for an opponent\'s respond.');
		$( "#chargeRespondDialog" ).dialog({buttons:{}});
		ACTIVE_MOB.isWorking=true;
		
		var charge = {};
		charge.Action='chargeDeclaration';
		charge['attacker']=attacker;
		charge['target']=target;
		charge['tile']=tile;
	 	
		skylink.sendP2PMessage(JSON.stringify(charge));
}
function sendShotCommunicate(shoter, target) {
	var communicate = {};
	communicate.Action='shot';
	communicate.shoter=shoter;
	communicate.target=target;
	skylink.sendP2PMessage(JSON.stringify(communicate)); 
}


function sendCombatCommunicate(agresor, oponent) {
	var communicate = {};
	communicate.Action='combat';
	communicate.agresor=agresor;
	communicate.oponent=oponent;
	skylink.sendP2PMessage(JSON.stringify(communicate)); 
}

function showArmyList(isSource) {
	var army = {};
	army.Action='showArmy';
	var myMobs = [];
	army['MOBS']=MOBS;
	army.isSource=isSource;
	return JSON.stringify(army); 
}

function sendMobToTile(mob, tile) {
	var move = {};
	move.Action='moveMob';
	move['mob']=mob;
	move['tile']=tile;
	skylink.sendP2PMessage(JSON.stringify(move)); 	
}

function sendReinforcement(mob) {
	var communicate = {}
	communicate.Action='reinforcement';
	communicate.mob=mob;
	skylink.sendP2PMessage(JSON.stringify(communicate)); 		
}