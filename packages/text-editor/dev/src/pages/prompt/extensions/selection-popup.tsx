import { Popover } from '@douyinfe/semi-ui'
import { EditorAPI } from '@coze-editor/editor/preset-prompt'
import { PositionMirror, useEditor, useMouseSelectionPopup } from '@coze-editor/editor/react'
import { useState } from 'react'

function SelectionPopup() {
  const editor = useEditor<EditorAPI>()
  const { head, visible } = useMouseSelectionPopup()
  const [posKey, setPosKey] = useState('')

  function uppercase() {
    editor?.transformTextInSelection((text: string) => {
      return text.toUpperCase()
    })
  }

  return <>
    <Popover
      visible={visible}
      position="topLeft"
      trigger="custom"
      rePosKey={posKey}
      content={
        <div className="p-1">
          <button className="hover:bg-gray-100 px-2" onClick={uppercase}>Uppercase</button>
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

export default SelectionPopup
