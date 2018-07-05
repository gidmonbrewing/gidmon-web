import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
	model() {
		var store = this.get('store');
		let parentModel = this.modelFor('news.item');
		return RSVP.hash({
			newsItem: parentModel,
			comment: store.createRecord('news-comment', {}),
		});
	},
	deactivate() {
		// Destroy unsaved records when navigating away
		let m = this.currentModel.comment;
		if (m.get('isNew')) {
			m.destroyRecord();
		}
	}
});
