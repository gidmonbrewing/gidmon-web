import Ember from 'ember';
import { inject as service } from '@ember/service';

export default Ember.Controller.extend({
	authManager: service('auth-manager'),
	actions: {
		saveModel() {
			this.model.session.save();
		},
	},
	hasUnsavedChanges: Ember.computed('model.session.hasDirtyAttributes', function () {
		return this.model.session.get('hasDirtyAttributes');
	}),
});
