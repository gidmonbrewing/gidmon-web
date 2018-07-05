import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
	model(params) {
		var store = this.get('store');
		return RSVP.hash({
			session: store.findRecord('brewing-session', params.session_id),
			brewingSystems: store.findAll('brewing-system'),
			users: store.findAll('user'),
		});
	}
});
