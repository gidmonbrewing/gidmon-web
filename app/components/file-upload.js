import FileField from 'ember-uploader/components/file-field';
import Uploader from 'ember-uploader/uploaders/uploader';
import { inject } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default FileField.extend({
	store: inject(),
	filesDidChange: function (files) {
		const uploader = Uploader.create({
			url: this.get('url'),
			ajaxSettings: {
				headers: this.get('store').adapterFor('application').get('headers')
			}
		});
	
		if (!isEmpty(files)) {
			// this second argument is optional and can to be sent as extra data with the upload
			uploader.upload(files[0], {}).then(data => {
				// Handle success
				this.get('owningModel').set('picture', data.data.attributes.picture);
			}, error => {
				// Handle failure
				if (error.responseJSON) {
					alert(error.responseJSON["errors"].detail);
				}
				else {
					alert("Unknown error");
				}
			});
		}
	}
});
