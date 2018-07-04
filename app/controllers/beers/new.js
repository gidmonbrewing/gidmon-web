import Controller from '@ember/controller';

export default Controller.extend({
	actions: {
		createBeer() {
			let _this = this;
			this.model.beer.save().then(function (model) {
				// save worked
				_this.transitionToRoute('beer', model.id);
			});
		}
	},
});
