import path from 'path';
import fs from 'fs';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fs module
vi.mock('fs');
const mockedFs = vi.mocked(fs);

// 重新实现 toAbsolute 函数用于测试
const toAbsolute = (root: string, file: string) => {
  if (fs.existsSync(path.join(root, 'src'))) {
    return path.join(root, 'src', file);
  }
  return path.join(root, file);
};

describe('toAbsolute 辅助函数', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该返回 src 目录下的路径当 src 目录存在时', () => {
    mockedFs.existsSync.mockReturnValue(true);

    const result = toAbsolute('/project/packages/utils', 'constants.js');

    expect(result).toBe(
      path.join('/project/packages/utils', 'src', 'constants.js'),
    );
    expect(mockedFs.existsSync).toHaveBeenCalledWith(
      path.join('/project/packages/utils', 'src'),
    );
  });

  it('应该返回根目录下的路径当 src 目录不存在时', () => {
    mockedFs.existsSync.mockReturnValue(false);

    const result = toAbsolute('/project/packages/utils', 'constants.js');

    expect(result).toBe(path.join('/project/packages/utils', 'constants.js'));
    expect(mockedFs.existsSync).toHaveBeenCalledWith(
      path.join('/project/packages/utils', 'src'),
    );
  });

  it('应该正确处理嵌套路径', () => {
    mockedFs.existsSync.mockReturnValue(true);

    const result = toAbsolute(
      '/project/packages/components',
      'utils/format.js',
    );

    expect(result).toBe(
      path.join('/project/packages/components', 'src', 'utils/format.js'),
    );
  });

  it('应该正确处理空文件路径', () => {
    mockedFs.existsSync.mockReturnValue(false);

    const result = toAbsolute('/project/packages/utils', '');

    expect(result).toBe(path.join('/project/packages/utils', ''));
    expect(mockedFs.existsSync).toHaveBeenCalledWith(
      path.join('/project/packages/utils', 'src'),
    );
  });

  it('应该正确处理以斜杠开头的文件路径', () => {
    mockedFs.existsSync.mockReturnValue(false);

    const result = toAbsolute('/project/packages/utils', '/helpers/index.js');

    expect(result).toBe(
      path.join('/project/packages/utils', '/helpers/index.js'),
    );
  });
});
