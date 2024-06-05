import * as core from '@actions/core'
import Client from 'platformsh-client'
import { getAccessToken } from './utils'
import * as github from '@actions/github'

export async function cleanPrEnv(): Promise<void> {
  core.startGroup('Cleanr PR env from Platform.sh')

  core.info(`PR No: ${github.context.payload.pull_request?.number}`)

  const accessToken = await getAccessToken(core.getInput('cli-token'))
  const client = new Client({
    access_token: accessToken,
    api_url: 'https://api.platform.sh/api',
    authorization: ''
  })

  // Get env details
  const prRef = '494/merge'
  const envResult = await client.getEnvironment(
    core.getInput('project-id'),
    encodeURIComponent(prRef)
  )
  if (envResult) {
    core.info(`Enviroment type is ${envResult.type}`)
    core.info(`Enviroment name is ${envResult.name}`)
  } else {
    core.info(`No env running for PR - ${prRef}`)
  }

  core.info('Env cleaned')
  core.endGroup()
}
