//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';

import { isValidLevel, parseTagsLevel, isDepLevelMatch } from '../src/utils';

describe('utils', () => {
  describe('isValidLevel', () => {
    it('should return true for valid positive integers', () => {
      expect(isValidLevel(0)).toBe(true);
      expect(isValidLevel(1)).toBe(true);
      expect(isValidLevel(2)).toBe(true);
      expect(isValidLevel(10)).toBe(true);
      expect(isValidLevel(100)).toBe(true);
    });

    it('should return true for valid negative integers', () => {
      expect(isValidLevel(-1)).toBe(true);
      expect(isValidLevel(-10)).toBe(true);
      expect(isValidLevel(-100)).toBe(true);
    });

    it('should return false for floating point numbers', () => {
      expect(isValidLevel(1.5)).toBe(false);
      expect(isValidLevel(3.14)).toBe(false);
      expect(isValidLevel(0.1)).toBe(false);
      expect(isValidLevel(-1.5)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(isValidLevel('1')).toBe(false);
      expect(isValidLevel('level-1')).toBe(false);
      expect(isValidLevel(true)).toBe(false);
      expect(isValidLevel(false)).toBe(false);
      expect(isValidLevel(null)).toBe(false);
      expect(isValidLevel(undefined)).toBe(false);
      expect(isValidLevel({})).toBe(false);
      expect(isValidLevel([])).toBe(false);
    });

    it('should return false for special numeric values', () => {
      expect(isValidLevel(NaN)).toBe(false);
      expect(isValidLevel(Infinity)).toBe(false);
      expect(isValidLevel(-Infinity)).toBe(false);
    });

    it('should return false for numeric strings', () => {
      expect(isValidLevel('0')).toBe(false);
      expect(isValidLevel('1')).toBe(false);
      expect(isValidLevel('10')).toBe(false);
      expect(isValidLevel('-1')).toBe(false);
    });

    it('should handle edge case of Number.MAX_SAFE_INTEGER', () => {
      expect(isValidLevel(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isValidLevel(Number.MIN_SAFE_INTEGER)).toBe(true);
    });
  });

  describe('parseTagsLevel', () => {
    it('should parse valid level tags correctly', () => {
      expect(parseTagsLevel(new Set(['level-1']))).toBe(1);
      expect(parseTagsLevel(new Set(['level-2']))).toBe(2);
      expect(parseTagsLevel(new Set(['level-10']))).toBe(10);
      expect(parseTagsLevel(new Set(['level-100']))).toBe(100);
    });

    it('should handle zero level', () => {
      expect(parseTagsLevel(new Set(['level-0']))).toBe(0);
    });

    it('should handle malformed negative level tags', () => {
      // 'level--1' splits to ['level', '', '1'], parseInt('') returns NaN
      expect(parseTagsLevel(new Set(['level--1']))).toBe(NaN);
      expect(parseTagsLevel(new Set(['level--10']))).toBe(NaN);
    });

    it('should return first level tag when multiple level tags exist', () => {
      expect(parseTagsLevel(new Set(['level-1', 'level-2']))).toBe(1);
      expect(parseTagsLevel(new Set(['level-3', 'level-1', 'level-2']))).toBe(
        3,
      );
    });

    it('should ignore non-level tags', () => {
      expect(parseTagsLevel(new Set(['frontend', 'level-2', 'backend']))).toBe(
        2,
      );
      expect(parseTagsLevel(new Set(['ui', 'level-5', 'component']))).toBe(5);
    });

    it('should return null when no level tags exist', () => {
      expect(parseTagsLevel(new Set([]))).toBe(null);
      expect(parseTagsLevel(new Set(['frontend']))).toBe(null);
      expect(parseTagsLevel(new Set(['backend', 'ui']))).toBe(null);
    });

    it('should return null for malformed level tags', () => {
      expect(parseTagsLevel(new Set(['level-']))).toBe(NaN); // parseInt('') returns NaN
      expect(parseTagsLevel(new Set(['level-abc']))).toBe(NaN); // parseInt('abc') returns NaN
      expect(parseTagsLevel(new Set(['level-1.5']))).toBe(1); // parseInt will parse to 1
      expect(parseTagsLevel(new Set(['level']))).toBe(null);
      expect(parseTagsLevel(new Set(['levels-1']))).toBe(null);
    });

    it('should handle tags with level prefix but invalid format', () => {
      expect(parseTagsLevel(new Set(['level-NaN']))).toBe(NaN); // parseInt('NaN') returns NaN
      expect(parseTagsLevel(new Set(['level-undefined']))).toBe(NaN); // parseInt('undefined') returns NaN
      expect(parseTagsLevel(new Set(['level-null']))).toBe(NaN); // parseInt('null') returns NaN
    });

    it('should parse levels with leading zeros', () => {
      expect(parseTagsLevel(new Set(['level-01']))).toBe(1);
      expect(parseTagsLevel(new Set(['level-001']))).toBe(1);
      expect(parseTagsLevel(new Set(['level-010']))).toBe(10);
    });

    it('should handle mixed case (assuming case-sensitive)', () => {
      expect(parseTagsLevel(new Set(['Level-1']))).toBe(null);
      expect(parseTagsLevel(new Set(['LEVEL-1']))).toBe(null);
      expect(parseTagsLevel(new Set(['level-1']))).toBe(1);
    });

    it('should handle edge cases with extra characters', () => {
      expect(parseTagsLevel(new Set(['level-1extra']))).toBe(1); // parseInt stops at first non-digit
      expect(parseTagsLevel(new Set(['level-1-extra']))).toBe(1);
      expect(parseTagsLevel(new Set(['level-123abc']))).toBe(123);
    });

    it('should handle very large numbers', () => {
      expect(parseTagsLevel(new Set(['level-999999']))).toBe(999999);
      expect(
        parseTagsLevel(new Set([`level-${Number.MAX_SAFE_INTEGER}`])),
      ).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle ReadonlySet interface correctly', () => {
      const readonlySet: ReadonlySet<string> = new Set(['level-5', 'frontend']);
      expect(parseTagsLevel(readonlySet)).toBe(5);
    });
  });

  describe('isDepLevelMatch', () => {
    it('should return true when project level equals dependency level', () => {
      expect(isDepLevelMatch(1, 1)).toBe(true);
      expect(isDepLevelMatch(2, 2)).toBe(true);
      expect(isDepLevelMatch(10, 10)).toBe(true);
    });

    it('should return true when project level is higher than dependency level', () => {
      expect(isDepLevelMatch(2, 1)).toBe(true);
      expect(isDepLevelMatch(3, 1)).toBe(true);
      expect(isDepLevelMatch(3, 2)).toBe(true);
      expect(isDepLevelMatch(10, 5)).toBe(true);
      expect(isDepLevelMatch(100, 1)).toBe(true);
    });

    it('should return false when project level is lower than dependency level', () => {
      expect(isDepLevelMatch(1, 2)).toBe(false);
      expect(isDepLevelMatch(1, 3)).toBe(false);
      expect(isDepLevelMatch(2, 3)).toBe(false);
      expect(isDepLevelMatch(5, 10)).toBe(false);
      expect(isDepLevelMatch(1, 100)).toBe(false);
    });

    it('should handle zero levels correctly', () => {
      expect(isDepLevelMatch(0, 0)).toBe(true);
      expect(isDepLevelMatch(1, 0)).toBe(true);
      expect(isDepLevelMatch(0, 1)).toBe(false);
    });

    it('should handle negative levels correctly', () => {
      expect(isDepLevelMatch(-1, -1)).toBe(true);
      expect(isDepLevelMatch(-1, -2)).toBe(true);
      expect(isDepLevelMatch(-2, -1)).toBe(false);
      expect(isDepLevelMatch(0, -1)).toBe(true);
      expect(isDepLevelMatch(-1, 0)).toBe(false);
    });

    it('should handle edge cases with large numbers', () => {
      expect(
        isDepLevelMatch(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER),
      ).toBe(true);
      expect(isDepLevelMatch(Number.MAX_SAFE_INTEGER, 1)).toBe(true);
      expect(isDepLevelMatch(1, Number.MAX_SAFE_INTEGER)).toBe(false);
      expect(
        isDepLevelMatch(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER),
      ).toBe(true);
    });

    it('should demonstrate typical dependency hierarchy scenarios', () => {
      // Level 3 (high-level) can depend on Level 2 (mid-level)
      expect(isDepLevelMatch(3, 2)).toBe(true);

      // Level 3 (high-level) can depend on Level 1 (low-level)
      expect(isDepLevelMatch(3, 1)).toBe(true);

      // Level 2 (mid-level) can depend on Level 1 (low-level)
      expect(isDepLevelMatch(2, 1)).toBe(true);

      // Level 1 (low-level) CANNOT depend on Level 2 (mid-level)
      expect(isDepLevelMatch(1, 2)).toBe(false);

      // Level 1 (low-level) CANNOT depend on Level 3 (high-level)
      expect(isDepLevelMatch(1, 3)).toBe(false);

      // Level 2 (mid-level) CANNOT depend on Level 3 (high-level)
      expect(isDepLevelMatch(2, 3)).toBe(false);
    });

    it('should handle same level dependencies (typical for peer dependencies)', () => {
      expect(isDepLevelMatch(1, 1)).toBe(true);
      expect(isDepLevelMatch(2, 2)).toBe(true);
      expect(isDepLevelMatch(3, 3)).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should work together for complete validation flow', () => {
      // Scenario: Valid project with valid dependency
      const projectTags = new Set(['frontend', 'level-2', 'ui']);
      const depTags = new Set(['backend', 'level-1', 'api']);

      const projectLevel = parseTagsLevel(projectTags);
      const depLevel = parseTagsLevel(depTags);

      expect(isValidLevel(projectLevel)).toBe(true);
      expect(isValidLevel(depLevel)).toBe(true);
      expect(isDepLevelMatch(projectLevel!, depLevel!)).toBe(true);
    });

    it('should detect invalid configuration', () => {
      // Scenario: Project trying to depend on higher level
      const projectTags = new Set(['frontend', 'level-1']);
      const depTags = new Set(['backend', 'level-2']);

      const projectLevel = parseTagsLevel(projectTags);
      const depLevel = parseTagsLevel(depTags);

      expect(isValidLevel(projectLevel)).toBe(true);
      expect(isValidLevel(depLevel)).toBe(true);
      expect(isDepLevelMatch(projectLevel!, depLevel!)).toBe(false);
    });

    it('should handle missing level tags', () => {
      // Scenario: Project without level tag
      const projectTags = new Set(['frontend', 'ui']);
      const depTags = new Set(['backend', 'level-1']);

      const projectLevel = parseTagsLevel(projectTags);
      const depLevel = parseTagsLevel(depTags);

      expect(isValidLevel(projectLevel)).toBe(false); // null is not a valid level
      expect(isValidLevel(depLevel)).toBe(true);
    });

    it('should handle malformed level tags', () => {
      // Scenario: Project with malformed level tag
      const projectTags = new Set(['frontend', 'level-abc']);
      const depTags = new Set(['backend', 'level-1']);

      const projectLevel = parseTagsLevel(projectTags);
      const depLevel = parseTagsLevel(depTags);

      expect(isValidLevel(projectLevel)).toBe(false); // NaN is not a valid level
      expect(isValidLevel(depLevel)).toBe(true);
    });

    it('should handle complex tag sets', () => {
      // Scenario: Multiple tags with various formats
      const complexTags = new Set([
        'frontend',
        'react',
        'level-3',
        'ui-component',
        'typescript',
        'web',
      ]);

      const level = parseTagsLevel(complexTags);
      expect(isValidLevel(level)).toBe(true);
      expect(level).toBe(3);
    });
  });
});
