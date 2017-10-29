import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({
	model() {
		var store = this.get('store');
		let parentModel = this.modelFor('news.item');
		return RSVP.hash({
			newsItem: parentModel,
			comment: store.createRecord('news-comment', {}),
		});
	},
	handleDeactivate: function () {
		// Destroy unsaved records when navigating away
		let m = this.currentModel.comment;
		if (m.get('isNew')) {
			m.destroyRecord();
		}
	}.on('deactivate')
});
