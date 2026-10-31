import * as i18n from './languages.mjs';
import * as pages from './pages.mjs';
import { createCopy, readMarkdown, sanitizeMarkup } from './markup.mjs';
import { decorateHomepage } from './homepage.mjs';
import { decorateDocument, wireDocuments } from './documents.mjs';
import { wireExamples } from './examples.mjs';

/* Editorial content lives in content/<language>/*.md. */
let copy;
let bindCopy;
let language;
let languageRegistry;
let homepageSidebar;
let currentPage;

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
  const documentPage = document.querySelector('.document-page');
  const directory = documentPage?.matches('.document-directory, .document-accordion') || false;
  sidebar.hidden = directory;
  document.querySelector('.section-menu-toggle').hidden = directory;
  nav.classList.toggle('chapter-links', Boolean(documentPage));
  if (documentPage) {
    const headings = [...documentPage.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')];
    const title = headings[0];
    const chapters = title?.tagName === 'H1' && headings.length > 1 ? headings.slice(1) : headings;
    const firstLevel = Math.min(...chapters.map((heading) => Number(heading.tagName.slice(1))));
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
  } else {
    nav.replaceChildren(readMarkdown(homepageSidebar));
    nav.querySelectorAll('a').forEach((link) => {
      const href = link.getAttribute('href');
      if (!/^(?:[a-z]+:|\/\/)/i.test(href)) link.href = vm.router.toURL(href, null, '/');
    });
  }
  slot.replaceWith(sidebar);
}

function anchorId(link) {
  return new URLSearchParams(link.hash.split('?')[1] || '').get('id');
}

