import Ember from 'ember';

export default Ember.Route.extend({
	authManager: Ember.inject.service(),
	model() {
		let store = this.get('store');
		let authManager = this.get('authManager');
		let currentUser = authManager.get('currentUser');
		let newsItem = store.createRecord('news-item', {
		  author: currentUser,
		});
		return newsItem;
	}
});
