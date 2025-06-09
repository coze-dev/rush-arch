//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

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

type DocumentListener = (doc: Text) => void;

function useDocumentListener(listener: DocumentListener): void {
  const listenerRef = useLatest(listener);

  useInjectorEffect(
    injector =>
      injector.inject([
        field,
        facet.compute([field], state => {
          listenerRef.current(state.field(field));
        }),
      ]),
    [],
  );
}

export { useDocumentListener };
