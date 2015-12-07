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
 
	chargeDeclaration: function(mess, isSelf) {
		var attacker = new Mob().parse(mess.attacker);
		var target = new Mob().parse(mess.target);

		addMessage(attacker.getDescribe()+' is charging '+target.getDescribe(), 'communicate');	

		if(isSelf) return;
		respondCharge(mess);
		return;
	},
	
	chargeRespond: function(mess, isSelf) {
	$( "#chargeRespondDialog" ).dialog('close');
			target = new Mob().parse(mess.target);
			attacker = new Mob().parse(mess.attacker);

		addMessage(target.getDescribe()+' decided to '+mess.respond, 'communicate');	
			
		if(mess.respond=='hold') {
//			if(isSelf) return;
			hexagonGrid.moveCharge(attacker, target, mess.tile);
		}
		else if(mess.respond=='sns') {
//			if(isSelf) return;
			target.standAndShot(ACTIVE_MOB);
			if(ACTIVE_MOB.unitsize>0)	hexagonGrid.moveCharge(ACTIVE_MOB, target, mess.tile);
			else selectNextMob(ACTIVE_MOB);

		}
		else if(mess.respond=='flee') {
		
			var stepByStep = path(attacker.Tile.row,attacker.Tile.column, mess.tile.row, mess.tile.column);
			attacker.goToTile(stepByStep);

			ACTIVE_MOB = target;
			var fleeDistance = Math.floor((randomGenerator() * (target.speed-1))+2);
			target.neighbours = getPossibleMoves(fleeDistance, target.Tile);		
			stepByStep = getEscapePath(attacker.Tile, target.Tile, fleeDistance);

			target.goToTile(stepByStep, target);
			target.isFleeing = true;			
			ACTIVE_MOB=attacker;
			
			selectNextMob(ACTIVE_MOB);
		}	
	},
	
	reinforcement: function(mess) {
		mob = new Mob().parse(mess.mob);
		mob.isFleeing=false;				
		mob.isReinforcemented=true;
		mob.speed=0;
		addMessage(mob.getDescribe()+' reinforcemented.', 'communicate');	
		//selectNextMob(mob);
		hexagonGrid.refreshHexGrid();			
	},
	
	shot: function(mess, isSelf) {
		target = new Mob().parse(mess.target);
		ACTIVE_MOB.shoot(target);
		hexagonGrid.animateShot(mess.shoter, target);
	},

	combat: function(mess, isSelf) {
		agresor = new Mob().parse(mess.agresor); 
		oponent = new Mob().parse(mess.oponent);
		combat(agresor, oponent);
		selectNextMob(agresor);
		hexagonGrid.refreshHexGrid();

	},	
	
	moveMob: function(mess) {
		mob = new Mob().parse(mess.mob);
		tile = new Tile().parse(mess.tile);
		ACTIVE_MOB=mob;
		var stepByStep = path(mob.Tile.row,mob.Tile.column, tile.row, tile.column);
		mob.goToTile(stepByStep);
	},
	
	pivotMob: function(mess) {
		mob = new Mob().parse(mess.mob);
		tile = new Tile().parse(mess.tile);
		ACTIVE_MOB=mob;		
		ACTIVE_MOB.pivot(tile);
	},
	
	finishTurn: function(mess) {
		mob = new Mob().parse(mess.mob);
		selectNextMob(mob);	
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
			console.log(MOBS.length);
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
 
