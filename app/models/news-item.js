import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { hasMany } from 'ember-data/relationships';
import Ember from 'ember';

export default Model.extend({
	title: attr('string'),
	created: attr('date', { defaultValue() { return new Date(); } }),
	author: attr('string'),
	comments: hasMany('news-comment'),
	commentCount: Ember.computed('comments', function() { return this.get('comments.length'); })
});
