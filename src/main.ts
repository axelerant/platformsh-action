import * as core from '@actions/core'
import { exec, ExecOptions } from '@actions/exec'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const action = core.getInput('action')
  if (!['deploy', 'clean'].includes(action)) {
    throw new Error('Invalid action to perform')
  }

  core.startGroup('Install Platform.sh cli')
  const cliVersion = core.getInput('cli-version')

  const options: ExecOptions = {}
  if (cliVersion !== 'latest') {
    options.env = { ...process.env, VERSION: cliVersion }
  }
  await exec(`${__dirname}/install-cli.sh`, [], options)

  // Check platform  version
  await exec('platform --version')

  core.endGroup()
  core.info('Inside custom action')
}
