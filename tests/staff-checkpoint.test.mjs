import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/staff-checkpoint.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports });
const { checkpointStats, matchesCheckpointFilter, checkpointAccessLost } = exports;
const athlete = (overrides = {}) => ({ motion: 'Racing', passedAtSeconds: null, isInAssignedSegment: true, hasPendingDq: false, ...overrides });

test('checkpoint counts distinguish runners approaching from DNS/DNF/DQ before the checkpoint', () => {
  const stats = checkpointStats([
    athlete(), athlete({ motion: 'Dns' }), athlete({ motion: 'Dnf' }), athlete({ motion: 'Dq' }),
    athlete({ passedAtSeconds: 12 }), athlete({ passedAtSeconds: 13, motion: 'Dnf' }),
  ]);
  assert.equal(stats.total, 6);
  assert.equal(stats.passed, 2);
  assert.equal(stats.approaching, 1);
  assert.equal(stats.stoppedBefore, 3);
});

test('checkpoint filters use server segment and pending flags independent of action permissions', () => {
  assert.equal(matchesCheckpointFilter(athlete({ canDnf: false }), 'segment'), true);
  assert.equal(matchesCheckpointFilter(athlete({ isInAssignedSegment: false, canDnf: true }), 'segment'), false);
  assert.equal(matchesCheckpointFilter(athlete({ hasPendingDq: true, pendingDq: null }), 'pending'), true);
  assert.equal(matchesCheckpointFilter(athlete({ motion: 'Dns' }), 'approaching'), false);
  assert.equal(matchesCheckpointFilter(athlete({ motion: 'Dnf', passedAtSeconds: 10 }), 'passed'), true);
});

test('access revocation clears private data while transport and server errors remain recoverable', () => {
  assert.equal(checkpointAccessLost({ response: { status: 401 } }), true);
  assert.equal(checkpointAccessLost({ response: { status: 403 } }), true);
  assert.equal(checkpointAccessLost(new Error('Invocation failed: CHECKPOINT_ACCESS_DENIED: revoked')), true);
  assert.equal(checkpointAccessLost({ response: { status: 400, data: { message: 'CHECKPOINT_ACCESS_DENIED: revoked' } } }), true);
  assert.equal(checkpointAccessLost({ response: { status: 503 } }), false);
  assert.equal(checkpointAccessLost(new Error('Network Error')), false);
});
