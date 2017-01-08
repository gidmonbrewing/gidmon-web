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
	unassignedMalt: Ember.computed('totalAmount', function () {
		return 100 - this.get('totalAmount');
	}),
	absorbedByMalt: Ember.computed('totalMaltWeight', function () {
		return this.get('totalMaltWeight') * 0.9;
	}),
	preBoilVolumeCold: Ember.computed('preBoilVolume', function () {
		return (this.get('preBoilVolume') * 0.96).toFixed(2); // Warm volume is 4% larger
	}),
	strikeWaterVolume: Ember.computed('preBoilVolumeCold', 'spargeCount', 'totalMaltWeight', function () {
		// The volume in the kettle during lautering will be larger since this is cold volume
		return this.get('preBoilVolumeCold') / (this.get('spargeCount') + 1) + (this.get('totalMaltWeight') * 0.9);
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
	brewhouseEfficiency: Ember.computed('lauterEfficiency', function () {
		return 0.95 * this.get('lauterEfficiency');
	}),
	extractYields: Ember.computed.mapBy('mashEntries', 'weightedExtract'),
	averageExtractYield: Ember.computed.sum('extractYields'),
	maxFirstWortSG: Ember.computed('waterToMaltRatio', 'averageExtractYield', function () {
		var averageExtractYield = this.get('averageExtractYield');
		var maxPlato = 100 * averageExtractYield / (this.get('waterToMaltRatio') + averageExtractYield);
		return 1 + (maxPlato / (258.6 - ((maxPlato / 258.2) * 227.1)));
	}),
	firstWortSG: Ember.computed('maxFirstWortSG', function () {
		return 1 + (this.get('maxFirstWortSG') - 1) * 0.95;
	}),
	preBoilSG: Ember.computed('maxFirstWortSG', 'brewhouseEfficiency', function () {
		return 1 + (this.get('maxFirstWortSG') - 1) * (this.get('brewhouseEfficiency') / 100);
	}),
	postBoilVolumeCold: Ember.computed('preBoilVolume', 'boilTime', function () {
		return this.get('preBoilVolume') * (1 - ((this.get('boilTime') / 60) * 0.1)) * 0.96; // Warm volume is 4% larger
	}),
	OG: Ember.computed('preBoilSG', 'preBoilVolumeCold', 'postBoilVolumeCold', function () {
		var gravityPoints = (this.get('preBoilSG') - 1) * 1000;
		var postBoilGP = (this.get('preBoilVolumeCold') * gravityPoints) / this.get('postBoilVolumeCold');
		return 1 + (postBoilGP / 1000);
	}),
	finalVolume: Ember.computed('postBoilVolumeCold', function () {
		return this.get('postBoilVolumeCold') - 2; // Estimating 2 litres loss
	}),
	IBUValues: Ember.computed.mapBy('boilEntries', 'IBU'),
	IBU: Ember.computed.sum('IBUValues'),
	yeastCellsNeeded: Ember.computed('OG', 'finalVolume', 'targetPitchRate', function () {
		return (259 - (259 / this.get('OG'))) * this.get('finalVolume') * this.get('targetPitchRate');
	}),
	yeastNeeded: Ember.computed('yeastCellsNeeded', 'yeast.cellConcentration', function () {
		return this.get('yeastCellsNeeded') / this.get('yeast.cellConcentration');
	}),
	FG: Ember.computed('OG', 'yeast.attenuation', function () {
		return ((this.get('OG') - 1.0) * (1.0 - (this.get('yeast.attenuation') / 100.0))) + 1.0;
	}),
});
