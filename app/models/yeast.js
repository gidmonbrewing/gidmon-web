import DS from 'ember-data';

export default DS.Model.extend({
	name: DS.attr('string'),
	description: DS.attr('string'),
	attenuation: DS.attr('number'),
	cellConcentration: DS.attr('number'),
});
