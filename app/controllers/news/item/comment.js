import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		postComment() {
			const { commentText } = this.getProperties('commentText');
			let newComment = this.get('store').createRecord('news-comment', {
				content: commentText,
				newsItem: this.model
			});
			let _this = this;
			newComment.save().then(function (model) {
				// save worked
				_this.transitionToRoute('news.item', model.get('newsItem.id'));
			}, function (error) {
				// error object contains responseJSON so I can get access to the server response 
				self._showErrorMessage(error.responseJSON.userMessage);
			})
		},
	}
});
