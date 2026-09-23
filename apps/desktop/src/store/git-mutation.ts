import { atom } from 'nanostores'

import { gitSyncScopeKey, isCurrentGitSyncOwner } from '@/lib/git-owner'
import type { GitSyncOwner } from '@/lib/git-owner'

export type GitMutationAction =
  | 'fetch'
  | 'pull'
  | 'push'
  | 'stage'
  | 'unstage'
  | 'revert'
  | 'commit'
  | 'pr'

/** One in-flight repository mutation per owner + path. */
export const $gitMutationBusyByCwd = atom<Record<string, GitMutationAction | null>>({})

function setBusy(scope: string, action: GitMutationAction | null): void {
  const busy = $gitMutationBusyByCwd.get()

  if (busy[scope] === action) {
    return
  }

  $gitMutationBusyByCwd.set({ ...busy, [scope]: action })
}

export async function runGitMutation<T>(
  owner: GitSyncOwner,
  cwd: null | string | undefined,
  action: GitMutationAction,
  operation: () => Promise<T>
): Promise<T> {
  const target = cwd?.trim()
  const scope = target ? gitSyncScopeKey(owner, target) : ''

  if (!target || $gitMutationBusyByCwd.get()[scope] || !isCurrentGitSyncOwner(owner)) {
    throw new Error('Another repository operation is already in progress.')
  }

  setBusy(scope, action)

  try {
    return await operation()
  } finally {
    setBusy(scope, null)
  }
}

/** Test-only reset for store tests. */
export function _resetGitMutationForTests(): void {
  $gitMutationBusyByCwd.set({})
}
