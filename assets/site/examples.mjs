// A code sample before H3 chapters turns those chapters into an explorable example.
// H4 chapters are linked views within their parent tab, such as a referenced object.
function sourceLabel(pre) {
  const quote = pre.previousElementSibling;
  if (quote?.tagName !== 'BLOCKQUOTE') return '';
  const label = quote.textContent.trim();
  quote.remove();
  return label;
}

function keepSource(pre, className) {
  const source = document.createElement('template');
  source.className = className;
  source.dataset.label = sourceLabel(pre);
  source.content.append(pre);
  return source;
}

export function decorateExample(section) {
  const body = section.querySelector('.markdown-body');
  const firstChapter = body.querySelector(':scope > h3');
  const sample = body.querySelector(':scope > pre');
  if (
    !firstChapter ||
    !sample ||
    !(sample.compareDocumentPosition(firstChapter) & Node.DOCUMENT_POSITION_FOLLOWING)
  )
    return false;

  const nodes = [];
  for (let node = sample.nextSibling; node; node = node.nextSibling) nodes.push(node);
  const source = keepSource(sample, 'example-default');
  const format = source.content.querySelector('code').className;
  const workspace = document.createElement('div');
  workspace.className = 'example-workspace';
  const codePanel = document.createElement('div');
  codePanel.className = 'example-code';
  const header = document.createElement('div');
  header.className = 'example-code-header';
  const label = document.createElement('span');
  label.className = 'example-source-label';
  label.textContent = source.dataset.label;
  const language = document.createElement('span');
  language.className = 'example-format';
  language.textContent = (format.match(/(?:lang|language)-([^\s]+)/)?.[1] || '').toUpperCase();
  header.append(label, language);
  codePanel.append(header, sample.cloneNode(true), source);

  const notes = document.createElement('div');
  notes.className = 'example-notes';
  const tabs = document.createElement('div');
  tabs.className = 'example-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', body.querySelector('h2').textContent);
  notes.append(tabs);
  let panel;
  let parent;
  for (const node of nodes) {
    if (node.nodeType === Node.ELEMENT_NODE && node.matches('h3, h4')) {
      panel = document.createElement('div');
      panel.className = 'example-panel';
      panel.id = `example-panel-${node.id}`;
      panel.dataset.chapter = node.id;
      panel.setAttribute('role', 'tabpanel');
      if (node.tagName === 'H3') {
        parent = node.id;
        const tab = document.createElement('button');
        tab.type = 'button';
        tab.id = `example-tab-${parent}`;
        tab.dataset.exampleTab = parent;
        tab.textContent = node.textContent;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', panel.id);
        tabs.append(tab);
        node.replaceChildren(document.createTextNode(node.textContent));
        node.classList.add('example-heading');
      }
      panel.dataset.parent = parent;
      panel.setAttribute('aria-labelledby', `example-tab-${parent}`);
      panel.hidden = notes.querySelectorAll('.example-panel').length > 0;
      notes.append(panel);
    }
    if (panel) panel.append(node);
  }
  for (const item of notes.querySelectorAll('.example-panel')) {
    const record = [...item.querySelectorAll(':scope > pre')].find(
      (pre) => pre.querySelector('code')?.className === format,
    );
    if (record) item.append(keepSource(record, 'example-record'));
  }
  workspace.append(codePanel, notes);
  section.classList.add('section-example');
  section.append(workspace);
  return true;
}

export function wireExamples(signal, root = document) {
  for (const workspace of root.querySelectorAll('.example-workspace')) {
    const panels = [...workspace.querySelectorAll('.example-panel')];
    const tabs = [...workspace.querySelectorAll('[data-example-tab]')];
    const code = workspace.querySelector('.example-code > pre code');
    const label = workspace.querySelector('.example-source-label');
    const defaultSource = workspace.querySelector('.example-default');
    const select = (id) => {
      const panel = panels.find((item) => item.dataset.chapter === id);
      if (!panel) return false;
      panels.forEach((item) => {
        item.hidden = item !== panel;
      });
      tabs.forEach((tab) => {
        const selected = tab.dataset.exampleTab === panel.dataset.parent;
        tab.setAttribute('aria-selected', String(selected));
        tab.setAttribute('aria-controls', selected ? panel.id : `example-panel-${tab.dataset.exampleTab}`);
        tab.tabIndex = selected ? 0 : -1;
      });
      const source = panel.querySelector('.example-record') || defaultSource;
      code.innerHTML = source.content.querySelector('code').innerHTML;
      label.textContent = source.dataset.label;
      return panel;
    };
    const fromHash = () => {
      const id = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
      if (select(id)) workspace.scrollIntoView({ block: 'start', behavior: 'auto' });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.exampleTab), { signal });
      tab.addEventListener('keydown', (event) => {
        const next = {
          ArrowRight: (index + 1) % tabs.length,
          ArrowLeft: (index + tabs.length - 1) % tabs.length,
          Home: 0,
          End: tabs.length - 1,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(tabs[next].dataset.exampleTab);
        tabs[next].focus({ preventScroll: true });
      }, { signal });
    });
    workspace.addEventListener('click', (event) => {
      const link = event.target.closest('a[href]');
      if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, location.href);
      const id = new URLSearchParams(url.hash.split('?')[1] || '').get('id');
      if (
        url.origin !== location.origin ||
        url.pathname !== location.pathname ||
        url.hash.split('?')[0] !== '#/'
      ) return;
      const selected = select(id);
      if (!selected) return;
      event.preventDefault();
      event.stopPropagation();
      const focus = selected.querySelector('h4') ||
        tabs.find((tab) => tab.dataset.exampleTab === selected.dataset.parent);
      if (focus.tagName === 'H4') focus.setAttribute('tabindex', '-1');
      focus.focus({ preventScroll: true });
      workspace.scrollIntoView({
        block: 'start',
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }, { signal });
    select(tabs[0].dataset.exampleTab);
    fromHash();
    window.addEventListener('hashchange', fromHash, { signal });
  }
}
