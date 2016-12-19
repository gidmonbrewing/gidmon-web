import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		saveComment() {
			//let _this = this;
			this.model.save().then(function (/*model*/) {
				// save worked
			}, function (error) {
				// error handling
				var errorText = "";
				error.errors.forEach(function (element) {
					errorText += element.detail + '\n';
				});
				alert(errorText);
			});
		},
		cancelComment() {
			this.model.destroyRecord();
			this.transitionToRoute('news.item'); // Not providing any argument will use the current model for item
		},
	}
});
