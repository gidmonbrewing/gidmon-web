import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import Ember from 'ember';

export default Model.extend({
	beer: belongsTo('beer'),
	creator: belongsTo('user'),
	mashingTemp: attr(),
	mashingTime: attr(),
	mashOutTemp: attr(),
	mashOutTime: attr(),
	spargeCount: attr(),
	spargeWaterTemp: attr(),
	preBoilVolume: attr(),
	primaryFermentationTemp: attr(),
	primaryFermentationTime: attr(),
	yeast: attr(),
	yeastAmount: attr(),
	targetPitchRate: attr(),
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
	totalWaterVolume: Ember.computed('preBoilVolume', function () {
		return 4;
	}),
});
