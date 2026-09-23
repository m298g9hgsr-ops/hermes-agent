import { useStore } from '@nanostores/react'

import { Button } from '@/components/ui/button'
import { Codicon } from '@/components/ui/codicon'
import { Tip } from '@/components/ui/tooltip'
import { useI18n } from '@/i18n'
import { currentGitSyncOwner, gitSyncScopeKey } from '@/lib/git-owner'
import { repoStatusForCwd } from '@/store/coding-status'
import { $gitSyncBusyByCwd, type GitSyncAction, runGitSync } from '@/store/git-sync'
import { notifyError } from '@/store/notifications'
import { reviewRepoCwd } from '@/store/review'
import { $connection } from '@/store/session'

const ICON = '0.8rem'

/**
 * Repository synchronization controls live beside the review diff, not inside
 * the ship bar: a clean checkout still needs Fetch/Pull/Push, while a dirty
 * checkout must keep its commit/review actions visible below.
 */
export function ReviewSyncBar() {
  const { t } = useI18n()
  const c = t.statusStack.coding
  const connection = useStore($connection)
  const owner = currentGitSyncOwner(connection)
  const cwd = reviewRepoCwd()
  const status = useStore(repoStatusForCwd(cwd))
  const busyByCwd = useStore($gitSyncBusyByCwd)
  const busy = cwd ? busyByCwd[gitSyncScopeKey(owner, cwd)] : null

  if (!cwd || !status || status.syncAvailable !== true) {
    return null
  }

  const branch = status.detached ? c.detached : status.branch || c.noBranch

  const canPull =
    !busy && !status.detached && status.ahead === 0 && status.behind > 0 && status.changed === 0 && status.conflicted === 0

  const canPush = !busy && !status.detached && status.behind === 0

  const run = (action: GitSyncAction) => {
    void runGitSync(action, cwd, owner).catch(error => notifyError(error, c[action]))
  }

  return (
    <div
      className="flex shrink-0 items-center gap-1 border-t border-(--ui-stroke-secondary) px-2 py-1.5"
      data-suppress-pane-reveal-side=""
    >
      <Codicon className="shrink-0 text-(--ui-text-tertiary)" name="git-branch" size={ICON} />
      <span className="min-w-0 truncate text-[0.66rem] text-(--ui-text-secondary)">{branch}</span>
      {status.ahead > 0 && <span className="shrink-0 text-[0.62rem] text-(--ui-green)">↑{status.ahead}</span>}
      {status.behind > 0 && <span className="shrink-0 text-[0.62rem] text-(--ui-yellow)">↓{status.behind}</span>}
      {busy ? (
        <span className="ml-1 truncate text-[0.62rem] text-(--ui-text-tertiary)">{c.syncing}</span>
      ) : status.ahead === 0 && status.behind === 0 ? (
        <span className="ml-1 truncate text-[0.62rem] text-(--ui-text-tertiary)">{c.upToDate}</span>
      ) : null}

      <div className="ml-auto flex shrink-0 items-center gap-0.5">
        <Tip label={c.fetch}>
          <Button
            aria-label={c.fetch}
            disabled={Boolean(busy)}
            onClick={() => run('fetch')}
            size="icon-xs"
            variant="ghost"
          >
            <Codicon name="refresh" size={ICON} spinning={busy === 'fetch'} />
          </Button>
        </Tip>
        <Tip label={c.pull}>
          <Button
            aria-label={c.pull}
            disabled={!canPull}
            onClick={() => run('pull')}
            size="icon-xs"
            variant="ghost"
          >
            <Codicon name="cloud-download" size={ICON} spinning={busy === 'pull'} />
          </Button>
        </Tip>
        <Tip label={c.push}>
          <Button
            aria-label={c.push}
            disabled={!canPush}
            onClick={() => run('push')}
            size="icon-xs"
            variant="ghost"
          >
            <Codicon name="cloud-upload" size={ICON} spinning={busy === 'push'} />
          </Button>
        </Tip>
      </div>
    </div>
  )
}
