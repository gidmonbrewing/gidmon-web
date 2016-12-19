import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPISerializer.extend({
	keyForAttribute: function(attr) {
		return Ember.String.underscore(attr);
	},
	keyForRelationship: function(attr) {
		return Ember.String.underscore(attr);
	},
	payloadTypeFromModelName(modelName) {
		return Ember.String.underscore(modelName);
	},
	payloadKeyFromModelName(modelName) {
		let underscored = Ember.String.underscore(modelName);
		return Ember.String.pluralize(underscored);
	},
	serialize(snapshot, options) {
		var json = this._super(snapshot, options);

		json.data.type = Ember.String.pluralize(json.data.type);
		return json;
	},
});
