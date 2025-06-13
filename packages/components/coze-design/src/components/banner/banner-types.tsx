//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type { BannerProps as SemiBannerProps } from '@douyinfe/semi-ui/lib/es/banner/index.js';

import type { IComponentBaseProps } from '@/typings';

export interface BannerProps
  extends IComponentBaseProps,
    Omit<SemiBannerProps, 'type'> {
  card?: boolean;
  type?: 'info' | 'danger' | 'warning' | 'success';
  justify?: 'start' | 'center';
}
