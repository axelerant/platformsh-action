import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { installCli } from '../src/install-cli'
import appRootPath from 'app-root-path'

jest.mock('@actions/core')
jest.mock('@actions/exec')

// Mock the GitHub Actions core library
let getInputMock: jest.SpiedFunction<typeof core.getInput>

describe('installCli', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
  })

  it('should install the latest CLI version by default', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'cli-version':
          return 'latest'
        default:
          return ''
      }
    })
    await installCli()

    expect(exec.exec).toHaveBeenCalledWith(
      `${appRootPath}/scripts/install-cli.sh`,
      [],
      {}
    )
  })

  it('should install a specific CLI version', async () => {
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'cli-version':
          return '1.2.3'
        default:
          return ''
      }
    })
    await installCli()

    expect(exec.exec).toHaveBeenCalledWith(
      `${appRootPath}/scripts/install-cli.sh`,
      [],
      expect.objectContaining({ env: { ...process.env, VERSION: '1.2.3' } })
    )
  })
})
