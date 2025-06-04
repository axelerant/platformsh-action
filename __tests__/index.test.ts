/**
 * Unit tests for the action's entrypoint, src/index.ts
 */
import { jest } from '@jest/globals'
import { run } from '../__fixtures__/main'

jest.unstable_mockModule('../src/main', () => ({ run }))

// Mock the action's entrypoint
run.mockImplementation(() => Promise.resolve())

describe('index', () => {
  it('calls run when imported', async () => {
    await import('../src/index')

    expect(run).toHaveBeenCalled()
  })
})
