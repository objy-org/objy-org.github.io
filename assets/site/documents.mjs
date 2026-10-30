import { htmlFragment } from './markup.mjs';

// An index is a sequence of icon headings, short descriptions, and single links.
// Other Markdown documents keep their normal content and chapter navigation.
export function decorateDocument(html) {
  const article = document.createElement('div');
  article.className = 'document-page';
  article.append(htmlFragment(html));
  const headings = [...article.querySelectorAll(':scope > h2')];
  const entries = headings.map((heading) => {
    const content = [];
    for (let node = heading.nextSibling; node && !headings.includes(node); node = node.nextSibling) {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) continue;
      content.push(node);
    }
    const [description, destination] = content;
    const icon = heading.querySelector('img');
    const link = destination?.firstElementChild;
    if (
      content.length !== 2 || !icon || heading.querySelectorAll('img').length !== 1 ||
      description.tagName !== 'P' || description.querySelector('a') ||
      destination.tagName !== 'P' || destination.children.length !== 1 ||
      link?.tagName !== 'A' || destination.textContent.trim() !== link.textContent.trim()
    ) return null;
    return { heading, description, destination, icon, link };
  });
  if (!entries.length || entries.some((entry) => !entry)) return article.outerHTML;

  const list = document.createElement('div');
  list.className = 'directory-list';
  list.setAttribute('role', 'list');
  headings[0].before(list);
  for (const { heading, description, destination, icon, link } of entries) {
    const item = document.createElement('div');
    item.setAttribute('role', 'listitem');
    const row = link.cloneNode(false);
    row.classList.add('directory-link');
    row.setAttribute('aria-labelledby', heading.id);
    description.id ||= `${heading.id}-description`;
    row.setAttribute('aria-describedby', description.id);
    const copy = document.createElement('div');
    copy.className = 'directory-copy';
    icon.remove();
    icon.alt = '';
    heading.querySelectorAll('a').forEach((anchor) => anchor.replaceWith(...anchor.childNodes));
    copy.append(heading, description);
    const arrow = document.createElement('span');
    arrow.className = 'directory-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    row.append(icon, copy, arrow);
    item.append(row);
    list.append(item);
    destination.remove();
  }
  article.classList.add('document-directory');
  return article.outerHTML;
}
