//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type ReactNode } from 'react';

import type { SpinProps as SemiSpinProps } from '@douyinfe/semi-ui/lib/es/spin/index.js';

import type { IComponentBaseProps } from '@/typings';

export type LoadingSize = 'mini' | 'small' | 'middle' | 'large';

export type LoadingLabelSize = 'small' | 'normal' | 'middle' | 'large';

export type LoadingColor = 'default' | 'blue' | 'red' | 'green';

export type SizeMapping = Record<LoadingSize, LoadingLabelSize>;

export interface LoadingProps
  extends IComponentBaseProps,
    Omit<SemiSpinProps, 'size' | 'tip' | 'spinning'> {
  loading: boolean;
  size?: LoadingSize;
  color?: LoadingColor;
  labelSize?: LoadingLabelSize;
  label?: string | ReactNode;
  className?: string;
}
