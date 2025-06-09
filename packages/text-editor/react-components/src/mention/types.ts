//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type EditorState, type Transaction } from '@codemirror/state';

interface MentionOpenChangeEvent {
  value: boolean;
  state: EditorState;
  triggerContext:
    | Pick<TriggerContext, 'from' | 'to' | 'triggerCharacter'>
    | undefined;
}

interface MentionSearchEvent {
  value: string;
}

interface SharedMentionOptions {
  search?:
    | {
        validFor: (
          text: string,
          from: number,
          to: number,
          state: EditorState,
        ) => boolean;
      }
    | boolean;
  onOpenChange?: (e: MentionOpenChangeEvent) => void;
  onSearch?: (e: MentionSearchEvent) => void;
}

type TriggerCharactersMentionOptions = SharedMentionOptions & {
  triggerCharacters: string[];
};

type TriggerMentionOptions = SharedMentionOptions & {
  trigger: (tr: Transaction) => TriggerContext | undefined;
};

type MentionOptions = TriggerCharactersMentionOptions | TriggerMentionOptions;

interface TriggerContext {
  from: number;
  to: number;
  triggerCharacter: string;
  cursorPosition: number;
}

export {
  MentionOpenChangeEvent,
  MentionSearchEvent,
  TriggerCharactersMentionOptions,
  TriggerMentionOptions,
  MentionOptions,
  TriggerContext,
};
