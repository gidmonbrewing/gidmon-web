import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({
	model() {
		var store = this.get('store');
		let parentModel = this.modelFor('brewing-session');
		return RSVP.hash({
			session: parentModel.session,
			comment: store.createRecord('brewing-session-comment', {}),
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
