import Ember from 'ember';

export default Ember.Component.extend({
	tagName: 'span',
	updateValue() {
		var value = Number.parseFloat(this.get('element').children[0].innerText);
		if (Number.isNaN(value)) {
			alert("Can only input number");
		} else {
			this.set('value', value);
		}
	},
	focusOut() {
		this.updateValue();
	},
	keyDown(param) {
		if (param.keyCode === 13) {
			this.updateValue();
			return false;
		}
	},
});
