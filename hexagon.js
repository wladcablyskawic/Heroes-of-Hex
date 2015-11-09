// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

var MAX_COLUMN;
var MAX_ROW;

var OBSTACLES = [];
var WARRIORS = [];
var ACTIVE_WARRIOR;

HexagonGrid.prototype.addObstacle = function addObstacle(column, row, name, hover) 
{
	OBSTACLES.push(new Obstacle(new Tile(column, row), name, hover));
}

HexagonGrid.prototype.addWarrior = function addWarrior(column, row, name, speed, hover) 
{
	WARRIORS.push(new Warrior(new Tile(column, row), name, speed, hover));
}

HexagonGrid.prototype.selectWarrior = function addWarrior(name) 
{
	for(var i=0; i<WARRIORS.length; i++) {
		if(WARRIORS[i].name==name) ACTIVE_WARRIOR = WARRIORS[i];
	}
}

var Obstacle = function(Tile, name, hover)
{
this.Tile=Tile;
this.name=name;
this.hover=hover;
}

var Warrior = function(Tile, name, speed, hover)
{
this.Tile = Tile;
this.name=name;
this.speed=speed;
this.hover=hover;
}

var Tile = function(column, row, name)
{
this.column=column;
this.row=row;
this.name=name;
};

Tile.prototype.getCoordinates = function() {
	return '['+this.column+','+this.row+']';
};

Tile.prototype.getNeighbours = function(range) {
	var neighbours = [ ];

	if(range>0) {
		potentialNeighbours = [];
		potentialNeighbours.push(new Tile(this.column, this.row-1));
		potentialNeighbours.push(new Tile(this.column, this.row+1));
		potentialNeighbours.push(new Tile(this.column-1, this.row));
		potentialNeighbours.push(new Tile(this.column+1, this.row));

		if(column%2==0) {	
			potentialNeighbours.push(new Tile(this.column-1, this.row-1));
			potentialNeighbours.push(new Tile(this.column+1, this.row-1));
		} else {
			potentialNeighbours.push(new Tile(this.column-1, this.row+1));
			potentialNeighbours.push(new Tile(this.column+1, this.row+1));
		}

		for(newTile in potentialNeighbours) {
			if(isValidTile(newTile)  && !isContained(newTile, neighbours)) 
				Array.prototype.push.apply(neighbours, newTile.getNeighbours(range-1));	
		}

	}
	if(isValidTile(this) && !isContained(this, neighbours)) {
		neighbours.push(this); 
	}
	return neighbours;
};

function isContained(tile, neighbours)
{
	for(var i=0; i<neighbours.length; i++) {
		if(neighbours[i].row=tile) return true;
	}
	return false;
}

function isValidTile(tile) {
	if(tile.row>=0 && tile.row <MAX_ROW && tile.column>=0 && tile.column<MAX_COLUMN) {

	for(var i=0; i<OBSTACLES.length; i++) {
		if(OBSTACLES[i].Tile==tile) return false;
	}
	for(var i=0; i<WARRIORS.length; i++) {
		if(WARRIORS[i].Tile==tile) return false;
	}
		return true;
	}
	
	return false;
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


HexagonGrid.prototype.drawHexAtTile = function(tile, color, debugText) {
    var drawy = column % 2 == 0 ? (tile.row * this.height) + this.canvasOriginY : (tile.row * this.height) + this.canvasOriginY + (this.height / 2);
    var drawx = (tile.column * this.side) + this.canvasOriginX;

    this.drawHex(drawx, drawy, color, debugText);
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

HexagonGrid.prototype.highlightHex = function(Tile, color) {
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

    return  { row: row, column: column };
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

HexagonGrid.prototype.clickEvent = function (e) {
    var mouseX = e.pageX;
    var mouseY = e.pageY;

    var localX = mouseX - this.canvasOriginX;
    var localY = mouseY - this.canvasOriginY;

    var Tile = this.getSelectedTile(localX, localY);
	
	if(isValidTile(Tile) && isContained(Tile, ACTIVE_WARRIOR.neighbours))
	{
		ACTIVE_WARRIOR.Tile = Tile;
		selectNextWarrior(ACTIVE_WARRIOR);
		
		this.refreshHexGrid();
	}
    	
	
};

HexagonGrid.prototype.refreshHexGrid = function()
{
	this.drawHexGrid(MAX_ROW, MAX_COLUMN, this.canvasOriginX, this.canvasOriginY,  true);    
}

function selectNextWarrior(warrior)
{
	for(i=0; i<WARRIORS.length; i++) 
	{
		if(ACTIVE_WARRIOR.name==WARRIORS[i].name) 
		{
			if(i<WARRIORS.length-1) 
			{ 
				ACTIVE_WARRIOR=WARRIORS[i+1]; 
				return; 
			}
			else ACTIVE_WARRIOR=WARRIORS[0];			
		}
	}
}

	
HexagonGrid.prototype.contextMenuEvent = function (e) {
		selectNextWarrior(ACTIVE_WARRIOR);
		return false;
};	