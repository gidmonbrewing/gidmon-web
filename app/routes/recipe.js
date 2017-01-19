import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({
	model(params) {
		var store = this.get('store');
		return RSVP.hash({
			recipe: store.findRecord('recipe', params.recipe_id, { include: 'yeast' }),
			yeasts: store.findAll('yeast'),
			pitchTypes: store.findAll('pitch-type'),
		});
	}
});
