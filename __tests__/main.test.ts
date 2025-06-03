/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { deploy } from '../__fixtures__/deploy.js'
import { installCli } from '../__fixtures__/install-cli.js'
import { cleanPrEnv } from '../__fixtures__/clean-pr-env.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/deploy', () => ({ deploy }))
jest.unstable_mockModule('../src/install-cli', () => ({ installCli }))
jest.unstable_mockModule('../src/clean-pr-env', () => ({ cleanPrEnv }))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call the deploy function when the action is deploy', async () => {
    core.getInput.mockImplementation(name => {
      switch (name) {
        case 'action':
          return 'deploy'
        default:
          return ''
      }
    })
    await run()

    expect(installCli).toHaveBeenCalled()
    expect(deploy).toHaveBeenCalled()
    expect(cleanPrEnv).not.toHaveBeenCalled()
  })

  it('should call the cleanPrEnv function when the action is clean-pr-env', async () => {
    core.getInput.mockImplementation(name => {
      switch (name) {
        case 'action':
          return 'clean-pr-env'
        default:
          return ''
      }
    })
    await run()

    expect(installCli).not.toHaveBeenCalled()
    expect(deploy).not.toHaveBeenCalled()
    expect(cleanPrEnv).toHaveBeenCalled()
  })

  it('should throw an error if the action is invalid', async () => {
    core.getInput.mockImplementation(name => {
      switch (name) {
        case 'action':
          return 'invalid-action'
        default:
          return ''
      }
    })
    await expect(run()).rejects.toThrow('Invalid action to perform')

    expect(installCli).not.toHaveBeenCalled()
    expect(deploy).not.toHaveBeenCalled()
    expect(cleanPrEnv).not.toHaveBeenCalled()
  })
})
