import preset, { type EditorAPI, themes } from '@coze-editor/editor/preset-code'
import { createRenderer, EditorProvider } from '@coze-editor/editor/react'
import { frozenRanges } from '@coze-editor/editor'
import { EditorView } from '@codemirror/view'
import { useRef } from 'react'
import { darkTheme } from './theme'
import './language-features'

themes.register('coze-dark', darkTheme)

const CodeEditor = createRenderer(preset, [
  EditorView.theme({
    '&.cm-focused': {
      outline: 'none',
    },
  }),
])

const defaultValue = `
async function main({ params }: Args): Promise<Output> {
  return {
    key: 'value',
    object: {
      field: 'field',
      dynamic: params.input,
    }
  }
}
`.trim()

function findFrozenRanges(text: string) {
  const regex = /function/g;
  const matches = text.matchAll(regex);
  const results = [];
  for (const match of matches) {
    results.push({
      from: match.index,
      to: match.index + match[0].length
    });
  }
  return results;
}

const extensions = [
  frozenRanges.of(state => {
    const text = state.doc.toString();
    return findFrozenRanges(text);
  }),
];

function Page() {
  const editorRef = useRef<EditorAPI | null>(null)

  return <EditorProvider>
    <CodeEditor
      defaultValue={defaultValue}
      options={{
        uri: 'file:///untitled.ts',
        languageId: 'typescript',
        theme: 'coze-dark',
        height: 300,
      }}
      extensions={extensions}
      didMount={(editor: EditorAPI) => {
        editorRef.current = editor
      }}
    />
  </EditorProvider>
}

export default Page
