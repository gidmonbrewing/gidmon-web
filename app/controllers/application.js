import Ember from 'ember';

export default Ember.Controller.extend({
	authManager: Ember.inject.service(),
	store: Ember.inject.service(),
	currentUser: Ember.computed('authManager.currentUser',  function() {
		return this.get('store').findRecord('user', this.get('authManager.currentUser'));
	}),
	actions: {
		authenticate() {
			const { login, password } = this.getProperties('login', 'password');
			this.get('authManager').authenticate(login, password).then(() => {
			}, (err) => {
				alert('Error obtaining token: [' + err.status + "] " + err.statusText);
			});
		},
		logout() {
			this.get('authManager').invalidate();
		},
		gotoPage(route, id) {
			this.transitionToRoute(route, id);
		}
	}
});
