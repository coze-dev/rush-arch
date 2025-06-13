//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type { TreeSelectProps as SemiTreeSelectProps } from '@douyinfe/semi-ui/lib/es/treeSelect/index.js';

import type { IComponentBaseProps } from '@/typings';

export interface TreeSelectProps
  extends IComponentBaseProps,
    Omit<SemiTreeSelectProps, 'size'> {
  size?: 'default' | 'small' | 'large';
  width?: number;
  /** 是否只允许叶子节点选中（单选） */
  onlyLeafSelectable?: boolean;
}
