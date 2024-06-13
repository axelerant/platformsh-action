import * as core from '@actions/core'
import { getCliClient, getEnvironmentName } from './utils'

export async function outputEnvironmentUrl(): Promise<void> {
  core.startGroup('Output deployed URL')

  const client = await getCliClient(core.getInput('cli-token'))
  const envName = getEnvironmentName()

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
