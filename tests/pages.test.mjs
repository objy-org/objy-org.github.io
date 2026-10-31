import test from 'node:test';
import assert from 'node:assert/strict';
import { markdownFiles, loadMarkdown, remoteRoute, remoteLink, contentLink } from '../assets/site/pages.mjs';

const resolve = (route, language = 'de') => markdownFiles(route, language, 'en', ['en', 'de']);

test('home selects the current translation', () => {
  assert.deepEqual(resolve('/'), ['content/de/home.md']);
});

test('arbitrary and nested Markdown routes need no registration', () => {
  assert.deepEqual(resolve('/guides/setup.md'), [
    'content/de/guides/setup.md',
    'content/en/guides/setup.md',
    'guides/setup.md',
  ]);
  assert.deepEqual(resolve('/guides/setup'), resolve('/guides/setup.md'));
  assert.deepEqual(resolve('/guides/'), resolve('/guides/README.md'));
  assert.deepEqual(resolve('/Getting%20started'), [
    'content/de/Getting started.md',
    'content/en/Getting started.md',
    'Getting started.md',
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
      fetchFile: async (file, options) => {
        assert.equal(options.cache, 'no-cache', 'Markdown edits must be revalidated');
        requests.push(file);
        return new Response(file === available ? '# Setup' : '', { status: file === available ? 200 : 404 });
      },
    });
    assert.deepEqual(result, { file: available, markdown: '# Setup' });
    assert.deepEqual(requests, files.slice(0, files.indexOf(available) + 1));
  }
});

test('absent pages return no content; server errors do not silently fall back', async () => {
  assert.equal(
    await loadMarkdown(resolve('/missing'), { fetchFile: async () => new Response('', { status: 404 }) }),
    null,
  );
  let requests = 0;
  await assert.rejects(
    loadMarkdown(resolve('/broken'), {
      fetchFile: async () => {
        requests++;
        return new Response('', { status: 503 });
      },
    }),
    /503/,
  );
  assert.equal(requests, 1);
});

test('route changes can cancel in-flight page requests', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    loadMarkdown(resolve('/guides/setup'), {
      signal: controller.signal,
      fetchFile: async (file, { signal }) => {
        assert.equal(signal, controller.signal);
        signal.throwIfAborted();
      },
    }),
    { name: 'AbortError' },
  );
});

const remoteReadme = 'https://raw.githubusercontent.com/objy-org/objy/refs/heads/main/README.md';

test('a standalone remote include loads its source and revalidates it on each visit', async () => {
  const controller = new AbortController();
  const calls = [];
  const fetchFile = async (file, options) => {
    calls.push({ file, options });
    return new Response(
      file === 'content/server.md' ? `[Documentation](${remoteReadme} ':include')\n` : '# Live documentation',
    );
  };
  for (let visit = 0; visit < 2; visit++) {
    assert.deepEqual(await loadMarkdown(['content/server.md'], { signal: controller.signal, fetchFile }), {
      file: remoteReadme,
      markdown: '# Live documentation',
    });
  }
  const remoteCalls = calls.filter((call) => call.file === remoteReadme);
  assert.equal(remoteCalls.length, 2);
  for (const call of remoteCalls) {
    assert.equal(call.options.signal, controller.signal);
    assert.equal(call.options.cache, 'no-cache');
    assert.equal(call.options.credentials, 'omit');
  }
});

test('remote Markdown links preserve source paths, queries, chapters, and reloadable routes', () => {
  const source = `${remoteReadme}?version=latest#quick-start`;
  const route = remoteRoute(source);
  assert.deepEqual(resolve(route.split('?')[0]), [`${remoteReadme}?version=latest`]);
  assert.equal(new URLSearchParams(route.split('?')[1]).get('id'), 'quick-start');
  assert.equal(
    remoteLink('client/README.md#browser', remoteReadme),
    remoteRoute(remoteReadme.replace('README.md', 'client/README.md#browser')),
  );
  assert.equal(
    remoteLink('../API.md', remoteReadme.replace('README.md', 'client/README.md')),
    remoteRoute(remoteReadme.replace('README.md', 'API.md')),
  );
  assert.equal(remoteLink('#quick-start', remoteReadme), remoteRoute(`${remoteReadme}#quick-start`));
  assert.equal(
    remoteLink('images/chart.svg', remoteReadme, true),
    remoteReadme.replace('README.md', 'images/chart.svg'),
  );
  assert.equal(remoteLink('https://example.org/', remoteReadme), 'https://example.org/');
  assert.equal(remoteLink('mailto:hello@example.org', remoteReadme), 'mailto:hello@example.org');
  assert.throws(() => remoteRoute('file:///private/README.md'), /HTTP/);
  assert.throws(() => resolve(`/remote/${btoa('javascript:alert(1)')}`), /HTTP/);
});

test('unavailable remote includes use the missing-page path instead of showing a broken embed', async () => {
  assert.equal(
    await loadMarkdown(['content/server.md'], {
      fetchFile: async (file) =>
        new Response(file === remoteReadme ? '' : `[Docs](${remoteReadme} ":include")`, {
          status: file === remoteReadme ? 404 : 200,
        }),
    }),
    null,
  );
  await assert.rejects(
    loadMarkdown([remoteReadme], {
      fetchFile: async () => {
        throw new TypeError('Failed to fetch');
      },
    }),
    /Failed to fetch/,
  );
});

test('local images follow the document source, including nested translations and subdirectory hosting', () => {
  const base = 'https://example.org/objy/';
  assert.equal(
    contentLink('figure.png', 'content/de/guides/setup.md', true, base),
    `${base}content/de/guides/figure.png`,
  );
  assert.equal(
    contentLink('../figure.png', 'content/en/guides/setup.md', true, base),
    `${base}content/en/figure.png`,
  );
  assert.equal(
    contentLink('assets/site/logo.png', 'content/de/home.md', true, base),
    `${base}assets/site/logo.png`,
  );
  assert.equal(
    contentLink('/assets/site/logo.png', 'content/de/home.md', true, base),
    `${base}assets/site/logo.png`,
  );
  assert.equal(contentLink('../documentation.md', 'content/de/guides/setup.md', false, base), '../documentation.md');
  assert.equal(
    contentLink('data:image/png;base64,abc', 'content/de/home.md', true, base),
    'data:image/png;base64,abc',
  );
});

test('shared directory routes and both Markdown extensions resolve consistently', () => {
  assert.deepEqual(resolve('/content/guides/'), ['content/guides/README.md']);
  assert.deepEqual(resolve('/guides/setup.markdown'), [
    'content/de/guides/setup.markdown',
    'content/en/guides/setup.markdown',
    'guides/setup.markdown',
  ]);
});

test('remote chapter IDs preserve non-ASCII characters, ampersands, and Docsify query syntax', () => {
  const route = remoteRoute(`${remoteReadme}#gr%C3%B6%C3%9Fe&speed`);
  assert.equal(new URLSearchParams(route.split('?')[1]).get('id'), 'größe&speed');
  const queryRoute = remoteLink('./README.md?id=quick-start', remoteReadme);
  assert.equal(new URLSearchParams(queryRoute.split('?')[1]).get('id'), 'quick-start');
  assert.deepEqual(resolve(queryRoute.split('?')[0]), [remoteReadme]);
});
