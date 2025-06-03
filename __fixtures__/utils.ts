import { jest } from '@jest/globals'

export const getAccessToken =
  jest.fn<typeof import('../src/utils').getAccessToken>()
export const getCliClient =
  jest.fn<typeof import('../src/utils').getCliClient>()
export const getEnvironmentName =
  jest.fn<typeof import('../src/utils').getEnvironmentName>()
