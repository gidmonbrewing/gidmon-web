import Ember from 'ember';

export function formatDate(params/*, hash*/) {
  return params[0].toLocaleDateString();
}

export default Ember.Helper.helper(formatDate);
