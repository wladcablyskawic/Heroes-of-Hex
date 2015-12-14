var commandManager = {

	chat: function(mess, isSelf, peerId, peerInfo) {
	  var user = 'You',
      className = 'you';
	  if(!isSelf) {
		user = peerInfo.userData.name || peerId;
		className = 'message';
	  }	
	  
	  addMessage(user + ': ' + mess.message, className);
	},
	
	castSpell: function(mess, isSelf, peerId, peerInfo) {
	  randomSeed=mess.randomSeed;
	  var user = 'You',
      className = 'you';
	  if(!isSelf) {
		user = peerInfo.userData.name || peerId;
		className = 'message';
	  }	
		var castMessage = user+' tried to cast '+mess.spell +'(CV:'+mess.castingValue+') ';
	  
		if(mess.SnakeEyes) {
			castMessage+= 'rolled Snake Eyes on '+mess.dice+' dice! The spell has been forgotten!';
			if(isSelf) {
				$.growl.error({ title: "Snake Eyes", message: castMessage });
				$('#spellsMenu img[name="'+mess.spell+'"]').remove();
				HEROES[0].forgoteSpell(mess.spell);
			}
			else $.growl.notice({ title: "Snake Eyes", message: castMessage });	  
		} else if(mess.IrresistibleForce) {
			castMessage+='on '+mess.dice+' dice and rolled it with Irresistible Force!';
			if(isSelf) {
				$.growl.notice({ title: "Irresistible Force!", message: castMessage });
				MAGIC_PHASE=true;
				hexagonGrid.refreshHexGrid();
				$('a.magic-handle').trigger('click');				
			}
			else $.growl.error({ title: "Irresistible Force!", message: castMessage });	  	  
		} else {
			castMessage+= 'and rolled '+mess.rolled +' on '+mess.dice+' dice';
			var success = mess.rolled>=mess.castingValue;
			castMessage+= '. Spell '+ (success? ' casted successfully.':' failed.');
				
			if(!isSelf) {
				if(success) respondSpell(mess, castMessage);		
				else $.growl.notice({ title: "Enemy wizzard is weak", message: castMessage });
			}
		}
		addMessage(castMessage, 'communicate');		  

	},
	
	dispel: function(mess, isSelf, peerId, peerInfo) {
	  randomSeed=mess.randomSeed;
	  var user = 'You',
      className = 'you';
	  if(!isSelf) {
		user = peerInfo.userData.name || peerId;
		className = 'message';
	  }	

  	    var success = mess.threshold <= mess.rolled;
		
		if(mess.SnakeEyes) {
			mess.rolled='Snake Eyes';		
			success=false;
		} else if(mess.IrresistibleForce) { 
			mess.rolled='double six';
			success=true;
		}
		var message = user+' tried to dispel and rolled '+mess.rolled  +' on '+mess.dice+' dice';
		message+= '. Dispel'+ (success? ' successfully.':' failed.');
		addMessage(message, 'communicate');	
		var communicateTitle;
		if(success) communicateTitle="Spell dispelled";
		else 		communicateTitle="Spell casted succesfully";
		
		
		if(isSelf) {
				if(!success) 			$.growl.error({ title: communicateTitle, message: "You cannot stop enemy power" });
				else  $.growl.notice({ title: communicateTitle, message: "Enemy spell has been stopped" });
		} else {
			if(!success) {
				$('a.magic-handle').trigger('click');		
				$.growl.notice({ title: communicateTitle, message: "Opponent wasnt able to stop your power! Choose a target." });
				MAGIC_PHASE=true;
				hexagonGrid.refreshHexGrid();
				}
			else $.growl.error({ title: communicateTitle, message: "Opponent stopped your spell" });		
		}
	},		
	
	takeSpell: function(mess, isSelf, peerId, peerInfo) {
	  var user = 'You',
      className = 'you';
	  if(!isSelf) {
		user = peerInfo.userData.name || peerId;
		className = 'message';
	  }	
		var message = user+' decided to take a spell.';	
		addMessage(message, 'communicate');	
		
		if(isSelf) return;
		$('a.magic-handle').trigger('click');	
		$.growl.notice({ title: "Spell casted succesfully", message: "Opponent has taken your spell. Choose a target." });
		MAGIC_PHASE=true;
		hexagonGrid.refreshHexGrid();
	},
	
	spellEffect: function(mess, isSelf) {
		target = new Mob().parse(mess.target);
		spell = new Spell(mess.spell);
		var castMessage = spell.effect(target);
		hexagonGrid.refreshHexGrid();
		hexagonGrid.animateSpell(spell, target);
		if(isSelf)
			$.growl.notice({ title: "Spell effect", message: castMessage });
		else 
			$.growl.error({ title: "Spell effect", message: castMessage });

	},
 
	chargeDeclaration: function(mess, isSelf) {
		var attacker = new Mob().parse(mess.attacker);
		var target = new Mob().parse(mess.target);

		addMessage(attacker.getDescribe()+' is charging '+target.getDescribe(), 'communicate');	

		if(isSelf) { 
			$.growl.notice({ title: "The charge was declared.", message: "Waiting for an opponent\'s respond." });		
			return;
		}
		respondCharge(mess);
		return;
	},
	
	chargeRespond: function(mess, isSelf) {
	$( ".chargeRespondDialog" ).dialog('close');
			target = new Mob().parse(mess.target);
			attacker = new Mob().parse(mess.attacker);

		addMessage(target.getDescribe()+' decided to '+mess.respond, 'communicate');	
			
		if(mess.respond=='hold') {
			var stepByStep = path(attacker, mess.tile);
			attacker.goToTile(stepByStep, target);
			
			attacker.hasFinishedTurn=true;
			selectNextMob(attacker);
			hexagonGrid.refreshHexGrid();						
		}
		else if(mess.respond=='sns') {
			target.standAndShot(attacker);
			if(attacker.unitsize>0)	{
				var stepByStep = path(attacker, mess.tile);
				attacker.goToTile(stepByStep, target);
			}			
			attacker.hasFinishedTurn=true;
			selectNextMob(attacker);
			hexagonGrid.refreshHexGrid();			
		}
		else if(mess.respond=='flee') {		
			var fleeDistance = Math.floor((randomGenerator() * (target.max_speed-1))+2);
			target.neighbours = getPossibleMoves(fleeDistance, target.Tile);		
			stepByStep = getEscapePath(attacker.Tile, target.Tile, fleeDistance);
			target.goToTile(stepByStep);
			target.isFleeing = true;			

			var stepByStep = path(attacker, stepByStep[stepByStep.length-1], target);
			var chaseDistance = Math.floor((randomGenerator() * (attacker.max_speed-1))+2); 
			console.log('chase Distance ' +chaseDistance);
			console.log('stepByStep.length '+stepByStep.length);
			
			if(chaseDistance >= stepByStep.length) {
				attacker.goToTile(stepByStep,target);
				setTimeout(function(mob) {
					mob.unitsize=0;					
					hexagonGrid.refreshHexGrid();
				}, (chaseDistance+1)*150, target);							
				
				var chasedMessage = target.getDescribe()+' tried to flee but was chased and destroyed by '+attacker.getDescribe();
				addMessage(chasedMessage, 'communicate');	
				if(isSelf) 
				$.growl.error({ title: 'Unit destroyed',
					message: chasedMessage});
				else $.growl.notice({ title: 'United destroyed', 
						message: chasedMessage});
				
			} else {
				stepByStep = stepByStep.slice(0, chaseDistance);
				attacker.goToTile(stepByStep, target);
				console.log('chasing to:');
				console.log(stepByStep[stepByStep.length-1]);
			}

			
			attacker.hasFinishedTurn=true;
			selectNextMob(attacker);
			hexagonGrid.refreshHexGrid();			
		}	
	},
		
	shot: function(mess, isSelf) {
		target = new Mob().parse(mess.target);
		shoter = new Mob().parse(mess.shoter);
		shoter.shoot(target);
		hexagonGrid.animateShot(mess.shoter, target);
	},

	combat: function(mess, isSelf) {
		agresor = new Mob().parse(mess.agresor); 
		oponent = new Mob().parse(mess.oponent);
		combat(agresor, oponent);
		agresor.hasFinishedTurn=true;
		selectNextMob(agresor);
		hexagonGrid.refreshHexGrid();
	},	
	
	moveMob: function(mess) {
		mob = new Mob().parse(mess.mob);
		tile = new Tile().parse(mess.tile);
		var stepByStep = path(mob, tile);
		mob.goToTile(stepByStep);
		if(mob.speed+1==stepByStep.length) {
			mob.hasFinishedTurn=true;
			selectNextMob(mob);
		}
	},
	
	pivotMob: function(mess) {
		mob = new Mob().parse(mess.mob);
		tile = new Tile().parse(mess.tile);
		mob.pivot(tile);
	},
	
	finishTurn: function(mess) {
		nextPlayer();
		hexagonGrid.refreshHexGrid();
	},
	
	showArmy: function(mess, isSelf) {
		if(isSelf) {
			return;
		}
		
		if(DEPLOYMENT) return;
		$("#notify_wait").hide();
		if(mess.isSource==undefined) skylink.sendP2PMessage(showArmyList(true));
		
		for(i=0; i<mess.MOBS.length; i++) {
			if(mess.MOBS[i].player!=PLAYER_NAME) {
			hexagonGrid.addMob(mess.MOBS[i].player, mess.MOBS[i].type, 
			mess.MOBS[i].Tile.column,mess.MOBS[i].Tile.row,mess.MOBS[i].name, mess.MOBS[i].unitsize);	
			}
		}
			MOBS.sort(compareMobs);
			startgame();		
		hexagonGrid.refreshHexGrid();
	}
  };
  
function compareMobs(a,b) {
  if (a.name < b.name)
    return -1;
  if (a.name > b.name)
    return 1;
  return 0;
}
  
 commandManager.execute = function ( name ) {
    return commandManager[name] && commandManager[name].apply(commandManager, [].slice.call(arguments, 1) );
};
 
