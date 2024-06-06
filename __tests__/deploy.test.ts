import { deploy } from '../src/deploy'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import appRootPath from 'app-root-path'

jest.mock('@actions/core')
jest.mock('@actions/exec')

// Mock the GitHub Actions core library
let getInputMock: jest.SpiedFunction<typeof core.getInput>

describe('deploy', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
  })

  it('should successfully deploy to Platform.sh', async () => {
    // Mock inputs
    getInputMock.mockImplementation(name => {
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
        default:
          return ''
      }
    })

    await deploy()

    const scriptPath = `${appRootPath}/scripts/deploy.sh`
    expect(exec.exec).toHaveBeenCalledWith(scriptPath, [], {
      env: {
        ...process.env,
        SSH_PRIVATE_KEY: 'ssh-private-key',
        PLATFORM_PROJECT_ID: 'project-id',
        PLATFORMSH_CLI_TOKEN: 'cli-token',
        FORCE_PUSH: 'false',
        ENVIRONMENT_NAME: 'environment-name',
        KNOWN_HOSTS_PATH: `${appRootPath}/known_hosts`
      }
    })
  })
})
