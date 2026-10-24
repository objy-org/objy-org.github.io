/* Editorial content lives in content/<language>/*.md. */
(() => {
  'use strict';

  let labels;
  let language;
  let languageRegistry;
  let homepageSidebar;
  let currentPage;
  let illustrations = {};
  const illustrationFiles = [
    'assets/site/applications-objects.svg',
    'assets/site/abstract-objects.svg',
    'assets/site/simple-api.svg',
    'assets/site/storage-internals.svg',
    'assets/site/object-capabilities.svg',
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
    document.querySelector('[role="progressbar"]')?.setAttribute('aria-label', copy('controls.loading-label'));
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
      // Each Markdown subheading groups its explanation and links into one option.
      const options = document.createElement('div');
      options.className = 'deployment-options';
      let option;
      for (const node of [...body.childNodes]) {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'H3') {
          option = document.createElement('div');
          option.className = 'deployment-option';
          option.setAttribute('role', 'group');
          option.setAttribute('aria-labelledby', node.id);
          options.append(option);
        }
        if (option) option.append(node);
      }
      if (options.children.length) body.append(options);
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
    // The hero leads directly into three feature columns and later detail sections.
    const features = content.slice(0, 3);
    const details = content.slice(3);
    details.forEach(section => section.classList.add('detail-section'));
    const featureGrid = features.length ? `<div class="feature-grid">${features.map(section => section.outerHTML).join('')}</div>` : '';
    return `<div class="page-layout"><div id="sidebar-slot"></div><div class="sections-root">${hero.outerHTML}${featureGrid}${details.map(section => section.outerHTML).join('')}</div></div>`;
  }

  function mountSidebar(vm) {
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
    const caption = sidebar.querySelector('.sidebar-heading');
    const documentPage = document.querySelector('.document-page');
    nav.classList.toggle('chapter-links', Boolean(documentPage));
    if (documentPage) {
      const headings = [...documentPage.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')];
      const title = headings[0];
      const chapters = title?.tagName === 'H1' && headings.length > 1 ? headings.slice(1) : headings;
      const firstLevel = Math.min(...chapters.map(heading => Number(heading.tagName.slice(1))));
      const list = document.createElement('ul');
      for (const heading of chapters) {
        const item = document.createElement('li');
        const link = document.createElement('a');
        link.textContent = heading.textContent;
        link.href = vm.router.toURL(vm.route.path, { id: heading.id });
        item.style.setProperty('--chapter-depth', Math.min(3, Number(heading.tagName.slice(1)) - firstLevel));
        if (Number(heading.tagName.slice(1)) > firstLevel) item.classList.add('subchapter');
        heading.dataset.chapter = heading.id;
        item.append(link);
        list.append(item);
      }
      nav.replaceChildren(list);
      caption.removeAttribute('data-copy');
      caption.textContent = title?.textContent || copy('navigation.section-navigation-label');
    } else {
      caption.dataset.copy = 'navigation.sidebar-heading';
      nav.replaceChildren(readMarkdown(homepageSidebar));
      nav.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (!/^(?:[a-z]+:|\/\/)/i.test(href)) link.href = vm.router.toURL(href, null, '/');
      });
    }
    slot.replaceWith(sidebar);
  }

  function anchorId(link) {
    return new URLSearchParams(link.hash.split('?')[1] || '').get('id');
  }

  function wireFeatureConnections(signal) {
    const grid = document.querySelector('.feature-grid');
    if (!grid) return;
    const artwork = id => grid.querySelector(`[data-section="${id}"] .section-art`);
    const objects = artwork('abstract-objects');
    const api = artwork('simple-api');
    const runtime = artwork('run-and-deploy');
    if (!objects || !api || !runtime) return;
    const overlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    overlay.classList.add('feature-connections');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('focusable', 'false');
    const connections = [
      { source: api, from: 'right', to: 'left', name: 'api' },
      { source: runtime, from: 'left', to: 'right', name: 'runtime' }
    ];
    overlay.innerHTML = connections.map(({ name }) => `<g class="feature-connection-${name}"><path class="connection-curve"/><path class="connection-tip"/></g>`).join('');
    grid.append(overlay);

    // Artwork edges locate the open gaps; arrows stay clear of the illustrations.
    const port = (figure, side, origin) => {
      const svg = figure.querySelector('svg');
      const bounds = (svg || figure).getBoundingClientRect();
      const coordinates = svg?.getAttribute(`data-connection-${side}`)?.trim().split(/\s+/).map(Number);
      const viewBox = svg?.viewBox.baseVal;
      if (coordinates?.length === 2 && coordinates.every(Number.isFinite) && viewBox?.width > 0 && viewBox.height > 0) {
        return {
          x: bounds.left - origin.left + (coordinates[0] - viewBox.x) / viewBox.width * bounds.width,
          y: bounds.top - origin.top + (coordinates[1] - viewBox.y) / viewBox.height * bounds.height
        };
      }
      return { x: (side === 'left' ? bounds.left : bounds.right) - origin.left, y: bounds.top + bounds.height / 2 - origin.top };
    };
    const draw = () => {
      const bounds = overlay.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      overlay.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
      connections.forEach(({ source, from, to }, index) => {
        const edge = port(source, from, bounds);
        const target = port(objects, to, bounds);
        const direction = Math.sign(target.x - edge.x);
        const length = Math.min(112, Math.max(0, Math.abs(target.x - edge.x) - 32));
        const middle = (edge.x + target.x) / 2;
        const start = { x: middle - direction * length / 2, y: edge.y };
        const end = { x: middle + direction * length / 2, y: target.y };
        const bend = (index ? 1 : -1) * Math.min(30, length * .34);
        const control = { x: end.x - direction * length * .28, y: end.y + bend };
        const angle = Math.atan2(end.y - control.y, end.x - control.x);
        const wing = offset => `${end.x - 8 * Math.cos(angle + offset)} ${end.y - 8 * Math.sin(angle + offset)}`;
        const group = overlay.children[index];
        group.querySelector('.connection-curve').setAttribute('d', `M${start.x} ${start.y} C${start.x + direction * length * .28} ${start.y + bend} ${control.x} ${control.y} ${end.x} ${end.y}`);
        group.querySelector('.connection-tip').setAttribute('d', `M${wing(-.6)} L${end.x} ${end.y} L${wing(.6)}`);
      });
    };
    const sizes = new ResizeObserver(draw);
    [grid, objects, api, runtime].forEach(element => sizes.observe(element));
    signal.addEventListener('abort', () => {
      sizes.disconnect();
      overlay.remove();
    }, { once: true });
    draw();
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
    const sections = [...document.querySelectorAll('.sections-root .page-section, .document-page [data-chapter]')];
    if (!nav || !menu) return;
    wireFeatureConnections(signal);
    const links = [...nav.querySelectorAll('a')];
    const contentTop = section => section.hasAttribute('data-chapter')
      ? section.getBoundingClientRect().top
      : Math.min(...[...section.children].map(element => element.getBoundingClientRect().top));
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
    closeMenu();
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
        const id = section.dataset.chapter || section.dataset.section;
        if (top > (atEnd ? innerHeight : 180)) continue;
        // Columns share a vertical position: retain the selected column within that row.
        if (top > currentRow + 1 || (Math.abs(top - currentRow) <= 1 && id === requested)) {
          current = id;
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
    const labelFiles = [`content/${languageRegistry.defaultLanguage}/labels.md`];
    if (language.code !== languageRegistry.defaultLanguage) labelFiles.push(`content/${language.code}/labels.md`);
    const loadContent = () => contentReady ||= Promise.all([
      ...labelFiles, `content/${language.code}/sidebar.md`, ...illustrationFiles
    ].map(async file => {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`${file}: request failed (${response.status}).`);
      return response.text();
    })).then(async files => {
      // New UI labels fall back to the default until their translation is supplied.
      labels = Object.assign(Object.create(null), ...files.slice(0, labelFiles.length).map(readLabels));
      homepageSidebar = files[labelFiles.length];
      const artwork = files.slice(labelFiles.length + 1);
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
      if (!currentPage && !loadError) {
        markdown = `# ${copy('documents.unavailable-title')}\n\n${copy('documents.unavailable-description')}\n\n[${copy('documents.back-home')}](/?id=top)`;
      }
      next(markdown);
    });

    hook.afterEach(html => {
      if (loadError) return html; // Keep Docsify's readable Markdown output available.
      try {
        return vm.route.path === '/' && currentPage ? decorateHomepage(html) : `<div class="page-layout"><div id="sidebar-slot"></div><div class="document-page">${html}</div></div>`;
      } catch (error) {
        console.error('OBJY theme could not format this page:', error);
        return `<div class="page-layout"><div id="sidebar-slot"></div><div class="document-page">${html}</div></div>`;
      }
    });

    hook.doneEach(() => {
      if (loadError) return;
      mountSidebar(vm);
      bindCopy();
      wireNavigation();
      wireCopyButtons();
      document.getElementById('main').setAttribute('tabindex', '-1');
    });
  }

  async function startSite() {
    const [i18n, pages, registry] = await Promise.all([
      import('./languages.mjs'),
      import('./pages.mjs'),
      fetch('content/languages.json').then(response => {
        if (!response.ok) throw new Error(`Language registry: ${response.status}`);
        return response.json();
      })
    ]);
    languageRegistry = i18n.validateRegistry(registry);
    let saved;
    try { saved = localStorage.getItem('objy.language'); } catch { /* Storage is optional. */ }
    language = i18n.chooseLanguage(registry, new URL(location.href).searchParams.get('lang'), saved);
    document.documentElement.lang = language.code;
    history.replaceState(history.state, '', i18n.withLanguage(location.href, language.code));
    try { localStorage.setItem('objy.language', language.code); } catch { /* URL still preserves the selection. */ }

    const switcher = document.querySelector('.language-switcher');
    const summary = switcher.querySelector('summary');
    switcher.querySelector('.current-language').textContent = language.short;
    const choices = switcher.querySelector('ul');
    for (const choice of registry.languages) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.textContent = choice.name;
      link.lang = choice.code;
      link.hreflang = choice.code;
      if (choice.code === language.code) link.setAttribute('aria-current', 'true');
      link.addEventListener('click', event => {
        if (choice.code === language.code) {
          event.preventDefault();
          switcher.open = false;
          summary.focus();
        }
        try { localStorage.setItem('objy.language', choice.code); } catch { /* Optional preference. */ }
      });
      item.append(link);
      choices.append(item);
    }
    const updateLanguageLinks = () => {
      choices.querySelectorAll('a').forEach(link => { link.href = i18n.withLanguage(location.href, link.hreflang); });
      switcher.open = false;
    };
    updateLanguageLinks();
    window.addEventListener('hashchange', updateLanguageLinks);
    document.addEventListener('click', event => {
      if (!switcher.contains(event.target)) switcher.open = false;
    });
    switcher.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        switcher.open = false;
        summary.focus();
      }
    });

    let pageRequest;
    const renderMarkdown = (route, match, done) => {
      pageRequest?.abort();
      const request = pageRequest = new AbortController();
      Promise.resolve().then(() => {
        const files = pages.markdownFiles(route, language.code, registry.defaultLanguage, registry.languages.map(item => item.code));
        return pages.loadMarkdown(files, { signal: request.signal });
      }).then(page => {
        if (request.signal.aborted) return;
        currentPage = page;
        done(page?.markdown || '');
      }).catch(error => {
        if (request.signal.aborted) return;
        console.error('Markdown page could not load:', error);
        currentPage = null;
        done('');
      });
    };
    window.$docsify = {
      el: '#app',
      homepage: `content/${language.code}/home.md`,
      loadSidebar: false,
      relativePath: true,
      routes: { '/.*': renderMarkdown },
      loadNavbar: false,
      maxLevel: 2,
      subMaxLevel: 0,
      skipLink: false,
      keyBindings: false,
      auto2top: true,
      externalLinkTarget: '_self',
      executeScript: false,
      notFoundPage: false,
      markdown(marked, renderer) {
        // Remote documents use the same renderer and menu, with their own link base.
        for (const type of ['link', 'image']) {
          const render = renderer[type];
          renderer[type] = function (token) {
            const source = currentPage?.file;
            if (source && /^https?:\/\//i.test(source)) {
              token = { ...token, href: pages.remoteLink(token.href, source, type === 'image') };
            }
            return render.call(this, token);
          };
        }
        marked.setOptions({ renderer });
        return marked;
      },
      plugins: [objyTheme]
    };
    // Docsify starts only after its language-specific routes are configured.
    const engine = document.createElement('script');
    engine.src = 'assets/vendor/docsify.min.js';
    engine.onerror = () => console.error('The local Docsify engine could not load.');
    document.head.append(engine);
  }

  startSite().catch(error => {
    console.error('OBJY could not start:', error);
    const message = document.querySelector('.loading-message');
    message.textContent = 'OBJY could not load. Please reload the page.';
    message.setAttribute('role', 'alert');
  });
})();
