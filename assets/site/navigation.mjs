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
  const expandedGuides = new Map();
  const allEntries = [];
  const parents = new Map();
  const collect = (items, parent) => {
    for (const entry of items) {
      allEntries.push(entry);
      if (parent) parents.set(entry.key, parent);
      collect(entry.children || [], entry);
    }
  };
  collect(entries);
  const ancestorsOf = (entry) => {
    const ancestors = [];
    for (let current = entry; current; current = parents.get(current.key)) ancestors.push(current);
    return ancestors;
  };
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
    const branch = [...nav.querySelectorAll('[data-guide-key]')]
      .find(node => node.dataset.guideKey === selected.key);
    const link = [...(branch?.querySelectorAll('[data-chapter-id]') || [])]
      .find(node => node.dataset.chapterId === current);
    for (let node = link?.parentElement; node && node !== nav; node = node.parentElement)
      if (node.tagName === 'DETAILS') node.open = true;
  };

  const guideTree = (items, root = true) => {
    const list = document.createElement('ul');
    if (root) list.className = 'documentation-tree';
    const currentBranch = ancestorsOf(selected);
    for (const entry of items) {
      const item = document.createElement('li');
      const details = document.createElement('details');
      details.className = root ? 'documentation-branch' : 'documentation-subbranch';
      details.dataset.guideKey = entry.key;
      if (root) details.name = 'documentation-guides';
      details.open = root ? expanded === entry.key : expandedGuides.get(entry.key) || false;
      const summary = document.createElement('summary');
      const link = document.createElement('a');
      link.className = root ? 'documentation-guide' : 'documentation-subguide';
      link.href = entry.href;
      if (selected === entry) link.setAttribute('aria-current', 'page');
      else if (currentBranch.includes(entry)) link.setAttribute('aria-current', 'true');
      navigationLabel(link, entry.title, root ? entry.icon : null);
      summary.append(link);
      details.append(summary);
      if (entry.children?.length) details.append(guideTree(entry.children, false));
      else {
        const guide = visited.get(entry.key);
        if (guide) details.append(chapterTree(guide.chapters, { ...guide, key: entry.key }));
      }
      item.append(details);
      list.append(item);
    }
    return list;
  };

  return {
    indexRoute: routePath(indexRoute),
    mount(nav, article, route, page) {
      const path = routePath(route);
      const matches = allEntries.filter(entry => entry.path === path);
      const key = owners.get(path) || owners.get(page?.file);
      selected = matches.find(entry => anchor(entry.href) === anchor(location.hash)) || matches[0] ||
        allEntries.find(entry => entry.sources?.includes(page?.file)) ||
        allEntries.find(entry => entry.key === key);
      if (!selected && path !== routePath(indexRoute)) {
        previous = null;
        return false;
      }
      if (selected) {
        owners.set(path, selected.key);
        if (page?.file) owners.set(page.file, selected.key);
        visited.set(selected.key, { route, chapters: page ? documentChapters(article) : [] });
        if (previous !== selected.key) {
          const ancestors = ancestorsOf(selected);
          expanded = ancestors.at(-1).key;
          for (const entry of allEntries) expandedGuides.set(entry.key, ancestors.includes(entry));
        }
      }
      previous = selected?.key;
      nav.replaceChildren(guideTree(entries));
      reveal(nav);
      return true;
    },

    wire(nav, article, signal) {
      if (!nav.querySelector('.documentation-tree')) return;
      nav.addEventListener('toggle', event => {
        const node = event.target;
        if (node.dataset.guideKey) {
          const key = node.dataset.guideKey;
          const entry = allEntries.find(entry => entry.key === key);
          const root = !parents.has(key);
          if (node.open) {
            if (root) expanded = key;
            else expandedGuides.set(key, true);
            // Fetch a guide only when selected, never all remote docs on index load.
            if (!visited.has(key) && !entry.children?.length) node.querySelector('summary > a').click();
          } else if (root && expanded === key) expanded = null;
          else if (!root) expandedGuides.set(key, false);
        } else if (node.dataset.chapterKey) expandedChapters.set(node.dataset.chapterKey, node.open);
      }, { capture: true, signal });
      nav.addEventListener('click', event => {
        const link = event.target.closest('a');
        if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        if (link.parentElement.tagName === 'SUMMARY') {
          const branch = link.parentElement.parentElement;
          if (link.matches(':is(.documentation-guide, .documentation-subguide)[aria-current="page"]')) {
            event.preventDefault();
            event.stopPropagation();
            branch.open = !branch.open;
          } else branch.open = true;
        }
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
