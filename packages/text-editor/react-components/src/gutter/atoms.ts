import { atom } from 'jotai';
import { Facet } from '@codemirror/state';

const facetAtom = atom(Facet.define());

export { facetAtom };
