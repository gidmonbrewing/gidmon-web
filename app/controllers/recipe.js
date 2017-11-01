import Ember from 'ember';

function round(value, decimals) {
	return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

export default Ember.Controller.extend({
	showFirstWortExtract: false,
	showFirstSpageExtract: false,
	showPreBoilExtract: false,
	showOGDetails: false,
	showFGDetails: false,
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
			const { preBoilVolume } = this.getProperties('preBoilVolume');
			var recipe = this.model.recipe;
			var scale = preBoilVolume / recipe.get('preBoilVolume');
			var scaledPostBoilVolume = round(recipe.get('postBoilVolume') * scale, 2);
			var scaledFermentationVolume = round(recipe.get('fermentationVolume') * scale, 2);
			var scaledStrikeWaterVolume = round(recipe.get('strikeWaterVolume') * scale, 2);
			var strikeWaterTemp = recipe.get('strikeWaterTemp');
			var scaledSpargeWaterVolume = round(recipe.get('spargeWaterVolume') * scale, 2);
			var spargeWaterTemp = recipe.get('spargeWaterTemp');
			var store = this.store;
			var brewingSession = store.createRecord('brewing-session', {
				recipe: recipe,
				preBoilVolume: preBoilVolume,
				measuredPreBoilVolume: preBoilVolume,
				postBoilVolume: scaledPostBoilVolume,
				measuredPostBoilVolume: scaledPostBoilVolume,
				fermentationVolume: scaledFermentationVolume,
				strikeWaterVolume: scaledStrikeWaterVolume,
				strikeWaterTemp: strikeWaterTemp,
				spargeWaterVolume: scaledSpargeWaterVolume,
				spargeWaterTemp: spargeWaterTemp,
				measuredFermentationVolume: scaledFermentationVolume,
				boilTime: recipe.get('boilTime'),
				measuredFirstWortSG: round(recipe.get('firstWortSG'), 3),
				measuredFirstSpargeSG: round(recipe.get('firstSpargeSG'), 3),
				measuredPreBoilSG: round(recipe.get('preBoilSG'), 3),
				measuredOG: round(recipe.get('OG'), 3),
				measuredFG: round(recipe.get('FG'), 3),
				yeastUsed: 0,
			});
			brewingSession.save().then(function () {
				recipe.get('boilEntries').forEach(function (entry) {
					var newEntry = store.createRecord('boil-session-entry', {
						session: brewingSession,
						recipeEntry: entry,
						amount: round(entry.get('amount') * scale, 0),
						alpha: entry.get('ingredient.alpha'),
					});
					newEntry.save();
				});
				recipe.get('mashEntries').forEach(function (entry) {
					var newEntry = store.createRecord('mash-session-entry', {
						session: brewingSession,
						recipeEntry: entry,
						weight: round(entry.get('weight') * scale, 2),
					});
					newEntry.save();
				});
			});
		},
		addMashIngredient() {
			var ingredient = this.get('newMashIngredient');
			var mashRecipeEntry = this.store.createRecord('mash-recipe-entry', {
				recipe: this.model.recipe,
				ingredient: ingredient,
				amount: 0,
			});
			mashRecipeEntry.save();
		},
		toggleShowFirstWortExtract() {
			if (this.get('showFirstWortExtract')) {
				this.set('showFirstWortExtract', false);
			} else {
				this.set('showFirstWortExtract', true);
			}
		},
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
