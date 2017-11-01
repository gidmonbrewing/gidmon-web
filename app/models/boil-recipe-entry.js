import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	recipe: DS.belongsTo('recipe'),
	ingredient: DS.belongsTo('boil-ingredient'),
	amount: DS.attr('number'),
	boilTime: DS.attr('number'),
	isHops: Ember.computed('ingredient.ingredientType', function () {
		return this.get('ingredient.ingredientType') !== "other";
	}),
	addTime: Ember.computed('boilTime', 'recipe.boilTime', {
		get(key) {
			var addTime = this.get('recipe.boilTime') - this.get('boilTime');
			if (addTime < 0) {
				return 0;
			} else {
				return addTime;
			}
		},
		set(key, value) {
			this.set('boilTime', this.get('recipe.boilTime') - value);
			return value;
		}
	}),
	IBU: Ember.computed('recipe.preBoilSG', 'recipe.boilTime', 'recipe.postBoilVolumeCold', 'ingredient.alpha', 'addTime', 'amount', function () {
		var bignessFactor = 1.65 * Math.pow(0.000125, this.get('recipe.preBoilSG') - 1);
		var timeInMins = this.get('recipe.boilTime') - this.get('addTime');
		var boilTimeFactor = (1 - Math.exp(-0.04 * timeInMins)) / 4.15;
		var alphaAcidUtilization = bignessFactor * boilTimeFactor;
		var mgPerLitreAlphaAcids = (this.get('ingredient.alpha') / 100) * (this.get('amount') * 1000) / this.get('recipe.postBoilVolumeCold');
		return alphaAcidUtilization * mgPerLitreAlphaAcids;
	}),
	extractWeight: Ember.computed('ingredient.extract', 'amount', function () {
		// this should be in kg so we have to divide by 1000
		return this.get('amount') * (this.get('ingredient.extract') / 100) / 1000;
	}),
});
