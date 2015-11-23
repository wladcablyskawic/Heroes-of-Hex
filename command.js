var commandManager = {
 
	chargeDeclaration: function(mess) {
		respondCharge(mess);
		return;
	},
	
	chargeRespond: function(mess) {
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
	},
	
	shot: function(mess) {
		hexagonGrid.animateShot(mess.shoter, mess.target);
	},
	
	showArmy: function(mess) {
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
	},
	
	synchronizeMobs: function(mess) {
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
 
 
  };

 commandManager.execute = function ( name ) {
    return commandManager[name] && commandManager[name].apply(commandManager, [].slice.call(arguments, 1) );
};
 
