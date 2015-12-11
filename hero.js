var Hero = function(player, type, castingDice, dispelDice, leadership) {
	this.player=player;
	this.type=type;
	this.castingDice=castingDice;
	this.max_castingDice=castingDice;
	this.dispelDice=dispelDice;
	this.max_dispelDice=dispelDice;
	this.leadership=leadership;	
	
	this.isCasting=false;
	this.isDispeling=false;
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

Hero.prototype.isRollPossible = function(diceCount) {

	if((HEROES[0].isCasting && diceCount>HEROES[0].castingDice) ||
	   (HEROES[0].isDispeling && diceCount>HEROES[0].dispelDice)) return false;
	   
	return true;

}

Hero.prototype.prepareForNewTurn = function() {
	RollManager.reset();
	this.castingDice=this.max_castingDice;
	this.dispelDice=this.max_dispelDice;
	this.isCasting = (ACTIVE_MOB.player==this.player);
	this.isDispeling = !this.isCasting;
	

}