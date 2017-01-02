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
	primaryFermentationTemp: attr('number'),
	primaryFermentationTime: attr('number'),
	yeast: belongsTo('yeast'),
	yeastAmount: attr('number'),
	targetPitchRate: attr('number'),
	hopsEntries: hasMany('hops-recipe-entry'),
	maltEntries: hasMany('malt-recipe-entry'),
	miscEntries: hasMany('misc-ingredient-entry'),
	//totalMaltWeight: Ember.computed('maltEntries.@each', function () {
	//	var promise = Ember.ObjectProxy.create();

	//	this.get('maltEntries').then(function (maltEntries) {
	//		var totalWeight = 0.0;
	//		maltEntries.forEach(function (element) {
	//			console.log(element.get('amount'));
	//			totalWeight += Number(element.get('amount'));
	//		});
	//		promise.set('content', totalWeight);
	//	});

	//	return promise;
	//}),
	maltWeights: Ember.computed.mapBy('maltEntries', 'amount'),
	totalMaltWeight: Ember.computed.sum('maltWeights'),
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
			var volume = Number(this.get('preBoilVolumeCold')) / (spargeCount + 1); // half is from first run off and half from first sparge
			return volume.toFixed(2);
		}
	}),
	strikeWaterTemp: Ember.computed('strikeWaterVolume', 'totalMaltWeight', 'mashingTemp', function () {
		var waterToMaltRatio = this.get('strikeWaterVolume') / this.get('totalMaltWeight');
		var mashingTemp = Number(this.get('mashingTemp')); // This will default to 0 if not set
		// Formula based on http://braukaiser.com/wiki/index.php?title=Infusion_Mashing
		// 2.09 is ratio between qt/lb and l/kg
		var maltTemp = 20; // this should be part of session
		var temp = (0.2 / (waterToMaltRatio / 2.09)) * (mashingTemp - maltTemp) + mashingTemp;
		return temp.toFixed(2);
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
			return (100 * efficiency).toFixed(2);
		}
	}),
	maxFirstWortSG: Ember.computed('strikeWaterVolume', 'totalMaltWeight', function () {
		var waterToMaltRatio = this.get('strikeWaterVolume') / this.get('totalMaltWeight'); // make this into separate property
		var maxSGPlato = 100 * 0.76 / (waterToMaltRatio + 0.76);
		return (1 + (maxSGPlato / 250)).toFixed(3);
	}),
	firstWortSG: Ember.computed('maxFirstWortSG', function () {
		return (1 + (this.get('maxFirstWortSG') - 1) * 0.8).toFixed(3);
	}),
});
