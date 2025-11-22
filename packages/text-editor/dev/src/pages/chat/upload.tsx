import { Button } from '@/components/ui/button'
import { EditorAPI } from '@coze-editor/editor/preset-chat'
import { useEditor } from '@coze-editor/editor/react'
import { createContext, ReactNode, useContext, useState } from 'react'

const UploadingContext = createContext(false)
const SetUploadingContext = createContext<React.Dispatch<React.SetStateAction<boolean>>>(() => {})

function UploadFile() {
  const setUploading = useContext(SetUploadingContext)
  const editor = useEditor<EditorAPI | null>()

  async function insertFile() {
    if (!editor) {
      return
    }

    setUploading(true)

    editor.insertElement({
      tagName: 'upload',
      attributes: {
        filename: 'my.pdf',
        array: [
          { foo: 1 },
          true,
          'bar',
        ],
      },
    })

    await delay(2000)

    setUploading(false)
  }

  return <Button size="sm" onClick={insertFile}>upload</Button>
}

function UploadContext({ children }: { children?: ReactNode }) {
  const [uploading, setUploading] = useState(false)

  return <UploadingContext.Provider value={uploading}>
    <SetUploadingContext.Provider value={setUploading}>
      {children}
    </SetUploadingContext.Provider>
  </UploadingContext.Provider>
}

function delay(duration: number) {
  return new Promise(resolve => {
    return setTimeout(resolve, duration)
  })
}

export {
  UploadContext,
  UploadingContext,
  UploadFile,
}
