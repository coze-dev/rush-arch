import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import { foldable } from '@codemirror/language';

import { javascript } from '../src';

function jsxState(doc: string) {
  return EditorState.create({ doc, extensions: [javascript({ jsx: true })] });
}

function fold(doc: string) {
  const state = jsxState(doc);
  const firstLine = doc.slice(0, doc.indexOf('\n'));
  const folded = foldable(state, 0, firstLine.length);
  if (folded) {
    doc = `${doc.slice(0, folded.from)} ... ${doc.slice(folded.to)}`;
  }
  return doc;
}

describe('JSX folding', () => {
  it('should fold self-closing tags', () => {
    expect(fold('<div \n />')).toBe('<div ... />');
  });

  it('should fold self-closing tags with attributes', () => {
    expect(fold('<div a="1" \n />')).toBe('<div ... />');
  });

  it('should fold regular tags', () => {
    expect(fold('<div>\n foo</div>')).toBe('<div ... </div>');
  });

  it('should fold regular tags with attributes', () => {
    expect(fold('<div a="1" >\nfoo</div>')).toBe('<div ... </div>');
  });

  it('should fold regular tags with children', () => {
    expect(fold('<div> \n<div>\nbar</div> </div>')).toBe('<div ... </div>');
  });

  it('should fold fragment tags', () => {
    expect(fold('<> \nsdf </>')).toBe('<> ... </>');
  });

  it('should not fold inline tags', () => {
    expect(fold('<div><div></div></div>')).toBe('<div><div></div></div>');
  });
});
