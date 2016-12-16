import Ember from 'ember';

export default Ember.Route.extend({
	authManager: Ember.inject.service(),
	model() {
		let store = this.get('store');
		let userId = this.get('authManager.currentUser');
		let newsItem = store.createRecord('news-item');
		return newsItem;
	}
});
