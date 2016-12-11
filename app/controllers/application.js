import Ember from 'ember';

export default Ember.Controller.extend({
	authManager: Ember.inject.service(),
	store: Ember.inject.service(),
	currentUser: Ember.computed('authManager.token',  function() {
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
    }
  }
});
