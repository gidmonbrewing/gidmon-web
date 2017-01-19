import Ember from 'ember';

function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export default Ember.Controller.extend({
	actions: {
		saveModel() {
			this.model.recipe.save();
			// save all dirty mash entries
			this.model.recipe.get('mashEntries').then(function (entries) {
				entries.forEach(function (element) {
					if (element.get('hasDirtyAttributes')) {
						element.save();
					}
				});
			});
		},
		createSession() {
			var recipe = this.model.recipe;
			var brewingSession = this.store.createRecord('brewing-session', {
				recipe: recipe,
				preBoilVolume: recipe.get('preBoilVolume'),
				postBoilVolume: recipe.get('postBoilVolume'),
				fermentationVolume: recipe.get('fermentationVolume'),
				measuredFirstWortSG: round(recipe.get('firstWortSG'), 3),
				measuredFirstSpargeSG: round(recipe.get('firstSpargeSG'), 3),
				measuredPreBoilSG: round(recipe.get('preBoilSG'), 3),
				measuredOG: round(recipe.get('OG'), 3),
				measuredFG: round(recipe.get('FG'), 3),
				yeastUsed: 0,
			});
			brewingSession.save();
		}
	},
	hasUnsavedChanges: Ember.computed('model.recipe.hasDirtyAttributes', 'model.recipe.mashEntries.@each.hasDirtyAttributes', function () {
		var result = false;
		if (this.model.recipe.get('hasDirtyAttributes')) {
			result = true;
		}
		this.model.recipe.get('mashEntries').forEach(function (element) {
			if (element.get('hasDirtyAttributes')) {
				result = true;
			}
		});
		return result;
	}),
});
