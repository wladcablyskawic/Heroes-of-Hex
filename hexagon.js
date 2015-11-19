// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

var MAX_COLUMN;
var MAX_ROW;

var OBSTACLES = [];
var MOBS = [];
var ACTIVE_MOB;

var firstPlayerMobs = []	


HexagonGrid.prototype.addObstacle = function(column, row, name, hover, isBlockingLoS, isBlockingMovement) 
{
	OBSTACLES.push(new Obstacle(new Tile(column, row), name, hover, isBlockingLoS, isBlockingMovement));
}

HexagonGrid.prototype.addMob = function(player, type, column, row, name, unitsize) 
{
	var mob;
	if(type=='Goblin') mob = createGoblin(player, new Tile(column, row), name, unitsize);
	else if(type=='Orc') mob = createOrc(player, new Tile(column, row), name, unitsize);
	else if(type=='Troll') mob = createTroll(player, new Tile(column, row), name, unitsize);
	else if(type=='Pikeman') mob = createPikeman(player, new Tile(column, row), name, unitsize);
	else if(type=='Archer') mob = createArcher(player, new Tile(column, row), name, unitsize);
	else if(type=='Swordsman') mob = createSwordsman(player, new Tile(column, row), name, unitsize);
				
	MOBS.push(mob);
	if(mob.player=='1') firstPlayerMobs.push(mob);
}

HexagonGrid.prototype.selectMob = function(name) 
{
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].name==name) ACTIVE_MOB = MOBS[i];
	}
}

var Obstacle = function(Tile, name, hover, blockingLoS, blockingMovement)
{
	this.Tile=Tile;
	this.name=name;
	this.hover=hover;
	this.blockingLoS = blockingLoS;
	this.blockingMovement=blockingMovement;
}

Obstacle.prototype.getColor = function()
{
	if(this.blockingLoS==true && this.blockingMovement==true) return 'black'; // mountains
	else if(this.blockingLoS==true && this.blockingMovement==false) return 'green'; // forest
	else if (this.blockingLoS==false && this.blockingMovement==true) return 'blue'; // lake
	else return 'pink';
}


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
	
/*	if(this.unitsize==0) {
		for(i=0; i<MOBS.length; i++) {
		
		if(MOBS[i]==this) { 
		MOBS.splice(i, 1); break ; }
		}
	}*/

};


var Tile = function(column, row, name)
{
	this.column=column;
	this.row=row;
};

Tile.prototype.getCoordinates = function() {
	return '['+this.column+','+this.row+']';
};


function HexagonGrid(canvasId, radius, rows, cols) {
	MAX_COLUMN=cols;
	MAX_ROW=rows;
	
    this.radius = radius;

    this.height = Math.sqrt(3) * radius;
    this.width = 2 * radius;
    this.side = (3 / 2) * radius;

    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.canvasOriginX = 0;
    this.canvasOriginY = 0;
    
    this.canvas.addEventListener("mousedown", this.clickEvent.bind(this), false);
    this.canvas.addEventListener("mousemove", this.hoverEvent.bind(this), false);
    this.canvas.addEventListener("contextmenu", this.contextMenuEvent.bind(this), false);	

	initAStar(rows, cols);	
	};

 
 
