import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
	author: belongsTo('user'),
	newsItem: belongsTo('news-item'),
	content: attr('string')
});
