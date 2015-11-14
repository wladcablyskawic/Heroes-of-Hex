function createGoblin(player, Tile, name, unitsize){

	var mob = new Mob(player, Tile, name, 
	/*type*/ 	'Goblin',
	/*speed*/ 		5, 
	unitsize, 
	/*attack*/ 		4, 
	/*defense*/ 	2, 
	/*damage_min*/ 	1, 
	/*damage_max*/ 	2, 
	/*hp*/			5,
	/*max_hp*/		5,
	/*shots*/		0,
	/*max_shots*/	0);
	return mob;

};

function createOrc(player, Tile, name, unitsize){

	var mob = new Mob(player, Tile, name, 
	/*type*/ 	'Orc',
	/*speed*/ 		4, 
	unitsize, 
	/*attack*/ 		8, 
	/*defense*/ 	4, 
	/*damage_min*/ 	2, 
	/*damage_max*/ 	5, 
	/*hp*/			15,
	/*max_hp*/		15,
	/*shots*/		12,
	/*max_shots*/	12);
	return mob;

};

function createTroll(player, Tile, name, unitsize){

	var mob = new Mob(player, Tile, name, 
	/*type*/ 	'Troll',
	/*speed*/ 		7, 
	unitsize, 
	/*attack*/ 		14, 
	/*defense*/ 	7, 
	/*damage_min*/ 	10, 
	/*damage_max*/ 	15, 
	/*hp*/			40,
	/*max_hp*/		40,
	/*shots*/		0,
	/*max_shots*/	0);
	return mob;

};

function createPikeman(player, Tile, name, unitsize){

	var mob = new Mob(player, Tile, name, 
	/*type*/ 	'Pikeman',
	/*speed*/ 		4, 
	unitsize, 
	/*attack*/ 		4, 
	/*defense*/ 	5, 
	/*damage_min*/ 	1, 
	/*damage_max*/ 	3, 
	/*hp*/			10,
	/*max_hp*/		10,
	/*shots*/		0,
	/*max_shots*/	0);
	return mob;
};

function createSwordsman(player, Tile, name, unitsize){

	var mob = new Mob(player, Tile, name, 
	/*type*/ 	'Swordsman',
	/*speed*/ 		5, 
	unitsize, 
	/*attack*/ 		10, 
	/*defense*/ 	12, 
	/*damage_min*/ 	6, 
	/*damage_max*/ 	9, 
	/*hp*/			35,
	/*max_hp*/		35,
	/*shots*/		0,
	/*max_shots*/	0);
	return mob;

};

function createArcher(player, Tile, name, unitsize){

	var mob = new Mob(player, Tile, name, 
	/*type*/ 	'Archer',
	/*speed*/ 		4, 
	unitsize, 
	/*attack*/ 		6, 
	/*defense*/ 	3, 
	/*damage_min*/ 	2, 
	/*damage_max*/ 	3, 
	/*hp*/			10,
	/*max_hp*/		10,
	/*shots*/		12,
	/*max_shots*/	12);
	return mob;

};