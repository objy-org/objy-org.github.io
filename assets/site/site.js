/* Editorial content lives in content/*.md; this file provides the layout and interactions. */
(() => {
  'use strict';

  let labels;
  let examples;
  let heroArtwork;
  const cube = '<svg class="cube-icon" viewBox="0 0 48 52" aria-hidden="true"><path d="m24 2 22 12.5v25L24 52 2 39.5v-25Z M2 14.5 24 27l22-12.5 M24 27v25"/></svg>';
  const arrow = '<span aria-hidden="true">↗</span>';
  const label = key => `<span data-copy="${key}"></span>`;
  const caption = key => `<figcaption data-copy="${key}"></figcaption>`;
  const visuals = {
    hero: () => `<figure class="hero-art" role="img" data-copy-aria="hero-artwork.description">${heroArtwork}</figure>`,
    philosophy: () => `<figure class="philosophy-visual" data-copy-aria="philosophy-diagram.description"><div class="idea-shape">${cube}${label('philosophy-diagram.first-label')}</div><span class="idea-plus" aria-hidden="true">+</span><div class="idea-shape"><span class="behavior-symbol" aria-hidden="true">↯</span>${label('philosophy-diagram.second-label')}</div><span class="idea-plus" aria-hidden="true">+</span><div class="idea-shape"><span class="connection-symbol" aria-hidden="true">⌘</span>${label('philosophy-diagram.third-label')}</div><div class="idea-result">${label('philosophy-diagram.caption')} ${arrow}</div></figure>`,
    product: () => `<figure class="product-visual"><div class="object-title"><span class="status-dot"></span>${label('product-diagram.object-label')}<span class="object-braces">{ }</span></div>${['first', 'second', 'third'].map((row, i) => `<div class="object-layer"><span class="layer-symbol" aria-hidden="true">${['◇', '↯', '◎'][i]}</span><div><strong data-copy="product-diagram.${row}-title"></strong>${label(`product-diagram.${row}-description`)}</div><span class="layer-index" aria-hidden="true">0${i + 1}</span></div>`).join('')}${caption('product-diagram.caption')}</figure>`,
    objects: () => `<figure class="object-demo diagram"><div class="demo-options" role="group" data-copy-aria="object-examples.selector-label">${examples.map((example, i) => `<button type="button" data-example="${i}" aria-pressed="${i === 0}">${escapeHTML(plainMarkdown(example.label))}</button>`).join('')}</div><div class="demo-body" aria-live="polite" aria-atomic="true"><div class="demo-object-name">${cube}<span id="example-name"></span><span class="demo-type" data-copy="object-examples.type-label"></span></div><dl id="example-properties"></dl></div>${caption('object-examples.caption')}</figure>`,
    inheritance: () => `<figure class="diagram inheritance-diagram"><div class="template-object"><span class="diagram-kicker" data-copy="inheritance-diagram.template-label"></span><strong>${cube}${label('inheritance-diagram.template-name')}</strong>${['first', 'second'].map(row => `<div class="property-line">${label(`inheritance-diagram.${row}-property`)}<code data-copy="inheritance-diagram.${row}-property-value"></code></div>`).join('')}</div><div class="inheritance-lines" aria-hidden="true">${label('inheritance-diagram.connection')}</div><div class="child-objects">${['first', 'second'].map(row => `<div><span class="diagram-kicker" data-copy="inheritance-diagram.${row}-object-label"></span><strong data-copy="inheritance-diagram.${row}-object-name"></strong><span class="inherited-value" data-copy="inheritance-diagram.${row}-inherited-value"></span><code data-copy="inheritance-diagram.${row}-object-value"></code></div>`).join('')}</div>${caption('inheritance-diagram.caption')}</figure>`,
    behavior: () => `<figure class="diagram behavior-diagram"><div class="behavior-object">${cube}${label('behavior-diagram.title')}</div>${['first', 'second', 'third'].map(row => `<div class="behavior-route"><span class="event-dot"></span><code data-copy="behavior-diagram.${row}-event"></code><span class="route-line"></span><span class="action-label" data-copy="behavior-diagram.${row}-action"></span></div>`).join('')}<div class="time-event"><span aria-hidden="true">◷</span>${label('behavior-diagram.time-label')}${label('behavior-diagram.time-description')}</div>${caption('behavior-diagram.caption')}</figure>`,
    context: () => `<figure class="diagram context-diagram">${['first', 'second'].map((row, i) => `<div class="tenant tenant-${i ? 'b' : 'a'}"><div class="tenant-label"><span class="status-dot"></span>${label(`context-diagram.${row}-workspace`)}</div><div class="tenant-objects">${cube}${cube}${cube}</div><div class="permission-label"><span aria-hidden="true">↳</span>${label(`context-diagram.${row}-role`)}<code data-copy="context-diagram.${row}-permissions"></code></div></div>`).join('')}${caption('context-diagram.caption')}</figure>`,
    storage: () => `<figure class="diagram storage-diagram"><div class="storage-object">${cube}<strong data-copy="storage-diagram.object-name"></strong>${label('storage-diagram.object-description')}</div><div class="storage-connector" aria-hidden="true"></div><div class="storage-options">${['first', 'second', 'third'].map((row, i) => `<div><span aria-hidden="true">${['▦', '◉', '{ }'][i]}</span><strong data-copy="storage-diagram.${row}-backend"></strong><small data-copy="storage-diagram.${row}-description"></small></div>`).join('')}</div>${caption('storage-diagram.caption')}</figure>`,
    start: () => `<div class="start-art" aria-hidden="true">${cube}${label('closing-artwork.caption')}</div>`
  };

  function escapeHTML(value) {
    return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  }

  function plainMarkdown(markdown) {
    const template = document.createElement('template');
    template.innerHTML = marked.parseInline(markdown, { renderer: new marked.Renderer() });
    return template.content.textContent;
  }

  function copy(key) {
    if (!Object.hasOwn(labels, key)) throw new Error(`labels.md: missing "${key}".`);
    return plainMarkdown(labels[key]);
  }

  function bindCopy(root = document) {
    root.querySelectorAll('[data-copy]').forEach(element => { element.textContent = copy(element.dataset.copy); });
    root.querySelectorAll('[data-copy-aria]').forEach(element => { element.setAttribute('aria-label', copy(element.dataset.copyAria)); });
    root.querySelectorAll('[data-copy-link]').forEach(element => {
      const key = element.dataset.copyLink;
      if (!Object.hasOwn(labels, key)) throw new Error(`labels.md: missing "${key}".`);
      const template = document.createElement('template');
      template.innerHTML = marked.parseInline(labels[key], { renderer: new marked.Renderer() });
      const links = template.content.querySelectorAll('a');
      if (links.length !== 1) throw new Error(`labels.md: "${key}" needs one Markdown link.`);
      element.href = links[0].getAttribute('href');
      element.textContent = links[0].textContent;
      if (element.classList.contains('product-link')) element.insertAdjacentHTML('afterbegin', '<span class="status-dot"></span>');
      if (element.dataset.linkArrow) {
        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = element.dataset.linkArrow;
        element.append(icon);
      }
    });
    document.title = copy('site.page-title');
    document.querySelector('meta[name="description"]').content = copy('site.page-description');
    document.querySelector('meta[property="og:title"]').content = copy('site.page-title');
    document.querySelector('meta[property="og:description"]').content = copy('site.page-description');
  }

  function readMarkdown(markdown) {
    const template = document.createElement('template');
    // Use the parser bundled with Docsify, with a plain renderer for label tables.
    template.innerHTML = marked(markdown, { renderer: new marked.Renderer() });
    return template.content;
  }

  function slug(value) {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function readLabels(markdown) {
    const values = Object.create(null);
    let group = '';
    for (const element of readMarkdown(markdown).children) {
      if (element.tagName === 'H2') group = slug(element.textContent);
      if (element.tagName !== 'TABLE' || !group) continue;
      for (const row of element.querySelectorAll('tbody tr')) {
        if (row.cells.length !== 2) throw new Error(`labels.md: "${group}" needs two columns.`);
        const key = `${group}.${slug(row.cells[0].textContent)}`;
        if (Object.hasOwn(values, key)) throw new Error(`labels.md: duplicate label "${key}".`);
        values[key] = row.cells[1].innerHTML;
      }
    }
    return values;
  }

  function readExamples(markdown) {
    const result = [];
    let example;
    for (const element of readMarkdown(markdown).children) {
      if (element.tagName === 'H2') {
        example = { label: element.innerHTML, name: '', properties: [] };
        result.push(example);
      } else if (example && element.tagName === 'H3') {
        example.name = element.innerHTML;
      } else if (example && element.tagName === 'TABLE') {
        for (const row of element.querySelectorAll('tbody tr')) {
          if (row.cells.length !== 2) throw new Error('examples.md: use Property and Value columns.');
          example.properties.push([...row.cells].map(cell => cell.innerHTML));
        }
      }
    }
    if (!result.length || result.some(item => !item.name || !item.properties.length)) {
      throw new Error('examples.md: each example needs a ## button label, ### name, and a property table.');
    }
    return result;
  }

  const visualForSection = {
    top: 'hero', 'the-idea': 'philosophy', 'objy-db': 'product', objects: 'objects',
    inheritance: 'inheritance', behavior: 'behavior', context: 'context', storage: 'storage', 'start-building': 'start'
  };

  function decorateSection(section) {
    const body = section.querySelector('.markdown-body');
    const heading = body.querySelector('h1, h2');
    section.setAttribute('aria-labelledby', heading.id);
    // An ordinary Markdown quote immediately after a heading is its small label.
    const quote = heading.nextElementSibling;
    if (quote?.tagName === 'BLOCKQUOTE') {
      const eyebrow = document.createElement('p');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = quote.textContent.trim();
      section.querySelector('.section-copy').prepend(eyebrow);
      quote.remove();
    }
    const visual = visualForSection[heading.id];
    if (visual) section.insertAdjacentHTML('beforeend', visuals[visual]());
    for (const paragraph of body.querySelectorAll(':scope > p')) {
      const links = [...paragraph.children];
      if (links.length && links.every(element => element.tagName === 'A') && ![...paragraph.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) {
        paragraph.classList.add('section-actions');
        links[0].classList.add('button-primary');
        links[0].insertAdjacentHTML('beforeend', '<span aria-hidden="true">↗</span>');
        links.slice(1).forEach(link => link.classList.add('button-text'));
      }
    }
  }

  function decorateHomepage(html) {
    const template = document.createElement('template');
    template.innerHTML = html;
    const sections = [];
    let current;
    const ids = new Set();
    for (const node of [...template.content.childNodes]) {
      if (node.nodeType === Node.ELEMENT_NODE && node.matches('h1, h2')) {
        if (ids.has(node.id)) throw new Error(`home.md: duplicate heading ID "${node.id}".`);
        ids.add(node.id);
        current = document.createElement('section');
        current.dataset.section = node.id;
        current.className = `page-section section-${visualForSection[node.id] || 'text'}`;
        current.innerHTML = '<div class="section-copy"><div class="markdown-body"></div></div>';
        sections.push(current);
      }
      if (current) current.querySelector('.markdown-body').append(node);
    }
    if (sections[0]?.dataset.section !== 'top') throw new Error('home.md: keep the # headline with :id=top first.');
    sections.forEach(decorateSection);
    const hero = sections.shift();
    hero.insertAdjacentHTML('beforeend', '<div class="hero-bottom"><span data-copy="hero.slogan"></span><a data-copy-link="hero.lower-link" data-link-arrow="↓"></a></div>');
    return `<div id="hero-root">${hero.outerHTML}</div><div class="page-layout" id="explore"><div id="sidebar-slot"></div><div class="sections-root">${sections.map(section => section.outerHTML).join('')}</div></div>`;
  }

  function mountSidebar() {
    const sidebar = document.querySelector('aside.sidebar');
    const slot = document.getElementById('sidebar-slot');
    if (!sidebar || !slot) return;
    sidebar.classList.add('page-sidebar');
    const nav = sidebar.querySelector('.sidebar-nav');
    if (!sidebar.querySelector('.sidebar-inner')) {
      sidebar.append(document.getElementById('sidebar-shell').content.cloneNode(true));
      sidebar.querySelector('#sidebar-links-slot').replaceWith(nav);
    }
    nav.id = 'section-links';
    nav.setAttribute('role', 'navigation');
    nav.dataset.copyAria = 'navigation.section-navigation-label';
    slot.replaceWith(sidebar);
  }

  function anchorId(link) {
    return new URLSearchParams(link.hash.split('?')[1] || '').get('id');
  }

  function setExample(key) {
    const example = examples[Number(key)];
    if (!example || !document.getElementById('example-name')) return;
    document.getElementById('example-name').textContent = plainMarkdown(example.name);
    const properties = document.getElementById('example-properties');
    properties.replaceChildren();
    for (const [label, value] of example.properties) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = plainMarkdown(label);
      description.textContent = plainMarkdown(value);
      row.append(term, description);
      properties.append(row);
    }
    document.querySelectorAll('[data-example]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.example === String(key))));
  }

  let navigationEvents;
  function wireNavigation() {
    navigationEvents?.abort();
    navigationEvents = new AbortController();
    const signal = navigationEvents.signal;
    document.querySelector('.skip-link').addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      const main = document.getElementById('main');
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start', behavior: 'auto' });
    }, { signal });
    const nav = document.getElementById('section-links');
    const menu = document.querySelector('.section-menu-toggle');
    const sections = [...document.querySelectorAll('.sections-root .page-section')];
    const links = [...nav.querySelectorAll('a')];
    for (const link of links) {
      const section = sections.find(section => section.dataset.section === anchorId(link));
      const number = document.createElement('span');
      number.className = 'nav-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = section?.querySelector('.eyebrow')?.textContent.match(/^\d+/)?.[0] || (anchorId(link) === 'start-building' ? '↗' : '·');
      link.querySelector('.nav-number')?.remove();
      link.prepend(number);
    }
    const closeMenu = () => {
      menu.setAttribute('aria-expanded', 'false');
      menu.querySelector('.menu-indicator').textContent = '+';
      document.querySelector('.page-sidebar').classList.remove('menu-open');
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.querySelector('.menu-indicator').textContent = open ? '−' : '+';
      document.querySelector('.page-sidebar').classList.toggle('menu-open', open);
    }, { signal });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menu.focus();
      }
    }, { signal });
    links.forEach(link => link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 760px)').matches) {
        const target = document.getElementById(anchorId(link));
        closeMenu();
        target?.setAttribute('tabindex', '-1');
        target?.focus({ preventScroll: true });
      }
    }, { signal }));
    let scheduled = false;
    const updateActive = () => {
      let current = '';
      for (const section of sections) {
        if (document.getElementById(section.dataset.section).getBoundingClientRect().top <= 180) current = section.dataset.section;
      }
      if (sections.length && scrollY + innerHeight >= document.documentElement.scrollHeight - 4) current = sections.at(-1).dataset.section;
      links.forEach(link => {
        if (anchorId(link) === current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateActive); }
    }, { signal, passive: true });
    window.addEventListener('resize', updateActive, { signal });
    updateActive();
  }

  function wireCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-button';
      button.textContent = copy('controls.copy-button');
      button.setAttribute('aria-label', copy('controls.copy-label'));
      button.setAttribute('aria-live', 'polite');
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.querySelector('code').textContent.trim());
          button.textContent = copy('controls.copy-success');
        } catch {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(pre.querySelector('code'));
          selection.removeAllRanges();
          selection.addRange(range);
          button.textContent = copy('controls.copy-fallback');
        }
        window.setTimeout(() => { button.textContent = copy('controls.copy-button'); }, 2500);
      });
      pre.append(button);
    });
  }

  function objyTheme(hook, vm) {
    let contentReady;
    let loadError;
    const loadContent = () => contentReady ||= Promise.all([
      'content/labels.md', 'content/examples.md', 'assets/site/object-universe.svg'
    ].map(async file => {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`${file}: request failed (${response.status}).`);
      return response.text();
    })).then(async ([labelMarkdown, exampleMarkdown, artwork]) => {
      labels = readLabels(labelMarkdown);
      examples = readExamples(exampleMarkdown);
      heroArtwork = artwork.replace('<svg ', '<svg aria-hidden="true" ');
      await document.fonts.ready;
    });

    hook.beforeEach(async (markdown, next) => {
      // Keep Docsify's own sidebar alive when it replaces the article on route changes.
      const sidebar = document.querySelector('aside.sidebar');
      if (sidebar) {
        sidebar.classList.remove('page-sidebar');
        document.querySelector('main').prepend(sidebar);
      }
      try {
        await loadContent();
      } catch (error) {
        loadError = error;
        console.error('OBJY content could not load:', error);
      }
      next(markdown);
    });

    hook.afterEach(html => {
      if (loadError) return html; // Keep Docsify's readable Markdown output available.
      try {
        return vm.route.path === '/' ? decorateHomepage(html) : `<div class="page-layout"><div id="sidebar-slot"></div><div class="document-page">${html}</div></div>`;
      } catch (error) {
        console.error('OBJY theme could not format this page:', error);
        return `<div class="page-layout"><div id="sidebar-slot"></div><div class="document-page">${html}</div></div>`;
      }
    });

    hook.doneEach(() => {
      if (loadError) return;
      mountSidebar();
      bindCopy();
      setExample(0);
      document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => setExample(button.dataset.example)));
      wireNavigation();
      wireCopyButtons();
      document.getElementById('main').setAttribute('tabindex', '-1');
    });
  }

  // Preserve plain section URLs from the first version of the landing page.
  if (/^#[^/?]/.test(location.hash)) {
    history.replaceState(null, '', `${location.pathname}${location.search}#/?id=${encodeURIComponent(location.hash.slice(1))}`);
  }

  window.$docsify = {
    el: '#app',
    homepage: 'content/home.md',
    loadSidebar: '_sidebar.md',
    loadNavbar: false,
    maxLevel: 2,
    subMaxLevel: 0,
    skipLink: false,
    keyBindings: false,
    auto2top: false,
    externalLinkTarget: '_self',
    noCompileLinks: ['^docs/'],
    executeScript: false,
    notFoundPage: false,
    plugins: [objyTheme]
  };
})();
