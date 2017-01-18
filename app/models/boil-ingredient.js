import DS from 'ember-data';

export default DS.Model.extend({
	name: DS.attr(),
	description: DS.attr(),
	alpha: DS.attr('number'),
	extract: DS.attr('number'),
	ingredientType: DS.attr(),
});
