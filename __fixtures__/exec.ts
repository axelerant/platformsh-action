import type * as execpackage from '@actions/exec'
import { jest } from '@jest/globals'

export const exec = jest.fn<typeof execpackage.exec>()
