//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { atom } from 'jotai';
import { Facet } from '@codemirror/state';

const facetAtom = atom(Facet.define());

export { facetAtom };
