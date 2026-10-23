/* Editorial content lives in content/*.md; this file provides the layout and interactions. */
(() => {
  'use strict';

  let labels;

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
    if (heading.id === 'top') {
      // The first standalone Markdown image becomes the hero illustration.
      const image = body.querySelector(':scope > p > img:only-child');
      if (image) {
        const paragraph = image.parentElement;
        const figure = document.createElement('figure');
        figure.className = 'hero-art';
        image.fetchPriority = 'high';
        figure.append(image);
        paragraph.remove();
        section.append(figure);
      }
      body.querySelectorAll(':scope > p').forEach(paragraph => {
        if (paragraph.children.length === 1 && paragraph.firstElementChild.tagName === 'A' && paragraph.textContent.trim() === paragraph.firstElementChild.textContent.trim()) {
          paragraph.classList.add('hero-action');
        }
      });
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
        current.className = `page-section section-${node.id === 'top' ? 'hero' : node.id === 'objy-db' ? 'product' : 'text'}`;
        current.innerHTML = '<div class="section-copy"><div class="markdown-body"></div></div>';
        sections.push(current);
      }
      if (current) current.querySelector('.markdown-body').append(node);
    }
    if (sections[0]?.dataset.section !== 'top') throw new Error('home.md: keep the # headline with :id=top first.');
    sections.forEach(decorateSection);
    return `<div class="page-layout"><div id="sidebar-slot"></div><div class="sections-root">${sections.map(section => section.outerHTML).join('')}</div></div>`;
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
    if (!nav || !menu) return;
    const links = [...nav.querySelectorAll('a')];
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
      if (sections.length && scrollY + innerHeight >= document.documentElement.scrollHeight - 4) {
        const requested = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
        const heading = sections.find(section => section.dataset.section === requested)?.querySelector('h1, h2');
        const top = heading?.getBoundingClientRect().top;
        current = top >= 0 && top < innerHeight ? requested : sections.at(-1).dataset.section;
      }
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
    window.addEventListener('hashchange', updateActive, { signal });
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
      'content/labels.md'
    ].map(async file => {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`${file}: request failed (${response.status}).`);
      return response.text();
    })).then(async ([labelMarkdown]) => {
      labels = readLabels(labelMarkdown);
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
      wireNavigation();
      wireCopyButtons();
      document.getElementById('main').setAttribute('tabindex', '-1');
    });
  }

  // Preserve section links from earlier versions of the landing page.
  if (/^#[^/?]/.test(location.hash)) {
    history.replaceState(null, '', `${location.pathname}${location.search}#/?id=${encodeURIComponent(location.hash.slice(1))}`);
  }

  const previousSections = { 'the-idea': 'top', 'start-building': 'objy-db' };
  const previousId = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
  if (Object.hasOwn(previousSections, previousId)) {
    history.replaceState(null, '', `${location.pathname}${location.search}#/?id=${previousSections[previousId]}`);
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
