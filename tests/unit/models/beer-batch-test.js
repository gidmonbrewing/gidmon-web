import { moduleForModel, test } from 'ember-qunit';

moduleForModel('beer-batch', 'Unit | Model | beer batch', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
