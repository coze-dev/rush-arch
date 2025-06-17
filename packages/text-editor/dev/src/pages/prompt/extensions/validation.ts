import { ReactNode, useLayoutEffect } from 'react';
import { hoverTooltip } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNode } from '@lezer/common';

import { useInjector } from '@coze-editor/editor/react';
import { astDecorator } from '@coze-editor/editor';

import styles from './validation.module.css'

function validate(text: string) {
  if (text === 'valid') {
    return true
  }

  return false
}

function Validation(): ReactNode {
  const injector = useInjector()

  useLayoutEffect(() => {
    return injector.inject([
      astDecorator.whole.of((cursor, state) => {
        if (
          cursor.name === 'JinjaExpression' &&
          cursor.node.firstChild?.name === 'JinjaExpressionStart' &&
          cursor.node.lastChild?.name === 'JinjaExpressionEnd'
        ) {
          const from = cursor.node.firstChild.to
          const to = cursor.node.lastChild.from
          const text = state.sliceDoc(from, to)
          if (validate(text)) {
            return {
              type: 'className',
              className: styles.valid,
              from,
              to,
            }
          }

          return {
            type: 'className',
            className: styles.invalid,
            from,
            to,
          }
        }
      })
    ])
  }, [injector])

  useLayoutEffect(() => {
    return injector.inject([
      hoverTooltip((view, pos) => {
        const tree = syntaxTree(view.state)
        const node = tree.resolve(pos)
        // find {{ }}
        const range = findJinjaExpressionContentRange(node)
        if (range) {
          // get content inside {{ }}
          const expressionContent = view.state.sliceDoc(range.from, range.to)

          if (!validate(expressionContent)) {
            return {
              pos: range.from,
              end: range.to,
              above: true,
              create() {
                const dom = document.createElement('div')
                const button = dom.appendChild(document.createElement('button'))
                button.innerText = 'fix error'

                function handleClick() {
                  alert('clicked')
                }
                button.addEventListener('click', handleClick)

                return {
                  dom,
                  destroy() {
                    button.removeEventListener('click', handleClick)
                  },
                }
              },
            }
          }
        }

        return null
      })
    ])
  }, [injector])

  return null
}

function findJinjaExpressionContentRange(node: SyntaxNode): { from: number; to: number } | undefined {
  let current: SyntaxNode | null = node
  while (current) {
    if (
      current.name === 'JinjaExpression' &&
      current.firstChild?.name === 'JinjaExpressionStart' &&
      current.lastChild?.name === 'JinjaExpressionEnd'
    ) {
      return {
        from: current.firstChild.to,
        to: current.lastChild.from,
      }
    }

    current = current.parent
  }
}

export default Validation
