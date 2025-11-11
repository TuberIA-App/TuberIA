import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/testing/**/*.test.js'],
    testTimeout: 20000,
  },
});
