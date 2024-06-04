import * as core from '@actions/core'
import { exec, ExecOptions } from '@actions/exec'

export async function installCli(): Promise<void> {
  core.startGroup('Install Platform.sh cli')
  const cliVersion = core.getInput('cli-version')

  const options: ExecOptions = {}
  if (cliVersion !== 'latest') {
    options.env = { ...process.env, VERSION: cliVersion }
  }
  await exec(`${__dirname}/../scripts/install-cli.sh`, [], options)

  // Check platform  version
  await exec('platform --version')

  core.endGroup()
}
