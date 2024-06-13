import * as core from '@actions/core'
import { outputEnvironmentUrl } from './../src/deploy-output'

const mockEnvResult = {
  getRouteUrls: jest.fn()
}

const mockClient = {
  getEnvironment: jest.fn().mockImplementation(() => mockEnvResult)
}

jest.mock('@actions/core')
jest.mock('@actions/exec')
jest.mock('../src/utils', () => ({
  getEnvironmentName: jest.fn().mockReturnValue('environment-name'),
  getCliClient: jest.fn().mockImplementation(() => mockClient)
}))

describe('deploy', () => {
  let getInputMock: jest.SpiedFunction<typeof core.getInput>
  let outputMock: jest.SpiedFunction<typeof core.setOutput>

  beforeEach(() => {
    jest.clearAllMocks()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    outputMock = jest.spyOn(core, 'setOutput').mockImplementation()

    // Mock inputs
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

  it('should output deployed url', async () => {
    mockEnvResult.getRouteUrls.mockReturnValue([
      'http://example.com',
      'https://example.com'
    ])

    await outputEnvironmentUrl()

    expect(outputMock).toHaveBeenCalledWith(
      'deployed-url',
      'https://example.com'
    )
  })

  it('should output http url if https not present', async () => {
    mockEnvResult.getRouteUrls.mockReturnValue(['http://example.com'])

    await outputEnvironmentUrl()

    expect(outputMock).toHaveBeenCalledWith(
      'deployed-url',
      'http://example.com'
    )
  })
})
