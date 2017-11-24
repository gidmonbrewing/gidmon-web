import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	session: DS.belongsTo('brewing-session'),
	recipeEntry: DS.belongsTo('boil-recipe-entry'),
	alpha: DS.attr('number'),
	amount: DS.attr('number'),
	addTime: Ember.computed('recipeEntry.boilTime', 'session.boilTime', function () {
		var addTime = this.get('session.boilTime') - this.get('recipeEntry.boilTime');
		if (addTime < 0) {
			return 0;
		} else {
			return addTime;
		}
	}),
	IBU: Ember.computed('session.preBoilSG', 'recipeEntry.boilTime', 'session.postBoilVolumeCold', 'alpha', 'amount', function () {
		var bignessFactor = 1.65 * Math.pow(0.000125, this.get('session.preBoilSG') - 1);
		var timeInMins = this.get('recipeEntry.boilTime');
		var boilTimeFactor = (1 - Math.exp(-0.04 * timeInMins)) / 4.15;
		var alphaAcidUtilization = bignessFactor * boilTimeFactor;
		var mgPerLitreAlphaAcids = (this.get('alpha') / 100) * (this.get('amount') * 1000) / this.get('session.postBoilVolumeCold');
		return alphaAcidUtilization * mgPerLitreAlphaAcids;
	}),
	extractWeight: Ember.computed('recipeEntry.ingredient.extract', 'amount', function () {
		// this should be in kg so we have to divide by 1000
		return this.get('amount') * (this.get('recipeEntry.ingredient.extract') / 100) / 1000;
	}),
});
