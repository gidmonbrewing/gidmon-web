import Ember from 'ember';

export default Ember.Controller.extend({
  actions: {
    updateModel() {
      console.log(event.target.value);
      this.model.set(event.target.name, event.target.value);
      this.model.save();
    }
  }
});
