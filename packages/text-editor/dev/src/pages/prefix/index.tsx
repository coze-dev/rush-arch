import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import preset, { EditorAPI } from '@coze-editor/editor/preset-universal';
import { EditorProvider, Placeholder, PrefixElement, Renderer } from '@coze-editor/editor/react'
import { Radio, RadioGroup, Tag } from '@douyinfe/semi-ui';
import { useMemo, useRef, useState } from 'react';

const defaultValue = ''
const extensions: Extension[] = [
  EditorView.theme({
    '&.cm-focused': {
      outline: 'none',
    },
    '&': {
      border: '1px dotted #212121',
    },
  })
];

function Page() {
  const editorRef = useRef<EditorAPI | null>(null)
  const [mode, setMode] = useState('code');

  const modeText = useMemo(() => {
    const map: Record<string, string> = {
      code: '编程',
      writing: '写作',
    }

    return map[mode]
  }, [mode]);

  return <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: 500,
      margin: '100px auto',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: 20,
      }}
    >
      <RadioGroup
        type='button'
        buttonSize='small'
        defaultValue={mode}
        onChange={e => {
          setMode(e.target.value)
          editorRef.current?.focus();
        }}
      >
        <Radio value={'code'}>编程</Radio>
        <Radio value={'writing'}>写作</Radio>
      </RadioGroup>
    </div>

    <EditorProvider>
      <Renderer
        plugins={preset}
        defaultValue={defaultValue}
        options={{
          minHeight: 200,
          lineWrapping: true,
        }}
        extensions={extensions}
        didMount={(editor: EditorAPI) => {
          editorRef.current = editor
        }}
      />

      <PrefixElement
        deletable
        onDelete={() => setMode('')}
      >
        {modeText ? (
          <Tag style={{marginRight: 5}} closable onClose={() => setMode('')}>{modeText}</Tag>
        ) : null}
      </PrefixElement>

      <Placeholder>
        {modeText ? <span style={{cursor: 'text'}}>输入你的{modeText}任务</span> : '默认提示'}
      </Placeholder>
    </EditorProvider>
  </div>
}

export default Page
