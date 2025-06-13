//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type InputProps as SemiInputProps } from '@douyinfe/semi-ui/lib/es/input/index.js';

import { type IComponentBaseProps } from '@/typings';

export interface InputProps
  extends IComponentBaseProps,
    Omit<SemiInputProps, 'loading' | 'error'> {
  loading?: boolean;
  error?: boolean;
}
