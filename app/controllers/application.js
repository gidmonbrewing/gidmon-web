import Ember from 'ember';

export default Ember.Controller.extend({
	authManager: Ember.inject.service(),
	store: Ember.inject.service(),
	currentUser: Ember.computed('token',  function() {
		var proxy = Ember.ObjectProxy.create({
			content: null
		});
		this.get('store').query('user', {
			filter: {
				token: this.get('authManager.token')
			}
		}).then(function(users) {
			proxy.set('content', users.get("firstObject"));
		});
		
		return proxy;
	}),
});
