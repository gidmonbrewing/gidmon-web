import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
	recipe: DS.belongsTo('recipe'),
	ingredient: DS.belongsTo('mash-ingredient'),
	amount: DS.attr('number'),
	weight: computed('amount', 'recipe.totalMaltWeight', function () {
		return this.get('recipe.totalMaltWeight') * (this.get('amount') / 100);
	}),
	weightedExtract: computed('amount', 'ingredient.extractYield', function () {
		return this.get('ingredient.extractYield') * (this.get('amount') / 100);
	}),
});
