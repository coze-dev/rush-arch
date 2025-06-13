import preset, { type EditorAPI, themes } from '@coze-editor/editor/preset-code'
import { createRenderer, EditorProvider } from '@coze-editor/editor/react'
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
      didMount={(editor: EditorAPI) => {
        editorRef.current = editor
      }}
    />
  </EditorProvider>
}

export default Page
