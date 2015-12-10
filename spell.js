var Spell = function(name) {
	this.name=name;
	if(this.name!=undefined) this.apiname =this.name.replace(' ','_');
	
	if(name=='Shield') this.createShield();
	else if(name=='Bloodlust') this.createBloodlust();
	else if(name=='Cure') this.createCure();
	else if(name=='Curse') this.createCurse();
	else if(name=='Magic Arrow') this.createMagicArrow();

}

Spell.prototype.tryCast = function(dice) {
	var sum = 0;
	for(i=0; i<dice.length; i++) sum+=dice[i];
	
	var communicate = {};
	communicate.Action='castSpell';
	communicate.spell=this.name;
	communicate.castingValue=this.castingValue;
	communicate.rolled = sum;
	skylink.sendP2PMessage(JSON.stringify(communicate)); 
}

Spell.prototype.dispel = function(dice, threshold) {
	var sum = 0;
	for(i=0; i<dice.length; i++) sum+=dice[i];
	
	var communicate = {};
	communicate.Action='dispel';
	communicate.threshold=threshold;
	communicate.rolled = sum;
	skylink.sendP2PMessage(JSON.stringify(communicate)); 
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
				$("#chargeRespondDialog").dialog('close');
				$(document).off('mousemove');
			}
		}); //end confirm dialog

		$("#chargeRespondDialog").dialog({
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
};

Spell.prototype.createCure = function() {
	this.castingValue=4;
	this.hover = 'Removes all negative spell effects and heals either target allied troop.';
};

Spell.prototype.createCurse = function() {
	this.castingValue=6;
	this.hover = 'Target enemy unit inflict minimum damage when attacking.';
};

Spell.prototype.createMagicArrow = function() {
	this.castingValue=8;
	this.hover = 'Causes damage to target enemy troop.';
};

Spell.prototype.createBloodlust= function() {
console.log('.');
	this.castingValue=5;
	this.hover = 'Increases target allied troop\'s attack skill value for hand-to-hand attacks.';
};