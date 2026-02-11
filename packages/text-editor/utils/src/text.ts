import { type Mapping, SourceMap } from '@volar/source-map';

interface Range {
  from: number;
  to: number;
}

class Text {
  private source: string;
  private replacements: Array<{ from: number; to: number; content: string }> =
    [];

  constructor(text: string) {
    this.source = text;
  }

  replaceRange(from: number, to: number, content: string) {
    const rangeFrom = Math.min(from, to);
    const rangeTo = Math.max(from, to);
    const hasOverlap = this.replacements.some(
      replacement => rangeFrom < replacement.to && rangeTo > replacement.from,
    );
    if (hasOverlap) {
      return;
    }
    this.replacements.push({ from: rangeFrom, to: rangeTo, content });
  }

  #toMappings(): Mapping[] {
    const sortedReplacements = [...this.replacements].sort(
      (a, b) => a.from - b.from,
    );
    const mappings: Mapping[] = [];
    let originalOffset = 0;
    let generatedOffset = 0;
    for (const replacement of sortedReplacements) {
      if (originalOffset < replacement.from) {
        const length = replacement.from - originalOffset;
        mappings.push({
          sourceOffsets: [originalOffset],
          generatedOffsets: [generatedOffset],
          lengths: [length],
          data: undefined,
        });
        originalOffset = replacement.from;
        generatedOffset += length;
      }
      originalOffset = replacement.to;
      generatedOffset += replacement.content.length;
    }
    if (originalOffset < this.source.length) {
      const length = this.source.length - originalOffset;
      mappings.push({
        sourceOffsets: [originalOffset],
        generatedOffsets: [generatedOffset],
        lengths: [length],
        data: undefined,
      });
    }
    return mappings;
  }

  originalOffsetFor(offset: number): number {
    const sourceMap = new SourceMap(this.#toMappings());
    const locations = Array.from(sourceMap.toSourceLocation(offset));
    const first = locations[0];
    if (Array.isArray(first) && typeof first[0] === 'number') {
      return first[0];
    }
    return offset;
  }

  generatedOffsetFor(offset: number): number {
    const sourceMap = new SourceMap(this.#toMappings());
    const locations = Array.from(sourceMap.toGeneratedLocation(offset));
    const first = locations[0];
    if (Array.isArray(first) && typeof first[0] === 'number') {
      return first[0];
    }
    return offset;
  }

  originalRangeFor(range: Range): Range {
    const sourceMap = new SourceMap(this.#toMappings());
    const ranges = Array.from(
      sourceMap.toSourceRange(range.from, range.to, true),
    );
    const first = ranges[0];
    if (
      Array.isArray(first) &&
      typeof first[0] === 'number' &&
      typeof first[1] === 'number'
    ) {
      return { from: first[0], to: first[1] };
    }
    return range;
  }

  generatedRangeFor(range: Range): Range {
    const sourceMap = new SourceMap(this.#toMappings());
    const ranges = Array.from(
      sourceMap.toGeneratedRange(range.from, range.to, true),
    );
    const first = ranges[0];
    if (
      Array.isArray(first) &&
      typeof first[0] === 'number' &&
      typeof first[1] === 'number'
    ) {
      return { from: first[0], to: first[1] };
    }
    return range;
  }

  toString(): string {
    const sortedReplacements = [...this.replacements].sort(
      (a, b) => a.from - b.from,
    );
    let cursor = 0;
    let result = '';
    for (const replacement of sortedReplacements) {
      if (cursor < replacement.from) {
        result += this.source.slice(cursor, replacement.from);
      }
      result += replacement.content;
      cursor = replacement.to;
    }
    if (cursor < this.source.length) {
      result += this.source.slice(cursor);
    }
    return result;
  }
}

export { Text };
