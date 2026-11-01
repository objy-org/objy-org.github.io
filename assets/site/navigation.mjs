import { htmlFragment } from './markup.mjs';

export const routePath = (href) => decodeURI(href.split('#/').pop().split('?')[0])
  .replace(/^\/?/, '/').replace(/\.(?:md|markdown)\/?$/i, '').replace(/\/+$/, '') || '/';

const anchor = (href) => new URLSearchParams(href.split('?')[1] || '').get('id');

function navigationLabel(link, title, source) {
  if (source) {
    const icon = document.createElement('img');
    icon.src = source;
    icon.alt = '';
    icon.width = icon.height = 20;
    link.append(icon);
  }
  const label = document.createElement('span');
  label.textContent = title;
  link.append(label);
}

export function documentChapters(article) {
  const headings = [...article.querySelectorAll(article.matches('.document-catalog') ?
    'h1[id], h2[id]' : 'h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')];
  if (headings[0]?.tagName === 'H1' && headings.length > 1) headings.shift();
  const firstLevel = Math.min(...headings.map(heading => Number(heading.tagName.slice(1))));
  return headings.map(heading => {
    heading.dataset.chapter = heading.id;
    const icons = heading.querySelectorAll('img');
    // An empty-alt Markdown image marks a decorative navigation icon.
    if (icons.length === 1 && icons[0].alt === '') {
      heading.dataset.chapterIcon = icons[0].getAttribute('src');
      icons[0].remove();
    }
    return { id: heading.id, title: heading.textContent.trim(), depth: Number(heading.tagName.slice(1)) - firstLevel,
      icon: heading.dataset.chapterIcon };
  });
}

export function chapterLinks(chapters, route, toURL) {
  const list = document.createElement('ul');
  for (const chapter of chapters) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    navigationLabel(link, chapter.title, chapter.icon);
    if (chapter.icon) link.className = 'chapter-icon-link';
    link.href = toURL(route, { id: chapter.id });
    item.style.setProperty('--chapter-depth', Math.min(3, chapter.depth));
    if (chapter.depth) item.classList.add('subchapter');
    item.append(link);
    list.append(item);
  }
  return list;
}

