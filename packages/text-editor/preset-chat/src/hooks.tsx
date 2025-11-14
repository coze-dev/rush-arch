import { useLayoutEffect, useRef, useState } from 'react';

import {
  type BuiltinEditorAPI,
  useEditor,
  useInjector,
} from '@coze-editor/react';
import { type EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view';
import { EditorSelection, type EditorState } from '@codemirror/state';

import { field } from './extension';
import { useElementId } from './context';

function useCurrentElement() {
  const editor = useEditor<BuiltinEditorAPI | null>();
  const elementId = useElementId();
  const injector = useInjector();
  const [isSelected, setIsSelected] = useState(false);
  const elementIdRef = useRef(elementId);

  elementIdRef.current = elementId;

  function select() {
    if (!editor) {
      return;
    }

    const view = editor.$view;

    const decorations = view.state.field(field);

    const cursor = decorations.iter();
    while (cursor.value) {
      const { spec } = cursor.value;
      if (spec?.widget?.id === elementId) {
        view.dispatch({
          selection: EditorSelection.range(cursor.from, cursor.to),
        });
        break;
      }
      cursor.next();
    }
  }

  function remove() {
    if (!editor) {
      return;
    }

    const view = editor.$view;

    if (view.state.readOnly) {
      return;
    }

    const range = findElement(view.state, elementId);
    if (range) {
      view.dispatch({
        changes: {
          from: range.from,
          to: range.to,
          insert: '',
        },
        selection: EditorSelection.cursor(range.from),
      });
    }
  }

  useLayoutEffect(() => {
    function selectionContainsCurrentElement(state: EditorState) {
      const range = findElement(state, elementId);
      const { ranges } = state.selection;
      if (!range) {
        return false;
      }

      for (const r of ranges) {
        if (r.from <= range.from && r.to >= range.to) {
          return true;
        }
      }

      return false;
    }

    const plugin = ViewPlugin.fromClass(
      class {
        constructor(view: EditorView) {
          const contains = selectionContainsCurrentElement(view.state);
          setIsSelected(contains);
        }

        update(update: ViewUpdate) {
          if (update.selectionSet) {
            const contains = selectionContainsCurrentElement(update.state);
            setIsSelected(contains);
          }
        }
      },
    );

    return injector.inject([plugin]);
  }, [injector]);

  return {
    isSelected,
    select,
    remove,
  };
}

function findElement(state: EditorState, elementId: string) {
  const decorations = state.field(field);

  const cursor = decorations.iter();
  while (cursor.value) {
    const { spec } = cursor.value;
    if (spec?.widget?.id === elementId) {
      return {
        from: cursor.from,
        to: cursor.to,
      };
    }
    cursor.next();
  }
}

export { useCurrentElement };
