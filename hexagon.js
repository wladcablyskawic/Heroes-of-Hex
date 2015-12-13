// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

var MAX_COLUMN;
var MAX_ROW;

var OBSTACLES = [];
var MOBS = [];
var HEROES = [];
var ACTIVE_MOB;

var DEPLOYMENT=true;
var MAGIC_PHASE = false;
var drag=false;

HexagonGrid.prototype.addHero = function(player, type, castingDice, dispelDice, leadership) {
	HEROES.push(new Hero(player, type, castingDice, dispelDice, leadership));
}

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
}

HexagonGrid.prototype.selectMob = function(name) 
{
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].name==name) ACTIVE_MOB = MOBS[i];
	}
}

var Tile = function(column, row)
{
	this.column=column;
	this.row=row;
};

Tile.prototype.parse = function(tile) {
	var newTile = new Tile(tile.column, tile.row);
	return newTile;
}

Tile.prototype.getCoordinates = function() {
	return '['+this.column+','+this.row+']';
};

Tile.prototype.isNeighbour = function(tile) {
	if(this.column == tile.column && this.row==tile.row-1) return true;
	if(this.column == tile.column && this.row==tile.row+1) return true;
	if(this.column == tile.column-1 && this.row==tile.row) return true;
	if(this.column == tile.column+1 && this.row==tile.row) return true;
	if(this.column%2==1) {
		if(this.column == tile.column-1 && this.row==tile.row-1) return true;
		if(this.column == tile.column+1 && this.row==tile.row-1) return true;
	
	} else {
		if(this.column == tile.column-1 && this.row==tile.row+1) return true;
		if(this.column == tile.column+1 && this.row==tile.row+1) return true
	}
	
	return false;
};

Tile.prototype.isFarFromEnemy = function() {
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].isAlive() && MOBS[i].Tile.isNeighbour(this)	&& MOBS[i].player!=PLAYER_NAME) return false;
	}	
	return true;
	
};

function HexagonGrid(canvasId, radius, rows, cols) {
	
	MAX_COLUMN=cols;
	MAX_ROW=rows;
	HEX_RADIUS = radius;
	
    this.radius = radius;

    this.height = Math.sqrt(3) * radius;
    this.width = 2 * radius;
    this.side = (3 / 2) * radius;

    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.canvasOriginX = 0;
    this.canvasOriginY = 0;
    
    this.canvas.addEventListener("mousedown", this.clickEvent.bind(this), false);
    this.canvas.addEventListener("mouseup", this.upEvent.bind(this), false);
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
                debugText = '['+col + "," + row+']' + 	hex_distance(ACTIVE_MOB.Tile, new Tile(col,row));
            }

            this.drawHex(currentHexX, currentHexY, "#ddd", debugText);
        }
        offsetColumn = !offsetColumn;
    }	
	
	if(DEPLOYMENT==true) {
		deploymentZone = getDeploymentZone();
		for(zone of deploymentZone) {
			hexagonGrid.drawHexAtColRow(zone.column, zone.row, 'rgba(165,43,43,0.3)',  //'');
			zone.getCoordinates());
		}	
	}
	
	for(var i=0; i<OBSTACLES.length; i++) {
		this.drawHexAtColRow(OBSTACLES[i].Tile.column, OBSTACLES[i].Tile.row, OBSTACLES[i].getColor(), '');
	}

			
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].player==PLAYER_NAME && MOBS[i].isAlive() && MOBS[i].isDragged!=true) 
			this.drawHexAtColRow(MOBS[i].Tile.column, MOBS[i].Tile.row,'yellow', '['+MOBS[i].unitsize+']', MOBS[i].getImage(), MOBS[i].front);
		else if(MOBS[i].player!=PLAYER_NAME && MOBS[i].isAlive() && DEPLOYMENT==false) 
			this.drawHexAtColRow(MOBS[i].Tile.column, MOBS[i].Tile.row,'red', '['+MOBS[i].unitsize+']', MOBS[i].getImage(), MOBS[i].front);
	 }
	


	if(ACTIVE_MOB != null  && PLAYER_NAME==ACTIVE_MOB.player && DEPLOYMENT==false && MAGIC_PHASE==false && ACTIVE_MOB.hasFinishedTurn==false) 
	{
		ACTIVE_MOB.neighbours = getPossibleMoves(ACTIVE_MOB.speed, ACTIVE_MOB.Tile);	
		if(ACTIVE_MOB.isWorking!=true && !ACTIVE_MOB.isSurrounded() && $( ":checkbox[name='MovementSettings']" )[0].checked) {
			for(neighbour of ACTIVE_MOB.neighbours) {
			
			
			var hex_color = 'rgba(165,43,43,0.3)';
			if(hex_distance(ACTIVE_MOB.Tile,neighbour) <= Math.floor(ACTIVE_MOB.max_speed/2)) hex_color = 'rgba(165,43,43,0.5)';
			hexagonGrid.drawHexAtColRow(neighbour.column, neighbour.row, hex_color,  //'');
			neighbour.getCoordinates());
			};
		}
		
		hexagonGrid.highlightHex('red', ACTIVE_MOB.Tile);

	
		if($( ":checkbox[name='FOVSettings']" )[0].checked) {
			fov = ACTIVE_MOB.FOV();
			
			for(i=0; i<fov.length; i++) {
				hexagonGrid.drawHexAtColRow(fov[i].column, fov[i].row, 'rgba(165,143,43,0.3)',  '');				
			}		
		}
	}
	
};

