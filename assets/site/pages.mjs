const isRemote = path => /^https?:\/\//i.test(path);

// Keep the remote source in the route so bookmarks and relative document links work.
export function remoteRoute(source) {
  const url = new URL(source);
  if (!isRemote(url.href)) throw new Error('Remote Markdown requires an HTTP(S) URL.');
  const id = url.hash.slice(1);
  url.hash = '';
  const key = btoa(url.href).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `/remote/${key}${id ? `?id=${id}` : ''}`;
}

export function remoteLink(href, source, image = false) {
  if (/^[a-z][a-z\d+.-]*:/i.test(href) && !isRemote(href)) return href;
  const url = new URL(href, source);
  if (!image && /\.(?:md|markdown)$/i.test(url.pathname)) return remoteRoute(url.href);
  return url.href;
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
  else if (path.startsWith('content/')) return [path.endsWith('.md') ? path : `${path}.md`];
  if (/^database(?:\.md)?$/i.test(path)) path = 'database.md';
  if (path.endsWith('/')) path += 'README.md';
  if (!path.endsWith('.md')) path += '.md';
  return [...new Set([`content/${language}/${path}`, `content/${defaultLanguage}/${path}`, path])];
}

export async function loadMarkdown(files, { signal, fetchFile = fetch } = {}) {
  for (const file of files) {
    const remote = isRemote(file);
    const response = await fetchFile(file, { signal, ...(remote ? { cache: 'no-cache', credentials: 'omit' } : {}) });
    if (response.status === 404) continue;
    if (!response.ok) throw new Error(`${file}: request failed (${response.status}).`);
    const markdown = await response.text();
    // A page consisting of one remote include keeps its source for relative links/images.
    const include = !remote && markdown.trim().match(/^\[[^\]\r\n]*\]\((https?:\/\/[^\s)]+)\s+(['"]):include\2\)$/);
    if (include) return loadMarkdown([include[1]], { signal, fetchFile });
    return { file: remote ? response.url || file : file, markdown };
  }
  return null;
}
