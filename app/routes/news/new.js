import Ember from 'ember';

export default Ember.Route.extend({
	authManager: Ember.inject.service(),
	model() {
		let store = this.get('store');
		//let authManager = this.get('authManager');
		let userId = this.get('authManager.currentUser');
		let newsItem = store.createRecord('news-item');
		store.findRecord('user', userId).then(function(user) {
			newsItem.set('author', user);
		});
		return newsItem;
	}
});
