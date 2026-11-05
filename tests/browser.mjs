// No test framework or package installation: run this page through the local HTTP server.
import { createCopy, htmlFragment, sanitizeMarkup } from '../assets/site/markup.mjs';
import { decorateHomepage } from '../assets/site/homepage.mjs';
import { decorateDocument } from '../assets/site/documents.mjs';
import { documentationIndex, createDocumentationTree, documentChapters, chapterLinks, guideContext, withGuideContext } from '../assets/site/navigation.mjs';
import { createDirectoryLoader } from '../assets/site/directories.mjs';
import { markdownInclude } from '../assets/site/pages.mjs';

const results = document.getElementById('results');
let failures = 0;
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
async function check(name, run) {
  const item = document.createElement('li');
  try {
    await run();
    item.className = 'pass';
    item.textContent = `PASS — ${name}`;
  } catch (error) {
    failures++;
    item.className = 'fail';
    item.textContent = `FAIL — ${name}: ${error.message}`;
  }
  results.append(item);
}

const site = document.createElement('iframe');
site.title = 'Documentation test fixture';
const loaded = new Promise((resolve) => site.addEventListener('load', resolve, { once: true }));
site.src = '../?lang=en#/documentation';
document.body.append(site);
await loaded;
await new Promise((resolve, reject) => {
  const ready = () => site.contentDocument.querySelector('#section-links a');
  if (ready()) return resolve();
  const observer = new MutationObserver(() => {
    if (ready()) {
      observer.disconnect();
      clearTimeout(timeout);
      resolve();
    }
  });
  const timeout = setTimeout(() => {
    observer.disconnect();
    reject(new Error('Site did not start'));
  }, 10000);
  observer.observe(site.contentDocument, { subtree: true, childList: true });
}).catch((error) => {
  document.getElementById('status').textContent = error.message;
  throw error;
});
window.marked = site.contentWindow.marked;

