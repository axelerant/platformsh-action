import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core'
import * as github from '../__fixtures__/github'
import * as utils from '../__fixtures__/utils'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)
jest.unstable_mockModule('../src/utils', () => utils)

import Client, { Environment } from 'platformsh-client'

const getTestEnvironment = (
  status: string,
  name: string,
  type = 'development'
) =>
  ({
    name,
    type,
    status,
    deactivate: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
    delete: jest.fn(() => Promise.resolve({}))
  }) as unknown as Environment

const getEnvironmentMock = jest
  .spyOn(Client.prototype, 'getEnvironment')
  .mockImplementation(() =>
    Promise.resolve(getTestEnvironment('active', '123/merge', 'development'))
  )

const mockClient = {
  getEnvironment: getEnvironmentMock
} as unknown as Client

utils.getCliClient.mockImplementation(() => Promise.resolve(mockClient))

const mockEnvironmentResult = jest.fn(
  (status: string, type = 'development') =>
    ({
      name: '123/merge',
      type,
      status,
      deactivate: jest.fn(() => Promise.resolve({ wait: jest.fn() })),
      delete: jest.fn(() => Promise.resolve({}))
    }) as unknown as Environment
)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { cleanPrEnv } = await import('../src/clean-pr-env')

describe('cleanPrEnv', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    core.getInput.mockImplementation(name => {
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
    getEnvironmentMock.mockResolvedValue(mockEnvResult)
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(getEnvironmentMock).toHaveBeenCalledWith('project-id', '123%2Fmerge')
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
    getEnvironmentMock.mockResolvedValue(mockEnvResult)
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(getEnvironmentMock).toHaveBeenCalledWith('project-id', '123%2Fmerge')
    expect(mockEnvResult.deactivate).not.toHaveBeenCalled()
    expect(mockEnvResult.delete).toHaveBeenCalled()
    expect(core.info).toHaveBeenCalledWith(
      `123/merge environment deleted successfully.`
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('should warn and not delete non-development environment', async () => {
    const mockEnvResult = mockEnvironmentResult('active', 'production')
    getEnvironmentMock.mockResolvedValue(mockEnvResult)
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(getEnvironmentMock).toHaveBeenCalledWith('project-id', '123%2Fmerge')
    expect(mockEnvResult.deactivate).not.toHaveBeenCalled()
    expect(mockEnvResult.delete).not.toHaveBeenCalled()
    expect(core.warning).toHaveBeenCalledWith(
      `Not deleting 123/merge environment as it's not a development environment`
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('should handle unexpected environment status', async () => {
    const mockEnvResult = mockEnvironmentResult('deleting')
    getEnvironmentMock.mockResolvedValue(mockEnvResult)
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(getEnvironmentMock).toHaveBeenCalledWith('project-id', '123%2Fmerge')
    expect(mockEnvResult.deactivate).not.toHaveBeenCalled()
    expect(mockEnvResult.delete).not.toHaveBeenCalled()
    expect(core.warning).toHaveBeenCalledWith(
      `Unable to delete 123/merge environment as it's already in deleting mode`
    )
    expect(core.endGroup).toHaveBeenCalled()
  })

  it('should handle error during getEnvironment call', async () => {
    const errorMessage = 'Failed to get environment details'
    getEnvironmentMock.mockRejectedValue(new Error(errorMessage))
    github.context.payload.pull_request = { number: 123 }

    await cleanPrEnv()

    expect(getEnvironmentMock).toHaveBeenCalledWith('project-id', '123%2Fmerge')
    expect(core.warning).toHaveBeenCalledWith(errorMessage)
    expect(core.endGroup).toHaveBeenCalled()
  })
})
