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
    'Database,Server,REST API,JavaScript client', 'Directory order changed');
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
  const features = ['one', 'two', 'three', 'four']
    .map((name) => `<h2 id="${name}">${name}</h2>${image}`)
    .join('');
  const markup =
    '<h1 id="top">Hello</h1>' + features +
    '<h2 id="details">Details</h2><p>More to explore.</p>' +
    '<h2 id="first-detail">First detail</h2>' +
    image +
    '<h2 id="second-detail">Second detail</h2>' +
    image +
    '<h2 id="choices">Choices</h2><h3 id="small">Small</h3><p>First choice</p><h3 id="large">Large</h3><p>Second choice</p>';
  const content = htmlFragment(await decorateHomepage(markup));
  assert(content.querySelectorAll('.feature-grid > section').length === 4, 'Feature count was hard-coded');
  assert(content.querySelector('.feature-grid').style.getPropertyValue('--feature-columns') === '2', 'Features did not use the two-column layout');
  assert(
    content.querySelector('.art-first')?.dataset.section === 'second-detail',
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

await check('Copy uses the selected object and survives same-page navigation', async () => {
  const frame = site.contentWindow;
  let copied;
  const originalClipboard = Object.getOwnPropertyDescriptor(frame.navigator, 'clipboard');
  Object.defineProperty(frame.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: async (text) => { copied = text; } },
  });
  const navigate = async (hash) => {
    const changed = new Promise((resolve) => frame.addEventListener('hashchange', resolve, { once: true }));
    frame.location.hash = hash;
    await changed;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document.querySelector('.example-code .copy-button')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Object examples did not load'));
        frame.requestAnimationFrame(ready);
      };
      frame.requestAnimationFrame(ready);
    });
  };
  try {
    await navigate('#/?id=object-capabilities');
    const document = site.contentDocument;
    const tabs = document.querySelectorAll('[data-example-tab]');
    assert(document.querySelector('.example-code .token.property'), 'Initial JSON example was not highlighted');
    tabs[3].click();
    assert(document.querySelector('.example-code .token.keyword'), 'Switching to JavaScript lost highlighting');
    tabs[1].click();
    document.querySelector('.example-code .copy-button').click();
    assert(JSON.parse(copied)._id === 'memory-01', 'Copy did not use the selected object');
    await navigate('#/?id=storage-internals');
    site.contentDocument.querySelector('[data-example-tab]').click();
    copied = null;
    site.contentDocument.querySelector('.example-code .copy-button').click();
    assert(JSON.parse(copied)?._id === 'drone-01', 'Copy stopped working after a section jump');
    assert(site.contentDocument.querySelectorAll('.example-code .copy-button').length === 1, 'Copy controls were duplicated');
  } finally {
    if (originalClipboard) Object.defineProperty(frame.navigator, 'clipboard', originalClipboard);
    else delete frame.navigator.clipboard;
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

await check('Deployment rows preserve both translations, chapter links, and mobile layouts', async () => {
  for (const language of ['en', 'de']) {
    site.src = `../?lang=${language}#/get-started?id=deploy-cluster`;
    await new Promise((resolve, reject) => {
      const deadline = Date.now() + 5000;
      const ready = () => {
        const document = site.contentDocument;
        if (document?.documentElement.lang === language && document.querySelector('.document-accordion')) return resolve();
        if (Date.now() > deadline) return reject(new Error('Deployment page did not load'));
        setTimeout(ready, 16);
      };
      ready();
    });
    const document = site.contentDocument;
    const rows = [...document.querySelectorAll('.accordion-row')];
    assert(document.documentElement.lang === language && rows.length === 4, 'Wrong translation or missing deployment row');
    assert(rows[1].open && !rows[0].open, 'Deployment chapter link did not open its row');
    assert(document.querySelector('.page-sidebar').hidden && document.querySelector('.section-menu-toggle').hidden,
      'Deployment accordion still shows a chapter menu');
    for (const width of [1280, 760, 390, 320]) {
      site.style.width = `${width}px`;
      site.style.height = '1000px';
      for (const row of rows) {
        if (!row.open) row.querySelector('summary').click();
        assert(rows.filter((item) => item.open).length === 1, 'More than one deployment row is open');
        assert(document.documentElement.scrollWidth <= width + 1, `${language} deployment page overflows at ${width}px`);
        const icon = row.querySelector('img').getBoundingClientRect();
        assert(icon.width === 64, 'Deployment icon is not 64px');
        for (const action of row.querySelectorAll('.accordion-body a')) {
          const rect = action.getBoundingClientRect();
          assert(rect.left >= 0 && rect.right <= width + 1, `${language} action is clipped at ${width}px`);
        }
      }
    }
  }
});

site.remove();
document.getElementById('status').textContent =
  `${results.children.length - failures} passed, ${failures} failed`;
