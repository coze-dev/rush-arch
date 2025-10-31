//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { forwardRef } from 'react';

import { type Button as SemiButton } from '@douyinfe/semi-ui';
import { IconCozAiFill } from '@coze-arch/arco-icon';

import { cn } from '@/utils';

import { buttonIconVariants } from '../button-variant';
import { type AIButtonProps } from '../button-types';
import { IconButton } from '../button-icon';

import '../index.css';

export const AIButton = forwardRef<SemiButton, AIButtonProps>((props, ref) => {
  const {
    color = 'brand',
    size = 'default',
    loading = false,
    disabled = false,
    onlyIcon = false,
    hideIcon = false,
    children,
    ...restProps
  } = props;
  const iconCls = cn(
    buttonIconVariants({ color, disabled, hideIcon, onlyIcon }),
  );
  return (
    <IconButton
      icon={<IconCozAiFill className={iconCls} />}
      {...restProps}
      loading={loading}
      disabled={disabled}
      color={color}
      size={size}
      ref={ref}
    >
      {!onlyIcon ? (
        <span className="coz-ai-button-text">{children}</span>
      ) : null}
    </IconButton>
  );
});

AIButton.displayName = 'AIButton';
