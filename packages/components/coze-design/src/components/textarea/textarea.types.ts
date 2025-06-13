//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type TextAreaProps as SemiTextAreaProps } from '@douyinfe/semi-ui/lib/es/input/index.js';

import { type IComponentBaseProps } from '@/typings';

export interface TextAreaProps extends IComponentBaseProps, SemiTextAreaProps {
  wrapperClassName?: string;
  loading?: boolean;
  error?: boolean;
  suffix?: React.ReactNode;
  prefix?: React.ReactNode;
}
