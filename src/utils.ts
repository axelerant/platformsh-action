export const getAccessToken = async (cliToken: string): Promise<string> => {
  const basicAuth = Buffer.from('platform-cli:', 'latin1').toString('base64')
  const credentials = {
    grant_type: 'api_token',
    api_token: cliToken
  }
  const headers = {
    Authorization: `Basic ${basicAuth}`,
    'Content-Type': 'application/json'
  }

  try {
    const response = await fetch(`https://accounts.platform.sh/oauth2/token`, {
      method: 'POST',
      headers,
      body: JSON.stringify(credentials)
    })

    if (!response.ok) {
      throw new Error(`Unable to authenticate: ${response.status}`)
    }

    const data = await response.json()

    // Assuming the response data contains an access_token field
    if (!data.access_token) {
      throw new Error('No access token found in the response')
    }

    return data.access_token
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Unable to authenticate: ${error.message}`)
    } else {
      throw new Error(`Unable to authenticate: ${String(error)}`)
    }
  }
}
