const RollManager = (function(){
	var Constructor = function() {
		this.action="";
}, instance = null;	
	
	return {
		Cast: function(spell) {
			this.action='Cast';
			this.spellName=spell;
			return true;
		},
		
		Dispel: function(threshold) {
			this.action='Dispel';
			this.threshold=threshold;
			this.sendedAnswer=false;
			return;
		},
		
		DispatchRoll: function(result) {
			if(this.action=='Cast') {
				HEROES[0].castingDice -= result.length;			
				var spell = new Spell(this.spellName);
				spell.tryCast(result);			
				$('.spell').css('border', '0'); 
			} else if(this.action=='Dispel') {
				HEROES[0].dispelDice -= result.length;
				var spell = new Spell();
				spell.dispel(result, this.threshold);				
				this.sendedAnswer=true;
				$( "#chargeRespondDialog" ).dialog('close');				
			}
		},
		
		reset: function() {
			this.name='';
			this.action='';
			$('.spell').css('border', '0'); 
		},
		
		isAnswerSend: function() {
			return this.sendedAnswer;
		},
		
		getInstance: function (){
			return instance || (instance = new Constructor);
		},
	}	
	
})();