import Ember from 'ember';

export default Ember.Service.extend({
	token: Ember.computed({
		get() {
			if (sessionStorage.token) {
				return sessionStorage.token;
			} else {
				return "";
			}
		},
		set(key, value) {
			sessionStorage.token = value;
			return value;
		}
	}),
	currentUser: Ember.computed({
		get() {
			if (sessionStorage.user) {
				return sessionStorage.user;
			} else {
				return null;
			}
		},
		set(key, value) {
			sessionStorage.user = value;
			return value;
		}
	}),
	store: Ember.inject.service(),
	authenticate(login, password) {
		var _this = this;
		return Ember.$.ajax({
			method: "POST",
			url: "/api/token-auth",
			data: { username: login, password: password }
		}).then((result) => {
			_this.set('token', result.token);
			_this.get('store').query('user', {
				filter: {
					username: login
				}
			}).then(function(users) {
				_this.set('currentUser', users.get("firstObject"));
			});
		});
	},

	invalidate() {
		this.set('token', "");
		this.set('currentUser', null);
	},

	isAuthenticated: Ember.computed('token',  function() {
		return this.get('token') !== "";
	}),
});
