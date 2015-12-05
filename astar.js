		var mapArray;
		
		function initAStar(row, col) {
			mapArray = MultiDimensionalArray(MAX_ROW,MAX_COLUMN);
			for (x=0; x  < MAX_ROW; x++) {
				for (y=0; y < MAX_COLUMN; y++) {
					mapArray[x][y] = "hex_green";
				}
			}
		}
		
		function recalculateMapArray()
		{
		for (x=0; x  < MAX_ROW; x++) {
			for (y=0; y < MAX_COLUMN; y++) {
				mapArray[x][y] = "hex_tree";
				}
			}		
			for(neighbour of ACTIVE_MOB.neighbours) {
			mapArray[neighbour.row][neighbour.column]="hex_green";
			}
			
			mapArray[ACTIVE_MOB.Tile.row][ACTIVE_MOB.Tile.column]="hex_green";
					
		}

		// function found on developerfusion.com
		function MultiDimensionalArray(iRows,iCols) {
			var i;
			var j;
			var a = new Array(iRows);
			for (i=0; i < iRows; i++) {
				a[i] = new Array(iCols);
				for (j=0; j < iCols; j++) {
					a[i][j] = "";
				}
			}
			return(a);
		} 

		function hex_accessible(x,y) {
		
		//return isValidTile(new Tile(y,x));
		
			if(mapArray[x] == undefined) return false;
			if(mapArray[x][y] == undefined) return false;
			if(mapArray[x][y] == 'hex_tree') return false;
			
			return true;
		};

	var Cube = function(x, y, z) {
		this.x=x;
		this.y=y;
		this.z=z;
	};	
	
	function cube_round(h) {
		var rx = Math.round(h.x);
		var ry = Math.round(h.y);
		var rz = Math.round(h.z);
		
		var x_diff = Math.abs(rx-h.x);
		var y_diff = Math.abs(ry-h.y);
		var z_diff = Math.abs(rz-h.z);
		
		if(x_diff > y_diff && x_diff > z_diff)
			rx = -ry-rz;
		else if(y_diff > z_diff)
			ry = -rx-rz;
		else 
			rz = -rx-ry;
			
		return new Cube(rx,ry,rz);
	};
	
	function cube_lerp(hex1,hex2,t) {
	
		a = convertTileToCube(hex1);
		b = convertTileToCube(hex2);
		
		return new Cube(a.x + (b.x-a.x)*t,
					a.y + (b.y-a.y)*t,
					a.z + (b.z-a.z)*t);
	};
	
	function getEscapeDestination_old(a,b,n) {
		var N = hex_distance(a.column, a.row, b.column, b.row);	
		var results = [];
		for(var i=n; i<=N+n; i++){
		var cube = cube_round(cube_lerp(a, b, 1.0/(n) *i));
			var tile = convertCubeToTile(cube);
			results.push(tile);
		}
		
		console.log(results);
		
		for(var i=results.length-1; i>0; i--) {
			if(isValidTile(results[i])) {
				console.log(results[i]);
				return results[i];
			}
		}
		console.log('error: wrong fleeDestination');
		return null;	
	}
	
	function getEscapePath(attacker,target,n) {
		var path = [];
		var currentTile=target;
		var currentDistance = 0;
		for(i=0; i<n; i++) {
			path.push(currentTile);			
			var neighbours = getNeighbours(currentTile);
			currentTile=null;
			currentDistance=0;

				for(potentialTile of neighbours) {
					var distance = hex_distance(attacker.column, attacker.row, potentialTile.column, potentialTile.row);
					if(distance > currentDistance) {
						currentDistance=distance;
						currentTile = potentialTile;
					}
				}
		}
		
		return path;
	}
	
	function getLineOfSight(a,b) {
		var N = hex_distance(a.column, a.row, b.column, b.row);
		var results = [];
		for(var i=0; i<=N; i++){
		var cube = cube_round(cube_lerp(a, b, 1.0/N *i));
			results.push(convertCubeToTile(cube));
		}
		return results;
	};		
	
