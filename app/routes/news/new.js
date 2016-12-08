import Ember from 'ember';

export default Ember.Route.extend({
	model() {
		let store = this.get('store');
		let newsItem = store.createRecord('news-item', {
		  author: 'Johan Gidlund',
		});
		return newsItem;
	}
});
