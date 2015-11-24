var commandManager = {
 
	chargeDeclaration: function(mess, isSelf) {
		if(isSelf) return;
		respondCharge(mess);
		return;
	},
	
	chargeRespond: function(mess, isSelf) {
		//if(isSelf) return;	
			target = new Mob().parse(mess.target);
			attacker = new Mob().parse(mess.attacker);
		
		if(mess.respond=='hold') {
			if(isSelf) return;
			hexagonGrid.moveCharge(attacker, target, mess.tile);
		}
		else if(mess.respond=='sns') {
			if(isSelf) return;
			target.standAndShot(ACTIVE_MOB);
			if(ACTIVE_MOB.unitsize>0)	hexagonGrid.moveCharge(ACTIVE_MOB, target, mess.tile);
			else selectNextMob(ACTIVE_MOB);

		}
		else if(mess.respond=='flee') {
			hexagonGrid.moveFlee(target, mess.tile);
		}	
	},
	
	shot: function(mess, isSelf) {
		target = new Mob().parse(mess.target);
		ACTIVE_MOB.shoot(target);
		hexagonGrid.animateShot(mess.shoter, target);
	},
	
	moveMob: function(mess) {
		mob = new Mob().parse(mess.mob);
		tile = new Tile().parse(mess.tile);
		mob.goToTile(tile);
	},
	
	showArmy: function(mess, isSelf) {
		if(isSelf) return;
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
	},
	
	synchronizeMobs: function(mess, isSelf) {
		if(isSelf) return;
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
 
