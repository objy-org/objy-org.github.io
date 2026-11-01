// No test framework or package installation: run this page through the local HTTP server.
import { createCopy, htmlFragment, sanitizeMarkup } from '../assets/site/markup.mjs';
import { decorateHomepage } from '../assets/site/homepage.mjs';
import { wireExamples } from '../assets/site/examples.mjs';
import { decorateDocument } from '../assets/site/documents.mjs';
import { documentationIndex, createDocumentationTree, documentChapters, chapterLinks } from '../assets/site/navigation.mjs';

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
    'Embedded Database,DB Server,REST API,JavaScript client', 'Directory order changed');
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
    assert(!fresh.mount(nav, article, '/unrelated', { file: 'other.md' }), 'An unrelated document adopted the documentation tree');
  } finally {
    controller.abort();
    history.replaceState(null, '', previousUrl);
    nav.remove();
    article.remove();
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

await check('Markdown object tabs share one code panel and support deep links and keyboard navigation', async () => {
  const markup = '<h1 id="top">Hello</h1><h2 id="demo">Example</h2><p>Introduction</p>' +
    '<h3 id="first">First item</h3><blockquote><p>items / first</p></blockquote>' +
    '<pre><code class="lang-json">{"_id":"first","literal":"&lt;tag&gt;"}</code></pre>' +
    '<h3 id="related">Related record</h3><blockquote><p>people / second</p></blockquote>' +
    '<pre><code class="language-json">{"_id":"second"}</code></pre>' +
    '<h3 id="last">Last item</h3><pre><code class="lang-yaml">name: last</code></pre>';
  const fixture = document.createElement('div');
  fixture.append(htmlFragment(await decorateHomepage(markup)));
  document.body.append(fixture);
  const controller = new AbortController();
  const previousUrl = location.href;
  try {
    history.replaceState(null, '', '#/?id=related');
    wireExamples(controller.signal, fixture);
    const panel = fixture.querySelector('.example-code');
    const code = panel.querySelector('pre code');
    const tabs = [...fixture.querySelectorAll('[data-example-tab]')];
    const active = () => tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    assert(fixture.querySelectorAll('[role="tablist"]').length === 1, 'Multiple tab groups rendered');
    assert(fixture.querySelectorAll('pre').length === 1, 'More than one code snippet rendered');
    assert(tabs.map((tab) => tab.textContent).join(',') === 'First item,Related record,Last item', 'Tabs did not use Markdown labels');
    assert(JSON.parse(code.textContent)._id === 'second', 'Initial deep link did not select its object');
    tabs[0].click();
    assert(JSON.parse(code.textContent).literal === '<tag>', 'Literal JSON changed');
    assert(!code.querySelector('tag'), 'Example content became HTML');
    tabs[1].click();
    assert(panel.querySelector('pre code') === code, 'Code element changed, breaking copy controls');
    assert(JSON.parse(code.textContent)._id === 'second', 'Tab did not change the visible object');
    assert(fixture.querySelector('.example-source-label').textContent === 'people / second', 'Source label did not change');
    assert(panel.getAttribute('aria-labelledby') === tabs[1].id, 'Panel does not identify the selected tab');
    assert(tabs.every((tab) => tab.getAttribute('aria-controls') === panel.id), 'Tabs do not control the shared panel');
    assert(tabs[0].tabIndex === -1 && tabs[1].tabIndex === 0, 'Roving tab focus did not update');
    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    assert(active() === tabs[2] && document.activeElement === tabs[2], 'End did not select and focus the last tab');
    assert(code.textContent === 'name: last', 'Third source did not display');
    assert(fixture.querySelector('.example-format').textContent === 'YAML', 'Code format did not update');
    assert(fixture.querySelector('.example-source-label').textContent === '', 'Missing source retained a stale label');
    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    assert(active() === tabs[0], 'Right arrow did not wrap');
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    assert(active() === tabs[2], 'Left arrow did not wrap');
    tabs[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    assert(active() === tabs[0], 'Home did not select the first tab');
    history.replaceState(null, '', '#/?id=related');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    assert(active() === tabs[1], 'Changed deep link did not select its object');
    controller.abort();
    tabs[0].click();
    history.replaceState(null, '', '#/?id=first');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    assert(active() === tabs[1], 'Example listeners survived cleanup');
  } finally {
    controller.abort();
    history.replaceState(null, '', previousUrl);
    fixture.remove();
  }
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

await check('The homepage keeps its illustrated overview and complete localized feature catalog below the four use cases', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/?id=object-capabilities`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement.lang === language && document.querySelector('.homepage-catalog')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Homepage catalog did not load'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const document = site.contentDocument;
    const source = await fetch(`../content/${language}/home.md`).then((response) => response.text());
    const expected = [...source.matchAll(/^### !\[\]\(([^)]+)\) (.+) :id=(\S+)/gm)];
    const cards = [...document.querySelectorAll('.section-options > .section-option')];
    assert(cards.length === expected.length && cards.length === 4, 'The homepage lost a use case');
    const useCases = document.querySelector('[data-section="object-capabilities"]');
    const overview = document.querySelector('[data-section="feature-highlights"]');
    assert(useCases.nextElementSibling === overview && overview.querySelector(':scope > .section-footer'),
      'The full feature catalog is not directly below the use cases or lost the footer');
    const expectedFeatures = [...source.matchAll(/^#### !\[\]\(([^)]+)\) (.+) :id=(\S+)\n\n([^\n]+)/gm)];
    const features = [...overview.querySelectorAll('.catalog-feature')];
    assert(features.length === expectedFeatures.length && features.length > 3 &&
      overview.querySelectorAll('.catalog-section').length === 2, 'The homepage only shows a feature summary');
    features.forEach((feature, index) => {
      const title = feature.querySelector('h4');
      const [, icon, text, id, description] = expectedFeatures[index];
      assert(title?.id === id && title.textContent.trim() === text && feature.querySelector('img').src.endsWith(icon) &&
        feature.querySelector('p').textContent.trim() === description, 'A feature differs from its source Markdown');
    });
    assert(overview.querySelectorAll('h3').length === 2 && overview.querySelectorAll('.document-art').length === 1 &&
      !overview.querySelector('h1, pre'), 'The combined overview or original heading levels are missing');
    const start = document.querySelector('.header-links a[href$="#/get-started"]');
    assert(start?.textContent === (language === 'en' ? 'Get started' : 'Loslegen') &&
      !document.querySelector('.setup-section, [data-section="start-building"]'), 'Deployment options remain on the homepage or their navigation link is missing');
    cards.forEach((card, index) => {
      const title = card.querySelector('h3');
      assert(title.textContent.trim() === expected[index][2] && title.id === expected[index][3], 'A use-case translation changed');
      assert(card.querySelector('img').src.endsWith(expected[index][1]) && card.querySelector('p')?.textContent.trim(),
        'A use-case icon or description is missing');
    });
    for (const width of [1920, 1440, 760, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '900px';
      await new Promise(resolve => site.contentWindow.requestAnimationFrame(() => site.contentWindow.requestAnimationFrame(resolve)));
      assert(document.documentElement.scrollWidth <= width + 1, 'The embedded catalog overflows the page');
      for (const feature of features) {
        const box = feature.getBoundingClientRect();
        assert(box.width >= 260 && box.left >= 0 && box.right <= width + 1, 'An embedded feature card is clipped');
      }
    }
    assert(document.querySelector('#section-links a[href$="id=object-capabilities"]').textContent ===
      (language === 'en' ? 'Use cases' : 'Anwendungsfälle'), 'The use-case chapter link was not updated');
    const files = site.contentWindow.performance.getEntriesByType('resource').map((resource) => resource.name);
    assert(!files.some((file) => /\/(?:features|get-started)\.md$/.test(file)), 'The homepage still loads the retired Features page or deployment options');
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

await check('Get Started groups server setup, cloud, and embedded use with nested Markdown navigation', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/get-started?id=deploy-cluster`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement.lang === language && document.querySelector('.document-page.document-setup') &&
          document.querySelector('#section-links a[href$="id=deploy-cluster"]')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Deployment options did not load'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const document = site.contentDocument;
    const frame = site.contentWindow;
    const sections = [...document.querySelectorAll('.setup-section')];
    const links = [...document.querySelectorAll('#section-links a')];
    const headings = [...document.querySelectorAll('.document-setup h2, .document-setup h3')];
    assert(sections.length === 3 && links.length === 5 && !document.querySelector('.document-setup details'),
      'Deployment options are missing, collapsed, or absent from the chapter menu');
    assert(!document.querySelector('.page-sidebar').hidden && !document.querySelector('.section-menu-toggle').hidden,
      'Get Started hides its chapter menu');
    assert(links.every((link, index) => link.textContent === headings[index].textContent.trim()),
      'Chapter labels do not follow the translated Markdown headings');
    assert(!document.querySelector('.document-setup img') && links.filter(link => link.querySelector('img[width="20"][height="20"]')).length === 3 &&
      document.querySelectorAll('#section-links .subchapter').length === 2,
      'Deployment icons must appear only in the left menu, at the same size as Documentation');
    assert(sections.map(section => section.querySelector('h2').id).join('|') === 'deploy-run|bring-your-own-cloud|deploy-embedded' &&
      [...sections[0].querySelectorAll('h3')].map(heading => heading.id).join('|') === 'deploy-quick-start|deploy-cluster',
      'Server and embedded setup were not combined under the expected headings');
    assert(document.querySelector('.header-links [aria-current="page"]').getAttribute('href').endsWith('#/get-started'),
      'Get Started navigation is not active');
    assert(sections[0].querySelector('code').textContent.includes('npm i -g @objy/server') &&
      document.querySelector('.document-setup').textContent.split('npm i -g @objy/server').length === 2 &&
      sections[0].textContent.includes('objy run') && sections[0].textContent.includes('objy start --instances 4'),
      'Server setup lost its shared CLI installation or launch commands');
    assert(sections[2].querySelectorAll('pre').length === 2 && sections[2].textContent.includes('npm i @objy/db') &&
      sections[2].querySelector('a[href$="id=install-in-a-browser"]') && sections[2].querySelector('a[href$="id=install-in-nodejs"]'),
      'Embedded setup must share one example and retain both platform guides');
    for (const width of [1280, 760, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '1000px';
      await new Promise(resolve => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
      for (const section of sections) {
        assert(document.documentElement.scrollWidth <= width + 1, `${language} deployment options overflow at ${width}px`);
        for (const action of section.querySelectorAll('.setup-copy a')) {
          const rect = action.getBoundingClientRect();
          assert(rect.left >= 0 && rect.right <= width + 1, `${language} action is clipped at ${width}px`);
        }
        for (const pre of section.querySelectorAll('pre')) assert(pre.querySelectorAll('.copy-button').length === 1,
          'A command has missing or duplicate copy controls');
      }
      for (const id of ['bring-your-own-cloud', 'deploy-embedded', 'deploy-cluster', 'deploy-quick-start']) {
        if (width <= 760) document.querySelector('.section-menu-toggle').click();
        document.querySelector(`#section-links a[href$="id=${id}"]`).click();
        await new Promise((resolve, reject) => {
          const deadline = Date.now() + 5000;
          let previousTop;
          let stable = 0;
          const ready = () => {
            const top = document.getElementById(id).getBoundingClientRect().top;
            stable = previousTop === top ? stable + 1 : 0;
            previousTop = top;
            if (frame.location.hash === `#/get-started?id=${id}` &&
              document.querySelector('#section-links a[aria-current="location"]') &&
              top >= document.querySelector('.site-header').getBoundingClientRect().bottom && top < frame.innerHeight && stable >= 3) return resolve();
            if (Date.now() > deadline) return reject(new Error(`Deployment chapter jump failed: ${language}, ${width}px, ${id}`));
            frame.requestAnimationFrame(ready);
          };
          ready();
        });
        const top = document.getElementById(id).getBoundingClientRect().top;
        assert(top >= 0 && top < frame.innerHeight,
          `Selected deployment heading is not visible: ${language}, ${width}px, ${id}, top=${top}`);
        if (width <= 760) assert(document.querySelector('.section-menu-toggle').getAttribute('aria-expanded') === 'false',
          'Selecting a deployment chapter leaves the mobile menu open');
      }
    }
  }
});

await check('The homepage feature area keeps its illustrations, translations, anchors, and responsive header', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/features`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement.lang === language && document.querySelector('.homepage-catalog')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Feature catalog did not load'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const frame = site.contentWindow;
    const document = site.contentDocument;
    const features = [...document.querySelectorAll('.catalog-feature')];
    await document.fonts.ready;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        if (document.querySelector('#section-links [aria-current="location"]')?.getAttribute('href').endsWith('id=feature-highlights')) return resolve();
        if (Date.now() > deadline)
          return reject(new Error(`The redirected Features section did not become active (${language}, ${frame.innerWidth}px)`));
        frame.requestAnimationFrame(ready);
      };
      ready();
    });
    assert(features.length === 21 && new Set(features.map((feature) => feature.querySelector('img').src)).size === 21,
      'A feature or distinct icon is missing');
    const links = [...document.querySelectorAll('#section-links a')];
    assert(links.length === 3 && links[0].hash.endsWith('id=top') &&
      links[1].hash.endsWith('id=object-capabilities') && links[2].hash.endsWith('id=feature-highlights'),
      'The homepage chapter menu changed');
    assert(frame.location.hash === '#/?id=feature-highlights', 'The retired Features URL did not redirect to the homepage');
    assert(document.querySelector('.homepage-catalog > h2').textContent === (language === 'en' ?
      'Flexible JSON. Versatile APIs. Effective in-memory storage.' :
      'Flexibles JSON. Vielseitige APIs. Effiziente In-Memory-Speicherung.'), 'The Features title was not updated');
    assert(features.every((feature) => !feature.querySelector('h4').hasAttribute('data-chapter')),
      'Individual features still participate in chapter navigation');
    assert(!document.querySelector('.catalog-feature pre'), 'The feature catalog still shows code examples');
    assert(document.querySelector('.header-links [aria-current="page"]').getAttribute('href').endsWith('#/?id=top'),
      'OBJY navigation is not active on the homepage');
    assert(document.querySelectorAll('.header-links a').length === 4 &&
      document.querySelector('.header-links a[href$="#/get-started"]') &&
      !document.querySelector('.header-links a[href$="id=feature-highlights"]'), 'The top bar should contain OBJY, Learn, Get Started, and Documentation');
    const architecture = document.querySelector('.document-lead-art');
    const caption = architecture.nextElementSibling;
    assert(!document.getElementById('architecture') && caption.matches('p:has(> em:only-child)') &&
      caption.nextElementSibling.matches('.catalog-section'),
      'The architecture diagram should introduce the page without its own chapter heading');
    assert(caption.textContent === (language === 'en' ?
      'Each object is split into hot fields, compact columns, and compressed data for efficient in-memory storage.' :
      'Für effiziente Speicherung im RAM wird jedes Objekt in heiße Felder, kompakte Spalten und komprimierte Daten aufgeteilt.'),
      'The small storage caption is missing or untranslated');
    const objectDiagram = architecture.querySelector('.objy-architecture');
    assert(objectDiagram && objectDiagram.querySelectorAll('defs .object-snippet').length === 1,
      'The architecture diagram must show one JSON object');
    const object = JSON.parse([...objectDiagram.querySelectorAll('defs .object-snippet g text')].map(line => line.textContent).join('\n'));
    assert(object._id === 'bike-01' && object.price === 15 && object._vec.length === 3,
      'The architecture JSON is invalid or lost its example fields');
    assert(objectDiagram.querySelector('[data-copy="architecture-diagram.query"]').textContent ===
      (language === 'en' ? 'Query' : 'Abfragen'), 'The architecture diagram is not translated');
    assert(!document.querySelector('.document-explanation') && architecture.querySelectorAll('.document-art').length === 1,
      'The storage prose or a separate illustration remains below the overview');
    assert(!objectDiagram.querySelector('[data-copy="storage-diagram.durability"], [data-copy$="-detail"], [data-copy$="-benefit"]'),
      'The architecture diagram still contains long storage explanations or the removed S3 line');
    assert(objectDiagram.querySelector('[data-copy="storage-diagram.hot"]').textContent ===
      (language === 'en' ? 'Hot fields' : 'Heiße Felder'), 'The integrated storage labels are not translated');
    for (const width of [1920, 1280, 1101, 1100, 1001, 1000, 900, 761, 760, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '900px';
      await new Promise((resolve) => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
      document.getElementById('feature-highlights').scrollIntoView({ behavior: 'instant', block: 'start' });
      await new Promise(resolve => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
      assert(document.querySelector('#section-links [aria-current="location"]').getAttribute('href').endsWith('id=feature-highlights'),
        'The left menu does not follow the homepage Features section');
      const viewport = document.documentElement.clientWidth;
      const article = document.querySelector('.homepage-catalog').getBoundingClientRect();
      assert(document.documentElement.scrollWidth <= viewport + 1, `${language} catalog overflows at ${width}px`);
      assert(Math.abs(article.left + article.width / 2 - viewport / 2) <= 1,
        `${language} catalog is not centered at ${width}px`);
      const chapters = [...document.querySelectorAll('.document-chapter')];
      for (const [index, chapter] of chapters.entries()) {
        const bounds = chapter.getBoundingClientRect();
        const title = chapter.querySelector(':scope > h3').getBoundingClientRect();
        assert(title.top >= bounds.top + (chapter.matches('.document-explanation') ? 24 : 40) &&
          Math.abs(bounds.left - article.left) <= 1 && Math.abs(bounds.width - article.width) <= 1,
          'A major chapter is missing its heading space or full-width layout');
        if (index) assert(bounds.top >= chapters[index - 1].getBoundingClientRect().bottom - 1,
          'Feature chapters overlap');
      }
      const architectureBox = objectDiagram.getBoundingClientRect();
      const phone = width <= 640;
      const layout = objectDiagram.querySelector(phone ? '.architecture-compact' : '.architecture-wide');
      assert(frame.getComputedStyle(layout).display !== 'none' &&
        layout.querySelectorAll('.architecture-object > use').length === 1 && layout.querySelectorAll('.api-option').length === 4,
        'The architecture must keep four API variants and one JSON object');
      assert(Math.abs(architectureBox.height / architectureBox.width - (phone ? 600 / 360 : 570 / 1000)) < .01 &&
        architectureBox.width <= 901 &&
        architectureBox.left >= article.left - 1 && architectureBox.right <= article.right + 1,
        'The moved architecture diagram is stretched or clipped');
      for (const label of layout.querySelectorAll('text')) {
        const rect = label.getBoundingClientRect();
        assert(rect.left >= architectureBox.left - 1 && rect.right <= architectureBox.right + 1,
          'An architecture label is clipped');
      }
      const panel = layout.querySelector('.storage-panel').getBoundingClientRect();
      const objectBounds = layout.querySelector('.architecture-object').getBoundingClientRect();
      assert(layout.querySelectorAll('.storage-chip').length === 3 && layout.querySelector('.memory-contacts') && panel.top > objectBounds.bottom &&
        panel.bottom < architectureBox.bottom, 'Storage is not one compact layer below the JSON objects');
      for (const tier of layout.querySelectorAll('.storage-chip')) {
        assert(tier.querySelectorAll('text').length === 1, 'A memory chip has more than a short label');
        const box = tier.querySelector('rect').getBoundingClientRect();
        for (const label of tier.querySelectorAll('text')) {
          const text = label.getBoundingClientRect();
          assert(text.left > box.left && text.right < box.right && text.top > box.top && text.bottom < box.bottom,
            `A memory label is clipped inside its chip (${language}, ${width}px, ${label.textContent})`);
        }
      }
      const memory = layout.querySelector('[data-copy="storage-diagram.memory"]');
      const headingSize = parseFloat(frame.getComputedStyle(memory).fontSize);
      assert(headingSize >= 20 && headingSize > parseFloat(frame.getComputedStyle(layout.querySelector('.storage-chip text')).fontSize),
        'The in-memory label is not prominent');
      const brand = document.querySelector('.header-brand').getBoundingClientRect();
      const nav = document.querySelector('.header-links').getBoundingClientRect();
      const actions = document.querySelector('.header-actions').getBoundingClientRect();
      assert(nav.left >= 0 && nav.right <= viewport + 1, `${language} navigation is clipped at ${width}px`);
      if (nav.top < brand.bottom && nav.bottom > brand.top) {
        assert(nav.left > brand.right && nav.right < actions.left,
          `${language} navigation overlaps header controls at ${width}px`);
      }
      for (const feature of features) {
        const rect = feature.getBoundingClientRect();
        assert(rect.width >= 260 && rect.left >= 0 && rect.right <= viewport + 1,
          `${language} feature is too narrow or clipped at ${width}px`);
      }
      for (const grid of document.querySelectorAll('.catalog-grid')) {
        const columns = frame.getComputedStyle(grid).gridTemplateColumns.split(' ').length;
        const cards = [...grid.children];
        cards.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          if (index % columns) {
            const previous = cards[index - 1].getBoundingClientRect();
            assert(Math.abs(rect.top - previous.top) <= 1 && rect.left >= previous.right,
              'Feature cards do not share a row');
          } else if (index) {
            assert(rect.top >= Math.max(...cards.slice(index - columns, index).map((card) => card.getBoundingClientRect().bottom)) + 24,
              'Feature card rows are too close');
          }
        });
      }
      if (width >= 1280) {
        const groups = [...document.querySelectorAll('.catalog-section')];
        const height = groups.at(-1).getBoundingClientRect().bottom - groups[0].getBoundingClientRect().top;
        assert(height < 4200, `${language} feature cards are too tall on desktop`);
      }
    }
    frame.location.hash = '#/features?id=s3-durability';
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        if (frame.location.hash === '#/?id=s3-durability') return resolve();
        if (Date.now() > deadline) return reject(new Error('The old feature bookmark did not redirect'));
        setTimeout(ready, 16);
      };
      ready();
    });
    assert(document.getElementById('s3-durability')?.closest('.catalog-feature'), 'Individual feature anchor disappeared');
    const target = document.querySelector('#db-server a');
    const changed = new Promise((resolve) => frame.addEventListener('hashchange', resolve, { once: true }));
    target.click();
    await changed;
    assert(frame.location.hash.endsWith('id=db-server'), 'Feature group link did not navigate');
  }
});

await check('Learn explains a bike and owner in two Markdown chapters with working topics and examples', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/learn`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement?.lang === language && document.querySelectorAll('.document-guide .document-art > svg').length === 7 &&
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
    const headings = [...guide.querySelectorAll('h2, h3')];
    const links = [...document.querySelectorAll('#section-links a')];
    assert(groups.length === 2 && groups.map(group => group.querySelector('h2').id).join('|') === 'database|server' &&
      groups[0].querySelectorAll('h3').length === 7 && groups[1].querySelectorAll('h3').length === 4,
      'Learn is not organized into Database and Server chapters');
    assert(links.map(link => link.textContent).join('|') === headings.map(heading => heading.textContent.trim()).join('|') &&
      document.querySelectorAll('#section-links .subchapter').length === 11,
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
    assert(examples.length === 8 && examples.every(pre => pre.querySelector('.token') && pre.querySelectorAll('.copy-button').length === 1),
      'Learn examples lost highlighting or copy controls');
    const codeIn = id => guide.querySelector(`#${id}`).closest('.document-chapter').querySelector('pre code').textContent;
    const reference = JSON.parse([...guide.querySelectorAll('.learn-references-wide .reference-parent text')]
      .map(line => line.textContent).join('\n'));
    assert(reference.owner.object.name === 'Alex' && reference.owner.value === reference.owner.object._id &&
      codeIn('references').includes('type: "reference"') &&
      JSON.parse(codeIn('memory')).columns[0] === 'price' &&
      JSON.parse(codeIn('users-permissions')).permissions[0].query['owner.value'] === 'person-42',
      'The expanded owner, storage metadata, or permission rule is invalid');
    assert(guide.querySelectorAll('.document-code-lesson > .document-lesson-example pre').length === 3 &&
      guide.querySelectorAll('.document-lesson-details details').length === 5 &&
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
    for (const id of ['operations', 'vectors', 'server']) {
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
        if (document?.documentElement.lang === language && document.querySelector('.hero-art [data-copy="application-diagram.agents"]')) return resolve();
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

site.remove();
document.getElementById('status').textContent =
  `${results.children.length - failures} passed, ${failures} failed`;
