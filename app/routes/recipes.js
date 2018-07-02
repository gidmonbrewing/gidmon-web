import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({
	model() {
		var store = this.get('store');
		return RSVP.hash({
			recipes: store.findAll('recipe'),
			beers: store.findAll('beer'),
		});
	}
});
