import Controller from '@ember/controller';
import { inject } from '@ember/controller';

export default Controller.extend({
	appCont: inject('application')
});
