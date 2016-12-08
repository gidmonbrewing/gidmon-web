import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import Ember from 'ember';

export default Model.extend({
	title: attr('string'),
	content: attr('string'),
	created: attr('date', { defaultValue() { return new Date(); } }),
	author: attr('string'),
	comments: hasMany('news-comment'),
	commentCount: Ember.computed('comments', function() { return this.get('comments.length'); }),
	htmlContent: Ember.computed('content', function() {
		var cont = this.get('content');
		if (cont == undefined)
			return 'No content added';
		else
			return cont.replace(/\n/g, '<br/>'); // global replacement /[string to replace]/g
	})
});
