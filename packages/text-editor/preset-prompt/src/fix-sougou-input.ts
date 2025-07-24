import { EditorState } from '@codemirror/state';

const pairs: Record<string, string> = {
  ':': '：',
  ',': '，',
};

const fixSougouInput = EditorState.transactionFilter.of(tr => {
  let allow = true;
  tr.changes.iterChanges((fromA, toA, _fromB, _toB, insert) => {
    const insertChar = insert.toString();
    const originalChar = pairs[insertChar];

    // how to repro with sougou input -> type 11:2 by order inside slot
    // : is inserted, and {#/...#} is removed
    // feature:
    // - : is inserted after ：
    // - {#/...#} is replaced with :
    if (
      originalChar &&
      // {#/ and #} have 5 chars
      toA - fromA > 5 &&
      // ：is replaced with :
      tr.startState.sliceDoc(fromA - 1, fromA) === originalChar &&
      tr.startState.sliceDoc(fromA, fromA + 3) === '{#/' &&
      tr.startState.sliceDoc(toA - 2, toA) === '#}'
    ) {
      allow = false;
    }

    // how to repro with sougou input -> type 1：2 by order inside slot
    // 2 will appear after {#/...#}
    // feature:
    // - ：is replaced with :
    // - selection is moved more than one character
    // - new selection is moved after slot {/#...#}
    if (
      originalChar &&
      tr.isUserEvent('input.type') &&
      Math.abs(tr.newSelection.main.to - tr.startState.selection.main.to) > 5 &&
      tr.newSelection.main.to >= 2 &&
      tr.newDoc.sliceString(
        tr.newSelection.main.to - 2,
        tr.newSelection.main.to,
      ) === '#}'
    ) {
      allow = false;
    }
  });

  if (!allow) {
    return [];
  }

  return tr;
});

export { fixSougouInput };
