import path from 'path';
import fs from 'fs';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import PkgRootWebpackPlugin from '../src/index';

// Mock fs module
vi.mock('fs');
const mockedFs = vi.mocked(fs);

describe('PkgRootWebpackPlugin 集成测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('真实场景模拟', () => {
    it('应该正确处理 monorepo 场景', () => {
      const plugin = new PkgRootWebpackPlugin({
        packagesDirs: ['packages/ui', 'packages/utils', 'apps/web'],
        excludeFolders: ['packages/legacy'],
        root: '@',
      });

      let resolveCallback: any;
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: vi.fn((pluginName, callback) => {
              const mockNormalModuleFactory = {
                hooks: {
                  beforeResolve: {
                    tapAsync: vi.fn((hookName, cb) => {
                      resolveCallback = cb;
                    }),
                  },
                },
              };
              callback(mockNormalModuleFactory);
            }),
          },
        },
      };

      plugin.apply(mockCompiler as any);

      // 模拟不同包中的请求
      const scenarios = [
        {
          name: 'packages/ui 中的请求',
          request: {
            request: '@/components/Button',
            context: '/project/packages/ui/src',
          },
          expectSrc: true,
          expectedPath: path.join(
            '/project/packages/ui',
            'src',
            '/components/Button',
          ),
        },
        {
          name: 'packages/utils 中的请求',
          request: {
            request: '@/helpers/format',
            context: '/project/packages/utils/lib',
          },
          expectSrc: false,
          expectedPath: path.join('/project/packages/utils', '/helpers/format'),
        },
        {
          name: 'apps/web 中的请求',
          request: {
            request: '@/pages/Home',
            context: '/project/apps/web/src/views',
          },
          expectSrc: true,
          expectedPath: path.join('/project/apps/web', 'src', '/pages/Home'),
        },
      ];

      scenarios.forEach(scenario => {
        mockedFs.existsSync.mockReturnValue(scenario.expectSrc);
        const mockCallback = vi.fn();

        resolveCallback(scenario.request, mockCallback);

        expect(scenario.request.request).toBe(scenario.expectedPath);
        expect(mockCallback).toHaveBeenCalledWith();
      });
    });

    it('应该处理复杂的目录结构', () => {
      const plugin = new PkgRootWebpackPlugin({
        packagesDirs: ['libs/shared', 'features/auth', 'features/dashboard'],
        root: '~',
      });

      let resolveCallback: any;
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: vi.fn((pluginName, callback) => {
              const mockNormalModuleFactory = {
                hooks: {
                  beforeResolve: {
                    tapAsync: vi.fn((hookName, cb) => {
                      resolveCallback = cb;
                    }),
                  },
                },
              };
              callback(mockNormalModuleFactory);
            }),
          },
        },
      };

      plugin.apply(mockCompiler as any);

      mockedFs.existsSync.mockReturnValue(false);
      const mockCallback = vi.fn();
      const mockRequest = {
        request: '~/api/client',
        context: '/project/features/auth/components',
      };

      resolveCallback(mockRequest, mockCallback);

      expect(mockRequest.request).toBe(
        path.join('/project/features/auth', '/api/client'),
      );
    });

    it('应该正确处理边界情况', () => {
      const plugin = new PkgRootWebpackPlugin({
        packagesDirs: ['packages/core'],
      });

      let resolveCallback: any;
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: vi.fn((pluginName, callback) => {
              const mockNormalModuleFactory = {
                hooks: {
                  beforeResolve: {
                    tapAsync: vi.fn((hookName, cb) => {
                      resolveCallback = cb;
                    }),
                  },
                },
              };
              callback(mockNormalModuleFactory);
            }),
          },
        },
      };

      plugin.apply(mockCompiler as any);

      const testCases = [
        {
          name: '空的 innerRequest',
          request: { request: null, context: '/project/packages/core' },
          shouldModify: false,
        },
        {
          name: 'undefined innerRequest',
          request: { request: undefined, context: '/project/packages/core' },
          shouldModify: false,
        },
        {
          name: '不匹配的 context',
          request: { request: '@/utils', context: '/other/project' },
          shouldModify: false,
        },
        {
          name: '不以 @ 开头的请求',
          request: { request: 'lodash', context: '/project/packages/core' },
          shouldModify: false,
        },
      ];

      testCases.forEach(testCase => {
        const mockCallback = vi.fn();
        const originalRequest = testCase.request.request;

        resolveCallback(testCase.request, mockCallback);

        if (!testCase.shouldModify) {
          expect(testCase.request.request).toBe(originalRequest);
        }
        expect(mockCallback).toHaveBeenCalledWith();
      });
    });

    it('应该支持多个排除文件夹', () => {
      const plugin = new PkgRootWebpackPlugin({
        packagesDirs: [
          'packages/ui',
          'packages/utils',
          'packages/legacy',
          'packages/deprecated',
        ],
        excludeFolders: ['packages/legacy/', 'packages/deprecated/'],
      });

      let resolveCallback: any;
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: vi.fn((pluginName, callback) => {
              const mockNormalModuleFactory = {
                hooks: {
                  beforeResolve: {
                    tapAsync: vi.fn((hookName, cb) => {
                      resolveCallback = cb;
                    }),
                  },
                },
              };
              callback(mockNormalModuleFactory);
            }),
          },
        },
      };

      plugin.apply(mockCompiler as any);

      const excludedRequests = [
        { request: '@/old-utils', context: '/project/packages/legacy/src' },
        {
          request: '@/deprecated-component',
          context: '/project/packages/deprecated/lib',
        },
      ];

      excludedRequests.forEach(req => {
        const mockCallback = vi.fn();
        const originalRequest = req.request;

        resolveCallback(req, mockCallback);

        expect(req.request).toBe(originalRequest); // 应该保持不变
        expect(mockCallback).toHaveBeenCalledWith();
      });
    });
  });
});
