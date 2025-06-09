//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
  type TriggerCharactersMentionOptions,
  type TriggerMentionOptions,
} from './types';

function hasTriggerCharacters(
  options: unknown,
): options is TriggerCharactersMentionOptions {
  return Array.isArray((options as any).triggerCharacters);
}

function hasTrigger(options: unknown): options is TriggerMentionOptions {
  return typeof (options as any).trigger === 'function';
}

export { hasTriggerCharacters, hasTrigger };
