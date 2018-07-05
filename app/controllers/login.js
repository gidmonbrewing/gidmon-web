import Controller from '@ember/controller';
import { inject } from '@ember/service';
import { computed } from '@ember/object';

export default Controller.extend({
  authManager: inject(),
  isAuthenticated: computed('authManager.token',  function() {
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
