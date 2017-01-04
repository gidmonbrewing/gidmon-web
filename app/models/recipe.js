import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import Ember from 'ember';

// Move to common
function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

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
	totalMaltWeight: attr('number'),
	primaryFermentationTemp: attr('number'),
	primaryFermentationTime: attr('number'),
	yeast: belongsTo('yeast'),
	yeastAmount: attr('number'),
	targetPitchRate: attr('number'),
	boilEntries: hasMany('boil-recipe-entry'),
	mashEntries: hasMany('mash-recipe-entry'),
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
	//maltWeights: Ember.computed.mapBy('mashEntries', 'amount'),
	//totalMaltWeight: Ember.computed('waterToMaltRatio', function () {

	//}),
	absorbedByMalt: Ember.computed('totalMaltWeight', function () {
		return this.get('totalMaltWeight') * 0.9;
	}),
	preBoilVolumeCold: Ember.computed('preBoilVolume', function () {
		return (this.get('preBoilVolume') * 0.96).toFixed(2); // Warm volume is 4% larger
	}),
	strikeWaterVolume: Ember.computed('preBoilVolumeCold', 'spargeCount', 'totalMaltWeight', function () {
		// The volume in the kettle during lautering will be larger since this is cold volume
		var volume = this.get('preBoilVolumeCold') / (this.get('spargeCount') + 1) + (this.get('totalMaltWeight') * 0.9);
		return round(volume, 2);
	}),
	spargeWaterVolume: Ember.computed('preBoilVolumeCold', 'spargeCount', function () {
		// The volume in the kettle during lautering will be larger since this is cold volume
		var spargeCount = this.get('spargeCount');
		if (spargeCount < 1) {
			return 0;
		} else {
			var volume = Number(this.get('preBoilVolumeCold')) / (spargeCount + 1); // half is from first run off and half from first sparge
			return round(volume, 2);
		}
	}),
	waterToMaltRatio: Ember.computed('strikeWaterVolume', 'totalMaltWeight', function () {
		var ratio = this.get('strikeWaterVolume') / this.get('totalMaltWeight');
		return round(ratio, 2);
	}),
	strikeWaterTemp: Ember.computed('waterToMaltRatio', 'mashingTemp', function () {
		var mashingTemp = Number(this.get('mashingTemp')); // This will default to 0 if not set
		// Formula based on http://braukaiser.com/wiki/index.php?title=Infusion_Mashing
		// 2.09 is ratio between qt/lb and l/kg
		var maltTemp = 20; // this should be part of session
		var temp = (0.2 / (this.get('waterToMaltRatio') / 2.09)) * (mashingTemp - maltTemp) + mashingTemp;
		return round(temp, 2);
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
			return round(100 * efficiency, 2);
		}
	}),
	mashIngredients: Ember.computed.mapBy('mashEntries', 'ingredient'),
	extractYields: Ember.computed.mapBy('mashIngredients', 'extractYield'),
	totalExtractYield: Ember.computed.sum('extractYields'), // This is just an intermediate value used in later computations
	averageExtractYield: Ember.computed('totalExtractYield', function () {
		var result = this.get('totalExtractYield') / this.get('extractYields').length;
		return round(result, 3);
	}),
	maxFirstWortSG: Ember.computed('waterToMaltRatio', 'averageExtractYield', function () {
		var averageExtractYield = this.get('averageExtractYield');
		var maxPlato = 100 * averageExtractYield / (this.get('waterToMaltRatio') + averageExtractYield);
		var maxSG = 1 + (maxPlato / (258.6 - ((maxPlato / 258.2) * 227.1)));
		return round(maxSG, 3);
	}),
	firstWortSG: Ember.computed('maxFirstWortSG', function () {
		return round(1 + (this.get('maxFirstWortSG') - 1) * 0.8, 3);
	}),
});
