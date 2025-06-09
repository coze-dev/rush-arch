//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { useState } from 'react';

function useHTMLElement(defaultTagName = 'div') {
  const [element] = useState(() => document.createElement(defaultTagName));

  return element;
}

export { useHTMLElement };
