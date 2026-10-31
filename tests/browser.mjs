// No test framework or package installation: run this page through the local HTTP server.
import { createCopy, htmlFragment, sanitizeMarkup } from '../assets/site/markup.mjs';
import { decorateHomepage } from '../assets/site/homepage.mjs';
import { wireExamples } from '../assets/site/examples.mjs';
import { decorateDocument, wireDocuments } from '../assets/site/documents.mjs';

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
  assert(document.querySelector('.page-sidebar').hidden && document.querySelector('.section-menu-toggle').hidden,
    'The directory still has a chapter menu');
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
  const markup = '<h1 id="catalog">Catalog</h1><p>Introduction.</p>' +
    '<h2 id="alpha">Alpha</h2><p><a href="alpha.md">Read more</a></p>' + entry('first') + entry('second') +
    '<pre><code>Important example</code></pre>' +
    '<h2 id="beta">Beta</h2><p>Group introduction.</p>' + entry('third') + '<ul><li>Extra detail</li></ul>';
  const catalog = htmlFragment(decorateDocument(markup));
  const sections = [...catalog.querySelectorAll('.catalog-section')];
  const features = [...catalog.querySelectorAll('.catalog-feature')];
  assert(sections.length === 2 && features.length === 3, 'Catalog names or counts were hard-coded');
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
  const ordinary = htmlFragment(decorateDocument(markup.replace('<img src="third.svg" alt="third">', '')));
  assert(!ordinary.querySelector('.document-catalog') && ordinary.querySelectorAll('h3').length === 3 &&
    ordinary.querySelector('pre code'), 'Mixed ordinary chapters were converted or lost content');
});

