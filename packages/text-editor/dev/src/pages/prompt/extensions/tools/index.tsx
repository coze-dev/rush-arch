/* eslint-disable @typescript-eslint/no-explicit-any */
import { MutableRefObject, useEffect, useLayoutEffect, useState } from 'react'
import { EditorAPI } from '@coze-editor/editor/preset-prompt'
import {
  Mention,
  MentionOpenChangeEvent,
  getCurrentMentionReplaceRange,
  useEditor,
  PositionMirror,
  useLatest,
  useInjector
} from '@coze-editor/editor/react'
import { Popover } from '@douyinfe/semi-ui'
import { astDecorator } from '@coze-editor/editor';
import { findSlotClosing, getSlotID, getSlotOpenTag, isSlotOpen } from '../shared';
import { EditorView, WidgetType } from '@codemirror/view';
import tippy, { inlinePositioning } from 'tippy.js';
import mitt from 'mitt'
import { Button } from '@/components/ui/button';

import { isPositionInsideEditBlock } from '../edit-block/field';

import styles from './index.module.css';

interface Tool {
  label: string;
  id: string;
  enable: boolean;
}

const TAG = 'Tool'

const tools: Tool[] = [
  {
    label: 'Web Search',
    id: '123',
    enable: true,
  },
  {
    label: 'Weather Query',
    id: '456',
    enable: true,
  },
]

const toolsEmitter = mitt<{change: void}>()

interface ToolWidgetOptions {
  id: string;
  text: string;
  valid: boolean;
  editorRef: MutableRefObject<EditorAPI>;
}

class ToolWidget extends WidgetType {
  private disposables: (() => void)[] = [];

  constructor(public options: ToolWidgetOptions) {
    super()
  }

  toDOM() {
    const dom = document.createElement('span')

    dom.classList.add('tool')

    dom.innerHTML = `<svg style="display: inline;font-size: 12px;margin-right: 5px;" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="m13.51 4l-5-3h-1l-5 3l-.49.86v6l.49.85l5 3h1l5-3l.49-.85v-6zm-6 9.56l-4.5-2.7V5.7l4.5 2.45zM3.27 4.7l4.74-2.84l4.74 2.84l-4.74 2.59zm9.74 6.16l-4.5 2.7V8.15l4.5-2.45z"/></svg>`

    const contentDOM = dom.appendChild(document.createElement('span'))
    contentDOM.textContent = this.options.text

    if (!this.options.valid) {
      dom.classList.add('invalid')
    }

    // add hover behavior
    const h = createElement

    const popoverDOM = h('div', { class: styles.popover }, [
      h('span', {}, [
        `Tool Name: ${this.options.text}`
      ]),
      this.options.valid ?
        null :
        h(
          'button',
          {
            class: styles.popoverButton,
            onclick: () => {
              tools.forEach(tool => {
                tool.enable = true
              })

              this.options.editorRef.current?.updateWholeDecorations()

              toolsEmitter.emit('change')
            }
          },
          [
            'Enable'
          ]
        ),
    ])
    const tippyInstance = tippy(dom, {
      content: popoverDOM,
      interactive: true,
      inlinePositioning: true,
      delay: 100,
      offset: [0, 5],
      appendTo: document.body,
      theme: 'light',
      plugins: [
        inlinePositioning,
      ],
    })
    this.disposables.push(() => {
      tippyInstance.destroy()
    })

    return dom
  }

  eq(other: ToolWidget) {
    return (
      this.options.id === this.options.id &&
      this.options.text === this.options.text &&
      this.options.valid === other.options.valid
    )
  }

  destroy() {
    this.disposables.forEach(d => d())
  }
}

function createElement(
  name: string,
  attributes: Record<string, any>,
  children: (HTMLElement | string | null)[] = [],
) {
  const el = document.createElement(name);
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith('on')) {
      (el as any)[key] = value
    } else {
      el.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      const text = document.createTextNode(child);
      el.appendChild(text);
    } else if (child) {
      el.appendChild(child);
    }
  }
  return el;
}

