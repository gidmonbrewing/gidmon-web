import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
	model() {
		var store = this.get('store');
		return RSVP.hash({
			beerTypes: store.findAll('beer-type'),
			beer: store.createRecord('beer'),
		});
	},
	handleDeactivate: function () {
		// Destroy unsaved records when navigating away
		let m = this.currentModel.beer;
		if (m.get('isNew')) {
			m.destroyRecord();
		}
	}.on('deactivate')
});
