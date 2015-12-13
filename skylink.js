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
	HEROES[0].prepareForNewTurn();	
	hexagonGrid.refreshHexGrid();
}

function respondCharge(mess) {

		var chargeRespond={};
		chargeRespond.Action = 'chargeRespond';
		chargeRespond.attacker=mess.attacker;
		chargeRespond.target=mess.target;
		chargeRespond.tile=mess.tile;

		target = new Mob().parse(mess.target);
		attacker = new Mob().parse(mess.attacker);

		hexagonGrid.highlightHex('yellow', attacker.Tile);
		hexagonGrid.highlightHex('red', target.Tile);
			
		if(target.isSurrounded()==true) {
			chargeRespond.respond = 'hold';		
			skylink.sendP2PMessage(JSON.stringify(chargeRespond));	
			return;
		}		

		autoRespond = null;
		
		var communicate = mess.attacker.type+'['+mess.attacker.Tile.column
		+','+mess.attacker.Tile.row+'] is charging '+mess.target.type
		+'['+mess.tile.column
		+','+mess.tile.row+']. What is your answer?';
				
		var buttons = {
		};
		
		if(target.isFleeing==false) {
			if(autoRespond==null) setAutoRespond(chargeRespond, 'hold');
			buttons['hold'] = function() {
				chargeRespond.respond='hold';
				skylink.sendP2PMessage(JSON.stringify(chargeRespond));
				$(this).dialog('close');
				clearTimeout(autoRespond);				
			};			
		}
		
		if(target.isFleePossible(mess.attacker.Tile)) {
			if(autoRespond==null) setAutoRespond(chargeRespond, 'flee');
			buttons['flee'] = function() {
				chargeRespond.respond='flee';
				skylink.sendP2PMessage(JSON.stringify(chargeRespond));
				$(this).dialog('close');
				clearTimeout(autoRespond);				
			};
		}			
		
		
		
		if(target.shots>0 && target.checkLOS(attacker.Tile)) {
			if(autoRespond==null) setAutoRespond(chargeRespond, 'sns');			
			buttons['stand&shoot'] = function() {
				chargeRespond.respond='sns';
				skylink.sendP2PMessage(JSON.stringify(chargeRespond));
				$(this).dialog('close');
				clearTimeout(autoRespond);				
			};		
		}
		
		$("<div class='chargeRespondDialog'></div>").dialog({
			modal:true,
			title:'Decision time!',
			buttons: buttons,
			open: function () {
				$(this).text(communicate);
			}
		});
		
};


function respondSpell(mess, message) {
		if(!HEROES[0].isDispelPossible()) {
			var communicate = {};
			communicate.Action='takeSpell';
			skylink.sendP2PMessage(JSON.stringify(communicate)); 				
			return;
		}
		
		var buttons = {};
		autoRespond = setTimeout(function(){ 
			$(".magicRespondDialog").dialog('close');				
			}, 7000);

		message+=' What is your answer?';

		RollManager.Dispel(mess.rolled);
		
		buttons['do nothing'] = function() {	
				$(this).dialog('close');
		};	

		
		$("<div class='magicRespondDialog'></div>").dialog({
			modal:true,
			buttons: buttons,
			title:'Decision time!',
			open: function () {
				$(this).text(message);
			},
			beforeClose: function() {
				$('.magic-div').append($('#selector_div')).append($('#magic-canvas'));
					if(RollManager.isAnswerSend()==false) {
					var communicate = {};
					communicate.Action='takeSpell';
					skylink.sendP2PMessage(JSON.stringify(communicate)); 				
				}
				clearTimeout(autoRespond);								
			}
		}).append($('#selector_div')).append($('#magic-canvas'));
		
}

function setAutoRespond(communicate, answer) {
		autoRespond = setTimeout(function(){ 
				communicate.respond=answer;
				skylink.sendP2PMessage(JSON.stringify(communicate));
				$(".chargeRespondDialog").dialog('close');				
		}, 7000);
}


//prv.pl : 8079fc56-2654-4d2d-8504-72a4b96d5456
//localhost: ed9ef9c2-ad9d-4240-9b95-bc779f497242

skylink.init({apiKey:'ed9ef9c2-ad9d-4240-9b95-bc779f497242',
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
		hexagonGrid.addMob(which, mobs[i].product, column, row,'mob'+which+i,mobs[i].qty);	
	}
	
	hexagonGrid.addHero(which, 'wizzard', 4, 2, 10);	
	
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

function pivotMob(mob, tile) {
	if(mob.isPivotPossible()) {
		var move = {};
		move.Action='pivotMob';
		move['mob']=mob;
		move['tile']=tile;		
		skylink.sendP2PMessage(JSON.stringify(move)); 	
	} else {
		alert('Turn is not possible because of not enough movement');
	}
};

function finishTurn() {
	if(ACTIVE_MOB.player==PLAYER_NAME) {
		var move = {};
		move.Action='finishTurn';
		move['mob']=ACTIVE_MOB;
		skylink.sendP2PMessage(JSON.stringify(move)); 	
	} else alert('Its not your turn, you cannot finish it');
};

function sendReinforcement(mob) {
	var communicate = {}
	communicate.Action='reinforcement';
	communicate.mob=mob;
	skylink.sendP2PMessage(JSON.stringify(communicate)); 		
};

function sendSpell(spell, target) {
	var communicate = {}
	communicate.Action='spellEffect';
	communicate.target=target;
	communicate.spell=spell;
	skylink.sendP2PMessage(JSON.stringify(communicate)); 			
};