await check('Documentation loads without downloading homepage illustrations', () => {
  // Ordinary Markdown icons use image requests; homepage SVGs are fetched for inlining.
  const files = site.contentWindow.performance
    .getEntriesByType('resource')
    .filter((entry) => entry.initiatorType === 'fetch')
    .map((entry) => entry.name);
  assert(
    !files.some((file) => /\.svg(?:\?|$)/.test(file)),
    'An illustration loaded on the documentation page',
  );
  assert(
    site.contentDocument.querySelector('.document-page h1').textContent === 'Documentation',
    'Wrong page',
  );
  const document = site.contentDocument;
  const rows = [...document.querySelectorAll('.directory-link')];
  assert(rows.map((row) => row.querySelector('h2').textContent.trim()).join(',') ===
    'DB Server,Embedded Database,REST API,JavaScript client', 'Directory order changed');
  assert(rows.every((row) => !row.querySelector('a') && row.querySelector('p')), 'Directory rows contain nested links or lost descriptions');
  assert(!document.querySelector('.page-sidebar').hidden && !document.querySelector('.section-menu-toggle').hidden &&
    document.querySelectorAll('.documentation-guide').length === rows.length,
    'The documentation root tree is missing from the index');
  assert(!files.some(file => /^https:\/\/raw\.githubusercontent\.com\//.test(file)),
    'Unselected remote guides were downloaded on the index');
});

await check('Documentation trees derive arbitrary roots, retain sibling guides, and reveal nested deep links', async () => {
  const toURL = (route, query) => `#${route.replace(/\.md$/, '')}${query ? `?${new URLSearchParams(query)}` : ''}`;
  const index = '<h1>Handbook</h1>' +
    '<h2><img src="alpha.svg">Alpha :id=alpha</h2><p>First guide.</p><p><a href="/handbook/alpha.md">Read Alpha</a></p>' +
    '<h2>Beta :id=beta</h2><p><a href="/handbook/beta.md">Read Beta</a></p>' +
    '<h2>Gamma</h2><p><a href="/handbook/gamma.md">Read Gamma</a></p>' +
    '<h2>Elsewhere</h2><p><a href="https://example.com/">External</a></p>';
  const entries = documentationIndex(sanitizeMarkup(index), (href, image) => image ? href : toURL(href));
  entries[1].sources = ['https://example.com/live/beta.md'];
  assert(entries.map(entry => entry.title).join('|') === 'Alpha|Beta|Gamma', 'Index entries were hard-coded or lost their Markdown labels');
  const tree = createDocumentationTree(entries, '/handbook', toURL);
  const nav = document.createElement('nav');
  const article = document.createElement('article');
  article.className = 'document-page';
  article.innerHTML = '<h1 id="title">Alpha</h1><h2 id="install">Install</h2>' +
    '<h3 id="browser"><img src="browser.svg" alt="">Browser</h3><h4 id="advanced">Advanced</h4><h2 id="usage">Usage</h2>';
  document.body.append(nav, article);
  const previousUrl = location.href;
  let controller = new AbortController();
  try {
    history.replaceState(null, '', '#/handbook/alpha?id=advanced');
    tree.mount(nav, article, '/handbook/alpha', { file: 'alpha.md' });
    tree.wire(nav, article, controller.signal);
    nav.addEventListener('click', event => event.preventDefault(), { signal: controller.signal });
    const roots = [...nav.querySelectorAll('.documentation-branch')];
    assert(roots.length === 3 && roots[0].open && !roots[1].open && !roots[2].open, 'Selecting a guide lost or expanded its siblings');
    assert(roots[0].querySelectorAll('details[open]').length === 2 &&
      roots[0].querySelector('[data-chapter-id="advanced"]').hash.endsWith('id=advanced'), 'Nested chapter ancestry did not expand for a deep link');
    assert(nav.querySelectorAll('.documentation-guide[aria-current="page"]').length === 1 &&
      article.querySelectorAll('[data-chapter]').length === 4, 'Guide selection or chapter tracking was lost');
    assert(nav.querySelector('.documentation-chapter-link img')?.getAttribute('src') === 'browser.svg' &&
      !article.querySelector('h3 img'), 'A Markdown chapter icon was not moved into the documentation tree');
    const parent = roots[0].querySelector('details');
    parent.open = false;
    parent.querySelector('summary > a').click();
    assert(parent.open, 'Following a chapter did not open its child chapters');
    controller.abort();
    controller = new AbortController();
    article.innerHTML = '<h1 id="beta">Beta</h1><h2 id="commands">Commands</h2>';
    history.replaceState(null, '', '#/handbook/beta');
    tree.mount(nav, article, '/handbook/beta', { file: 'https://example.com/live/beta.md' });
    tree.wire(nav, article, controller.signal);
    assert(nav.querySelectorAll('.documentation-guide').length === 3 &&
      nav.querySelector('.documentation-branch[open] .documentation-guide').textContent === 'Beta', 'Switching guides replaced the root tree');
    assert(nav.querySelectorAll('.documentation-chapter-link').length === 5, 'Previously visited chapter lists were discarded');
    const fresh = createDocumentationTree(entries, '/handbook', toURL);
    assert(fresh.mount(nav, article, '/remote/opaque-source', { file: 'https://example.com/live/beta.md' }) &&
      nav.querySelector('.documentation-branch[open] .documentation-guide').textContent === 'Beta', 'A directly opened remote source lost its root');
    assert(fresh.contextFor(withGuideContext('/remote/opaque-source', '#/handbook/alpha'),
      { file: 'https://example.com/live/beta.md' }) === '#/handbook/beta',
      'An existing guide source was incorrectly assigned to the originating guide');
    assert(!fresh.mount(nav, article, '/unrelated', { file: 'other.md' }), 'An unrelated document adopted the documentation tree');
  } finally {
    controller.abort();
    history.replaceState(null, '', previousUrl);
    nav.remove();
    article.remove();
  }
});

await check('Markdown directory edits update roots independently of styling, without fetching remote bodies', async () => {
  const originalFetch = window.fetch;
  const files = new Map([
    ['manual.md', '# Manual\n\n## First\n\nDescription.\n\nExtra description.\n\n[Read](one.md)\n\n## Second\n\n[Read](alias.md)'],
    ['one.md', '# One\n\n## Original chapter\n\nContent.'],
    ['alias.md', "[Shared](shared.md ':include')"],
    ['shared.md', "[Remote](https://example.com/docs/README.md ':include')"],
    ['two.md', '# Two\n\n## New chapter\n\nContent.'],
  ]);
  const requests = [];
  window.fetch = async (file, options) => {
    requests.push(String(file));
    assert(options.cache === 'no-cache', 'Directory metadata was not revalidated');
    return new Response(files.get(file) || '', { status: files.has(file) ? 200 : 404 });
  };
  const toURL = (route, query) => `#${route.replace(/\.md$/, '')}${query ? `?${new URLSearchParams(query)}` : ''}`;
  const load = createDirectoryLoader({
    filesForRoute: route => [`${route.replace(/^\//, '')}.md`],
    render: markdown => sanitizeMarkup(marked(markdown, { renderer: new marked.Renderer() })),
    resolve: (href, source, route, image) => image ? href : toURL(`/${href}`),
    toURL,
  });
  const nav = document.createElement('nav');
  const article = document.createElement('article');
  article.className = 'document-page';
  const previous = location.href;
  try {
    history.replaceState(null, '', '#/manual');
    const initial = await load('/manual');
    assert(initial?.mount(nav, article, '/manual', { file: 'manual.md' }), 'Extra prose removed the root tree');
    assert([...nav.querySelectorAll('.documentation-guide')].map(link => link.textContent).join('|') === 'First|Second',
      'Root labels do not follow the Markdown');
    assert(await load('/manual') === initial, 'Unchanged Markdown unnecessarily discarded expansion state');
    assert(initial.contextFor('/remote/opaque', { file: 'https://example.com/docs/README.md' }) === '#/alias',
      'A chain of local includes lost its remote source identity');
    files.set('manual.md', '# Manual\n\n## Changed title\n\nMore text.\n\n- Extra detail\n\n[Read](two.md)');
    const changed = await load('/manual');
    changed.mount(nav, article, '/manual', { file: 'manual.md' });
    assert(changed !== initial && nav.querySelectorAll('.documentation-guide').length === 1 &&
      nav.querySelector('.documentation-guide').textContent === 'Changed title' &&
      nav.querySelector('.documentation-guide').hash === '#/two', 'Renamed, removed, or relinked Markdown entries stayed stale');
    article.innerHTML = '<h1 id="two">Two</h1><h2 id="new-topic">New topic</h2><h3 id="detail">Detail</h3>';
    history.replaceState(null, '', '#/two');
    changed.mount(nav, article, '/two', { file: 'two.md' });
    assert([...nav.querySelectorAll('[data-chapter-id]')].map(link => link.textContent).join('|') === 'New topic|Detail',
      'Edited Markdown headings did not generate new chapters');
    assert(!requests.some(file => /^https?:/.test(file)), 'Indexing fetched an unselected remote document');
  } finally {
    window.fetch = originalFetch;
    history.replaceState(null, '', previous);
  }
});

await check('Cross-linked directories keep separate branch identities and cannot create parent cycles', () => {
  const entry = name => ({ key: `#/${name}`, href: `#/${name}`, path: `/${name}`, title: name });
  const alpha = entry('alpha');
  const beta = entry('beta');
  alpha.children = [beta];
  beta.children = [alpha];
  const tree = createDocumentationTree([alpha, beta], '/index', (route, query) => `#${route}?${new URLSearchParams(query)}`);
  const nav = document.createElement('nav');
  const article = document.createElement('article');
  article.className = 'document-page';
  article.innerHTML = '<h1 id="title">Guide</h1><h2 id="topic">Topic</h2>';
  const previous = location.href;
  try {
    history.replaceState(null, '', '#/alpha');
    assert(tree.mount(nav, article, '/alpha', { file: 'alpha.md' }), 'Cross-linked roots did not mount');
    const keys = [...nav.querySelectorAll('[data-guide-key]')].map(node => node.dataset.guideKey);
    assert(keys.length === 4 && new Set(keys).size === keys.length, 'Repeated destinations shared a branch identity');
    assert(nav.querySelectorAll('.documentation-branch[open]').length === 1 &&
      nav.querySelector('.documentation-guide[aria-current="page"]').textContent === 'alpha', 'The selected root lost its ancestry');
  } finally {
    history.replaceState(null, '', previous);
  }
});

await check('Live documentation keeps all roots across guide changes, deep links, languages, and mobile navigation', async () => {
  const waitFor = async predicate => new Promise((resolve, reject) => {
    const deadline = Date.now() + 15000;
    const ready = () => {
      try {
        if (predicate()) return resolve();
      } catch (error) {
        return reject(error);
      }
      if (Date.now() > deadline) return reject(new Error('The documentation tree did not finish loading'));
      setTimeout(ready, 16);
    };
    ready();
  });
  const openRoot = async (index, language = 'en') => {
    const link = site.contentDocument.querySelectorAll('.documentation-guide')[index];
    const target = link.hash.split('?')[0];
    link.click();
    await waitFor(() => site.contentDocument.documentElement.lang === language &&
      site.contentWindow.location.hash.split('?')[0] === target &&
      site.contentDocument.querySelectorAll('.documentation-guide')[index]?.getAttribute('aria-current') === 'page' &&
      site.contentDocument.querySelector('.documentation-branch[open] .documentation-chapter-link'));
  };
  for (let index = 0; index < 4; index++) {
    await openRoot(index);
    const document = site.contentDocument;
    const roots = [...document.querySelectorAll('.documentation-branch')];
    assert(roots.length === 4 && roots.filter(root => root.open).length === 1 && roots[index].open,
      'A guide replaced the root tree or left another root expanded');
    assert(document.querySelector('.header-links [aria-current="page"]').hash === '#/documentation', 'A guide lost Documentation header selection');
    assert(roots[index].querySelectorAll('.documentation-chapter-link').length ===
      document.querySelectorAll('.document-page [data-chapter]').length, 'A live chapter is missing from its guide branch');
  }
  await openRoot(2);
  const document = site.contentDocument;
  const frame = site.contentWindow;
  const subchapter = document.querySelector('.document-page h3[id]');
  const branch = document.querySelector('.documentation-branch[open]');
  const target = [...branch.querySelectorAll('[data-chapter-id]')].find(link => link.dataset.chapterId === subchapter.id);
  target.click();
  await waitFor(() => frame.location.hash.endsWith(`id=${encodeURIComponent(subchapter.id)}`) && target.closest('details').open);
  assert(target.closest('details').open, 'A nested API chapter stayed collapsed');
  const article = document.querySelector('.document-page');
  branch.querySelector('summary').click();
  assert(!branch.open && document.querySelector('.document-page') === article, 'Collapsing a guide changed its article');
  branch.querySelector('.documentation-guide').click();
  await waitFor(() => document.querySelector('.documentation-branch').parentElement.parentElement.querySelectorAll('.documentation-guide').length === 4);
  assert(branch.open, 'Clicking the current guide did not expand it');
  for (const width of [1920, 1280, 1100, 390, 320]) {
    site.style.width = `${width}px`;
    site.style.height = '900px';
    await new Promise(resolve => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
    const bounds = document.querySelector('.document-page').getBoundingClientRect();
    assert(document.documentElement.scrollWidth <= width + 1 && Math.abs(bounds.left + bounds.width / 2 - width / 2) <= 1,
      `Documentation overflows or shifts off center at ${width}px`);
    const menu = document.querySelector('.section-menu-toggle');
    const sidebar = document.querySelector('.page-sidebar');
    if (width <= 1100) {
      menu.click();
      assert(frame.getComputedStyle(sidebar).display !== 'none' && sidebar.querySelectorAll('.documentation-guide').length === 4,
        'The mobile drawer lost its documentation roots');
      menu.click();
    } else assert(sidebar.getBoundingClientRect().right <= bounds.left, 'The documentation tree overlaps its article');
  }
  site.src = '../?lang=de#/content/database?id=install-in-a-browser';
  await waitFor(() => site.contentDocument?.documentElement?.lang === 'de' &&
    site.contentDocument.querySelector('.documentation-branch[open] [data-chapter-id="install-in-a-browser"]'));
  assert(site.contentDocument.querySelectorAll('.documentation-guide').length === 4 &&
    site.contentDocument.querySelector('#section-links').getAttribute('aria-label') === 'Dokumentationsnavigation' &&
    site.contentDocument.querySelectorAll('.documentation-guide')[3].textContent === 'JavaScript-Client',
    'A direct German guide link lost the translated root tree');
});

await check('Document directories follow Markdown structure and preserve richer guides', () => {
  const intro = '<h1 id="guides">Guides</h1><p>Choose a guide.</p>';
  const entry = (name) => `<h2 id="${name}"><a class="anchor"><img src="icons/${name}.svg" alt="">${name}</a></h2>` +
    `<p>About ${name}.</p><p><a href="${name}.md?id=start">Open ${name}</a></p>`;
  const directory = htmlFragment(decorateDocument(intro + entry('alpha') + entry('beta') + entry('gamma')));
  const rows = [...directory.querySelectorAll('.directory-link')];
  assert(rows.length === 3, 'Guide count or names were hard-coded');
  assert(rows[1].getAttribute('href') === 'beta.md?id=start', 'Chapter destination changed');
  assert(rows[1].getAttribute('aria-labelledby') === 'beta' && rows[1].querySelector('#beta'), 'Guide title is not accessible');
  assert(rows[1].querySelector('img').alt === '', 'Decorative icon is announced twice');
  assert(directory.querySelectorAll('[role="listitem"]').length === 3, 'Directory lost list semantics');
  const guide = htmlFragment(decorateDocument(intro + entry('alpha') + '<pre><code>Important example</code></pre>'));
  assert(!guide.querySelector('.document-directory'), 'A richer guide was converted into an index');
  assert(guide.querySelector('pre code').textContent === 'Important example' && guide.querySelector('h2 a'),
    'Normal Markdown content or anchors were changed');
});

await check('Directory link groups preserve every destination without nesting links', () => {
  const markup = '<h1 id="start">Start</h1>' +
    '<h2 id="local"><img src="local.svg" alt="">Local</h2><p>Start here.</p>' +
    '<ul><li><a href="https://example.com/source">Source</a></li><li><a href="guide.md?id=cluster">Cluster</a></li></ul>' +
    '<h2 id="browser"><img src="browser.svg" alt="">Browser</h2><p>Run in the page.</p>' +
    '<p><a href="guide.md?id=browser">Browser guide</a></p>';
  const directory = htmlFragment(decorateDocument(markup));
  const group = directory.querySelector('.directory-row[role="group"]');
  assert(group?.getAttribute('aria-labelledby') === 'local', 'Link group lost its title');
  assert([...group.querySelectorAll('.directory-actions a')].map((link) => link.getAttribute('href')).join(',') ===
    'https://example.com/source,guide.md?id=cluster', 'An action destination was lost or reordered');
  assert(directory.querySelectorAll('.directory-link').length === 1, 'Multiple actions were turned into one link');
  assert(!directory.querySelector('a a'), 'Action links were nested');
  const guide = htmlFragment(decorateDocument(markup.replace('Source</a></li>', 'Source</a> plus instructions</li>')));
  assert(!guide.querySelector('.document-directory'), 'A list with additional instructions was hidden');
});

await check('Icon subchapters form reusable catalogs without losing introductions, links, or rich content', () => {
  const entry = (id) => `<h3 id="${id}"><a href="#/example?id=${id}"><img src="${id}.svg" alt="${id}">${id}</a></h3>` +
    `<p>About ${id}.</p>`;
  const markup = '<h1 id="catalog">Catalog</h1><p>Introduction.</p><p><img src="overview.svg" alt="Overview"></p>' +
    '<h2 id="alpha">Alpha</h2><p><a href="alpha.md">Read more</a></p>' + entry('first') + entry('second') +
    '<pre><code>Important example</code></pre>' +
    '<h2 id="beta">Beta</h2><p>Group introduction.</p>' + entry('third') + '<ul><li>Extra detail</li></ul>';
  const catalog = htmlFragment(decorateDocument(markup));
  const sections = [...catalog.querySelectorAll('.catalog-section')];
  const features = [...catalog.querySelectorAll('.catalog-feature')];
  assert(sections.length === 2 && features.length === 3, 'Catalog names or counts were hard-coded');
  assert(catalog.querySelector('.document-lead-art .document-art img')?.alt === 'Overview' &&
    !catalog.querySelector('.document-lead-art h2'), 'The introductory image needs an unnecessary chapter heading');
  assert(sections[0].getAttribute('aria-labelledby') === 'alpha', 'Group lost its accessible heading');
  assert(sections[0].querySelector(':scope > p a').getAttribute('href') === 'alpha.md', 'Group introduction was lost');
  assert(sections[1].querySelector(':scope > p').textContent === 'Group introduction.', 'Group copy moved into a card');
  assert(features.every((feature) => feature.tagName === 'SECTION' &&
    feature.getAttribute('aria-labelledby') === feature.querySelector('h3').id), 'Features lost their accessible sections');
  assert(features[1].querySelector(':scope > pre code').textContent === 'Important example' &&
    features[2].querySelector('li').textContent === 'Extra detail', 'Richer feature content was discarded');
  assert(features.every((feature) => feature.firstElementChild.matches('img[width="64"][height="64"]') &&
    feature.firstElementChild.alt === '' && !feature.querySelector('h3 img')), 'Icons repeat the title or remain inside the heading');
  assert(features[2].querySelector('h3 a').getAttribute('href') === '#/example?id=third', 'Feature deep link was removed');
  const illustrated = htmlFragment(decorateDocument(markup.replace('<h2 id="alpha">',
    '<h2 id="diagram">How it works</h2><p>Overview.</p><ul><li>A tier</li></ul>' +
    '<blockquote><p>Optional durability.</p></blockquote><p><img src="diagram.svg" alt="A layered diagram"></p><h2 id="alpha">')));
  const overview = illustrated.querySelector('.document-illustration');
  assert(illustrated.querySelectorAll('.catalog-feature').length === 3 &&
    overview?.querySelector('h2').id === 'diagram' && overview.querySelector('li').textContent === 'A tier',
    'An illustrated introduction prevented the catalog from rendering or lost its content');
  assert(overview.querySelector('.document-art img').alt === 'A layered diagram' && overview.querySelector('blockquote'),
    'Illustrated content lost its image description or durability note');
  assert(overview.firstElementChild.matches('h2') && !overview.querySelector('.document-illustration-copy h2') &&
    illustrated.querySelectorAll('.document-chapter').length === 3,
    'Illustrations and feature groups do not share the same chapter structure');
  const ordinary = htmlFragment(decorateDocument(markup.replace('<img src="third.svg" alt="third">', '')));
  assert(!ordinary.querySelector('.document-catalog') && ordinary.querySelectorAll('h3').length === 3 &&
    ordinary.querySelector('pre code'), 'Mixed ordinary chapters were converted or lost content');
});

await check('Icon chapters keep their content visible and generate ordinary Markdown chapters', () => {
  const fixture = document.createElement('div');
  fixture.append(htmlFragment(decorateDocument(
    '<h1 id="start">Start</h1>' +
    '<h2 id="alpha"><a class="anchor"><img src="local.svg" alt="">Alpha</a></h2>' +
    '<p>Run this command.</p><pre><code class="lang-sh"><span class="token function">objy</span> run</code></pre>' +
    '<p><a href="guide.md?id=first">Guide</a></p>' +
    '<h2 id="beta"><img src="cloud.svg" alt="">Beta</h2>' +
    '<ul><li><a href="https://example.com/cloud">Provider</a></li></ul>' +
    '<h2 id="gamma"><img src="browser.svg" alt="">Gamma</h2>' +
    '<pre><code>const db = createDatabase();</code></pre>',
  )));
  const chapters = documentChapters(fixture.querySelector('.document-page'));
  const sections = [...fixture.querySelectorAll('.setup-section')];
  assert(sections.length === 3 && !fixture.querySelector('details, summary'), 'Setup chapters are missing or collapsed');
  assert(sections.every(section => section.querySelector(':scope > h2[data-chapter-icon]') &&
    section.querySelector('.setup-copy') && section.getAttribute('aria-labelledby') === section.querySelector('h2').id),
    'Chapters lost their navigation icon or accessible heading');
  assert(!fixture.querySelector('img'), 'Navigation icons remain in the section headings');
  assert(fixture.querySelector('.setup-copy .token.function'), 'Code highlighting was lost');
  assert(fixture.querySelector('.setup-copy code').textContent === 'objy run', 'Code source changed');
  assert(fixture.querySelector('.setup-copy a').getAttribute('href') === 'guide.md?id=first', 'Guide destination changed');
  assert(fixture.querySelector('.setup-actions a').textContent === 'Provider', 'Provider action was lost');
  assert(JSON.stringify(chapters.map(({ id, title }) => ({ id, title }))) ===
    JSON.stringify([{ id: 'alpha', title: 'Alpha' }, { id: 'beta', title: 'Beta' }, { id: 'gamma', title: 'Gamma' }]),
    'Chapter navigation is not generated from the Markdown headings');
  const menu = chapterLinks(chapters, '/example', (route, query) => `#${route}?${new URLSearchParams(query)}`);
  assert(menu.querySelectorAll('a > img').length === 3 && menu.querySelector('a > img').getAttribute('src') === 'local.svg' &&
    menu.querySelector('a > span').textContent === 'Alpha', 'Markdown icons were not moved to the chapter menu');
});

await check('Markdown HTML removes scripts, event handlers, unsafe URLs, and fake site bindings', () => {
  const content = htmlFragment(
    sanitizeMarkup(
      '<script>alert(1)</script><style>body{display:none}</style><img src="broken" onerror="alert(1)"><a href="javascript:alert(1)">bad</a><p data-copy="missing">safe</p>',
    ),
  );
  assert(!content.querySelector('script,style,[onerror],[data-copy],a[href]'), 'Unsafe markup survived');
  assert(content.querySelector('p').textContent === 'safe', 'Normal content was removed');
});

await check('Sanitization retains chapter IDs, code, tables, and expandable explanations', () => {
  const content = htmlFragment(
    sanitizeMarkup(
      '<h2 id="chapter">Chapter</h2><pre><code>&lt;tag&gt;</code></pre><table><tr><td>Value</td></tr></table><details><summary>More</summary>Details</details>',
    ),
  );
  assert(
    content.querySelector('#chapter') &&
      content.querySelector('table td') &&
      content.querySelector('details summary'),
    'Useful Markdown structure was lost',
  );
  assert(content.querySelector('code').textContent === '<tag>', 'Code changed');
});

await check('Translation values are parsed once and preserve literal HTML-looking code', () => {
  const { copy } = createCopy([
    '## Example\n\n| Location | Text |\n| --- | --- |\n| Value | `<object>` & **more** |',
  ]);
  assert(copy('example.value') === '<object> & more', 'Translation value was double-parsed');
});

await check('Markdown code highlighting preserves source text and safe markup across languages', () => {
  const samples = [
    ['json', '{"name":"Alex","online":true,"literal":"<script>test</script>"}', '.property'],
    ['js', 'const result = await db.find({online: true});', '.keyword'],
    ['ts', 'const name: string = "Alex";', '.keyword'],
    ['sh', 'npm install objy.db\necho "$HOME"', '.function'],
    ['http', 'POST /api/databases HTTP/1.1\nContent-Type: application/json\n\n{"name":"app"}', '.property'],
    ['yaml', 'database: app\nonline: true', '.key'],
    ['markdown', '# Title\n\n**Objects**', '.bold'],
    ['html', '<div class="example">Objects</div>', '.tag'],
    ['text', 'Unformatted output: 42', null],
    ['unknown-language', 'Still readable: 42', null],
  ];
  const markdown = samples.map(([language, source]) => `\`\`\`${language}\n${source}\n\`\`\``).join('\n\n');
  // Exercise the same Docsify renderer and sanitizer used for local and remote pages.
  const content = htmlFragment(sanitizeMarkup(site.contentWindow.marked(markdown)));
  const blocks = [...content.querySelectorAll('pre code')];
  assert(blocks.length === samples.length, 'A code block was lost');
  samples.forEach(([language, source, token], index) => {
    assert(blocks[index].textContent === source, `${language} source text changed`);
    if (token) assert(blocks[index].querySelector(`.token${token}`), `${language} was not highlighted`);
    else assert(!blocks[index].querySelector('.token'), `${language} should stay plain`);
  });
  assert(!content.querySelector('script,div'), 'Literal code became executable HTML');
});

await check('Homepage layouts work with arbitrary chapter names', async () => {
  const image =
    '<p><img alt="Sample" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E"></p>';
  const illustrated = ['one', 'two']
    .map((name) => `<h2 id="${name}">${name}</h2>${image}`)
    .join('');
  const markup =
    '<h1 id="top">Hello</h1><p>Intro</p>' +
    '<ul><li><img src="one.svg" alt="One">First highlight</li><li><img src="two.svg" alt="Two">Second highlight</li></ul>' +
    image + '<p><a href="all-features.md">See the full picture</a></p>' + illustrated +
    '<h2 id="details">Details</h2><p>More to explore.</p>' +
    '<h2 id="choices">Choices</h2><h3 id="small">Small</h3><p>First choice</p><h3 id="large">Large</h3><p>Second choice</p>';
  const content = htmlFragment(await decorateHomepage(markup));
  assert(content.querySelectorAll('.detail-section').length === 4, 'Chapter count was hard-coded');
  assert(content.querySelector('.section-hero > .section-copy + .hero-art'), 'Hero artwork is not beneath the headline');
  const highlights = content.querySelectorAll('.hero-highlights li');
  assert(highlights.length === 2 && highlights[1].textContent === 'Second highlight' &&
    [...highlights].every((item) => item.querySelector('img').alt === ''),
    'Icon highlights lost their Markdown content or depend on a fixed count');
  const more = content.querySelector('.sections-root > .feature-more a');
  assert(more?.textContent === 'See the full picture' && more.getAttribute('href') === 'all-features.md',
    'The overview link was lost or hard-coded');
  assert(!content.querySelector('.section-hero .feature-more'), 'The overview link moved above the artwork');
  assert(
    content.querySelector('.art-first')?.dataset.section === 'two',
    'Illustrations did not alternate',
  );
  assert(
    content.querySelectorAll('[data-section="choices"] .section-option').length === 2,
    'Generic option layout did not render',
  );
});

await check('A missing illustration falls back to the image without losing page content', async () => {
  const content = htmlFragment(
    await decorateHomepage(
      '<h1 id="top">Still readable</h1><p><img alt="Missing" src="./missing-test-illustration.svg"></p>',
    ),
  );
  assert(content.querySelector('h1').textContent === 'Still readable', 'Page content lost');
  assert(content.querySelector('.hero-art img'), 'Image fallback missing');
});

await check('Nested homepage catalogs retain their overview, illustrations, feature groups, and footer', async () => {
  const entry = id => `<h4 id="${id}"><img src="${id}.svg" alt="">${id}</h4><p>About ${id}.</p>`;
  const markup = '<h1 id="top">Hello</h1><h2 id="capabilities">Capabilities</h2><p>Introduction.</p>' +
    '<p><img src="overview.svg" alt="Overview"></p>' +
    '<h3 id="storage">Storage</h3><p>Explanation.</p><p><img src="storage.svg" alt="Storage"></p>' +
    '<h3 id="alpha">Alpha</h3>' + entry('first') + entry('second') +
    '<h3 id="beta">Beta</h3>' + entry('third') + '<hr><p>Footer</p>';
  const content = htmlFragment(await decorateHomepage(markup));
  const catalog = content.querySelector('.homepage-catalog');
  const groups = [...catalog.querySelectorAll(':scope > .catalog-section')];
  assert(groups.length === 2 && catalog.querySelectorAll('.catalog-feature').length === 3,
    'Catalog names or feature counts were hard-coded');
  assert(catalog.querySelector(':scope > h2').id === 'capabilities' && groups[0].querySelector(':scope > h3').id === 'alpha' &&
    catalog.querySelector('.catalog-feature > h4').id === 'first' && content.querySelectorAll('h1').length === 1,
    'The original heading hierarchy or IDs were lost');
  assert(catalog.querySelectorAll('.document-art img').length === 2 &&
    catalog.querySelector('.document-illustration > h3').id === 'storage' &&
    content.querySelector('.section-feature-catalog > .section-footer').textContent === 'Footer' &&
    !catalog.querySelector('footer, hr'), 'The overview, storage chapter, or footer was lost');
  const combined = htmlFragment(await decorateHomepage(markup.replace('<p><img src="storage.svg" alt="Storage"></p>', '')));
  assert(combined.querySelectorAll('.document-art').length === 1 &&
    combined.querySelector('.document-explanation > h3').id === 'storage' &&
    combined.querySelector('.document-explanation-copy').textContent === 'Explanation.' &&
    combined.querySelectorAll('.catalog-feature').length === 3,
    'A text explanation beneath the overview broke the catalog or added a second image');
});

await check('Illustrated Markdown stories support arbitrary chapters and retain prose after images', async () => {
  const markup = '<h1 id="top">Home</h1><h2 id="story">A different story</h2><p>Introduction.</p>' +
    '<h3 id="alpha">Alpha</h3><p><img src="../assets/site/architecture.svg#api" alt="First layer"></p>' +
    '<p>Explanation after the first image.</p>' +
    '<h3 id="beta">Beta</h3><p>Before the image.</p><p><img src="../assets/site/architecture.svg#objects" alt="Second layer"></p>' +
    '<p>Keep this final paragraph.</p>';
  const page = htmlFragment(await decorateHomepage(markup));
  const story = page.querySelector('.section-diagram-story');
  const chapters = [...story.querySelectorAll('.diagram-step')];
  assert(chapters.length === 2 && chapters.map(chapter => chapter.querySelector('h3').textContent).join('|') === 'Alpha|Beta',
    'The layout hard-coded the three homepage feature names or count');
  assert(story.querySelector('.markdown-body > p').textContent === 'Introduction.' &&
    chapters[0].querySelector('.diagram-copy').textContent.includes('Explanation after the first image.') &&
    chapters[1].querySelector('.diagram-copy').textContent.includes('Keep this final paragraph.'), 'Markdown prose was lost');
  assert(story.querySelectorAll('.diagram-art svg').length === 2 && !story.querySelector('.feature-more'),
    'Illustrations or the optional trailing link were mishandled');
});

await check('Icon subchapters become reusable homepage columns with their own accessible headings', async () => {
  const home = '<h1 id="top">Hello</h1><h2 id="overview">Overview</h2>' +
    ['alpha', 'beta', 'gamma'].map((id) => `<h3 id="${id}"><a class="anchor"><img src="icons/${id}.svg">${id}</a></h3>` +
      `<p>About ${id}.</p>`).join('') +
    '<p><a href="features.md">Explore more</a></p><hr><p><a href="https://example.com">Footer</a></p>';
  const content = htmlFragment(await decorateHomepage(home));
  const group = content.querySelector('.section-icon-cards .section-options');
  const cards = [...group.children];
  assert(group.nextElementSibling.matches('.feature-more') &&
    group.nextElementSibling.querySelector('a').getAttribute('href') === 'features.md' &&
    content.querySelector('.section-cards > .section-footer a').textContent === 'Footer' &&
    !group.querySelector('hr, footer, .feature-more'), 'The overview link or footer was trapped inside a card');
  assert(cards.length === 3 && group.style.getPropertyValue('--option-columns') === '3', 'Option count was hard-coded');
  cards.forEach((card, index) => {
    const title = card.querySelector('h3');
    assert(card.getAttribute('aria-labelledby') === title.id && title.textContent === ['alpha', 'beta', 'gamma'][index],
      'A title or accessible group was lost');
    assert(card.firstElementChild.matches('img[width="72"][height="72"]') && card.firstElementChild.alt === '' &&
      !title.querySelector('img') && card.querySelector('p'), 'The icon or explanation was lost or repeats the title');
  });
});

await check('Homepage actions and footer are derived from Markdown links', async () => {
  const content = htmlFragment(await decorateHomepage(
    '<h1 id="top">Hello</h1><p>Intro</p><ul><li><a href="get-started.md">Start</a></li></ul>' +
    '<h2 id="a">A</h2><h2 id="b">B</h2><h2 id="c">C</h2>' +
    '<h2 id="next">Next</h2><p>Build something.</p><ul><li><a href="content/server.md">Docs</a></li></ul>' +
    '<hr><p><a href="https://github.com/objy-org">GitHub</a></p>',
  ));
  assert(content.querySelector('.section-hero .section-actions a').textContent === 'Start', 'Hero action missing');
  assert(content.querySelector('.section-callout .section-actions a').textContent === 'Docs', 'Closing action missing');
  assert(content.querySelector('.section-footer a').textContent === 'GitHub', 'Markdown footer missing');
});

await check('The homepage promotes three Markdown USPs before the four use cases and links to Learn', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/?id=feature-highlights`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 7000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement?.lang === language && document.querySelector('.diagram-story') &&
          document.querySelectorAll('#section-links a').length === 3) return resolve();
        if (Date.now() > deadline) return reject(new Error('Homepage USP story did not load'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const document = site.contentDocument;
    const source = await fetch(`../content/${language}/home.md`).then(response => response.text());
    const story = document.querySelector('[data-section="feature-highlights"]');
    const useCases = document.querySelector('[data-section="object-capabilities"]');
    const expected = [...source.split(/^## /m)[1].matchAll(/^### (.+) :id=(\S+)\n\n([^\n]+)/gm)];
    const statements = [...story.querySelectorAll('.diagram-step')];
    assert(story.previousElementSibling.matches('.section-hero') && story.nextElementSibling === useCases,
      'The three advantages must sit directly between the hero and use cases');
    assert(expected.length === 3 && statements.length === expected.length &&
      !document.querySelector('.catalog-feature, .catalog-grid, .homepage-catalog'), 'The long feature catalog is still present');
    statements.forEach((statement, index) => {
      const heading = statement.querySelector('h3');
      const [, title, id, description] = expected[index];
      assert(heading.id === id && heading.textContent === title && statement.querySelector('p').textContent === description,
        'A USP title or explanation differs from its Markdown source');
      assert(statement.getAttribute('aria-labelledby') === id && statement.querySelector('figure[role="img"][aria-label]'),
        'A USP or its illustration lost its accessible description');
    });
    const link = story.querySelector('.feature-more a');
    assert(link?.hash === '#/learn' && link.textContent ===
      (language === 'en' ? 'Explore how OBJY works →' : 'So funktioniert OBJY →'), 'The subtle Learn link is missing or untranslated');
    const expectedCases = [...source.matchAll(/^### !\[\]\(([^)]+)\) (.+) :id=(\S+)/gm)];
    const cards = [...useCases.querySelectorAll('.section-option')];
    assert(cards.length === 4 && cards.length === expectedCases.length && useCases.querySelector('.section-footer'),
      'A use case or the homepage footer was lost');
    cards.forEach((card, index) => assert(card.querySelector('h3').id === expectedCases[index][3] &&
      card.querySelector('h3').textContent.trim() === expectedCases[index][2] && card.querySelector('img').src.endsWith(expectedCases[index][1]),
      'A use case differs from the Markdown'));
    assert(!story.querySelector('.section-footer') && !document.querySelector('.setup-section'), 'Deployment content or the footer entered the USP story');
    const architectureRequests = site.contentWindow.performance.getEntriesByType('resource')
      .filter(entry => entry.initiatorType === 'fetch' && new URL(entry.name).pathname.endsWith('/architecture.svg'));
    assert(architectureRequests.length === 1, 'The three diagram layers did not share one SVG download');
  }
});

await check('Articles stay centered in the viewport without colliding with the chapter menu', async () => {
  const frame = site.contentWindow;
  const previousStyle = site.getAttribute('style');
  const resize = async (width) => {
    site.style.width = `${width}px`;
    site.style.height = '800px';
    await new Promise((resolve) => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
  };
  const checkCenter = (selector) => {
    const document = site.contentDocument;
    const width = document.documentElement.clientWidth;
    const rect = document.querySelector(selector).getBoundingClientRect();
    assert(Math.abs(rect.left + rect.width / 2 - width / 2) <= 1, `Article is off center at ${width}px`);
    assert(document.documentElement.scrollWidth <= width + 1, `Page overflows horizontally at ${width}px`);
    return rect;
  };
  try {
    for (const width of [2560, 1920, 1440, 1280, 1101, 1100, 1024, 761, 760, 390]) {
      await resize(width);
      const rect = checkCenter('.sections-root');
      const document = site.contentDocument;
      const menu = document.querySelector('.section-menu-toggle');
      const sidebar = document.querySelector('.page-sidebar');
      const art = document.querySelector('.hero-art');
      const diagram = art.querySelector(':scope > svg');
      const picture = diagram.getBoundingClientRect();
      const copy = document.querySelector('.section-hero > .section-copy').getBoundingClientRect();
      assert(picture.top >= copy.bottom && Math.abs(picture.left + picture.width / 2 - width / 2) <= 1,
        'Hero artwork does not sit centered below the headline');
      assert(picture.width <= 1300 && picture.width > 250, 'Hero artwork size is incorrect');
      if (width >= 1920) assert(picture.width > 1000, 'The restored hero artwork was not enlarged');
      const ratio = width <= 640 ? 560 / 420 : 480 / 720;
      assert(Math.abs(picture.height / picture.width - ratio) < .01, 'Hero artwork is stretched');
      assert(!document.querySelector('.example-workspace, [data-section="storage-internals"]'), 'The previous examples or storage chapter are still present');
      if (width > 1100) {
        assert(frame.getComputedStyle(sidebar).display !== 'none', 'Desktop chapter menu is missing');
        assert(sidebar.getBoundingClientRect().right < rect.left, 'Chapter menu overlaps the centered article');
      } else {
        assert(frame.getComputedStyle(menu).display !== 'none', 'Collapsible menu control is missing');
        menu.click();
        assert(frame.getComputedStyle(sidebar).display !== 'none', 'Chapter drawer did not open');
        menu.click();
        assert(frame.getComputedStyle(sidebar).display === 'none', 'Chapter drawer did not close');
      }
    }
    frame.location.hash = '#/documentation';
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        if (site.contentDocument.querySelector('.document-page')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Documentation did not load'));
        frame.requestAnimationFrame(ready);
      };
      frame.requestAnimationFrame(ready);
    });
    for (const width of [1920, 1280, 1024, 390]) {
      await resize(width);
      checkCenter('.document-page');
      const document = site.contentDocument;
      assert(document.querySelectorAll('.documentation-guide').length === 4, 'The documentation root tree is missing');
      assert(!document.querySelector('.section-menu-toggle').hidden, 'Documentation menu control is hidden');
      const last = document.querySelector('.directory-list > :last-child').getBoundingClientRect();
      if (width >= 1280) assert(last.bottom <= frame.innerHeight, 'The guides do not fit together on desktop');
    }
  } finally {
    if (previousStyle === null) site.removeAttribute('style');
    else site.setAttribute('style', previousStyle);
  }
});

await check('Get Started has a Markdown overview and persistent collapsible setup roots', async () => {
  const waitFor = predicate => new Promise((resolve, reject) => {
    const deadline = Date.now() + 7000;
    const ready = () => {
      if (predicate()) return resolve();
      if (Date.now() > deadline) return reject(new Error(`Getting Started navigation did not finish loading (${site.contentWindow.location.hash}; ${site.contentDocument?.querySelector('.document-page h1')?.textContent})`));
      setTimeout(ready, 16);
    };
    ready();
  });
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/get-started`;
    await waitFor(() => site.contentDocument?.documentElement?.lang === language &&
      site.contentDocument.querySelector('.document-directory') &&
      site.contentDocument.querySelectorAll('.documentation-guide').length === 3);
    const frame = site.contentWindow;
    const document = site.contentDocument;
    const rows = [...document.querySelectorAll('.directory-link')];
    assert(rows.length === 3 && rows.every(row => row.querySelector('img') && row.querySelector('p')) &&
      !document.querySelector('.document-page pre') && !document.querySelector('.page-sidebar').hidden,
      'The overview must show three icon rows and retain the left menu');
    assert(rows.map(row => new URL(row.href).hash).join('|') ===
      '#/get-started/cloud|#/get-started/local|#/get-started/embedded', 'Overview rows lost their setup guides');
    assert(document.querySelectorAll('.documentation-branch[open]').length === 0,
      'Unselected setup roots should start collapsed');
    assert(!frame.performance.getEntriesByType('resource').some(resource => resource.name.startsWith('https://raw.githubusercontent.com/')),
      'The setup overview unnecessarily downloads remote documentation');
    const openRoot = async index => {
      const link = document.querySelectorAll('.documentation-guide')[index];
      const target = link.hash;
      link.click();
      await waitFor(() => frame.location.hash === target && document.querySelector('.document-page') &&
        document.querySelectorAll('.documentation-guide')[index]?.getAttribute('aria-current') === 'page');
      const roots = [...document.querySelectorAll('.documentation-branch')];
      assert(roots.length === 3 && roots.filter(root => root.open).length === 1 && roots[index].open,
        'Selecting a setup guide lost the other roots or opened multiple roots');
      if (document.querySelector('.document-directory')) {
        assert(roots[index].querySelectorAll('.documentation-subguide').length === document.querySelectorAll('.directory-link').length,
          'The nested directory does not follow its Markdown links');
      } else assert(roots[index].querySelectorAll('[data-chapter-id]').length === document.querySelectorAll('.document-page [data-chapter]').length,
        'The expanded branch does not follow the selected Markdown guide');
      assert(document.querySelector('.header-links [aria-current="page"]').hash === '#/get-started',
        'A setup guide lost the Get Started header selection');
      assert((document.querySelector('.document-directory') || !document.querySelector('.document-page img')) &&
        document.querySelectorAll('.documentation-guide img[width="20"][height="20"]').length === 3,
        'Setup guide icons must remain in the left menu');
      return roots[index];
    };
    const local = await openRoot(1);
    const article = document.querySelector('.document-page');
    assert(article.textContent.includes('npm install --global @objy/cli') &&
      article.textContent.includes('objy deploy local --name dev --size tiny') &&
      article.textContent.includes('objy deploy local --name dev-cluster --size custom --shards 2 --replicas 2 --memory 2048') &&
      article.textContent.split('npm install --global @objy/cli').length === 2, 'Local setup lost its install or launch commands');
    local.querySelector('.documentation-guide').click();
    assert(!local.open && document.querySelector('.document-page') === article,
      'Clicking the active root should collapse it without changing its guide');
    local.querySelector('.documentation-guide').click();
    assert(local.open, 'Clicking the collapsed current root did not reopen it');
    local.querySelector('[data-chapter-id="deploy-cluster"]').click();
    await waitFor(() => frame.location.hash === '#/get-started/local?id=deploy-cluster' &&
      document.querySelector('[data-chapter-id="deploy-cluster"][aria-current="location"]'));
    assert(document.querySelector(`.language-switcher a[lang="${language === 'en' ? 'de' : 'en'}"]`).hash ===
      '#/get-started/local?id=deploy-cluster', 'Language switching loses the selected setup chapter');
    for (const index of [0, 2]) {
      await openRoot(index);
      let page = document.querySelector('.document-page');
      if (index === 0) {
        const terraform = document.querySelector('.documentation-subbranch');
        assert(page.matches('.document-directory') && page.querySelector('.directory-link h2').textContent.trim() === 'Terraform' &&
          !page.querySelector('pre') && terraform && !terraform.open && !terraform.querySelector('[data-chapter-id]'),
          'Opening the cloud overview must leave the Terraform README unloaded and collapsed');
        assert(!frame.performance.getEntriesByType('resource').some(resource => resource.name.startsWith('https://raw.githubusercontent.com/')),
          'The cloud overview fetched a remote README before it was selected');
        const openTerraform = async () => {
          document.querySelector('.documentation-subguide').click();
          await waitFor(() => frame.location.hash === '#/get-started/cloud/terraform' &&
            document.querySelector('.documentation-subguide[aria-current="page"]'));
        };
        const terraformSource = markdownInclude(await fetch('../content/terraform.md').then(response => response.text()));
        const originalFetch = frame.fetch;
        const requests = [];
        let revision = 1;
        // Synthetic responses exercise source changes without copying or accessing private documentation.
        frame.fetch = (file, options) => {
          if (file !== terraformSource) return originalFetch.call(frame, file, options);
          requests.push(options);
          const finalChapter = revision === 1 ? 'Maintenance' : 'Outputs';
          const paragraph = 'Generated test content for chapter navigation. '.repeat(70);
          return Promise.resolve(new frame.Response(`# Terraform fixture ${revision}\n\n## Provisioning\n\n~~~sh\nexample-command\n~~~\n\n${paragraph}\n\n## Settings\n\n${paragraph}\n\n## ${finalChapter}\n\n${paragraph}`));
        };
        try {
          await openTerraform();
          page = document.querySelector('.document-page');
          assert(page.querySelector('h1').textContent === 'Terraform fixture 1' && page.textContent.includes('example-command'),
            'The reader did not render its fetched Markdown');
          const chapter = document.querySelector('.documentation-branch[open] [data-chapter-id="provisioning"]');
          const selected = document.querySelector('.documentation-subbranch[open]');
          assert(selected && chapter && selected.contains(chapter) &&
            selected.querySelector('[data-chapter-id="settings"]') && selected.querySelector('[data-chapter-id="maintenance"]'),
            'The fetched chapters must be grouped beneath Terraform');
          chapter.click();
          await waitFor(() => frame.location.hash === '#/get-started/cloud/terraform?id=provisioning' &&
            document.querySelector('[data-chapter-id="provisioning"][aria-current="location"]'));
          assert(document.querySelector(`.language-switcher a[lang="${language === 'en' ? 'de' : 'en'}"]`).hash ===
            '#/get-started/cloud/terraform?id=provisioning', 'Language switching loses the Terraform chapter');
          document.querySelector('.documentation-guide[aria-current="true"]').click();
          await waitFor(() => frame.location.hash === '#/get-started/cloud' && document.querySelector('.document-directory'));
          assert(!document.querySelector('.document-page pre') && !document.querySelector('.documentation-subbranch').open,
            'Returning to the cloud overview must collapse the previously opened README');
          revision = 2;
          await openTerraform();
          page = document.querySelector('.document-page');
          assert(page.querySelector('h1').textContent === 'Terraform fixture 2' &&
            document.querySelector('.documentation-subbranch [data-chapter-id="outputs"]') &&
            !document.querySelector('.documentation-subbranch [data-chapter-id="maintenance"]'),
            'Reopening the reader must refresh both the source content and its chapter tree');
          assert(requests.length === 2 && requests.every(options => options.cache === 'no-cache' && options.credentials === 'omit'),
            'The live source must be revalidated on each visit without browser credentials');
        } finally {
          frame.fetch = originalFetch;
        }
      }
      else assert(page.querySelectorAll('pre').length === 2 && page.textContent.includes('npm i @objy/db') &&
        page.querySelector('a[href$="id=install-in-a-browser"]') && page.querySelector('a[href$="id=install-in-nodejs"]'),
        'Embedded setup lost its install, example, or browser and Node.js guides');
      for (const width of [1280, 760, 390, 320]) {
        site.style.width = `${width}px`;
        site.style.height = '1000px';
        await new Promise(resolve => setTimeout(resolve, 32));
        assert(document.documentElement.scrollWidth <= width + 1, `${language} setup overflows at ${width}px`);
        const bounds = page.getBoundingClientRect();
        assert(Math.abs(bounds.left + bounds.width / 2 - width / 2) <= 1, 'The setup guide is not centered');
        if (index === 0 && width === 1280) {
          const branch = document.querySelector('.documentation-branch[open]');
          const root = branch.querySelector('.documentation-guide span').getBoundingClientRect();
          const nested = branch.querySelector('.documentation-subguide span').getBoundingClientRect();
          const chapter = branch.querySelector('[data-chapter-id="provisioning"] span').getBoundingClientRect();
          assert(nested.left >= root.left + 8 && chapter.left >= nested.left + 8,
            'Terraform and its README chapters must be visibly indented at each level');
        }
        for (const action of page.querySelectorAll('.setup-copy a')) {
          const rect = action.getBoundingClientRect();
          assert(rect.left >= 0 && rect.right <= width + 1, 'A deployment action is clipped');
        }
        for (const pre of page.querySelectorAll('pre')) assert(pre.querySelectorAll('.copy-button').length === 1,
          'A setup example lost its copy control');
        if (width <= 1100) {
          document.querySelector('.section-menu-toggle').click();
          assert(frame.getComputedStyle(document.querySelector('.page-sidebar')).display !== 'none' &&
            document.querySelectorAll('.documentation-guide').length === 3, 'The mobile drawer lost its setup roots');
          if (width <= 760) {
            const currentRoot = document.querySelector(':is(.documentation-guide, .documentation-subguide)[aria-current="page"]');
            currentRoot.click();
            assert(!currentRoot.closest('details').open &&
              document.querySelector('.section-menu-toggle').getAttribute('aria-expanded') === 'true',
              'Collapsing a root unexpectedly closed the mobile drawer');
            currentRoot.click();
            assert(currentRoot.closest('details').open, 'The mobile root cannot be reopened');
          }
          document.querySelector('.section-menu-toggle').click();
        }
      }
    }
    document.querySelector('.header-links a[href$="#/get-started"]').click();
    await waitFor(() => document.querySelector('.document-directory .directory-link'));
    assert(document.querySelectorAll('.directory-link').length === 3 && document.querySelectorAll('.documentation-guide').length === 3,
      'Returning to the setup overview lost its rows or root tree');
    site.src = `../?lang=${language}#/get-started/local?id=deploy-cluster`;
    await waitFor(() => site.contentDocument?.documentElement?.lang === language &&
      site.contentDocument.querySelector('.documentation-branch[open] [data-chapter-id="deploy-cluster"]'));
    assert(site.contentDocument.querySelectorAll('.documentation-guide').length === 3,
      'A direct setup chapter link lost the full root tree');
    site.src = `../?lang=${language}#/get-started/cloud/terraform?id=provisioning`;
    await waitFor(() => site.contentDocument?.documentElement?.lang === language &&
      site.contentDocument.querySelector('.documentation-subguide[aria-current="page"]'));
    const live = site.contentDocument;
    assert(live.querySelectorAll('.documentation-guide').length === 3 && live.querySelector('.documentation-subbranch[open]'),
      'A direct Terraform link lost its submenu or sibling roots');
    const { copy } = createCopy(await Promise.all(['en', language].map(code =>
      fetch(`../content/${code}/labels.md`).then(response => response.text()))));
    if (live.querySelector('.document-page h1').textContent === copy('documents.unavailable-title')) {
      assert(!live.querySelector('.document-page pre') && !live.querySelector('.documentation-subbranch [data-chapter-id]'),
        'An unavailable live source must not render a copied fallback');
    } else assert(live.querySelectorAll('.documentation-subbranch [data-chapter-id]').length ===
      live.querySelectorAll('.document-page [data-chapter]').length, 'Live source headings are missing from the submenu');
  }
});

