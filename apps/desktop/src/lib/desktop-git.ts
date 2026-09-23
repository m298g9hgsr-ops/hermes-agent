import type {
  HermesApiRequest,
  HermesGitBaseBranch,
  HermesGitBranch,
  HermesGitWorktree,
  HermesRepoPullRequests,
  HermesRepoStatus,
  HermesReviewList,
  HermesReviewShipInfo
} from '@/global'
import { hermesApi } from '@/hermes'

import { desktopFsProfile } from './desktop-fs'
import { currentGitSyncOwner, type GitSyncOwner } from './git-owner'

// Remote-aware git facade. Locally the desktop runs git through Electron
// (window.hermesDesktop.git); on a remote gateway that's the wrong filesystem,
// so we mirror the same surface over the dashboard REST API (/api/git/*) — the
// coding rail, worktree lanes, review pane, and branch ops then act on the
// BACKEND repo where sessions actually run. Mirrors desktop-fs.ts.

type GitBridge = NonNullable<NonNullable<Window['hermesDesktop']>['git']>

function desktopApi<T>(path: string, body?: Record<string, unknown>, owner?: GitSyncOwner): Promise<T> {
  const desktop = window.hermesDesktop

  if (!desktop) {
    throw new Error('Hermes Desktop bridge is unavailable')
  }

  const request: HermesApiRequest = body
    ? { body, method: 'POST', path, profile: owner?.profile ?? desktopFsProfile() }
    : { path, profile: owner?.profile ?? desktopFsProfile() }

  if (owner?.connectionId) {
    request.connectionId = owner.connectionId
  }

  return hermesApi<T>(request)
}

function gitGet<T>(
  route: string,
  params: Record<string, boolean | null | string | undefined>,
  owner?: GitSyncOwner
): Promise<T> {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined) {
      query.set(key, String(value))
    }
  }

  return desktopApi<T>(`/api/git/${route}?${query.toString()}`, undefined, owner)
}

function gitPost<T>(route: string, body: Record<string, unknown>, owner?: GitSyncOwner): Promise<T> {
  return desktopApi<T>(`/api/git/${route}`, body, owner)
}

function remoteGit(owner: GitSyncOwner): GitBridge {
  return {
    worktreeList: async repoPath =>
      (await gitGet<{ worktrees: HermesGitWorktree[] }>('worktrees', { path: repoPath }, owner)).worktrees,

    worktreeAdd: (repoPath, options) => gitPost('worktree/add', { path: repoPath, ...options }, owner),

    worktreeRemove: (repoPath, worktreePath, options) =>
      gitPost('worktree/remove', { force: options?.force ?? false, path: repoPath, worktreePath }, owner),

    branchSwitch: (repoPath, branch) => gitPost('branch/switch', { branch, path: repoPath }, owner),

    branchList: async repoPath =>
      (await gitGet<{ branches: HermesGitBranch[] }>('branches', { path: repoPath }, owner)).branches,

    baseBranchList: async repoPath =>
      (await gitGet<{ branches: HermesGitBaseBranch[] }>('base-branches', { path: repoPath }, owner)).branches,

    repoStatus: repoPath => gitGet<HermesRepoStatus | null>('status', { path: repoPath }, owner),

    sync: {
      fetch: repoPath => gitPost<HermesRepoStatus | null>('sync/fetch', { path: repoPath }, owner),
      pull: repoPath => gitPost<HermesRepoStatus | null>('sync/pull', { path: repoPath }, owner),
      push: repoPath => gitPost<HermesRepoStatus | null>('sync/push', { path: repoPath }, owner)
    },

    fileDiff: async (repoPath, filePath) =>
      (await gitGet<{ diff: string }>('file-diff', { file: filePath, path: repoPath }, owner)).diff,

    review: {
      list: (repoPath, scope, baseRef) =>
        gitGet<HermesReviewList>('review/list', { base: baseRef, path: repoPath, scope }, owner),

      diff: async (repoPath, filePath, scope, baseRef, staged) =>
        (
          await gitGet<{ diff: string }>(
            'review/diff',
            { base: baseRef, file: filePath, path: repoPath, scope, staged },
            owner
          )
        ).diff,

      stage: (repoPath, filePath) =>
        gitPost('review/stage', { file: filePath ?? null, path: repoPath }, owner),

      unstage: (repoPath, filePath) =>
        gitPost('review/unstage', { file: filePath ?? null, path: repoPath }, owner),

      revert: (repoPath, filePath) => gitPost('review/revert', { file: filePath ?? null, path: repoPath }, owner),

      revParse: async (repoPath, ref) =>
        (await gitGet<{ sha: null | string }>('review/rev-parse', { path: repoPath, ref }, owner)).sha,

      commit: (repoPath, message, push) => gitPost('review/commit', { message, path: repoPath, push }, owner),

      commitContext: repoPath => gitGet('review/commit-context', { path: repoPath }, owner),

      push: repoPath => gitPost('review/push', { path: repoPath }, owner),

      shipInfo: repoPath => gitGet<HermesReviewShipInfo>('review/ship-info', { path: repoPath }, owner),

      prList: (repoPath, branches, numbers) =>
        gitPost<HermesRepoPullRequests>(
          'review/pr-list',
          { branches, numbers: numbers ?? [], path: repoPath },
          owner
        ),

      createPr: repoPath => gitPost('review/create-pr', { path: repoPath }, owner)
    },

    // Repo discovery is a local-disk crawl; on a remote gateway the backend
    // already merges session-derived repos, so this is a no-op.
    scanRepos: async () => []
  }
}

export function desktopGit(owner: GitSyncOwner = currentGitSyncOwner()): GitBridge | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return owner.mode === 'remote' ? remoteGit(owner) : window.hermesDesktop?.git
}
