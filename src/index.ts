import * as core from '@actions/core'
import { run } from './main'

const runAsync = async (): Promise<void> => {
  try {
    await run()
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    } else {
      core.setFailed('Something went wrong.')
    }
  }
}
runAsync()
