import * as core from '@actions/core'
import { deploy } from './deploy'
import { installCli } from './install-cli'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const action = core.getInput('action')
  if (!['deploy', 'clean'].includes(action)) {
    throw new Error('Invalid action to perform')
  }

  // Install CLI
  installCli()

  // Deploy to platform.sh
  if (action === 'deploy') {
    deploy()
  }

  core.info('Inside custom action')
}
