import Client from 'platformsh-client'
import * as core from '@actions/core'

import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const getAccessToken = async (cliToken: string): Promise<string> => {
  const basicAuth = Buffer.from('platform-cli:', 'latin1').toString('base64')
  const credentials = { grant_type: 'api_token', api_token: cliToken }
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

    const data = (await response.json()) as { access_token?: string }

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

export const getCliClient = async (cliToken: string): Promise<Client> => {
  const accessToken = await getAccessToken(cliToken)
  return new Client({
    access_token: accessToken,
    api_url: 'https://api.platform.sh/api',
    authorization: ''
  })
}

export const getEnvironmentName = (): string => {
  let envName = core.getInput('environment-name')
  if (!envName) {
    const { GITHUB_REF_NAME } = process.env
    if (GITHUB_REF_NAME) {
      envName = GITHUB_REF_NAME
    }
  }
  return envName
}

export const getAppRootPath = (): string => {
  return resolve(__dirname, '../..')
}
