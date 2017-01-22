import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	date: DS.attr('date', { defaultValue() { return new Date(); } }),
	recipe: DS.belongsTo('recipe'),
	brewingSystem: DS.belongsTo('brewing-system'),
	preBoilVolume: DS.attr('number'),
	postBoilVolume: DS.attr('number'),
	fermentationVolume: DS.attr('number'),
	measuredFirstWortSG: DS.attr('number'),
	measuredFirstSpargeSG: DS.attr('number'),
	measuredPreBoilSG: DS.attr('number'),
	measuredOG: DS.attr('number'),
	measuredFG: DS.attr('number'),
	yeastUsed: DS.attr('number'),
	boilEntries: DS.hasMany('boil-session-entry'),
	recipeScaling: Ember.computed('preBoilVolume', 'recipe.preBoilVolume', function () {
		return this.get('preBoilVolume') / this.get('recipe.preBoilVolume');
	}),
	preBoilVolumeCold: Ember.computed('recipe.preBoilVolumeCold', 'recipeScaling', function () {
		return this.get('recipe.preBoilVolumeCold') * this.get('recipeScaling');
	}),
	postBoilVolumeCold: Ember.computed('postBoilVolume', function () {
		return this.get('postBoilVolume') * 0.96;
	}),
	scaledPostBoilVolume: Ember.computed('recipe.postBoilVolume', 'recipeScaling', function () {
		return this.get('recipe.postBoilVolume') * this.get('recipeScaling');
	}),
	scaledFermentationVolume: Ember.computed('recipe.fermentationVolume', 'recipeScaling', function () {
		return this.get('recipe.fermentationVolume') * this.get('recipeScaling');
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
	brewhouseEfficiency: Ember.computed('kettleExtractWeight', 'recipe.totalExtractWeight', function () {
		return 100 * this.get('kettleExtractWeight') / this.get('recipe.totalExtractWeight');
	}),
	preBoilSG: Ember.computed('kettleExtractWeight', 'preBoilVolumeCold', function () {
		// ew = 2.59(sg - 1) * V
		// sg = ew/(V * 2.59) + 1
		return 1 + (this.get('kettleExtractWeight') / (this.get('preBoilVolumeCold') * 2.59));
	}),
	actualPreBoilPlato: Ember.computed('measuredPreBoilSG', function () {
		var measuredPreBoilSG = this.get('measuredPreBoilSG');
		//var plato = 259 - (259 / measuredPreBoilSG);
		return (135.997 * Math.pow(measuredPreBoilSG, 3)) - (630.272 * Math.pow(measuredPreBoilSG, 2)) + (1111.14 * measuredPreBoilSG) - 616.868;
	}),
	actualKettleExtract: Ember.computed('measuredPreBoilSG', 'actualPreBoilPlato', 'preBoilVolumeCold', function () {
		return this.get('preBoilVolumeCold') * this.get('measuredPreBoilSG') * (this.get('actualPreBoilPlato') / 100);
	}),
	totalBoilExtract: Ember.computed('recipe.totalBoilExtract', 'recipeScaling', function () {
		return this.get('recipe.totalBoilExtract') * this.get('recipeScaling');
	}),
	postBoilExtract: Ember.computed('totalBoilExtract', 'actualKettleExtract', function () {
		return this.get('actualKettleExtract') + this.get('totalBoilExtract');
	}),
	OG: Ember.computed('postBoilExtract', 'postBoilVolumeCold', function () {
		// ew = 2.59(sg - 1) * V
		// sg = ew/(V * 2.59) + 1
		return 1 + (this.get('postBoilExtract') / (this.get('postBoilVolumeCold') * 2.59));
	}),
	correctedOG: Ember.computed('recipe.OG', 'brewingSystem.conversionEfficiency', function () {
		return 1 + (this.get('recipe.OG') - 1) * (this.get('brewingSystem.conversionEfficiency') / 100);
	}),
	actualOGPlato: Ember.computed('measuredOG', function () {
		return 259 - (259 / this.get('measuredOG'));
	}),
	scaledBoilIngredients: Ember.computed('recipeScaling', 'boilEntries.@each.addTime', 'boilEntries.@each.amount', 'boilEntries.@each.alpha', 'recipe.boilTime', 'measuredPreBoilSG', 'postBoilVolumeCold', function () {
		var list = Ember.ArrayProxy.create({ content: [] });
		var recipeScaling = this.get('recipeScaling');
		var boilTime = this.get('recipe.boilTime');
		var preBoilSG = this.get('measuredPreBoilSG');
		var postBoilVolumeCold = this.get('postBoilVolumeCold');
		this.get('boilEntries').then(function (items) {
			items.forEach(function (item) {
				var bignessFactor = 1.65 * Math.pow(0.000125, preBoilSG - 1);
				var timeInMins = boilTime - item.get('addTime');
				var boilTimeFactor = (1 - Math.exp(-0.04 * timeInMins)) / 4.15;
				var alphaAcidUtilization = bignessFactor * boilTimeFactor;
				var mgPerLitreAlphaAcids = (item.get('alpha') / 100) * (item.get('amount') * 1000) / postBoilVolumeCold;
				list.addObject({
					"entry": item,
					"amount": item.get('amount') * recipeScaling,
					"IBU": alphaAcidUtilization * mgPerLitreAlphaAcids,
				});
			});
		});
		return list;
	}),
	entrySorting: ['entry.addTime'],
	sortedBoilEntries: Ember.computed.sort('scaledBoilIngredients', 'entrySorting'),
	boilTime: Ember.computed('preBoilVolume', 'scaledPostBoilVolume', 'brewingSystem.boilOffRate', function () {
		// we want to get minutes so multiply by 60
		return 60 * (this.get('preBoilVolume') - this.get('scaledPostBoilVolume')) / this.get('brewingSystem.boilOffRate');
	}),
	yeastCellsNeeded: Ember.computed('actualOGPlato', 'fermentationVolume', 'recipe.pitchType.pitchRate', function () {
		return this.get('actualOGPlato') * this.get('fermentationVolume') * this.get('recipe.pitchType.pitchRate');
	}),
	yeastNeeded: Ember.computed('yeastCellsNeeded', 'recipe.yeast.cellConcentration', function () {
		return this.get('yeastCellsNeeded') / this.get('recipe.yeast.cellConcentration');
	}),
	correctedFG: Ember.computed('recipe.FG', 'brewingSystem.conversionEfficiency', function () {
		return 1 + (this.get('recipe.FG') - 1) * (this.get('brewingSystem.conversionEfficiency') / 100);
	}),
	FG: Ember.computed('measuredOG', 'recipe.yeast.attenuation', function () {
		return ((this.get('measuredOG') - 1.0) * (1.0 - (this.get('recipe.yeast.attenuation') / 100.0))) + 1.0;
	}),
	realFG: Ember.computed('measuredFG', function () {
		// measuredOG dependency is implicit
		return 1 + (0.1808 * (this.get('measuredOG') - 1) + 0.8192 * (this.get('measuredFG') - 1));
	}),
	realFGPlato: Ember.computed('realFG', function () {
		return 259 - (259 / this.get('realFG'));
	}),
	postFermentationExtractWeight: Ember.computed('realFG', 'realFGPlato', 'fermentationVolume', function () {
		// volume * gravity = weight of the wort
		// plato is weight percentage extract
		// weight of wort * (plato / 100) = extract weight
		return this.get('fermentationVolume') * this.get('realFG') * (this.get('realFGPlato') / 100);
	}),
	postFermentationExtractWeightScaled: Ember.computed('recipe.postFermentationExtractWeight', 'recipeScaling', function () {
		return this.get('recipe.postFermentationExtractWeight') * this.get('recipeScaling');
	}),
	ABW: Ember.computed('actualOGPlato', 'realFGPlato', function () {
		var actualOGPlato = this.get('actualOGPlato');
		return (actualOGPlato - this.get('realFGPlato')) / (2.065 - (0.010665 * actualOGPlato));
	}),
	ABV: Ember.computed('measuredFG', 'ABW', function () {
		return this.get('ABW') * (this.get('measuredFG') / 0.794);
	}),
	approxABV: Ember.computed('measuredOG', 'measuredFG', function () {
		return (this.get('measuredOG') - this.get('measuredFG')) * 131.5;
	}),
});