HexagonGrid.prototype.drawHexGrid = function (originX, originY, isDebug) {

	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvasOriginX = originX;
    this.canvasOriginY = originY;
    
	
    var currentHexX;
    var currentHexY;
    var debugText = "";
	
	var message = "";	

    var offsetColumn = false;

    for (var col = 0; col < MAX_COLUMN; col++) {
        for (var row = 0; row < MAX_ROW; row++) {

            if (!offsetColumn) {
                currentHexX = (col * this.side) + originX;
                currentHexY = (row * this.height) + originY;
            } else {
                currentHexX = col * this.side + originX;
                currentHexY = (row * this.height) + originY + (this.height * 0.5);
            }

            if (isDebug) {
                debugText = '['+col + "," + row+']' + 	hex_distance(ACTIVE_MOB.Tile.column, ACTIVE_MOB.Tile.row,col,row);
            }

            this.drawHex(currentHexX, currentHexY, "#ddd", debugText);
        }
        offsetColumn = !offsetColumn;
    }	
	
	for(var i=0; i<OBSTACLES.length; i++) {
		this.drawHexAtColRow(OBSTACLES[i].Tile.column, OBSTACLES[i].Tile.row, OBSTACLES[i].getColor(), OBSTACLES[i].name);
	}

			
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].player==PLAYER_NAME && MOBS[i].isAlive()) 
			this.drawHexAtColRow(MOBS[i].Tile.column, MOBS[i].Tile.row,'yellow', '['+MOBS[i].unitsize+']', MOBS[i].getImage());
		else if(MOBS[i].player!=PLAYER_NAME && MOBS[i].isAlive()) 
			this.drawHexAtColRow(MOBS[i].Tile.column, MOBS[i].Tile.row,'red', '['+MOBS[i].unitsize+']', MOBS[i].getImage());
	 }
	


	if(ACTIVE_MOB != null && PLAYER_NAME==ACTIVE_MOB.player) 
	{
		if(ACTIVE_MOB.isWorking!=true) {
			ACTIVE_MOB.neighbours = getPossibleMoves(ACTIVE_MOB.speed, ACTIVE_MOB.Tile);
			for(neighbour of ACTIVE_MOB.neighbours) {
			hexagonGrid.drawHexAtColRow(neighbour.column, neighbour.row, 'rgba(165,43,43,0.3)',  //'');
			neighbour.getCoordinates()+ hex_distance(ACTIVE_MOB.Tile.column, ACTIVE_MOB.Tile.row,neighbour.column, neighbour.row));
			};
		}
		
		hexagonGrid.highlightHex('red', ACTIVE_MOB.Tile);
	}
	
};
 function writeMessage(context, message){
	console.log(message);
	context.fillText(message, 10, 25);
 }


HexagonGrid.prototype.drawHexAtColRow = function(column, row, color, debugText, img) {
    var drawx = (column * this.side) + this.canvasOriginX;
    var drawy = column % 2 == 0 ? (row * this.height) + this.canvasOriginY : (row * this.height) + this.canvasOriginY + (this.height / 2);


    this.drawHex(drawx, drawy, color, debugText, img);
};

function pDistance(x, y, x1, y1, x2, y2) {

  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
};

HexagonGrid.prototype.calculateAttackVector = function(mousex, mousey, Tile) {
    var x0 = (Tile.column * this.side) + this.canvasOriginX;
    var y0 = Tile.column % 2 == 0 ? (Tile.row * this.height) + this.canvasOriginY : (Tile.row * this.height) + this.canvasOriginY + (this.height / 2);
    var x1 = x0 + this.width - this.side;
	var y1=	y0;
    var x2 = x0 + this.side
	var y2 = y0;
	var distanceN = pDistance(mousex, mousey, x1, y1, x2, y2);	

	x1=x2;
	y1=y2;
	x2=x0+this.width;
	y2=y0+(this.height / 2);	
	var distanceNE = pDistance(mousex, mousey, x1, y1, x2, y2);
		
	x1=x2;
	y1=y2;
	x2=x0+this.side;
	y2=y0+this.height;
	var distanceSE = pDistance(mousex, mousey, x1, y1, x2, y2);
	
	x1=x2;
	y1=y2;
	x2=x0+this.width-this.side;
	y2=y0+this.height;
	var distanceS = pDistance(mousex, mousey, x1, y1, x2, y2);

	x1=x2;
	y1=y2;
	x2=x0;
	y2=y0+(this.height/2);
	var distanceSW = pDistance(mousex, mousey, x1, y1, x2, y2);

	x1=x2;
	y1=y2;
	x2=x0 + this.width - this.side;
	y2=y0;
	var distanceNW = pDistance(mousex, mousey, x1, y1, x2, y2);
	
	var shortest=distanceN;
	var answer='n';
	if(distanceNE-shortest<0) { shortest=distanceNE; answer='ne'; }
	if(distanceSE-shortest<0) { shortest=distanceSE; answer='se'; }
	if(distanceS-shortest<0) { shortest=distanceS; answer='s'; }
	if(distanceSW-shortest<0) { shortest=distanceSW; answer='sw'; }
	if(distanceNW-shortest<0) { shortest=distanceNW; answer='nw'; }
	
	return answer;
};




