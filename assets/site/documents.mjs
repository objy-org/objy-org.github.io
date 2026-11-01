import { htmlFragment } from './markup.mjs';

function destinationLinks(node) {
  const items = node?.tagName === 'UL' ? [...node.children] : node?.tagName === 'P' ? [node] : [];
  if (!items.length || items.some((item) =>
    item.children.length !== 1 || item.firstElementChild.tagName !== 'A' ||
    item.textContent.trim() !== item.firstElementChild.textContent.trim())) return null;
  return items.map((item) => item.firstElementChild);
}

function unwrapHeadingLinks(heading) {
  heading.querySelectorAll('a').forEach((anchor) => anchor.replaceWith(...anchor.childNodes));
}

function catalogEntries(content) {
  const headings = content.filter((node) => node.tagName === 'H3');
  if (!headings.length) return null;
  const entries = headings.map((heading, index) => {
    const start = content.indexOf(heading) + 1;
    const end = index + 1 < headings.length ? content.indexOf(headings[index + 1]) : content.length;
    const body = content.slice(start, end);
    const icons = heading.querySelectorAll('img');
    return icons.length === 1 && body.length ? { heading, body, icon: icons[0] } : null;
  });
  return entries.every(Boolean) ? { intro: content.slice(0, content.indexOf(headings[0])), entries } : null;
}

// Shared by illustrated guides and the visual chapters inside catalogs.
function decorateIllustratedChapter({ heading, content }, image) {
  const section = document.createElement('section');
  section.className = 'document-chapter document-illustration';
  if (heading.id) section.setAttribute('aria-labelledby', heading.id);
  heading.before(section);
  const copy = document.createElement('div');
  copy.className = 'document-illustration-copy';
  copy.append(...content.filter(node => node !== image));
  section.append(heading);
  section.classList.toggle('document-illustration-wide', !copy.childNodes.length);
  const figure = document.createElement('figure');
  figure.className = 'document-art';
  figure.append(image.firstElementChild);
  image.remove();
  if (copy.childNodes.length) section.append(copy);
  section.append(figure);
  return section;
}

