import { getAccessToken } from '../src/utils'

describe('getAccessToken', () => {
  it('should return an access token when the request is successful', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ access_token: 'my-access-token' })
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    const accessToken = await getAccessToken('my-cli-token')
    const basicAuth = Buffer.from('platform-cli:', 'latin1').toString('base64')

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
          api_token: 'my-cli-token'
        })
      }
    )
  })

  it('should throw an error if the request fails', async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: 'Unauthorized'
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    await expect(getAccessToken('my-cli-token')).rejects.toThrow(
      'Unable to authenticate: 401'
    )
  })

  it('should throw an error if the response does not contain an access token', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({})
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    await expect(getAccessToken('my-cli-token')).rejects.toThrow(
      'No access token found in the response'
    )
  })

  it('should throw an error if the fetch call throws an error', async () => {
    const error = new Error('Network error')
    global.fetch = jest.fn().mockRejectedValue(error)

    await expect(getAccessToken('my-cli-token')).rejects.toThrow(
      'Unable to authenticate: Network error'
    )
  })
})
