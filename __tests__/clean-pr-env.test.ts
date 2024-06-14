import * as core from '@actions/core'
import Client from 'platformsh-client'
import { getAccessToken } from './../src/utils'
import * as github from '@actions/github'
import { cleanPrEnv } from './../src/clean-pr-env'

jest.mock('@actions/core')
jest.mock('platformsh-client')
jest.mock('../src/utils')
jest.mock('@actions/github')

describe('cleanPrEnv', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not clean the PR environment if the PR number is not available', async () => {
    github.context.payload.pull_request = undefined
    await cleanPrEnv()

    expect(core.startGroup).toHaveBeenCalledWith(
      'Remove PR env from Platform.sh'
    )
    expect(core.warning).toHaveBeenCalledWith(
      `Unable to identify the PR. Please run this action only on pull_request closed event.`
    )
    expect(getAccessToken).not.toHaveBeenCalled()
    expect(Client).not.toHaveBeenCalled()
    expect(core.endGroup).toHaveBeenCalled()
  })
})
