//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type Mock } from 'vitest';
import { exec } from 'shelljs';
import { getRushConfiguration } from '@coze-arch/monorepo-kits';
import { logger } from '@coze-arch/logger';

import { runCommonCommands } from '../src/common-command';

// Mock dependencies
vi.mock('shelljs', () => ({
  exec: vi.fn(),
}));
vi.mock('@coze-arch/logger');
vi.mock('@coze-arch/monorepo-kits');

describe('runCommonCommands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock getRushConfiguration
    (getRushConfiguration as Mock).mockReturnValue({
      rushJsonFolder: '/path/to/rush',
    });
    // Mock performance.now
    vi.spyOn(performance, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(1000);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should execute rush command with correct arguments for test:cov action', () => {
    const packages = ['package1', 'package2'];
    const action = 'test:cov';

    (exec as Mock).mockReturnValue({ code: 0 });

    runCommonCommands(packages, action, true);

    expect(exec).toHaveBeenCalledWith(
      'node common/scripts/install-run-rush test:cov --from package1 --from package2 --verbose',
      {
        cwd: '/path/to/rush',
        fatal: false,
      },
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Start running: node common/scripts/install-run-rush test:cov --from package1 --from package2 --verbose',
    );
    expect(logger.info).toHaveBeenCalledWith(
      'finish exec command with exit code: 0, time: 1000ms',
    );
  });

  it('should execute rush command with correct arguments for lint action', () => {
    const packages = ['package1'];
    const action = 'lint';

    (exec as Mock).mockReturnValue({ code: 0 });

    runCommonCommands(packages, action, false);

    expect(exec).toHaveBeenCalledWith(
      'node common/scripts/install-run-rush lint --from package1',
      {
        cwd: '/path/to/rush',
        fatal: false,
      },
    );
  });

  it('should handle command execution failure', () => {
    const packages = ['package1'];
    const action = 'build';

    (exec as Mock).mockReturnValue({ code: 1 });

    runCommonCommands(packages, action, false);

    expect(logger.error).toHaveBeenCalledWith(
      'finish exec command with exit code: 1, time: 1000ms',
    );
    expect(process.exitCode).toBe(1);
  });

  it('should add --verbose flag when verbose is true', () => {
    const packages = ['package1'];
    const action = 'test:cov';

    (exec as Mock).mockReturnValue({ code: 0 });

    runCommonCommands(packages, action, true);

    expect(exec).toHaveBeenCalledWith(
      'node common/scripts/install-run-rush test:cov --from package1 --verbose',
      {
        cwd: '/path/to/rush',
        fatal: false,
      },
    );
  });
});
