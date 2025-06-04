// import type * as github from '@actions/github'
import type { Context } from '@actions/github/lib/context'
// import { jest } from '@jest/globals'

export const context = {
  repo: {
    owner: 'owner',
    repo: 'repo'
  },
  payload: {
    pull_request: {
      number: 123
    }
  }
} as unknown as Context
