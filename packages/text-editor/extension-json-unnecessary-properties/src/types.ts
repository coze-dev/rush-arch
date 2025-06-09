//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

type JSONPath = string | number;
export type JSONPropertyChecker = (e: { paths: JSONPath[] }) => boolean;
