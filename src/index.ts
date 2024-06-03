import * as core from '@actions/core'
import { run } from './main'

// eslint-disable-next-line @typescript-eslint/no-floating-promises
try {
  run()
} catch (error) {
  // Fail the workflow run if an error occurs
  if (error instanceof Error) core.setFailed(error.message)
}
