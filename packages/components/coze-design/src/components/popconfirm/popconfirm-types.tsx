//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type React from 'react';

import { type PopoverProps as SemiPopoverProps } from '@douyinfe/semi-ui/lib/es/popover/index.js';

import { type IComponentBaseProps } from '@/typings';
import { type ButtonColor, type ButtonProps } from '@/components/button';

export interface PopconfirmProps
  extends IComponentBaseProps,
    Omit<SemiPopoverProps, ''> {
  title?: React.ReactNode;
  content?: React.ReactNode;
  defaultVisible?: boolean;
  okText?: string;
  disabled?: boolean;
  okButtonColor?: ButtonColor;
  okButtonProps?: ButtonProps;
  cancelText?: string;
  cancelButtonColor?: ButtonColor;
  cancelButtonProps?: ButtonProps;
  onConfirm?: (e: React.MouseEvent) => void;
  onCancel?: (e: React.MouseEvent) => void;
}
