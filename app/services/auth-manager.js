import Service from '@ember/service';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import $ from 'jquery';
import { run } from '@ember/runloop';

export default Service.extend({
	token: computed({
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
	currentUser: computed({
		get() {
			if (sessionStorage.user) {
				return sessionStorage.user;
			} else {
				return -1;
			}
		},
		set(key, value) {
			sessionStorage.user = value;
			return value;
		}
	}),
	store: inject(),
	authenticate(login, password) {
		var _this = this;
		return $.ajax({
			method: "POST",
			url: "/api/token-auth",
			data: { username: login, password: password }
		}).then((result) => {
			run(() => {
				_this.set('token', result.token);
				_this.set('currentUser', result.userId);
			});
		});
	},
	authenticateFB(username, firstName, lastName, email, accessToken) {
		var _this = this;
		return $.ajax({
			method: "POST",
			url: "/api/oauth-login-fb",
			data: { username: username, first_name: firstName, last_name: lastName, email: email, accessToken: accessToken }
		}).then((result) => {
			run(() => {
				_this.set('token', result.data['token']);
				_this.set('currentUser', result.data['userId']);
			});
		});
	},

	invalidate() {
		this.set('token', "");
		this.set('currentUser', -1);
	},

	isAuthenticated: computed('token',  function() {
		return this.get('token') !== "";
	}),
});