await check('The USP story preserves SVG references, translations, centering, and responsive navigation', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/features`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 7000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement?.lang === language && document.querySelectorAll('.diagram-art svg').length === 3 &&
          document.querySelector('#section-links a[aria-current="location"]')?.hash.endsWith('id=feature-highlights')) return resolve();
        if (Date.now() > deadline) return reject(new Error('The Features bookmark did not open the USP story'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const frame = site.contentWindow;
    const document = site.contentDocument;
    const story = document.querySelector('.section-diagram-story');
    const statements = [...story.querySelectorAll('.diagram-step')];
    const links = [...document.querySelectorAll('#section-links a')];
    assert(links.length === 3 && links.map(link => new URLSearchParams(link.hash.split('?')[1]).get('id')).join('|') ===
      'top|feature-highlights|object-capabilities', 'The Markdown menu does not follow the new section order');
    assert(frame.location.hash === '#/?id=feature-highlights' &&
      document.querySelector('.header-links [aria-current="page"]').hash === '#/?id=top', 'The old Features bookmark or homepage selection broke');
    assert(story.querySelector('h2').textContent === (language === 'en' ? 'The OBJY advantage.' : 'Der OBJY-Vorteil.'), 'The USP heading is not translated');
    const figures = [...story.querySelectorAll('.diagram-art')];
    const ids = figures.flatMap(figure => [...figure.querySelectorAll('[id]')].map(node => node.id));
    assert(new Set(ids).size === ids.length, 'SVG fragments introduced duplicate document IDs');
    for (const figure of figures) {
      for (const use of figure.querySelectorAll('use')) {
        const target = use.getAttribute('href');
        assert(target?.startsWith('#') && figure.querySelector(`[id="${target.slice(1)}"]`), 'An SVG fragment has a broken symbol reference');
      }
    }
    assert(figures[0].querySelectorAll('.api-option').length === 4 &&
      figures[0].querySelector('[data-copy="architecture-diagram.query"]').textContent === (language === 'en' ? 'Query' : 'Abfragen'),
      'The API layer lost an operation or its translation');
    const object = JSON.parse([...figures[1].querySelectorAll('.object-snippet g text')].map(line => line.textContent).join('\n'));
    assert(object._id === 'bike-01' && object.price === 15 && object._vec.length === 3 && !figures[1].querySelector('rect'),
      'The object layer lost its JSON example or gained a background box');
    assert(figures[2].querySelectorAll('.storage-chip').length === 3 &&
      figures[2].querySelector('[data-copy="storage-diagram.hot"]').textContent === (language === 'en' ? 'Hot fields' : 'Heiße Felder'),
      'The memory layer lost a tier or its translation');
    await document.fonts.ready;
    for (const width of [1920, 1440, 1280, 1101, 1100, 1000, 900, 760, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '900px';
      await new Promise(resolve => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
      document.getElementById('feature-highlights').scrollIntoView({ behavior: 'instant', block: 'start' });
      await new Promise(resolve => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
      const viewport = document.documentElement.clientWidth;
      const bounds = story.getBoundingClientRect();
      assert(document.documentElement.scrollWidth <= viewport + 1 && Math.abs(bounds.left + bounds.width / 2 - viewport / 2) <= 1,
        `${language} USP story overflows or is not centered at ${width}px`);
      for (const [index, statement] of statements.entries()) {
        const copy = statement.querySelector('.diagram-copy').getBoundingClientRect();
        const art = figures[index].getBoundingClientRect();
        assert(art.width >= Math.min(260, bounds.width) && art.left >= bounds.left - 1 && art.right <= bounds.right + 1,
          'A diagram layer is too small or clipped');
        assert(art.left >= copy.right - 1 || art.top >= copy.bottom + 20, 'A diagram overlaps its USP statement');
        if (art.top >= copy.bottom) {
          const paragraph = statement.querySelector('p').getBoundingClientRect();
          assert(Math.abs(paragraph.left + paragraph.width / 2 - bounds.left - bounds.width / 2) <= 1,
            'A stacked USP explanation is not centered');
        }
        const svg = figures[index].querySelector('svg');
        const view = svg.viewBox.baseVal;
        assert(Math.abs(art.height / art.width - view.height / view.width) < .01 &&
          svg.querySelector(':scope > use').getBoundingClientRect().height > 0, 'A diagram layer is empty or stretched');
        const headline = statement.querySelector('h3').getBoundingClientRect();
        assert(headline.left >= bounds.left - 1 && headline.right <= bounds.right + 1, 'A USP headline is clipped');
      }
      const nav = document.querySelector('.header-links').getBoundingClientRect();
      assert(nav.left >= 0 && nav.right <= viewport + 1, 'The top navigation is clipped');
      assert(document.querySelector('#section-links [aria-current="location"]').hash.endsWith('id=feature-highlights'),
        'The left menu does not track the new USP section');
    }
  }
});

await check('Learn explains a bike and owner in two Markdown chapters with working topics and examples', async () => {
  for (const language of ['en', 'de']) {
    const markdown = await fetch(`../content/${language}/learn.md`).then(response => response.text());
    const diagramCount = [...markdown.matchAll(/^!\[[^\n]*\]\([^\n]+\)$/gm)].length;
    const exampleCount = [...markdown.matchAll(/^```[^\n]*\n[\s\S]*?^```/gm)].length;
    const optionalCount = [...markdown.matchAll(/^<details>$/gm)].length;
    site.src = `../?lang=${language}#/learn`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement?.lang === language && document.querySelectorAll('.document-guide .document-art > svg').length === diagramCount &&
          document.querySelector('.header-links a[href$="#/learn"][aria-current="page"]')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Learn did not finish loading'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const frame = site.contentWindow;
    const document = site.contentDocument;
    const guide = document.querySelector('.document-guide');
    const groups = [...guide.querySelectorAll(':scope > .document-guide-group')];
    const topics = [...guide.querySelectorAll('.document-chapter')];
    const headings = [...guide.querySelectorAll('h2, h3, h4')];
    const links = [...document.querySelectorAll('#section-links a')];
    assert(groups.length === 2 && groups.map(group => group.querySelector('h2').id).join('|') === 'database|server' &&
      groups[0].querySelectorAll('h3').length === 8 && groups[1].querySelectorAll('h3').length === 4,
      'Learn is not organized into Database and Server chapters');
    assert(links.map(link => link.textContent).join('|') === headings.map(heading => heading.textContent.trim()).join('|') &&
      document.querySelectorAll('#section-links .subchapter').length === 12,
      'The Learn menu is not generated from its two chapters and nested Markdown topics');
    const icons = [...document.querySelectorAll('#section-links img')];
    assert(icons.length === 2 && icons.every(icon => icon.width === 20 && icon.height === 20 && icon.alt === '') &&
      icons[0].getAttribute('src').endsWith('/database.svg') && icons[1].getAttribute('src').endsWith('/server.svg') &&
      !guide.querySelector('h2 img, h3 img'),
      'Learn must use the same menu-only chapter icons as Get Started and Documentation');
    assert(!document.querySelector('.documentation-tree') &&
      document.querySelector('.header-links [aria-current="page"]').getAttribute('href').endsWith('#/learn'),
      'Learn inherited documentation navigation or lost its selected header link');
    assert([...document.querySelectorAll('.header-links a')].map(link => link.textContent).join('|') ===
      (language === 'en' ? 'OBJY|Learn|Get started|Documentation' : 'OBJY|Lernen|Loslegen|Dokumentation'),
      'The top bar does not show the four translated destinations in order');
    const objectTopic = guide.querySelector('#objects').closest('.document-chapter');
    const json = [...objectTopic.querySelectorAll('.learn-objects g text')].map(line => line.textContent).join('\n');
    const bike = JSON.parse(json);
    assert(bike._id === 'bike-01' && bike.price === 15 && bike.available === true && !guide.textContent.includes('Orbit'),
      'The bike example is invalid or the old project example remains');
    const examples = [...guide.querySelectorAll('pre')];
    assert(examples.length === exampleCount && examples.every(pre => pre.querySelector('.token') && pre.querySelectorAll('.copy-button').length === 1),
      'Learn examples lost highlighting or copy controls');
    const codeIn = id => guide.querySelector(`#${id}`).closest('.document-chapter').querySelector('pre code').textContent;
    const reference = JSON.parse([...guide.querySelectorAll('.learn-references-wide .reference-parent text')]
      .map(line => line.textContent).join('\n'));
    assert(reference.owner.object.name === 'Alex' && reference.owner.value === reference.owner.object._id &&
      codeIn('references').includes('type: "reference"') &&
      JSON.parse(codeIn('memory')).columns[0] === 'price',
      'The expanded owner, storage metadata, or permission rule is invalid');
    const permissionTopic = guide.querySelector('#users-permissions').closest('.document-chapter');
    const permissionExamples = [...permissionTopic.querySelectorAll('pre code')].map(code => code.textContent);
    const httpBody = code => JSON.parse(code.slice(code.indexOf('\n\n') + 2));
    const alex = httpBody(permissionExamples[0]);
    assert(permissionTopic.querySelector('.learn-permissions') && permissionExamples.length === 6 &&
      permissionExamples[0].startsWith('POST /api/app/users/object\nAuthorization: Bearer <adminAccessToken>') &&
      alex.username === 'alex' && alex.permissions[0].query['owner.value'] === 'person-42' && alex.permissions[0].perm === 'ru' &&
      permissionExamples[1].startsWith('POST /api/app/users/auth') && httpBody(permissionExamples[1]).username === alex.username &&
      permissionExamples[2].startsWith('POST /api/app/bikes/search\nAuthorization: Bearer <alexAccessToken>') &&
      httpBody(permissionExamples[2]).$refDepth === 0 &&
      permissionExamples[3].startsWith('PATCH /api/app/bikes/object/bike-01?$refDepth=0') &&
      httpBody(permissionExamples[3]).$set.price === 20 &&
      permissionExamples[4].startsWith('PATCH /api/app/users/object/alex\nAuthorization: Bearer <adminAccessToken>') &&
      httpBody(permissionExamples[4]).$set.permissions[0].perm === 'crud' &&
      JSON.parse(permissionExamples[5]).collectionPermissions.read[0] === 'bikes',
      'Permissions must explain user creation, login, scoped operations, and administrator-managed access changes');
    assert(permissionTopic.querySelectorAll('.document-lesson-details details').length === 3 &&
      [...permissionTopic.querySelectorAll('details')].every(details => !details.open) &&
      permissionTopic.querySelector('[data-copy="learn-diagrams.permission-allowed"]').textContent ===
        (language === 'en' ? 'Read + update' : 'Lesen + Ändern'),
      'The permissions lesson must keep its examples expandable and translate the allowed/denied illustration');
    const crudHeading = guide.querySelector('h3#crud');
    const crud = [...crudHeading.closest('.document-chapter').querySelectorAll('pre code')].at(-1).textContent;
    assert(crudHeading.closest('.document-chapter').nextElementSibling.querySelector('h3').id === 'operations' &&
      ['bikes.insert(', 'bikes.find(', 'bikes.patch(', 'bikes.remove('].every(operation => crud.includes(operation)) &&
      document.querySelector('#section-links a[href$="id=crud"]').closest('li').style.getPropertyValue('--chapter-depth') === '1',
      'CRUD must precede Queries at the same heading and menu level, with all four examples');
    assert(guide.querySelectorAll('.document-code-lesson > .document-lesson-example pre').length === 3 &&
      guide.querySelectorAll('.document-lesson-details details').length === optionalCount &&
      !guide.querySelector('.learn-objects rect, .reference-parent rect, .reference-source rect'),
      'Learn must keep code lessons readable, optional examples expandable, and JSON illustrations unframed');
    const setup = guide.querySelector('.document-lesson-details details');
    assert(!setup.open, 'The optional setup example starts expanded');
    setup.querySelector('summary').click();
    assert(setup.open && setup.querySelector('pre').getBoundingClientRect().height > 0,
      'The setup example cannot be opened');
    setup.querySelector('summary').click();
    const vectors = guide.querySelector('#vectors').closest('.document-chapter');
    assert(vectors.closest('.document-guide-group').querySelector('h2').id === 'database' &&
      vectors.querySelector('.learn-vectors') && codeIn('vectors').includes('await bikes.ready()') &&
      codeIn('vectors').includes('$vector') && vectors.querySelector('[data-copy="learn-diagrams.vector-matches"]').textContent ===
      (language === 'en' ? 'Similar bikes' : 'Ähnliche Fahrräder'),
      'The vector lesson lost its index readiness, search example, illustration, or translation');
    assert(guide.querySelector('[data-copy="learn-diagrams.database"]').textContent ===
      (language === 'en' ? 'Database' : 'Datenbank'), 'Server artwork is not translated');
    for (const width of [1440, 1100, 1000, 760, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '900px';
      await new Promise(resolve => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
      const box = guide.getBoundingClientRect();
      assert(document.documentElement.scrollWidth <= width + 1 && Math.abs(box.left + box.width / 2 - width / 2) < 1,
        `Learn overflows or shifts off center (${language}, ${width}px)`);
      for (const topic of topics) {
        const copy = topic.querySelector('.document-illustration-copy').getBoundingClientRect();
        assert(copy.left >= box.left - 1 && copy.right <= box.right + 1, 'A topic explanation leaves the article');
        const figure = topic.querySelector('.document-art');
        if (!figure) continue;
        const art = figure.getBoundingClientRect();
        assert(art.width > 200 && art.left >= box.left - 1 && art.right <= box.right + 1 &&
          (art.left >= copy.right - 1 || art.right <= copy.left + 1 || art.top >= copy.bottom - 1),
          'A Learn illustration is too small, clipped, or overlaps its explanation');
        for (const label of topic.querySelectorAll('svg text')) {
          const labelBox = label.getBoundingClientRect();
          assert(!labelBox.width || labelBox.left >= art.left - 1 && labelBox.right <= art.right + 1,
            `A Learn diagram label is clipped (${language}, ${label.textContent})`);
        }
      }
    }
    for (const id of ['operations', 'crud', 'vectors', 'server']) {
      document.querySelector(`#section-links a[href$="id=${id}"]`).click();
      await new Promise((resolve, reject) => {
        const deadline = Date.now() + 5000;
        const ready = () => {
          if (frame.location.hash === `#/learn?id=${id}` && document.querySelector(`#section-links a[href$="id=${id}"][aria-current="location"]`)) return resolve();
          if (Date.now() > deadline) return reject(new Error(`The Learn chapter or topic jump failed: ${id}`));
          frame.requestAnimationFrame(ready);
        };
        ready();
      });
    }
    assert(!frame.performance.getEntriesByType('resource').some(resource => resource.name.startsWith('https://raw.githubusercontent.com/')),
      'Learn unnecessarily downloads live documentation');
    const otherLanguage = language === 'en' ? 'de' : 'en';
    const switcher = document.querySelector(`.language-switcher a[lang="${otherLanguage}"]`);
    assert(switcher && new URL(switcher.href).hash === '#/learn?id=server',
      'Switching language loses the Learn page or chapter');
  }
});

