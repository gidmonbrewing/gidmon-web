import Ember from 'ember';

export default Ember.Controller.extend({
	authManager: Ember.inject.service(),
	actions: {
		saveModel() {
			this.model.save();
		},
	}
});
