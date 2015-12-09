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

function createBigObstacle(startRow, endRow, startCol, endCol, name, hover, isBlockingLoS, isBlockingMovement) {
	for(column=startCol; column<endCol; column++){
		for(row=startRow; row<endRow; row++){
			OBSTACLES.push(new Obstacle(new Tile(column, row), name, hover, isBlockingLoS, isBlockingMovement));		
		}
	}
}

var Map = function(name) {
	if(name=='CorsicanDefense') this.CorsicanDefense();
}

Map.prototype.CorsicanDefense = function() {
	createBigObstacle(2,4,2,7,'Lake','Lakes are non-interfering terrain features.', false, true);
	createBigObstacle(6,8,3,5,'Impassable','As the title says -infinite height, impassable terrain.', true, true);
	createBigObstacle(7,8,17,20,'Impassable','As the title says -infinite height, impassable terrain.', true, true);

	createBigObstacle(7,9,7,12,'Forest','Forests are Interfering terrain. For Line of Sight purposes Forests count as being of infinite height.', true, false);

	createBigObstacle(2,5,14,16,'Forest','Forests are Interfering terrain. For Line of Sight purposes Forests count as being of infinite height.', true, false);
	
}




