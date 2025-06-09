//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useState } from 'react';

import { Facet, StateField, type Text } from '@codemirror/state';

import { useLatest } from './use-latest';
import { useInjectorEffect } from './use-injector-effect';

const field = StateField.define({
  create(state) {
    return state.doc;
  },
  update(value, tr) {
    if (tr.docChanged) {
      value = tr.state.doc;
    }

    return value;
  },
});

const facet = Facet.define();

type DocumentSelector<T> = (doc: Text) => T;

function useDocumentSelector<T>(
  selector: DocumentSelector<T>,
  defaultValue: T,
): T {
  const [state, setState] = useState<T>(defaultValue);
  const stateRef = useLatest(state);
  const setStateRef = useLatest(setState);
  const selectorRef = useLatest(selector);

  useInjectorEffect(
    injector =>
      injector.inject([
        field,
        facet.compute([field], state => {
          const derived = selectorRef.current(state.field(field));
          if (stateRef.current !== derived) {
            setStateRef.current(derived);
          }
        }),
      ]),
    [],
  );

  return state;
}

export { useDocumentSelector };
