import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadModule(path, dependencies = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => {
    assert(name in dependencies, `Unexpected dependency: ${name}`);
    return dependencies[name];
  } });
  return exports;
}

const mapper = loadModule('src/lib/race-map.mapper.ts');
const { mapCoordinatorDistance } = loadModule('src/lib/coordinator-map.mapper.ts', {
  '@/lib/race-map.mapper': mapper,
});
const checkpoint = (type, index) => ({
  id: `cp-${type}`, name: type, type, km: index,
  lat: 13.78 + index * 0.001, lng: 109.21 + index * 0.001,
  cutoff: type === 'cutoff' ? '10:30' : null,
});
const course = {
  title: 'Fun Run 5K', distanceId: 'distance-id', distanceKm: 5,
  waypoints: [{ lat: 13.78, lng: 109.21 }],
  polyline: [{ lat: 13.78, lng: 109.21 }, { lat: 13.79, lng: 109.22 }],
  checkpoints: ['start', 'cp', 'aid', 'finish', 'water', 'medical', 'cutoff'].map(checkpoint),
  updatedAt: '2026-10-25T12:00:00Z',
};
const metadata = {
  id: 'distance-id', name: 'Old name', type: 'road', distanceKm: 10,
  startLocation: { lat: 1, lng: 2 }, finishLocation: { lat: 3, lng: 4 },
  leafletPolyline: [[1, 2], [3, 4]], checkpoints: [checkpoint('water', 1)],
};

test('GET course uses the shared Map endpoint without a body and preserves all response fields', async () => {
  let calls = 0;
  const api = { get: async (...args) => {
    calls++;
    assert.equal(args.length, 1);
    assert.equal(args[0], 'api/v1/map/events/event-id/distances/distance-id/course');
    return course;
  } };
  const { getEventCourse } = loadModule('src/api/race-map.ts', { '@/config/axios': api });
  assert.equal(await getEventCourse('event-id', 'distance-id'), course);
  assert.equal(calls, 1);
});

test('a successful empty stub remains distinct from a failed request', async () => {
  const empty = { ...course, distanceId: null, distanceKm: 0, waypoints: [], polyline: [], checkpoints: [] };
  const { getEventCourse, courseHasRoute } = loadModule('src/api/race-map.ts', {
    '@/config/axios': { get: async () => empty },
  });
  assert.equal(await getEventCourse('event-id', 'distance-id'), empty);
  assert.equal(courseHasRoute(empty), false);
  const failure = new Error('Not allowed to read this draft course');
  const failing = loadModule('src/api/race-map.ts', { '@/config/axios': { get: async () => { throw failure; } } });
  await assert.rejects(() => failing.getEventCourse('event-id', 'distance-id'), failure);
});

test('coordinator metadata uses the real event endpoint', async () => {
  const event = { id: 'event-id', distances: [] };
  const { getCoordinatorMapEvent } = loadModule('src/api/coordinator-map.ts', {
    '@/config/axios': { get: async (path) => {
      assert.equal(path, 'api/v1/event/event-id');
      return event;
    } },
  });
  assert.equal(await getCoordinatorMapEvent('event-id'), event);
});

test('both maps retain every support checkpoint, its coordinates, km and nullable cutoff', () => {
  const points = mapper.courseToCheckpoints(course);
  assert.equal(points.length, 5);
  assert.equal(points.map((point) => point.type).join(','), 'TIMING,AID,WATER,MEDICAL,TIMING');
  for (const point of points) {
    const source = course.checkpoints.find((item) => item.id === point.id);
    assert.equal(point.latitude, source.lat);
    assert.equal(point.longitude, source.lng);
    assert.equal(point.distanceFromStart, source.km * 1000);
    assert.equal(point.description, source.cutoff ? `Cutoff: ${source.cutoff}` : undefined);
  }
});

test('coordinator takes geometry, title and km from course, and preserves the requested distance identity', () => {
  const mapped = mapCoordinatorDistance(metadata, 0, course);
  assert.equal(mapped.id, metadata.id);
  assert.equal(mapped.name, course.title);
  assert.equal(mapped.distanceKm, course.distanceKm);
  assert.equal(mapped.route.length, 2);
  assert.equal(mapped.route[0], course.polyline[0]);
  assert.equal(mapped.startPoint.lat, course.checkpoints[0].lat);
  assert.equal(mapped.finishPoint.lat, course.checkpoints[3].lat);
  assert.equal(mapped.checkpoints, course.checkpoints);
});

test('missing embedded geometry is supported and endpoints fall back to course polyline or waypoints', () => {
  const distance = { id: 'distance-id', name: '5K', type: 'road', distanceKm: 5 };
  const mapped = mapCoordinatorDistance(distance, 1, { ...course, checkpoints: [] });
  assert.equal(mapped.startPoint.lat, course.polyline[0].lat);
  assert.equal(mapped.finishPoint.lng, course.polyline[1].lng);
  assert.equal(mapped.elevationGainM, null);
  const waypointsOnly = mapCoordinatorDistance(distance, 0, { ...course, checkpoints: [], polyline: [] });
  assert.equal(waypointsOnly.startPoint.lat, course.waypoints[0].lat);
  assert.equal(waypointsOnly.route.length, 0);
});

test('empty course does not bring back stale distance routes or checkpoints', () => {
  const empty = { ...course, distanceId: null, distanceKm: 0, waypoints: [], polyline: [], checkpoints: [] };
  const mapped = mapCoordinatorDistance(metadata, 0, empty);
  assert.equal(mapped.id, metadata.id);
  assert.equal(mapped.distanceKm, 0);
  assert.equal(mapped.route.length, 0);
  assert.equal(mapped.checkpoints.length, 0);
  assert.equal(mapper.courseToRoute(null).length, 0);
  assert.equal(mapper.courseToCheckpoints(null).length, 0);
});
