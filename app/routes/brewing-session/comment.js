import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
	model() {
		var store = this.get('store');
		let parentModel = this.modelFor('brewing-session');
		return RSVP.hash({
			session: parentModel.session,
			comment: store.createRecord('brewing-session-comment', {}),
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
