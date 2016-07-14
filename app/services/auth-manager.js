import Ember from 'ember';

export default Ember.Service.extend({
  token: Ember.computed({
    get() {
      if (sessionStorage.token) {
        return sessionStorage.token;
      } else {
        return "";
      }
    },
    set(key, value) {
      sessionStorage.token = value;
      return value;
    }
  }),
  authenticate(login, password) {
    return Ember.$.ajax({
      method: "POST",
      url: "/api-token-auth",
      data: { username: login, password: password }
    }).then((result) => {
      this.set('token', result.token);
    });
  },

  invalidate() {
    this.set('token', "");
  },

  isAuthenticated: Ember.computed('token',  function() {
    return this.get('token') !== "";
  }),
});
