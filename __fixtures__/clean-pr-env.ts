import { jest } from '@jest/globals'

export const cleanPrEnv =
  jest.fn<typeof import('../src/clean-pr-env').cleanPrEnv>()
