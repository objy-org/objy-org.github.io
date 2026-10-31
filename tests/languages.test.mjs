import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { markdownFiles, contentLink } from '../assets/site/pages.mjs';
import { validateRegistry, chooseLanguage, withLanguage } from '../assets/site/languages.mjs';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const registry = JSON.parse(read('content/languages.json'));
const anchors = (markdown) =>
  [...markdown.matchAll(/^#{1,6} .*:id=([a-z0-9-]+)\s*$/gm)].map((match) => match[1]);
const withoutExamples = (markdown) =>
  markdown.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '').replace(/`[^`\n]+`/g, '');
const markdownFilesIn = (directory) =>
  readdirSync(new URL(directory, root), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? markdownFilesIn(`${directory}/${entry.name}`)
      : /\.(md|markdown)$/i.test(entry.name)
        ? [`${directory}/${entry.name}`]
        : [],
  );
const codeBlocks = (markdown) => [...markdown.matchAll(/```[^\n]*\n[\s\S]*?```/g)].map((match) => match[0]);
const slug = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

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
  const href = 'https://example.org/objy/?campaign=test&lang=en#/content/server?id=form-a-cluster';
  const url = new URL(withLanguage(href, 'de'));
  assert.equal(url.pathname, '/objy/');
  assert.equal(url.searchParams.get('campaign'), 'test');
  assert.equal(url.searchParams.get('lang'), 'de');
  assert.equal(url.hash, '#/content/server?id=form-a-cluster');
  assert.equal(url.searchParams.getAll('lang').length, 1);
});

test('registry rejects duplicate codes, unsafe folder paths, and absent defaults', () => {
  assert.throws(() =>
    validateRegistry({ ...registry, languages: [registry.languages[0], registry.languages[0]] }),
  );
  assert.throws(() =>
    validateRegistry({
      defaultLanguage: '../en',
      languages: [{ code: '../en', name: 'English', short: 'EN' }],
    }),
  );
  assert.throws(() => validateRegistry({ ...registry, defaultLanguage: 'missing' }));
});

const source = (file) => read(`content/${registry.defaultLanguage}/${file}`);
for (const language of registry.languages) {
  test(`${language.code}: all editorial files, labels, and anchors are complete`, () => {
    const folder = `content/${language.code}/`;
    const files = Object.fromEntries(
      markdownFilesIn(folder.replace(/\/$/, '')).map((path) => [path.slice(folder.length), read(path)]),
    );
    for (const entry of readdirSync(new URL(`content/${registry.defaultLanguage}/`, root))) {
      if (/\.md$/i.test(entry)) assert.ok(Object.hasOwn(files, entry), `Missing core translation: ${entry}`);
    }
    assert.deepEqual(labelKeys(files['labels.md']), labelKeys(source('labels.md')));
    for (const file of Object.keys(files)) {
      if (existsSync(new URL(`content/${registry.defaultLanguage}/${file}`, root))) {
        assert.deepEqual(anchors(files[file]), anchors(source(file)), `${file} anchors must match`);
        assert.deepEqual(
          codeBlocks(files[file]),
          codeBlocks(source(file)),
          `${file}: keep code examples unchanged`,
        );
      }
      assert.equal(new Set(anchors(files[file])).size, anchors(files[file]).length);
    }
    for (const [file, markdown] of Object.entries(files)) {
      for (const match of withoutExamples(markdown).matchAll(
        /(!?)\[[^\]]*\]\(([^)\s]+)(?:\s+['"][^'"]*['"])?\)/g,
      )) {
        const target = match[2];
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(target)) continue;
        if (match[1]) {
          const image = new URL(
            contentLink(target, folder + file, true, 'https://objy.test/'),
          ).pathname.slice(1);
          assert.ok(existsSync(new URL(image, root)), `Missing image: ${image}`);
          continue;
        }
        const currentRoute = ['home.md', 'sidebar.md'].includes(file) ? '/' : `/${file}`;
        const normalized = target.startsWith('#/') ? target.slice(1) : target.replace('#', '?id=');
        const destinationURL = new URL(normalized, `https://objy.test${currentRoute}`);
        const route = destinationURL.pathname;
        const destination = markdownFiles(
          route,
          language.code,
          registry.defaultLanguage,
          registry.languages.map((item) => item.code),
        ).find((path) => existsSync(new URL(path, root)));
        assert.ok(destination, `${file}: missing local page ${target}`);
        const id = destinationURL.searchParams.get('id');
        // Explicit IDs are the stable contract between translations.
        if (id && anchors(read(destination)).length) {
          assert.ok(anchors(read(destination)).includes(id), `${file}: missing anchor ${target}`);
        }
      }
    }
  });
}
