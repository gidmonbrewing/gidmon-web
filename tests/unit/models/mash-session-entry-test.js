import { moduleForModel, test } from 'ember-qunit';

moduleForModel('mash-session-entry', 'Unit | Model | mash session entry', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});