function getDeploymentZone() {
	var deployment_width = 3;
	
	var start_row = 0;
	var end_row=start_row+deployment_width;	
	var start_column = 0;
	var end_column = MAX_COLUMN;
	
	if(PLAYER_NAME=='2') {
		start_row = MAX_ROW - deployment_width;
		end_row = MAX_ROW;
	}
	
	zone = [];
	
	for(i=start_column; i<end_column; i++) {
		for(j=start_row; j<end_row; j++) {
			zone.push(new Tile(i,j));
		}
	}
	
	return zone;
};

function isInDeploymentZone(tile) {
	var deploymentZone = getDeploymentZone();
	
	for(zone of deploymentZone) {
		if(tile.getCoordinates()==zone.getCoordinates()) return true;
	}
	return false;
};

HexagonGrid.prototype.drawHexAtColRow = function(column, row, color, debugText, img, front) {
    var drawx = (column * this.side) + this.canvasOriginX;
    var drawy = column % 2 == 0 ? (row * this.height) + this.canvasOriginY : (row * this.height) + this.canvasOriginY + (this.height / 2);

    this.drawHex(drawx, drawy, color, debugText, img, front);
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

HexagonGrid.prototype.calculateAttackVector = function(mousex, mousey, tile) {
    var x0 = (tile.column * this.side) + this.canvasOriginX;
    var y0 = tile.column % 2 == 0 ? (tile.row * this.height) + this.canvasOriginY : (tile.row * this.height) + this.canvasOriginY + (this.height / 2);
    var x1 = x0 + this.width - this.side;
	var y1=	y0;
    var x2 = x0 + this.side
	var y2 = y0;
	var distanceN = pDistance(mousex, mousey, x1, y1, x2, y2);	
	var nNeighbour = new Tile(tile.column, tile.row-1);
	if(!isValidTile(nNeighbour)) distanceN=999;
	
	x1=x2;
	y1=y2;
	x2=x0+this.width;
	y2=y0+(this.height / 2);	
	var distanceNE = pDistance(mousex, mousey, x1, y1, x2, y2);
	var neNeighbour = tile.column%2==0? new Tile(tile.column+1, tile.row-1) : new Tile(tile.column+1, tile.row);
	if(!isValidTile(neNeighbour)) distanceNE=999;

	
	x1=x2;
	y1=y2;
	x2=x0+this.side;
	y2=y0+this.height;
	var distanceSE = pDistance(mousex, mousey, x1, y1, x2, y2);
	var seNeighbour = tile.column%2==0? new Tile(tile.column+1, tile.row) : new Tile(tile.column+1, tile.row+1);
	if(!isValidTile(seNeighbour)) distanceSE=999;
	
	
	x1=x2;
	y1=y2;
	x2=x0+this.width-this.side;
	y2=y0+this.height;
	var distanceS = pDistance(mousex, mousey, x1, y1, x2, y2);
	var sNeighbour = new Tile(tile.column, tile.row+1);
	if(!isValidTile(sNeighbour)) distanceS=999;

	
	x1=x2;
	y1=y2;
	x2=x0;
	y2=y0+(this.height/2);
	var distanceSW = pDistance(mousex, mousey, x1, y1, x2, y2);
	var swNeighbour = tile.column%2==0? new Tile(tile.column-1, tile.row) : new Tile(tile.column-1, tile.row+1);
	if(!isValidTile(swNeighbour)) distanceSW=999;

	x1=x2;
	y1=y2;
	x2=x0 + this.width - this.side;
	y2=y0;
	var distanceNW = pDistance(mousex, mousey, x1, y1, x2, y2);
	var nwNeighbour = tile.column%2==0? new Tile(tile.column-1, tile.row-1) : new Tile(tile.column-1, tile.row);
	if(!isValidTile(nwNeighbour)) distanceNW=999;

	
	var shortest=distanceN;
	var answer='n';
	if(distanceNE-shortest<0) { shortest=distanceNE; answer='ne'; }
	if(distanceSE-shortest<0) { shortest=distanceSE; answer='se'; }
	if(distanceS-shortest<0) { shortest=distanceS; answer='s'; }
	if(distanceSW-shortest<0) { shortest=distanceSW; answer='sw'; }
	if(distanceNW-shortest<0) { shortest=distanceNW; answer='nw'; }
	
	return answer;
};




HexagonGrid.prototype.drawHex = function(x0, y0, fillColor, debugText, image, front) {
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

	
	if(front!=undefined) {
		front = Raphael.rad(front*30);
		this.context.fillStyle = "#999900";
		this.context.beginPath();
		this.context.arc(x0 + (this.width / 2),y0 + (this.height / 2), this.side/2, front - Raphael.rad(45), front + Raphael.rad(45), false); 
		this.context.closePath();
		this.context.fill();
			
	}
	
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

    return new Tile(column, row); 
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
	if(offensive.hasMoved) return false;
	if(offensive.Tile.isNeighbour(target.Tile)) return true;

	var potentialFields = getNeighbours(target.Tile);
	var moves = getPossibleMoves(offensive.speed, offensive.Tile);
		
	for(var i=0; i<moves.length; i++) {
		for(var j=0; j<potentialFields.length; j++)
		if(moves[i].getCoordinates()==potentialFields[j].getCoordinates()
		&& offensive.checkLOS(moves[i])) 
			return true;
	}
	

	return false;
};

HexagonGrid.prototype.recalculateChargeClick = function(Tile) {
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].isAlive()==false) continue;
		if(MOBS[i].Tile.getCoordinates()==Tile.getCoordinates()	&& MOBS[i].player!=PLAYER_NAME) {
		
			if(MOBS[i].Tile.isNeighbour(ACTIVE_MOB.Tile)) {
				Tile.column=ACTIVE_MOB.Tile.column;
				Tile.row=ACTIVE_MOB.Tile.row;				
				return;
			}

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
    var localY = mouseY- this.canvasOriginY;
	
    var tile = this.getSelectedTile(localX, localY);

	if(drag!=undefined && drag==true) {
		this.refreshHexGrid();
		this.drawHex(e.pageX-HEX_RADIUS, e.pageY-HEX_RADIUS, 'yellow', '['+draggedMob.unitsize+']', draggedMob.getImage());
		return;
	}
	
	for(var i=0; i<MOBS.length; i++) {
		if(tile.getCoordinates()==MOBS[i].Tile.getCoordinates() && MOBS[i].isAlive()==true) {
		
		if(MAGIC_PHASE==true) {
				var spell = new Spell(RollManager.getSpellName());
				if(spell.validateTarget(MOBS[i]))
					this.canvas.style.cursor = 'all-scroll';	  			
				
				return;
			}
		
			if(ACTIVE_MOB.checkLOS(MOBS[i].Tile) && MOBS[i].player!=PLAYER_NAME) {
			if(ACTIVE_MOB.isShotPossible(MOBS[i])) this.canvas.style.cursor = 'crosshair';	
			else if(hexagonGrid.isChargePossible(ACTIVE_MOB, MOBS[i])) {
					var attackDirection=this.calculateAttackVector(mouseX, mouseY, MOBS[i].Tile);
					this.canvas.style.cursor = attackDirection+'-resize';	  			
				} 
				
			}
 		  return;
		}
	}
	this.canvas.style.cursor = "default";		
};
HexagonGrid.prototype.upEvent = function (e) {
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;
	
    var tile = this.getSelectedTile(localX, localY);
	
	if(drag==true) {
		draggedMob.isDragged=false;
		if(isValidTile(tile) && isInDeploymentZone(tile)) {
		draggedMob.Tile=tile;
		} else alert('You cannot deploy an unit outside your deployment zone');
				
		this.refreshHexGrid();
	}
	drag=false;
};