await check('Icon chapters with commands or actions become accessible inline accordions with working deep links', () => {
  const fixture = document.createElement('div');
  fixture.append(htmlFragment(decorateDocument(
    '<h1 id="start">Start</h1>' +
    '<h2 id="alpha"><a class="anchor"><img src="local.svg" alt="">Alpha</a></h2>' +
    '<pre><code class="lang-sh"><span class="token function">objy</span> run</code></pre>' +
    '<p><a href="guide.md?id=first">Guide</a></p>' +
    '<h2 id="beta"><img src="cloud.svg" alt="">Beta</h2>' +
    '<ul><li><a href="https://example.com/cloud">Provider</a></li></ul>' +
    '<h2 id="gamma"><img src="browser.svg" alt="">Gamma</h2>' +
    '<pre><code>const db = createDatabase();</code></pre>',
  )));
  document.body.append(fixture);
  const previousUrl = location.href;
  const controller = new AbortController();
  try {
    const rows = [...fixture.querySelectorAll('.accordion-row')];
    assert(rows.length === 3 && rows[0].open, 'Row count or initial expansion is incorrect');
    assert(rows.every((row) => row.querySelector('summary > h2') &&
      row.querySelector('.accordion-body') && row.name === 'document-accordion'), 'Rows lost native accordion structure');
    assert(fixture.querySelector('.accordion-body .token.function'), 'Code highlighting was lost');
    assert(fixture.querySelector('.accordion-body code').textContent === 'objy run', 'Code source changed');
    assert(fixture.querySelector('.accordion-body a').getAttribute('href') === 'guide.md?id=first', 'Guide destination changed');
    assert(!fixture.querySelector('summary a') && fixture.querySelector('summary img').alt === '',
      'Summary contains an extra link or repeats the icon label');
    history.replaceState(null, '', '#/example?id=gamma');
    wireDocuments(controller.signal, fixture);
    assert(rows[2].open && !rows[0].open, 'Initial chapter link did not open its row exclusively');
    history.replaceState(null, '', '#/example?id=beta');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    assert(rows[1].open && !rows[2].open, 'Changed chapter link did not select its row');
    rows[1].querySelector('summary').click();
    assert(!rows.some((row) => row.open), 'An open row could not collapse');
    controller.abort();
    history.replaceState(null, '', '#/example?id=alpha');
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    assert(!rows.some((row) => row.open), 'Chapter listeners survived cleanup');
  } finally {
    controller.abort();
    history.replaceState(null, '', previousUrl);
    fixture.remove();
  }
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
    '<h1 id="top">Hello</h1><p>Intro</p>' + image + '<p><a href="all-features.md">See the full picture</a></p>' + illustrated +
    '<h2 id="details">Details</h2><p>More to explore.</p>' +
    '<h2 id="choices">Choices</h2><h3 id="small">Small</h3><p>First choice</p><h3 id="large">Large</h3><p>Second choice</p>';
  const content = htmlFragment(await decorateHomepage(markup));
  assert(content.querySelectorAll('.detail-section').length === 4, 'Chapter count was hard-coded');
  assert(content.querySelector('.section-hero > .section-copy + .hero-art'), 'Hero artwork is not beneath the headline');
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

await check('Homepage Markdown embeds reuse document layouts and retain a link when unavailable', async () => {
  const markup = '<h1 id="top">Hello</h1><h2 id="options">Options</h2>' +
    '<p><a href="other-options.md" title="embed">Read options</a></p><hr><p>Footer</p>';
  const source = '<h1 id="source">Source title</h1><h2 id="local"><img src="local.svg">Local</h2>' +
    '<pre><code>objy run</code></pre><p><a href="guide.md">Guide</a></p>';
  let requested;
  const content = htmlFragment(await decorateHomepage(markup, {
    loadDocument: async (href) => { requested = href; return source; },
  }));
  assert(requested === 'other-options.md', 'The embed source was hard-coded');
  const embedded = content.querySelector('.section-document-embed .embedded-document');
  assert(embedded.matches('.document-accordion') && !embedded.classList.contains('document-page'),
    'The embed lost its layout or would replace the homepage menu');
  assert(content.querySelectorAll('h1').length === 1 && embedded.querySelector('summary h3#local'),
    'Embedded headings were not nested beneath their homepage section');
  assert(embedded.querySelector('code').textContent === 'objy run' && content.querySelector('.section-footer').textContent === 'Footer',
    'The command or homepage footer was lost');
  const fallback = htmlFragment(await decorateHomepage(markup, { loadDocument: async () => null }));
  assert(fallback.querySelector('a[href="other-options.md"]') && !fallback.querySelector('.embedded-document'),
    'The unavailable embed lost its original link');
});

await check('Icon subchapters become reusable homepage columns with their own accessible headings', async () => {
  const home = '<h1 id="top">Hello</h1><h2 id="overview">Overview</h2>' +
    ['alpha', 'beta', 'gamma'].map((id) => `<h3 id="${id}"><a class="anchor"><img src="icons/${id}.svg">${id}</a></h3>` +
      `<p>About ${id}.</p>`).join('');
  const content = htmlFragment(await decorateHomepage(home));
  const group = content.querySelector('.section-icon-cards .section-options');
  const cards = [...group.children];
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

await check('The homepage has four localized use cases instead of the feature catalog', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/?id=object-capabilities`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement.lang === language && document.querySelector('.section-icon-cards')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Use cases did not load'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const document = site.contentDocument;
    const source = await fetch(`../content/${language}/home.md`).then((response) => response.text());
    const expected = [...source.matchAll(/^### !\[\]\(([^)]+)\) (.+) :id=(\S+)/gm)];
    const cards = [...document.querySelectorAll('.section-options > .section-option')];
    assert(cards.length === expected.length && cards.length === 4, 'The homepage does not show four use cases');
    cards.forEach((card, index) => {
      const title = card.querySelector('h3');
      assert(title.textContent.trim() === expected[index][2] && title.id === expected[index][3], 'A use-case translation changed');
      assert(card.querySelector('img').src.endsWith(expected[index][1]), 'A use-case icon was substituted');
      assert(card.querySelector('p')?.textContent.trim(), 'A use-case description is missing');
    });
    assert(!document.querySelector('.feature-overview, .catalog-feature, .example-workspace') &&
      !document.querySelector('[data-section="object-capabilities"] pre'),
      'The previous feature catalog or code examples are still on the homepage');
    assert(document.querySelector('#section-links a[href$="id=object-capabilities"]').textContent ===
      (language === 'en' ? 'Use cases' : 'Anwendungsfälle'), 'The use-case chapter link was not updated');
    const files = site.contentWindow.performance.getEntriesByType('resource').map((resource) => resource.name);
    assert(!files.some((file) => /\/features\.md$/.test(file)), 'The homepage still downloads the full feature catalog');
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
      assert(Math.abs(picture.height / picture.width - 480 / 720) < .01, 'Hero artwork is stretched');
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
      assert(frame.getComputedStyle(document.querySelector('.page-sidebar')).display === 'none', 'Directory chapter menu is visible');
      assert(frame.getComputedStyle(document.querySelector('.section-menu-toggle')).display === 'none', 'Directory menu toggle is visible');
      const last = document.querySelector('.directory-list > :last-child').getBoundingClientRect();
      if (width >= 1280) assert(last.bottom <= frame.innerHeight, 'The guides do not fit together on desktop');
    }
  } finally {
    if (previousStyle === null) site.removeAttribute('style');
    else site.setAttribute('style', previousStyle);
  }
});

await check('Homepage and Get Started share deployment content, translations, and accordion behavior', async () => {
  for (const language of ['en', 'de']) {
    let expected;
    for (const route of ['/get-started', '/']) {
      site.src = `../?lang=${language}#${route}?id=deploy-cluster`;
      await new Promise((resolve, reject) => {
        const deadline = Date.now() + 5000;
        const ready = () => {
          const document = site.contentDocument;
          if (document?.documentElement.lang === language && document.querySelector(route === '/' ?
            '.section-document-embed .document-accordion' : '.document-page.document-accordion')) return resolve();
          if (Date.now() > deadline) return reject(new Error('Deployment options did not load'));
          setTimeout(ready, 16);
        };
        ready();
      });
      const document = site.contentDocument;
      const rows = [...document.querySelectorAll('.accordion-row')];
      assert(rows.length === 5, 'A deployment option is missing');
      assert(rows[1].open && !rows[0].open, `${language} ${route}: deployment chapter link did not open its row (${rows.map((row) => row.open)})`);
      const standalone = route === '/get-started';
      assert(document.querySelector('.page-sidebar').hidden === standalone &&
        document.querySelector('.section-menu-toggle').hidden === standalone, 'The wrong chapter menu is shown');
      const snapshot = rows.map((row) => ({
        id: row.querySelector('summary [id]').id,
        title: row.querySelector('summary').textContent.trim(),
        icon: row.querySelector('img').getAttribute('src'),
        code: [...row.querySelectorAll('pre code')].map((code) => code.textContent),
        links: [...row.querySelectorAll('.accordion-body a')].map((link) => [link.textContent, link.getAttribute('href')]),
      }));
      if (standalone) expected = JSON.stringify(snapshot);
      else {
        assert(JSON.stringify(snapshot) === expected, 'Homepage deployment content differs from Get Started');
        assert(document.querySelectorAll('h1').length === 1 && rows.every((row) => row.querySelector('summary > h3')),
          'Embedded heading levels do not fit the homepage');
        assert(document.querySelector('.section-footer a'), 'Embedding removed the homepage footer');
      }
      for (const width of [1280, 760, 390, 320]) {
        site.style.width = `${width}px`;
        site.style.height = '1000px';
        for (const row of rows) {
          if (!row.open) row.querySelector('summary').click();
          assert(rows.filter((item) => item.open).length === 1, 'More than one deployment row is open');
          assert(document.documentElement.scrollWidth <= width + 1, `${language} deployment options overflow at ${width}px`);
          const icon = row.querySelector('img').getBoundingClientRect();
          assert(icon.width === 64, 'Deployment icon is not 64px');
          for (const action of row.querySelectorAll('.accordion-body a')) {
            const rect = action.getBoundingClientRect();
            assert(rect.left >= 0 && rect.right <= width + 1, `${language} action is clipped at ${width}px`);
          }
          for (const pre of row.querySelectorAll('pre')) assert(pre.querySelectorAll('.copy-button').length === 1,
            'An embedded command has missing or duplicate copy controls');
        }
      }
    }
  }
});

await check('Feature catalogs keep translations, chapter navigation, and the shared header responsive', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/features`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement.lang === language && document.querySelector('.document-catalog')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Feature catalog did not load'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const frame = site.contentWindow;
    const document = site.contentDocument;
    const features = [...document.querySelectorAll('.catalog-feature')];
    assert(features.length === 21 && new Set(features.map((feature) => feature.querySelector('img').src)).size === 21,
      'A feature or distinct icon is missing');
    const links = [...document.querySelectorAll('#section-links a')];
    assert(links.length === 4 && links[0].hash.endsWith('id=architecture') &&
      links[1].hash.endsWith('id=storage-internals') && links[2].hash.endsWith('id=database-core') &&
      links[3].hash.endsWith('id=db-server'), 'The feature menu should contain architecture, storage, and the two main groups');
    assert(features.every((feature) => !feature.querySelector('h3').hasAttribute('data-chapter')),
      'Individual features still participate in chapter navigation');
    assert(!document.querySelector('.catalog-feature pre'), 'The feature catalog still shows code examples');
    assert(document.querySelector('.header-links [aria-current="page"]').getAttribute('href').endsWith('#/features'),
      'Features navigation is not active');
    assert(document.querySelectorAll('.header-links a').length === 3 &&
      !document.querySelector('.header-links a[href$="#/get-started"]'), 'Get Started is still in the top bar');
    const storage = document.getElementById('storage-internals').closest('.document-illustration');
    const architecture = document.getElementById('architecture').closest('.document-illustration');
    assert(architecture.classList.contains('document-illustration-wide') && architecture.nextElementSibling === storage,
      'The architecture diagram is not the first illustrated chapter');
    const objectDiagram = architecture.querySelector('.objy-architecture');
    assert(objectDiagram && objectDiagram.querySelectorAll('defs .object-snippet').length === 3,
      'The original architecture diagram was not moved to Features');
    assert(objectDiagram.querySelector('[data-copy="architecture-diagram.query"]').textContent ===
      (language === 'en' ? 'Query' : 'Abfragen'), 'The architecture diagram is not translated');
    assert(storage.querySelector('h2').id === 'storage-internals' &&
      storage.nextElementSibling.matches('.catalog-section'), 'Storage internals is not above the feature catalog');
    assert(storage.querySelectorAll('.document-illustration-copy li').length === 3 &&
      storage.querySelector('blockquote').textContent.toLowerCase().includes('optional'),
      'The restored storage explanation lost a tier or its optional durability note');
    const diagram = storage.querySelector('.document-art svg');
    assert(diagram?.getAttribute('viewBox') === '0 0 660 740', 'The original storage illustration was not restored');
    assert(diagram.querySelector('[data-copy="storage-diagram.hot"]').textContent ===
      (language === 'en' ? 'Hot fields' : 'Heiße Felder'), 'The storage illustration was not translated');
    assert(diagram.querySelector('[data-copy="storage-diagram.durability"]').textContent.toLowerCase().includes('optional'),
      'The diagram no longer identifies S3 durability as optional');
    for (const width of [1920, 1280, 1101, 1100, 1001, 1000, 900, 761, 760, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '900px';
      await new Promise((resolve) => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
      const viewport = document.documentElement.clientWidth;
      const article = document.querySelector('.document-catalog').getBoundingClientRect();
      assert(document.documentElement.scrollWidth <= viewport + 1, `${language} catalog overflows at ${width}px`);
      assert(Math.abs(article.left + article.width / 2 - viewport / 2) <= 1,
        `${language} catalog is not centered at ${width}px`);
      const architectureBox = objectDiagram.getBoundingClientRect();
      const phone = width <= 640;
      const layout = objectDiagram.querySelector(phone ? '.architecture-compact' : '.architecture-wide');
      assert(frame.getComputedStyle(layout).display !== 'none' &&
        layout.querySelectorAll('.object-stack > use').length === 3, 'The architecture objects are missing from the visible layout');
      assert(Math.abs(architectureBox.height / architectureBox.width - (phone ? 700 / 360 : 680 / 1000)) < .01 &&
        architectureBox.left >= article.left - 1 && architectureBox.right <= article.right + 1,
        'The moved architecture diagram is stretched or clipped');
      for (const label of layout.querySelectorAll('text')) {
        const rect = label.getBoundingClientRect();
        assert(rect.left >= architectureBox.left - 1 && rect.right <= architectureBox.right + 1,
          'An architecture label is clipped');
      }
      const copy = storage.querySelector('.document-illustration-copy').getBoundingClientRect();
      const art = storage.querySelector('.document-art').getBoundingClientRect();
      assert(art.left >= article.left - 1 && art.right <= article.right + 1 &&
        Math.abs(art.height / art.width - 740 / 660) < .01, 'The storage illustration is clipped or distorted');
      if (article.width <= 760) assert(art.top >= copy.bottom, 'Mobile storage text and graphic overlap');
      else assert(art.left >= copy.right, 'Desktop storage text and graphic overlap');
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
    await new Promise((resolve) => frame.addEventListener('hashchange', resolve, { once: true }));
    assert(document.getElementById('s3-durability')?.closest('.catalog-feature'), 'Individual feature anchor disappeared');
    const target = links.find((link) => link.hash.endsWith('id=db-server'));
    const changed = new Promise((resolve) => frame.addEventListener('hashchange', resolve, { once: true }));
    target.click();
    await changed;
    assert(frame.location.hash.endsWith('id=db-server'), 'Feature group link did not navigate');
  }
});

await check('The restored homepage hero stays large, translated, and centered on desktop and phones', async () => {
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
    assert(diagram.getAttribute('viewBox') === '0 0 720 480' && !document.querySelector('.objy-architecture'),
      'The previous hero was not restored or the architecture remains on the homepage');
    assert(document.querySelectorAll('#section-links a').length === 3, 'Homepage chapter links were not updated');
    for (const width of [1440, 1280, 761, 641, 640, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '900px';
      await new Promise((resolve) => frame.requestAnimationFrame(() => frame.requestAnimationFrame(resolve)));
      const box = diagram.getBoundingClientRect();
      assert(box.width > 250 && Math.abs(box.height / box.width - 480 / 720) < .01, 'Hero artwork is stretched or too small');
      assert(document.documentElement.scrollWidth <= width + 1, `${language} homepage overflows at ${width}px`);
      const overview = document.querySelector('.section-icon-cards');
      const available = overview.getBoundingClientRect().width;
      const columns = available <= 480 ? 1 : available <= 760 ? 2 : 4;
      const group = overview.querySelector('.section-options');
      assert(frame.getComputedStyle(group).gridTemplateColumns.split(' ').length === columns,
        `Wrong use-case column count at ${width}px`);
      const cases = [...group.children];
      for (const [index, card] of cases.entries()) {
        const rect = card.getBoundingClientRect();
        const icon = card.querySelector('img').getBoundingClientRect();
        assert(rect.width > 145 && rect.left >= 0 && rect.right <= width, 'A use-case column is clipped');
        assert(Math.abs(icon.left + icon.width / 2 - rect.left - rect.width / 2) <= 1, 'A use-case icon is not centered');
        if (index < columns) assert(Math.abs(rect.top - cases[0].getBoundingClientRect().top) <= 1,
          'The use cases do not share a row');
      }
      for (const label of diagram.querySelectorAll('text')) {
        const rect = label.getBoundingClientRect();
        assert(rect.left >= box.left - 1 && rect.right <= box.right + 1,
          `${language} hero label is clipped at ${width}px: ${label.textContent}`);
      }
    }
  }
});

site.remove();
document.getElementById('status').textContent =
  `${results.children.length - failures} passed, ${failures} failed`;
