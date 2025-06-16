import path from 'path';
import fs from 'fs';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import PkgRootWebpackPlugin, {
  PkgRootWebpackPlugin as NAMED_PLUGIN,
} from '../src/index';

// Mock fs module
vi.mock('fs');
const mockedFs = vi.mocked(fs);

describe('PkgRootWebpackPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('构造函数测试', () => {
    it('应该抛出错误当没有提供 packagesDirs', () => {
      expect(() => {
        new PkgRootWebpackPlugin();
      }).toThrow('packagesDir is required');
    });

    it('应该抛出错误当 packagesDirs 为空', () => {
      expect(() => {
        new PkgRootWebpackPlugin({});
      }).toThrow('packagesDir is required');
    });

    it('应该正确设置默认配置', () => {
      const plugin = new PkgRootWebpackPlugin({
        packagesDirs: ['packages'],
      });

      expect((plugin as any).options.root).toBe('@');
      expect((plugin as any).options.packagesDirs).toEqual(['packages']);
      expect((plugin as any).options.excludeFolders).toEqual([]);
    });

    it('应该正确设置自定义配置', () => {
      const options = {
        packagesDirs: ['packages', 'libs'],
        root: '#',
        excludeFolders: ['node_modules', 'dist'],
      };

      const plugin = new PkgRootWebpackPlugin(options);

      expect((plugin as any).options.root).toBe('#');
      expect((plugin as any).options.packagesDirs).toEqual([
        'packages',
        'libs',
      ]);
      expect((plugin as any).options.excludeFolders).toEqual([
        'node_modules',
        'dist',
      ]);
    });
  });

  describe('toAbsolute 函数测试', () => {
    const toAbsolute = (root: string, file: string) => {
      if (fs.existsSync(path.join(root, 'src'))) {
        return path.join(root, 'src', file);
      }
      return path.join(root, file);
    };

    it('应该返回 src 目录路径当 src 存在时', () => {
      mockedFs.existsSync.mockReturnValue(true);

      const result = toAbsolute('/project', 'utils.js');

      expect(result).toBe(path.join('/project', 'src', 'utils.js'));
      expect(mockedFs.existsSync).toHaveBeenCalledWith(
        path.join('/project', 'src'),
      );
    });

    it('应该返回根目录路径当 src 不存在时', () => {
      mockedFs.existsSync.mockReturnValue(false);

      const result = toAbsolute('/project', 'utils.js');

      expect(result).toBe(path.join('/project', 'utils.js'));
      expect(mockedFs.existsSync).toHaveBeenCalledWith(
        path.join('/project', 'src'),
      );
    });
  });

  describe('webpack 钩子注册测试', () => {
    it('应该注册 normalModuleFactory 钩子', () => {
      const plugin = new PkgRootWebpackPlugin({
        packagesDirs: ['packages'],
      });

      const mockTap = vi.fn();
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: mockTap,
          },
        },
      };

      plugin.apply(mockCompiler as any);

      expect(mockTap).toHaveBeenCalledWith(
        'PkgRootWebpackPlugin',
        expect.any(Function),
      );
    });

    it('应该注册 beforeResolve 钩子', () => {
      const plugin = new PkgRootWebpackPlugin({
        packagesDirs: ['packages'],
      });

      const mockTapAsync = vi.fn();
      const mockTap = vi.fn((pluginName, callback) => {
        const mockNormalModuleFactory = {
          hooks: {
            beforeResolve: {
              tapAsync: mockTapAsync,
            },
          },
        };
        callback(mockNormalModuleFactory);
      });

      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: mockTap,
          },
        },
      };

      plugin.apply(mockCompiler as any);

      expect(mockTapAsync).toHaveBeenCalledWith(
        'PkgRootWebpackPlugin',
        expect.any(Function),
      );
    });
  });

  describe('模块解析逻辑测试', () => {
    let plugin: PkgRootWebpackPlugin;
    let resolveCallback: any;

    beforeEach(() => {
      plugin = new PkgRootWebpackPlugin({
        packagesDirs: ['packages/utils', 'packages/components'],
        excludeFolders: ['packages/legacy'],
      });

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
    });

    it('应该忽略空请求', () => {
      const mockCallback = vi.fn();
      const mockRequest = {};

      resolveCallback(mockRequest, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith();
    });

    it('应该忽略非 @ 开头的请求', () => {
      const mockCallback = vi.fn();
      const mockRequest = {
        request: './utils',
        context: '/project/packages/utils',
      };

      resolveCallback(mockRequest, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith();
      expect(mockRequest.request).toBe('./utils');
    });

    it('应该正确解析 @ 开头的请求', () => {
      mockedFs.existsSync.mockReturnValue(false);
      const mockCallback = vi.fn();
      const mockRequest = {
        request: '@/constants',
        context: '/project/packages/utils/lib',
      };

      resolveCallback(mockRequest, mockCallback);

      expect(mockRequest.request).toBe(
        path.join('/project/packages/utils', '/constants'),
      );
      expect(mockCallback).toHaveBeenCalledWith();
    });

    it('应该解析到 src 目录当存在时', () => {
      mockedFs.existsSync.mockReturnValue(true);
      const mockCallback = vi.fn();
      const mockRequest = {
        request: '@/helpers',
        context: '/project/packages/components/build',
      };

      resolveCallback(mockRequest, mockCallback);

      expect(mockRequest.request).toBe(
        path.join('/project/packages/components', 'src', '/helpers'),
      );
      expect(mockCallback).toHaveBeenCalledWith();
    });

    it('应该忽略排除的文件夹', () => {
      const mockCallback = vi.fn();
      const mockRequest = {
        request: '@/utils',
        context: '/project/packages/legacy/src',
      };

      resolveCallback(mockRequest, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith();
      expect(mockRequest.request).toBe('@/utils');
    });

    it('应该忽略不匹配的目录', () => {
      const mockCallback = vi.fn();
      const mockRequest = {
        request: '@/config',
        context: '/project/other/folder',
      };

      resolveCallback(mockRequest, mockCallback);

      expect(mockCallback).toHaveBeenCalledWith();
      expect(mockRequest.request).toBe('@/config');
    });

    it('应该支持自定义 root 符号', () => {
      const customPlugin = new PkgRootWebpackPlugin({
        packagesDirs: ['packages/utils'],
        root: '#',
      });

      let customResolveCallback: any;
      const mockCompiler = {
        hooks: {
          normalModuleFactory: {
            tap: vi.fn((pluginName, callback) => {
              const mockNormalModuleFactory = {
                hooks: {
                  beforeResolve: {
                    tapAsync: vi.fn((hookName, cb) => {
                      customResolveCallback = cb;
                    }),
                  },
                },
              };
              callback(mockNormalModuleFactory);
            }),
          },
        },
      };

      customPlugin.apply(mockCompiler as any);

      mockedFs.existsSync.mockReturnValue(false);
      const mockCallback = vi.fn();
      const mockRequest = {
        request: '#/constants',
        context: '/project/packages/utils/lib',
      };

      customResolveCallback(mockRequest, mockCallback);

      expect(mockRequest.request).toBe(
        path.join('/project/packages/utils', '/constants'),
      );
    });
  });

  describe('导出测试', () => {
    it('应该有默认导出', () => {
      expect(PkgRootWebpackPlugin).toBeDefined();
      expect(typeof PkgRootWebpackPlugin).toBe('function');
    });

    it('应该有命名导出', () => {
      expect(NAMED_PLUGIN).toBeDefined();
      expect(typeof NAMED_PLUGIN).toBe('function');
      expect(NAMED_PLUGIN).toBe(PkgRootWebpackPlugin);
    });
  });
});
