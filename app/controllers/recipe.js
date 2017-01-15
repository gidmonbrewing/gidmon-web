import Ember from 'ember';

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
			var brewingSession = this.store.createRecord('brewing-session', {
				recipe: this.model.recipe,
				preBoilVolume: this.model.recipe.get('preBoilVolume'),
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
