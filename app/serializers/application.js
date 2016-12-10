import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPISerializer.extend({
	keyForAttribute: function(attr) {
		return Ember.String.underscore(attr);
	},
	keyForRelationship: function(attr) {
		return Ember.String.underscore(attr);
	},
	serialize(snapshot, options) {
		var json = this._super(snapshot, options);

		json.data.type = Ember.String.underscore(json.data.type);
		return json;
	},
	serializeBelongsTo(snapshot, json, relationship) {
		this._super(snapshot, json, relationship);
		if (json.relationships !== undefined) {
			var payloadKey = this._getMappedKey(relationship.key, snapshot.type);
			if (json.relationships[payloadKey].data.type === 'users') {
				json.relationships[payloadKey].data.type = 'User';
			}
		}
	},
	serializeHasMany(snapshot, json, relationship) {
		this._super(snapshot, json, relationship);
		if (relationship.key === 'comments') {
			if (json.relationships['comments'] === undefined) {
				var data = [];
				json.relationships['comments'] = { data };
			}
		}
	}
});
