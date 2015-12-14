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
	
	this.spells = [];
	this.spells.push(new Spell('Cure'));
	this.spells.push(new Spell('Bloodlust'));
	this.spells.push(new Spell('Shield'));
	this.spells.push(new Spell('Curse'));	
	this.spells.push(new Spell('Magic Arrow'));	
};

Hero.prototype.getSpells = function() {
	return this.spells;
};

Hero.prototype.forgotSpell = function(spell) {
	for(i=0; i<this.spells.length; i++)
	{
		if(spell.name==spell) {
			this.spells.splice(i, 1);
			return;
		}
	}
}

Hero.prototype.isDispelPossible = function() {
	if(HEROES[0].isDispeling && HEROES[0].dispelDice>0) return true;
	return false;
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