import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';

const runtimeRequire = createRequire(import.meta.url);
const { NextRequest } = runtimeRequire('next/server');

function loadModule(filename, overrides = {}) {
  const cache = new Map();
  function load(file) {
    const absolute = path.resolve(file);
    if (cache.has(absolute)) return cache.get(absolute);
    const exports = {};
    cache.set(absolute, exports);
    const code = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText;
    vm.runInNewContext(code, {
      exports, URL, process, console, atob, TextDecoder, Uint8Array,
      require(name) {
        if (Object.hasOwn(overrides, name)) return overrides[name];
        if (name.startsWith('@/')) return load(`src/${name.slice(2)}.ts`);
        if (name.startsWith('.')) return load(path.resolve(path.dirname(absolute), name) + '.ts');
        return runtimeRequire(name);
      },
    }, { filename: absolute });
    return exports;
  }
  return load(filename);
}

const permissions = loadModule('src/lib/route-permissions.ts');
const { mapAppRole } = loadModule('src/lib/role.ts');
const serverAuth = loadModule('src/lib/server-auth.ts');
const nav = loadModule('src/config/ops-nav.ts');
const navigation = {
  ADMIN: nav.ADMINISTRATOR_NAV,
  MANAGER: nav.MANAGER_NAV,
  RACE_STAFF: nav.RACE_STAFF_NAV,
  PHOTOGRAPHER: nav.PHOTOGRAPHER_NAV,
};
const roleNames = { ADMIN: 'Admin', MANAGER: 'Manager', RACE_STAFF: 'Race-staff', PHOTOGRAPHER: 'Photographer' };

function request(url, cookie = 'raceday_ops_session=valid') {
  return new NextRequest('http://localhost:3001' + url, { headers: { Cookie: cookie } });
}

function proxyFor(roleName, verify) {
  return loadModule('src/proxy.ts', {
    './lib/server-auth': {
      ...serverAuth,
      verifiedUser: verify ?? (async (token) => token ? { id: 'verified-user', roleName } : null),
    },
  }).proxy;
}

