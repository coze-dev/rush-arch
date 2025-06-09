//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

function disposeAll(disposes: unknown[]) {
  return () => {
    for (const dispose of disposes) {
      if (typeof dispose === 'function') {
        dispose();
      }
    }
  };
}

export { disposeAll };
