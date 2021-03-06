var Mob = function(player, Tile, name, type, speed, unitsize, attack, defense, damage_min, damage_max, hp, max_hp, shots, max_shots)
{
	this.Tile = Tile;
	this.name=name;
	this.hover='lorem ipsum';
	this.player=player;
	this.type=type;
	this.unitsize=unitsize;
	this.attack=attack;
	this.defense=defense;
	this.damage_min = damage_min;
	this.damage_max = damage_max;
	this.hp = hp;
	this.max_hp=max_hp;
	this.speed=speed;	
	this.shots=shots;
	this.max_shots=max_shots;

};
Mob.prototype.getImage = function() {
	var img=document.getElementById("Image_"+this.type+'_'+this.player);
	if(img!=undefined)
	return img;
	else return;
};

Mob.prototype.isAlive = function() {
	if(this.unitsize>0) return true;
	else return false;
};

Mob.prototype.isSurrounded = function() {
	var neighbours = getConnectedHexes(this.Tile);
	
	for(i=0; i<neighbours.length; i++) {
		for(j=0; j<MOBS.length; j++) {
			if(MOBS[j].player!=this.player && MOBS[j].Tile.getCoordinates()==neighbours[i].getCoordinates()
			&& MOBS[j].isAlive()) 
			return true;
		}
	}
	
	return false;
};
	
Mob.prototype.calculateBasicDmg = function(target) {
// http://heroes.thelazy.net/wiki/Damage
	if(!(this.unitsize>0)) return 0;
	var randomElement = Math.floor(Math.random()*(this.damage_max-this.damage_min+1)+this.damage_min);

	var param=0;
	var dmg=0;
	if(this.attack > target.defense)  param = 0.05;	
	else if (this.attack <target.defense) param = 0.025;

	var dmg = this.unitsize *  randomElement * (1+param*(this.attack-target.defense));
	return dmg;
};	
	
Mob.prototype.calculateMeleeDmg = function(target) {
	var dmg = this.calculateBasicDmg(target);
	if(this.max_shots>0) dmg=dmg*0.5;
	
	return dmg;
};	

Mob.prototype.calculateRangeDmg = function(target) {
	var dmg = this.calculateBasicDmg(target);
	var distance = hex_distance(this.column,this.row,target.column, target.row);
	if(distance>=10) dmg=dmg*0.5;

	// cover
	var potentialCovers = getConnectedHexes(target.Tile);
	console.log('potentialCovers:');
	console.log(potentialCovers);
	var minimumRange=999;
	var minimumCount=0;	
	for(tile of potentialCovers) {
		tile.distance = hex_distance(this.Tile.column,this.Tile.row,tile.column, tile.row);
		if(tile.distance<minimumRange) {
			minimumRange=tile.distance;
			minimumCount=1;
		}else if(tile.distance==minimumRange) minimumCount++;
	}
	console.log('minimumRange='+minimumRange);
	console.log('minimumcount='+minimumCount);
	
	var coverRatio=1;	
	for(tile of potentialCovers) {
		if((minimumCount==1 && tile.distance==minimumRange+1) ||
		(minimumCount==2 && tile.distance==minimumRange)) {
			if(checkTileVisibility(tile)==false) coverRatio+=0.25;
		}
	}
	dmg = dmg/coverRatio;
	
	console.log('zadano ze strzelania '+dmg+' przy coverRatio='+coverRatio);
	
	return dmg;
};	

Mob.prototype.shoot = function(target) {
	if(target==undefined) return;
	if(this.isSurrounded()==true) {
	alert('you cannot shot when you are surrounded by enemies!'); return;
	} else if(target.isSurrounded()==true) {
	alert('you cannot shot this target, because he is too close to your ally!'); return;
	}
	
	var dmg = this.calculateRangeDmg(target);
	target.payThePiper(dmg);

	selectNextMob(ACTIVE_MOB);
	ACTIVE_MOB.isWorking=false;			
			
}

Mob.prototype.payThePiper = function(dmg) {
	var tmp = this.unitsize;
	while(dmg > this.max_hp) {
		this.unitsize--;
		dmg-=this.max_hp;
	}
	 
	if(this.hp>dmg) 
	{
		this.hp-=dmg;
	} else {
		this.unitsize--;
		this.hp = this.hp + this.max_hp - dmg;		
	}
	
	if(this.unitsize<0) this.unitsize=0;	
	console.log(this.type + ' traci '+(tmp-this.unitsize)+' jednostek');
};
