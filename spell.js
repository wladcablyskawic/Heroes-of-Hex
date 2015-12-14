var Spell = function(name) {
	this.name=name;
	if(this.name!=undefined) this.apiname = this.name.replace(' ','_');
	
	if(name=='Shield') this.createShield();
	else if(name=='Bloodlust') this.createBloodlust();
	else if(name=='Cure') this.createCure();
	else if(name=='Curse') this.createCurse();
	else if(name=='Magic Arrow') this.createMagicArrow();

}

Spell.prototype.validateTarget = function(mob) {
	if(mob==undefined) return false;
	mob = new Mob().parse(mob);

	if(this.target=='ally' && mob.player==HEROES[0].player) return true;
	else if(this.target=='enemy' && mob.player!=HEROES[0].player) return true;
	
	return false;
}

Spell.prototype.tryCast = function(dice) {
	var rolled = this.prepareRollCommunicate(dice);
	
	var communicate = {};
	communicate.Action='castSpell';
	communicate.spell=this.name;
	communicate.castingValue=this.castingValue;
	communicate.randomSeed=randomSeed;
	communicate.rolled=rolled.rolled;
	communicate.SnakeEyes = rolled.SnakeEyes;
	communicate.IrresistibleForce=rolled.IrresistibleForce;
	communicate.dice=rolled.dice;

	skylink.sendP2PMessage(JSON.stringify(communicate)); 
}

Spell.prototype.dispel = function(dice, threshold) {
	var rolled = this.prepareRollCommunicate(dice);
	
	var communicate = {};
	communicate.Action='dispel';
	communicate.threshold=threshold;
	communicate.randomSeed=randomSeed;	
	communicate.rolled=rolled.rolled;
	communicate.SnakeEyes = rolled.SnakeEyes;
	communicate.IrresistibleForce=rolled.IrresistibleForce;
	communicate.dice=rolled.dice;

	skylink.sendP2PMessage(JSON.stringify(communicate)); 
}

Spell.prototype.prepareRollCommunicate = function(dice) {
	var communicate = {};
	var sum = 0;
	var IrresistibleForce=0;
	var SnakeEyes=0;
	for(i=0; i<dice.length; i++) {
		sum+=dice[i];
		if(dice[i]==1) SnakeEyes++;
		if(dice[i]==6) IrresistibleForce++;
	}
	
	SnakeEyes = (SnakeEyes>1)?true:false;
	IrresistibleForce = (IrresistibleForce>1)?true:false;
	
	communicate.rolled=sum;
	communicate.SnakeEyes = SnakeEyes;
	communicate.IrresistibleForce=IrresistibleForce;
	communicate.dice=dice.length;
	return communicate;
}

Spell.prototype.getImage = function() {
	var img=document.getElementById("Image_"+this.apiname);
	if(img!=undefined) return img;
	else return;
};


showSpellDialog = function(ev) {
    var mouseX = ev.pageX;
    var mouseY = ev.pageY;
	
	spell = new Spell(ev.target.name);
	
	var title=spell.name+'\'s details';

	var markup = 'Casting value: '+spell.castingValue+'</br>'+spell.hover;

		$(document).mousemove(function(ev){ 
			if(ev.pageX!=mouseX && ev.pageY!=mouseY) {
				$(".spellHover").dialog('close');
				$(document).off('mousemove');
			}
		}); //end confirm dialog

		$("<div class='spellHover'></div>").dialog({
			modal: true,
			title: title,
			buttons: {},
			open: function () {
				$(this).html(markup);
			}});

	ev.preventDefault();
	return false;			
}

Spell.prototype.createShield = function() {
	this.castingValue=5;
	this.hover = 'Reduces hand-to-hand damage delivered to target allied troop';
	this.target='ally';
	this.effect = function(target) {
		target = new Mob().parse(target);
		target.defense+=3;
		
		return target.type +'\'s defense has been improved by magical shield!';
	}
};

Spell.prototype.createCure = function() {
	this.castingValue=4;
	this.hover = 'Removes all negative spell effects and heals target';
	this.target='ally';
	this.effect = function(target) {
		target = new Mob().parse(target);
		target.damage_max=target._damage_max;
		target.hp=target.max_hp;
		return target.type +' has been magically cured';
	}
};

Spell.prototype.createCurse = function() {
	this.castingValue=6;
	this.hover = 'Target enemy unit inflict minimum damage when attacking.';
	this.target='enemy';
	this.effect = function(target) {
		target = new Mob().parse(target);
		target.damage_max=target.damage_min;
		return target.type +' has been cursed.';
	}
};

Spell.prototype.createMagicArrow = function() {
	this.castingValue=8;
	this.hover = 'Causes damage to target enemy troop.';
	this.target='enemy';
	this.effect = function(target) {
		target = new Mob().parse(target);
		target.payThePiper(40);
		return target.type +' has been hitten by magical arrow and received 40dmg';
	}
	
	this.validateTarget = function(target) {
		if(target==undefined) return false;
		mob = new Mob().parse(target);
		if(mob.player!=HEROES[0].player && mob.isSurrounded()==false) return true;
		return false;
	}

};

Spell.prototype.createBloodlust= function() {
	this.castingValue=5;
	this.hover = 'Increases target allied troop\'s attack skill value for hand-to-hand attacks.';
	this.target='ally';
	this.effect = function(target) {
		target = new Mob().parse(target);
		target.attack+=3;
		return target.type +'\'s attack has been improved by bloodlust!';
	}
};


