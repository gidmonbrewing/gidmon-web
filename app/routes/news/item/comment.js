import Ember from 'ember';

export default Ember.Route.extend({
	model() {
		let newsItem = this.modelFor('news.item');
		return this.get('store').createRecord('news-comment', {
			newsItem: newsItem
		});
	},
	handleDeactivate: function () {
		// Destroy unsaved records when navigating away
		let m = this.currentModel;
		if (m.get('isNew')) {
			m.destroyRecord();
		}
	}.on('deactivate')
});
