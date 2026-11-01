import { htmlFragment } from './markup.mjs';
import { decorateExample } from './examples.mjs';
import { createIllustration } from './illustrations.mjs';

function isLinkParagraph(node) {
  return node?.tagName === 'P' && node.children.length === 1 && node.firstElementChild.tagName === 'A' &&
    node.textContent.trim() === node.firstElementChild.textContent.trim();
}

function decorateFooter(section, body) {
  const rule = body.querySelector(':scope > hr');
  if (!rule) return;
  const footer = document.createElement('footer');
  footer.className = 'section-footer';
  while (rule.nextSibling) footer.append(rule.nextSibling);
  rule.replaceWith(footer);
  if (section.classList.contains('section-cards')) section.append(footer);
}

async function decorateSection(section) {
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
  // Icon-led Markdown lists give the hero a compact row of product highlights.
  if (heading.tagName === 'H1') {
    for (const list of body.querySelectorAll(':scope > ul')) {
      if (![...list.children].every((item) => item.children.length === 1 &&
        item.firstElementChild.tagName === 'IMG' && item.textContent.trim())) continue;
      list.classList.add('hero-highlights');
      list.setAttribute('role', 'list');
      list.style.setProperty('--highlight-columns', Math.min(4, list.children.length));
      list.style.setProperty('--highlight-compact-columns', Math.min(2, list.children.length));
      for (const icon of list.querySelectorAll('img')) {
        icon.alt = '';
        icon.width = icon.height = 32;
      }
    }
  }
  // A standalone Markdown image becomes the section's explanatory artwork.
  const image = body.querySelector(':scope > p > img:only-child');
  if (image) {
    const paragraph = image.parentElement;
    const isHero = heading.id === 'top';
    const figure = await createIllustration(image, isHero ? 'hero-art' : 'section-art');
    paragraph.remove();
    section.append(figure);
    if (!isHero) section.classList.add('section-illustrated');
  }
  const example = !image && heading.tagName !== 'H1' && decorateExample(section);
  if (!example && heading.tagName !== 'H1' && !image && body.querySelector(':scope > h3')) {
    section.classList.add('section-cards');
    decorateFooter(section, body);
    const more = body.lastElementChild;
    if (isLinkParagraph(more)) {
      more.classList.add('feature-more');
      more.remove();
    }
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
      if (more.classList.contains('feature-more')) body.append(more);
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
  if (section.classList.contains('section-callout')) decorateFooter(section, body);
}

export async function decorateHomepage(html) {
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
  await Promise.all(sections.map((section) => decorateSection(section)));
  const [hero, ...details] = sections;
  // A closing link-only paragraph follows the hero artwork, keeping its copy and
  // destination editable in Markdown without turning it into a large CTA.
  const footer = hero.querySelector('.markdown-body > p:last-child');
  const more = isLinkParagraph(footer) ? footer : null;
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
