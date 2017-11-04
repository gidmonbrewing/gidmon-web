import Ember from 'ember';
import { inject as service } from '@ember/service';

export default Ember.Controller.extend({
	authManager: service('auth-manager'),
	showAddBrewer: false,
	showFirstWortExtract: false,
	showOGDetails: false,
	actions: {
		saveModel() {
			this.model.session.save();
			// save all dirty mash entries
			this.model.session.get('mashEntries').then(function (entries) {
				entries.forEach(function (element) {
					if (element.get('hasDirtyAttributes')) {
						element.save();
					}
				});
			});
			// save all dirty boil entries
			this.model.session.get('boilEntries').then(function (entries) {
				entries.forEach(function (element) {
					if (element.get('hasDirtyAttributes')) {
						element.save();
					}
				});
			});
		},
		toggleShowFirstWortExtract() {
			if (this.get('showFirstWortExtract')) {
				this.set('showFirstWortExtract', false);
			} else {
				this.set('showFirstWortExtract', true);
			}
		},
		toggleShowOGDetails() {
			if (this.get('showOGDetails')) {
				this.set('showOGDetails', false);
			} else {
				this.set('showOGDetails', true);
			}
		},
		addBrewer() {
			var brewer = this.get('newBrewer');
			var session = this.model.session;
			var sessionBrewer = this.store.createRecord('session-brewer', {
				session: session,
				brewer: brewer,
			});
			sessionBrewer.save();
			this.set('showAddBrewer', false);
		},
	},
	hasUnsavedChanges: Ember.computed('model.session.hasDirtyAttributes', 'model.session.mashEntries.@each.hasDirtyAttributes', 'model.session.boilEntries.@each.hasDirtyAttributes', function () {
		var result = false;
		if (this.model.session.get('hasDirtyAttributes')) {
			result = true;
		}
		this.model.session.get('mashEntries').forEach(function (element) {
			if (element.get('hasDirtyAttributes')) {
				result = true;
			}
		});
		this.model.session.get('boilEntries').forEach(function (element) {
			if (element.get('hasDirtyAttributes')) {
				result = true;
			}
		});
		return result;
	}),
});
