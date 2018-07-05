import Route from '@ember/routing/route';

export default Route.extend({
	model() {
		if (sessionStorage.accessCount) {
			sessionStorage.accessCount = Number(sessionStorage.accessCount) + 1;
		} else {
			sessionStorage.accessCount = 1;
		}

		console.log(sessionStorage.accessCount);
		return this.get('store').findAll('beer');
		//return recipes;
	}
});
