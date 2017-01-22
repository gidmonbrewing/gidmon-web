import DS from 'ember-data';

export default DS.Model.extend({
	session: DS.belongsTo('brewing-session'),
	recipeEntry: DS.belongsTo('boil-recipe-entry'),
	alpha: DS.attr('number'),
	addTime: Ember.computed('recipeEntry.addTime', function () {
		// expose this here to be able to get proper data listeners in session
		return this.get('recipeEntry.addTime');
	}),
	amount: Ember.computed('recipeEntry.amount', function () {
		// expose this here to be able to get proper data listeners in session
		return this.get('recipeEntry.amount');
	}),
});
