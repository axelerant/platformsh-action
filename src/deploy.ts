import * as core from '@actions/core'
import { exec } from '@actions/exec'
import appRootPath from 'app-root-path'
import { getEnvironmentName } from './utils'

export async function deploy(): Promise<number> {
  core.startGroup('Deploy to Platform.sh')

  const envName = getEnvironmentName()

  const env = {
    ...process.env,
    SSH_PRIVATE_KEY: core.getInput('ssh-private-key'),
    PLATFORM_PROJECT_ID: core.getInput('project-id'),
    PLATFORMSH_CLI_TOKEN: core.getInput('cli-token'),
    FORCE_PUSH: core.getInput('force-push'),
    PARENT_ENVIRONMENT_NAME: core.getInput('parent-environment-name'),
    ENVIRONMENT_NAME: envName,
    KNOWN_HOSTS_PATH: `${appRootPath}/known_hosts`
  }
  const exitCode = await exec(`${appRootPath}/scripts/deploy.sh`, [], { env })
  core.endGroup()
  return exitCode
}
