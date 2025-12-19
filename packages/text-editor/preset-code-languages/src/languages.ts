import { type Extension } from '@codemirror/state';
import { LanguageDescription, LanguageSupport } from '@codemirror/language';

export const supportedLanguages = [
  LanguageDescription.of({
    name: 'VUE',
    extensions: ['vue'],
    async load() {
      return import('@codemirror/lang-vue').then(module => module.vue());
    },
  }),
  LanguageDescription.of({
    name: 'TS',
    extensions: ['ts'],
    async load() {
      return import('@codemirror/lang-javascript').then(module =>
        module.javascript({ typescript: true }),
      );
    },
  }),
  LanguageDescription.of({
    name: 'JS',
    extensions: ['js', 'mjs', 'cjs'],
    async load() {
      return import('@codemirror/lang-javascript').then(module =>
        module.javascript(),
      );
    },
  }),
  LanguageDescription.of({
    name: 'TSX',
    extensions: ['tsx'],
    async load() {
      return import('@codemirror/lang-javascript').then(module =>
        module.javascript({
          jsx: true,
          typescript: true,
        }),
      );
    },
  }),
  LanguageDescription.of({
    name: 'JSX',
    extensions: ['jsx'],
    async load() {
      return import('@codemirror/lang-javascript').then(module =>
        module.javascript({ jsx: true }),
      );
    },
  }),
  LanguageDescription.of({
    name: 'HTML',
    extensions: ['html'],
    async load() {
      return import('@codemirror/lang-html').then(module => module.html());
    },
  }),
  LanguageDescription.of({
    name: 'CSS',
    extensions: ['css'],
    async load() {
      return import('@codemirror/lang-css').then(module => module.css());
    },
  }),
  LanguageDescription.of({
    name: 'SASS',
    extensions: ['sass'],
    async load() {
      return import('@codemirror/lang-sass').then(module =>
        module.sass({ indented: true }),
      );
    },
  }),
  LanguageDescription.of({
    name: 'SCSS',
    extensions: ['scss'],
    async load() {
      return import('@codemirror/lang-sass').then(module =>
        module.sass({ indented: false }),
      );
    },
  }),
  LanguageDescription.of({
    name: 'JSON',
    extensions: ['json'],
    async load() {
      return import('@codemirror/lang-json').then(module => module.json());
    },
  }),
  LanguageDescription.of({
    name: 'Markdown',
    extensions: ['md'],
    async load() {
      return import('@codemirror/lang-markdown').then(module =>
        module.markdown(),
      );
    },
  }),
  LanguageDescription.of({
    name: 'Wasm',
    extensions: ['wat'],
    async load() {
      return import('@codemirror/lang-wast').then(module => module.wast());
    },
  }),
  LanguageDescription.of({
    name: 'Python',
    extensions: ['py'],
    async load() {
      return import('@codemirror/lang-python').then(module => module.python());
    },
  }),
  LanguageDescription.of({
    name: 'C++',
    extensions: ['cpp'],
    async load() {
      return import('@codemirror/lang-cpp').then(module => module.cpp());
    },
  }),
  LanguageDescription.of({
    name: 'Shell',
    extensions: ['sh'],
    async load() {
      return import('@coze-editor/code-language-shell').then(
        module => new LanguageSupport(module.shellLanguage),
      );
    },
  }),
  LanguageDescription.of({
    name: 'Sql',
    extensions: ['sql'],
    async load() {
      return import('@codemirror/lang-sql').then(module => module.sql());
    },
  }),
];

// 添加缓存机制
const languageCache = new Map<string, Promise<Extension>>();

export async function getLanguage(fileName: string): Promise<Extension> {
  const cacheKey = fileName.split('.').pop() || 'default';

  const cachedLanguage = languageCache.get(cacheKey);
  if (cachedLanguage) {
    return cachedLanguage;
  }

  const loadPromise = (async () => {
    try {
      const languageDescription = LanguageDescription.matchFilename(
        supportedLanguages,
        fileName,
      );
      return languageDescription ? await languageDescription.load() : [];
    } catch (e) {
      console.error('Language load failed:', e);
      return [];
    }
  })();

  languageCache.set(cacheKey, loadPromise);
  return loadPromise;
}
