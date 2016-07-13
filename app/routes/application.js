import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    // let beer = this.get('store').createRecord('beer', {
    //   id: 1,
    //   name: 'Gidmon Dumle'
    // });
    // beer.save();
    // let recipe = this.get('store').createRecord('recipe', {
    //   id: 1,
    //   beer: beer
    // });
    // beer.set('recipe', recipe);
    // recipe.save();
    // this.get('store').push({
    //   data: [{
    //     id: 1,
    //     type: 'beer',
    //     attributes: {
    //       name: 'Gidmon Bla',
    //     },
    //     relationships: {
    //       recipe: {
    //         data: [{
    //           id: 1,
    //           type: 'recipe'
    //         }]
    //       }
    //     }
    //   }, {
    //     id: 2,
    //     type: 'beer',
    //     attributes: {
    //       name: 'Gidmon Dumle',
    //     },
    //     relationships: {
    //       recipe: {
    //         data: [{
    //           id: 2 ,
    //           type: 'recipe'
    //         }]
    //       }
    //     }
    //   }],
    //   included: [{
    //     id: 1,
    //     type: 'recipe',
    //     attributes: {},
    //     relationships: {
    //       beer: {
    //         data: [{
    //           id: 1,
    //           type: 'beers'
    //         }]
    //       }
    //     }
    //   }, {
    //     id: 2,
    //     type: 'recipe',
    //     attributes: {},
    //     relationships: {
    //       beer: {
    //         data: [{
    //           id: 2,
    //           type: 'beers'
    //         }]
    //       }
    //     }
    //   }]
    // });
  }
});
