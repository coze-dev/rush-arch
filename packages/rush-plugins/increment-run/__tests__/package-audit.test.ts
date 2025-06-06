import { type Mock } from 'vitest';
import { auditPackage } from '@coze-arch/package-audit';

import { report } from '../src/package-audit/report';
import { runPackageAudit } from '../src/package-audit';

vi.mock('@coze-arch/package-audit', () => ({ auditPackage: vi.fn() }));
vi.mock('../src/package-audit/report', () => ({ report: vi.fn() }));
vi.mock('@coze-arch/monorepo-kits', () => ({
  lookupOnly: vi.fn((packageName: string) => ({
    packageName,
    projectFolder: `path/to/${packageName}`,
    projectRelativeFolder: packageName,
  })),
}));

describe('increment run package rule', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should run owner checker correctly', async () => {
    const changedFileGroup = {
      package1: [],
      package2: [],
      package3: [],
    };
    (auditPackage as Mock).mockImplementation(async r => {
      const { packageName } = r;
      await Promise.resolve();
      switch (packageName) {
        case 'package1': {
          return [
            {
              level: 'error',
              content: 'foo bar pkg1',
              packageName,
              rule: 'rule-1',
            },
          ];
        }
        case 'package2': {
          return [
            {
              level: 'error',
              content: 'foo bar pkg2',
              packageName,
              rule: 'rule-2',
            },
          ];
        }
        default: {
          return [];
        }
      }
    });

    await runPackageAudit(changedFileGroup);

    expect(report).toBeCalledWith([
      {
        level: 'error',
        content: 'foo bar pkg1',
        packageName: 'package1',
        rule: 'rule-1',
      },
      {
        level: 'error',
        content: 'foo bar pkg2',
        packageName: 'package2',
        rule: 'rule-2',
      },
    ]);
  });
});
