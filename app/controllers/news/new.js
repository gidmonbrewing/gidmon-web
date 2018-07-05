import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({
	authManager: inject(),
	actions: {
		saveModel() {
			this.model.save();
		},
	}
});
