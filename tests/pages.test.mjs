import test from 'node:test';
import assert from 'node:assert/strict';
import { markdownFiles, loadMarkdown } from '../assets/site/pages.mjs';

const resolve = (route, language = 'de') => markdownFiles(route, language, 'en', ['en', 'de']);

test('home and legacy database links select the current translation', () => {
  assert.deepEqual(resolve('/'), ['content/de/home.md']);
  for (const route of ['/DATABASE', '/DATABASE.md', '/database.md']) {
    assert.deepEqual(resolve(route), ['content/de/database.md', 'content/en/database.md', 'database.md']);
  }
});

test('arbitrary and nested Markdown routes need no registration', () => {
  assert.deepEqual(resolve('/guides/setup.md'), [
    'content/de/guides/setup.md', 'content/en/guides/setup.md', 'guides/setup.md'
  ]);
  assert.deepEqual(resolve('/guides/setup'), resolve('/guides/setup.md'));
  assert.deepEqual(resolve('/guides/'), resolve('/guides/README.md'));
  assert.deepEqual(resolve('/Getting%20started'), [
    'content/de/Getting started.md', 'content/en/Getting started.md', 'Getting started.md'
  ]);
});

test('explicit content links keep shared documents and allow language switching', () => {
  assert.deepEqual(resolve('/content/EDITING.md'), ['content/EDITING.md']);
  assert.deepEqual(resolve('/content/en/guides/setup'), resolve('/guides/setup'));
  assert.deepEqual(resolve('/guides/setup', 'en'), ['content/en/guides/setup.md', 'guides/setup.md']);
});

test('loading prefers translations, then default content, then repository files', async () => {
  const files = resolve('/guides/setup');
  for (const available of files) {
    const requests = [];
    const result = await loadMarkdown(files, {
      fetchFile: async file => {
        requests.push(file);
        return new Response(file === available ? '# Setup' : '', { status: file === available ? 200 : 404 });
      }
    });
    assert.deepEqual(result, { file: available, markdown: '# Setup' });
    assert.deepEqual(requests, files.slice(0, files.indexOf(available) + 1));
  }
});

test('absent pages return no content; server errors do not silently fall back', async () => {
  assert.equal(await loadMarkdown(resolve('/missing'), { fetchFile: async () => new Response('', { status: 404 }) }), null);
  let requests = 0;
  await assert.rejects(loadMarkdown(resolve('/broken'), {
    fetchFile: async () => { requests++; return new Response('', { status: 503 }); }
  }), /503/);
  assert.equal(requests, 1);
});

test('route changes can cancel in-flight page requests', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(loadMarkdown(resolve('/guides/setup'), {
    signal: controller.signal,
    fetchFile: async (file, { signal }) => {
      assert.equal(signal, controller.signal);
      signal.throwIfAborted();
    }
  }), { name: 'AbortError' });
});
