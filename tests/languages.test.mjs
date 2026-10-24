import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { markdownFiles } from '../assets/site/pages.mjs';
import { validateRegistry, chooseLanguage, withLanguage } from '../assets/site/languages.mjs';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
const registry = JSON.parse(read('content/languages.json'));
const anchors = markdown => [...markdown.matchAll(/^#{1,6} .*:id=([a-z0-9-]+)\s*$/gm)].map(match => match[1]);
const codeBlocks = markdown => [...markdown.matchAll(/```[^\n]*\n[\s\S]*?```/g)].map(match => match[0]);
const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function labelKeys(markdown) {
  let group;
  const keys = [];
  for (const line of markdown.split('\n')) {
    if (line.startsWith('## ')) group = slug(line.slice(3));
    if (line.startsWith('| ') && !line.startsWith('| Location |') && !line.startsWith('| ---')) {
      const cells = line.split('|');
      assert.ok(cells[2].trim(), `Empty translation: ${group}.${cells[1]}`);
      keys.push(`${group}.${slug(cells[1].trim())}`);
    }
  }
  assert.equal(new Set(keys).size, keys.length, 'No duplicate labels');
  return keys.sort();
}

test('language URLs take priority, with safe defaults for unsupported languages', () => {
  validateRegistry(registry);
  assert.equal(chooseLanguage(registry, 'de', 'en').code, 'de');
  assert.equal(chooseLanguage(registry, null, 'de').code, 'de');
  assert.equal(chooseLanguage(registry, null, 'missing').code, registry.defaultLanguage);
  assert.equal(chooseLanguage(registry, 'missing', 'de').code, registry.defaultLanguage);
  assert.equal(chooseLanguage(registry, null, undefined).code, registry.defaultLanguage);
});

test('switching language preserves document, anchor, deployment path, and other query parameters', () => {
  const href = 'https://example.org/objy/?campaign=test&lang=en#/DATABASE?id=deploy-a-cluster';
  const url = new URL(withLanguage(href, 'de'));
  assert.equal(url.pathname, '/objy/');
  assert.equal(url.searchParams.get('campaign'), 'test');
  assert.equal(url.searchParams.get('lang'), 'de');
  assert.equal(url.hash, '#/DATABASE?id=deploy-a-cluster');
  assert.equal(url.searchParams.getAll('lang').length, 1);
});

test('registry rejects duplicate codes, unsafe folder paths, and absent defaults', () => {
  assert.throws(() => validateRegistry({ ...registry, languages: [registry.languages[0], registry.languages[0]] }));
  assert.throws(() => validateRegistry({ defaultLanguage: '../en', languages: [{ code: '../en', name: 'English', short: 'EN' }] }));
  assert.throws(() => validateRegistry({ ...registry, defaultLanguage: 'missing' }));
});

const source = file => read(`content/${registry.defaultLanguage}/${file}`);
for (const language of registry.languages) {
  test(`${language.code}: all editorial files, labels, and anchors are complete`, () => {
    const files = Object.fromEntries(['home.md', 'sidebar.md', 'labels.md', 'database.md'].map(file => [file, read(`content/${language.code}/${file}`)]));
    assert.deepEqual(labelKeys(files['labels.md']), labelKeys(source('labels.md')));
    for (const file of ['home.md', 'database.md']) {
      assert.deepEqual(anchors(files[file]), anchors(source(file)), `${file} anchors must match`);
      assert.equal(new Set(anchors(files[file])).size, anchors(files[file]).length);
    }
    assert.deepEqual(codeBlocks(files['database.md']), codeBlocks(source('database.md')), 'Translate explanations, not executable examples');
    for (const [file, markdown] of Object.entries(files)) {
      for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = match[1];
        if (/^(https?:|mailto:)/.test(target)) continue;
        if (target.startsWith('assets/')) {
          assert.ok(existsSync(new URL(target, root)), `Missing image: ${target}`);
          continue;
        }
        const [page, query = ''] = target.replace(/^#/, '').split('?');
        const route = new URL(page || (file === 'home.md' || file === 'sidebar.md' ? '/' : file), 'https://objy.test/').pathname;
        const destination = markdownFiles(route, language.code, registry.defaultLanguage, registry.languages.map(item => item.code))
          .find(path => existsSync(new URL(path, root)));
        assert.ok(destination, `${file}: missing local page ${target}`);
        const id = new URLSearchParams(query).get('id');
        // The core pages use explicit IDs shared by all translations.
        if (id && /\/(home|database)\.md$/.test(destination)) {
          assert.ok(anchors(read(destination)).includes(id), `${file}: missing anchor ${target}`);
        }
      }
    }
  });
}