HexagonGrid.prototype.drawHex = function(x0, y0, fillColor, debugText, image) {
    this.context.strokeStyle = "#000";
	this.context.lineWidth=1;
	
    this.context.beginPath();
	this.drawOddQHex(x0,y0);
		

    if (fillColor) {
        this.context.fillStyle = fillColor;
        this.context.fill();
    }

    this.context.closePath();
    this.context.stroke();

    if (debugText) {
        this.context.font = "6px";
        this.context.fillStyle = "#000";
        this.context.fillText(debugText, x0 + (this.width * 0.7) - (this.width/3), y0 + (this.height * 0.9));
    }
	
	if(image) {
		this.context.drawImage(image,x0+(this.width / 5),y0 + this.height*0.05, this.radius*1.25, this.radius*1.25);
	}
};

HexagonGrid.prototype.drawOddQHex = function(x0, y0) {
    this.context.moveTo(x0 + this.width - this.side, y0);
    this.context.lineTo(x0 + this.side, y0);
    this.context.lineTo(x0 + this.width, y0 + (this.height / 2));
    this.context.lineTo(x0 + this.side, y0 + this.height);
    this.context.lineTo(x0 + this.width - this.side, y0 + this.height);
    this.context.lineTo(x0, y0 + (this.height / 2));
};


HexagonGrid.prototype.highlightHex = function(color, Tile) {
    var y0 = Tile.column % 2 == 0 ? (Tile.row * this.height) + this.canvasOriginY : (Tile.row * this.height) + this.canvasOriginY + (this.height / 2);
    var x0 = (Tile.column * this.side) + this.canvasOriginX;
	
    this.context.strokeStyle = color;
	this.context.lineWidth=5;
    this.context.beginPath();
	this.drawOddQHex(x0,y0);
    this.context.closePath();
    this.context.stroke();	
};

//Recusivly step up to the body to calculate canvas offset.
HexagonGrid.prototype.getRelativeCanvasOffset = function() {
	var x = 0, y = 0;
	var layoutElement = this.canvas;
    if (layoutElement.offsetParent) {
        do {
            x += layoutElement.offsetLeft;
            y += layoutElement.offsetTop;
        } while (layoutElement = layoutElement.offsetParent);
        
        return { x: x, y: y };
    }
}

//Uses a grid overlay algorithm to determine hexagon location
//Left edge of grid has a test to acuratly determin correct hex
HexagonGrid.prototype.getSelectedTile = function(mouseX, mouseY) {

	var offSet = this.getRelativeCanvasOffset();

    mouseX -= offSet.x;
    mouseY -= offSet.y;

    var column = Math.floor((mouseX) / this.side);
    var row = Math.floor(
        column % 2 == 0
            ? Math.floor((mouseY) / this.height)
            : Math.floor(((mouseY + (this.height * 0.5)) / this.height)) - 1);


    //Test if on left side of frame            
    if (mouseX > (column * this.side) && mouseX < (column * this.side) + this.width - this.side) {


        //Now test which of the two triangles we are in 
        //Top left triangle points
        var p1 = new Object();
        p1.x = column * this.side;
        p1.y = column % 2 == 0
            ? row * this.height
            : (row * this.height) + (this.height / 2);

        var p2 = new Object();
        p2.x = p1.x;
        p2.y = p1.y + (this.height / 2);

        var p3 = new Object();
        p3.x = p1.x + this.width - this.side;
        p3.y = p1.y;

        var mousePoint = new Object();
        mousePoint.x = mouseX;
        mousePoint.y = mouseY;

        if (this.isPointInTriangle(mousePoint, p1, p2, p3)) {
            column--;

            if (column % 2 != 0) {
                row--;
            }
        }

        //Bottom left triangle points
        var p4 = new Object();
        p4 = p2;

        var p5 = new Object();
        p5.x = p4.x;
        p5.y = p4.y + (this.height / 2);

        var p6 = new Object();
        p6.x = p5.x + (this.width - this.side);
        p6.y = p5.y;

        if (this.isPointInTriangle(mousePoint, p4, p5, p6)) {
            column--;

            if (column % 2 == 0) {
                row++;
            }
        }
    }

    return  new Tile(column, row); 
};



