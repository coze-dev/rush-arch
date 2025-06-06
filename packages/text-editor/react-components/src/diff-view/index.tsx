import { useLayoutEffect } from 'react';

import { useInjector } from '@coze-editor/react';

import { diffView } from './extension';

interface PropsType {
  original?: string;
}

function DiffView({ original }: PropsType) {
  const injector = useInjector();

  useLayoutEffect(() => injector.inject(diffView({ original })), []);

  return null;
}

export { type PropsType, DiffView };
