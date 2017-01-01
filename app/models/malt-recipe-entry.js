import DS from 'ember-data';

export default DS.Model.extend({
	recipe: DS.belongsTo('recipe'),
	malt: DS.belongsTo('malt'),
	amount: DS.attr('number'),
});
