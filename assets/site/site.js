/* Editorial content lives in content/*.md; this file provides the layout and interactions. */
(() => {
  'use strict';

  let labels;
  let illustrations = {};
  const illustrationFiles = [
    'assets/site/header-objects.svg',
    'assets/site/applications-objects.svg',
    'assets/site/abstract-objects.svg',
    'assets/site/simple-api.svg',
    'assets/site/storage-internals.svg',
    'assets/site/run-and-deploy.svg'
  ];

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
    // A standalone Markdown image becomes the section's explanatory artwork.
    const image = body.querySelector(':scope > p > img:only-child');
    if (image) {
      const paragraph = image.parentElement;
      const figure = document.createElement('figure');
      const isHero = heading.id === 'top';
      figure.className = isHero ? 'hero-art' : 'section-art';
      const source = image.getAttribute('src').replace(/^\.?\//, '');
      if (Object.hasOwn(illustrations, source)) {
        figure.setAttribute('role', 'img');
        figure.setAttribute('aria-label', image.alt);
        figure.innerHTML = illustrations[source];
        figure.querySelector('svg').setAttribute('aria-hidden', 'true');
      } else {
        image.fetchPriority = isHero ? 'high' : 'auto';
        figure.append(image);
      }
      paragraph.remove();
      if (isHero) section.prepend(figure);
      else section.append(figure);
      if (!isHero) section.classList.add('section-illustrated');
    }
    if (heading.id === 'deployment') {
      section.classList.add('deployment-section');
      body.querySelector(':scope > ul')?.classList.add('deployment-options');
      // Markdown owns the deployment explanations and the links below them.
      const cloudLabel = body.querySelector('#bring-your-own-cloud');
      const providers = cloudLabel?.nextElementSibling;
      if (providers?.tagName === 'UL') {
        const source = cloudLabel.previousElementSibling;
        const installation = document.createElement('div');
        installation.className = 'deployment-links';
        cloudLabel.before(installation);
        if (source?.matches('p') && source.querySelector('a:only-child')) {
          source.classList.add('installation-source');
          installation.append(source);
        }
        installation.append(cloudLabel, providers);
      }
    }
    if (heading.id === 'top') {
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
        current.className = `page-section section-${node.id === 'top' ? 'hero' : 'text'}`;
        current.innerHTML = '<div class="section-copy"><div class="markdown-body"></div></div>';
        sections.push(current);
      }
      if (current) current.querySelector('.markdown-body').append(node);
    }
    if (sections[0]?.dataset.section !== 'top') throw new Error('home.md: keep the # headline with :id=top first.');
    sections.forEach(decorateSection);
    const [hero, ...content] = sections;
    // The object story leads into the three feature columns and later detail sections.
    const intro = content.find(section => section.dataset.section === 'build-with-objects');
    intro?.classList.add('detail-section', 'intro-section');
    const remaining = content.filter(section => section !== intro);
    const features = remaining.slice(0, 3);
    const details = remaining.slice(3);
    details.forEach(section => section.classList.add('detail-section'));
    const featureGrid = features.length ? `<div class="feature-grid">${features.map(section => section.outerHTML).join('')}</div>` : '';
    return `<div class="page-layout"><div id="sidebar-slot"></div><div class="sections-root">${hero.outerHTML}${intro?.outerHTML || ''}${featureGrid}${details.map(section => section.outerHTML).join('')}</div></div>`;
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
    const contentTop = section => Math.min(...[...section.children].map(element => element.getBoundingClientRect().top));
    // Keep artwork visible when it is above or taller than its neighboring copy.
    const measureAnchors = () => {
      for (const section of sections.filter(section => section.matches('.section-illustrated, .section-hero'))) {
        const heading = section.querySelector('h1, h2');
        const offset = Math.max(56, heading.getBoundingClientRect().top - contentTop(section) + 8);
        section.style.setProperty('--section-anchor-offset', `${offset}px`);
      }
    };
    const sectionSizes = new ResizeObserver(measureAnchors);
    sections.forEach(section => sectionSizes.observe(section));
    signal.addEventListener('abort', () => sectionSizes.disconnect(), { once: true });
    measureAnchors();
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
      let currentRow = -Infinity;
      const requested = new URLSearchParams(location.hash.split('?')[1] || '').get('id');
      const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
      for (const section of sections) {
        const top = contentTop(section);
        if (top > (atEnd ? innerHeight : 180)) continue;
        // Columns share a vertical position: retain the selected column within that row.
        if (top > currentRow + 1 || (Math.abs(top - currentRow) <= 1 && section.dataset.section === requested)) {
          current = section.dataset.section;
          currentRow = top;
        }
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
      'content/labels.md', ...illustrationFiles
    ].map(async file => {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`${file}: request failed (${response.status}).`);
      return response.text();
    })).then(async ([labelMarkdown, ...artwork]) => {
      labels = readLabels(labelMarkdown);
      illustrations = Object.fromEntries(illustrationFiles.map((file, i) => [file, artwork[i]]));
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
    executeScript: false,
    notFoundPage: false,
    plugins: [objyTheme]
  };
})();
