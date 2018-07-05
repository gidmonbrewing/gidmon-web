import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';
import { computed } from '@ember/object';
import { filterBy } from '@ember/object/computed';

export default Model.extend({
	title: attr('string'),
	preamble: attr('string'),
	content: attr('string'),
	created: attr('date', { defaultValue() { return new Date(); } }),
	author: belongsTo('user'),
	comments: hasMany('news-comment'),
	commentCount: computed('comments', function () { return this.get('comments.length'); }),
	rootComments: filterBy('comments', 'isRoot', true),
	htmlPreamble: computed('preamble', function() {
		var pre = this.get('preamble');
		if (pre === undefined)
		{
			return 'No preamble added';
		}
		else
		{
			return pre.replace(/\n/g, '<br/>'); // global replacement /[string to replace]/g
		}
	}),
	htmlContent: computed('content', function() {
		var cont = this.get('content');
		if (cont === undefined)
		{
			return 'No content added';
		}
		else
		{
			return cont.replace(/\n/g, '<br/>'); // global replacement /[string to replace]/g
		}
	}),
});
