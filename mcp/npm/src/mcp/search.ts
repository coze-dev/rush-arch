import { z } from 'zod';
import axios from 'axios';

import { type McpTool } from '../types';

const schema = z.object({
  keyword: z.string().min(1),
  size: z.number().min(1).max(100).default(20),
  from: z.number().min(0).default(0),
  quality: z.number().min(0).max(1).default(0.65),
  popularity: z.number().min(0).max(1).default(0.98),
  maintenance: z.number().min(0).max(1).default(0.5),
  registry: z.string().url().default('https://registry.npmjs.org'),
});

const formatResults = (results: unknown) => JSON.stringify(results);

export const searchNpmPackages: McpTool = {
  name: 'searchNpmPackages',
  description:
    'Search for NPM packages with advanced filters. Use this tool when you need to find suitable NPM packages for a specific use case, compare package popularity and maintenance scores, or discover alternatives to existing packages. You can customize the search by adjusting quality, popularity, and maintenance thresholds, and specify a custom registry if needed.',
  schema,
  execute: async ({
    keyword,
    size,
    from,
    quality,
    popularity,
    maintenance,
    registry,
  }) => {
    try {
      const searchEndpoint = `${registry.replace(/\/$/, '')}/-/v1/search`;
      const response = await axios.get(searchEndpoint, {
        params: {
          text: keyword,
          size,
          from,
          quality,
          popularity,
          maintenance,
        },
      });

      const results = response.data.objects.map(obj => ({
        package: {
          name: obj.package.name,
          version: obj.package.version,
          description: obj.package.description,
          keywords: obj.package.keywords,
          author: obj.package.author,
          publisher: obj.package.publisher,
          date: obj.package.date,
        },
        score: obj.score,
        searchScore: obj.searchScore,
      }));

      const content = formatResults(results);
      return { content: [{ type: 'text', text: content }] };
    } catch (error) {
      const errorMessage = `# Error Searching NPM Packages\n\n${error instanceof Error ? error.message : 'Unknown error'}`;
      return { content: [{ type: 'text', text: errorMessage }] };
    }
  },
};
