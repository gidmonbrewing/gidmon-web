import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	recipe: DS.belongsTo('recipe'),
	ingredient: DS.belongsTo('mash-ingredient'),
	amount: DS.attr('number'),
	weight: Ember.computed('amount', 'recipe.totalMaltWeight', function () {
		return this.get('recipe.totalMaltWeight') * (this.get('amount') / 100);
	}),
	weightedExtract: Ember.computed('amount', 'ingredient.extractYield', function () {
		return this.get('ingredient.extractYield') * (this.get('amount') / 100);
	}),
});