HexagonGrid.prototype.clickEvent = function (e) {
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;
	
    var tile = this.getSelectedTile(localX, localY);

	if(DEPLOYMENT==true) {
		for(mob of MOBS) {
			if(mob.Tile.getCoordinates() == tile.getCoordinates()) {
				drag = true;
				draggedMob = mob;
				mob.isDragged=true;
			}		
		}

		return;
	}

	if(ACTIVE_MOB.player != PLAYER_NAME) return;
	if(e.which != 1) return; // just left click
	
	var target;
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].isAlive() && MOBS[i].Tile.getCoordinates()==tile.getCoordinates())
		target=MOBS[i];
	}	

	
	if(MAGIC_PHASE==true) {
		var spell = new Spell(RollManager.getSpellName());

		if(spell.validateTarget(target)) {
			MAGIC_PHASE=false;
			sendSpell(spell.name, target)
			hexagonGrid.refreshHexGrid();			
		}			
		return; 
	}
		
	if(target!=undefined && target.player==PLAYER_NAME) {
		if(target.hasFinishedTurn==false) {
			ACTIVE_MOB=target;
			hexagonGrid.refreshHexGrid();					
			return;
		} else {
			target=undefined;
		}
	}
	
	if(ACTIVE_MOB.isWorking==true) return;

    if (e.shiftKey) {
		pivotMob(ACTIVE_MOB, tile); 
		return;		
    }	

		
	this.recalculateChargeClick(tile);

	if(ACTIVE_MOB.isSurrounded()==false && target!=undefined && tile!=ACTIVE_MOB.Tile && !ACTIVE_MOB.isShotPossible(target)
	&& target.isSurrounded()==false && isValidTile(tile)) {
		sendChargeDeclaration(ACTIVE_MOB, target, tile);
		return;
	}

	
	if(isValidTile(tile) && isContained(tile, ACTIVE_MOB.neighbours))
	{
	
		if(ACTIVE_MOB.isSurrounded() && tile.getCoordinates() != ACTIVE_MOB.Tile.getCoordinates()) 
		{
			alert('you cannot just go, you are fighting, lol');
			return;
		}

		if(target!=undefined)
		sendChargeDeclaration(ACTIVE_MOB, target, tile);		
		else if(tile.isFarFromEnemy())
		sendMobToTile(ACTIVE_MOB, tile); 
		else alert('this field is too close to your enemy, you should charge him');
		
		
	} else if(tile.getCoordinates() == ACTIVE_MOB.Tile.getCoordinates()) {
		if(target!=undefined) { 
			pivotMob(ACTIVE_MOB, target.Tile); 			
			sendCombatCommunicate(ACTIVE_MOB, target);
		}
	}	
	else {
		if(ACTIVE_MOB.isShotPossible(target)) {		
			sendShotCommunicate(ACTIVE_MOB, target); 
		}
	}
	this.canvas.style.cursor = "default";
	this.refreshHexGrid();
};

