import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core'
import * as utils from '../__fixtures__/utils'
import Client from 'platformsh-client'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/utils', () => utils)

const mockEnvResult = {
  getRouteUrls: jest.fn()
}

const mockClient = {
  getEnvironment: jest.fn().mockImplementation(() => mockEnvResult)
} as unknown as Client

utils.getEnvironmentName.mockReturnValue('environment-name')
utils.getCliClient.mockImplementation(() => Promise.resolve(mockClient))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { outputEnvironmentUrl } = await import('../src/deploy-output')

describe('deploy', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock inputs
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

  it('should output deployed url', async () => {
    mockEnvResult.getRouteUrls.mockReturnValue([
      'http://example.com',
      'https://example.com'
    ])

    await outputEnvironmentUrl()

    expect(core.setOutput).toHaveBeenCalledWith(
      'deployed-url',
      'https://example.com'
    )
  })

  it('should output http url if https not present', async () => {
    mockEnvResult.getRouteUrls.mockReturnValue(['http://example.com'])

    await outputEnvironmentUrl()

    expect(core.setOutput).toHaveBeenCalledWith(
      'deployed-url',
      'http://example.com'
    )
  })
})
