import Service from '@ember/service';
import Ember from 'ember';
import ENV from 'gidmon-web/config/environment';

var computed = Ember.computed;

var _facebookSDKDeferrable = Ember.RSVP.defer();

var fbAsyncInit = function () {
	_initFacebook(window.FB);
	_facebookSDKDeferrable.resolve(window.FB);
};

window.fbAsyncInit = fbAsyncInit;

export default Service.extend({
	// Resolves when the Facebook SDK is ready.
	//
	// Usage:
	//
	//     facebook: Ember.inject.service(),
	//     foo: function() {
	//       this.get('facebook.SDK').then(function(FB) {
	//         // Facebook SDK is ready and FB is a reference to the SDK
	//       });
	//     }
	SDK: computed.alias('FB'),
	FB: computed(function () {
		_loadFacebookSDK();
		return _facebookSDKDeferrable.promise;
	})
});

function _loadFacebookSDK() {
	(function (d, s, id) {
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) { return; }
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
}

function _initFacebook(FB) {
	if (ENV.environment === 'development') {
		FB.init({
			appId: '654610964662546',
			xfbml: true,
			version: 'v2.10'
		});
	} else {
		FB.init({
			appId: '146299062769206',
			xfbml: true,
			version: 'v2.10'
		});
	}
}
