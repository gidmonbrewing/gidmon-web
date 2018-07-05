import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
	authManager: service(),
	model() {
		let store = this.get('store');
		let newsItem = store.createRecord('news-item');
		return newsItem;
	}
});
