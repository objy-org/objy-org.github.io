import { htmlFragment } from './markup.mjs';
import { decorateExample } from './examples.mjs';
import { decorateDocument } from './documents.mjs';

const illustrationCache = new Map();

// Discover artwork from Markdown; document pages never load homepage illustrations.
async function inlineIllustration(source) {
  const url = new URL(source, location.href);
  if (url.origin !== location.origin || !url.pathname.endsWith('.svg')) return null;
  if (!illustrationCache.has(url.href)) {
    illustrationCache.set(
      url.href,
      fetch(url)
        .then(async (response) => {
          if (!response.ok) throw new Error(`Illustration: ${response.status} ${url.pathname}`);
          const fragment = htmlFragment(await response.text());
          return fragment.querySelector('svg')?.outerHTML || null;
        })
        .catch((error) => {
          illustrationCache.delete(url.href); // A later visit can retry; the normal image still renders.
          console.warn(error);
          return null;
        }),
    );
  }
  return illustrationCache.get(url.href);
}

async function embedDocument(section, body, loadDocument) {
  const link = body.querySelector(':scope > p > a[title="embed"]:only-child');
  if (!link || !loadDocument) return false;
  const html = await loadDocument(link.getAttribute('href'));
  if (!html) return false; // The original link remains available if loading fails.
  const article = htmlFragment(decorateDocument(html)).querySelector('.document-page');
  article.querySelector(':scope > h1')?.remove();
  // Embedded chapters sit beneath the homepage section's H2.
  for (const heading of [...article.querySelectorAll('h2, h3, h4, h5')]) {
    const nested = document.createElement(`h${Number(heading.tagName.slice(1)) + 1}`);
    for (const attribute of heading.attributes) nested.setAttribute(attribute.name, attribute.value);
    nested.append(...heading.childNodes);
    heading.replaceWith(nested);
  }
  const embedded = document.createElement('div');
  embedded.classList.add('embedded-document', ...[...article.classList].filter((name) => name !== 'document-page'));
  embedded.append(...article.childNodes);
  link.parentElement.replaceWith(embedded);
  section.classList.add('section-document-embed');
  return true;
}

async function decorateSection(section, options) {
  const body = section.querySelector('.markdown-body');
  const heading = body.querySelector('h1, h2');
  section.setAttribute('aria-labelledby', heading.id);
  // An ordinary Markdown quote immediately after a heading is its small label.
  const quote = heading.nextElementSibling;
  if (quote?.tagName === 'BLOCKQUOTE') {
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = quote.textContent.trim();
    section.querySelector('.section-copy').prepend(eyebrow);
    quote.remove();
  }
  const embedded = await embedDocument(section, body, options.loadDocument);
  // A standalone Markdown image becomes the section's explanatory artwork.
  const image = body.querySelector(':scope > p > img:only-child');
  if (image) {
    const paragraph = image.parentElement;
    const figure = document.createElement('figure');
    const isHero = heading.id === 'top';
    figure.className = isHero ? 'hero-art' : 'section-art';
    const artwork = await inlineIllustration(image.src);
    if (artwork) {
      figure.setAttribute('role', 'img');
      figure.setAttribute('aria-label', image.alt);
      figure.innerHTML = artwork;
      figure.querySelector('svg').setAttribute('aria-hidden', 'true');
    } else {
      image.fetchPriority = isHero ? 'high' : 'auto';
      figure.append(image);
    }
    paragraph.remove();
    section.append(figure);
    if (!isHero) section.classList.add('section-illustrated');
  }
  const example = !image && heading.tagName !== 'H1' && decorateExample(section);
  if (!example && heading.tagName !== 'H1' && !image && body.querySelector(':scope > h3')) {
    section.classList.add('section-cards');
    // Each Markdown subheading groups its explanation and links into one option.
    const options = document.createElement('div');
    options.className = 'section-options';
    let option;
    for (const node of [...body.childNodes]) {
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H3') {
        option = document.createElement('div');
        option.className = 'section-option';
        option.setAttribute('role', 'group');
        option.setAttribute('aria-labelledby', node.id);
        const icon = node.querySelector('img');
        if (icon && node.querySelectorAll('img').length === 1) {
          icon.alt = '';
          icon.width = icon.height = 72;
          icon.loading = 'lazy';
          option.append(icon);
        }
        options.append(option);
      }
      if (option) option.append(node);
    }
    if (options.children.length) {
      options.style.setProperty('--option-columns', Math.min(4, options.children.length));
      section.classList.toggle('section-icon-cards',
        [...options.children].every((option) => option.firstElementChild.tagName === 'IMG'));
      body.append(options);
    }
  }
  const actions = [...body.querySelectorAll(':scope > ul')].filter((list) =>
    [...list.children].every((item) =>
      item.children.length === 1 &&
      item.firstElementChild.tagName === 'A' &&
      item.textContent.trim() === item.firstElementChild.textContent.trim(),
    ),
  );
  if (heading.tagName === 'H1' || (!image && !example && !body.querySelector(':scope > h3'))) {
    actions.forEach((list) => list.classList.add('section-actions'));
    if (heading.tagName !== 'H1' && actions.length) section.classList.add('section-callout');
  }
  const rule = body.querySelector(':scope > hr');
  if ((section.classList.contains('section-callout') || embedded) && rule) {
    const footer = document.createElement('footer');
    footer.className = 'section-footer';
    while (rule.nextSibling) footer.append(rule.nextSibling);
    rule.replaceWith(footer);
  }
}

export async function decorateHomepage(html, options = {}) {
  const template = htmlFragment(html);
  const sections = [];
  let current;
  const ids = new Set();
  for (const node of [...template.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && node.matches('h1, h2')) {
      if (ids.has(node.id)) throw new Error(`home.md: duplicate heading ID "${node.id}".`);
      ids.add(node.id);
      current = document.createElement('section');
      current.dataset.section = node.id;
      current.className = `page-section${node.id === 'top' ? ' section-hero' : ''}`;
      current.innerHTML = '<div class="section-copy"><div class="markdown-body"></div></div>';
      sections.push(current);
    }
    if (current) current.querySelector('.markdown-body').append(node);
  }
  if (sections[0]?.dataset.section !== 'top')
    throw new Error('home.md: keep the # headline with :id=top first.');
  await Promise.all(sections.map((section) => decorateSection(section, options)));
  const [hero, ...details] = sections;
  // A closing link-only paragraph follows the hero artwork, keeping its copy and
  // destination editable in Markdown without turning it into a large CTA.
  const footer = hero.querySelector('.markdown-body > p:last-child');
  const more = footer?.children.length === 1 && footer.firstElementChild.tagName === 'A' &&
    footer.textContent.trim() === footer.firstElementChild.textContent.trim() ? footer : null;
  if (more) {
    more.classList.add('feature-more');
    more.remove();
  }
  details.forEach((section) => section.classList.add('detail-section'));
  details
    .filter((section) => section.classList.contains('section-illustrated'))
    .forEach((section, index) => {
      section.classList.toggle('art-first', index % 2 === 1);
    });
  return `<div class="sections-root">${hero.outerHTML}${more?.outerHTML || ''}${details.map((section) => section.outerHTML).join('')}</div>`;
}
