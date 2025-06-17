import { EditorView } from '@codemirror/view'
import preset from '@coze-editor/editor/preset-prompt'
import { EditorProvider, Renderer } from '@coze-editor/editor/react'
import Toolbar from './extensions/toolbar'
import EditorExtensions from './editor-extensions'
import { DEFAULT_VALUE } from './const'

const extensions = [
  EditorView.theme({
    '.cm-gutters': {
      backgroundColor: 'transparent',
      borderRight: 'none',
    },
    '.cm-scroller': {
      paddingLeft: '10px',
    },
  }),
]

function PromptEditor() {
  return <>
    <EditorProvider>

      {/* 工具栏 */}
      <Toolbar />

      {/* 编辑器本体 */}
      <div className="border border-solid">
        <Renderer
          plugins={preset}
          defaultValue={DEFAULT_VALUE}
          options={{
            height: 500,
          }}
          extensions={extensions}
          didMount={editor => {
            editor.$view.dispatch({
              effects: EditorView.scrollIntoView(editor.$view.state.doc.length)
            })
          }}
        />
      </div>

      <EditorExtensions />
    </EditorProvider>
  </>
}

export default PromptEditor
