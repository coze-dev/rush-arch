//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { createContext } from 'react';

export interface MenuContextProps {
  mode: 'menu' | 'selection';
  multiple: boolean;
  onSelectionChange?: (value: string, values: string[]) => void;
  selectedKeys: string[];
}

export const MenuContext = createContext<MenuContextProps>({
  mode: 'selection',
  multiple: false,
  selectedKeys: [],
  onSelectionChange: () => {},
});
