import DOMPurify from '../vendor/purify.mjs';

export function htmlFragment(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}

export function readMarkdown(markdown) {
  // Editorial tables and menus use a plain renderer, independent of the active page.
  return htmlFragment(marked(markdown, { renderer: new marked.Renderer() }));
}

export function sanitizeMarkup(html) {
  // Remote routes accept public Markdown. Keep useful HTML, never executable markup
  // or data attributes that could impersonate the site's own translation bindings.
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form'],
    ALLOW_DATA_ATTR: false,
  });
}

const slug = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function readLabels(markdown) {
  const values = Object.create(null);
  let group = '';
  for (const element of readMarkdown(markdown).children) {
    if (element.tagName === 'H2') group = slug(element.textContent);
    if (element.tagName !== 'TABLE' || !group) continue;
    for (const row of element.querySelectorAll('tbody tr')) {
      if (row.cells.length !== 2) throw new Error(`labels.md: "${group}" needs two columns.`);
      const key = `${group}.${slug(row.cells[0].textContent)}`;
      if (Object.hasOwn(values, key)) throw new Error(`labels.md: duplicate label "${key}".`);
      values[key] = row.cells[1].innerHTML;
    }
  }
  return values;
}

export function createCopy(markdownFiles) {
  const labels = Object.assign(Object.create(null), ...markdownFiles.map(readLabels));
  const fragment = (key) => {
    if (!Object.hasOwn(labels, key)) throw new Error(`labels.md: missing "${key}".`);
    return htmlFragment(labels[key]);
  };
  const copy = (key) => fragment(key).textContent;
  const bindCopy = (root = document) => {
    root.querySelectorAll('[data-copy]').forEach((element) => {
      element.textContent = copy(element.dataset.copy);
    });
    root.querySelectorAll('[data-copy-aria]').forEach((element) => {
      element.setAttribute('aria-label', copy(element.dataset.copyAria));
    });
    root.querySelectorAll('[data-copy-link]').forEach((element) => {
      const key = element.dataset.copyLink;
      const links = fragment(key).querySelectorAll('a');
      if (links.length !== 1) throw new Error(`labels.md: "${key}" needs one Markdown link.`);
      element.href = links[0].getAttribute('href');
      element.textContent = links[0].textContent;
    });
    document.title = copy('site.page-title');
    document.querySelector('meta[name="description"]').content = copy('site.page-description');
    document.querySelector('meta[property="og:title"]').content = copy('site.page-title');
    document.querySelector('meta[property="og:description"]').content = copy('site.page-description');
    document
      .querySelector('[role="progressbar"]')
      ?.setAttribute('aria-label', copy('controls.loading-label'));
  };
  return { copy, bindCopy };
}
