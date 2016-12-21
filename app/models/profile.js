import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	user: DS.belongsTo('user'),
	picture: DS.attr('string'),
	setPictureUrl: Ember.computed('id', function () { return "/api/profiles/" + this.get('id') + "/set_picture"; })
});
