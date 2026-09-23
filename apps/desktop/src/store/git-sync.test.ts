import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  desktopGit: vi.fn(),
  refreshRepoStatus: vi.fn(async () => undefined),
  refreshReview: vi.fn(async () => undefined),
  sync: {
    fetch: vi.fn(async () => undefined),
    pull: vi.fn(async () => undefined),
    push: vi.fn(async () => undefined)
  }
}))

vi.mock('@/lib/desktop-git', () => ({ desktopGit: mocks.desktopGit }))
vi.mock('./coding-status', () => ({ refreshRepoStatus: mocks.refreshRepoStatus }))
vi.mock('./review', () => ({ refreshReview: mocks.refreshReview }))

import { currentGitSyncOwner, gitSyncScopeKey } from '@/lib/git-owner'
import { $connection } from '@/store/session'

import { $gitSyncBusyByCwd, _resetGitSyncForTests, runGitSync } from './git-sync'

beforeEach(() => {
  _resetGitSyncForTests()
  $connection.set(null)
  vi.clearAllMocks()
  mocks.desktopGit.mockReturnValue({ sync: mocks.sync })
  mocks.refreshRepoStatus.mockResolvedValue(undefined)
  mocks.refreshReview.mockResolvedValue(undefined)
  mocks.sync.fetch.mockResolvedValue(undefined)
  mocks.sync.pull.mockResolvedValue(undefined)
  mocks.sync.push.mockResolvedValue(undefined)
})

describe('runGitSync', () => {
  it('serializes operations for one owner + cwd and reconciles status afterwards', async () => {
    let releaseFetch: (() => void) | undefined
    mocks.sync.fetch.mockImplementation(
      () =>
        new Promise<undefined>(resolve => {
          releaseFetch = () => resolve(undefined)
        })
    )

    const owner = currentGitSyncOwner()
    const scope = gitSyncScopeKey(owner, '/repo')
    const first = runGitSync('fetch', '/repo', owner)
    await Promise.resolve()

    expect($gitSyncBusyByCwd.get()).toEqual({ [scope]: 'fetch' })
    await runGitSync('pull', '/repo', owner)

    expect(mocks.sync.pull).not.toHaveBeenCalled()
    releaseFetch?.()
    await first

    expect(mocks.refreshRepoStatus).toHaveBeenCalledWith('/repo')
    expect($gitSyncBusyByCwd.get()).toEqual({ [scope]: null })
  })

  it('allows the same cwd on two connection owners without sharing the lock', async () => {
    const ownerA = currentGitSyncOwner()
    let releaseFetch: (() => void) | undefined
    mocks.sync.fetch.mockImplementation(
      () =>
        new Promise<undefined>(resolve => {
          releaseFetch = () => resolve(undefined)
        })
    )

    const first = runGitSync('fetch', '/repo', ownerA)
    $connection.set({ mode: 'remote', connectionId: 'connection-b', profile: 'work' } as never)
    const ownerB = currentGitSyncOwner()

    await runGitSync('pull', '/repo', ownerB)
    expect(mocks.sync.pull).toHaveBeenCalledWith('/repo')

    releaseFetch?.()
    await first
    expect($gitSyncBusyByCwd.get()).toEqual({
      [gitSyncScopeKey(ownerA, '/repo')]: null,
      [gitSyncScopeKey(ownerB, '/repo')]: null
    })
  })

  it('refreshes the review after a pull so an open diff cannot stay stale', async () => {
    await runGitSync('pull', '/repo')

    expect(mocks.refreshRepoStatus).toHaveBeenCalledWith('/repo')
    expect(mocks.refreshReview).toHaveBeenCalledOnce()
  })

  it('reconciles status and clears the busy state when the backend rejects', async () => {
    mocks.sync.push.mockRejectedValueOnce(new Error('push rejected'))
    const owner = currentGitSyncOwner()
    const scope = gitSyncScopeKey(owner, '/repo')

    await expect(runGitSync('push', '/repo', owner)).rejects.toThrow('push rejected')
    expect(mocks.refreshRepoStatus).toHaveBeenCalledWith('/repo')
    expect($gitSyncBusyByCwd.get()).toEqual({ [scope]: null })
  })

  it('does nothing without a repository bridge or cwd', async () => {
    mocks.desktopGit.mockReturnValue(undefined)

    await runGitSync('fetch', '/repo')
    await runGitSync('fetch', '  ')

    expect(mocks.sync.fetch).not.toHaveBeenCalled()
    expect($gitSyncBusyByCwd.get()).toEqual({})
  })
})
