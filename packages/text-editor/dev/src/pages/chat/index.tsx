import preset, { schemaUtils, type EditorAPI } from '@coze-editor/editor/preset-chat'
import { type EditorAPI as CodeEditorAPI } from '@coze-editor/editor/preset-code'
import { EditorProvider, PositionMirror, Renderer, useEditor, useMouseSelectionPopup } from '@coze-editor/editor/react'
import { EditorView } from '@codemirror/view'
import { useRef, useState } from 'react'
import { Extension } from '@codemirror/state';
import { astDebugger } from '@coze-editor/editor';
import { Popover } from '@douyinfe/semi-ui';
import { CodeEditor } from '../code';
import code from './code'
import elements from './elements'
import MentionImpl from './mention'
import { UploadContext, UploadFile } from './upload'

const extensions: Extension[] = [
  astDebugger,
  EditorView.lineWrapping,
];

const defaultValue = schemaUtils.fromJSON([
  {
    type: 'element',
    tagName: 'file',
    attributes: {
      name: 'index.ts"[100-110]',
      num: 1.1,
      bool: true,
      path: 'path',
    }
  },
  {
    type: 'text',
    value: '修改',
  },
  {
    type: 'element',
    tagName: 'ai',
    attributes: {
      text: 'foobar',
    },
  }
])

function Page() {
  const editorRef = useRef<EditorAPI | null>(null)

  return <div className="my-0 mx-auto flex gap-[20px] w-fit">
    <div className="w-[400px] shrink-0 mt-[100px] border-[#f2f2f2] border-[1px] border-solid">
      <UploadContext>
        <EditorProvider>
          <Renderer
            plugins={preset}
            extensions={[
              ...extensions,
            ]}
            defaultValue={defaultValue}
            options={{
              elements,
              minHeight: 200,
            }}
            didMount={(api) => {
              editorRef.current = api
            }}
            onChange={(e) => {
              console.log('schema', schemaUtils.toJSON(e.value))
            }}
          />

          <MentionImpl />
          <UploadFile />
        </EditorProvider>
      </UploadContext>
    </div>
    <div className="w-[400px] mt-[100px] border-[#f2f2f2] border-[1px] border-solid">
      <EditorProvider>
        <CodeEditor
          options={{
            uri: 'file:///untitled.ts',
            languageId: 'typescript',
            theme: 'coze-dark',
            height: 300,
          }}
          defaultValue={code}
        ></CodeEditor>
        <CodePopup
          onReference={(range) => {
            editorRef.current?.insertElement({
              tagName: 'file',
              attributes: {
                name: `index.ts[${range.from}-${range.to}]`,
                path: 'src/index.ts'
              },
            })
          }}
        ></CodePopup>
      </EditorProvider>
    </div>
  </div>
}

function CodePopup({ onReference }: { onReference: (range: { from: number; to: number }) => void }) {
  const { head, visible } = useMouseSelectionPopup()
  const [posKey, setPosKey] = useState('')
  const editor = useEditor<CodeEditorAPI | null>()

  function reference() {
    const range = editor?.getSelection()
    if (range) {
      onReference(range)
    }
  }

  return <>
    <Popover
      visible={visible}
      position="topLeft"
      trigger="custom"
      rePosKey={posKey}
      content={
        <div className="p-1">
          <button className="hover:bg-gray-100 px-2" onClick={reference}>Add to chat</button>
        </div>
      }
    >
      <PositionMirror
        position={head}
        onChange={() => setPosKey(String(Math.random()))}
      />
    </Popover>
  </>
}

export default Page
