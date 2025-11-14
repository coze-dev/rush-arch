import { EditorAPI, schemaUtils } from '@coze-editor/editor/preset-chat';
import { getCurrentMentionReplaceRange, Mention, PositionMirror, useEditor, useEditorEvent } from '@coze-editor/editor/react';
import { Popover } from '@douyinfe/semi-ui';
import { useEffect, useState } from 'react';
import useInputs from './use-inputs';
import { Completion } from './completion';

function MentionImpl() {
  const editor = useEditor<EditorAPI>()

  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState(-1)
  const [prefix, setPrefix] = useState('')
  const [posKey, setPosKey] = useState('')

  // 出现补全提示时，禁用快捷键
  useEffect(() => {
    if (!editor) {
      return;
    }

    if (open) {
      editor.disableKeybindings([
        'Enter',
        'ArrowUp',
        'ArrowDown',
      ])
    } else {
      editor.disableKeybindings([])
    }
  }, [editor, open])

  // 失焦时，隐藏补全面板
  useEditorEvent(editor, 'blur', () => {
    setOpen(false)
  })

  // 处理 按键<上 | 下 | 回车>、点击 操作
  useInputs({
    onApply(value) {
      if (!editor) {
        return;
      }

      const range = getCurrentMentionReplaceRange(editor.$view.state)
      if (range) {
        if (value === 'files') {
          const string = schemaUtils.fromJSON([
            {
              type: 'element',
              tagName: 'file',
              attributes: {
                name: `index.ts[${range.from}-${range.to}]`,
                path: 'src/index.ts'
              },
            }
          ])
          editor.replaceText({
            ...range,
            text: string
          })
        } else if (value === 'chat') {
          const string = schemaUtils.fromJSON([
            {
              type: 'element',
              tagName: 'ai',
              attributes: {},
            }
          ])
          editor.replaceText({
            ...range,
            text: string
          })
        }

        setOpen(false)
      }
    }
  })

  return <>
    <Popover
      rePosKey={posKey}
      trigger='custom'
      visible={open}
      keepDOM={false}
      position='topLeft'
      content={
        <div onMouseDown={e => e.preventDefault()}>
          <Completion query={prefix} />
        </div>
      }
    >
      <PositionMirror
        position={pos}
        onChange={() => {
          setPosKey(String(Math.random()))
        }}
      />
    </Popover>

    <Mention
      triggerCharacters={['@']}
      onOpenChange={(e) => {
        const isOpen = e.value
        const pos = e.state.selection.main.head

        if (isOpen) {
          setPos(pos)
        } else {
          setPos(-1)
        }
        setOpen(isOpen)
      }}
      onSearch={(e) => {
        setPrefix(e.value)
      }}
    />
  </>
}

export default MentionImpl
