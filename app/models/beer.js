import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import { computed } from '@ember/object';

export default Model.extend({
	name: attr(),
	description: attr(),
	imageName: attr(),
	beerType: belongsTo('beer-type'),
	recipe: belongsTo('recipe'),
	beerBatch: hasMany('beer-batch'),
	hasRecipe: computed('recipe', function () {
		return this.get('recipe').content != null;
	}),
});