function ToolsSwitch() {
  const editor = useEditor<EditorAPI>()
  const [enable, setEnable] = useState(true)

  useEffect(() => {
    const handler = () => {
      setEnable(tools.every(t => t.enable))
    }

    toolsEmitter.on('change', handler)

    return () => {
      toolsEmitter.off('change', handler)
    }
  }, [])

  function toggle() {
    tools.forEach(tool => {
      tool.enable = !enable
    })

    editor?.updateWholeDecorations()

    toolsEmitter.emit('change')
  }

  return <>
    <Button  className="mr-2" size="sm" onClick={toggle}>
      Toggle Tools
    </Button>
  </>
}

function ToolRenderer() {
  const editor = useEditor<EditorAPI>()
  const injector = useInjector()
  const editorRef = useLatest(editor)

  useLayoutEffect(() => {
    return injector.inject([
      EditorView.theme({
        '.tool': {
          backgroundColor: '#dfdfdfe0',
          borderRadius: '6px',
          padding: '3px 7px',
          fontSize: '12px',
        },

        '.tool.invalid': {
          opacity: .3,
        },
      }),
      astDecorator.whole.of((cursor, state) => {
        if (isSlotOpen(cursor.node, state) && getSlotOpenTag(cursor.node, state) === TAG) {
          const open = cursor.node
          const close = findSlotClosing(cursor.node, state, TAG)
          const id = getSlotID(state.sliceDoc(cursor.from, cursor.to))

          if (id && close) {
            const tool = tools.find(tool => tool.id === id)
            const text = tool?.label ?? 'Unknown'
            const valid = tool?.enable === true

            return [
              {
                type: 'replace',
                widget: new ToolWidget({
                  id,
                  text,
                  valid,
                  editorRef: editorRef,
                }),
                atomicRange: true,
                from: open.from,
                to: close.to,
              },
            ]
          }
        }
      }),
    ])
  }, [injector])

  return null
}

function Tools() {
  const [posKey, setPosKey] = useState('')
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState(-1)
  const editor = useEditor<EditorAPI>()

  function insert(tool: Tool) {
    const range = getCurrentMentionReplaceRange(editor.$view.state)

    if (!range) {
      return
    }

    editor.replaceText({
      ...range,
      text: `{#${TAG} id="${tool.id}"#}${tool.label}{#/${TAG}#}`,
    })

    setVisible(false)
  }

  function handleOpenChange(e: MentionOpenChangeEvent) {
    const pos = e.state.selection.main.head

    // if cursor is inside EditBlock, hide popover
    if (e.value && isPositionInsideEditBlock(e.state, pos)) {
      setVisible(false)
      return
    }

    setPosition(pos)
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
    tools: tools,
    onApply: insert,
  })

  return <>
    <Mention
      triggerCharacters={['@']}
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
            tools.map((tool, index) => {
              return <div
                key={tool.id}
                className={`hover:bg-gray-200 px-2 py-1 rounded ${selectedIndex === index ? 'bg-gray-200' : ''}`}
                onMouseDown={e => e.preventDefault()}
                onClick={() => insert(tool)}
              >
                {tool.label}
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
  tools: Tool[];
  onApply: (tool: Tool) => void;
}) {
  const { enable, tools, onApply } = options
  const [selectedIndex, setSelectedIndex] = useState(0)
  const indexRef = useLatest(selectedIndex)
  const toolsRef = useLatest(tools)
  const onApplyRef = useLatest(onApply)

  useEffect(() => {
    setSelectedIndex(0)
  }, [enable, tools])

  useEffect(() => {
    if (!enable) {
      return
    }

    function handleNavigation(e: KeyboardEvent) {
      const tool = toolsRef.current[indexRef.current]
      switch (e.key) {
        case 'ArrowUp':
          setSelectedIndex(prevIndex => {
            const nextIndex = prevIndex - 1
            return Math.max(0, nextIndex)
          })
          break
        case 'ArrowDown':
          setSelectedIndex(prevIndex => {
            const nextIndex = prevIndex + 1
            return Math.min(toolsRef.current.length - 1, nextIndex)
          })
          break
        case 'Enter':
          if (tool) {
            onApplyRef.current(tool)
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

export default Tools

export {
  ToolRenderer,
  ToolsSwitch,
}
