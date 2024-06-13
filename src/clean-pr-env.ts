import * as core from '@actions/core'
import { getCliClient } from './utils'
import * as github from '@actions/github'

export async function cleanPrEnv(): Promise<void> {
  core.startGroup('Cleanr PR env from Platform.sh')

  const prNumber = github.context.payload.pull_request?.number
  if (!prNumber) {
    core.warning(
      `Unable to identify PR No. Please make sure this action runs only on PR close`
    )
    core.endGroup()
    return
  }

  const client = await getCliClient(core.getInput('cli-token'))

  // Get env details
  const prRef = `${prNumber}/merge`
  const envResult = await client.getEnvironment(
    core.getInput('project-id'),
    encodeURIComponent(prRef)
  )

  core.info(`Environment type is ${envResult.type}`)
  core.info(`Environment name is ${envResult.name}`)

  if (envResult.type !== 'development') {
    core.info(
      `Skipping ${prRef} environment deletion as it's not a development environment`
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
  core.info(`${prRef} environment deleted successfully`)
  core.endGroup()
}
