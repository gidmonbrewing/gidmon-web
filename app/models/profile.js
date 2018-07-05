import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
	user: DS.belongsTo('user'),
	picture: DS.attr('string'),
	setPictureUrl: computed('id', function () { return "/api/profiles/" + this.get('id') + "/set_picture"; })
});
