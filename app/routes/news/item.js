import Route from '@ember/routing/route';

export default Route.extend({
	model(params) {
		return this.get('store').findRecord('news-item', params['news_id']);
	}
});
