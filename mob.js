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
	this._attack=attack;
	this._defense=defense;
	this.damage_min = damage_min;
	this._damage_min = damage_min;
	this.damage_max = damage_max;
	this._damage_max = damage_max;
	this.hp = hp;
	this.max_hp=max_hp;
	this.speed=speed;	
	this.max_speed=speed;	
	this.halfSpeed=Math.ceil(this.max_speed/2);	
	this.shots=shots;
	this.max_shots=max_shots;
	this.isFleeing = false;
	this.isReinforcemented = false;
	this.front = player==1 ? 3 : 9;
	this.hasMoved=false;
	this.hasFinishedTurn=false;

};



Mob.prototype.getFront = function() {
	return Raphael.rad(front*30) * this.front;
};

Mob.prototype.pivot = function(tile) {
		if(this.isPivotPossible()) {
			this.turnToHexagon(tile);
			this.speed -= this.halfSpeed;
			if(this.speed<0) this.speed=0;
			this.hasMoved=true;
			if(this.speed==0) {
				this.hasFinishedTurn=true; 
				selectNextMob(this);			
			}
			hexagonGrid.refreshHexGrid();			
			return;
		} 
};

Mob.prototype.isPivotPossible = function() {
	if(this.speed >= this.halfSpeed) return true;
	if(this.isReinforcemented) return true;
	
	return false;
}


Mob.prototype.goToTile = function(stepByStep, target) {
		this.isWorking=true;
		for(i=1; i<stepByStep.length; i++) {
		var isFinal= (i==stepByStep.length-1)?true:false;
		var param = {nextTile:stepByStep[i], mob:this, endstep:isFinal};
		
		setTimeout(function(param) {
			param.mob.turnToHexagon(param.nextTile);
			param.mob.Tile = param.nextTile;
			param.mob.speed--;
			param.mob.hasMoved=true;
			if(param.endstep) {
				param.mob.isWorking=false;
				if(target!=undefined && param.mob!=target && target.Tile.isNeighbour(param.mob.Tile)) { 
					param.mob.turnToHexagon(target.Tile);
					combat(param.mob, target);
					hexagonGrid.refreshHexGrid();					
					return;
				}
						
			}
			hexagonGrid.refreshHexGrid();
			}, i*150, param);	
		}
}

Mob.prototype.parse = function(newmob) {
	for(mob of MOBS) {
		if(newmob.name==mob.name) {
			mob.neighbours = getPossibleMoves(mob.speed, mob.Tile);
			return mob;
		}
	}
	return null;
}

Mob.prototype.getDescribe = function() {
	return this.type+this.Tile.getCoordinates();
}

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

Mob.prototype.isFleePossible = function(fromWhere) {
	return true;
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
	var randomElement = Math.floor(randomGenerator()*(this.damage_max-this.damage_min+1)+this.damage_min);

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
	if(this.shots==0) { 
		return 0;
	}
	var dmg = this.calculateBasicDmg(target);
	var distance = hex_distance(this.Tile,target.Tile);
	if(distance>=10) dmg=dmg*0.5;

	// cover
	var potentialCovers = getConnectedHexes(target.Tile);
	var minimumRange=999;
	var minimumCount=0;	
	for(tile of potentialCovers) {
		tile.distance = hex_distance(this.Tile,tile);
		if(tile.distance<minimumRange) {
			minimumRange=tile.distance;
			minimumCount=1;
		}else if(tile.distance==minimumRange) minimumCount++;
	}

	var coverRatio=1;	
	for(tile of potentialCovers) {
		if((minimumCount==1 && tile.distance==minimumRange+1) ||
		(minimumCount==2 && tile.distance==minimumRange)) {
			if(checkTileVisibility(tile)==false) coverRatio+=0.25;
		}
	}
	dmg = dmg/coverRatio;
	
	if(this.hasMoved==true) dmg = dmg*0.5;
	
	addMessage(this.getDescribe()+' shot to '+ target.getDescribe()+' and sustained '+Math.floor(dmg)+' dmg!', 'communicate');	
	
	return dmg;
};	

Mob.prototype.isShotPossible = function(target) {
	if(target==undefined) return false;
	
	if(this.speed < this.halfSpeed) return false;
	if(this.shots==0) return false;
	if(this.isSurrounded()) return false;
	
	target = new Mob().parse(target);
	if(target.isSurrounded()) return false;
	if(!this.checkLOS(target.Tile)) return false;
	
	return true;
}

Mob.prototype.checkLOS = function(target) {
	fov = this.FOV();	
	for(tile of fov) {
		if(tile.getCoordinates()==target.getCoordinates()) {
			return true;
		}
	}
	return false;
};

