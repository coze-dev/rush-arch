//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { type RushConfigurationProject } from '@rushstack/rush-sdk';
import { lookupFrom, lookupOnly, lookupTo } from '@coze-arch/monorepo-kits';

import { type PublishOptions } from './types';

enum RetrievePattern {
  TO = 'to',
  FROM = 'from',
  ONLY = 'only',
}

const retrievePackages = (
  pattern: RetrievePattern,
  packages: string[],
): string[] => {
  const matchedPackages = new Set<string>();
  packages.forEach(pkg => {
    const project = lookupOnly(pkg);
    if (!project) {
      throw new Error(`Package "${pkg}" not found in rush configuration`);
    }
    if (!project.shouldPublish) {
      throw new Error(
        `Package "${pkg}" is not set to publish. if you want to publish it, please set the "shouldPublish" property to true in the \`rush.json\` file.`,
      );
    }
    const matched: string[] = [];
    switch (pattern) {
      case 'to': {
        matched.push(...lookupTo(pkg));
        break;
      }
      case 'from': {
        matched.push(...lookupFrom(pkg));
        break;
      }
      case 'only': {
        matched.push(pkg);
        break;
      }
      default: {
        throw new Error('Unexpected package selection state');
      }
    }

    matched.forEach(pkgName => {
      matchedPackages.add(pkgName);
    });
  });

  return [...matchedPackages];
};

export const validateAndGetPackages = (options: PublishOptions) => {
  const retrievePatterns = Object.values(RetrievePattern);
  if (retrievePatterns.every(pattern => (options[pattern]?.length || 0) <= 0)) {
    throw new Error('No packages to publish');
  }
  const res = retrievePatterns.reduce((acc, pattern) => {
    const packages = options[pattern];
    if (!packages || packages.length <= 0) {
      return acc;
    }
    const placeholders = retrievePackages(pattern as RetrievePattern, packages);
    placeholders.forEach(pkgName => {
      acc.add(pkgName);
    });
    return acc;
  }, new Set<string>());
  const result = [...res]
    .map(pkgName => {
      const p = lookupOnly(pkgName);
      if (p && p.shouldPublish) {
        return p;
      }
      return undefined;
    })
    .filter(Boolean) as RushConfigurationProject[];
  return result;
};
