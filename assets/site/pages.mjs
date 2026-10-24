// Resolve ordinary Markdown links without registering every document as a route.
export function markdownFiles(route, language, defaultLanguage, languageCodes) {
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
    const response = await fetchFile(file, { signal });
    if (response.status === 404) continue;
    if (!response.ok) throw new Error(`${file}: request failed (${response.status}).`);
    return { file, markdown: await response.text() };
  }
  return null;
}
