import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	date: DS.attr('date', { defaultValue() { return new Date(); } }),
	recipe: DS.belongsTo('recipe'),
	brewingSystem: DS.belongsTo('brewing-system'),
	preBoilVolume: DS.attr('number'),
	postBoilVolumeCold: DS.attr('number'),
	finalVolume: DS.attr('number'),
	recipeScaling: Ember.computed('preBoilVolume', 'recipe.preBoilVolume', function () {
		return this.get('preBoilVolume') / this.get('recipe.preBoilVolume');
	}),
	preBoilVolumeCold: Ember.computed('recipe.preBoilVolumeCold', 'recipeScaling', function () {
		return this.get('recipe.preBoilVolumeCold') * this.get('recipeScaling');
	}),
	scaledMashIngredients: Ember.computed('recipeScaling', 'recipe.mashEntries', function () {
		var list = Ember.ArrayProxy.create({ content: [] });
		var recipeScaling = this.get('recipeScaling');
		this.get('recipe.mashEntries').then(function (items) {
			items.forEach(function (item) {
				list.addObject({
					"entry": item,
					"weight": item.get('weight') * recipeScaling,
				});
			});
		});
		return list;
	}),
	totalMaltWeight: Ember.computed('recipe.totalMaltWeight', 'recipeScaling', function () {
		return this.get('recipe.totalMaltWeight') * this.get('recipeScaling');
	}),
	totalExtractWeight: Ember.computed('recipe.totalExtractWeight', 'brewingSystem.conversionEfficiency', 'recipeScaling', function () {
		return this.get('recipe.totalExtractWeight') * this.get('recipeScaling') * this.get('brewingSystem.conversionEfficiency') / 100;
	}),
	absorbedByMalt: Ember.computed('recipe.absorbedByMalt', 'recipeScaling', function () {
		return this.get('recipe.absorbedByMalt') * this.get('recipeScaling');
	}),
	strikeWaterVolume: Ember.computed('recipe.strikeWaterVolume', 'recipeScaling', function () {
		return this.get('recipe.strikeWaterVolume') * this.get('recipeScaling');
	}),
	spargeWaterVolume: Ember.computed('recipe.spargeWaterVolume', 'recipeScaling', function () {
		return this.get('recipe.spargeWaterVolume') * this.get('recipeScaling');
	}),
	firstWortSG: Ember.computed('strikeWaterVolume', 'totalExtractWeight', function () {
		var totalExtractWeight = this.get('totalExtractWeight');
		var maxPlato = 100 * totalExtractWeight / (this.get('strikeWaterVolume') + totalExtractWeight);
		return 1 + (maxPlato / (258.6 - ((maxPlato / 258.2) * 227.1)));
	}),
	firstWortExtractWeight: Ember.computed('totalExtractWeight', 'recipe.relativeRunOffSize', function () {
		return this.get('totalExtractWeight') * this.get('recipe.relativeRunOffSize');
	}),
	remainingExtractWeight: Ember.computed('firstWortExtractWeight', function () {
		// dependency on totalExtractWeight is implicit from firstWortExtract
		return this.get('totalExtractWeight') - this.get('firstWortExtractWeight');
	}),
	firstSpargeSG: Ember.computed('remainingExtractWeight', 'strikeWaterVolume', function () {
		var remainingExtractWeight = this.get('remainingExtractWeight');
		var plato = 100 * remainingExtractWeight / (this.get('strikeWaterVolume') + remainingExtractWeight);
		return 1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));
	}),
	firstSpargeExtractWeight: Ember.computed('remainingExtractWeight', 'recipe.relativeRunOffSize', function () {
		return this.get('remainingExtractWeight') * this.get('recipe.relativeRunOffSize');
	}),
	kettleExtractWeight: Ember.computed('firstWortExtractWeight', 'firstSpargeExtractWeight', function () {
		// This is the total amount of extract that we get into the boiling kettle and it will detemine both SG and OG
		return this.get('firstWortExtractWeight') + this.get('firstSpargeExtractWeight');
	}),
	preBoilSG: Ember.computed('kettleExtractWeight', 'preBoilVolumeCold', function () {
		var kettleExtractWeight = this.get('kettleExtractWeight');
		var plato = 100 * kettleExtractWeight / (this.get('preBoilVolumeCold') + kettleExtractWeight);
		return 1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));
	}),
	OG: Ember.computed('kettleExtractWeight', 'postBoilVolumeCold', function () {
		var kettleExtractWeight = this.get('kettleExtractWeight');
		var plato = 100 * kettleExtractWeight / (Number(this.get('postBoilVolumeCold')) + kettleExtractWeight);
		return 1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));
	}),
	scaledBoilIngredients: Ember.computed('recipeScaling', 'recipe.boilEntries', 'recipe.boilTime', 'preBoilSG', 'postBoilVolumeCold', function () {
		var list = Ember.ArrayProxy.create({ content: [] });
		var recipeScaling = this.get('recipeScaling');
		var boilTime = this.get('recipe.boilTime');
		var preBoilSG = this.get('preBoilSG');
		var postBoilVolumeCold = this.get('postBoilVolumeCold');
		this.get('recipe.boilEntries').then(function (items) {
			items.forEach(function (item) {
				var bignessFactor = 1.65 * Math.pow(0.000125, preBoilSG - 1);
				var timeInMins = boilTime - item.get('addTime');
				var boilTimeFactor = (1 - Math.exp(-0.04 * timeInMins)) / 4.15;
				var alphaAcidUtilization = bignessFactor * boilTimeFactor;
				var mgPerLitreAlphaAcids = (item.get('ingredient.alpha') / 100) * (item.get('amount') * 1000) / postBoilVolumeCold;
				list.addObject({
					"entry": item,
					"amount": item.get('amount') * recipeScaling,
					"IBU": alphaAcidUtilization * mgPerLitreAlphaAcids,
				});
			});
		});
		return list;
	}),
});
