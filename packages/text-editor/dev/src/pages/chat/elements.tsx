import { EditorAPI, useCurrentElement } from '@coze-editor/editor/preset-chat';
import { useEditor } from '@coze-editor/editor/react';
import { Popover } from '@douyinfe/semi-ui';
import { SVGProps, useContext } from 'react';
import { UploadingContext } from './upload';

function GravityUiCode(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" {...props}>{/* Icon from Gravity UI Icons by YANDEX LLC - https://github.com/gravity-ui/icons/blob/main/LICENSE */}<path fill="currentColor" fillRule="evenodd" d="M10.218 3.216a.75.75 0 0 0-1.436-.431l-3 10a.75.75 0 0 0 1.436.43zM4.53 4.97a.75.75 0 0 1 0 1.06L2.56 8l1.97 1.97a.75.75 0 0 1-1.06 1.06l-2.5-2.5a.75.75 0 0 1 0-1.06l2.5-2.5a.75.75 0 0 1 1.06 0m6.94 6.06a.75.75 0 0 1 0-1.06L13.44 8l-1.97-1.97a.75.75 0 0 1 1.06-1.06l2.5 2.5a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0" clipRule="evenodd" /></svg>
  )
}

function GravityUiGhost(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16" {...props}>{/* Icon from Gravity UI Icons by YANDEX LLC - https://github.com/gravity-ui/icons/blob/main/LICENSE */}<path fill="currentColor" fillRule="evenodd" d="M13.277 11.702L13.5 12V8a5.5 5.5 0 1 0-11 0v4.547l1.956-1.63a1.8 1.8 0 0 1 2.537.231l1.935 2.323a.08.08 0 0 0 .125-.001l1.45-1.811a1.755 1.755 0 0 1 2.774.043m-3.052 2.705l.686-.859h.001l.144-.18l.618-.772a.255.255 0 0 1 .402.006l.593.79l.139.185v.001l.392.522a1 1 0 0 0 1.8-.6V8A7 7 0 1 0 1 8v5.399a1.101 1.101 0 0 0 1.806.846l2.61-2.175a.3.3 0 0 1 .424.038l1.936 2.323a1.58 1.58 0 0 0 2.449-.024M7 8a.75.75 0 0 0 .75-.75v-1a.75.75 0 0 0-1.5 0v1c0 .414.336.75.75.75m4 0a.75.75 0 0 0 .75-.75v-1a.75.75 0 0 0-1.5 0v1c0 .414.336.75.75.75" clipRule="evenodd" /></svg>
  )
}

function FlowbiteCloseOutline(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Flowbite Icons by Themesberg - https://github.com/themesberg/flowbite-icons/blob/main/LICENSE */}<path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L17.94 6M18 18L6.06 6" /></svg>
  )
}

function FileReference({ name, path }: { name: string; path: string; }) {
  const editor = useEditor<EditorAPI | null>();
  const { isSelected, select, remove } = useCurrentElement()

  return (
    <Popover
      content={path}
      trigger='hover'
    >
      <span
        style={{
          display: 'inline-block',
          alignItems: 'center',
          border: 'solid 1px rgba(229,230,235,1)',
          borderRadius: '3px',
          padding: '0 5px',
          margin: '0 3px',
          userSelect: 'none',
          fontSize: '12px',
          backgroundColor: isSelected ? '#f2f2f2' : '',
        }}
        onClick={() => {
          select()
        }}
      >
        <GravityUiCode style={{ display: 'inline-block', marginRight: '3px', fontSize: '13px', color: '#fa6cc1' }} />

        {name}

        <FlowbiteCloseOutline
          style={{ display: 'inline-block', marginRight: '3px', fontSize: '13px', color: '#6e6e6e', cursor: 'pointer' }}
          onClick={() => {
            remove()
            editor?.focus()
          }}
        />
      </span>
    </Popover>
  )
}

