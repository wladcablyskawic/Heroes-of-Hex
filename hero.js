var Hero = function(player, type, mana, leadership) {
	this.player=player;
	this.type=type;
	this.mana=mana;
	this.max_mana=mana;
	this.leadership=leadership;	
};

Hero.prototype.getSpells = function() {

	var spells = [];
	spells.push(new Spell('Bloodlust'));
	spells.push(new Spell('Cure'));
	spells.push(new Spell('Magic Arrow'));
	spells.push(new Spell('Shield'));
	spells.push(new Spell('Curse'));	
	return spells;
};

