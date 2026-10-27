// No test framework or package installation: run this page through the local HTTP server.
import { createCopy, htmlFragment, sanitizeMarkup } from '../assets/site/markup.mjs';
import { decorateHomepage } from '../assets/site/homepage.mjs';
import { wireExamples } from '../assets/site/examples.mjs';

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

await check('Markdown examples switch tabs, follow references, and support keyboard navigation', async () => {
  const markup = '<h1 id="top">Hello</h1><h2 id="a">A</h2><h2 id="b">B</h2><h2 id="c">C</h2>' +
    '<h2 id="demo">Example</h2><p>Introduction</p><h4 id="first">First item</h4><blockquote><p>items / first</p></blockquote>' +
    '<pre><code class="lang-json">{"_id":"first","literal":"&lt;tag&gt;"}</code></pre>' +
    '<h3 id="inspect">Inspect</h3><p>Inspect this record.</p><p><a href="#/?id=related">Related</a></p>' +
    '<h4 id="related">Related record</h4><p>Connected data.</p><blockquote><p>people / second</p></blockquote>' +
    '<pre><code class="lang-json">{"_id":"second"}</code></pre><p><a href="#/?id=inspect">Back</a></p>' +
    '<h3 id="find">Find</h3><p>Query description.</p><pre><code class="lang-js">await items.find({});</code></pre>' +
    '<h3 id="tune">Tune</h3><p>Storage configuration.</p><blockquote><p>items / meta</p></blockquote>' +
    '<pre><code class="lang-json">{"indexes":["kind"],"columns":["amount"],"tiering":{"mode":"compressedMemory","offload":["notes"],"minBytes":4096}}</code></pre>';
  const fixture = document.createElement('div');
  fixture.append(htmlFragment(await decorateHomepage(markup)));
  document.body.append(fixture);
  const controller = new AbortController();
  try {
    wireExamples(controller.signal, fixture);
    const code = fixture.querySelector('.example-code > pre code');
    const tabs = [...fixture.querySelectorAll('[data-example-tab]')];
    const records = [...fixture.querySelectorAll('[data-example-record]')];
    const active = () => tabs.find((tab) => tab.getAttribute('aria-selected') === 'true');
    assert(JSON.parse(code.textContent).literal === '<tag>', 'Literal JSON changed');
    assert(records.map((tab) => tab.textContent).join(',') === 'First item,Related record', 'Object tabs did not use Markdown labels');
    assert(records[0].getAttribute('aria-selected') === 'true', 'Default object tab was not selected');
    records[1].click();
    assert(JSON.parse(code.textContent)._id === 'second', 'Object tab did not display the connected object');
    assert(!fixture.querySelector('#example-panel-related').hidden, 'Object tab did not update the explanation');
    assert(fixture.querySelector('.example-code').getAttribute('aria-labelledby') === records[1].id, 'Code panel did not identify its selected object tab');
    records[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    assert(JSON.parse(code.textContent)._id === 'first', 'Object tab keyboard navigation did not wrap');
    tabs[1].click();
    assert(active().textContent === 'Find', 'Tab did not change');
    assert(!fixture.querySelector('#example-panel-find').hidden, 'Query panel remained hidden');
    tabs[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    assert(active().textContent === 'Tune', 'Keyboard tab navigation failed');
    assert(JSON.parse(code.textContent).columns[0] === 'amount', 'Tab did not display its metadata');
    assert(fixture.querySelector('.example-source-label').textContent === 'items / meta', 'Metadata label did not change');
    tabs[0].click();
    assert(JSON.parse(code.textContent)._id === 'first', 'Object tab did not restore its sample after metadata');
    fixture.querySelector('a[href="#/?id=related"]').click();
    assert(JSON.parse(code.textContent)._id === 'second', 'Reference did not update the visible object');
    assert(fixture.querySelector('.example-source-label').textContent === 'people / second', 'Source label did not change');
    assert(records[1].getAttribute('aria-selected') === 'true', 'Reference did not select its object tab');
    assert(active().getAttribute('aria-controls') === 'example-panel-related', 'Selected tab does not identify its visible panel');
    fixture.querySelector('a[href="#/?id=inspect"]').click();
    assert(JSON.parse(code.textContent)._id === 'first', 'Back link did not restore the original object');
    assert(!code.querySelector('tag'), 'Example content became HTML');
    controller.abort();
    tabs[1].click();
    assert(active().textContent === 'Inspect', 'Example listeners survived cleanup');
  } finally {
    controller.abort();
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

site.remove();
document.getElementById('status').textContent =
  `${results.children.length - failures} passed, ${failures} failed`;
