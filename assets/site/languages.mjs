// Language selection and URLs are independent of Docsify and the page layout.
export function validateRegistry(registry) {
  if (!Array.isArray(registry.languages) || !registry.languages.length) throw new Error('No languages configured.');
  const codes = new Set();
  for (const language of registry.languages) {
    if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]+)*$/.test(language.code) || !language.name || !language.short || codes.has(language.code)) {
      throw new Error('Every language needs a unique language code, name, and short label.');
    }
    codes.add(language.code);
  }
  if (!codes.has(registry.defaultLanguage)) throw new Error('The default language must be registered.');
  return registry;
}

export function chooseLanguage(registry, requested, saved) {
  const exists = code => registry.languages.some(language => language.code === code);
  // A shared URL wins over a saved preference; unknown URL languages use the default.
  const code = requested !== null
    ? (exists(requested) ? requested : registry.defaultLanguage)
    : (exists(saved) ? saved : registry.defaultLanguage);
  return registry.languages.find(language => language.code === code);
}

export function withLanguage(href, code) {
  const url = new URL(href);
  url.searchParams.set('lang', code);
  return url.href;
}
