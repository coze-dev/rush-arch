//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type ComponentProps, forwardRef } from 'react';

import { withField } from '@douyinfe/semi-ui';

import { cn } from '@/utils';
import { type SemiSelect } from '@/index';
import { type CommonFieldProps } from '@/components/semi/types';
import { Select, type SelectProps } from '@/components/select';

import { formFieldClassName } from '../form.variant';

// UISelect 的 label 属性是提供给 borderless 主题使用的 表单场景下没有此主题，去掉这个属性避免和 form label 混合
const SelectInner = forwardRef<
  SemiSelect,
  Omit<ComponentProps<typeof Select>, 'label'>
>((props, ref) => <Select {...props} ref={ref} />);

const FormSelectInner = withField(SelectInner);

export const FormSelect = forwardRef<
  SemiSelect,
  SelectProps & CommonFieldProps
>(({ fieldClassName, ...props }, ref) => (
  <FormSelectInner
    {...props}
    ref={ref}
    fieldClassName={cn(formFieldClassName(), fieldClassName)}
  />
)) as React.ForwardRefExoticComponent<
  SelectProps & CommonFieldProps & React.RefAttributes<SemiSelect>
> & {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  OptGroup: typeof Select.OptGroup;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Option: typeof Select.Option;
};

FormSelect.Option = Select.Option;
FormSelect.OptGroup = Select.OptGroup;
