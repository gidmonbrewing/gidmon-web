import Controller from '@ember/controller';

export default Controller.extend({
	store: Ember.inject.service(),
	actions: {
		createBeer() {
			const { beerName } = this.getProperties('beerName');
			var store = this.store;
			var beer = store.createRecord('beer', {
				name: beerName,
			});
			beer.save();
		}
	},
});