test('new IAM roles normalize consistently in short and .NET JWT claims', () => {
  const { extractRoleFromToken } = loadModule('src/lib/jwt.ts');
  for (const [role, name] of Object.entries(roleNames)) {
    assert.equal(mapAppRole(name), role);
    for (const claim of ['role', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role']) {
      for (const value of [name, [name]]) {
        const token = 'header.' + Buffer.from(JSON.stringify({ exp: 2_000_000_000, [claim]: value })).toString('base64url') + '.signature';
        assert.equal(extractRoleFromToken(token), role);
      }
    }
  }
  for (const name of ['race-staff', 'RaceStaff', 'race_staff', ' ROLE_Race-staff ']) {
    assert.equal(mapAppRole(name), 'RACE_STAFF');
  }
  for (const retired of ['Coordinator', 'Volunteer']) {
    assert.equal(permissions.ROLE_PREFIX[mapAppRole(retired)], undefined);
  }
});

test('Admin and Manager menus enforce separate permissions for every link and detail URL', () => {
  for (const [role, workspace] of Object.entries(navigation)) {
    const links = workspace.groups.flatMap((group) => group.items.map((item) => item.href));
    assert.equal(new Set(links).size, links.length, 'combined menu must not duplicate scanner');
    for (const link of links) {
      const owners = permissions.routePermission(link);
      assert.ok(owners.includes(role), `${role} must own ${link}`);
      assert.ok(permissions.routePermission(link + '/example-id').includes(role));
      // Exclusive routes: workspace prefix must match. Shared routes (vd. /refund-claims)
      // and /admin/<manager-route> remaps are covered by short-path + proxy tests.
      if (owners.length === 1) {
        assert.equal(
          permissions.routePermission(permissions.ROLE_PREFIX[role] + link).join(','),
          role
        );
      }
    }
  }
  assert.equal(permissions.routePermission('/manager/users').length, 0);
  assert.equal(permissions.routePermission('/photographer/finance').length, 0);
  assert.equal(permissions.routePermission('/admin/approvals/event-id').join(','), 'MANAGER');
  assert.equal(permissions.routePermission('/admin/package-capacities').join(','), 'MANAGER');
  assert.equal(permissions.routePermission('/payouts').join(','), 'MANAGER');
  assert.equal(permissions.routePermission('/admin/payouts').join(','), 'MANAGER');
  // Bookmark cũ Admin (redirect /users); refund-claims shared với Manager.
  assert.ok(permissions.routePermission('/finance').includes('ADMIN'));
  assert.ok(permissions.routePermission('/settings').includes('ADMIN'));
  assert.ok(permissions.routePermission('/refund-claims').includes('MANAGER'));
});

test('Race-staff can open every former Coordinator and Volunteer tool', () => {
  const tools = ['map', 'scanner', 'manual', 'issues', 'status', 'medical', 'cutoff', 'inventory', 'contingency', 'broom'];
  const links = nav.RACE_STAFF_NAV.groups.flatMap((group) => group.items.map((item) => item.href));
  for (const tool of tools) {
    assert(links.includes('/' + tool));
    for (const prefix of ['', '/race-staff', '/coordinator', '/volunteer']) {
      assert.equal(permissions.routePermission(`${prefix}/${tool}`).join(','), 'RACE_STAFF');
    }
  }
});

test('map and scanner select only active Race-staff assignments', () => {
  const { isActiveRaceStaffAssignment } = loadModule('src/lib/staff-assignment.ts');
  const assignments = [
    { eventId: 'photo', role: 'photographer', status: 'Active' },
    { eventId: 'inactive', role: 'race-staff', status: 'Invited' },
    { eventId: 'race', role: 'race-staff', status: 'Active' },
    { eventId: 'revoked', role: 'race-staff', status: 'Revoked' },
  ];
  assert.equal(assignments.find(isActiveRaceStaffAssignment).eventId, 'race');
  assert.deepEqual(assignments.filter(isActiveRaceStaffAssignment).map((item) => item.eventId), ['race']);
});

test('each role uses the verified session to reach its workspace and rejects other role menus', async () => {
  for (const [role, roleName] of Object.entries(roleNames)) {
    const proxy = proxyFor(roleName);
    const home = await proxy(request('/'));
    assert.equal(new URL(home.headers.get('x-middleware-rewrite')).pathname, permissions.ROLE_PREFIX[role]);
    for (const [owner, workspace] of Object.entries(navigation)) {
      for (const item of workspace.groups.flatMap((group) => group.items)) {
        const response = await proxy(request(item.href));
        const shared = permissions.routePermission(item.href).includes(role);
        if (owner === role || shared) {
          assert.equal(new URL(response.headers.get('x-middleware-rewrite')).pathname, permissions.ROLE_PREFIX[role] + item.href);
        } else {
          assert.equal(new URL(response.headers.get('location')).pathname, '/forbidden');
        }
      }
    }
    const password = await proxy(request('/change-password'));
    assert.equal(password.headers.get('x-middleware-next'), '1');
  }
});

test('legacy bookmarks redirect only for the new owner and preserve query parameters', async () => {
  for (const [roleName, oldPath, cleanPath] of [
    ['Race-staff', '/coordinator/map', '/map'],
    ['Race-staff', '/volunteer/manual', '/manual'],
    ['Manager', '/admin/approvals/event-id', '/approvals/event-id'],
    ['Manager', '/admin/promos', '/promos'],
    ['Manager', '/admin/payouts', '/payouts'],
  ]) {
    const response = await proxyFor(roleName)(request(oldPath + '?page=2'));
    assert.equal(response.headers.get('location'), 'http://localhost:3001' + cleanPath + '?page=2');
  }
  const denied = await proxyFor('Admin')(request('/admin/approvals'));
  assert.equal(new URL(denied.headers.get('location')).pathname, '/forbidden');
});

test('forged legacy cookies cannot log in or elevate the verified role', async () => {
  const anonymous = await proxyFor('Admin')(request('/users?q=test', 'accessToken=fake; role=Admin'));
  const login = new URL(anonymous.headers.get('location'));
  assert.equal(login.pathname, '/login');
  assert.equal(login.searchParams.get('from'), '/users?q=test');
  const response = await proxyFor('Race-staff')(request('/users', 'raceday_ops_session=valid; role=Admin'));
  assert.equal(new URL(response.headers.get('location')).pathname, '/forbidden');
  const expired = await proxyFor(null, async () => null)(request('/'));
  assert(expired.headers.get('set-cookie').includes('raceday_ops_session=;'));
  assert.equal((await proxyFor('Admin')(request('/login', ''))).headers.get('x-middleware-next'), '1');
});

test('authentication outages return 503 without redirect loops', async () => {
  const response = await proxyFor(null, async () => { throw new Error('offline'); })(request('/'));
  assert.equal(response.status, 503);
});

test('login resumes an allowed local URL and falls back to the role home otherwise', () => {
  for (const [role, target, expected] of [
    ['Manager', '/approvals/event-id?tab=course', '/approvals/event-id?tab=course'],
    ['Admin', '/approvals', '/'],
    ['Manager', '/users', '/'],
    ['Race-staff', '/manual', '/manual'],
    ['Photographer', '/upload', '/upload'],
    ['Admin', '/change-password', '/change-password'],
    ['Admin', '//attacker.invalid', '/'],
    ['Admin', '/\\attacker.invalid', '/'],
    ['Admin', '/login', '/'],
    ['Admin', '/users/../../approvals', '/'],
  ]) assert.equal(permissions.loginDestination(role, target), expected);
});

test('Manager requests retain the existing event admin endpoints and payloads', async () => {
  const calls = [];
  const api = Object.fromEntries(['get', 'post', 'patch'].map((method) => [method, async (url, body) => {
    calls.push({ method, url, body });
    return [];
  }]));
  const events = loadModule('src/api/admin-events.ts', { '@/config/axios': { default: api } });
  await events.listPendingEvents();
  await events.getAdminEventById('event-id');
  await events.approveEvent('event-id', true);
  await events.rejectEvent('event-id', 'Missing course');
  const packages = loadModule('src/api/admin-packages.ts', { '@/config/axios': { default: api } });
  for (const [list, create, update, resource] of [
    ['listPackageDurations', 'createPackageDuration', 'updatePackageDuration', 'package-durations'],
    ['listPackageCapacities', 'createPackageCapacity', 'updatePackageCapacity', 'package-capacities'],
    ['listPromoCodes', 'createPromoCode', 'updatePromoCode', 'promos'],
  ]) {
    await packages[list]();
    await packages[create]({ name: 'test' });
    await packages[update]('option-id', { isActive: false });
    assert.equal(calls.at(-3).url, `api/v1/event/manager/${resource}`);
    assert.equal(calls.at(-2).url, `api/v1/event/manager/${resource}`);
    assert.equal(calls.at(-1).url, `api/v1/event/manager/${resource}/option-id`);
  }
  assert.deepEqual(calls.slice(0, 4).map(({ method, url }) => [method, url]), [
    ['get', 'api/v1/event/manager/pending'],
    ['get', 'api/v1/event/manager/event-id'],
    ['post', 'api/v1/event/manager/event-id/approve'],
    ['post', 'api/v1/event/manager/event-id/reject'],
  ]);
  assert.equal(calls[2].body.openRegistration, true);
  assert.equal(calls[3].body.reason, 'Missing course');
});
