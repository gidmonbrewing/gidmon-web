import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import Ember from 'ember';

export default Model.extend({
	beer: belongsTo('beer'),
	creator: belongsTo('user'),
	mashingTemp: attr('number'),
	mashingTime: attr('number'),
	mashOutTemp: attr('number'),
	mashOutTime: attr('number'),
	spargeCount: attr('number'),
	spargeWaterTemp: attr('number'),
	preBoilVolume: attr('number'),
	postBoilVolume: attr('number'),
	fermentationVolume: attr('number'),
	boilTime: attr('number'),
	totalMaltWeight: attr('number'),
	primaryFermentationTemp: attr('number'),
	primaryFermentationTime: attr('number'),
	yeast: belongsTo('yeast'),
	yeastAmount: attr('number'),
	targetPitchRate: attr('number'),
	boilEntries: hasMany('boil-recipe-entry'),
	mashEntries: hasMany('mash-recipe-entry'),
	mashEntriesAmounts: Ember.computed.mapBy('mashEntries', 'amount'),
	totalAmount: Ember.computed.sum('mashEntriesAmounts'),
	sessions: hasMany('brewing-session'),
	unassignedMalt: Ember.computed('totalAmount', function () {
		return 100 - this.get('totalAmount');
	}),
	absorbedByMalt: Ember.computed('totalMaltWeight', function () {
		return this.get('totalMaltWeight') * 0.9;
	}),
	preBoilVolumeCold: Ember.computed('preBoilVolume', function () {
		return this.get('preBoilVolume') * 0.96; // Warm volume is 4% larger
	}),
	strikeWaterVolume: Ember.computed('preBoilVolumeCold', 'spargeCount', 'absorbedByMalt', function () {
		// The volume in the kettle during lautering will be larger since this is cold volume
		return this.get('preBoilVolumeCold') / (this.get('spargeCount') + 1) + this.get('absorbedByMalt');
	}),
	spargeWaterVolume: Ember.computed('preBoilVolumeCold', 'spargeCount', function () {
		// The volume in the kettle during lautering will be larger since this is cold volume
		var spargeCount = this.get('spargeCount');
		if (spargeCount < 1) {
			return 0;
		} else {
			return Number(this.get('preBoilVolumeCold')) / (spargeCount + 1); // half is from first run off and half from first sparge
		}
	}),
	waterToMaltRatio: Ember.computed('strikeWaterVolume', 'totalMaltWeight', function () {
		return this.get('strikeWaterVolume') / this.get('totalMaltWeight');
	}),
	strikeWaterTemp: Ember.computed('waterToMaltRatio', 'mashingTemp', function () {
		var mashingTemp = Number(this.get('mashingTemp')); // This will default to 0 if not set
		// Formula based on http://braukaiser.com/wiki/index.php?title=Infusion_Mashing
		// 2.09 is ratio between qt/lb and l/kg
		var maltTemp = 20; // this should be part of session
		return (0.2 / (this.get('waterToMaltRatio') / 2.09)) * (mashingTemp - maltTemp) + mashingTemp;
	}),
	lauterEfficiency: Ember.computed('spargeCount', 'absorbedByMalt', 'strikeWaterVolume', 'spargeWaterVolume', function () {
		var spargeCount = this.get('spargeCount');
		if (spargeCount === 0) {
			return 100;
		} else { // we should handle multiple sparges
			// Based on http://braukaiser.com/wiki/index.php?title=Batch_Sparging_Analysis
			var strikeWaterVolume = this.get('strikeWaterVolume');
			var spargeWaterVolume = Number(this.get('spargeWaterVolume'));
			var efficiency = (spargeWaterVolume + (this.get('absorbedByMalt') * spargeWaterVolume) / strikeWaterVolume) / strikeWaterVolume;
			return 100 * efficiency;
		}
	}),
	extractYields: Ember.computed.mapBy('mashEntries', 'weightedExtract'),
	averageExtractYield: Ember.computed.sum('extractYields'),
	totalExtractWeight: Ember.computed('averageExtractYield', 'totalMaltWeight', function () {
		return this.get('totalMaltWeight') * this.get('averageExtractYield');
	}),
	firstWortSG: Ember.computed('strikeWaterVolume', 'totalExtractWeight', function () {
		var totalExtractWeight = this.get('totalExtractWeight');
		var maxPlato = 100 * totalExtractWeight / (this.get('strikeWaterVolume') + totalExtractWeight);
		return 1 + (maxPlato / (258.6 - ((maxPlato / 258.2) * 227.1)));
	}),
	relativeRunOffSize: Ember.computed('spargeWaterVolume', 'strikeWaterVolume', function () {
		// Sparge water volume is the same as the cold run off volume.
		// We want to know what percentage of the volume that ends up in the kettle (the rest is absorbed by malt)
		return this.get('spargeWaterVolume') / this.get('strikeWaterVolume');
	}),
	firstWortExtractWeight: Ember.computed('totalExtractWeight', 'relativeRunOffSize', function () {
		return this.get('totalExtractWeight') * this.get('relativeRunOffSize');
	}),
	remainingExtractWeight: Ember.computed('firstWortExtractWeight', function () {
		// dependency on totalExtractWeight is implicit from firstWortExtract
		return this.get('totalExtractWeight') - this.get('firstWortExtractWeight');
	}),
	firstSpargeSG: Ember.computed('remainingExtractWeight', function () {
		var remainingExtractWeight = this.get('remainingExtractWeight');
		// strikeWaterVolume dependency is implicit from remainingExtractWeight
		var plato = 100 * remainingExtractWeight / (this.get('strikeWaterVolume') + remainingExtractWeight);
		return 1 + (plato / (258.6 - ((plato / 258.2) * 227.1)));
	}),
	firstSpargeExtractWeight: Ember.computed('remainingExtractWeight', 'relativeRunOffSize', function () {
		return this.get('remainingExtractWeight') * this.get('relativeRunOffSize');
	}),
	kettleExtractWeight: Ember.computed('firstWortExtractWeight', 'firstSpargeExtractWeight', function () {
		// This is the total amount of extract that we get into the boiling kettle and it will detemine both SG and OG
		return this.get('firstWortExtractWeight') + this.get('firstSpargeExtractWeight');
	}),
	brewhouseEfficiency: Ember.computed('kettleExtractWeight', function () {
		// totalExtractWeight dependency is implicit
		return 100 * this.get('kettleExtractWeight') / this.get('totalExtractWeight');
	}),
	preBoilSG: Ember.computed('kettleExtractWeight', 'preBoilVolumeCold', function () {
		// ew = 2.59(sg - 1) * V
		// sg = ew/(V * 2.59) + 1
		return 1 + (this.get('kettleExtractWeight') / (this.get('preBoilVolumeCold') * 2.59));
	}),
	postBoilVolumeCold: Ember.computed('postBoilVolume', function () {
		return this.get('postBoilVolume') * 0.96; // Warm volume is 4% larger
	}),
	boilOff: Ember.computed('preBoilVolume', 'postBoilVolume', 'boilTime', function () {
		// boil off per hour
		return (this.get('preBoilVolume') - this.get('postBoilVolume')) / this.get('boilTime') * 60;
	}),
	boilExtracts: Ember.computed.mapBy('boilEntries', 'extractWeight'),
	totalBoilExtract: Ember.computed.sum('boilExtracts'),
	postBoilExtract: Ember.computed('totalBoilExtract', 'kettleExtractWeight', function () {
		return this.get('kettleExtractWeight') + this.get('totalBoilExtract');
	}),
	OG: Ember.computed('postBoilExtract', 'postBoilVolumeCold', function () {
		// ew = 2.59(sg - 1) * V
		// sg = ew/(V * 2.59) + 1
		return 1 + (this.get('postBoilExtract') / (this.get('postBoilVolumeCold') * 2.59));
	}),
	OGPlato: Ember.computed('OG', function () {
		return 259 - (259 / this.get('OG'));
	}),
	leftInKettle: Ember.computed('postBoilVolumeCold', 'fermentationVolume', function () {
		return this.get('postBoilVolumeCold') - this.get('fermentationVolume');
	}),
	IBUValues: Ember.computed.mapBy('boilEntries', 'IBU'),
	IBU: Ember.computed.sum('IBUValues'),
	yeastCellsNeeded: Ember.computed('OGPlato', 'fermentationVolume', 'targetPitchRate', function () {
		return this.get('OGPlato') * this.get('fermentationVolume') * this.get('targetPitchRate');
	}),
	yeastNeeded: Ember.computed('yeastCellsNeeded', 'yeast.cellConcentration', function () {
		return this.get('yeastCellsNeeded') / this.get('yeast.cellConcentration');
	}),
	FG: Ember.computed('OG', 'yeast.attenuation', function () {
		return ((this.get('OG') - 1.0) * (1.0 - (this.get('yeast.attenuation') / 100.0))) + 1.0;
	}),
	realFG: Ember.computed('FG', function () {
		return 1 + (0.1808 * (this.get('OG') - 1) + 0.8192 * (this.get('FG') - 1));
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
	ABW: Ember.computed('OGPlato', 'realFGPlato', function () {
		var OGPlato = this.get('OGPlato');
		return (OGPlato - this.get('realFGPlato')) / (2.065 - (0.010665 * OGPlato));
	}),
	ABV: Ember.computed('FG', 'ABW', function () {
		return this.get('ABW') * (this.get('FG') / 0.794);
	}),
	approxABV: Ember.computed('OG', 'FG', function () {
		return (this.get('OG') - this.get('FG')) * 131.5;
	}),
});
