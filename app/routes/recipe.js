import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({
	model(params) {
		var store = this.get('store');
		return RSVP.hash({
			recipe: store.findRecord('recipe', params.recipe_id, { include: 'yeast' }),
			yeasts: store.findAll('yeast'),
			mashIngredients: store.findAll('mash-ingredient'),
			boilIngredients: store.findAll('boil-ingredient'),
			pitchTypes: store.findAll('pitch-type'),
		});
	}
});
