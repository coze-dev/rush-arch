import { placeholder as cmPlaceholder } from '@text-editor/extension-placeholder';
import { EditorView, lineNumbers as cmLineNumbers } from '@codemirror/view';
import { EditorState, Prec } from '@codemirror/state';

export const fontSize = (value?: number) => {
  if (typeof value === 'undefined') {
    return [];
  }

  return EditorView.theme({
    '&': {
      fontSize: typeof value === 'number' ? `${value}px` : 'inherit',
    },
  });
};

export const placeholder = (value?: HTMLElement | string) =>
  cmPlaceholder(value ?? '');

export const readOnly = (value?: boolean) =>
  EditorState.readOnly.of(value ?? false);

export const editable = (value?: boolean) =>
  EditorView.editable.of(value ?? true);

export const minHeight = (value?: string | number) => {
  if (typeof value === 'undefined') {
    return [];
  }

  return EditorView.theme({
    '.cm-content, .cm-gutter, .cm-right-gutter': {
      minHeight:
        typeof value === 'number'
          ? `${value}px`
          : typeof value === 'string'
            ? value
            : 'unset',
    },
  });
};

export const maxHeight = (value?: string | number) => {
  if (typeof value === 'undefined') {
    return [];
  }

  return EditorView.theme({
    '.cm-scroller': {
      maxHeight:
        typeof value === 'number'
          ? `${value}px`
          : typeof value === 'string'
            ? value
            : 'unset',
    },
  });
};

export const height = (value?: string | number) =>
  typeof value === 'string' || typeof value === 'number'
    ? [
        // give it higher prec to override styles from minHeight option
        Prec.high(
          EditorView.theme({
            '.cm-content, .cm-gutter, .cm-right-gutter': {
              minHeight: typeof value === 'number' ? `${value}px` : value,
            },
          }),
        ),
        EditorView.theme({
          '.cm-scroller': {
            height: typeof value === 'number' ? `${value}px` : value,
          },
        }),
      ]
    : [];

export const tabSize = (value?: number) => EditorState.tabSize.of(value ?? 2);

export interface Attrs {
  [name: string]: string;
}
type AttrSource = Attrs | ((view: EditorView) => Attrs | null);

export const contentAttributes = (attributes: AttrSource) =>
  EditorView.contentAttributes.of(attributes ?? {});

// type CursorColorParams = string | ((state: EditorState) => string);
// const cursorColorFacet = Facet.define<CursorColorParams | undefined, CursorColorParams | undefined>({
//   combine(values) {
//     return values[values.length - 1];
//   },
// });

// export const cursorColor = (color?: CursorColorParams) => {
//   return [
//     cursorColorFacet.of(color),
//   ];
// };

// export const cursorColorExtension = () => {
//   const compartment = new Compartment()
//   return [
//     drawSelection(),
//     compartment.of([]),
//     EditorState.transactionExtender.of(tr => {
//       const color = tr.state.facet(cursorColorFacet);

//       let finalColor: string | null = null

//       if (typeof color === 'string') {
//         finalColor = color
//       } else if (typeof color === 'function') {
//         finalColor = color(tr.state)
//       }

//       if (typeof finalColor === 'string') {
//         return {
//           effects: compartment.reconfigure([
//             EditorView.theme({
//               '& .cm-cursor, & .cm-dropCursor': {
//                 borderLeft: `1.2px solid ${finalColor}`,
//               },
//             })
//           ])
//         }
//       }

//       return null
//     })
//   ]
// }

export const lineNumbers = (enable?: boolean) =>
  enable === true ? cmLineNumbers() : [];

export const lineWrapping = (enable: boolean) =>
  enable ? EditorView.lineWrapping : [];
