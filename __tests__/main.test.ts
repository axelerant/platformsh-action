import * as core from '@actions/core'
import { run } from '../src/main'
import { deploy } from '../src/deploy'
import { installCli } from '../src/install-cli'
import { cleanPrEnv } from '../src/clean-pr-env'

jest.mock('@actions/core')
jest.mock('../src/deploy')
jest.mock('../src/install-cli')
jest.mock('../src/clean-pr-env')

let getInputMock: jest.SpiedFunction<typeof core.getInput>

describe('main', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
  })

  it('should call the deploy function when the action is deploy', async () => {
    getInputMock.mockImplementation(name => {
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
    getInputMock.mockImplementation(name => {
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
    getInputMock.mockImplementation(name => {
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
