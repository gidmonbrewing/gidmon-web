import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		saveModel() {
			this.model.session.save();
		},
	},
	hasUnsavedChanges: Ember.computed('model.session.hasDirtyAttributes', function () {
		return this.model.session.get('hasDirtyAttributes');
	}),
});