Mob.prototype.shoot = function(target) {
	if(this.shots==0) return;
	if(target==undefined) return;
	if(this.isSurrounded()==true) {
	alert('you cannot shot when you are surrounded by enemies!'); return;
	} else if(target.isSurrounded()==true) {
	alert('you cannot shot this target, because he is too close to your ally!'); return;
	}
	
	var dmg = this.calculateRangeDmg(target);
	target.payThePiper(dmg);
	this.shots--;
	this.hasFinishedTurn=true;
	this.isWorking=false;						
	selectNextMob(this);
}

Mob.prototype.standAndShot = function(target) {
	if(this.shots==0) return;
	var dmg = 0.5 * this.calculateRangeDmg(target);
	target.payThePiper(dmg);
	this.shots--;
	addMessage(this.getDescribe()+' decided to stand&shoot and sustained '+Math.floor(dmg)+' dmg!', 'communicate');	
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
	addMessage(this.getDescribe() +' lost '+(tmp-this.unitsize)+' troops');
};

    // turn player to a hexagon
Mob.prototype.turnToHexagon = function (h, callback) {
        var i = h.column, j = h.row, new_direction;
        
        if (this.Tile.column !== i || this.Tile.row !== j) {
            new_direction = this.directionFromAngle(DUELO.board.angle(
                [this.Tile.column, this.Tile.row], 
                [i, j]
            ));
            this.turn(new_direction, callback);
        }
};

Mob.prototype.directionFromAngle = function (a) {
        return Math.round(Raphael.deg(a) / 30) % 12;
};

Mob.prototype.turn = function (new_direction, callback) {
        var current_angle, delta, new_angle, time, transform_angle;
        current_angle = this.angle();

        new_angle = this.angleFromDirection(new_direction);
        delta = new_angle - this.angle();       
        
        transform_angle = (Math.abs(delta) > 180) ? 
                          (new_angle - 360 * delta / Math.abs(delta))
                          : new_angle;
        time = Math.abs(transform_angle - current_angle) * 2;
		this.front = new_direction;
};

    // angle player if facing
Mob.prototype.angle = function () {
        return this.angleFromDirection(this.front);
};
    
    // angle from a given direction
Mob.prototype.angleFromDirection = function (d) {
        return d * 30;
};

Mob.prototype.FOV = function() {
	var myPlayer = DUELO.player(this.Tile, this.front);

	fov = DUELO.board.FOV(myPlayer.getPos(), myPlayer.angleOfView());
	
	fovTiles = [];
	for(i=0; i<fov.length; i++) {
			tmpTile = new Tile(fov[i][0], fov[i][1]);
			if(tmpTile.row>=0 && tmpTile.row <MAX_ROW && tmpTile.column>=0 && tmpTile.column<MAX_COLUMN) 
			fovTiles.push(tmpTile); 
	}			
	return fovTiles;
};

Mob.prototype.tryReinforcement = function() {
		if(randomGenerator()*10 > HEROES[0].leadership) {
			if(this.isFleeing==false) return;
			
			var fleeDistance = Math.floor((randomGenerator() * (this.max_speed-1))+2);
			stepByStep = getPathToBattlefieldBorder(this.Tile, fleeDistance);			
			this.goToTile(stepByStep);
			this.isFleeing = true;	

			if(!isValidTile(stepByStep[stepByStep.length-1])) {
				addMessage(this.getDescribe()+' escaped from the battlefield!', 'communicate');	
				if(this.player==PLAYER_NAME) 
				$.growl.error({ title: 'Leadership test failed',
					message: this.getDescribe()+'\s unit escaped from the battlefield!'});
				else $.growl.notice({ title: 'Chickens', 
						message: this.getDescribe()+'\s unit escaped from the battlefield!' });			
						
				setTimeout(function(mob) {
					mob.unitsize=0;					
					hexagonGrid.refreshHexGrid();
				}, (fleeDistance+1)*150, this);							
			} else {			
				addMessage(this.getDescribe()+' is still fleeing!', 'communicate');	
				if(this.player==PLAYER_NAME) 
				$.growl.error({ title: 'Leadership test failed',
					message: this.getDescribe()+'\s unit is fleeing to the battlefield border'});
				else $.growl.notice({ title: 'Chickens', 
						message: this.getDescribe()+'\s unit is fleeing to the battlefield border' });
			}						
		} else {		
			this.isFleeing=false;				
			this.isReinforcemented=true;
			this.speed=0;
			addMessage(this.getDescribe()+' reinforcemented.', 'communicate');	
			hexagonGrid.refreshHexGrid();	

			if(this.player==PLAYER_NAME) $.growl.notice({ title: this.getDescribe()+' reinforcemented.', message: "You can turn it now." });
			else $.growl.warning({ message: this.getDescribe()+' reinforcemented.' });
		}
};