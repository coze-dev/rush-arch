//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useCallback, useLayoutEffect } from 'react';

import { useStateField } from '@coze-editor/react-hooks';
import { useInjector } from '@coze-editor/react';
import { backgroundDecorations } from '@coze-editor/extensions';

interface MarkerProps {
  from: number;
  to: number;
  className: string;
}

function BackgroundMarker({ from, to, className }: MarkerProps) {
  const injector = useInjector();

  const field = useStateField<MarkerProps>(
    useCallback(() => ({ from, to, className }), [from, to, className]),
  );

  useLayoutEffect(
    () =>
      injector.inject([
        field,
        backgroundDecorations.from(field, field => () => [field]),
      ]),
    [injector, field],
  );

  return null;
}

export { BackgroundMarker };
