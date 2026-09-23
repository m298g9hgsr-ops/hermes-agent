import { desktopGit } from '@/lib/desktop-git'
import { currentGitSyncOwner, gitSyncScopeKey, isCurrentGitSyncOwner } from '@/lib/git-owner'
import type { GitSyncOwner } from '@/lib/git-owner'

import { refreshRepoStatus } from './coding-status'
import { $gitMutationBusyByCwd, _resetGitMutationForTests, type GitMutationAction, runGitMutation } from './git-mutation'
import { refreshReview } from './review'

export type GitSyncAction = Extract<GitMutationAction, 'fetch' | 'pull' | 'push'>
export const $gitSyncBusyByCwd = $gitMutationBusyByCwd

/**
 * Run one safe repository synchronization operation and reconcile the cached
 * status afterwards. The backend owns the safety checks (fast-forward-only pull,
 * dirty-tree refusal, non-force push); this layer serializes the UI action and
 * pins every request to the owner captured at click time.
 */
export async function runGitSync(
  action: GitSyncAction,
  cwd: null | string | undefined,
  owner: GitSyncOwner = currentGitSyncOwner()
): Promise<void> {
  const target = cwd?.trim()
  const scope = target ? gitSyncScopeKey(owner, target) : ''

  if (!target || $gitSyncBusyByCwd.get()[scope] || !isCurrentGitSyncOwner(owner)) {
    return
  }

  const sync = desktopGit(owner)?.sync

  if (!sync) {
    return
  }

  let started = false
  let operationFailed = false
  let operationError: unknown

  try {
    await runGitMutation(owner, target, action, async () => {
      started = true
      await sync[action](target)
    })
  } catch (error) {
    operationFailed = true
    operationError = error
  }

  if (started && isCurrentGitSyncOwner(owner)) {
    try {
      // A failed fetch can still have updated refs, and a pull can fail after
      // changing the index. Reconcile on both paths.
      await refreshRepoStatus(target)

      if (action === 'pull') {
        void refreshReview()
      }
    } catch (refreshError) {
      if (!operationFailed) {
        operationFailed = true
        operationError = refreshError
      }
    }
  }

  if (operationFailed) {
    throw operationError
  }
}

/** Test-only reset for store tests. */
export function _resetGitSyncForTests(): void {
  _resetGitMutationForTests()
}
