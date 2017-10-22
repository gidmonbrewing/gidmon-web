import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		saveComment() {
			let _this = this;
			// The model for this route contains the new comment and the current session
			this.model.comment.set('brewingSession', this.model.session);
			this.model.comment.save().then(function (/*model*/) {
				// save worked
				_this.transitionToRoute('brewing-session');
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
			this.transitionToRoute('brewing-session'); // Not providing any argument will use the current model for item
		},
	}
});
