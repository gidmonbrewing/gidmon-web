import Ember from 'ember';

export default Ember.Controller.extend({
  authManager: Ember.inject.service(),
  isAuthenticated: Ember.computed('authManager.token',  function() {
    return this.get("authManager.token") !== "";
  }),
  actions: {
    authenticate() {
      const { login, password } = this.getProperties('login', 'password');
      this.get('authManager').authenticate(login, password).then(() => {
      }, (err) => {
        alert('Error obtaining token: [' + err.status + "] " + err.statusText);
      });
    },
    logout() {
      this.get('authManager').invalidate();
    }
  }
});
