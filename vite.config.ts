/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig, loadEnv } from 'vite';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export default ({ mode }: any) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return defineConfig({
    test: {
      globals: true,
      coverage: {
        thresholds: {
          lines: 70,
          branches: 70,
          functions: 70,
          statements: 70,
        },
        exclude: ['.dev_tools'],
      },
      exclude: ['**/node_modules', '.dev_tools'],
    },
  });
};
