//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type FC, useRef } from 'react';

import { type CommonFieldProps } from '@douyinfe/semi-ui/lib/es/form/index.js';
import { withField } from '@douyinfe/semi-ui';

import { cn } from '@/utils';

import { formFieldClassName } from '../form.variant';
import { CozInputNumber, type InputNumberProps } from '../../input-number';

const InputNumberInner = withField(CozInputNumber, {});

export const FormInputNumber: FC<CommonFieldProps & InputNumberProps> = ({
  fieldClassName,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <InputNumberInner
        {...props}
        fieldClassName={cn(formFieldClassName(), fieldClassName)}
        ref={inputRef}
      />
    </div>
  );
};
