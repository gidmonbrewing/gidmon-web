import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	recipe: DS.belongsTo('recipe'),
	ingredient: DS.belongsTo('mash-ingredient'),
	amount: DS.attr('number'),
	weight: Ember.computed('amount', 'recipe', function () {

	}),
});
