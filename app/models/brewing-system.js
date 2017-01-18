import DS from 'ember-data';

export default DS.Model.extend({
	name: DS.attr(),
	conversionEfficiency: DS.attr('number'),
	boilOffRate: DS.attr('number'),
});
