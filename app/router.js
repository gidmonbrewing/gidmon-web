import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('recipes');
  this.route('beers');
  this.route('beer', { path: '/beer/:beer_id' });
  this.route('login');
  this.route('about');
  this.route('news-item');
});

export default Router;