// The editorial index is the only registry: an H2 and its Markdown destination
// define a guide. External websites and non-Markdown downloads stay out of the tree.
export function documentationIndex(html, resolve) {
  const source = htmlFragment(html);
  const entries = [];
  const seen = new Set();
  for (const heading of [...source.children].filter(node => node.tagName === 'H2')) {
    const content = [];
    for (let node = heading.nextElementSibling; node && !node.matches('h1, h2'); node = node.nextElementSibling)
      content.push(node);
    const destination = content.flatMap(node => [...node.querySelectorAll('a[href]')])
      .find(link => /\.(?:md|markdown)(?:[?#]|$)|^#\//i.test(link.getAttribute('href')));
    if (!destination) continue;
    const href = resolve(destination.getAttribute('href'));
    if (!href.startsWith('#/') || seen.has(href)) continue;
    seen.add(href);
    const icon = heading.querySelector('img');
    entries.push({
      href, key: href, path: routePath(href),
      title: heading.textContent.replace(/\s*:id=\S+\s*$/, '').trim(),
      icon: icon ? resolve(icon.getAttribute('src'), true) : null,
    });
  }
  return entries;
}

export function createDocumentationTree(entries, indexRoute, toURL) {
  const visited = new Map();
  const owners = new Map();
  const expandedChapters = new Map();
  let selected;
  let expanded;
  let previous;

  const chapterTree = (chapters, guide) => {
    const root = { children: [], depth: -1 };
    const stack = [root];
    for (const chapter of chapters) {
      while (stack.length > 1 && stack.at(-1).depth >= chapter.depth) stack.pop();
      const node = { ...chapter, children: [] };
      stack.at(-1).children.push(node);
      stack.push(node);
    }
    const listFor = (nodes) => {
      const list = document.createElement('ul');
      for (const node of nodes) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.className = 'documentation-chapter-link';
        navigationLabel(link, node.title, node.icon);
        if (node.icon) link.classList.add('chapter-icon-link');
        link.dataset.chapterId = node.id;
        link.href = toURL(guide.route, { id: node.id });
        if (node.children.length) {
          const details = document.createElement('details');
          details.dataset.chapterKey = `${guide.key}:${node.id}`;
          details.open = expandedChapters.get(details.dataset.chapterKey) || false;
          const summary = document.createElement('summary');
          summary.append(link);
          details.append(summary, listFor(node.children));
          item.append(details);
        } else item.append(link);
        list.append(item);
      }
      return list;
    };
    return listFor(root.children);
  };

  const reveal = (nav) => {
    if (!selected) return;
    const current = anchor(location.hash);
    const branch = [...nav.querySelectorAll('.documentation-branch')]
      .find(node => node.dataset.guideKey === selected.key);
    const link = [...(branch?.querySelectorAll('[data-chapter-id]') || [])]
      .find(node => node.dataset.chapterId === current);
    for (let node = link?.parentElement; node && node !== nav; node = node.parentElement)
      if (node.tagName === 'DETAILS') node.open = true;
  };

  return {
    mount(nav, article, route, page) {
      const path = routePath(route);
      const matches = entries.filter(entry => entry.path === path);
      const key = owners.get(path) || owners.get(page?.file);
      selected = matches.find(entry => anchor(entry.href) === anchor(location.hash)) || matches[0] ||
        entries.find(entry => entry.sources?.includes(page?.file)) ||
        entries.find(entry => entry.key === key);
      if (!selected && path !== routePath(indexRoute)) {
        previous = null;
        return false;
      }
      if (selected) {
        owners.set(path, selected.key);
        if (page?.file) owners.set(page.file, selected.key);
        visited.set(selected.key, { route, chapters: page ? documentChapters(article) : [] });
        if (previous !== selected.key) expanded = selected.key;
      }
      previous = selected?.key;
      const list = document.createElement('ul');
      list.className = 'documentation-tree';
      for (const entry of entries) {
        const item = document.createElement('li');
        const details = document.createElement('details');
        details.className = 'documentation-branch';
        details.dataset.guideKey = entry.key;
        details.name = 'documentation-guides';
        details.open = expanded === entry.key;
        const summary = document.createElement('summary');
        const link = document.createElement('a');
        link.className = 'documentation-guide';
        link.href = entry.href;
        if (selected === entry) link.setAttribute('aria-current', 'page');
        navigationLabel(link, entry.title, entry.icon);
        summary.append(link);
        details.append(summary);
        const guide = visited.get(entry.key);
        if (guide) details.append(chapterTree(guide.chapters, { ...guide, key: entry.key }));
        item.append(details);
        list.append(item);
      }
      nav.replaceChildren(list);
      reveal(nav);
      return true;
    },

    wire(nav, article, signal) {
      if (!nav.querySelector('.documentation-tree')) return;
      nav.addEventListener('toggle', event => {
        const node = event.target;
        if (node.matches('.documentation-branch')) {
          const key = node.dataset.guideKey;
          if (node.open) {
            expanded = key;
            // Fetch a guide only when selected, never all remote docs on index load.
            if (!visited.has(key)) node.querySelector('summary > a').click();
          } else if (expanded === key) expanded = null;
        } else if (node.dataset.chapterKey) expandedChapters.set(node.dataset.chapterKey, node.open);
      }, { capture: true, signal });
      nav.addEventListener('click', event => {
        const link = event.target.closest('a');
        if (!link) return;
        if (link.parentElement.tagName === 'SUMMARY') link.parentElement.parentElement.open = true;
      }, { signal });
      article.addEventListener('click', event => {
        const link = event.target.closest('a[href]');
        if (selected && link?.origin === location.origin && link.hash.startsWith('#/'))
          owners.set(routePath(link.hash), selected.key);
      }, { signal });
      window.addEventListener('hashchange', () => reveal(nav), { signal });
    },
  };
}
