/* Page copy lives in content/home.md. Only presentation and interactions live here. */
(() => {
  'use strict';

  const cube = '<svg class="cube-icon" viewBox="0 0 48 52" aria-hidden="true"><path d="m24 2 22 12.5v25L24 52 2 39.5v-25Z M2 14.5 24 27l22-12.5 M24 27v25"/></svg>';
  const arrow = '<span aria-hidden="true">↗</span>';
  const visuals = {
    hero: () => '<figure class="hero-art"><img src="assets/site/object-universe.svg" width="640" height="600" alt="An abstract object connects to other objects: a thing, a pattern, an idea, and a system."></figure>',
    philosophy: () => `<figure class="philosophy-visual" aria-label="Things, behavior, and connections combine into possibilities"><div class="idea-shape">${cube}<span>A thing</span></div><span class="idea-plus" aria-hidden="true">+</span><div class="idea-shape"><span class="behavior-symbol" aria-hidden="true">↯</span><span>A behavior</span></div><span class="idea-plus" aria-hidden="true">+</span><div class="idea-shape"><span class="connection-symbol" aria-hidden="true">⌘</span><span>A connection</span></div><div class="idea-result">A starting point for anything. ${arrow}</div></figure>`,
    product: () => `<figure class="product-visual"><div class="object-title"><span class="status-dot"></span> object / 001 <span class="object-braces">{ }</span></div><div class="object-layer"><span class="layer-symbol">◇</span><div><strong>Properties</strong><span>What it is</span></div><span class="layer-index">01</span></div><div class="object-layer"><span class="layer-symbol">↯</span><div><strong>Behavior</strong><span>What it does</span></div><span class="layer-index">02</span></div><div class="object-layer"><span class="layer-symbol">◎</span><div><strong>Context</strong><span>Where it belongs</span></div><span class="layer-index">03</span></div><figcaption>More than a record. An object.</figcaption></figure>`,
    objects: () => `<figure class="object-demo diagram"><div class="demo-options" role="group" aria-label="Choose an example object"><button type="button" data-example="device" aria-pressed="true">A device</button><button type="button" data-example="document" aria-pressed="false">A document</button><button type="button" data-example="idea" aria-pressed="false">Your idea</button></div><div class="demo-body" aria-live="polite" aria-atomic="true"><div class="demo-object-name">${cube}<span id="example-name"></span><span class="demo-type">object</span></div><dl id="example-properties"></dl></div><figcaption>Different possibilities. The same building block.</figcaption></figure>`,
    inheritance: () => `<figure class="diagram inheritance-diagram"><div class="template-object"><span class="diagram-kicker">TEMPLATE</span><strong>${cube} Sensor</strong><div class="property-line"><span>unit</span><code>°C</code></div><div class="property-line"><span>interval</span><code>60s</code></div></div><div class="inheritance-lines" aria-hidden="true"><span>inherits</span></div><div class="child-objects"><div><span class="diagram-kicker">OBJECT / A</span><strong>Greenhouse</strong><span class="inherited-value">°C · 60s</span><code>value: 24</code></div><div><span class="diagram-kicker">OBJECT / B</span><strong>Cold storage</strong><span class="inherited-value">°C · 60s</span><code>value: 4</code></div></div><figcaption>Shared foundations. Room to be different.</figcaption></figure>`,
    behavior: () => `<figure class="diagram behavior-diagram"><div class="behavior-object">${cube}<span>One object. Its own behavior.</span></div><div class="behavior-route"><span class="event-dot"></span><code>onCreate</code><span class="route-line"></span><span class="action-label">Initialize</span></div><div class="behavior-route"><span class="event-dot"></span><code>onChange</code><span class="route-line"></span><span class="action-label">Respond</span></div><div class="behavior-route"><span class="event-dot"></span><code>onDelete</code><span class="route-line"></span><span class="action-label">Clean up</span></div><div class="time-event"><span aria-hidden="true">◷</span><span>A moment in time.</span><span>Another possibility.</span></div><figcaption>Illustrative actions, defined by you.</figcaption></figure>`,
    context: () => `<figure class="diagram context-diagram"><div class="tenant tenant-a"><div class="tenant-label"><span class="status-dot"></span> Workspace A</div><div class="tenant-objects">${cube}${cube}${cube}</div><div class="permission-label"><span aria-hidden="true">↳</span> editor <code>create · read · update</code></div></div><div class="tenant tenant-b"><div class="tenant-label"><span class="status-dot"></span> Workspace B</div><div class="tenant-objects">${cube}${cube}${cube}</div><div class="permission-label"><span aria-hidden="true">↳</span> viewer <code>read</code></div></div><figcaption>Different contexts. Clearly defined access.</figcaption></figure>`,
    storage: () => `<figure class="diagram storage-diagram"><div class="storage-object">${cube}<strong>Your objects</strong><span>One familiar model</span></div><div class="storage-connector" aria-hidden="true"></div><div class="storage-options"><div><span aria-hidden="true">▦</span><strong>Memory</strong><small>Start simply</small></div><div><span aria-hidden="true">◉</span><strong>MongoDB</strong><small>Use a mapper</small></div><div><span aria-hidden="true">{ }</span><strong>Your backend</strong><small>Make it yours</small></div></div><figcaption>Choose where your objects call home.</figcaption></figure>`,
    start: () => `<div class="start-art" aria-hidden="true">${cube}<span>idea → object → anything</span></div>`
  };

  const examples = {
    device: { name: 'Greenhouse sensor', properties: [['type', 'sensor'], ['temperature', '24'], ['online', 'true'], ['location', '{ greenhouse: "A" }']] },
    document: { name: 'A living document', properties: [['type', 'document'], ['title', 'A new beginning'], ['published', 'false'], ['content', '{ language: "en" }']] },
    idea: { name: 'Something entirely new', properties: [['type', 'your idea'], ['possibilities', 'open'], ['ready', 'true'], ['details', '{ upTo: "you" }']] }
  };

  function parseSections(markdown) {
    const markers = [...markdown.matchAll(/^<!--\s*section:\s*([^\n]+?)\s*-->\s*$/gm)];
    if (!markers.length) throw new Error('No page sections found.');
    return markers.map((match, index) => {
      const fields = Object.fromEntries(('section: ' + match[1]).split(';').map(field => {
        const separator = field.indexOf(':');
        return [field.slice(0, separator).trim(), field.slice(separator + 1).trim()];
      }));
      if (!/^[a-z][a-z0-9-]*$/.test(fields.section)) throw new Error('Invalid section ID.');
      return { ...fields, markdown: markdown.slice(match.index + match[0].length, markers[index + 1]?.index ?? markdown.length).trim() };
    });
  }

  function renderSection(data) {
    const section = document.createElement('section');
    section.id = data.section;
    section.className = `page-section section-${data.visual || 'text'}`;
    const content = document.createElement('div');
    content.className = 'section-copy';
    const eyebrow = document.createElement('p');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = data.eyebrow;
    content.append(eyebrow);
    const markdownBody = document.createElement('div');
    markdownBody.className = 'markdown-body';
    // This is the repository's own, trusted Markdown, never user-submitted content.
    markdownBody.innerHTML = marked.parse(data.markdown);
    content.append(markdownBody);
    section.append(content);
    const heading = content.querySelector('h1, h2');
    if (heading) {
      heading.id = `${data.section}-heading`;
      section.setAttribute('aria-labelledby', heading.id);
    }
    if (visuals[data.visual]) section.insertAdjacentHTML('beforeend', visuals[data.visual]());
    for (const paragraph of markdownBody.querySelectorAll(':scope > p')) {
      const links = [...paragraph.children];
      if (links.length && links.every(element => element.tagName === 'A') && ![...paragraph.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) {
        paragraph.classList.add('section-actions');
        links[0].classList.add('button-primary');
        links[0].insertAdjacentHTML('beforeend', '<span aria-hidden="true">↗</span>');
        links.slice(1).forEach(link => link.classList.add('button-text'));
      }
    }
    return section;
  }

  function setExample(key) {
    const example = examples[key];
    document.getElementById('example-name').textContent = example.name;
    const properties = document.getElementById('example-properties');
    properties.replaceChildren();
    for (const [label, value] of example.properties) {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value;
      row.append(term, description);
      properties.append(row);
    }
    document.querySelectorAll('[data-example]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.example === key)));
  }

  function wireNavigation(sections) {
    const nav = document.getElementById('section-links');
    const menu = document.querySelector('.section-menu-toggle');
    for (const data of sections) {
      const link = document.createElement('a');
      link.href = `#${data.section}`;
      const number = document.createElement('span');
      number.className = 'nav-number';
      number.setAttribute('aria-hidden', 'true');
      number.textContent = data.eyebrow?.match(/^\d+/)?.[0] || (data.visual === 'start' ? '↗' : '·');
      link.append(number, document.createTextNode(data.nav));
      nav.append(link);
    }
    const closeMenu = () => {
      menu.setAttribute('aria-expanded', 'false');
      menu.querySelector('span').textContent = '+';
      document.querySelector('.page-sidebar').classList.remove('menu-open');
    };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      menu.querySelector('span').textContent = open ? '−' : '+';
      document.querySelector('.page-sidebar').classList.toggle('menu-open', open);
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
        closeMenu();
        menu.focus();
      }
    });
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', () => {
        if (link.closest('#section-links') && window.matchMedia('(max-width: 760px)').matches) {
          const target = document.getElementById(link.hash.slice(1));
          closeMenu();
          target?.setAttribute('tabindex', '-1');
          target?.focus({ preventScroll: true });
        }
      });
    });
    let scheduled = false;
    const updateActive = () => {
      const offset = 160;
      let current = '';
      for (const data of sections) {
        if (document.getElementById(data.section).getBoundingClientRect().top <= offset) current = data.section;
      }
      // The final section may be too short to reach the top of a tall viewport.
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        current = sections[sections.length - 1].section;
      }
      nav.querySelectorAll('a').forEach(link => {
        if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      scheduled = false;
    };
    window.addEventListener('scroll', () => {
      if (!scheduled) { scheduled = true; requestAnimationFrame(updateActive); }
    }, { passive: true });
    window.addEventListener('resize', updateActive);
    updateActive();
  }

  function wireCopyButtons() {
    document.querySelectorAll('pre').forEach(pre => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy install command');
      button.setAttribute('aria-live', 'polite');
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(pre.querySelector('code').textContent.trim());
          button.textContent = 'Copied!';
        } catch {
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(pre.querySelector('code'));
          selection.removeAllRanges();
          selection.addRange(range);
          button.textContent = 'Select & copy';
        }
        window.setTimeout(() => { button.textContent = 'Copy'; }, 2500);
      });
      pre.append(button);
    });
  }

  async function initialize() {
    try {
      const response = await fetch('content/home.md');
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      const sections = parseSections(await response.text());
      document.getElementById('hero-root').replaceChildren(renderSection(sections[0]));
      const remaining = sections.slice(1);
      document.getElementById('sections-root').replaceChildren(...remaining.map(renderSection));
      document.querySelector('.section-hero').insertAdjacentHTML('beforeend', '<div class="hero-bottom"><span>ABSTRACT BY NATURE. LIMITLESS BY DESIGN.</span><a href="#the-idea">A new way to build <span aria-hidden="true">↓</span></a></div>');
      setExample('device');
      document.querySelectorAll('[data-example]').forEach(button => button.addEventListener('click', () => setExample(button.dataset.example)));
      wireNavigation(remaining);
      wireCopyButtons();
      await document.fonts.ready;
      // Content arrives asynchronously, so restore direct links after rendering.
      if (location.hash && !location.hash.startsWith('#/')) {
        let id;
        try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    } catch (error) {
      console.error('OBJY could not load the page:', error);
      document.getElementById('hero-root').innerHTML = '<div class="loading-message"><h1>Build anything with abstract objects.</h1><p>The page content could not load. <a href="content/home.md">Read the Markdown</a>, <a href="docs/">open the documentation</a>, or <a href=".">try again</a>.</p></div>';
      document.getElementById('explore').hidden = true;
    }
  }

  // Keep links to the previous Docsify homepage and documents useful.
  if (location.hash.startsWith('#/')) {
    location.replace(`docs/${location.hash}`);
  } else {
    initialize();
  }
})();
