//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type ReactNode } from 'react';

import { type RadioGroupProps } from '@douyinfe/semi-ui/lib/es/radio/index.js';

import { type IComponentBaseProps } from '@/typings';

export interface SingleSelectProps
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
    > {
  layout?: 'fill' | 'hug';
  /**
   * @warning 暂不支持large
   */
  size?: 'small' | 'default' | 'large';
}

export interface SingleSelectLabelProps {
  icon: ReactNode;
  activeIcon?: ReactNode;
  text?: string;
}
