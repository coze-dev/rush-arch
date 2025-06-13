//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type React from 'react';

import { type TagProps as SemiTagProps } from '@douyinfe/semi-ui/lib/es/tag/interface.js';

import { type IComponentBaseProps } from '@/typings';

export type TagSize = 'small' | 'mini';

export type TagColor =
  | 'brand'
  | 'primary'
  | 'green'
  | 'yellow'
  | 'red'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'magenta'
  | 'grey';

export interface TagProps
  extends IComponentBaseProps,
    Omit<SemiTagProps, 'size' | 'color' | 'prefixIcon' | 'suffixIcon'> {
  size?: TagSize;
  color?: TagColor;
  prefixIcon?: 'info' | 'clock' | 'check' | React.ReactNode;
  suffixIcon?: 'cross' | 'info' | React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
}
