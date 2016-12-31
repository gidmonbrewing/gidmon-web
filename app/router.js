import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
	location: config.locationType,
	rootURL: config.rootURL
});

Router.map(function() {
	this.route('recipes');
	this.route('recipe', { path: '/recipe/:recipe_id' });
	this.route('beers');
	this.route('beer', { path: '/beer/:beer_id' });
	this.route('login');
	this.route('about');
	this.route('news-item', { path: '/news-item/:news-item_id' }, function() {
		this.route('comment');
	});
	this.route('news', function() {
		this.route('new');
		this.route('item', { path: '/:news_id' }, function() {
			this.route('comment');
		});
		this.route('edit');
	});
	this.route('profile', { path: '/profile/:profile_id' });
});

export default Router;
