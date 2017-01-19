import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		updateModel() {
			console.log(event.target.value);
			this.model.set(event.target.name, event.target.value);
		},
		saveModel() {
			this.model.save();
		},
		createRecipe(beerId) {
			console.log("Create recipe for beer with id " + beerId);
			var recipe = this.store.createRecord('recipe', {
				beer: this.model
			});
			recipe.save();
		}
	}
});
