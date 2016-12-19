import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	author: belongsTo('user'),
	newsItem: belongsTo('news-item'),
	children: hasMany('news-comment', { inverse: 'parent' }),
	parent: belongsTo('news-comment', { inverse: 'children' }),
	isRoot: Ember.computed('parent.content', function () {
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
