import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	name: DS.attr(),
	description: DS.attr(),
	ebc: DS.attr('number'),
	dbfg: DS.attr('number'),
	mc: DS.attr('number'),
	protein: DS.attr('number'),
	maltType: DS.belongsTo('malt-type'),
	extractYield: Ember.computed('dbfg', 'mc', function () {
		return (this.get('dbfg') / 100) - (this.get('mc') / 100) - 0.002;
	}),
});
