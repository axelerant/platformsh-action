import * as core from '@actions/core'
import Client from 'platformsh-client'

export async function cleanPrEnv(): Promise<void> {
  core.startGroup('Cleanr PR env from Platform.sh')
  const client = new Client({
    api_token: core.getInput('cli-token'),
    api_url: '',
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
