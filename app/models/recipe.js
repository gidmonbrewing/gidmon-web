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
	strikeWaterVolume: Ember.computed('preBoilVolume', 'spargeCount', 'totalMaltWeight', function () {
		return this.get('preBoilVolume') / this.get('spargeCount') + (this.get('totalMaltWeight') * 0.9);
	}),
	spargeWaterVolume: Ember.computed('preBoilVolume', 'spargeCount', function () {
		var spargeCount = this.get('spargeCount');
		if (spargeCount <= 1) {
			return 0;
		} else {
			return this.get('preBoilVolume') / spargeCount;
		}
	}),
	strikeWaterTemp: Ember.computed('strikeWaterVolume', 'totalMaltWeight', 'mashingTemp', function () {
		var waterToMaltRatio = this.get('strikeWaterVolume') / this.get('totalMaltWeight');
		var mashingTemp = this.get('mashingTemp')
		// Formula based on http://braukaiser.com/wiki/index.php?title=Infusion_Mashing
		// 2.08 is ratio between qt/lb and l/kg
		var maltTemp = 20; // this should be part of session
		var temp = (0.2 / (waterToMaltRatio / 2.08)) * (mashingTemp - maltTemp) + mashingTemp;
		return temp.toFixed(2);
	}),
});