HexagonGrid.prototype.sign = function(p1, p2, p3) {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

//TODO: Replace with optimized barycentric coordinate method
HexagonGrid.prototype.isPointInTriangle = function isPointInTriangle(pt, v1, v2, v3) {
    var b1, b2, b3;

    b1 = this.sign(pt, v1, v2) < 0.0;
    b2 = this.sign(pt, v2, v3) < 0.0;
    b3 = this.sign(pt, v3, v1) < 0.0;

    return ((b1 == b2) && (b2 == b3));
};

HexagonGrid.prototype.isChargePossible = function(offensive, target) {
	var potentialFields = getNeighbours(target.Tile);
	var moves = getPossibleMoves(offensive.speed, offensive.Tile);
		
	for(var i=0; i<moves.length; i++) {
		for(var j=0; j<potentialFields.length; j++)
		if(moves[i].getCoordinates()==potentialFields[j].getCoordinates()
		&& checkLineOfSight(offensive.Tile, moves[i])) 
			return true;
	}
	

	return false;
};

HexagonGrid.prototype.recalculateChargeClick = function(Tile) {
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].isAlive()==false) continue;
		if(MOBS[i].Tile.getCoordinates()==Tile.getCoordinates()	&& MOBS[i].player!=PLAYER_NAME) {

			var vector = this.canvas.style.cursor.split('-')[0];
			switch(vector) {
				case 'n':
					Tile.row--;
				break;
				case 'ne':
					Tile.column++;
					if(Tile.column%2==1) Tile.row--;
				break;
				case 'se':
					Tile.column++;
					if(Tile.column%2==0) Tile.row++;	
				break;
				case 's':
					Tile.row++;
				break;
				case 'sw':
					Tile.column--;
					if(Tile.column%2==0) Tile.row++;	
				break;
				case 'nw':
					Tile.column--;
					if(Tile.column%2==1) Tile.row--;
				break;			
			}			
		}		
	}			
}


HexagonGrid.prototype.hoverEvent = function (e) {
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;
	
    var Tile = this.getSelectedTile(localX, localY);

	
	
	for(var i=0; i<OBSTACLES.length; i++) {
		if(Tile.getCoordinates()==OBSTACLES[i].Tile.getCoordinates()) {
			message = OBSTACLES[i].hover;
			writeMessage(this.context, message);
			return;
		}
	}
	
	for(var i=0; i<MOBS.length; i++) {
		if(Tile.getCoordinates()==MOBS[i].Tile.getCoordinates() && MOBS[i].player!=PLAYER_NAME && MOBS[i].isAlive()==true) {
			if(checkLineOfSight(ACTIVE_MOB.Tile, MOBS[i].Tile)) {
				if(hexagonGrid.isChargePossible(ACTIVE_MOB, MOBS[i])) {
					var attackDirection=this.calculateAttackVector(mouseX, mouseY, MOBS[i].Tile);
					this.canvas.style.cursor = attackDirection+'-resize';	  			
				} else this.canvas.style.cursor = 'crosshair';	
				
			}
			
		
		  message = MOBS[i].hover;				
   		  writeMessage(this.context, message);
 		  return;
		}
	}
	message='';
	writeMessage(this.context, message);
	this.canvas.style.cursor = "default";		
};


HexagonGrid.prototype.clickEvent = function (e) {
	if(ACTIVE_MOB.player != PLAYER_NAME) return;
	if(e.which != 1) return; // just left click
	
	if(ACTIVE_MOB.isWorking==true) return;
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;
	
    var Tile = this.getSelectedTile(localX, localY);

	var target;
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].isAlive() && MOBS[i].Tile.getCoordinates()==Tile.getCoordinates()	&& MOBS[i].player!=PLAYER_NAME)
		target=MOBS[i];
	}

		
	this.recalculateChargeClick(Tile);
	

	
	

	if(isValidTile(Tile) && isContained(Tile, ACTIVE_MOB.neighbours))
	{
	
		if(ACTIVE_MOB.isSurrounded() && Tile.getCoordinates() != ACTIVE_MOB.Tile.getCoordinates()) 
		{
			alert('you cannot just go, you are fighting, lol');
			return;
		}
	
		ACTIVE_MOB.isWorking=true;
		var stepByStep = path(ACTIVE_MOB.Tile.row,ACTIVE_MOB.Tile.column, Tile.row, Tile.column);
		for(i=1; i<stepByStep.length; i++) {

			var param = {hexagon:this, tile:stepByStep[i]};
		
		setTimeout(function(param) {
			ACTIVE_MOB.Tile = param.tile;			
			if(ACTIVE_MOB.Tile.getCoordinates()==Tile.getCoordinates()) {
				if(target!=undefined) combat(ACTIVE_MOB, target)
				selectNextMob(ACTIVE_MOB);
			}
			param.hexagon.refreshHexGrid();
			}, i*150, param);	
		}	
	} else if(Tile.getCoordinates() == ACTIVE_MOB.Tile.getCoordinates()) {
		if(target!=undefined) combat(ACTIVE_MOB, target)
		selectNextMob(ACTIVE_MOB);
	}	
	else {
		var cursor = this.canvas.style.cursor;
		if(cursor=='crosshair') {
		
			ACTIVE_MOB.shoot(target);
		}
	}
	this.canvas.style.cursor = "default";
	this.refreshHexGrid();
};

