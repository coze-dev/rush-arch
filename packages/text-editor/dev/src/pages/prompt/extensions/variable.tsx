import { useEffect, useState } from 'react'
import { EditorAPI } from '@coze-editor/editor/preset-prompt'
import {
  Mention,
  MentionOpenChangeEvent,
  getCurrentMentionReplaceRange,
  useEditor,
  PositionMirror,
  useLatest
} from '@coze-editor/editor/react'
import { Popover } from '@douyinfe/semi-ui'

interface Variable {
  label: string;
  name: string;
}

const variables: Variable[] = [
  {
    label: 'Foo',
    name: 'foo'
  },
  {
    label: 'Bar',
    name: 'bar',
  }
]

function Variable() {
  const [posKey, setPosKey] = useState('')
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState(-1)
  const editor = useEditor<EditorAPI>()

  function insert(variableName: string) {
    const range = getCurrentMentionReplaceRange(editor.$view.state)

    if (!range) {
      return
    }

    editor.replaceText({
      ...range,
      text: '{{' + variableName + '}}',
    })

    setVisible(false)
  }

  function handleOpenChange(e: MentionOpenChangeEvent) {
    setPosition(e.state.selection.main.head)
    setVisible(e.value)
  }

  useEffect(() => {
    if (!editor) {
      return
    }

    if (visible) {
      editor.disableKeybindings([
        'ArrowUp',
        'ArrowDown',
        'Enter',
      ])
    } else {
      editor.disableKeybindings([])
    }
  }, [editor, visible])

  const selectedIndex = usePopoverNavigation({
    enable: visible,
    variables,
    onApply: insert,
  })

  return <>
    <Mention
      triggerCharacters={[ '{', '{}' ]}
      onOpenChange={handleOpenChange}
    />

    <Popover
      visible={visible}
      trigger="custom"
      position="topLeft"
      rePosKey={posKey}
      content={
        <div
          className="p-1 min-w-[100px]"
        >
          {
            variables.map((variable, index) => {
              return <div
                key={variable.name}
                className={ `hover:bg-gray-200 px-2 py-1 rounded ${selectedIndex === index ? 'bg-gray-200' : ''}` }
                onMouseDown={e => e.preventDefault()}
                onClick={() => insert(variable.name)}
              >
                {variable.label}
              </div>
            })
          }
        </div>
      }
    >
      <PositionMirror
        position={position}
        onChange={() => setPosKey(String(Math.random()))}
      />
    </Popover>
  </>
}

function usePopoverNavigation(options: {
  enable: boolean;
  variables: Variable[];
  onApply: (name: string) => void;
}) {
  const { enable, variables, onApply } = options
  const [selectedIndex, setSelectedIndex] = useState(0)
  const indexRef = useLatest(selectedIndex)
  const variablesRef = useLatest(variables)
  const onApplyRef = useLatest(onApply)

  useEffect(() => {
    setSelectedIndex(0)
  }, [enable, variables])

  useEffect(() => {
    if (!enable) {
      return
    }

    function handleNavigation(e: KeyboardEvent) {
      const variableName = variablesRef.current[indexRef.current]
      switch(e.key) {
        case 'ArrowUp':
          setSelectedIndex(prevIndex => {
            const nextIndex = prevIndex - 1
            return Math.max(0, nextIndex)
          })
          break
        case 'ArrowDown':
          setSelectedIndex(prevIndex => {
            const nextIndex = prevIndex + 1
            return Math.min(variablesRef.current.length - 1, nextIndex)
          })
          break
        case 'Enter':
          if (variableName) {
            onApplyRef.current(variableName.name)
          }
          break
      }
    }

    document.addEventListener('keydown', handleNavigation, false)

    return () => {
      document.removeEventListener('keydown', handleNavigation, false)
    }
  }, [enable])

  return selectedIndex
}

export default Variable
