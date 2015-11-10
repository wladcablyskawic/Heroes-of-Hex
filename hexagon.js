// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

var MAX_COLUMN;
var MAX_ROW;

var OBSTACLES = [];
var MOBS = [];
var ACTIVE_MOB;

HexagonGrid.prototype.addObstacle = function addObstacle(column, row, name, hover) 
{
	OBSTACLES.push(new Obstacle(new Tile(column, row), name, hover));
}

HexagonGrid.prototype.addMob = function addMob(player, column, row, name, speed, hover) 
{
	MOBS.push(new Mob(player, new Tile(column, row), name, speed, hover));
}

HexagonGrid.prototype.selectMob = function addMob(name) 
{
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].name==name) ACTIVE_MOB = MOBS[i];
	}
}

var Obstacle = function(Tile, name, hover)
{
	this.Tile=Tile;
	this.name=name;
	this.hover=hover;
}

var Mob = function(player, Tile, name, speed, hover)
{
	this.Tile = Tile;
	this.name=name;
	this.speed=speed;
	this.hover=hover;
	this.player=player;
}

var Tile = function(column, row, name)
{
this.column=column;
this.row=row;
};

Tile.prototype.getCoordinates = function() {
	return '['+this.column+','+this.row+']';
};


function HexagonGrid(canvasId, radius) {
    this.radius = radius;

    this.height = Math.sqrt(3) * radius;
    this.width = 2 * radius;
    this.side = (3 / 2) * radius;

    this.canvas = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.canvasOriginX = 0;
    this.canvasOriginY = 0;
    
    this.canvas.addEventListener("mousedown", this.clickEvent.bind(this), false);
    this.canvas.addEventListener("contextmenu", this.contextMenuEvent.bind(this), false);	
	
	};

 
 
HexagonGrid.prototype.drawHexGrid = function (rows, cols, originX, originY, isDebug) {
    this.canvasOriginX = originX;
    this.canvasOriginY = originY;
    
	MAX_COLUMN=cols;
	MAX_ROW=rows;
	
    var currentHexX;
    var currentHexY;
    var debugText = "";

    var offsetColumn = false;

    for (var col = 0; col < cols; col++) {
        for (var row = 0; row < rows; row++) {

            if (!offsetColumn) {
                currentHexX = (col * this.side) + originX;
                currentHexY = (row * this.height) + originY;
            } else {
                currentHexX = col * this.side + originX;
                currentHexY = (row * this.height) + originY + (this.height * 0.5);
            }

            if (isDebug) {
                debugText = '['+col + "," + row+']';
            }

            this.drawHex(currentHexX, currentHexY, "#ddd", debugText);
        }
        offsetColumn = !offsetColumn;
    }	
	
};


HexagonGrid.prototype.drawHexAtColRow = function(column, row, color, debugText) {
    var drawx = (column * this.side) + this.canvasOriginX;
    var drawy = column % 2 == 0 ? (row * this.height) + this.canvasOriginY : (row * this.height) + this.canvasOriginY + (this.height / 2);

    this.drawHex(drawx, drawy, color, debugText);
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




HexagonGrid.prototype.drawHex = function(x0, y0, fillColor, debugText) {
    this.context.strokeStyle = "#000";
	this.context.lineWidth=1;
	
    this.context.beginPath();
    this.context.moveTo(x0 + this.width - this.side, y0);
    this.context.lineTo(x0 + this.side, y0);
    this.context.lineTo(x0 + this.width, y0 + (this.height / 2));
    this.context.lineTo(x0 + this.side, y0 + this.height);
    this.context.lineTo(x0 + this.width - this.side, y0 + this.height);
    this.context.lineTo(x0, y0 + (this.height / 2));

    if (fillColor) {
        this.context.fillStyle = fillColor;
        this.context.fill();
    }

    this.context.closePath();
    this.context.stroke();

    if (debugText) {
        this.context.font = "8px";
        this.context.fillStyle = "#000";
        this.context.fillText(debugText, x0 + (this.width / 2) - (this.width/4), y0 + (this.height - 5));
    }
};

HexagonGrid.prototype.highlightHex = function(color, Tile) {
    var y0 = Tile.column % 2 == 0 ? (Tile.row * this.height) + this.canvasOriginY : (Tile.row * this.height) + this.canvasOriginY + (this.height / 2);
    var x0 = (Tile.column * this.side) + this.canvasOriginX;
	
    this.context.strokeStyle = color;
	this.context.lineWidth=5;
    this.context.beginPath();
    this.context.moveTo(x0 + this.width - this.side, y0);
    this.context.lineTo(x0 + this.side, y0);
    this.context.lineTo(x0 + this.width, y0 + (this.height / 2));
    this.context.lineTo(x0 + this.side, y0 + this.height);
    this.context.lineTo(x0 + this.width - this.side, y0 + this.height);
    this.context.lineTo(x0, y0 + (this.height / 2));
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

HexagonGrid.prototype.recalculateChargeClick = function(mouseX, mouseY, Tile) {
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].Tile.getCoordinates()==Tile.getCoordinates()	&& MOBS[i].player=='player2') {
			var vector = this.calculateAttackVector(mouseX, mouseY, Tile);

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

HexagonGrid.prototype.clickEvent = function (e) {
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;

    var Tile = this.getSelectedTile(localX, localY);
	
	this.recalculateChargeClick(mouseX, mouseY, Tile);
	
	if(isValidTile(Tile) && isContained(Tile, ACTIVE_MOB.neighbours))
	{
		ACTIVE_MOB.Tile = Tile;
		selectNextMob(ACTIVE_MOB);
		
		this.refreshHexGrid();
		return;
	}
};

HexagonGrid.prototype.refreshHexGrid = function()
{
	this.drawHexGrid(MAX_ROW, MAX_COLUMN, this.canvasOriginX, this.canvasOriginY,  true);    
}

function selectNextMob(warrior)
{
	var firstPlayerMobs = []
	for(i=0; i<MOBS.length; i++) 
	{
		if(MOBS[i].player=='player1') firstPlayerMobs.push(MOBS[i]);		
	}
	for(i=0; i<firstPlayerMobs.length; i++) 
	{
		if(ACTIVE_MOB.name==firstPlayerMobs[i].name) 
		{
			if(i<firstPlayerMobs.length-1) 
			{ 
				ACTIVE_MOB=firstPlayerMobs[i+1]; 
				return; 
			}
			else ACTIVE_MOB=firstPlayerMobs[0];			
		}
	}
}

	
HexagonGrid.prototype.contextMenuEvent = function (e) {
		selectNextMob(ACTIVE_MOB);
		return false;
};

function getNeighbours(range, tile) {
var neighbours = [ ];
	if(range>0) {
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


		
		for(newTile of potentialNeighbours) {
			if(isValidTile(newTile)  && !isContained(newTile, neighbours)) 
				Array.prototype.push.apply(neighbours, getNeighbours(range-1, newTile));							
		}
	}
	
	if(isValidTile(tile) && !isContained(tile, neighbours)) {
		neighbours.push(tile); 
	}

	return neighbours;
};

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
		if(OBSTACLES[i].Tile.getCoordinates()==tile.getCoordinates()) return false;
	}
	for(var i=0; i<MOBS.length; i++) {
		if(MOBS[i].Tile.getCoordinates()==tile.getCoordinates()) return false;
	}

		return true;
	}	
	return false;
};
