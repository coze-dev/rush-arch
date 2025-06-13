//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type CheckboxProps as SemiCheckboxProps,
  type CheckboxGroupProps as SemiCheckboxGroupProps,
} from '@douyinfe/semi-ui/lib/es/checkbox/index.js';

import { type IComponentBaseProps } from '@/typings';

export interface CheckboxProps extends SemiCheckboxProps, IComponentBaseProps {}

export interface CheckboxGroupProps
  extends IComponentBaseProps,
    SemiCheckboxGroupProps {}
