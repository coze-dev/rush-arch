//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type CascaderProps as SemiCascaderProps,
  type Value as SemiCascaderValue,
  type CascaderData as SemiCascaderData,
} from '@douyinfe/semi-ui/lib/es/cascader/index.js';

import { type IComponentBaseProps } from '@/typings';

export type CascaderSize = 'default' | 'small';

export interface CascaderProps
  extends IComponentBaseProps,
    Omit<SemiCascaderProps, 'size'> {
  hasError?: boolean;
  size?: CascaderSize;
}

export type CascaderValue = SemiCascaderValue;
export type CascaderData = SemiCascaderData;
