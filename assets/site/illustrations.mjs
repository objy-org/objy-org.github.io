import { htmlFragment } from './markup.mjs';

const illustrationCache = new Map();

// Inline only same-origin SVGs referenced by illustrated Markdown sections.
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
