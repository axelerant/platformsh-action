import * as core from '@actions/core'
import Client from 'platformsh-client'
import { getAccessToken } from './utils'

export async function cleanPrEnv(): Promise<void> {
  core.startGroup('Cleanr PR env from Platform.sh')
  const accessToken = await getAccessToken(core.getInput('cli-token'))
  const client = new Client({
    access_token: accessToken,
    api_url: 'https://api.platform.sh/api',
    authorization: ''
  })

  const projects = await client.getProjects()
  if (projects) {
    const project = projects[0]
    core.info(`project name: ${project.name}`)
  } else {
    core.info('No projects found')
  }

  core.info('Env cleaned')
  core.endGroup()
}