await check('The object database hero stays large, translated, and centered on desktop and phones', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/?id=top`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement?.lang === language && document.querySelector('.hero-art [data-copy="application-diagram.agents"]')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Hero artwork did not load'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const frame = site.contentWindow;
    const document = site.contentDocument;
    await document.fonts.ready;
    const diagram = document.querySelector('.hero-art > svg');
    const agents = diagram.querySelector('[data-copy="application-diagram.agents"]').textContent;
    assert(agents === (language === 'en' ? 'AI agents' : 'KI-Agenten'), 'Hero labels were not translated');
    assert(diagram.classList.contains('objy-object-engine') && !document.querySelector('.hero-art .objy-architecture'),
      'The object database hero is missing or the architecture remains on the homepage');
    const field = diagram.querySelector('#objy-scale-field');
    assert(diagram.classList.contains('objy-scale-engine') && field?.querySelectorAll('.field-object').length >= 300 &&
      field.querySelectorAll('.connected-object').length === 3 && !field.querySelector('text, rect'),
      'The hero must show hundreds of empty objects, with three connected objects and no code cards');
    assert(diagram.querySelectorAll('.object-engine-pulse animateMotion').length === 6 &&
      [...diagram.querySelectorAll('mpath')].every((path) => diagram.querySelector(path.getAttribute('href'))),
      'A connection pulse lost its path');
    assert(document.querySelectorAll('#section-links a').length === 3, 'Homepage chapter links were not updated');
    const highlights = [...document.querySelectorAll('.hero-highlights li')];
    assert(highlights.map((item) => item.textContent.trim()).join('|') === (language === 'en' ?
      'Flexible JSON|OLTP · OLAP · Vector|Efficient storage|API, auth & permissions' :
      'Flexibles JSON|OLTP · OLAP · Vektor|Effiziente Speicherung|API, Auth & Berechtigungen'), 'Hero highlights are missing or untranslated');
    assert(!document.querySelector('.section-hero .markdown-body > p'), 'The old hero subtitle is still present');
    for (const width of [1440, 1280, 761, 641, 640, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '900px';
      // Offscreen iframe animation frames can be suspended; layout reads below force a reflow.
      await new Promise((resolve) => setTimeout(resolve, 32));
      const box = diagram.getBoundingClientRect();
      const ratio = width <= 640 ? 560 / 420 : 480 / 720;
      assert(box.width > 250 && Math.abs(box.height / box.width - ratio) < .01, 'Hero artwork is stretched or too small');
      const layout = diagram.querySelector(width <= 640 ? '.object-engine-compact' : '.object-engine-wide');
      assert(frame.getComputedStyle(layout).display !== 'none' && layout.querySelectorAll('.engine-endpoint').length === 3,
        'The responsive database composition is missing');
      const database = layout.querySelector('.engine-object-field').getBoundingClientRect();
      assert(database.width > box.width * .43 && database.left >= box.left - 1 && database.right <= box.right + 1 &&
        database.top >= box.top - 1 && database.bottom <= box.bottom + 1, 'The central database is too small or clipped');
      assert(document.documentElement.scrollWidth <= width + 1, `${language} homepage overflows at ${width}px`);
      const list = document.querySelector('.hero-highlights').getBoundingClientRect();
      const rows = new Set(highlights.map((item) => Math.round(item.getBoundingClientRect().top)));
      assert(rows.size === (list.width <= 820 ? 2 : 1), 'The highlight row does not adapt evenly');
      for (const item of highlights) {
        const rect = item.getBoundingClientRect();
        assert(rect.left >= list.left - 1 && rect.right <= list.right + 1 && item.querySelector('img').alt === '',
          'A highlight is clipped or its decorative icon has redundant text');
      }
      for (const overview of document.querySelectorAll('.section-icon-cards')) {
        const available = overview.getBoundingClientRect().width;
        const group = overview.querySelector('.section-options');
        const columns = available <= 480 ? 1 : available <= 760 ? 2 : Number(group.style.getPropertyValue('--option-columns'));
        assert(frame.getComputedStyle(group).gridTemplateColumns.split(' ').length === columns,
          `Wrong homepage card column count at ${width}px`);
        const cases = [...group.children];
        for (const [index, card] of cases.entries()) {
          const rect = card.getBoundingClientRect();
          const icon = card.querySelector('img').getBoundingClientRect();
          assert(rect.width > 145 && rect.left >= 0 && rect.right <= width, 'A homepage column is clipped');
          assert(Math.abs(icon.left + icon.width / 2 - rect.left - rect.width / 2) <= 1, 'A homepage icon is not centered');
          if (index < columns) assert(Math.abs(rect.top - cases[0].getBoundingClientRect().top) <= 1,
            'The homepage cards do not share a row');
        }
      }
      // Shared definitions have no screen rectangle; measure their visible uses.
      for (const endpoint of layout.querySelectorAll('.engine-endpoint')) {
        const rect = endpoint.getBoundingClientRect();
        assert(rect.left >= box.left - 1 && rect.right <= box.right + 1 &&
          rect.top >= box.top - 1 && rect.bottom <= box.bottom + 1,
          `${language} hero endpoint is clipped at ${width}px`);
      }
    }
  }
});

await check('The chapter drawer closes after section jumps at every drawer width', async () => {
  const waitFor = async predicate => {
    const deadline = Date.now() + 10000;
    while (!predicate()) {
      if (Date.now() > deadline) throw new Error('Homepage did not load');
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  };
  site.src = '../?lang=en';
  await waitFor(() => site.contentDocument?.documentElement.lang === 'en' &&
    site.contentDocument.querySelector('.hero-highlights') && site.contentDocument.querySelector('.page-sidebar'));
  const document = site.contentDocument;
  const menu = document.querySelector('.section-menu-toggle');
  for (const width of [1100, 900, 760, 390]) {
    site.style.width = `${width}px`;
    await new Promise(resolve => setTimeout(resolve, 32));
    menu.click();
    assert(menu.getAttribute('aria-expanded') === 'true', `Menu did not open at ${width}px`);
    document.querySelectorAll('#section-links a')[1].click();
    assert(menu.getAttribute('aria-expanded') === 'false' &&
      site.contentWindow.getComputedStyle(document.querySelector('.page-sidebar')).display === 'none',
      `The drawer covers the selected section at ${width}px`);
  }
});

await check('Linked remote Markdown preserves its setup roots, chapters, bookmarks, and language context', async () => {
  const waitFor = async predicate => {
    const deadline = Date.now() + 15000;
    while (!predicate()) {
      if (Date.now() > deadline) throw new Error(`Linked documentation did not finish loading (${site.contentWindow.location.href}; ${site.contentDocument?.querySelector('.document-page h1')?.textContent})`);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  };
  const source = markdownInclude(await fetch('../content/terraform.md').then(response => response.text()));
  const sourceFolder = source.slice(0, source.lastIndexOf('/') + 1);
  const patchFetch = () => {
    const frame = site.contentWindow;
    const original = frame.fetch.bind(frame);
    frame.fetch = (input, options) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.startsWith(sourceFolder)) return Promise.resolve(new frame.Response(url.endsWith('SETUP.md') ?
        '# Linked setup\n\n## Installation\n\nInstall here.\n\n## Configuration\n\nConfigure here.' :
        '# Terraform fixture\n\n## Setup\n\n[Linked guide](SETUP.md)'));
      return original(input, options);
    };
  };
  site.src = '../?lang=en#/get-started';
  await waitFor(() => site.contentDocument?.querySelectorAll('.documentation-guide').length === 3);
  patchFetch();
  let frame = site.contentWindow;
  frame.location.hash = '#/get-started/cloud/terraform';
  await waitFor(() => site.contentDocument.querySelector('.document-page h1')?.textContent === 'Terraform fixture');
  site.contentDocument.querySelector('.document-page a[href*="/remote/"]').click();
  await waitFor(() => site.contentDocument.querySelector('.document-page h1')?.textContent === 'Linked setup');
  assert(guideContext(frame.location.hash) === '#/get-started/cloud/terraform', 'The linked document has no bookmarkable parent');
  assert(site.contentDocument.querySelectorAll('.documentation-guide').length === 3 &&
    site.contentDocument.querySelector('.header-links [aria-current="page"]').hash === '#/get-started',
    'A linked Markdown file switched to Documentation or lost the setup roots');
  const chapter = site.contentDocument.querySelector('[data-chapter-id="configuration"]');
  assert(guideContext(chapter.hash) === '#/get-started/cloud/terraform', 'Chapter links dropped their parent context');
  chapter.click();
  await waitFor(() => site.contentDocument.querySelector('[data-chapter-id="configuration"][aria-current="location"]'));
  const languageLink = site.contentDocument.querySelector('.language-switcher a[lang="de"]');
  assert(guideContext(languageLink.hash) === '#/get-started/cloud/terraform', 'Language switching drops the parent context');
  const bookmark = languageLink.href;
  site.addEventListener('load', patchFetch, { once: true });
  site.src = bookmark;
  await waitFor(() => site.contentDocument?.documentElement.lang === 'de' &&
    site.contentDocument.querySelector('.document-page h1')?.textContent === 'Linked setup' &&
    site.contentDocument.querySelector('.documentation-subguide[aria-current="page"]'));
  assert(site.contentDocument.querySelectorAll('.documentation-guide').length === 3 &&
    site.contentDocument.querySelector('.header-links [aria-current="page"]').hash === '#/get-started' &&
    site.contentDocument.querySelector('[data-chapter-id="configuration"]'), 'Reloading a translated bookmark lost the dynamic tree');
  assert(withGuideContext('/remote/example?id=install', '#/manual/guide').includes('id=install'), 'Context removed the chapter query');
});

site.remove();
document.getElementById('status').textContent =
  `${results.children.length - failures} passed, ${failures} failed`;
