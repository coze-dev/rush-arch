//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useLayoutEffect } from 'react';

import { type Injector, useInjector } from '@coze-editor/react';

type InjectorHandler = (
  injector: Injector,
) => ReturnType<typeof injector.inject> | undefined;

function useInjectorEffect(handler: InjectorHandler, deps: any[] = []) {
  const injector = useInjector();

  useLayoutEffect(() => handler(injector), [injector, ...deps]);
}

export { useInjectorEffect };
