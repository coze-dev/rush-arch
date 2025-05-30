//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useEffect, useRef } from 'react';

export function usePrevious<T>(value: T): T {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // @ts-expect-error -- linter-disable-autofix
  return ref.current;
}
