import { createHighlighter } from 'shiki';

const highlighterPromise = createHighlighter({
  langs: ['md', 'js', 'ts', 'python'],
  themes: ['github-dark', 'one-dark-pro'],
});

export { highlighterPromise };