function AIReference() {
  const editor = useEditor<EditorAPI | null>();
  const { isSelected, select, remove } = useCurrentElement()

  return (
    <Popover
      content={'hello'}
      trigger='hover'
    >
      <span
        style={{
          display: 'inline-block',
          alignItems: 'center',
          border: 'solid 1px rgba(229,230,235,1)',
          borderRadius: '3px',
          padding: '0 5px',
          margin: '0 3px',
          userSelect: 'none',
          fontSize: '12px',
          backgroundColor: isSelected ? '#f2f2f2' : '',
        }}
        onClick={() => {
          select()
        }}
      >
        <GravityUiGhost style={{ display: 'inline-block', marginRight: '3px', color: '#1748d4', fontSize: '13px', }} />
        Chat
        <FlowbiteCloseOutline
          style={{ display: 'inline-block', marginRight: '3px', fontSize: '13px', color: '#6e6e6e', cursor: 'pointer' }}
          onClick={() => {
            remove()
            editor?.focus()
          }}
        />
      </span>
    </Popover>
  )
}

function FluentDocumentPdf32Regular(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32" {...props}>{/* Icon from Fluent UI System Icons by Microsoft Corporation - https://github.com/microsoft/fluentui-system-icons/blob/main/LICENSE */}<path fill="currentColor" d="M9 16a1 1 0 0 0-1 1v5a1 1 0 1 0 2 0v-1h.5a2.5 2.5 0 0 0 0-5zm1.5 3H10v-1h.5a.5.5 0 0 1 0 1m3.5-2a1 1 0 0 1 1-1h.5a3.5 3.5 0 1 1 0 7H15a1 1 0 0 1-1-1zm2 3.915a1.5 1.5 0 0 0 0-2.83zM20 22v-5a1 1 0 0 1 1-1h3a1 1 0 1 1 0 2h-2v1h2a1 1 0 1 1 0 2h-2v1a1 1 0 1 1-2 0M6 5v8H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h1v1a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-1h1a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V9.828a3 3 0 0 0-.879-2.12l-4.828-4.83A3 3 0 0 0 18.172 2H9a3 3 0 0 0-3 3m3-1h7v5a3 3 0 0 0 3 3h5v1H8V5a1 1 0 0 1 1-1M8 27v-1h16v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1M24 9.828V10h-5a1 1 0 0 1-1-1V4h.172a1 1 0 0 1 .707.293l4.828 4.828a1 1 0 0 1 .293.707M5 15h22v9H5z" /></svg>
  )
}

function LineMdUploadingLoop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>{/* Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt */}<g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path strokeDasharray="2 4" strokeDashoffset="6" d="M12 21c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9"><animate attributeName="stroke-dashoffset" dur="0.6s" repeatCount="indefinite" values="6;0" /></path><path strokeDasharray="32" strokeDashoffset="32" d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.1s" dur="0.4s" values="32;0" /></path><path strokeDasharray="10" strokeDashoffset="10" d="M12 16v-7.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="10;0" /></path><path strokeDasharray="6" strokeDashoffset="6" d="M12 8.5l3.5 3.5M12 8.5l-3.5 3.5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="6;0" /></path></g></svg>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UploadFile({ filename, array }: { filename: string; array: any[] }) {
  const uploading = useContext(UploadingContext)
  console.log('array', array)
  return <span
    className="inline-block items-center border border-solid border-gray-200 rounded-[3px] px-[5px] py-0 mx-[3px] select-none text-xs"
  >
    {uploading ?
      <><LineMdUploadingLoop className="inline-block mr-[3px] text-[13px]" />上传中...</> :
      <>
        <FluentDocumentPdf32Regular className="inline-block mr-[3px] text-[#fb6b6b] text-[13px]" />
      {filename}
    </>}

  </span>
}

const elements = {
  file: {
    render: FileReference,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toString(el: any) {
      return `[custom string from file - ${el.attributes.name}]`
    },
  },
  ai: {
    render: AIReference,
  },
  upload: {
    render: UploadFile,
  }
}

export default elements