/*	function checkLineOfSight(observer, target) {
		var tiles = getLineOfSight(observer, target);
		
		var answer=true;
		for(i=1; i<tiles.length-1; i++) {
			if(checkTileVisibility(tiles[i])==false) 
			{
				if(observer.row==target.row && i%2==1) {
					var secondOption = tiles[i];
					secondOption.row++;
					if(isValidTile(secondOption)==false ||
						checkTileVisibility(secondOption)==false) {
						answer=false;
						break;
					}
				} else {
				answer=false;
				break;
				}
			}
		}
		
		return answer;
	}	*/
	
	function checkTileVisibility(tile) {
		var answer=true;
			for(j=0; j<OBSTACLES.length; j++) {
				if(OBSTACLES[j].Tile.getCoordinates()== tile.getCoordinates()
				&& OBSTACLES[j].blockingLoS==true) {
					answer=false;	
				}
			}
			for(j=0; j<MOBS.length; j++) {
				if(MOBS[j].isAlive()==true && 
					MOBS[j].Tile.getCoordinates()== tile.getCoordinates()) answer=false;	
			}		
			
			return answer;
	}
	
	function convertTileToCube(tile) {
		var x1=tile.column;
		var z1=tile.row - (tile.column - (tile.column&1))/2;
		var y1=-x1-z1;
		return new Cube(x1,y1,z1);
	}
	
	function convertCubeToTile(cube) {
		var col = cube.x;
		var row = cube.z + (cube.x - (cube.x&1)) / 2;
		
		return new Tile(col, row);
	}
		
	function hex_distance(col1,row1,col2,row2) {
		Cube1 = convertTileToCube(new Tile(col1, row1));
		Cube2 = convertTileToCube(new Tile(col2, row2));
		
		var ans = (Math.abs(Cube1.x - Cube2.x) + Math.abs(Cube1.y - Cube2.y) 
					+ Math.abs(Cube1.z - Cube2.z)) / 2;

	return ans;
	}		
		
