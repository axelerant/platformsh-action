import * as core from '@actions/core'
import { run } from './main'

// eslint-disable-next-line @typescript-eslint/no-floating-promises

  run().catch(error => {
    core.setFailed(error.message)
  })