function updateHeaderNavigation(route) {
  const normalize = (path) =>
    decodeURI(path.split('?')[0]).replace(/\.(?:md|markdown)$/i, '').replace(/\/+$/, '') || '/';
  const current = normalize(route);
  const links = [...document.querySelectorAll('.header-links a')];
  const match = links
    .map((link) => ({ link, url: new URL(link.href) }))
    .filter(({ url }) => url.origin === location.origin && url.hash.startsWith('#/'))
    .map(({ link, url }) => ({ link, path: normalize(url.hash.slice(1)) }))
    .filter(({ path }) => current === path || (path !== '/' && current.startsWith(`${path}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0]?.link;
  // Guides without their own top-level link belong to the documentation entry.
  const active =
    match || (current !== '/' && links.find((link) => link.hasAttribute('data-navigation-fallback')));
  links.forEach((link) => {
    if (link === active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

let navigationEvents;
function wireNavigation() {
  navigationEvents?.abort();
  navigationEvents = new AbortController();
  const signal = navigationEvents.signal;
  wireExamples(signal);
  wireDocuments(signal);
  document.querySelector('.skip-link').addEventListener(
    'click',
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const main = document.getElementById('main');
      main.focus({ preventScroll: true });
      main.scrollIntoView({ block: 'start', behavior: 'auto' });
    },
    { signal },
  );
  const nav = document.getElementById('section-links');
  const menu = document.querySelector('.section-menu-toggle');
  const sections = [
    ...document.querySelectorAll('.sections-root .page-section, .document-page [data-chapter]'),
  ];
  if (!nav || !menu) return;
  const links = [...nav.querySelectorAll('a')];
  const contentTop = (section) =>
    section.hasAttribute('data-chapter')
      ? section.getBoundingClientRect().top
      : Math.min(...[...section.children].map((element) => element.getBoundingClientRect().top));
  // Keep artwork visible when it is above or taller than its neighboring copy.
  const measureAnchors = () => {
    for (const section of sections.filter((section) =>
      section.matches('.section-illustrated, .section-hero'),
    )) {
      const heading = section.querySelector('h1, h2');
      const offset = Math.max(56, heading.getBoundingClientRect().top - contentTop(section) + 8);
      section.style.setProperty('--section-anchor-offset', `${offset}px`);
    }
  };
  const sectionSizes = new ResizeObserver(measureAnchors);
  sections.forEach((section) => sectionSizes.observe(section));
  signal.addEventListener('abort', () => sectionSizes.disconnect(), { once: true });
  measureAnchors();
  const closeMenu = () => {
    menu.setAttribute('aria-expanded', 'false');
    menu.querySelector('.menu-indicator').textContent = '+';
    document.querySelector('.page-sidebar').classList.remove('menu-open');
  };
  closeMenu();
  menu.addEventListener(
    'click',
    () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.querySelector('.menu-indicator').textContent = open ? '−' : '+';
      document.querySelector('.page-sidebar').classList.toggle('menu-open', open);
    },
    { signal },
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menu.focus();
      }
    },
    { signal },
  );
  links.forEach((link) =>
    link.addEventListener(
      'click',
      () => {
        if (window.matchMedia('(max-width: 760px)').matches) {
          const target = document.getElementById(anchorId(link));
          closeMenu();
          target?.setAttribute('tabindex', '-1');
          target?.focus({ preventScroll: true });
        }
      },
      { signal },
    ),
  );
  let scheduled = 0;
  signal.addEventListener('abort', () => cancelAnimationFrame(scheduled), { once: true });
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
    links.forEach((link) => {
      if (anchorId(link) === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = 0;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!scheduled) scheduled = requestAnimationFrame(updateActive);
    },
    { signal, passive: true },
  );
  window.addEventListener('resize', updateActive, { signal });
  window.addEventListener('hashchange', updateActive, { signal });
  updateActive();
}

function wireCopyButtons() {
  document.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    const controls = pre.parentElement.matches('.example-code')
      ? pre.parentElement.querySelector('.example-code-header')
      : pre;
    if (!code) return;
    // Section jumps can rebind navigation without replacing the code window.
    const button = controls.querySelector('.copy-button') || document.createElement('button');
    button.type = 'button';
    button.className = 'copy-button';
    button.textContent = copy('controls.copy-button');
    button.setAttribute('aria-label', copy('controls.copy-label'));
    button.setAttribute('aria-live', 'polite');
    button.addEventListener(
      'click',
      async () => {
        try {
          await navigator.clipboard.writeText(code.textContent.trim());
          button.textContent = copy('controls.copy-success');
        } catch {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(code);
          selection.removeAllRanges();
          selection.addRange(range);
          button.textContent = copy('controls.copy-fallback');
        }
        const timer = window.setTimeout(() => {
          button.textContent = copy('controls.copy-button');
        }, 2500);
        navigationEvents.signal.addEventListener('abort', () => clearTimeout(timer), { once: true });
      },
      { signal: navigationEvents.signal },
    );
    controls.append(button);
  });
}

function objyTheme(hook, vm) {
  let contentReady;
  let loadError;
  // Docsify supplies Prism. Load local grammars before the first Markdown render;
  // HTTP embeds JSON and Markdown embeds YAML, so their dependencies go first.
  const syntaxReady = Promise.all([
    import('../vendor/prism-json.min.js'),
    import('../vendor/prism-bash.min.js'),
    import('../vendor/prism-typescript.min.js'),
    import('../vendor/prism-yaml.min.js'),
  ])
    .then(() => Promise.all([
      import('../vendor/prism-http.min.js'),
      import('../vendor/prism-markdown.min.js'),
    ]))
    .catch((error) => console.warn('Extra code highlighting languages could not load:', error));
  const labelFiles = [`content/${languageRegistry.defaultLanguage}/labels.md`];
  if (language.code !== languageRegistry.defaultLanguage)
    labelFiles.push(`content/${language.code}/labels.md`);
  const loadContent = () =>
    (contentReady ||= Promise.all(
      [...labelFiles, `content/${language.code}/sidebar.md`].map(async (file) => {
        const response = await fetch(file, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`${file}: request failed (${response.status}).`);
        return response.text();
      }),
    ).then(async (files) => {
      // New UI labels fall back to the default until their translation is supplied.
      ({ copy, bindCopy } = createCopy(files.slice(0, labelFiles.length)));
      homepageSidebar = files[labelFiles.length];
      await document.fonts.ready;
    }));

  hook.beforeEach(async (markdown, next) => {
    const page = currentPage;
    const path = vm.route.path;
    // Keep Docsify's own sidebar alive when it replaces the article on route changes.
    const sidebar = document.querySelector('aside.sidebar');
    if (sidebar) {
      sidebar.classList.remove('page-sidebar');
      document.querySelector('main').prepend(sidebar);
    }
    let error;
    try {
      await Promise.all([loadContent(), syntaxReady]);
    } catch (failure) {
      error = failure;
      contentReady = null;
      console.error('OBJY content could not load:', failure);
    }
    if (page !== currentPage || path !== vm.route.path) return;
    loadError = error;
    if (!currentPage && !loadError) {
      markdown = `# ${copy('documents.unavailable-title')}\n\n${copy('documents.unavailable-description')}\n\n[${copy('documents.back-home')}](/?id=top)`;
    }
    next(markdown);
  });

  hook.afterEach(async (html, next) => {
    const page = currentPage;
    const path = vm.route.path;
    const clean = sanitizeMarkup(html);
    let content = decorateDocument(clean);
    if (!loadError && path === '/' && page) {
      try {
        content = await decorateHomepage(clean, {
          async loadCards(href) {
            const url = new URL(href, location.href);
            if (url.origin !== location.origin) return null;
            const route = url.hash.startsWith('#/') ? url.hash.slice(1).split('?')[0] :
              url.pathname.slice(new URL('./', document.baseURI).pathname.length);
            try {
              const source = await pages.loadMarkdown(pages.markdownFiles(
                route, language.code, languageRegistry.defaultLanguage,
                languageRegistry.languages.map((entry) => entry.code),
              ));
              if (!source || page !== currentPage || path !== vm.route.path) return null;
              return sanitizeMarkup(vm.compiler.compile(source.markdown));
            } catch (error) {
              console.warn('Feature cards could not load:', error);
              return null;
            }
          },
        });
      } catch (error) {
        console.error('OBJY theme could not format this page:', error);
      }
    }
    // Slow artwork from an earlier navigation must never replace the current document.
    if (page !== currentPage || path !== vm.route.path) return;
    next(`<div class="page-layout"><div id="sidebar-slot"></div>${content}</div>`);
  });

  hook.doneEach(() => {
    if (loadError) return;
    mountSidebar(vm);
    bindCopy();
    updateHeaderNavigation(vm.route.path);
    wireNavigation();
    wireCopyButtons();
    document.getElementById('main').setAttribute('tabindex', '-1');
  });
}

