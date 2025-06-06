import * as core from '@actions/core'
import { run } from './main.js'

const runAsync = async (): Promise<void> => {
  try {
    await run()
  } catch (error) {
    core.setFailed(`Error - ${(error as Error).message}`)
  }
}
runAsync()
