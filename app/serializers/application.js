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
});
