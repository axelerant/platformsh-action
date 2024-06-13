import * as core from '@actions/core'
import { getAccessToken } from './utils'
import Client from 'platformsh-client'

export async function deployOutput(): Promise<void> {
  core.startGroup('Output deployed URL')

  let envName = core.getInput('environment-name')
  if (!envName) {
    const { GITHUB_REF_NAME } = process.env
    if (GITHUB_REF_NAME) {
      envName = GITHUB_REF_NAME
    }
  }

  const accessToken = await getAccessToken(core.getInput('cli-token'))
  const client = new Client({
    access_token: accessToken,
    api_url: 'https://api.platform.sh/api',
    authorization: ''
  })

  // Get env details
  const envResult = await client.getEnvironment(
    core.getInput('project-id'),
    encodeURIComponent(envName)
  )

  const urls: string[] = envResult.getRouteUrls()
  let url = urls.find(item => item.startsWith('https'))
  if (!url) {
    url = urls[0]
  }
  core.setOutput('deployed-url', url)
  core.endGroup()
}
