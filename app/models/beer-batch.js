import DS from 'ember-data';

export default DS.Model.extend({
	beer: DS.belongsTo('beer'),
	name: DS.attr(),
	abv: DS.attr(),
	untappdUrl: DS.attr(),
});
