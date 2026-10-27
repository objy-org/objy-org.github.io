const isRemote = (path) => /^https?:\/\//i.test(path);
const isMarkdown = (path) => /\.(md|markdown)$/i.test(path);
const markdownPath = (path) =>
  path.endsWith('/') ? `${path}README.md` : isMarkdown(path) ? path : `${path}.md`;

// Keep the remote source in the route so bookmarks and relative document links work.
export function remoteRoute(source) {
  const url = new URL(source);
  if (!isRemote(url.href)) throw new Error('Remote Markdown requires an HTTP(S) URL.');
  let id = url.hash.slice(1);
  try {
    id = decodeURIComponent(id);
  } catch {
    /* A literal percent sign is a valid heading character. */
  }
  if (!id && url.searchParams.has('id')) {
    id = url.searchParams.get('id');
    url.searchParams.delete('id');
  }
  url.hash = '';
  const key = btoa(url.href).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `/remote/${key}${id ? `?${new URLSearchParams({ id })}` : ''}`;
}

export function remoteLink(href, source, image = false) {
  if (/^[a-z][a-z\d+.-]*:/i.test(href) && !isRemote(href)) return href;
  const url = new URL(href, source);
  if (!image && isMarkdown(url.pathname)) return remoteRoute(url.href);
  return url.href;
}

export function contentLink(href, source, image, siteBase) {
  if (isRemote(source)) return remoteLink(href, source, image);
  if (!image || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(href)) return href;
  // Shared assets are relative to the site root; other images belong to the Markdown file.
  const base = /^(?:\/|assets\/)/.test(href) ? siteBase : new URL(source, siteBase);
  return new URL(href.replace(/^\/+/, ''), base).href;
}

// Resolve ordinary Markdown links without registering every document as a route.
export function markdownFiles(route, language, defaultLanguage, languageCodes) {
  if (route.startsWith('/remote/')) {
    const source = atob(route.slice('/remote/'.length).replace(/-/g, '+').replace(/_/g, '/'));
    if (!isRemote(source)) throw new Error('Remote Markdown requires an HTTP(S) URL.');
    return [new URL(source).href];
  }
  let path = decodeURI(route).replace(/^\/+/, '');
  if (!path) return [`content/${language}/home.md`];
  const localized = path.match(/^content\/([^/]+)\/(.+)$/);
  if (localized && languageCodes.includes(localized[1])) path = localized[2];
  else if (path.startsWith('content/')) return [markdownPath(path)];
  // Preserve links shared before database.md moved into the language folders.
  if (/^database(?:\.md)?$/i.test(path)) path = 'database.md';
  path = markdownPath(path);
  return [...new Set([`content/${language}/${path}`, `content/${defaultLanguage}/${path}`, path])];
}

export async function loadMarkdown(files, { signal, fetchFile = fetch } = {}) {
  for (const file of files) {
    signal?.throwIfAborted();
    const remote = isRemote(file);
    const response = await fetchFile(file, {
      signal,
      cache: 'no-cache',
      ...(remote ? { credentials: 'omit' } : {}),
    });
    if (response.status === 404) continue;
    if (!response.ok) throw new Error(`${file}: request failed (${response.status}).`);
    const markdown = await response.text();
    // A page consisting of one remote include keeps its source for relative links/images.
    const include =
      !remote && markdown.trim().match(/^\[[^\]\r\n]*\]\((https?:\/\/[^\s)]+)\s+(['"]):include\2\)$/);
    if (include) return loadMarkdown([include[1]], { signal, fetchFile });
    return { file: remote ? response.url || file : file, markdown };
  }
  return null;
}
