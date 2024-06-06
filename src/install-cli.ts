import * as core from '@actions/core'
import { exec, ExecOptions } from '@actions/exec'
import appRootPath from 'app-root-path'

export async function installCli(): Promise<void> {
  core.startGroup('Install Platform.sh cli')
  const cliVersion = core.getInput('cli-version')

  const options: ExecOptions = {}
  if (cliVersion !== 'latest') {
    options.env = { ...process.env, VERSION: cliVersion }
  }
  await exec(`${appRootPath}/scripts/install-cli.sh`, [], options)

  core.endGroup()
}
