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
			if(mapArray[x] == undefined) return false;
			if(mapArray[x][y] == undefined) return false;
			if(mapArray[x][y] == 'hex_tree') return false;
			
			return true;
		}

		
		function hex_distance(col1,row1,col2,row2) {
		
		x1=col1;
		z1=row1 - (col1 - (col1&1))/2;
		y1=-x1-z1;
		
		x2=col2;
		z2=row2 - (col2 - (col2&1))/2;
		y2=-x2-z2;
		
		
		var ans = (Math.abs(x1 - x2) + Math.abs(y1 - y2) + Math.abs(z1 - z2)) / 2;

	return ans;
	}		
		
// A* Pathfinding with Manhatan Heuristics for Hexagons.
		function path(start_x, start_y, end_x, end_y) {
		recalculateMapArray();
			// Check cases path is impossible from the start.
			var error=0;
			if(start_x == end_x && start_y == end_y) { error=1; console.log('start point equal end point'); }
			if(!hex_accessible(start_x,start_y)) { error=1; console.log('wrong start point'); }
			if(!hex_accessible(end_x,end_y)) { error=1; console.log('wrong end point'); }
			if(error==1) {
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
				counter--;
			}
//			console.log(fullPath);
			return fullPath;

//			alert(fullPath);
		}				