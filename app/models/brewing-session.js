import DS from 'ember-data';
import { observer } from '@ember/object';
import { mapBy, sort, sum } from '@ember/object/computed';
import { computed } from '@ember/object';
import ArrayProxy from '@ember/array/proxy';

export default DS.Model.extend({
	init() {
		this._super(...arguments);
		this.entrySorting = ['addTime'];
		this.entrySortingDebug = ['entry.addTime'];
	},
	date: DS.attr('date', { defaultValue() { return new Date(); } }),
	recipe: DS.belongsTo('recipe'),
	brewingSystem: DS.belongsTo('brewing-system'),
	brewingSystemChanged: observer('brewingSystem', function () {
		this.send('becomeDirty');
	}),
	brewers: DS.hasMany('session-brewer'),
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
	finalVolume: DS.attr('number'),
	measuredFinalVolume: DS.attr('number'),
	boilTime: DS.attr('number'),
	measuredFirstWortSG: DS.attr('number'),
	measuredFirstSpargeSG: DS.attr('number'),
	measuredPreBoilSG: DS.attr('number'),
	measuredOG: DS.attr('number'),
	measuredFG: DS.attr('number'),
	yeastUsed: DS.attr('number'),
	sugarUsed: DS.attr('number'),
	mashEntries: DS.hasMany('mash-session-entry'),
	boilEntries: DS.hasMany('boil-session-entry'),
	mashEntriesWeights: mapBy('mashEntries', 'weight'),
	totalMaltWeight: sum('mashEntriesWeights'),
	waterToMaltRatio: computed('strikeWaterVolume', 'totalMaltWeight', function () {
		return this.get('strikeWaterVolume') / this.get('totalMaltWeight');
	}),
	recommendedStrikeWaterTemp: computed('waterToMaltRatio', 'recipe.mashingTemp', function () {
		var mashingTemp = Number(this.get('recipe.mashingTemp')); // This will default to 0 if not set
		// Formula based on http://braukaiser.com/wiki/index.php?title=Infusion_Mashing
		// 2.09 is ratio between qt/lb and l/kg
		var maltTemp = 20; // this should be part of session
		return (0.2 / (this.get('waterToMaltRatio') / 2.09)) * (mashingTemp - maltTemp) + mashingTemp;
	}),
	recipeScaling: computed('preBoilVolume', 'recipe.preBoilVolume', function () {
		return this.get('preBoilVolume') / this.get('recipe.preBoilVolume');
	}),
	preBoilVolumeCold: computed('recipe.preBoilVolumeCold', 'recipeScaling', function () {
		return this.get('recipe.preBoilVolumeCold') * this.get('recipeScaling');
	}),
	postBoilVolumeCold: computed('measuredPostBoilVolume', function () {
		return this.get('measuredPostBoilVolume') * 0.96;
	}),
	scaledPostBoilVolume: computed('recipe.postBoilVolume', 'recipeScaling', function () {
		return this.get('recipe.postBoilVolume') * this.get('recipeScaling');
	}),
	scaledFermentationVolume: computed('recipe.fermentationVolume', 'recipeScaling', function () {
		return this.get('recipe.fermentationVolume') * this.get('recipeScaling');
	}),
	scaledMashIngredients: computed('recipeScaling', 'recipe.mashEntries', function () {
		var list = ArrayProxy.create({ content: [] });
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
	totalMaltWeightRecipeScaled: computed('recipe.totalMaltWeight', 'recipeScaling', function () {
		return this.get('recipe.totalMaltWeight') * this.get('recipeScaling');
	}),
	extractYields: mapBy('mashEntries', 'weightedExtract'),
	averageExtractYield: sum('extractYields'),
	totalExtractWeight: computed('averageExtractYield', 'totalMaltWeight', 'brewingSystem.conversionEfficiency', function () {
		return this.get('totalMaltWeight') * this.get('averageExtractYield') * this.get('brewingSystem.conversionEfficiency') / 100;
	}),
	absorbedByMalt: computed('recipe.absorbedByMalt', 'recipeScaling', function () {
		return this.get('recipe.absorbedByMalt') * this.get('recipeScaling');
	}),
	strikeWaterVolumeOld: computed('recipe.strikeWaterVolume', 'recipeScaling', function () {
		return this.get('recipe.strikeWaterVolume') * this.get('recipeScaling');
	}),
	spargeWaterVolumeOld: computed('recipe.spargeWaterVolume', 'recipeScaling', function () {
		return this.get('recipe.spargeWaterVolume') * this.get('recipeScaling');
	}),
	firstWortSG: computed('strikeWaterVolume', 'totalExtractWeight', function () {
		var totalExtractWeight = this.get('totalExtractWeight');
		var maxPlato = 100 * totalExtractWeight / (this.get('strikeWaterVolume') + totalExtractWeight);
		return 1 + (maxPlato / (258.6 - ((maxPlato / 258.2) * 227.1)));
	}),
	firstWortExtractWeight: computed('totalExtractWeight', 'recipe.relativeRunOffSize', function () {
		return this.get('totalExtractWeight') * this.get('recipe.relativeRunOffSize');
	}),
	remainingExtractWeight: computed('firstWortExtractWeight', function () {
		// dependency on totalExtractWeight is implicit from firstWortExtract
		return this.get('totalExtractWeight') - this.get('firstWortExtractWeight');
	}),
	firstSpargeSG: computed('remainingExtractWeight', 'strikeWaterVolume', function () {
		var remainingExtractWeight = this.get('remainingExtractWeight');
		var plato = 100 * remainingExtractWeight / (this.get('strikeWaterVolume') + remainingExtractWeight);
		return 1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));
	}),
	firstSpargeExtractWeight: computed('remainingExtractWeight', 'recipe.relativeRunOffSize', function () {
		return this.get('remainingExtractWeight') * this.get('recipe.relativeRunOffSize');
	}),
	kettleExtractWeight: computed('firstWortExtractWeight', 'firstSpargeExtractWeight', function () {
		// This is the total amount of extract that we get into the boiling kettle and it will detemine both SG and OG
		return this.get('firstWortExtractWeight') + this.get('firstSpargeExtractWeight');
	}),
	brewhouseEfficiency: computed('kettleExtractWeight', 'totalExtractWeight', function () {
		return 100 * this.get('kettleExtractWeight') / this.get('totalExtractWeight');
	}),
	preBoilSG: computed('kettleExtractWeight', 'preBoilVolumeCold', function () {
		// ew = 2.59(sg - 1) * V
		// sg = ew/(V * 2.59) + 1
		return 1 + (this.get('kettleExtractWeight') / (this.get('preBoilVolumeCold') * 2.59));
	}),
	actualPreBoilPlato: computed('measuredPreBoilSG', function () {
		var measuredPreBoilSG = this.get('measuredPreBoilSG');
		//var plato = 259 - (259 / measuredPreBoilSG);
		return (135.997 * Math.pow(measuredPreBoilSG, 3)) - (630.272 * Math.pow(measuredPreBoilSG, 2)) + (1111.14 * measuredPreBoilSG) - 616.868;
	}),
	actualKettleExtract: computed('measuredPreBoilSG', 'actualPreBoilPlato', 'preBoilVolumeCold', function () {
		return this.get('preBoilVolumeCold') * this.get('measuredPreBoilSG') * (this.get('actualPreBoilPlato') / 100);
	}),
	sortedBoilEntries: sort('boilEntries', 'entrySorting'),
	boilExtracts: mapBy('boilEntries', 'extractWeight'),
	totalBoilExtract: sum('boilExtracts'),
	postBoilExtract: computed('totalBoilExtract', 'actualKettleExtract', function () {
		return this.get('actualKettleExtract') + this.get('totalBoilExtract');
	}),
	expectedPostBoilVolume: computed('measuredPreBoilVolume', 'brewingSystem.boilOffRate', 'boilTime', function () {
		return this.get('measuredPreBoilVolume') - (this.get('brewingSystem.boilOffRate') * this.get('boilTime') / 60);
	}),
	expectedPostBoilVolumeCold: computed('expectedPostBoilVolume', function () {
		return this.get('expectedPostBoilVolume') * 0.96;
	}),
	OG: computed('postBoilExtract', 'expectedPostBoilVolumeCold', function () {
		// ew = 2.59(sg - 1) * V
		// sg = ew/(V * 2.59) + 1
		return 1 + (this.get('postBoilExtract') / (this.get('expectedPostBoilVolumeCold') * 2.59));
	}),
	correctedOG: computed('recipe.OG', 'brewingSystem.conversionEfficiency', function () {
		return 1 + (this.get('recipe.OG') - 1) * (this.get('brewingSystem.conversionEfficiency') / 100);
	}),
	actualOGPlato: computed('measuredOG', function () {
		return 259 - (259 / this.get('measuredOG'));
	}),
	scaledBoilIngredients: computed('recipeScaling', 'boilEntries.{@each.addTime,@each.amount,@each.alpha}', 'recipe.boilTime', 'measuredPreBoilSG', 'postBoilVolumeCold', function () {
		var list = ArrayProxy.create({ content: [] });
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
	sortedBoilEntriesDebug: computed.sort('scaledBoilIngredients', 'entrySortingDebug'),
	IBUValues: mapBy('boilEntries', 'IBU'),
	IBU: sum('IBUValues'),
	requiredBoilTime: computed('measuredPreBoilVolume', 'postBoilVolume', 'brewingSystem.boilOffRate', function () {
		// we want to get minutes so multiply by 60
		return 60 * (this.get('measuredPreBoilVolume') - this.get('postBoilVolume')) / this.get('brewingSystem.boilOffRate');
	}),
	leftInKettle: computed('postBoilVolumeCold', 'measuredFermentationVolume', function () {
		return this.get('postBoilVolumeCold') - this.get('measuredFermentationVolume');
	}),
	leftInFermentor: computed('measuredFinalVolume', 'measuredFermentationVolume', function () {
		return this.get('measuredFermentationVolume') - this.get('measuredFinalVolume');
	}),
	yeastCellsNeeded: computed('actualOGPlato', 'fermentationVolume', 'recipe.pitchType.pitchRate', function () {
		return this.get('actualOGPlato') * this.get('fermentationVolume') * this.get('recipe.pitchType.pitchRate');
	}),
	yeastNeeded: computed('yeastCellsNeeded', 'recipe.yeast.cellConcentration', function () {
		return this.get('yeastCellsNeeded') / this.get('recipe.yeast.cellConcentration');
	}),
	correctedFG: computed('recipe.FG', 'brewingSystem.conversionEfficiency', function () {
		return 1 + (this.get('recipe.FG') - 1) * (this.get('brewingSystem.conversionEfficiency') / 100);
	}),
	FG: computed('measuredOG', 'recipe.yeast.attenuation', function () {
		return ((this.get('measuredOG') - 1.0) * (1.0 - (this.get('recipe.yeast.attenuation') / 100.0))) + 1.0;
	}),
	realFG: computed('measuredOG', 'measuredFG', function () {
		return 1 + (0.1808 * (this.get('measuredOG') - 1) + 0.8192 * (this.get('measuredFG') - 1));
	}),
	realFGPlato: computed('realFG', function () {
		return 259 - (259 / this.get('realFG'));
	}),
	postFermentationExtractWeight: computed('realFG', 'realFGPlato', 'fermentationVolume', function () {
		// volume * gravity = weight of the wort
		// plato is weight percentage extract
		// weight of wort * (plato / 100) = extract weight
		return this.get('fermentationVolume') * this.get('realFG') * (this.get('realFGPlato') / 100);
	}),
	postFermentationExtractWeightScaled: computed('recipe.postFermentationExtractWeight', 'recipeScaling', function () {
		return this.get('recipe.postFermentationExtractWeight') * this.get('recipeScaling');
	}),
	ABW: computed('actualOGPlato', 'realFGPlato', function () {
		var actualOGPlato = this.get('actualOGPlato');
		return (actualOGPlato - this.get('realFGPlato')) / (2.065 - (0.010665 * actualOGPlato));
	}),
	ABV: computed('FG', 'ABW', function () {
		return this.get('ABW') * (this.get('FG') / 0.794);
	}),
	realABV: computed('measuredFG', 'ABW', function () {
		return this.get('ABW') * (this.get('measuredFG') / 0.794);
	}),
	approxABV: computed('measuredOG', 'measuredFG', function () {
		return (this.get('measuredOG') - this.get('measuredFG')) * 131.5;
	}),
	requiredTableSugarMin: computed('measuredFinalVolume', 'recipe.{dissolvedCO2,beer.beerType.primingCo2Min}', function () {
		// target CO2 (g/l) = dissoled CO2 (g/l) + 0.5 * mass table-sugar (g) / volume beer (l)
		// 0.5 * mass ts / volume = target CO2 - dissolved CO2
		// mass ts = (volume / 0.5) * (target CO2 - dissolved CO2)
		return (this.get('measuredFinalVolume') / 0.5) * (this.get('recipe.beer.beerType.primingCo2Min') - this.get('recipe.dissolvedCO2'));
	}),
	requiredTableSugarMax: computed('measuredFinalVolume', 'recipe.{dissolvedCO2,beer.beerType.primingCo2Max}', function () {
		// target CO2 (g/l) = dissoled CO2 (g/l) + 0.5 * mass table-sugar (g) / volume beer (l)
		// 0.5 * mass ts / volume = target CO2 - dissolved CO2
		// mass ts = (volume / 0.5) * (target CO2 - dissolved CO2)
		return (this.get('measuredFinalVolume') / 0.5) * (this.get('recipe.beer.beerType.primingCo2Max') - this.get('recipe.dissolvedCO2'));
	}),
	comments: DS.hasMany('brewing-session-comment'),
	commentCount: computed('comments', function () { return this.get('comments.length'); }),
	rootComments: computed.filterBy('comments', 'isRoot', true),
});
