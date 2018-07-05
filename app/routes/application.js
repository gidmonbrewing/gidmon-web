import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		return this.get('store').findAll('news-item', {include: 'author,comments'});
	}
});
