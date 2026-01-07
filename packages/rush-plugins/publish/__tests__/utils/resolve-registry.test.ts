//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RushConfigurationProject } from '@rushstack/rush-sdk';

import { resolveRegistry } from '../../src/utils/resolve-registry';

// Mock logger
vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('resolveRegistry', () => {
  let mockProject: RushConfigurationProject;

  beforeEach(() => {
    // 创建一个基础的 mock project
    const baseMockProject: Partial<RushConfigurationProject> = {
      packageName: '@test/package',
      packageJson: {},
    };
    mockProject = baseMockProject as RushConfigurationProject;
  });

  it('should use CLI registry with highest priority', () => {
    mockProject.packageJson = {
      publishConfig: { registry: 'https://package.json.registry.com' },
    };

    const result = resolveRegistry(mockProject, 'https://cli.registry.com');

    expect(result).toBe('https://cli.registry.com');
  });

  it('should use package.json publishConfig.registry when CLI is not provided', () => {
    mockProject.packageJson = {
      publishConfig: { registry: 'https://package.json.registry.com' },
    };

    const result = resolveRegistry(mockProject);

    expect(result).toBe('https://package.json.registry.com');
  });

  it('should return undefined when no config is provided (use npm config)', () => {
    mockProject.packageJson = {};

    const result = resolveRegistry(mockProject);

    expect(result).toBeUndefined();
  });

  it('should handle package.json without publishConfig', () => {
    mockProject.packageJson = {
      name: '@test/package',
      version: '1.0.0',
    };

    const result = resolveRegistry(mockProject);

    expect(result).toBeUndefined();
  });

  it('should handle empty publishConfig in package.json', () => {
    mockProject.packageJson = {
      publishConfig: {},
    };

    const result = resolveRegistry(mockProject);

    expect(result).toBeUndefined();
  });

  it('should handle undefined CLI parameter explicitly', () => {
    mockProject.packageJson = {};

    const result = resolveRegistry(mockProject, undefined);

    expect(result).toBeUndefined();
  });

  it('should prioritize CLI over package.json even with empty string', () => {
    mockProject.packageJson = {
      publishConfig: { registry: 'https://package.json.registry.com' },
    };

    const result = resolveRegistry(mockProject, '');

    // Empty string is falsy, so should fall back to package.json
    expect(result).toBe('https://package.json.registry.com');
  });
});
