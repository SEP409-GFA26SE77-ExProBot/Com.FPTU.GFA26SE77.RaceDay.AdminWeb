import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/photo-upload.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports });
const { validatePhotoFiles, photoUploadBatches, MAX_PHOTO_BYTES } = exports;
const photo = (size = 100, type = 'image/jpeg') => ({ name: 'test.jpg', size, type });

test('accepts each backend-supported image format at the size boundary', () => {
  for (const type of ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']) {
    assert.equal(validatePhotoFiles([photo(MAX_PHOTO_BYTES, type)]), null);
  }
});

test('rejects empty, oversized, unsupported and excessive selections before uploading', () => {
  for (const files of [[], [photo(0)], [photo(MAX_PHOTO_BYTES + 1)], [photo(1, 'image/raw')], [photo(1, 'application/pdf')], Array.from({ length: 501 }, () => photo())]) {
    assert.equal(typeof validatePhotoFiles(files), 'string');
  }
  assert.equal(validatePhotoFiles(Array.from({ length: 500 }, () => photo())), null);
});

test('validates the entire selection before any batch is sent', () => {
  assert.equal(typeof validatePhotoFiles([photo(), { ...photo(0), name: 'empty.png' }]), 'string');
});

test('batching preserves every file in order while staying below the request limit', () => {
  const files = [photo(15 * 1024 * 1024), photo(12 * 1024 * 1024), photo(MAX_PHOTO_BYTES), photo(1), photo(2)];
  const batches = photoUploadBatches(files);
  assert.equal(batches.length, 4);
  assert.equal(batches.flat().length, files.length);
  batches.flat().forEach((item, index) => assert.equal(item, files[index]));
  for (const batch of batches) assert(batch.reduce((sum, file) => sum + file.size, 0) <= MAX_PHOTO_BYTES);
  assert.equal(photoUploadBatches([]).length, 0);
});
