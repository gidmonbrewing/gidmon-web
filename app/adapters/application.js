import JSONAPIAdapter from 'ember-data/adapters/json-api';

export default JSONAPIAdapter.extend({
  //host: 'http://localhost:8000'
  namespace: "api",
  authManager: Ember.inject.service(),
  headers: Ember.computed('authManager.token', function() {
    if (this.get('authManager.token') != "") {
      return {
        "Authorization": `Token ${this.get("authManager.token")}`
      };
    } else {
      return {};
    }
  })
});
