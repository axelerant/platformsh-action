import {
  getAccessToken,
  getCliClient,
  getEnvironmentName
} from './../src/utils'
import * as utils from './../src/utils'
import Client from 'platformsh-client'
import * as core from '@actions/core'

describe('utils', () => {
  describe('getAccessToken', () => {
    it('should return an access token', async () => {
      // Mock fetch to return a successful response
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ access_token: 'my-access-token' })
      }
      global.fetch = jest.fn().mockResolvedValue(mockResponse)
      const basicAuth = Buffer.from('platform-cli:', 'latin1').toString(
        'base64'
      )

      const accessToken = await getAccessToken('test-cli-token')
      expect(accessToken).toBe('my-access-token')
      expect(fetch).toHaveBeenCalledWith(
        'https://accounts.platform.sh/oauth2/token',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grant_type: 'api_token',
            api_token: 'test-cli-token'
          })
        }
      )
    })

    it('should throw an error if the response is not ok', async () => {
      // Mock fetch to return an unsuccessful response
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401
      } as Response)

      await expect(getAccessToken('test-cli-token')).rejects.toThrow(
        'Unable to authenticate: 401'
      )
    })

    it('should throw an error if the response does not contain an access token', async () => {
      // Mock fetch to return a response without an access token
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({})
      } as unknown as Response)

      await expect(getAccessToken('test-cli-token')).rejects.toThrow(
        'No access token found in the response'
      )
    })

    it('should throw an error if there is an error during the fetch', async () => {
      // Mock fetch to throw an error
      jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'))

      await expect(getAccessToken('test-cli-token')).rejects.toThrow(
        'Unable to authenticate: Network error'
      )
    })

    it('should throw an error if something goes wrong', async () => {
      // Mock fetch to throw an error
      jest.spyOn(global, 'fetch').mockRejectedValue('Something went wrong')

      await expect(getAccessToken('test-cli-token')).rejects.toThrow(
        'Unable to authenticate: Something went wrong'
      )
    })
  })

  describe('getCliClient', () => {
    it('should return a Client instance', async () => {
      // Mock getAccessToken to return a test access token
      const mockGetAccessToken = jest
        .spyOn(utils, 'getAccessToken')
        .mockResolvedValue('test-access-token')

      const client = await getCliClient('test-cli-token')
      expect(client).toBeInstanceOf(Client)
      expect(client.getConfig()).toEqual(
        expect.objectContaining({
          access_token: 'test-access-token',
          api_url: 'https://api.platform.sh/api'
        })
      )
      expect(mockGetAccessToken).toHaveBeenCalledWith('test-cli-token')
    })
  })

  describe('getEnvironmentName', () => {
    it('should return the environment name from the input', () => {
      const mockGetInput = jest
        .spyOn(core, 'getInput')
        .mockReturnValue('test-environment-name')

      const envName = getEnvironmentName()
      expect(envName).toBe('test-environment-name')
      expect(mockGetInput).toHaveBeenCalledWith('environment-name')
    })

    it('should return the GITHUB_REF_NAME if no environment name is provided', () => {
      const mockGetInput = jest.spyOn(core, 'getInput').mockReturnValue('')
      process.env.GITHUB_REF_NAME = 'test-environment-name'

      const envName = getEnvironmentName()
      expect(envName).toBe('test-environment-name')
      expect(mockGetInput).toHaveBeenCalledWith('environment-name')
    })

    it('should return blank if no environment name is provided and GITHUB_REF_NAME is not set', () => {
      const mockGetInput = jest.spyOn(core, 'getInput').mockReturnValue('')
      delete process.env.GITHUB_REF_NAME

      const envName = getEnvironmentName()
      expect(envName).toBe('')
      expect(mockGetInput).toHaveBeenCalledWith('environment-name')
    })
  })
})