HexagonGrid.prototype.animateSpell = function(spell, target) {
	this.drawHexAtColRow(target.Tile.column, target.Tile.row, 'pink', '');
	setTimeout(function() {
		hexagonGrid.refreshHexGrid();
	}, 500);
	
};

HexagonGrid.prototype.animateShot = function(shoter, target) {
	var count = 2* hex_distance(shoter.Tile,target.Tile);
	var startX = (shoter.Tile.column * this.side) + 0.5*this.side + this.canvasOriginX;
	var startY = shoter.Tile.column % 2 == 0 ? 
			(shoter.Tile.row * this.height) + this.canvasOriginY + (this.height / 2): 
			(shoter.Tile.row * this.height) + this.canvasOriginY + (this.height);
			
	var endX = (target.Tile.column * this.side) + 0.5*this.side + this.canvasOriginX;
	var endY = target.Tile.column % 2 == 0 ? 
			(target.Tile.row * this.height) + this.canvasOriginY + (this.height / 2): 
			(target.Tile.row * this.height) + this.canvasOriginY + (this.height);

	var stepRow = -(startX-endX)/count;
	var stepColumn=-(startY-endY)/count;
	for(i=0; i<count; i++) {
	var param ={startX:startX, startY:startY, stepColumn:stepColumn, stepRow:stepRow, hexagon:this, i:i};
		setTimeout(function(param) {
			param.hexagon.refreshHexGrid();
		  var centerX = param.startX + param.i *param.stepRow;
		  var centerY = param.startY + param.i *param.stepColumn;
		  var radius = 5;

		  param.hexagon.context.beginPath();
		  param.hexagon.context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
		  param.hexagon.context.fillStyle = 'green';
		  param.hexagon.context.fill();
		  param.hexagon.context.lineWidth = 5;
		  param.hexagon.context.strokeStyle = '#003300';
		  param.hexagon.context.stroke();				
			}, i*50, param);	
	}
	
	setTimeout(function(hexagon) {
		hexagon.refreshHexGrid();
	}, count*50, this);			
};


