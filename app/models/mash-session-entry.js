import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
	session: DS.belongsTo('brewing-session'),
	recipeEntry: DS.belongsTo('mash-recipe-entry'),
	weight: DS.attr('number'),
	amount: computed('weight', 'session.totalMaltWeight', function () {
		return this.get('weight') / this.get('session.totalMaltWeight') * 100;
	}),
	weightedExtract: computed('amount', 'recipeEntry.ingredient.extractYield', function () {
		return this.get('recipeEntry.ingredient.extractYield') * (this.get('amount') / 100);
	}),
});
