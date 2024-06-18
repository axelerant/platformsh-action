import * as core from '@actions/core'
import { getCliClient } from './utils'
import * as github from '@actions/github'

export async function cleanPrEnv(): Promise<void> {
  core.startGroup('Remove PR env from Platform.sh')

  const prNumber = github.context.payload.pull_request?.number
  if (!prNumber) {
    core.warning(
      `Unable to identify the PR. Please run this action only on pull_request closed event.`
    )
    core.endGroup()
    return
  }

  const client = await getCliClient(core.getInput('cli-token'))

  // Get env details
  const prRef = `${prNumber}/merge`
  let envResult
  try {
    envResult = await client.getEnvironment(
      core.getInput('project-id'),
      encodeURIComponent(prRef)
    )
  } catch (error) {
    if (error instanceof Error) {
      core.warning(error.message)
    }
  }

  if (!envResult) {
    core.warning(`No active environment found for the given PR ${prRef}`)
    core.endGroup()
    return
  }
  core.info(`Environment '${envResult.name}' is of type '${envResult.type}'.`)

  if (envResult.type !== 'development') {
    core.warning(
      `Not deleting ${prRef} environment as it's not a development environment`
    )
    core.endGroup()
    return
  }

  // Deactivate env first.
  const activity = await envResult.deactivate()
  core.info(`Deactivating ${prRef} environment...`)
  // @todo display activity log
  await activity.wait()
  core.info(`${prRef} environment deactivated successfully.`)

  // Fetch again for deletion as active env can not be deleted and current resource points to active env.
  const envResultDelete = await client.getEnvironment(
    core.getInput('project-id'),
    encodeURIComponent(prRef)
  )
  await envResultDelete.delete()
  core.info(`${prRef} environment deleted successfully.`)
  core.endGroup()
}
