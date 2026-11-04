import { htmlFragment } from './markup.mjs';

const illustrationCache = new Map();
let illustrationSequence = 0;

function symbolIllustration(svg, name) {
  const definitions = new Map([...svg.querySelectorAll('[id]')].map(node => [node.id, node]));
  const symbol = definitions.get(name);
  if (symbol?.tagName.toLowerCase() !== 'symbol') return null;
  const [x, y, width, height] = symbol.getAttribute('viewBox').split(/\s+/).map(Number);
  const result = svg.cloneNode(false);
  result.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  result.style.aspectRatio = `${width} / ${height}`;
  const namespace = 'http://www.w3.org/2000/svg';
  const defs = document.createElementNS(namespace, 'defs');
  const included = new Set();
  const include = id => {
    const node = definitions.get(id);
    if (!node || included.has(id)) return;
    included.add(id);
    defs.append(node.cloneNode(true));
    for (const element of [node, ...node.querySelectorAll('*')]) {
      for (const attribute of element.attributes) {
        if (attribute.localName === 'href' && attribute.value.startsWith('#')) include(attribute.value.slice(1));
        for (const reference of attribute.value.matchAll(/url\(#([^)]+)\)/g)) include(reference[1]);
      }
    }
  };
  include(name);
  const use = document.createElementNS(namespace, 'use');
  for (const [key, value] of Object.entries({ href: `#${name}`, x, y, width, height })) use.setAttribute(key, value);
  result.append(defs, use);
  // Separate fragments from one source must not introduce duplicate document IDs.
  const suffix = `-illustration-${++illustrationSequence}`;
  for (const node of result.querySelectorAll('[id]')) node.id += suffix;
  for (const node of result.querySelectorAll('*')) {
    for (const attribute of [...node.attributes]) {
      let value = attribute.value.replace(/url\(#([^)]+)\)/g, (_, id) => `url(#${id}${suffix})`);
      if (attribute.localName === 'href' && value.startsWith('#')) value += suffix;
      if (value !== attribute.value) node.setAttributeNS(attribute.namespaceURI, attribute.name, value);
    }
  }
  return result.outerHTML;
}

// Inline only same-origin SVGs referenced by illustrated Markdown sections.
async function inlineIllustration(source) {
  const url = new URL(source, location.href);
  if (url.origin !== location.origin || !url.pathname.endsWith('.svg')) return null;
  const symbol = url.hash.slice(1);
  url.hash = '';
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
  const artwork = await illustrationCache.get(url.href);
  return artwork && symbol ? symbolIllustration(htmlFragment(artwork).querySelector('svg'), symbol) : artwork;
}

export async function createIllustration(image, className) {
  const figure = document.createElement('figure');
  figure.className = className;
  const artwork = await inlineIllustration(image.src);
  if (artwork) {
    figure.setAttribute('role', 'img');
    figure.setAttribute('aria-label', image.alt);
    figure.innerHTML = artwork;
    figure.querySelector('svg').setAttribute('aria-hidden', 'true');
  } else {
    image.fetchPriority = className === 'hero-art' ? 'high' : 'auto';
    figure.append(image);
  }
  return figure;
}

export async function inlineDocumentIllustrations(html) {
  const template = document.createElement('template');
  template.innerHTML = html;
  const images = [...template.content.querySelectorAll('.document-art > img')];
  if (!images.length) return html;
  await Promise.all(images.map(async (image) => {
    const original = image.parentElement;
    const figure = await createIllustration(image, 'document-art');
    original.replaceWith(figure);
  }));
  return template.innerHTML;
}
