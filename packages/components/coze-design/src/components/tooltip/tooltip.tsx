//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import React, { forwardRef, type JSX } from 'react';

import { Tooltip as SemiToolTip } from '@douyinfe/semi-ui';

import { cn, mergeProps } from '@/utils';

import { tooltipVariant } from './tooltip-variant';
import { type TooltipProps } from './tooltip-types';

import './index.css';

const defaultProps: Partial<TooltipProps> = {
  content: '',
  position: 'top',
  visible: false,
  clickToHide: false,
  trigger: 'hover',
  theme: 'light',
};

export const Tooltip = forwardRef<SemiToolTip, TooltipProps>(
  (props, ref): JSX.Element => {
    const { className, theme, ...restProps } = mergeProps(props, defaultProps);
    const cls = cn(
      tooltipVariant({ theme }),
      className,
      theme === 'light' ? 'light' : 'dark',
    );
    const { content, disabled } = restProps || {};
    return !content || disabled ? (
      <>{restProps.children}</>
    ) : (
      <SemiToolTip ref={ref} className={cls} {...restProps} />
    );
  },
);

Tooltip.displayName = 'Tooltip';
