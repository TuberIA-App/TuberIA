import { defineConfig } from 'vitest/config';

/**
 * Files that live under src/testing/unit/ but are not unit tests: they reach
 * the public internet (YouTube's transcript endpoint) and fail whenever that
 * host rate-limits the runner's IP or the optional YOUTUBE_PROXY_URL is unset.
 * They are grouped with the integration suites so a third-party outage can
 * never turn the required CI gate red.
 */
const NETWORK_BOUND_TESTS = [
  'src/testing/unit/services/youtube.videoTranscription.test.js',
];

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/testing/setup.js'],
    testTimeout: 20000,

    // Force NODE_ENV=test regardless of how the process was launched.
    // Vitest only defaults NODE_ENV to 'test' when it is UNSET, and the dev
    // container sets NODE_ENV=development - so without this the app's rate
    // limiters stayed active and the auth suites exhausted their 10-request
    // budget, turning every later assertion into an unexplained 429.
    // dotenv (in setup.js) does not overwrite already-set variables, so this
    // survives loading backend/.env.
    env: {
      NODE_ENV: 'test',
    },

    // These suites share ONE MongoDB and ONE Redis, so test files must never
    // run concurrently - parallel files would race on the same collections.
    //
    // `fileParallelism: false` is the supported way to express that in Vitest 4
    // (it forces maxWorkers to 1). The previous config used
    // `poolOptions.forks.singleFork`, which Vitest 4 no longer honours - the
    // suites only stayed sequential because every npm script happened to pass
    // `--no-file-parallelism` on the command line. Declaring it here makes the
    // config authoritative, so a bare `vitest run` is safe too.
    pool: 'forks',
    fileParallelism: false,

    // NOTE: `include` is deliberately declared per-project and NOT at this
    // level. A root-level `include` is inherited by every project that sets
    // `extends: true`, which made each project run the entire suite - the
    // whole thing executed twice.
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/testing/unit/**/*.test.js'],
          exclude: NETWORK_BOUND_TESTS,
        },
      },
      {
        extends: true,
        test: {
          name: 'integration',
          include: [
            'src/testing/integration/**/*.test.js',
            'src/testing/e2e/**/*.test.js',
            ...NETWORK_BOUND_TESTS,
          ],
        },
      },
    ],
  },
});
