//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { format as dateFormat } from 'date-fns';
import {
  type BaseValueType,
  type ValueType,
} from '@douyinfe/semi-ui/lib/es/datePicker/index.js';

export const formatValueItem = (value: BaseValueType, formatToken: string) => {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    try {
      const date = new Date(value);
      return dateFormat(date, formatToken);
    } catch (error) {
      // 解析失败，正常展示
      console.error(error);
      return value;
    }
  }
  return dateFormat(value, formatToken);
};

export const formatValue = (value: ValueType, formatToken: string) => {
  if (Array.isArray(value)) {
    return value.map(item => formatValueItem(item, formatToken));
  }
  return formatValueItem(value, formatToken);
};
