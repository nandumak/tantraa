import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDemoAction, decodeActivities, saveDemoAction, DEMO_STORAGE_KEY } from '../lib/demo-store.ts';

const now = Date.parse('2026-10-07T08:00:00Z');
const donation = { action: 'donation', title: 'Fresh meals', quantity: '12', location: 'Kannur', diet: 'Vegetarian', deadline: '2026-10-07T10:00:00Z' };
test('donation, pickup and delivery survive a storage round trip', () => {
  let records = applyDemoAction([], donation, now, () => 'donation-1');
  records = applyDemoAction(records, { action: 'claim', ref: 'donation-1' }, now, () => 'claim-1');
  records = applyDemoAction(records, { action: 'advance', id: 'claim-1' }, now);
  assert.equal(records[0].status, 'picked-up');
  records = applyDemoAction(records, { action: 'advance', id: 'claim-1' }, now);
  assert.equal(records[0].status, 'delivered');
  assert.equal(records[0].quantity, 12);
  assert.deepEqual(decodeActivities(JSON.stringify({ version: 1, activities: records })), records);
  assert.deepEqual(applyDemoAction(records, { action: 'advance', id: 'claim-1' }, now), records);
});
test('duplicate claims stay unique and unavailable or expired food is rejected', () => {
  let records = applyDemoAction([], { action: 'claim', ref: 'sample-meals' }, now, () => 'sample-1');
  records = applyDemoAction(records, { action: 'claim', ref: 'sample-meals' }, now);
  assert.equal(records.length, 1);
  assert.throws(() => applyDemoAction(records, { action: 'claim', ref: 'missing' }, now), /unavailable/);
  records = applyDemoAction(records, donation, now, () => 'donation-1');
  assert.throws(() => applyDemoAction(records, { action: 'claim', ref: 'donation-1' }, now + 7200000), /ended/);
});
test('invalid submissions are rejected; all participation roles are supported', () => {
  for (const quantity of ['0', '-1', '1.5', '10001', 'NaN']) assert.throws(() => applyDemoAction([], { ...donation, quantity }, now), /quantity/);
  assert.throws(() => applyDemoAction([], { ...donation, deadline: 'invalid' }, now), /future/);
  assert.throws(() => applyDemoAction([], { ...donation, diet: 'invalid' }, now), /food type/);
  for (const action of ['volunteer', 'organization', 'recipient', 'help']) {
    const result = applyDemoAction([], { action, title: 'Demo person', location: 'Kannur', quantity: 5 }, now, () => action);
    assert.equal(result[0].kind, action);
  }
});
test('corrupt or blocked storage never reports a successful save', async () => {
  assert.deepEqual(decodeActivities(null), []);
  assert.throws(() => decodeActivities('{invalid'), /could not be read/);
  assert.throws(() => decodeActivities('{"version":1,"activities":[{}]}'), /could not be read/);
  const localStorage = { getItem: () => null, setItem: () => { throw new Error('QuotaExceededError'); } };
  globalThis.window = { localStorage };
  const navigatorDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: {} });
  await assert.rejects(saveDemoAction({ action: 'claim', ref: 'sample-meals' }), /could not be saved/);
  let stored;
  localStorage.setItem = (key, value) => { assert.equal(key, DEMO_STORAGE_KEY); stored = value; };
  const result = await saveDemoAction({ action: 'claim', ref: 'sample-meals' });
  assert.deepEqual(decodeActivities(stored), result);
  delete globalThis.window;
  if (navigatorDescriptor) Object.defineProperty(globalThis, 'navigator', navigatorDescriptor);
});
