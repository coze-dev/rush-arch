//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { createPortal } from 'react-dom';
import { type ReactNode } from 'react';

import { useHTMLElement, useInjectorEffect } from '@coze-editor/react-hooks';
import {
  placeholder,
  activeLinePlaceholder,
} from '@coze-editor/extension-placeholder';

function Placeholder({ children }: { children?: ReactNode }): ReactNode {
  const element = useHTMLElement('span');

  useInjectorEffect(
    injector => injector.inject([placeholder(() => element)]),
    [],
  );

  return createPortal(children, element);
}

interface ActiveLinePlaceholderProps {
  children?: ReactNode;
}

function ActiveLinePlaceholder({
  children,
}: ActiveLinePlaceholderProps): ReactNode {
  const element = useHTMLElement('span');

  useInjectorEffect(
    injector => injector.inject([activeLinePlaceholder(() => element)]),
    [],
  );

  return createPortal(children, element);
}

export { Placeholder, ActiveLinePlaceholder };
