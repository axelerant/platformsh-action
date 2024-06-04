import * as core from '@actions/core'
export async function cleanPrEnv(): Promise<void> {
  core.startGroup('Cleanr PR env from Platform.sh')
  core.info('Env cleaned')
  core.endGroup()
}
