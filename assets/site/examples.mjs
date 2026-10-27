// A code sample before H3 chapters turns those chapters into an explorable example.
// An H4 before the sample names it; matching samples in nested H4 chapters
// become object tabs above the code as well as linked views in the explanation.
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
  const previous = sample.previousElementSibling;
  const heading = previous?.tagName === 'BLOCKQUOTE' ? previous.previousElementSibling : previous;
  const sampleHeading = heading?.tagName === 'H4' ? heading : null;
  const source = keepSource(sample, 'example-default');
  const format = source.content.querySelector('code').className;
  const workspace = document.createElement('div');
  workspace.className = 'example-workspace';
  const codePanel = document.createElement('div');
  codePanel.className = 'example-code';
  const data = document.createElement('div');
  data.className = 'example-data';
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
  if (sampleHeading) {
    const records = document.createElement('div');
    records.className = 'example-tabs example-record-tabs';
    records.setAttribute('role', 'tablist');
    records.setAttribute('aria-label', tabs.firstElementChild.textContent);
    codePanel.id = `example-code-${section.dataset.section}`;
    codePanel.setAttribute('role', 'tabpanel');
    const choices = [
      [sampleHeading, tabs.firstElementChild.dataset.exampleTab],
      ...[...notes.querySelectorAll('.example-panel:has(.example-record) > h4')]
        .map((heading) => [heading, heading.id]),
    ];
    for (const [heading, chapter] of choices) {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.id = `example-record-tab-${chapter}`;
      tab.dataset.exampleRecord = chapter;
      tab.textContent = heading.textContent;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', codePanel.id);
      records.append(tab);
      heading.replaceChildren(document.createTextNode(heading.textContent));
      heading.classList.add('example-heading');
    }
    sampleHeading.remove();
    data.append(records);
  }
  data.append(codePanel);
  workspace.append(data, notes);
  section.classList.add('section-example');
  section.append(workspace);
  return true;
}

export function wireExamples(signal, root = document) {
  for (const workspace of root.querySelectorAll('.example-workspace')) {
    const panels = [...workspace.querySelectorAll('.example-panel')];
    const tabs = [...workspace.querySelectorAll('[data-example-tab]')];
    const records = [...workspace.querySelectorAll('[data-example-record]')];
    const codePanel = workspace.querySelector('.example-code');
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
      const currentRecord = records.find((tab) => tab.dataset.exampleRecord === id) || records[0];
      records.forEach((tab) => {
        const selected = tab === currentRecord;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      if (currentRecord) codePanel.setAttribute('aria-labelledby', currentRecord.id);
      return panel;
    };
    const fromHash = () => {
      const id = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
      if (select(id)) workspace.scrollIntoView({ block: 'start', behavior: 'auto' });
    };
    for (const group of [tabs, records]) group.forEach((tab, index) => {
      const chapter = (item) => item.dataset.exampleTab || item.dataset.exampleRecord;
      tab.addEventListener('click', () => select(chapter(tab)), { signal });
      tab.addEventListener('keydown', (event) => {
        const next = {
          ArrowRight: (index + 1) % group.length,
          ArrowLeft: (index + group.length - 1) % group.length,
          Home: 0,
          End: group.length - 1,
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        select(chapter(group[next]));
        group[next].focus({ preventScroll: true });
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
      const focus = records.find((tab) => tab.dataset.exampleRecord === selected.dataset.chapter) ||
        selected.querySelector('h4') ||
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