function combat(attacker, target) {
	
		if(target!=undefined) {
			var dmg = attacker.calculateMeleeDmg(target);
			target.payThePiper(dmg);
			if(target.unitsize>0) { 
				dmg = target.calculateMeleeDmg(attacker);
				attacker.payThePiper(dmg);
			}
		}
}


HexagonGrid.prototype.refreshHexGrid = function()
{

	this.drawHexGrid(this.canvasOriginX, this.canvasOriginY,  false);    
}

function selectNextMob(warrior)
{
	warrior.isWorking=false;
	
	for(i=0; i<MOBS.length; i++) 
	{
		if(ACTIVE_MOB.name==MOBS[i].name) 
		{
			if(i<MOBS.length-1) 
			{ 
				ACTIVE_MOB=MOBS[i+1]; 
				break;
			}
			else {
				ACTIVE_MOB=MOBS[0]; 
				break;
			}
			
		}
	}
	
	if(ACTIVE_MOB.isAlive()==false) selectNextMob(ACTIVE_MOB);
	
	sendGameState();
}

	
HexagonGrid.prototype.contextMenuEvent = function (e) {
		alert('click');
		e.preventDefault();
		return false;
};

function getConnectedHexes(tile) {
		potentialNeighbours = [];
		potentialNeighbours.push(new Tile(tile.column, tile.row-1));
		potentialNeighbours.push(new Tile(tile.column, tile.row+1));
		potentialNeighbours.push(new Tile(tile.column-1, tile.row));
		potentialNeighbours.push(new Tile(tile.column+1, tile.row));

		if(tile.column%2==0) {	
			potentialNeighbours.push(new Tile(tile.column-1, tile.row-1));
			potentialNeighbours.push(new Tile(tile.column+1, tile.row-1));
		} else {
			potentialNeighbours.push(new Tile(tile.column-1, tile.row+1));
			potentialNeighbours.push(new Tile(tile.column+1, tile.row+1));
		}
		return potentialNeighbours;
}

function getNeighbours(tile) {
var neighbours = [ ];

		potentialNeighbours = getConnectedHexes(tile);
		
		for(newTile of potentialNeighbours) {
			if(isValidTile(newTile))
				neighbours.push(newTile);							
		}
	
	if(isValidTile(tile) && !isContained(tile, neighbours)) 
		neighbours.push(tile); 
	

	return neighbours;
};

function getPossibleMoves(range, tile) {
var visited = new Set();
var coordinates = new Set();
visited.add(tile);
var fringes = new Array(range);
for(i=0; i<=range; i++) fringes[i] = new Array();
fringes[0]=[tile];


	for(i=1; i<=range; i++) {
		for(t of fringes[i-1]) {
			var neighbours = getNeighbours(t);
			for(n of neighbours) {
				if(isValidTile(n) && !coordinates.has(n.getCoordinates())) {
					visited.add(n);
					coordinates.add(n.getCoordinates());
					fringes[i].push(n);
				}
			}
		
		}
	}
	visited.delete(tile);
	return Array.from(visited);
}

function isContained(tile, neighbours)
{
	for(var i=0; i<neighbours.length; i++) {
	
		if(neighbours[i].getCoordinates()==tile.getCoordinates()) return true;
	}
	return false;
}

function isValidTile(tile) {
	if(tile.row>=0 && tile.row <MAX_ROW && tile.column>=0 && tile.column<MAX_COLUMN) {

	for(var i=0; i<OBSTACLES.length; i++) {
		if(OBSTACLES[i].Tile.getCoordinates()==tile.getCoordinates()
		&& OBSTACLES[i].blockingMovement==true) return false;
	}
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].Tile.getCoordinates()==tile.getCoordinates() && MOBS[i].isAlive()) return false;
	}

		return true;
	}	
	return false;
};