// An index is a sequence of icon headings, descriptions, and links or link-only lists.
// Icon chapters starting with code or actions expand in place. Chapters with icon
// subheadings form a catalog. Other guides keep their normal chapter navigation.
export function decorateDocument(html) {
  const article = document.createElement('div');
  article.className = 'document-page';
  article.append(htmlFragment(html));
  const headings = [...article.querySelectorAll(':scope > h2')];
  const sections = headings.map((heading) => {
    const content = [];
    for (let node = heading.nextSibling; node && !headings.includes(node); node = node.nextSibling) {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) continue;
      content.push(node);
    }
    const icon = heading.querySelector('img');
    return { heading, content, icon };
  });
  const catalogs = sections.map(({ content }) => catalogEntries(content));
  const illustrations = sections.map(({ content }) => !content.some((node) => node.tagName === 'H3') &&
    content.find((node) => node.tagName === 'P' && node.children.length === 1 && node.firstElementChild.tagName === 'IMG'));
  const explanations = sections.map(({ content }) => content.length &&
    !content.some(node => /^H[1-6]$/.test(node.tagName)));
  if (catalogs.some(Boolean) && catalogs.every((catalog, index) => catalog || illustrations[index] || explanations[index])) {
    // A standalone introductory image belongs to the page title, without
    // requiring an extra chapter heading or navigation entry.
    const leadImages = [...article.querySelectorAll(':scope > p > img:only-child')].filter((image) =>
      image.compareDocumentPosition(headings[0]) & Node.DOCUMENT_POSITION_FOLLOWING);
    for (const image of leadImages) {
      const paragraph = image.parentElement;
      const lead = document.createElement('div');
      lead.className = 'document-lead-art';
      const figure = document.createElement('figure');
      figure.className = 'document-art';
      figure.append(image);
      lead.append(figure);
      paragraph.replaceWith(lead);
    }
    for (const [index, { heading }] of sections.entries()) {
      if (!catalogs[index]) {
        if (illustrations[index]) {
          decorateIllustratedChapter(sections[index], illustrations[index]);
          continue;
        }
        const section = document.createElement('section');
        section.className = 'document-chapter document-explanation';
        if (heading.id) section.setAttribute('aria-labelledby', heading.id);
        heading.before(section);
        const copy = document.createElement('div');
        copy.className = 'document-explanation-copy';
        copy.append(...sections[index].content);
        copy.querySelectorAll(':scope > ul').forEach(list => list.setAttribute('role', 'list'));
        section.append(heading, copy);
        continue;
      }
      const { intro, entries } = catalogs[index];
      const section = document.createElement('section');
      section.className = 'document-chapter catalog-section';
      if (heading.id) section.setAttribute('aria-labelledby', heading.id);
      heading.before(section);
      section.append(heading, ...intro);
      const grid = document.createElement('div');
      grid.className = 'catalog-grid';
      for (const { heading: title, body, icon } of entries) {
        const feature = document.createElement('section');
        feature.className = 'catalog-feature';
        if (title.id) feature.setAttribute('aria-labelledby', title.id);
        icon.alt = '';
        icon.width = 64;
        icon.height = 64;
        icon.loading = 'lazy';
        feature.append(icon, title, ...body);
        grid.append(feature);
      }
      section.append(grid);
    }
    article.classList.add('document-catalog');
    return article.outerHTML;
  }
  // H2 chapters can group simple H3 topics, mixing diagrams with prose and code.
  const groups = sections.map(({ heading, content }) => {
    const topics = content.filter(node => node.tagName === 'H3');
    return {
      heading,
      intro: content.slice(0, content.indexOf(topics[0])),
      topics: topics.map((title, index) => {
        const start = content.indexOf(title) + 1;
        const end = topics[index + 1] ? content.indexOf(topics[index + 1]) : content.length;
        const body = content.slice(start, end);
        const image = body.find(node => node.tagName === 'P' && node.children.length === 1 && node.firstElementChild.tagName === 'IMG');
        return { heading: title, content: body, image };
      }),
    };
  });
  if (groups.length && groups.every(group => group.topics.some(topic => topic.image) &&
    group.topics.every(topic => topic.content.length && !topic.heading.querySelector('img') &&
      !topic.content.some(node => /^H[1-6]$/.test(node.tagName))))) {
    article.classList.add('document-guide', 'document-guide-grouped');
    for (const group of groups) {
      const chapter = document.createElement('section');
      chapter.className = 'document-guide-group';
      if (group.heading.id) chapter.setAttribute('aria-labelledby', group.heading.id);
      group.heading.before(chapter);
      chapter.append(group.heading, ...group.intro);
      for (const topic of group.topics) {
        if (topic.image) {
          const illustrated = decorateIllustratedChapter(topic, topic.image);
          chapter.append(illustrated);
        } else {
          const section = document.createElement('section');
          section.className = 'document-chapter document-text';
          if (topic.heading.id) section.setAttribute('aria-labelledby', topic.heading.id);
          const copy = document.createElement('div');
          copy.className = 'document-illustration-copy';
          copy.append(...topic.content);
          section.append(topic.heading, copy);
          chapter.append(section);
        }
      }
    }
    return article.outerHTML;
  }
  // A guide with an image in each chapter gets a visual reading layout.
  if (sections.length && illustrations.every(Boolean)) {
    sections.forEach((section, index) => decorateIllustratedChapter(section, illustrations[index]));
    article.classList.add('document-guide');
    return article.outerHTML;
  }
  if (sections.length && sections.every(({ heading, content, icon }) =>
    icon && heading.querySelectorAll('img').length === 1 && content.length &&
    (content[0].tagName === 'PRE' || destinationLinks(content[0])))) {
    const list = document.createElement('div');
    list.className = 'accordion-list';
    headings[0].before(list);
    for (const [index, { heading, content, icon }] of sections.entries()) {
      const row = document.createElement('details');
      row.className = 'accordion-row';
      row.name = 'document-accordion';
      row.open = index === 0;
      const summary = document.createElement('summary');
      summary.setAttribute('aria-labelledby', heading.id);
      unwrapHeadingLinks(heading);
      icon.remove();
      icon.alt = '';
      const title = document.createElement('span');
      title.append(...heading.childNodes);
      const indicator = document.createElement('span');
      indicator.className = 'accordion-indicator';
      indicator.setAttribute('aria-hidden', 'true');
      heading.replaceChildren(icon, title, indicator);
      summary.append(heading);
      const body = document.createElement('div');
      body.className = 'accordion-body';
      body.setAttribute('role', 'region');
      body.setAttribute('aria-labelledby', heading.id);
      body.append(...content);
      row.append(summary, body);
      list.append(row);
    }
    article.classList.add('document-accordion');
    return article.outerHTML;
  }

  const entries = sections.map(({ heading, content, icon }) => {
    const [description, destination] = content;
    const links = destinationLinks(destination);
    if (
      content.length !== 2 || !icon || heading.querySelectorAll('img').length !== 1 ||
      description.tagName !== 'P' || description.querySelector('a') ||
      !links
    ) return null;
    return { heading, description, destination, icon, links };
  });
  if (!entries.length || entries.some((entry) => !entry)) return article.outerHTML;

  const list = document.createElement('div');
  list.className = 'directory-list';
  list.setAttribute('role', 'list');
  headings[0].before(list);
  for (const { heading, description, destination, icon, links } of entries) {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    const single = links.length === 1;
    const row = single ? links[0].cloneNode(false) : document.createElement('div');
    row.classList.add('directory-row');
    if (single) row.classList.add('directory-link');
    else row.setAttribute('role', 'group');
    row.setAttribute('aria-labelledby', heading.id);
    description.id ||= `${heading.id}-description`;
    row.setAttribute('aria-describedby', description.id);
    const copy = document.createElement('div');
    copy.className = 'directory-copy';
    icon.remove();
    icon.alt = '';
    unwrapHeadingLinks(heading);
    copy.append(heading, description);
    row.append(icon, copy);
    if (single) {
      const arrow = document.createElement('span');
      arrow.className = 'directory-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      row.append(arrow);
      destination.remove();
    } else {
      destination.classList.add('directory-actions');
      copy.append(destination);
    }
    item.append(row);
    list.append(item);
  }
  article.classList.add('document-directory');
  return article.outerHTML;
}

export function wireDocuments(signal, root = document) {
  const openChapter = () => {
    const id = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
    if (!id) return;
    const chapter = [...root.querySelectorAll('.document-accordion [id]')].find((node) => node.id === id);
    const row = chapter?.closest('.accordion-row');
    if (row) row.open = true;
  };
  openChapter();
  window.addEventListener('hashchange', openChapter, { signal });
}
