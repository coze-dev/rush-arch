//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { RushConfiguration } from '@rushstack/rush-sdk';

export const getRushConfiguration = (() => {
  const cachedRushConfigs = new Map<string, RushConfiguration>();
  return (startingFolder?: string): RushConfiguration => {
    startingFolder = startingFolder || process.cwd();
    const possibleRushFile = RushConfiguration.tryFindRushJsonLocation({
      startingFolder,
    });
    if (!possibleRushFile) {
      throw new Error(
        `rush.json not found from starting folder: ${startingFolder}`,
      );
    }
    if (cachedRushConfigs.has(possibleRushFile)) {
      return cachedRushConfigs.get(possibleRushFile) as RushConfiguration;
    }

    const rushConfig =
      RushConfiguration.loadFromConfigurationFile(possibleRushFile);
    cachedRushConfigs.set(startingFolder, rushConfig);
    return rushConfig;
  };
})();
