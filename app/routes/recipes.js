import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
	model() {
		var store = this.get('store');
		return RSVP.hash({
			recipes: store.findAll('recipe'),
			beers: store.findAll('beer'),
		});
	}
});
