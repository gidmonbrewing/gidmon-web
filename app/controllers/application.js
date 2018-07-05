import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import ENV from 'gidmon-web/config/environment';

export default Controller.extend({
	authManager: inject(),
	store: inject(),
	facebook: inject(),
	currentUser: computed('authManager.currentUser',  function() {
		return this.get('store').findRecord('user', this.get('authManager.currentUser'));
	}),
	isAuthenticated: computed('authManager.isAuthenticated', function () {
		let _this = this;
		if (this.get('authManager.isAuthenticated')) {
			return true;
		} else {
			// Debug logging in development mode
			if (ENV.environment === 'development') {
				_this.get('facebook.SDK').then(function (FB) {
					FB.getLoginStatus(function (response) {
						console.log("Facebook login status: " + response.status);
					});
				});
			}
			return false;
		}
	}),
	actions: {
		authenticate() {
			const { login, password } = this.getProperties('login', 'password');
			this.get('authManager').authenticate(login, password).then(() => {
			}, (err) => {
				alert('Error obtaining token: [' + err.status + "] " + err.statusText);
			});
		},
		authenticateFB() {
			let _this = this;
			this.get('facebook.SDK').then(function (FB) {
				FB.login(function (response) {
					let accessToken = response.authResponse.accessToken;
					if (response.status == "connected") {
						FB.api('/me', { fields: 'id, first_name, last_name, email' }, function (response) {
							// Debug logging in development mode
							if (ENV.environment === 'development') {
								console.log('Logging in with: ' + response.first_name + " / " + response.id);
							}
							_this.get('authManager').authenticateFB(response.id, response.first_name, response.last_name, response.email, accessToken);
						});
					} else {
						alert('Facebook authentication failed');
					}
				}, { scope: 'email' });
			});
		},
		logout() {
			this.get('facebook.SDK').then(function (FB) {
				FB.getLoginStatus(function (response) {
					if (response.status == "connected") {
						FB.logout(function (response) {
							// Debug logging in development mode
							if (ENV.environment === 'development') {
								console.log("Logged out of Facebook");
								console.log(response);
							}
						});
					} else {
						// Debug logging in development mode
						if (ENV.environment === 'development') {
							console.log("Already logged out from Facebook");
						}
					}
				});
			});
			this.get('authManager').invalidate();
		},
		gotoPage(route, id) {
			this.transitionToRoute(route, id);
		}
	}
});
