//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type RadioGroupProps as SemiRadioGroupProps,
  type RadioProps as SemiRadioProps,
} from '@douyinfe/semi-ui/lib/es/radio/index.js';

import { type IComponentBaseProps } from '@/typings';

export interface RadioProps extends IComponentBaseProps, SemiRadioProps {}

export interface RadioGroupProps
  extends IComponentBaseProps,
    SemiRadioGroupProps {}
