import Ember from 'ember';

export default Ember.Controller.extend({
	authManager: Ember.inject.service(),
	actions: {
		saveModel() {
			this.model.save();
		},
		preview() {
			let store = this.get('store');
			let authManager = this.get('authManager');
			let currentUser = authManager.get('currentUser');
			let newsItem = store.createRecord('news-item', {
				author: currentUser
			});
		}
	}
});
