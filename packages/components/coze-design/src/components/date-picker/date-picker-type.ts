//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type DatePickerProps as SemiDatePickerProps,
  type DayStatusType as SemiDayStatusType,
} from '@douyinfe/semi-ui/lib/es/datePicker/index.js';

import { type IComponentBaseProps } from '@/typings';

export type DayStatusType = SemiDayStatusType & {
  isHoverDayInStartSelection?: boolean;
};

export type DatePickerType =
  | 'date'
  | 'dateRange'
  | 'month'
  | 'dateTime'
  | 'dateTimeRange'
  | 'monthRange';

export interface DatePickerProps
  extends IComponentBaseProps,
    Omit<SemiDatePickerProps, 'density' | 'size' | 'type' | 'onClear'> {
  size?: 'default' | 'small';
  showPrefix?: boolean;
  showSuffix?: boolean;
  type?: DatePickerType;
  onClear?: () => void;
}
