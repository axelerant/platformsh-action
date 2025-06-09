import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core'
import * as exec from '../__fixtures__/exec'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/exec', () => exec)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { deploy } = await import('../src/deploy')

const { getAppRootPath } = await import('../src/utils')

describe('deploy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should successfully deploy to Platform.sh', async () => {
    // Mock inputs
    core.getInput.mockImplementation(name => {
      switch (name) {
        case 'ssh-private-key':
          return 'ssh-private-key'
        case 'project-id':
          return 'project-id'
        case 'cli-token':
          return 'cli-token'
        case 'force-push':
          return 'false'
        case 'environment-name':
          return 'environment-name'
        case 'parent-environment-name':
          return 'parent-environment-name'
        default:
          return ''
      }
    })

    await deploy()

    const scriptPath = `${getAppRootPath()}/scripts/deploy.sh`
    expect(exec.exec).toHaveBeenCalledWith(scriptPath, [], {
      env: {
        ...process.env,
        SSH_PRIVATE_KEY: 'ssh-private-key',
        PLATFORM_PROJECT_ID: 'project-id',
        PLATFORMSH_CLI_TOKEN: 'cli-token',
        FORCE_PUSH: 'false',
        PARENT_ENVIRONMENT_NAME: 'parent-environment-name',
        ENVIRONMENT_NAME: 'environment-name',
        KNOWN_HOSTS_PATH: `${getAppRootPath()}/known_hosts`
      }
    })
  })
})
