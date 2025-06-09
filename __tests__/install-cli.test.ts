import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core'
import * as exec from '../__fixtures__/exec'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/exec', () => exec)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { installCli } = await import('../src/install-cli')

const { getAppRootPath } = await import('../src/utils')

describe('installCli', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should install the latest CLI version by default', async () => {
    core.getInput.mockImplementation(name => {
      switch (name) {
        case 'cli-version':
          return 'latest'
        default:
          return ''
      }
    })
    await installCli()

    expect(exec.exec).toHaveBeenCalledWith(
      `${getAppRootPath()}/scripts/install-cli.sh`,
      [],
      {}
    )
  })

  it('should install a specific CLI version', async () => {
    core.getInput.mockImplementation(name => {
      switch (name) {
        case 'cli-version':
          return '1.2.3'
        default:
          return ''
      }
    })
    await installCli()

    expect(exec.exec).toHaveBeenCalledWith(
      `${getAppRootPath()}/scripts/install-cli.sh`,
      [],
      expect.objectContaining({ env: { ...process.env, VERSION: '1.2.3' } })
    )
  })
})
