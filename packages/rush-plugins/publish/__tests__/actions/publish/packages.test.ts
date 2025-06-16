//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { type RushConfigurationProject } from '@rushstack/rush-sdk';
import { lookupOnly, lookupTo, lookupFrom } from '@coze-arch/monorepo-kits';

import { type PublishOptions } from '@/action/publish/types';
import { validateAndGetPackages } from '@/action/publish/packages';

// Mock dependencies
vi.mock('@coze-arch/monorepo-kits', () => ({
  lookupOnly: vi.fn(),
  lookupTo: vi.fn(),
  lookupFrom: vi.fn(),
}));

describe('packages', () => {
  const createMockProject = ({
    name,
    shouldPublish = true,
    dependencyProjects = new Set<RushConfigurationProject>(),
    consumingProjects = new Set<RushConfigurationProject>(),
  }: {
    name: string;
    shouldPublish?: boolean;
    dependencyProjects?: Set<RushConfigurationProject>;
    consumingProjects?: Set<RushConfigurationProject>;
  }): RushConfigurationProject => {
    const project = {
      packageName: name,
      shouldPublish,
      _versionPolicy: null,
      _dependencyProjects: dependencyProjects,
      _consumingProjects: consumingProjects,
    } as unknown as RushConfigurationProject;
    return project;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateAndGetPackages', () => {
    it('should throw error when no packages are specified', () => {
      const options: PublishOptions = {
        repoUrl: 'git@github.com:example/repo.git',
      };
      expect(() => validateAndGetPackages(options)).toThrow(
        'No packages to publish',
      );
    });

    it('should throw error when package is not found', () => {
      const options: PublishOptions = {
        to: ['non-existent-package'],
        repoUrl: 'git@github.com:example/repo.git',
      };

      vi.mocked(lookupOnly).mockImplementation((name: string) => {
        if (name === 'non-existent-package') {
          throw new Error('Project non-existent-package not found');
        }
        throw new Error(`Project ${name} not found`);
      });

      expect(() => validateAndGetPackages(options)).toThrow(
        'Project non-existent-package not found',
      );
    });

    it('should throw error when package is not set to publish', () => {
      const options: PublishOptions = {
        to: ['non-publishable-package'],
        repoUrl: 'git@github.com:example/repo.git',
      };

      const mockProject = createMockProject({
        name: 'non-publishable-package',
        shouldPublish: false,
      });

      vi.mocked(lookupOnly).mockImplementation((name: string) => {
        if (name === 'non-publishable-package') {
          throw new Error('Project non-publishable-package not found');
        }
        return mockProject;
      });

      expect(() => validateAndGetPackages(options)).toThrow(
        'Project non-publishable-package not found',
      );
    });

    it('should handle "to" pattern correctly', () => {
      const depProject1 = createMockProject({ name: 'dep1' });
      const depProject2 = createMockProject({ name: 'dep2' });
      const nonPublishableDepProject = createMockProject({
        name: 'dep3',
        shouldPublish: false,
      });
      const mainProject = createMockProject({
        name: 'main',
        dependencyProjects: new Set([
          depProject1,
          depProject2,
          nonPublishableDepProject,
        ]),
      });

      const mockProjects = {
        main: mainProject,
        dep1: depProject1,
        dep2: depProject2,
        dep3: nonPublishableDepProject,
      } as const;

      vi.mocked(lookupOnly).mockImplementation(
        (name: string) => mockProjects[name as keyof typeof mockProjects],
      );
      vi.mocked(lookupTo).mockImplementation(() => [
        'main',
        'dep1',
        'dep2',
        'dep3',
      ]);

      const options: PublishOptions = {
        to: ['main'],
        repoUrl: 'git@github.com:example/repo.git',
      };

      const result = validateAndGetPackages(options);
      expect(result.length).toBe(3); // main + 2 publishable deps
      expect(result.includes(mainProject)).toBe(true);
      expect(result.includes(depProject1)).toBe(true);
      expect(result.includes(depProject2)).toBe(true);
      expect(result.includes(nonPublishableDepProject)).toBe(false);
    });

    it('should handle "from" pattern correctly', () => {
      const depProject = createMockProject({ name: 'dep' });
      const consumingProject1 = createMockProject({ name: 'consuming1' });
      const consumingProject2 = createMockProject({ name: 'consuming2' });
      const nonPublishableConsumer = createMockProject({
        name: 'consuming3',
        shouldPublish: false,
      });

      const mainProject = createMockProject({
        name: 'main',
        dependencyProjects: new Set([depProject]),
        consumingProjects: new Set([
          consumingProject1,
          consumingProject2,
          nonPublishableConsumer,
        ]),
      });

      const mockProjects = {
        main: mainProject,
        dep: depProject,
        consuming1: consumingProject1,
        consuming2: consumingProject2,
        consuming3: nonPublishableConsumer,
      } as const;

      vi.mocked(lookupOnly).mockImplementation(
        (name: string) => mockProjects[name as keyof typeof mockProjects],
      );
      vi.mocked(lookupFrom).mockImplementation(() => [
        'main',
        'dep',
        'consuming1',
        'consuming2',
        'consuming3',
      ]);

      const options: PublishOptions = {
        from: ['main'],
        repoUrl: 'git@github.com:example/repo.git',
      };

      const result = validateAndGetPackages(options);
      expect(result.length).toBe(4); // main + dep + 2 publishable consumers
      expect(result.includes(mainProject)).toBe(true);
      expect(result.includes(depProject)).toBe(true);
      expect(result.includes(consumingProject1)).toBe(true);
      expect(result.includes(consumingProject2)).toBe(true);
      expect(result.includes(nonPublishableConsumer)).toBe(false);
    });

    it('should handle "only" pattern correctly', () => {
      const project1 = createMockProject({ name: 'project1' });
      const project2 = createMockProject({ name: 'project2' });

      const mockProjects = {
        project1,
        project2,
      } as const;

      vi.mocked(lookupOnly).mockImplementation(
        (name: string) => mockProjects[name as keyof typeof mockProjects],
      );

      const options: PublishOptions = {
        only: ['project1', 'project2'],
        repoUrl: 'git@github.com:example/repo.git',
      };

      const result = validateAndGetPackages(options);
      expect(result.length).toBe(2);
      expect(result.includes(project1)).toBe(true);
      expect(result.includes(project2)).toBe(true);
    });

    it('should combine multiple patterns correctly', () => {
      const depProject = createMockProject({ name: 'dep' });
      const consumingProject = createMockProject({ name: 'consuming' });
      const onlyProject = createMockProject({ name: 'only' });

      const mainProject = createMockProject({
        name: 'main',
        dependencyProjects: new Set([depProject]),
        consumingProjects: new Set([consumingProject]),
      });

      const mockProjects = {
        main: mainProject,
        dep: depProject,
        consuming: consumingProject,
        only: onlyProject,
      } as const;

      vi.mocked(lookupOnly).mockImplementation(
        (name: string) => mockProjects[name as keyof typeof mockProjects],
      );
      vi.mocked(lookupTo).mockImplementation(() => ['main', 'dep']);
      vi.mocked(lookupFrom).mockImplementation(() => ['main', 'consuming']);

      const options: PublishOptions = {
        to: ['main'],
        from: ['main'],
        only: ['only'],
        repoUrl: 'git@github.com:example/repo.git',
      };

      const result = validateAndGetPackages(options);
      expect(result.length).toBe(4); // main + dep + consuming + only
      expect(result.includes(mainProject)).toBe(true);
      expect(result.includes(depProject)).toBe(true);
      expect(result.includes(consumingProject)).toBe(true);
      expect(result.includes(onlyProject)).toBe(true);
    });
  });
});
