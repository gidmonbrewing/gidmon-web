import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	name: attr(),
	description: attr(),
	imageName: attr(),
	recipe: belongsTo('recipe'),
	beerBatch: hasMany('beer-batch')
});
