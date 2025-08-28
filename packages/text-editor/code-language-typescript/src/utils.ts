//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import type ts from 'typescript';
import { type SymbolDisplayPart } from 'typescript';

function tagToString(tag: ts.JSDocTagInfo): string {
  let tagLabel = `*@${tag.name}*`;
  if (tag.name === 'param' && tag.text) {
    const [paramName, ...rest] = tag.text;
    tagLabel += `\`${paramName.text}\``;
    if (rest.length > 0) {
      tagLabel += ` — ${rest.map(r => r.text).join(' ')}`;
    }
  } else if (Array.isArray(tag.text)) {
    tagLabel += ` — ${tag.text.map(r => r.text).join(' ')}`;
  } else if (tag.text) {
    tagLabel += ` — ${tag.text}`;
  }
  return tagLabel;
}

function displayPartsToString(displayParts?: SymbolDisplayPart[]) {
  if (displayParts) {
    return displayParts.map(displayPart2 => displayPart2.text).join('');
  }
  return '';
}

export { tagToString, displayPartsToString };
