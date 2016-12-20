import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
	username: DS.attr('string'),
	firstName: DS.attr('string'),
	lastName: DS.attr('string'),
	email: DS.attr('string'),
	isStaff: DS.attr(),
	isSuperuser: DS.attr(),
	profile: DS.belongsTo('profile'),
	newsItem: DS.hasMany('news-item'),
	fullName: Ember.computed('firstName', 'lastName', function() { return this.get('firstName') + " " + this.get('lastName'); }),
});
