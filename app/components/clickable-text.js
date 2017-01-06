import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	click() {
		//alert("DoubleClickableComponent was clicked!");
	},
	keyUp() {
		//var value = Number.parseFloat(this.get('element').children[0].innerText);
		//if (Number.isNaN(value)) {
		//	return false;
		//}
	},
	keyDown(param) {
		if (param.keyCode === 13) {
			var value = Number.parseFloat(this.get('element').children[0].innerText);
			if (Number.isNaN(value)) {
				alert("Can only input number");
			} else {
				this.set('value', value);
			}
			return false;
		}
	},
});
