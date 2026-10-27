// H3 chapters containing a code block and optional source quote become one tabbed window.
function languageOf(code) {
  return (code.className.match(/(?:lang|language)-([^\s]+)/)?.[1] || '').toUpperCase();
}

export function decorateExample(section) {
  const body = section.querySelector('.markdown-body');
  const chapters = [];
  let chapter;
  for (const node of [...body.childNodes]) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H3') {
      chapter = { heading: node, nodes: [] };
      chapters.push(chapter);
    } else if (chapter) chapter.nodes.push(node);
  }
  if (chapters.length < 2) return false;
  // Leave other Markdown layouts intact, rather than hiding additional prose or headings.
  for (const item of chapters) {
    const elements = item.nodes.filter((node) => node.nodeType === Node.ELEMENT_NODE);
    item.pre = elements.find((node) => node.tagName === 'PRE');
    item.quote = elements.find((node) => node.tagName === 'BLOCKQUOTE');
    if (
      !item.pre?.querySelector('code') ||
      elements.some((node) => node !== item.pre && node !== item.quote) ||
      item.nodes.some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim())
    ) return false;
  }

  const workspace = document.createElement('div');
  workspace.className = 'example-workspace';
  const tabs = document.createElement('div');
  tabs.className = 'example-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', body.querySelector('h2').textContent);
  const codePanel = document.createElement('div');
  codePanel.className = 'example-code';
  codePanel.id = `example-code-${section.dataset.section}`;
  codePanel.setAttribute('role', 'tabpanel');
  codePanel.tabIndex = 0;
  const header = document.createElement('div');
  header.className = 'example-code-header';
  const label = document.createElement('span');
  label.className = 'example-source-label';
  label.textContent = chapters[0].quote?.textContent.trim() || '';
  const language = document.createElement('span');
  language.className = 'example-format';
  language.textContent = languageOf(chapters[0].pre.querySelector('code'));
  header.append(label, language);
  codePanel.append(header, chapters[0].pre.cloneNode(true));
  workspace.append(tabs, codePanel);

  chapters.forEach(({ heading, nodes, pre, quote }, index) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = heading.id;
    tab.dataset.exampleTab = heading.id;
    tab.textContent = heading.textContent;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', codePanel.id);
    tab.setAttribute('aria-selected', String(index === 0));
    tab.tabIndex = index === 0 ? 0 : -1;
    tabs.append(tab);
    if (index === 0) codePanel.setAttribute('aria-labelledby', tab.id);
    const source = document.createElement('template');
    source.dataset.exampleSource = heading.id;
    source.dataset.label = quote?.textContent.trim() || '';
    nodes.forEach((node) => node.remove());
    source.content.append(pre);
    workspace.append(source);
    heading.remove();
  });
  section.classList.add('section-example');
  section.append(workspace);
  return true;
}

export function wireExamples(signal, root = document) {
  for (const workspace of root.querySelectorAll('.example-workspace')) {
    const tabs = [...workspace.querySelectorAll('[data-example-tab]')];
    const sources = [...workspace.querySelectorAll('[data-example-source]')];
    const codePanel = workspace.querySelector('.example-code');
    const code = codePanel.querySelector('pre code');
    const select = (id) => {
      const source = sources.find((item) => item.dataset.exampleSource === id);
      if (!source) return false;
      const sample = source.content.querySelector('code');
      code.className = sample.className;
      code.innerHTML = sample.innerHTML;
      codePanel.querySelector('.example-source-label').textContent = source.dataset.label;
      codePanel.querySelector('.example-format').textContent = languageOf(sample);
      codePanel.setAttribute('aria-labelledby', id);
      tabs.forEach((tab) => {
        const selected = tab.dataset.exampleTab === id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      return true;
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
    select(tabs[0].dataset.exampleTab);
    fromHash();
    window.addEventListener('hashchange', fromHash, { signal });
  }
}
