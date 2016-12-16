import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
	author: belongsTo('user'),
	newsItem: belongsTo('news-item'),
	children: hasMany('news-comment', { inverse: 'parent' }),
	parent: belongsTo('news-comment', { inverse: 'children' }),
	content: attr('string'),
	created: attr('date', { defaultValue() { return new Date(); } })
});
