//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type StateField } from '@codemirror/state';

function withDefaultValue<T, U>(field: StateField<T>, value: U) {
  const { spec } = field as any;
  if (typeof spec.fromJSON === 'function') {
    return [field.init(state => spec.fromJSON(value, state)), field];
  }

  return field;
}

export { withDefaultValue };
