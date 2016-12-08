import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		saveModel() {
			this.model.save();
		},
	}
});
