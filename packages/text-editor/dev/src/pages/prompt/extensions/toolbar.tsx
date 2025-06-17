import { Button } from '@/components/ui/button'
import { EditorAPI } from '@coze-editor/editor/preset-prompt'
import { useEditor, useFocused, useHistoryState } from '@coze-editor/editor/react'
import { ToolsSwitch } from './tools'

function Toolbar() {
  const editor = useEditor<EditorAPI>()
  const { canUndo, canRedo } = useHistoryState()
  const focused = useFocused()

  function insert() {
    if (!editor) {
      return
    }

    const name = 'variable'

    const view = editor.$view
    const { from, to } = view.state.selection.main
    const text = '{{' + name + '}}'

    editor.replaceText({
      from,
      to,
      text,
    })
  }

  function undo() {
    editor?.undo()
  }

  function redo() {
    editor?.redo()
  }

  return <div className="mb-2 flex items-center justify-between">
    <div>
      <Button
        className="mr-2"
        size="sm"
        disabled={!canUndo}
        onMouseDown={e => e.preventDefault()}
        onClick={undo}
      >
        Undo
      </Button>

      <Button
        className="mr-2"
        size="sm"
        disabled={!canRedo}
        onMouseDown={e => e.preventDefault()}
        onClick={redo}
      >
        Redo
      </Button>

      <Button
        className="mr-2"
        size="sm"
        disabled={!focused}
        onMouseDown={e => e.preventDefault()}
        onClick={insert}
      >Insert</Button>

      <ToolsSwitch />
    </div>
  </div>
}

export default Toolbar
