import { jest } from '@jest/globals'

export const deploy = jest.fn<typeof import('../src/deploy').deploy>()
