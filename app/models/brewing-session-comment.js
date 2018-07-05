import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';
import { computed } from '@ember/object';

export default Model.extend({
	author: belongsTo('user'),
	brewingSession: belongsTo('brewing-session'),
	children: hasMany('brewing-session-comment', { inverse: 'parent' }),
	parent: belongsTo('brewing-session-comment', { inverse: 'children' }),
	isRoot: computed('parent.content', function () {
		// The root comments are those without a parent comment
		if (this.get('parent.content')) {
			return false;
		}
		else {
			return true;
		}
	}),
	content: attr('string'),
	created: attr('date', { defaultValue() { return new Date(); } })
});
