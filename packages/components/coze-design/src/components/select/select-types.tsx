//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type SelectProps as SemiSelectProps } from '@douyinfe/semi-ui/lib/es/select/index.js';

import { type IComponentBaseProps } from '@/typings';

export type SelectSize = 'default' | 'small' | 'large';

export interface SelectProps
  extends IComponentBaseProps,
    Omit<SemiSelectProps, 'size'> {
  hasError?: boolean;
  /** large尺寸仅fornax使用 */
  size?: SelectSize;
  showTick?: boolean;
  chipRender?: 'trigger' | 'selectedItem';
}
