import { jest } from '@jest/globals'

export const installCli =
  jest.fn<typeof import('../src/install-cli').installCli>()
