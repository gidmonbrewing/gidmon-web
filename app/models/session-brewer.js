import DS from 'ember-data';

export default DS.Model.extend({
	brewer: DS.belongsTo('user'),
	session: DS.belongsTo('brewing-session'),
});
