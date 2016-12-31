import Ember from 'ember';

// let recipes = [{
//   id: 1,
//   name: 'Gidmon Bla'
// }];

export default Ember.Route.extend({
	model() {
		return this.get('store').findAll('recipe');
	}
});
