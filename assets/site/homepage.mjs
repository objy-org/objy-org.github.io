import { htmlFragment } from './markup.mjs';

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
    if (isHero) section.prepend(figure);
    else section.append(figure);
    if (!isHero) section.classList.add('section-illustrated');
  }
  if (heading.tagName !== 'H1' && !image && body.querySelector(':scope > h3')) {
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
        options.append(option);
      }
      if (option) option.append(node);
    }
    if (options.children.length) body.append(options);
  }
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
  await Promise.all(sections.map(decorateSection));
  const [hero, ...content] = sections;
  // The hero leads directly into three feature columns and later detail sections.
  const features = content.slice(0, 3);
  const details = content.slice(3);
  details.forEach((section) => section.classList.add('detail-section'));
  details
    .filter((section) => section.classList.contains('section-illustrated'))
    .forEach((section, index) => {
      section.classList.toggle('art-first', index % 2 === 1);
    });
  const featureGrid = features.length
    ? `<div class="feature-grid">${features.map((section) => section.outerHTML).join('')}</div>`
    : '';
  return `<div class="sections-root">${hero.outerHTML}${featureGrid}${details.map((section) => section.outerHTML).join('')}</div>`;
}

export function wireFeatureConnections(signal) {
  const grid = document.querySelector('.feature-grid');
  if (!grid) return;
  const [left, objects, right] = [...grid.querySelectorAll(':scope > .page-section')].map((section) =>
    section.querySelector('.section-art'),
  );
  if (!objects || !left || !right) return;
  const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  overlay.classList.add('feature-connections');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.setAttribute('focusable', 'false');
  const connections = [
    { source: left, from: 'right', to: 'left', name: 'left' },
    { source: right, from: 'left', to: 'right', name: 'right' },
  ];
  overlay.innerHTML = connections
    .map(
      ({ name }) =>
        `<g class="feature-connection-${name}"><path class="connection-curve"/><path class="connection-tip"/></g>`,
    )
    .join('');
  grid.append(overlay);

  // Artwork edges locate the open gaps; arrows stay clear of the illustrations.
  const port = (figure, side, origin) => {
    const svg = figure.querySelector('svg');
    const bounds = (svg || figure).getBoundingClientRect();
    const coordinates = svg?.getAttribute(`data-connection-${side}`)?.trim().split(/\s+/).map(Number);
    const viewBox = svg?.viewBox.baseVal;
    if (
      coordinates?.length === 2 &&
      coordinates.every(Number.isFinite) &&
      viewBox?.width > 0 &&
      viewBox.height > 0
    ) {
      return {
        x: bounds.left - origin.left + ((coordinates[0] - viewBox.x) / viewBox.width) * bounds.width,
        y: bounds.top - origin.top + ((coordinates[1] - viewBox.y) / viewBox.height) * bounds.height,
      };
    }
    return {
      x: (side === 'left' ? bounds.left : bounds.right) - origin.left,
      y: bounds.top + bounds.height / 2 - origin.top,
    };
  };
  const draw = () => {
    const bounds = overlay.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    overlay.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    connections.forEach(({ source, from, to }, index) => {
      const edge = port(source, from, bounds);
      const target = port(objects, to, bounds);
      const direction = Math.sign(target.x - edge.x);
      const length = Math.min(112, Math.max(0, Math.abs(target.x - edge.x) - 32));
      const middle = (edge.x + target.x) / 2;
      const start = { x: middle - (direction * length) / 2, y: edge.y };
      const end = { x: middle + (direction * length) / 2, y: target.y };
      const bend = (index ? 1 : -1) * Math.min(30, length * 0.34);
      const control = { x: end.x - direction * length * 0.28, y: end.y + bend };
      const angle = Math.atan2(end.y - control.y, end.x - control.x);
      const wing = (offset) =>
        `${end.x - 8 * Math.cos(angle + offset)} ${end.y - 8 * Math.sin(angle + offset)}`;
      const group = overlay.children[index];
      group
        .querySelector('.connection-curve')
        .setAttribute(
          'd',
          `M${start.x} ${start.y} C${start.x + direction * length * 0.28} ${start.y + bend} ${control.x} ${control.y} ${end.x} ${end.y}`,
        );
      group
        .querySelector('.connection-tip')
        .setAttribute('d', `M${wing(-0.6)} L${end.x} ${end.y} L${wing(0.6)}`);
    });
  };
  const sizes = new ResizeObserver(draw);
  [grid, objects, left, right].forEach((element) => sizes.observe(element));
  signal.addEventListener(
    'abort',
    () => {
      sizes.disconnect();
      overlay.remove();
    },
    { once: true },
  );
  draw();
}
