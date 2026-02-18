import * as core from '@actions/core'
import { exec, type ExecOptions } from '@actions/exec'
import { getAppRootPath } from './utils.js'

export async function installCli(): Promise<void> {
  core.startGroup('Install Platform.sh cli')
  const cliVersion = core.getInput('cli-version')

  const options: ExecOptions = {}
  if (cliVersion !== 'latest') {
    options.env = { ...process.env, VERSION: cliVersion }
  }
  await exec(`${getAppRootPath()}/scripts/install-cli.sh`, [], options)

  core.endGroup()
}
