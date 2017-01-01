import DS from 'ember-data';

export default DS.Model.extend({
	name: DS.attr(),
	description: DS.attr(),
	ebc: DS.attr('number'),
	dbfg: DS.attr('number'),
	mc: DS.attr('number'),
	protein: DS.attr('number'),
	maltType: DS.belongsTo('malt-type'),
});
