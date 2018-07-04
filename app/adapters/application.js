import JSONAPIAdapter from 'ember-data/adapters/json-api';
import Ember from 'ember';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { underscore } from '@ember/string';

export default JSONAPIAdapter.extend({
	//host: 'http://localhost:8000'
	namespace: "api",
	authManager: inject(),
	headers: computed('authManager.token', function() {
		if (this.get('authManager.token') !== "") {
			return {
				"Authorization": `Token ${this.get("authManager.token")}`
			};
		} else {
			return {};
		}
	}),
	pathForType: function(type) {
		var underscored = underscore(type);
		return Ember.String.pluralize(underscored);
	},
});
