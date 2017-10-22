import Ember from 'ember';

export function formatDate(params/*, hash*/) {
	let date = params[0];
	//return date.toDateString() + " " + date.getHours() + ":" + date.getMinutes();
	return date.toLocaleString('sv-SE');
}

export default Ember.Helper.helper(formatDate);
