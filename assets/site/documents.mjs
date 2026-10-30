import { htmlFragment } from './markup.mjs';

// An index is a sequence of icon headings, descriptions, and links or link-only lists.
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
    const links = [];
    if (destination?.tagName === 'P') links.push(destination.firstElementChild);
    else if (destination?.tagName === 'UL') {
      for (const item of destination.children) {
        if (item.tagName !== 'LI' || item.children.length !== 1 ||
          item.textContent.trim() !== item.firstElementChild.textContent.trim()) return null;
        links.push(item.firstElementChild);
      }
    }
    if (
      content.length !== 2 || !icon || heading.querySelectorAll('img').length !== 1 ||
      description.tagName !== 'P' || description.querySelector('a') ||
      !links.length || links.some((link) => link?.tagName !== 'A') ||
      (destination.tagName === 'P' && (destination.children.length !== 1 ||
        destination.textContent.trim() !== links[0].textContent.trim()))
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
    heading.querySelectorAll('a').forEach((anchor) => anchor.replaceWith(...anchor.childNodes));
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