HexagonGrid.prototype.moveCharge = function (attackertmp, targetedMob, tile) {
	attacker=ACTIVE_MOB;
	attacker.hp=attackertmp.hp;
	attacker.unitsize=attackertmp.unitsize;
	var target;
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].isAlive() && MOBS[i].name == targetedMob.name)
		target=MOBS[i];
	}	

	var stepByStep = path(ACTIVE_MOB, tile);
	ACTIVE_MOB.goToTile(stepByStep, target);
};

function combat(attacker, target) {	
		if(target!=undefined) {
			var dmg = attacker.calculateMeleeDmg(target);
			addMessage(attacker.getDescribe()+' attacked '+ target.getDescribe()+' and sustained '+Math.floor(dmg)+' dmg!', 'communicate');	
			target.payThePiper(dmg);
						
			if(target.unitsize>0) { 
				dmg = target.calculateMeleeDmg(attacker);
				addMessage(target.getDescribe()+' stricted back '+ attacker.getDescribe()+' and sustained '+Math.floor(dmg)+' dmg!', 'communicate');	
				attacker.payThePiper(dmg);				
			}
		}
}

HexagonGrid.prototype.refreshHexGrid = function()
{
	this.drawHexGrid(this.canvasOriginX, this.canvasOriginY,  false);    
}

function nextPlayer() {
	var newActiveMob=null;
	
	for(playerMob of MOBS) {
		if(playerMob.player==ACTIVE_MOB.player || playerMob.isAlive()==false) continue;
		playerMob.hasFinishedTurn=false;
		playerMob.isWorking=false;
		playerMob.speed=playerMob.max_speed;
		playerMob.hasMoved=false;

		if(playerMob.isFleeing) {
			playerMob.tryReinforcement();
		}
		if(newActiveMob==null && playerMob.isFleeing==false) 
			newActiveMob=playerMob;				
	}

	ACTIVE_MOB=newActiveMob;
	HEROES[0].prepareForNewTurn();		
}

function selectNextMob(warrior)
{
	var potentialNextMobs = [];
	for(i=0; i<MOBS.length; i++) 
	{
		if(MOBS[i].player==ACTIVE_MOB.player && MOBS[i].hasFinishedTurn==false &&
			MOBS[i].isAlive() && MOBS[i].isFleeing==false) {
				if(ACTIVE_MOB.name<MOBS[i].name) {
					ACTIVE_MOB=MOBS[i];
					return;
				}
				potentialNextMobs.push(MOBS[i]);
			}
	}
	if(potentialNextMobs.length>0) ACTIVE_MOB=potentialNextMobs[0];
	else if(HEROES[0].castingDice==0) finishTurn();
}

	HexagonGrid.prototype.contextMenuEvent = function (e) {
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;
	
    var tile = this.getSelectedTile(localX, localY);
	
	var target;
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].isAlive() && MOBS[i].Tile.getCoordinates()==tile.getCoordinates())
		target=MOBS[i];
	}	
		
	var markup = '';
	var title='';
	if(target!=undefined) {
		title=target.type+'\'s details';
			var markup= '<tr><td>unitsize:</td><td>'+target.unitsize+'</td></tr>';
            markup+= '<tr><td>speed:</td><td>'+target.speed+'/'+target.max_speed+'</td></tr>';
			markup+= '<tr><td>attack:</td><td>'+target.attack+'</td></tr>';
			markup+= '<tr><td>defense:</td><td>'+target.defense+'</td></tr>';
			markup+= '<tr><td>damage:</td><td>'+target.damage_min+'-'+target.damage_max+'</td></tr>';
			markup+= '<tr><td>hp:</td><td>'+Math.ceil(target.hp)+'/'+target.max_hp+'</td></tr>';
			markup+= '<tr><td>shots:</td><td>'+target.shots+(target.max_shots>0 ?'/'+target.max_shots+'</td></tr>' : '</td></tr>');	
	} else {
	
		for(var i=0; i<OBSTACLES.length; i++) {
			if(tile.getCoordinates()==OBSTACLES[i].Tile.getCoordinates()) {
			title='Terrain: '+OBSTACLES[i].name;
			markup=OBSTACLES[i].hover;
		}
	}

	
	}
	
	if(markup!='') {
		$(document).mousemove(function(e){ 
			if(e.pageX!=mouseX && e.pageY!=mouseY) {
				$(".mobDetails").dialog('close');
				$(document).off('mousemove');
			}
		}); //end confirm dialog

		$("<div class='mobDetails'></div>").dialog({
			modal: true,
			title: title,
			buttons: {},
			open: function () {
				$(this).html(markup);
			}});	

	}
	
	e.preventDefault();
	return false;
}

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
	if(range<=0 || range==undefined) return [];
	
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

