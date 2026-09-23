import type { HermesConnection } from '@/global'
import { $connection } from '@/store/session'

import { desktopFsCacheKey } from './desktop-fs'

/** The backend owner captured for one repository operation. */
export interface GitSyncOwner {
  key: string
  mode: 'local' | 'remote'
  connectionId?: string
  profile?: string
}

export function currentGitSyncOwner(
  connection: HermesConnection | null | undefined = $connection.get()
): GitSyncOwner {
  const mode = connection?.mode === 'remote' ? 'remote' : 'local'
  const profile = connection?.profile?.trim() || undefined
  const connectionId = connection?.connectionId?.trim() || undefined

  return {
    key: desktopFsCacheKey(connection),
    mode,
    ...(connectionId ? { connectionId } : {}),
    ...(profile ? { profile } : {})
  }
}

export function isCurrentGitSyncOwner(owner: GitSyncOwner): boolean {
  return currentGitSyncOwner().key === owner.key
}

export function gitSyncScopeKey(owner: GitSyncOwner, cwd: string): string {
  return JSON.stringify([owner.key, cwd])
}
