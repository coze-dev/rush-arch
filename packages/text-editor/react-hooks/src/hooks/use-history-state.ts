//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useState } from 'react';

import { Facet } from '@codemirror/state';
import { historyField, redoDepth, undoDepth } from '@codemirror/commands';

import { useLatest } from './use-latest';
import { useInjectorEffect } from './use-injector-effect';

const facet = Facet.define();

function useHistoryState() {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const setCanUndoRef = useLatest(setCanUndo);
  const setCanRedoRef = useLatest(setCanRedo);

  useInjectorEffect(injector =>
    injector.inject([
      facet.compute([historyField], state => {
        setCanUndoRef.current(() => undoDepth(state) > 0);

        setCanRedoRef.current(() => redoDepth(state) > 0);
      }),
    ]),
  );

  return {
    canUndo,
    canRedo,
  };
}

export { useHistoryState };
