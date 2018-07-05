import DS from 'ember-data';
import { underscore } from '@ember/string';
import { pluralize } from 'ember-inflector';

export default DS.JSONAPISerializer.extend({
	keyForAttribute: function(attr) {
		return underscore(attr);
	},
	keyForRelationship: function(attr) {
		return underscore(attr);
	},
	payloadTypeFromModelName(modelName) {
		return underscore(modelName);
	},
	payloadKeyFromModelName(modelName) {
		let underscored = underscore(modelName);
		return pluralize(underscored);
	},
	serialize(snapshot, options) {
		var json = this._super(snapshot, options);

		json.data.type = pluralize(json.data.type);
		return json;
	},
});
