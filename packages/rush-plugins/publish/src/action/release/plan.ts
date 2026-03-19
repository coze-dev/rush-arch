//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import { minimatch } from 'minimatch';

import { type ReleaseManifest } from './types';

export enum ReleaseType {
  ALPHA = 'alpha',
  BETA = 'beta',
  LATEST = 'latest',
}

export const calReleaseType = (version: string) => {
  const tag = version.includes('alpha')
    ? ReleaseType.ALPHA
    : version.includes('beta')
      ? ReleaseType.BETA
      : ReleaseType.LATEST;
  return tag;
};

const calReleasePlan = (releaseManifests: ReleaseManifest[]) => {
  const plan = releaseManifests.map(r => calReleaseType(r.version));
  if (plan.some(p => p === ReleaseType.LATEST)) {
    return ReleaseType.LATEST;
  }
  if (plan.some(p => p === ReleaseType.BETA)) {
    return ReleaseType.BETA;
  }
  return ReleaseType.ALPHA;
};

/**
 * Check if a branch name matches any of the allowed patterns.
 * Supports exact matches, glob patterns (using minimatch), and regex patterns.
 *
 * @param branchName - The current branch name
 * @param allowPatterns - Array of patterns (exact strings, glob patterns, or regex strings starting with '/')
 * @returns true if the branch matches any pattern, false otherwise
 */
const isBranchAllowed = (
  branchName: string,
  allowPatterns: string[],
): boolean =>
  allowPatterns.some(pattern => {
    // Check if it's a regex pattern (enclosed in forward slashes)
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      const regexPattern = pattern.slice(1, -1);
      try {
        // eslint-disable-next-line security/detect-non-literal-regexp -- User-provided patterns are validated
        const regex = new RegExp(regexPattern);
        return regex.test(branchName);
      } catch {
        // Invalid regex, fall back to exact match
        return pattern === branchName;
      }
    }

    // Use minimatch for glob patterns and exact matches
    return minimatch(branchName, pattern);
  });

export const checkReleasePlan = (
  releaseManifests: ReleaseManifest[],
  branchName: string,
  allowBranches: string[] = ['main', 'feat/auto-publish'],
) => {
  const releasePlan = calReleasePlan(releaseManifests);
  if (
    releasePlan === ReleaseType.LATEST &&
    !isBranchAllowed(branchName, allowBranches)
  ) {
    throw new Error(
      `For LATEST release, should be on one of these branches: ${allowBranches.join(', ')}. Current Branch: ${branchName}`,
    );
  }
  return true;
};
