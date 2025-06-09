//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import path from 'path';

import { vi, type Mock } from 'vitest';

import { format } from '../src/prettier';

// Mock 所有外部依赖模块
vi.mock('prettier', () => ({
  format: vi.fn(),
  resolveConfig: vi.fn(),
  resolveConfigFile: vi.fn(),
}));

vi.mock('@coze-arch/monorepo-kits', () => ({
  getRushConfiguration: vi.fn(),
}));

vi.mock('path', () => ({
  default: {
    resolve: vi.fn(),
  },
}));

// 导入 mocked 版本的模块
import {
  format as prettierFormat,
  resolveConfig,
  resolveConfigFile,
} from 'prettier';
import { getRushConfiguration } from '@coze-arch/monorepo-kits';

describe('prettier module', () => {
  const mockRushConfig = {
    rushJsonFolder: '/path/to/project',
  };

  const mockPrettierConfig = {
    semi: true,
    singleQuote: true,
    trailingComma: 'es5' as const,
    tabWidth: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getRushConfiguration as Mock).mockReturnValue(mockRushConfig);
    (path.resolve as Mock).mockImplementation((...args) => args.join('/'));
  });

  describe('format function', () => {
    it('should format code with prettier config when config is found', async () => {
      const inputCode = 'const a=1;const b=2;';
      const formattedCode = 'const a = 1;\nconst b = 2;\n';
      const testFilepath = '/path/to/test.ts';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode, testFilepath);

      expect(resolveConfigFile).toHaveBeenCalledWith(testFilepath);
      expect(resolveConfig).toHaveBeenCalledWith('/path/to/.prettierrc.js', {
        useCache: true,
        editorconfig: true,
      });
      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        ...mockPrettierConfig,
        filepath: testFilepath,
      });
      expect(result).toBe(formattedCode);
    });

    it('should use default rush config path when no filepath provided', async () => {
      const inputCode = 'const a=1;';
      const formattedCode = 'const a = 1;\n';

      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(resolveConfigFile).not.toHaveBeenCalled();
      expect(getRushConfiguration).toHaveBeenCalled();
      expect(path.resolve).toHaveBeenCalledWith(
        '/path/to/project',
        '.prettierrc.js',
      );
      expect(resolveConfig).toHaveBeenCalledWith(
        '/path/to/project/.prettierrc.js',
        {
          useCache: true,
          editorconfig: true,
        },
      );
      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        ...mockPrettierConfig,
        filepath: undefined,
      });
      expect(result).toBe(formattedCode);
    });

    it('should return original code when prettier config resolution fails', async () => {
      const inputCode = 'const a=1;const b=2;';
      const testFilepath = '/path/to/test.ts';

      (resolveConfigFile as Mock).mockRejectedValue(
        new Error('Config file not found'),
      );

      const result = await format(inputCode, testFilepath);

      expect(resolveConfigFile).toHaveBeenCalledWith(testFilepath);
      expect(prettierFormat).not.toHaveBeenCalled();
      expect(result).toBe(inputCode);
    });

    it('should return original code when resolveConfig throws error', async () => {
      const inputCode = 'const a=1;const b=2;';
      const testFilepath = '/path/to/test.ts';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockRejectedValue(new Error('Invalid config'));

      const result = await format(inputCode, testFilepath);

      expect(resolveConfigFile).toHaveBeenCalledWith(testFilepath);
      expect(resolveConfig).toHaveBeenCalledWith('/path/to/.prettierrc.js', {
        useCache: true,
        editorconfig: true,
      });
      expect(prettierFormat).not.toHaveBeenCalled();
      expect(result).toBe(inputCode);
    });

    it('should return original code when resolveConfig returns null', async () => {
      const inputCode = 'const a=1;const b=2;';
      const formattedCode = 'const a = 1; const b = 2;';
      const testFilepath = '/path/to/test.ts';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(null);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode, testFilepath);

      expect(resolveConfigFile).toHaveBeenCalledWith(testFilepath);
      expect(resolveConfig).toHaveBeenCalledWith('/path/to/.prettierrc.js', {
        useCache: true,
        editorconfig: true,
      });
      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        filepath: testFilepath,
      });
      expect(result).toBe(formattedCode);
    });

    it('should handle empty code input', async () => {
      const inputCode = '';
      const formattedCode = '';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        ...mockPrettierConfig,
        filepath: undefined,
      });
      expect(result).toBe(formattedCode);
    });

    it('should handle multiline code input', async () => {
      const inputCode = `function test(){
        const a=1;
        const b=2;
        return a+b;
      }`;
      const formattedCode = `function test() {
  const a = 1;
  const b = 2;
  return a + b;
}
`;

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        ...mockPrettierConfig,
        filepath: undefined,
      });
      expect(result).toBe(formattedCode);
    });

    it('should pass custom prettier config options', async () => {
      const inputCode = 'const a=1;';
      const formattedCode = 'const a = 1\n';
      const customConfig = {
        semi: false,
        singleQuote: false,
        tabWidth: 4,
      };

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(customConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        ...customConfig,
        filepath: undefined,
      });
      expect(result).toBe(formattedCode);
    });

    it('should handle getRushConfiguration error when no filepath provided', async () => {
      const inputCode = 'const a=1;';

      (getRushConfiguration as Mock).mockImplementation(() => {
        throw new Error('Rush configuration error');
      });

      const result = await format(inputCode);

      expect(getRushConfiguration).toHaveBeenCalled();
      expect(prettierFormat).not.toHaveBeenCalled();
      expect(result).toBe(inputCode);
    });

    it('should handle path.resolve error', async () => {
      const inputCode = 'const a=1;';

      (path.resolve as Mock).mockImplementation(() => {
        throw new Error('Path resolution error');
      });

      const result = await format(inputCode);

      expect(path.resolve).toHaveBeenCalledWith(
        '/path/to/project',
        '.prettierrc.js',
      );
      expect(prettierFormat).not.toHaveBeenCalled();
      expect(result).toBe(inputCode);
    });

    it('should handle different file extensions', async () => {
      const inputCode = '{"name":"test"}';
      const formattedCode = '{\n  "name": "test"\n}\n';
      const jsonFilepath = '/path/to/package.json';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode, jsonFilepath);

      expect(resolveConfigFile).toHaveBeenCalledWith(jsonFilepath);
      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        ...mockPrettierConfig,
        filepath: jsonFilepath,
      });
      expect(result).toBe(formattedCode);
    });

    it('should handle undefined config with fallback behavior', async () => {
      const inputCode = 'const a=1;';
      const formattedCode = 'const a = 1;';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(undefined);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(resolveConfig).toHaveBeenCalledWith(
        '/path/to/project/.prettierrc.js',
        {
          useCache: true,
          editorconfig: true,
        },
      );
      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        filepath: undefined,
      });
      expect(result).toBe(formattedCode);
    });

    it('should handle config with partial options', async () => {
      const inputCode = 'const a=1;';
      const formattedCode = 'const a = 1;\n';
      const partialConfig = {
        semi: true,
      };

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(partialConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        ...partialConfig,
        filepath: undefined,
      });
      expect(result).toBe(formattedCode);
    });
  });

  describe('error handling', () => {
    it('should handle prettier format throwing error', async () => {
      const inputCode = 'invalid javascript code }{';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockImplementation(() => {
        throw new Error('Prettier format error');
      });

      // 由于原代码没有对 prettier.format 的错误进行捕获，
      // 这个测试验证错误会被抛出
      await expect(format(inputCode)).rejects.toThrow('Prettier format error');
    });

    it('should handle async errors in resolveConfigFile', async () => {
      const inputCode = 'const a=1;';
      const filepath = '/path/to/test.ts';

      (resolveConfigFile as Mock).mockRejectedValue(new Error('Async error'));

      const result = await format(inputCode, filepath);

      expect(result).toBe(inputCode);
    });

    it('should handle async errors in resolveConfig', async () => {
      const inputCode = 'const a=1;';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockRejectedValue(
        new Error('Async resolve error'),
      );

      const result = await format(inputCode);

      expect(result).toBe(inputCode);
    });
  });

  describe('edge cases', () => {
    it('should handle very long code input', async () => {
      const inputCode = 'const a=1;'.repeat(1000);
      const formattedCode = 'const a = 1;\n'.repeat(1000);

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(prettierFormat).toHaveBeenCalledWith(inputCode, {
        ...mockPrettierConfig,
        filepath: undefined,
      });
      expect(result).toBe(formattedCode);
    });

    it('should handle special characters in code', async () => {
      const inputCode = 'const a="测试中文";const b=`模板字符串${a}`;';
      const formattedCode =
        'const a = "测试中文";\nconst b = `模板字符串${a}`;\n';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(result).toBe(formattedCode);
    });

    it('should handle empty string filepath', async () => {
      const inputCode = 'const a=1;';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);

      await format(inputCode, '');

      expect(resolveConfigFile).toHaveBeenCalledWith('');
    });

    it('should handle whitespace-only code', async () => {
      const inputCode = '   \n\t  \n  ';
      const formattedCode = '';

      (resolveConfigFile as Mock).mockResolvedValue('/path/to/.prettierrc.js');
      (resolveConfig as Mock).mockResolvedValue(mockPrettierConfig);
      (prettierFormat as Mock).mockReturnValue(formattedCode);

      const result = await format(inputCode);

      expect(result).toBe(formattedCode);
    });
  });
});
