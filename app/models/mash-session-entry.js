import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	session: DS.belongsTo('brewing-session'),
	recipeEntry: DS.belongsTo('mash-recipe-entry'),
	weight: DS.attr('number'),
	amount: Ember.computed('weight', 'session.totalMaltWeight', function () {
		return this.get('weight') / this.get('session.totalMaltWeight') * 100;
	}),
	weightedExtract: Ember.computed('amount', 'ingredient.extractYield', function () {
		return this.get('ingredient.extractYield') * (this.get('amount') / 100);
	}),
});
