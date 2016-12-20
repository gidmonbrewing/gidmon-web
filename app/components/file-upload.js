import Ember from 'ember';
import EmberUploader from 'ember-uploader';

export default EmberUploader.FileField.extend({
	store: Ember.inject.service(),
	filesDidChange: function (files) {
		const uploader = EmberUploader.Uploader.create({
			url: this.get('url'),
			ajaxSettings: {
				headers: this.get('store').adapterFor('application').get('headers')
			}
		});
	
		if (!Ember.isEmpty(files)) {
			// this second argument is optional and can to be sent as extra data with the upload
			uploader.upload(files[0], {}).then(data => {
				// Handle success
				this.get('owningModel').set('picture', data.data.attributes.picture);
			}, error => {
				// Handle failure
			});
		}
	}
});
