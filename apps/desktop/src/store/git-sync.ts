import { atom } from 'nanostores'

import { desktopGit } from '@/lib/desktop-git'

import { refreshRepoStatus } from './coding-status'
import { refreshReview } from './review'

export type GitSyncAction = 'fetch' | 'pull' | 'push'

/** One in-flight operation per repository path, never one global spinner. */
export const $gitSyncBusyByCwd = atom<Record<string, GitSyncAction | null>>({})

function setBusy(cwd: string, action: GitSyncAction | null): void {
  const busy = $gitSyncBusyByCwd.get()

  if (busy[cwd] === action) {
    return
  }

  $gitSyncBusyByCwd.set({ ...busy, [cwd]: action })
}

/**
 * Run one safe repository synchronization operation and reconcile the cached
 * status afterwards. The backend owns the safety checks (fast-forward-only pull,
 * dirty-tree refusal, non-force push); this layer only serializes the UI action
 * and keeps a tile/worktree's status scoped to its own cwd.
 */
export async function runGitSync(action: GitSyncAction, cwd: null | string | undefined): Promise<void> {
  const target = cwd?.trim()

  if (!target || $gitSyncBusyByCwd.get()[target]) {
    return
  }

  const bridge = desktopGit()?.sync

  if (!bridge) {
    return
  }

  setBusy(target, action)

  try {
    await bridge[action](target)
    await refreshRepoStatus(target)

    // Pull can replace files underneath an open diff. Do not make a successful
    // network/git operation look failed just because the follow-up read raced.
    if (action === 'pull') {
      void refreshReview()
    }
  } finally {
    setBusy(target, null)
  }
}

/** Test-only reset for store tests. */
export function _resetGitSyncForTests(): void {
  $gitSyncBusyByCwd.set({})
}
