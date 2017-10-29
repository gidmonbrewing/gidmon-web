import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		saveComment() {
			let _this = this;
			// The model for this route contains the new comment and the current session
			this.model.comment.set('newsItem', this.model.newsItem);
			this.model.comment.save().then(function (/*model*/) {
				// save worked
				_this.transitionToRoute('news.item');
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
			this.transitionToRoute('news.item'); // Not providing any argument will use the current model for item
		},
	}
});
