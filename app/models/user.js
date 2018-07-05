import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
	firstName: DS.attr('string'),
	lastName: DS.attr('string'),
	email: DS.attr('string'),
	isStaff: DS.attr(),
	isSuperuser: DS.attr(),
	profile: DS.belongsTo('profile'),
	newsItem: DS.hasMany('news-item'),
	userPermissions: DS.hasMany('permission'),
	fullName: computed('firstName', 'lastName', function() { return this.get('firstName') + " " + this.get('lastName'); }),
});