async function startSite() {
  const registry = await fetch('content/languages.json').then((response) => {
    if (!response.ok) throw new Error(`Language registry: ${response.status}`);
    return response.json();
  });
  languageRegistry = i18n.validateRegistry(registry);
  let saved;
  try {
    saved = localStorage.getItem('objy.language');
  } catch {
    /* Storage is optional. */
  }
  language = i18n.chooseLanguage(registry, new URL(location.href).searchParams.get('lang'), saved);
  document.documentElement.lang = language.code;
  history.replaceState(history.state, '', i18n.withLanguage(location.href, language.code));
  try {
    localStorage.setItem('objy.language', language.code);
  } catch {
    /* URL still preserves the selection. */
  }

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
    link.addEventListener('click', (event) => {
      if (choice.code === language.code) {
        event.preventDefault();
        switcher.open = false;
        summary.focus();
      }
      try {
        localStorage.setItem('objy.language', choice.code);
      } catch {
        /* Optional preference. */
      }
    });
    item.append(link);
    choices.append(item);
  }
  const updateLanguageLinks = () => {
    choices.querySelectorAll('a').forEach((link) => {
      link.href = i18n.withLanguage(location.href, link.hreflang);
    });
    switcher.open = false;
  };
  updateLanguageLinks();
  window.addEventListener('hashchange', updateLanguageLinks);
  document.addEventListener('click', (event) => {
    if (!switcher.contains(event.target)) switcher.open = false;
  });
  switcher.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      switcher.open = false;
      summary.focus();
    }
  });

  let pageRequest;
  const renderMarkdown = (route, match, done) => {
    pageRequest?.abort();
    const request = (pageRequest = new AbortController());
    Promise.resolve()
      .then(() => {
        const files = pages.markdownFiles(
          route,
          language.code,
          registry.defaultLanguage,
          registry.languages.map((item) => item.code),
        );
        return pages.loadMarkdown(files, { signal: request.signal });
      })
      .then((page) => {
        if (request.signal.aborted) return;
        currentPage = page;
        done(page?.markdown || '');
      })
      .catch((error) => {
        if (request.signal.aborted) return;
        console.error('Markdown page could not load:', error);
        currentPage = null;
        done('');
      });
  };
  window.$docsify = {
    el: '#app',
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
          if (source)
            token = {
              ...token,
              href: pages.contentLink(token.href, source, type === 'image', new URL('./', document.baseURI)),
            };
          return render.call(this, token);
        };
      }
      marked.setOptions({ renderer });
      return marked;
    },
    plugins: [objyTheme],
  };
  // Docsify starts only after its language-specific routes are configured.
  const engine = document.createElement('script');
  engine.src = 'assets/vendor/docsify.min.js';
  engine.onerror = () => console.error('The local Docsify engine could not load.');
  document.head.append(engine);
}

startSite().catch((error) => {
  console.error('OBJY could not start:', error);
  const message = document.querySelector('.loading-message');
  message.textContent = 'OBJY could not load. Please reload the page.';
  message.setAttribute('role', 'alert');
});
