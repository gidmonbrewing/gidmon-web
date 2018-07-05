import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
	name: DS.attr(),
	description: DS.attr(),
	ebc: DS.attr('number'),
	dbfg: DS.attr('number'),
	mc: DS.attr('number'),
	protein: DS.attr('number'),
	ingredientType: DS.belongsTo('mash-ingredient-type'),
	extractYield: computed('dbfg', 'mc', function () {
		//return (this.get('dbfg') / 100) - (this.get('mc') / 100) - 0.002;
		return (this.get('dbfg') / 100) / (1 + (this.get('mc') / 100)) - 0.002;
	}),
});
