import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	date: DS.attr('date', { defaultValue() { return new Date(); } }),
	recipe: DS.belongsTo('recipe'),
	brewingSystem: DS.belongsTo('brewing-system'),
	strikeWaterVolume: DS.attr('number'),
	strikeWaterTemp: DS.attr('number'),
	spargeWaterVolume: DS.attr('number'),
	spargeWaterTemp: DS.attr('number'),
	preBoilVolume: DS.attr('number'),
	measuredPreBoilVolume: DS.attr('number'),
	postBoilVolume: DS.attr('number'),
	measuredPostBoilVolume: DS.attr('number'),
	fermentationVolume: DS.attr('number'),
	measuredFermentationVolume: DS.attr('number'),
	boilTime: DS.attr('number'),
	measuredFirstWortSG: DS.attr('number'),
	measuredFirstSpargeSG: DS.attr('number'),
	measuredPreBoilSG: DS.attr('number'),
	measuredOG: DS.attr('number'),
	measuredFG: DS.attr('number'),
	yeastUsed: DS.attr('number'),
	mashEntries: DS.hasMany('mash-session-entry'),
	boilEntries: DS.hasMany('boil-session-entry'),
	mashEntriesWeights: Ember.computed.mapBy('mashEntries', 'weight'),
	totalMaltWeight: Ember.computed.sum('mashEntriesWeights'),
	waterToMaltRatio: Ember.computed('strikeWaterVolume', 'totalMaltWeight', function () {
		return this.get('strikeWaterVolume') / this.get('totalMaltWeight');
	}),
	recommendedStrikeWaterTemp: Ember.computed('waterToMaltRatio', 'recipe.mashingTemp', function () {
		var mashingTemp = Number(this.get('recipe.mashingTemp')); // This will default to 0 if not set
		// Formula based on http://braukaiser.com/wiki/index.php?title=Infusion_Mashing
		// 2.09 is ratio between qt/lb and l/kg
		var maltTemp = 20; // this should be part of session
		return (0.2 / (this.get('waterToMaltRatio') / 2.09)) * (mashingTemp - maltTemp) + mashingTemp;
	}),
	recipeScaling: Ember.computed('preBoilVolume', 'recipe.preBoilVolume', function () {
		return this.get('preBoilVolume') / this.get('recipe.preBoilVolume');
	}),
	preBoilVolumeCold: Ember.computed('recipe.preBoilVolumeCold', 'recipeScaling', function () {
		return this.get('recipe.preBoilVolumeCold') * this.get('recipeScaling');
	}),
	postBoilVolumeCold: Ember.computed('measuredPostBoilVolume', function () {
		return this.get('measuredPostBoilVolume') * 0.96;
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
	totalMaltWeightOld: Ember.computed('recipe.totalMaltWeight', 'recipeScaling', function () {
		return this.get('recipe.totalMaltWeight') * this.get('recipeScaling');
	}),
	extractYields: Ember.computed.mapBy('mashEntries', 'weightedExtract'),
	averageExtractYield: Ember.computed.sum('extractYields'),
	totalExtractWeight: Ember.computed('averageExtractYield', 'totalMaltWeight', 'brewingSystem.conversionEfficiency', function () {
		return this.get('totalMaltWeight') * this.get('averageExtractYield') * this.get('brewingSystem.conversionEfficiency') / 100;
	}),
	absorbedByMalt: Ember.computed('recipe.absorbedByMalt', 'recipeScaling', function () {
		return this.get('recipe.absorbedByMalt') * this.get('recipeScaling');
	}),
	strikeWaterVolumeOld: Ember.computed('recipe.strikeWaterVolume', 'recipeScaling', function () {
		return this.get('recipe.strikeWaterVolume') * this.get('recipeScaling');
	}),
	spargeWaterVolumeOld: Ember.computed('recipe.spargeWaterVolume', 'recipeScaling', function () {
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
	brewhouseEfficiency: Ember.computed('kettleExtractWeight', 'totalExtractWeight', function () {
		return 100 * this.get('kettleExtractWeight') / this.get('totalExtractWeight');
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
	entrySorting: ['addTime'],
	sortedBoilEntries: Ember.computed.sort('boilEntries', 'entrySorting'),
	boilExtracts: Ember.computed.mapBy('boilEntries', 'extractWeight'),
	totalBoilExtract: Ember.computed.sum('boilExtracts'),
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
	entrySortingDebug: ['entry.addTime'],
	sortedBoilEntriesDebug: Ember.computed.sort('scaledBoilIngredients', 'entrySortingDebug'),
	requiredBoilTime: Ember.computed('measuredPreBoilVolume', 'postBoilVolume', 'brewingSystem.boilOffRate', function () {
		// we want to get minutes so multiply by 60
		return 60 * (this.get('measuredPreBoilVolume') - this.get('postBoilVolume')) / this.get('brewingSystem.boilOffRate');
	}),
	leftInKettle: Ember.computed('postBoilVolumeCold', 'measuredFermentationVolume', function () {
		return this.get('postBoilVolumeCold') - this.get('measuredFermentationVolume');
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
	comments: DS.hasMany('brewing-session-comment'),
	commentCount: Ember.computed('comments', function () { return this.get('comments.length'); }),
	rootComments: Ember.computed.filterBy('comments', 'isRoot', true),
	brewingSystemChanged: Ember.observer('brewingSystem', function () {
		console.log(`brewingSystem changed to: ${this.get('brewingSystem')}`);
		this.send('becomeDirty');
	})
});
