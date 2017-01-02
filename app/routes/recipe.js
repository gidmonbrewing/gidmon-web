import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({
	model(params) {
		return RSVP.hash({
			recipe: this.get('store').findRecord('recipe', params.recipe_id, { include: 'yeast' }),
			yeasts: this.get('store').findAll('yeast')
		});
	}
});