// A* Pathfinding with Manhatan Heuristics for Hexagons.
		function path(start_x, start_y, end_x, end_y) {
		recalculateMapArray();
			// Check cases path is impossible from the start.
			var error=0;
			if(start_x == end_x && start_y == end_y) { error=1; console.log('start point equal end point'); }
			if(!hex_accessible(start_x,start_y)) { error=1; console.log('wrong start point'+end_y+','+end_x); }
			if(error==1) {
			if(!hex_accessible(end_x,end_y)) { error=1; console.log('wrong end point'+end_y+','+end_x); }
				alert('Path is impossible to create.');
				return false;
			}
			
			// Init
			var openlist = new Array(MAX_ROW*MAX_COLUMN+2);
			var openlist_x = new Array(MAX_ROW);
			var openlist_y = new Array(MAX_COLUMN);
			var statelist = MultiDimensionalArray(MAX_ROW+1,MAX_COLUMN+1); // current open or closed state
			var openlist_g = MultiDimensionalArray(MAX_ROW+1,MAX_COLUMN+1);
			var openlist_f = MultiDimensionalArray(MAX_ROW+1,MAX_COLUMN+1);
			var openlist_h = MultiDimensionalArray(MAX_ROW+1,MAX_COLUMN+1);
			var parent_x = MultiDimensionalArray(MAX_ROW+1,MAX_COLUMN+1);
			var parent_y = MultiDimensionalArray(MAX_ROW+1,MAX_COLUMN+1);
			var path = MultiDimensionalArray(MAX_ROW*MAX_COLUMN+2,2);

			var select_x = 0;
			var select_y = 0;
			var node_x = 0;
			var node_y = 0;
			var counter = 1; // Openlist_ID counter
			var selected_id = 0; // Actual Openlist ID
			
			// Add start coordinates to openlist.
			openlist[1] = true;
			openlist_x[1] = start_x;
			openlist_y[1] = start_y;
			openlist_f[start_x][start_y] = 0;
			openlist_h[start_x][start_y] = 0;
			openlist_g[start_x][start_y] = 0;
			statelist[start_x][start_y] = true; 
			
			// Try to find the path until the target coordinate is found
			while (statelist[end_x][end_y] != true) {
				set_first = true;
				// Find lowest F in openlist
				for (var i in openlist) {
					if(openlist[i] == true){
						select_x = openlist_x[i]; 
						select_y = openlist_y[i]; 
						if(set_first == true) {
							lowest_found = openlist_f[select_x][select_y];
							set_first = false;
						}
						if (openlist_f[select_x][select_y] <= lowest_found) {
							lowest_found = openlist_f[select_x][select_y];
							lowest_x = openlist_x[i];
							lowest_y = openlist_y[i];
							selected_id = i;
						}
					}
				}
				if(set_first==true) {
					// open_list is empty
					alert('No possible route can be found.');
					return false;
				}
  			// add it lowest F as closed to the statelist and remove from openlist
				statelist[lowest_x][lowest_y] = 2;
				openlist[selected_id]= false;
				// Add connected nodes to the openlist
				neighbours = getNeighbours(new Tile(lowest_y, lowest_x));
				for(neighbour of neighbours) {
				node_x = neighbour.row;
				node_y=neighbour.column;

				  if (hex_accessible([node_x],[node_y])) {

				  if(statelist[node_x][node_y] == true) {
					  	if(openlist_g[node_x][node_y] < openlist_g[lowest_x][lowest_y]) {
					  		parent_x[lowest_x][lowest_y] = node_x;
							  parent_y[lowest_x][lowest_y] = node_y;
							  openlist_g[lowest_x][lowest_y] = openlist_g[node_x][node_y] + 10;
							  openlist_f[lowest_x][lowest_y] = openlist_g[lowest_x][lowest_y] + openlist_h[lowest_x][lowest_y];
						  }
					  } else if (statelist[node_x][node_y] == 2) {
						  // its on closed list do nothing.
					  } else {
						  counter++;
						  // add to open list
						  openlist[counter] = true;
						  openlist_x[counter] = node_x;
						  openlist_y[counter] = node_y;
						  statelist[node_x][node_y] = true;
						  // Set parent
						  parent_x[node_x][node_y] = lowest_x;
						  parent_y[node_x][node_y] = lowest_y;
						  // update H , G and F
						  var ydist = end_y - node_y;
						  if ( ydist < 0 ) ydist = ydist*-1;
						  var xdist = end_x - node_x;
						  if ( xdist < 0 ) xdist = xdist*-1;		
						  openlist_h[node_x][node_y] = hex_distance(node_x,node_y,end_x,end_y);// * 10;
						  if(openlist_h[node_x][node_y]==0) break;
						  openlist_g[node_x][node_y] = openlist_g[lowest_x][lowest_y] + 10;
						  openlist_f[node_x][node_y] = openlist_g[node_x][node_y] + openlist_h[node_x][node_y];
						}
				  }
				}
			}
			
			// Get Path
			temp_x=end_x;
			temp_y=end_y;
			counter = 0;
			while(temp_x != start_x || temp_y != start_y) {
				counter++;
				path[counter][1] = temp_x;
				path[counter][2] = temp_y;
				temp_x = parent_x[path[counter][1]][path[counter][2]];
				temp_y = parent_y[path[counter][1]][path[counter][2]];
			}
			counter++;
			path[counter][1] = start_x;
			path[counter][2] = start_y;
			
			// Draw path.
			var fullPath = [];
			while(counter!=0) {
			fullPath.push(new Tile(path[counter][2], path[counter][1]));
			//fullPath+='next step: ['+path[counter][2] + ',' + path[counter][1]+'],';
//				document.getElementById('hex_' + path[counter][1] + '_' + path[counter][2]).className = 'hex_blue';
				counter--;
			}
//			console.log(fullPath);
			return fullPath;

//			alert(fullPath);
		}				