import DS from 'ember-data';
import Ember from 'ember';

// Move to common
function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export default DS.Model.extend({
	name: DS.attr(),
	description: DS.attr(),
	ebc: DS.attr('number'),
	dbfg: DS.attr('number'),
	mc: DS.attr('number'),
	protein: DS.attr('number'),
	ingredientType: DS.belongsTo('mash-ingredient-type'),
	extractYield: Ember.computed('dbfg', 'mc', function () {
		//return (this.get('dbfg') / 100) - (this.get('mc') / 100) - 0.002;
		var result = (this.get('dbfg') / 100) / (1 + (this.get('mc') / 100)) - 0.002;
		return round(result, 2);
	}),
});
