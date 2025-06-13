//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type {
  ToastReactProps,
  ToastFactory,
} from '@douyinfe/semi-ui/lib/es/toast/index.js';

export type ToastProps = ToastReactProps;

export type RequiredToastType = NonNullable<ToastReactProps['type']>;

export type ToastInstance = ReturnType<(typeof ToastFactory)['create']>;
