import Controller from '@ember/controller';
import Ember from 'ember';

export default Controller.extend({
	authManager: Ember.inject.service(),
	store: Ember.inject.service(),
	currentUser: Ember.computed('authManager.currentUser', function () {
		return this.get('store').findRecord('user', this.get('authManager.currentUser'));
	}),
	userPermissions: Ember.computed.mapBy('currentUser.userPermissions', 'codename'),
	canAddRecipe: Ember.computed('currentUser.isStaff', 'userPermissions', function () {
		if (this.get('currentUser.isSuperuser')) {
			return true;
		} else {
			return this.get('userPermissions').includes('add_recipe');
		}
	}),
	actions: {
		createRecipe() {
			const { selectedBeer } = this.getProperties('selectedBeer');
			var store = this.store;
			var recipe = store.createRecord('recipe', {
				beer: selectedBeer,
				mashingTemp: 65,
				mashingTime: 60,
				mashOutTemp: 75,
				mashOutTime: 20,
				spargeCount: 1,
				spargeWaterTemp: 75,
				spargeTime: 20,
				conversionEfficiency: 90,
				preBoilVolume: 30,
				postBoilVolume: 25,
				fermentationVolume: 20,
				finalVolume: 18,
				boilTime: 60,
				totalMaltWeight: 5,
				primaryFermentationTemp: 18,
				primaryFermentationTime: 14,
				yeastAmount: 0,
			});
			recipe.save();
		}
	},
});
