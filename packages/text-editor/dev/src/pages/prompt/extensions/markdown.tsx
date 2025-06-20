import { useLayoutEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { astDecorator } from '@coze-editor/editor';
import { useInjector } from '@coze-editor/editor/react';

function MarkdownHighlight() {
  const injector = useInjector()

  useLayoutEffect(() => {
    return injector.inject([
      astDecorator.whole.of(cursor => {
        // # heading
        if (cursor.name.startsWith('ATXHeading')) {
          return {
            type: 'className',
            className: 'heading'
          }
        }

        // *italic*
        if (cursor.name === 'Emphasis') {
          return {
            type: 'className',
            className: 'emphasis'
          }
        }

        // **bold**
        if (cursor.name === 'StrongEmphasis') {
          return {
            type: 'className',
            className: 'strong-emphasis'
          }
        }

        // -
        // 1.
        // >
        if (cursor.name === 'ListMark' || cursor.name === 'QuoteMark') {
          return {
            type: 'className',
            className: 'mark'
          }
        }
      }),
      EditorView.theme({
        '.heading': {
          color: '#00818C',
          fontWeight: 'bold',
        },
        '.emphasis': {
          fontStyle: 'italic',
        },
        '.strong-emphasis': {
          fontWeight: 'bold',
        },
        '.mark': {
          color: '#4E40E5',
        },
      }),
    ])
  }, [injector])

  return null
}

export default MarkdownHighlight
