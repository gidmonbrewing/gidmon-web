import DS from 'ember-data';

export default DS.Model.extend({
	name: DS.attr(),
	primingCo2Min: DS.attr('number'),
	primingCo2Max: DS.attr('number'),
});
