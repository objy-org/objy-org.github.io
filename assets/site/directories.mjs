import { createDocumentationTree, documentationIndex, routePath } from './navigation.mjs';
import { loadMarkdown, markdownInclude } from './pages.mjs';

// Read the directory's Markdown on each visit. Cache only unchanged tree state,
// never a separate list of titles, destinations, or remote document contents.
export function createDirectoryLoader({ filesForRoute, render, resolve, toURL }) {
  const trees = new Map();
  return async (indexRoute, currentPage) => {
    const sources = new Map();
    const requests = new Map();
    const read = files => {
      const key = JSON.stringify(files);
      if (!requests.has(key)) requests.set(key, loadMarkdown(files, { followIncludes: false }).then(page => {
        if (page) sources.set(page.file, page.markdown);
        return page;
      }));
      return requests.get(key);
    };
    const source = currentPage || await read(filesForRoute(indexRoute));
    if (!source) return;
    sources.set(source.file, source.markdown);
    const entriesFor = (page, route) => documentationIndex(render(page.markdown),
      (href, image = false) => resolve(href, page.file, route, image));
    const entries = entriesFor(source, indexRoute);
    const indexEntry = async (entry, ancestors) => {
      const files = filesForRoute(entry.path);
      entry.sources = [];
      if (entry.path.startsWith('/remote/')) {
        entry.sources = files;
        return;
      }
      try {
        let wrapper = await read(files);
        const includes = new Set();
        while (wrapper && !includes.has(wrapper.file)) {
          includes.add(wrapper.file);
          entry.sources.push(wrapper.file);
          const include = markdownInclude(wrapper.markdown, wrapper.file);
          if (!include) break;
          if (/^https?:\/\//i.test(include)) {
            entry.sources.push(include);
            return; // Remote bodies are fetched only when the reader selects them.
          }
          wrapper = await read([include]);
        }
        if (!wrapper) return;
        const path = new Set([...ancestors, entry.path]);
        entry.children = entriesFor(wrapper, entry.path).filter(child => !path.has(child.path));
        await Promise.all(entry.children.map(child => indexEntry(child, path)));
      } catch (error) {
        console.warn('Guide source could not be indexed:', error);
      }
    };
    await Promise.all(entries.map(entry => indexEntry(entry, new Set([routePath(indexRoute)]))));
    if (!entries.length) return;
    const signature = JSON.stringify([entries, [...sources].sort(([a], [b]) => a.localeCompare(b))]);
    if (trees.get(indexRoute)?.signature !== signature)
      trees.set(indexRoute, { signature, tree: createDocumentationTree(entries, indexRoute, toURL) });
    return trees.get(indexRoute).tree;
  };
}
