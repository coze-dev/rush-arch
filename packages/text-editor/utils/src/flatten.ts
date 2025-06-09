//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

function flatten<T>(arrayOfArray: T[][]) {
  return arrayOfArray.reduce((memo, current) => [...memo, ...current], []);
}

export { flatten };
