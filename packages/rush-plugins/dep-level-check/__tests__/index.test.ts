//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import type {
  RushConfiguration,
  RushSession,
  RushConfigurationProject,
} from '@rushstack/rush-sdk';

// Mock logger
vi.mock('@coze-arch/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock utils
vi.mock('../src/utils', () => ({
  parseTagsLevel: vi.fn(),
  isValidLevel: vi.fn(),
  isDepLevelMatch: vi.fn(),
}));

// Import mocked modules
import { logger } from '@coze-arch/logger';

import { parseTagsLevel, isValidLevel, isDepLevelMatch } from '../src/utils';
import RushDepLevelPlugin from '../src/rush-dep-check-plugin';

// Mock process methods
const mockProcessExit = vi.spyOn(process, 'exit').mockImplementation(() => {
  throw new Error('process.exit called');
});

const mockProcessHrtime = vi.spyOn(process, 'hrtime');

describe('RushDepLevelPlugin', () => {
  let plugin: RushDepLevelPlugin;
  let mockRushSession: RushSession;
  let mockRushConfiguration: RushConfiguration;
  let mockProjects: RushConfigurationProject[];

  // Mock functions with proper typing
  const mockParseTagsLevel = parseTagsLevel as unknown as Mock;
  const mockIsValidLevel = isValidLevel as unknown as Mock;
  const mockIsDepLevelMatch = isDepLevelMatch as unknown as Mock;
  const mockLoggerInfo = logger.info as Mock;
  const mockLoggerError = logger.error as Mock;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Create plugin instance
    plugin = new RushDepLevelPlugin();

    // Create mock projects
    mockProjects = [];

    // Mock RushConfiguration
    mockRushConfiguration = {
      projects: mockProjects,
    } as unknown as RushConfiguration;

    // Mock RushSession with hooks
    mockRushSession = {
      hooks: {
        beforeInstall: {
          tap: vi.fn(),
        },
      },
    } as unknown as RushSession;
  });

  describe('apply', () => {
    it('should register beforeInstall hook', () => {
      plugin.apply(mockRushSession, mockRushConfiguration);

      expect(mockRushSession.hooks.beforeInstall.tap).toHaveBeenCalledWith(
        'RushDepLevelPlugin',
        expect.any(Function),
      );
    });

    it('should validate all projects successfully when configuration is correct', () => {
      // Setup mock hrtime for this test
      mockProcessHrtime
        .mockReturnValueOnce([0, 0]) // start time (absolute)
        .mockReturnValueOnce([1, 500000000]); // time diff (1.5 seconds)

      // Setup mock projects
      const depProject = createMockProject('dep-package', ['level-1'], []);
      const mainProject = createMockProject(
        'main-package',
        ['level-2'],
        [depProject],
      );
      mockProjects.push(mainProject, depProject);

      // Setup mocks for successful validation
      // mainProject: parseTagsLevel(mainProject.tags) -> 2
      // depProject (as dependency): parseTagsLevel(depProject.tags) -> 1
      // depProject (as standalone project): parseTagsLevel(depProject.tags) -> 1
      mockParseTagsLevel
        .mockReturnValueOnce(2) // main project level
        .mockReturnValueOnce(1) // dep project level (as dependency)
        .mockReturnValueOnce(1); // dep project level (as standalone project)

      // isValidLevel calls:
      // mainProject: isValidLevel(2) -> true
      // depProject (as dependency): isValidLevel(1) -> true
      // depProject (as standalone project): isValidLevel(1) -> true
      mockIsValidLevel
        .mockReturnValueOnce(true) // main project has valid level
        .mockReturnValueOnce(true) // dep project has valid level (as dependency)
        .mockReturnValueOnce(true); // dep project has valid level (as standalone)

      mockIsDepLevelMatch.mockReturnValueOnce(true); // dependency level matches

      // Execute the hook
      plugin.apply(mockRushSession, mockRushConfiguration);
      const hookCallback = (mockRushSession.hooks.beforeInstall.tap as Mock)
        .mock.calls[0][1];
      hookCallback();

      // Verify calls
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        '[RushDepLevelPlugin] Validating dependency levels for 2 projects...',
      );
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        '[RushDepLevelPlugin] Dependency level validation completed in 1500.00ms',
      );
      expect(mockParseTagsLevel).toHaveBeenCalledTimes(3); // 2 projects + 1 dependency
      expect(mockIsValidLevel).toHaveBeenCalledTimes(3); // 2 projects + 1 dependency
      expect(mockIsDepLevelMatch).toHaveBeenCalledWith(2, 1);
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should exit when project has no level tag', () => {
      // Setup mock hrtime for this test
      mockProcessHrtime
        .mockReturnValueOnce([0, 0]) // start time (absolute)
        .mockReturnValueOnce([1, 500000000]); // time diff (1.5 seconds)

      // Setup mock project without valid level
      const project = createMockProject('test-package', [], []);
      mockProjects.push(project);

      mockParseTagsLevel.mockReturnValueOnce(null);
      mockIsValidLevel.mockReturnValueOnce(false);

      // Execute the hook and expect it to throw
      plugin.apply(mockRushSession, mockRushConfiguration);
      const hookCallback = (mockRushSession.hooks.beforeInstall.tap as Mock)
        .mock.calls[0][1];

      expect(() => hookCallback()).toThrow('process.exit called');

      // Verify error logging and exit
      expect(mockLoggerError).toHaveBeenCalledWith(
        '[RushDepLevelPlugin] test-package 没有配置level tag，请在rush.json中配置tags字段',
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it('should exit when dependency project has no level tag', () => {
      // Setup mock hrtime for this test
      mockProcessHrtime
        .mockReturnValueOnce([0, 0]) // start time (absolute)
        .mockReturnValueOnce([1, 500000000]); // time diff (1.5 seconds)

      // Setup mock projects where dependency has no level tag
      const depProject = createMockProject('dep-package', [], []);
      const mainProject = createMockProject(
        'main-package',
        ['level-2'],
        [depProject],
      );
      mockProjects.push(mainProject, depProject);

      mockParseTagsLevel
        .mockReturnValueOnce(2) // main project level
        .mockReturnValueOnce(null); // dep project has no level

      mockIsValidLevel
        .mockReturnValueOnce(true) // main project has valid level
        .mockReturnValueOnce(false); // dep project has no valid level

      // Execute the hook and expect it to throw
      plugin.apply(mockRushSession, mockRushConfiguration);
      const hookCallback = (mockRushSession.hooks.beforeInstall.tap as Mock)
        .mock.calls[0][1];

      expect(() => hookCallback()).toThrow('process.exit called');

      // Verify error logging
      expect(mockLoggerError).toHaveBeenCalledWith(
        '[RushDepLevelPlugin] main-package 依赖的 dep-package 没有配置level tag，请在rush.json中配置tags字段。',
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it('should exit when dependency level does not match', () => {
      // Setup mock hrtime for this test
      mockProcessHrtime
        .mockReturnValueOnce([0, 0]) // start time (absolute)
        .mockReturnValueOnce([1, 500000000]); // time diff (1.5 seconds)

      // Setup mock projects with mismatched levels
      const depProject = createMockProject('dep-package', ['level-3'], []);
      const mainProject = createMockProject(
        'main-package',
        ['level-2'],
        [depProject],
      );
      mockProjects.push(mainProject, depProject);

      mockParseTagsLevel
        .mockReturnValueOnce(2) // main project level
        .mockReturnValueOnce(3); // dep project level (higher than main)

      mockIsValidLevel
        .mockReturnValueOnce(true) // main project has valid level
        .mockReturnValueOnce(true); // dep project has valid level

      mockIsDepLevelMatch.mockReturnValueOnce(false); // levels don't match

      // Execute the hook and expect it to throw
      plugin.apply(mockRushSession, mockRushConfiguration);
      const hookCallback = (mockRushSession.hooks.beforeInstall.tap as Mock)
        .mock.calls[0][1];

      expect(() => hookCallback()).toThrow('process.exit called');

      // Verify error logging
      expect(mockLoggerError).toHaveBeenCalledWith(
        '[RushDepLevelPlugin] main-package 的依赖级别不匹配：项目级别为level-2，依赖 "dep-package" 级别为level-3。项目只能依赖相同或更低级别的包，请在rush.json调整tags字段配置。',
      );
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    it('should handle projects with no dependencies', () => {
      // Setup mock hrtime for this test
      mockProcessHrtime
        .mockReturnValueOnce([0, 0]) // start time (absolute)
        .mockReturnValueOnce([1, 500000000]); // time diff (1.5 seconds)

      // Setup mock project with no dependencies
      const project = createMockProject('standalone-package', ['level-1'], []);
      mockProjects.push(project);

      mockParseTagsLevel.mockReturnValueOnce(1);
      mockIsValidLevel.mockReturnValueOnce(true);

      // Execute the hook
      plugin.apply(mockRushSession, mockRushConfiguration);
      const hookCallback = (mockRushSession.hooks.beforeInstall.tap as Mock)
        .mock.calls[0][1];
      hookCallback();

      // Verify successful execution
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        '[RushDepLevelPlugin] Validating dependency levels for 1 projects...',
      );
      expect(mockProcessExit).not.toHaveBeenCalled();
      expect(mockIsDepLevelMatch).not.toHaveBeenCalled(); // No dependencies to check
    });

    it('should handle complex dependency chains', () => {
      // Setup mock hrtime for this test
      mockProcessHrtime
        .mockReturnValueOnce([0, 0]) // start time (absolute)
        .mockReturnValueOnce([1, 500000000]); // time diff (1.5 seconds)

      // Setup complex dependency chain
      const baseProject = createMockProject('base-package', ['level-1'], []);
      const midProject = createMockProject(
        'mid-package',
        ['level-2'],
        [baseProject],
      );
      const topProject = createMockProject(
        'top-package',
        ['level-3'],
        [midProject, baseProject],
      );
      mockProjects.push(topProject, midProject, baseProject);

      // Setup mocks for all projects
      mockParseTagsLevel
        .mockReturnValueOnce(3) // top project
        .mockReturnValueOnce(2) // mid project (dependency of top)
        .mockReturnValueOnce(1) // base project (dependency of top)
        .mockReturnValueOnce(2) // mid project
        .mockReturnValueOnce(1) // base project (dependency of mid)
        .mockReturnValueOnce(1); // base project

      mockIsValidLevel.mockReturnValue(true); // All projects have valid levels

      mockIsDepLevelMatch.mockReturnValue(true); // All dependency levels match

      // Execute the hook
      plugin.apply(mockRushSession, mockRushConfiguration);
      const hookCallback = (mockRushSession.hooks.beforeInstall.tap as Mock)
        .mock.calls[0][1];
      hookCallback();

      // Verify all projects were processed
      expect(mockParseTagsLevel).toHaveBeenCalledTimes(6); // 3 projects + their dependencies
      expect(mockIsValidLevel).toHaveBeenCalledTimes(6);
      expect(mockIsDepLevelMatch).toHaveBeenCalledTimes(3); // 2 deps for top + 1 dep for mid
      expect(mockProcessExit).not.toHaveBeenCalled();
    });

    it('should measure and log execution time correctly', () => {
      // Setup different hrtime values for more precise timing test
      // First call: process.hrtime() returns start time tuple
      // Second call: process.hrtime(startTime) returns time diff tuple
      mockProcessHrtime
        .mockReturnValueOnce([10, 500000000]) // start time (absolute)
        .mockReturnValueOnce([2, 250000000]); // time diff (2.25 seconds)

      const project = createMockProject('test-package', ['level-1'], []);
      mockProjects.push(project);

      mockParseTagsLevel.mockReturnValueOnce(1);
      mockIsValidLevel.mockReturnValueOnce(true);

      // Execute the hook
      plugin.apply(mockRushSession, mockRushConfiguration);
      const hookCallback = (mockRushSession.hooks.beforeInstall.tap as Mock)
        .mock.calls[0][1];
      hookCallback();

      // Verify timing calculation
      expect(mockProcessHrtime).toHaveBeenCalledTimes(2);
      // Just verify that a completion message with some time was logged
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[RushDepLevelPlugin\] Dependency level validation completed in \d+\.\d+ms/,
        ),
      );
    });

    it('should handle empty projects list', () => {
      // Setup mock hrtime for this test
      mockProcessHrtime
        .mockReturnValueOnce([0, 0]) // start time (absolute)
        .mockReturnValueOnce([1, 500000000]); // time diff (1.5 seconds)

      // Empty projects array
      mockProjects.length = 0;

      // Execute the hook
      plugin.apply(mockRushSession, mockRushConfiguration);
      const hookCallback = (mockRushSession.hooks.beforeInstall.tap as Mock)
        .mock.calls[0][1];
      hookCallback();

      // Verify it handles empty list gracefully
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        '[RushDepLevelPlugin] Validating dependency levels for 0 projects...',
      );
      // Just verify that a completion message with some time was logged
      expect(mockLoggerInfo).toHaveBeenCalledWith(
        expect.stringMatching(
          /\[RushDepLevelPlugin\] Dependency level validation completed in \d+\.\d+ms/,
        ),
      );
      expect(mockProcessExit).not.toHaveBeenCalled();
    });
  });

  /**
   * Helper function to create mock RushConfigurationProject
   */
  function createMockProject(
    packageName: string,
    tags: string[],
    dependencyProjects: RushConfigurationProject[],
  ): RushConfigurationProject {
    return {
      packageName,
      tags,
      dependencyProjects: new Set(dependencyProjects),
    } as unknown as RushConfigurationProject;
  }
});
