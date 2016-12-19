import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany, belongsTo } from 'ember-data/relationships';
import Ember from 'ember';

export default Model.extend({
	title: attr('string'),
	preamble: attr('string'),
	content: attr('string'),
	created: attr('date', { defaultValue() { return new Date(); } }),
	author: belongsTo('user'),
	comments: hasMany('news-comment'),
	commentCount: Ember.computed('comments', function () { return this.get('comments.length'); }),
	rootComments: Ember.computed.filterBy('comments', 'parent.content', null),
	htmlPreamble: Ember.computed('preamble', function() {
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
	htmlContent: Ember.computed('content', function() {
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
