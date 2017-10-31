import Component from '@ember/component';

export default Component.extend({
	click() {
		if (this.get('toggleParam')) {
			this.set('toggleParam', false);
		} else {
			this.set('toggleParam', true);
		}
	}
});
