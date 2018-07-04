import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		saveModel() {
			this.model.save();
		},
		createRecipe() {
			var recipe = this.store.createRecord('recipe', {
				beer: this.model,
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
	}
});
