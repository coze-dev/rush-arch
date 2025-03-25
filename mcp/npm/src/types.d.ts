import { type z } from 'zod';

export interface McpTool {
  name: string;
  description: string;
  schema: z.ZodObject<any>;
  execute: (
    args: z.infer<McpTool['schema']>,
  ) => Promise<{ content: Array<{ type: 'text'; text: string }> }>;
}

interface Person {
  name: string;
  email: string;
  url?: string;
}

interface License {
  type?: string;
  url?: string;
}

interface Repository {
  type: string;
  url: string;
}

interface Distribution {
  shasum: string;
  tarball: string;
  integrity: string;
  signatures: Array<{
    sig: string;
    keyid: string;
  }>;
}

interface PackageVersion {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  author?: Person;
  contributors?: Person[];
  maintainers?: Person[];
  homepage?: string;
  bugs?: {
    url: string;
  };
  license?: string;
  licenses?: License[];
  repository?: Repository;
  main?: string;
  bin?: Record<string, string>;
  jam?: {
    main: string;
  };
  volo?: {
    type: string;
    ignore: string[];
  };
  engines?: string[] | Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  directories?: Record<string, string>;
  scripts?: Record<string, string>;
  dist: Distribution;
}

export interface NpmInfo {
  _id: string;
  _rev: string;
  name: string;
  'dist-tags': {
    latest: string;
    [key: string]: string;
  };
  versions: Record<string, PackageVersion>;
  time: Record<string, string>;
  bugs: {
    url: string;
  };
  author: Person;
  license: string;
  homepage: string;
  keywords: string[];
  repository: Repository;
  description: string;
  contributors: Person[];
}
