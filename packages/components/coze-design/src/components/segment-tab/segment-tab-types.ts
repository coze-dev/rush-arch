//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type RadioGroupProps } from '@douyinfe/semi-ui/lib/es/radio/index.js';

import { type IComponentBaseProps } from '@/typings';

export interface SegmentTabProps
  extends IComponentBaseProps,
    Pick<
      RadioGroupProps,
      | 'options'
      | 'defaultValue'
      | 'className'
      | 'onChange'
      | 'value'
      | 'style'
      | 'disabled'
      | 'children'
    > {
  size?: 'default' | 'small';
}
