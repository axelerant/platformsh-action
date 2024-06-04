import * as core from '@actions/core'
import { deploy } from './deploy'
import { installCli } from './install-cli'
import { cleanPrEnv } from './clean-pr-env'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const action = core.getInput('action')
  if (!['deploy', 'clean-pr-env'].includes(action)) {
    throw new Error('Invalid action to perform')
  }

  // Install CLI
  await installCli()

  // Deploy to platform.sh
  if (action === 'deploy') {
    await deploy()
    return
  }

  // Clean the env
  if (action === 'clean-pr-env') {
    await cleanPrEnv()
  }
}
