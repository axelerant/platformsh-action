import * as core from '@actions/core'
import * as github from '@actions/github'
import { cleanPrEnv } from './../src/clean-pr-env'

const mockClient = {
  getEnvironment: jest.fn()
}

const mockEnvironmentResult = jest
  .fn()
  .mockImplementation((status: string, type = 'development') => ({
    name: '123/merge',
    type,
    status,
    deactivate: jest.fn().mockResolvedValue({ wait: jest.fn() }),
    delete: jest.fn().mockResolvedValue({})
  }))

jest.mock('@actions/core')
jest.mock('../src/utils', () => ({
  getCliClient: jest.fn().mockImplementation(() => mockClient)
}))
jest.mock('@actions/github')

describe('cleanPrEnv', () => {
  let getInputMock: jest.SpiedFunction<typeof core.getInput>

  beforeEach(() => {
    jest.clearAllMocks()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'project-id':
          return 'project-id'
        case 'cli-token':
          return 'cli-token'
        default:
          return ''
      }
    })
  })

  it('should not clean the PR environment if the PR number is not available', async () => {
    github.context.payload.pull_request = undefined
    await cleanPrEnv()

    expect(core.startGroup).toHaveBeenCalledWith(
      'Remove PR env from Platform.sh'
    )
    expect(core.warning).toHaveBeenCalledWith(
      `Unable to identify the PR. Please run this action only on pull_request closed event.`
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('should deactivate and delete an active environment', async () => {
    const mockEnvResult = mockEnvironmentResult('active')
    mockClient.getEnvironment.mockResolvedValue(mockEnvResult)
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(mockClient.getEnvironment).toHaveBeenCalledWith(
      'project-id',
      '123%2Fmerge'
    )
    expect(mockEnvResult.deactivate).toHaveBeenCalled()
    expect(core.info).toHaveBeenCalledWith(
      `Deactivating 123/merge environment...`
    )
    expect(mockEnvResult.delete).toHaveBeenCalled()
    expect(core.info).toHaveBeenCalledWith(
      `123/merge environment deleted successfully.`
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('should delete an inactive environment', async () => {
    const mockEnvResult = mockEnvironmentResult('inactive')
    mockClient.getEnvironment.mockResolvedValue(mockEnvResult)
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(mockClient.getEnvironment).toHaveBeenCalledWith(
      'project-id',
      '123%2Fmerge'
    )
    expect(mockEnvResult.deactivate).not.toHaveBeenCalled()
    expect(mockEnvResult.delete).toHaveBeenCalled()
    expect(core.info).toHaveBeenCalledWith(
      `123/merge environment deleted successfully.`
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('should warn and not delete non-development environment', async () => {
    const mockEnvResult = mockEnvironmentResult('active', 'production')
    mockClient.getEnvironment.mockResolvedValue(mockEnvResult)
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(mockClient.getEnvironment).toHaveBeenCalledWith(
      'project-id',
      '123%2Fmerge'
    )
    expect(mockEnvResult.deactivate).not.toHaveBeenCalled()
    expect(mockEnvResult.delete).not.toHaveBeenCalled()
    expect(core.warning).toHaveBeenCalledWith(
      `Not deleting 123/merge environment as it's not a development environment`
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('should handle unexpected environment status', async () => {
    const mockEnvResult = mockEnvironmentResult('dirty')
    mockClient.getEnvironment.mockResolvedValue(mockEnvResult)
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(mockClient.getEnvironment).toHaveBeenCalledWith(
      'project-id',
      '123%2Fmerge'
    )
    expect(mockEnvResult.deactivate).not.toHaveBeenCalled()
    expect(mockEnvResult.delete).not.toHaveBeenCalled()
    expect(core.warning).toHaveBeenCalledWith(
      `Unable to delete 123/merge environment as it's already in dirty mode`
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('should handle error during getEnvironment call', async () => {
    const errorMessage = 'Failed to get environment details'
    mockClient.getEnvironment.mockRejectedValue(new Error(errorMessage))
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(mockClient.getEnvironment).toHaveBeenCalledWith(
      'project-id',
      '123%2Fmerge'
    )
    expect(core.warning).toHaveBeenCalledWith(errorMessage)
    expect(core.endGroup).toHaveBeenCalled()
  })
})
