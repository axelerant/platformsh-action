import * as core from '@actions/core'
import { deploy } from './deploy.js'
import { installCli } from './install-cli.js'
import { cleanPrEnv } from './clean-pr-env.js'
import { outputEnvironmentUrl } from './deploy-output.js'
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const action = core.getInput('action')
  if (!['deploy', 'clean-pr-env'].includes(action)) {
    throw new Error('Invalid action to perform')
  }

  // Deploy to platform.sh
  if (action === 'deploy') {
    await installCli()
    const exitCode = await deploy()
    // fetch and set the output url
    if (exitCode === 0) {
      outputEnvironmentUrl()
    }
    return
  }

  // Clean the env
  if (action === 'clean-pr-env') {
    await cleanPrEnv()
  }
}
