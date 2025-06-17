import { useLayoutEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { astDecorator } from '@coze-editor/editor';
import { useInjector } from '@coze-editor/editor/react';

function JinjaHighlight() {
  const injector = useInjector()

  useLayoutEffect(() => {
    return injector.inject([
      astDecorator.whole.of(cursor => {
        if (
          cursor.name === 'JinjaStatementStart' ||
          cursor.name === 'JinjaStatementEnd'
        ) {
          return {
            type: 'className',
            className: 'jinja-statement-bracket'
          }
        }

        if (
          cursor.name === 'JinjaComment'
        ) {
          return {
            type: 'className',
            className: 'jinja-comment'
          }
        }

        if (cursor.name === 'JinjaExpression') {
          return {
            type: 'className',
            className: 'jinja-expression'
          }
        }
      }),
      EditorView.theme({
        '.jinja-statement-bracket': {
          color: '#D1009D',
        },
        '.jinja-comment': {
          color: '#0607094D',
        },
        '.jinja-expression': {
          color: '#4E40E5',
        },
      }),
    ])
  }, [injector])

  return null
}

export default JinjaHighlight
