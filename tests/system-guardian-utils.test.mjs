import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDuplicateGroups,
  buildSuggestedSelection,
  computeSelectedBytes,
  partitionBySelection,
} from '../src/lib/system-guardian-utils.mjs';

const files = [
  { id: 'a', path: 'docs/a.txt', size: 100, fingerprint: '100:h1' },
  { id: 'b', path: 'downloads/a.txt', size: 100, fingerprint: '100:h1' },
  { id: 'c', path: 'backup/a.txt', size: 100, fingerprint: '100:h1' },
  { id: 'd', path: 'pics/image.jpg', size: 250, fingerprint: '250:h2' },
  { id: 'e', path: 'old/image.jpg', size: 250, fingerprint: '250:h2' },
  { id: 'f', path: 'unique/file.bin', size: 999, fingerprint: '999:h3' },
];

test('buildDuplicateGroups creates groups and savings', () => {
  const groups = buildDuplicateGroups(files);

  assert.equal(groups.length, 2);
  const byFingerprint = new Map(groups.map(group => [group.fingerprint, group]));
  assert.equal(byFingerprint.get('100:h1')?.files.length, 3);
  assert.equal(byFingerprint.get('100:h1')?.potentialSavings, 200);
  assert.equal(byFingerprint.get('250:h2')?.files.length, 2);
  assert.equal(byFingerprint.get('250:h2')?.potentialSavings, 250);
});

test('buildSuggestedSelection keeps first file and selects the rest', () => {
  const groups = buildDuplicateGroups(files);
  const selected = buildSuggestedSelection(groups);

  assert.deepEqual([...selected].sort(), ['a', 'b', 'd']);
});

test('computeSelectedBytes returns exact selected size', () => {
  const selected = new Set(['b', 'c', 'e']);
  assert.equal(computeSelectedBytes(files, selected), 450);
});

test('partitionBySelection separates deletions and remaining files', () => {
  const selected = new Set(['b', 'e']);
  const { toDelete, remaining } = partitionBySelection(files, selected);

  assert.deepEqual(
    toDelete.map(f => f.id).sort(),
    ['b', 'e']
  );
  assert.equal(remaining.length, 4);
  assert.equal(remaining.some(f => f.id === 'b'), false);
});
