import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { afterEach, test } from 'vitest'

import {
  gitFor,
  repoStatus,
  resolveRenamePath,
  REVIEW_FILE_CAP,
  reviewList,
  syncFetch,
  syncPull,
  syncPush
} from './git-review-ops'

const tempDirs: string[] = []

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { force: true, recursive: true })
  }
})

function makeRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-desktop-git-status-'))

  tempDirs.push(dir)
  execFileSync('git', ['init', '-q'], { cwd: dir })
  execFileSync('git', ['config', 'user.email', 'hermes-test@example.com'], { cwd: dir })
  execFileSync('git', ['config', 'user.name', 'Hermes Test'], { cwd: dir })
  fs.writeFileSync(path.join(dir, 'tracked.txt'), 'tracked\n')
  execFileSync('git', ['add', 'tracked.txt'], { cwd: dir })
  execFileSync('git', ['commit', '-qm', 'initial'], { cwd: dir })

  return dir
}

test('resolveRenamePath: plain path is unchanged', () => {
  assert.equal(resolveRenamePath('src/a.ts'), 'src/a.ts')
})

test('gitFor accepts an internally resolved git binary path containing spaces', () => {
  assert.doesNotThrow(() => gitFor(process.cwd(), 'C:\\Program Files\\Git\\cmd\\git.exe'))
})

test('resolveRenamePath: simple rename resolves to the new path', () => {
  assert.equal(resolveRenamePath('old.ts => new.ts'), 'new.ts')
})

test('resolveRenamePath: brace rename resolves to the new path', () => {
  assert.equal(resolveRenamePath('src/{old => new}/file.ts'), 'src/new/file.ts')
})

test('resolveRenamePath: brace rename collapsing a segment', () => {
  assert.equal(resolveRenamePath('src/{lib => }/file.ts'), 'src/file.ts')
})

test('repoStatus reports an untracked directory without recursively listing its contents', async () => {
  const dir = makeRepo()
  const nested = path.join(dir, 'generated', 'deep')

  fs.mkdirSync(nested, { recursive: true })
  fs.writeFileSync(path.join(nested, 'large-output.txt'), 'generated\n')

  const status = await repoStatus(dir, 'git')

  assert.ok(status)
  assert.equal(status.untracked, 1)
  assert.equal(status.changed, 1)
  assert.deepEqual(
    status.files.map(file => file.path),
    ['generated/']
  )
})

test('reviewList reports an untracked directory without recursively listing its contents', async () => {
  const dir = makeRepo()
  const nested = path.join(dir, 'browser-profile', 'Default', 'Cache')

  fs.mkdirSync(nested, { recursive: true })

  for (let i = 0; i < 20; i++) {
    fs.writeFileSync(path.join(nested, `cache-${i}.bin`), 'generated\n')
  }

  const result = await reviewList(dir, 'uncommitted', null, 'git')

  assert.deepEqual(
    result.files.map(file => file.path),
    ['browser-profile/']
  )
})

function addOriginRemote(repo: string): string {
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-desktop-git-remote-'))

  tempDirs.push(remote)
  execFileSync('git', ['init', '-q', '--bare', remote], { cwd: repo })
  execFileSync('git', ['remote', 'add', 'origin', remote], { cwd: repo })
  execFileSync('git', ['push', '-q', '-u', 'origin', 'HEAD'], { cwd: repo })

  return remote
}

function cloneRemote(remote: string): string {
  const clone = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-desktop-git-clone-'))

  tempDirs.push(clone)
  execFileSync('git', ['clone', '-q', remote, clone], { cwd: path.dirname(clone) })
  execFileSync('git', ['config', 'user.email', 'hermes-test@example.com'], { cwd: clone })
  execFileSync('git', ['config', 'user.name', 'Hermes Test'], { cwd: clone })

  return clone
}

test('syncFetch and syncPull fast-forward without touching a dirty tree', async () => {
  const repo = makeRepo()
  const remote = addOriginRemote(repo)
  const other = cloneRemote(remote)

  fs.writeFileSync(path.join(other, 'tracked.txt'), 'remote update\n')
  execFileSync('git', ['add', 'tracked.txt'], { cwd: other })
  execFileSync('git', ['commit', '-qm', 'remote update'], { cwd: other })
  execFileSync('git', ['push', '-q', 'origin', 'HEAD'], { cwd: other })

  const fetched = await syncFetch(repo, 'git')
  assert.equal(fetched?.behind, 1)

  const pulled = await syncPull(repo, 'git')
  assert.equal(pulled?.behind, 0)
  assert.equal(fs.readFileSync(path.join(repo, 'tracked.txt'), 'utf8'), 'remote update\n')
})

test('syncPull refuses uncommitted changes and syncPush refuses a behind branch', async () => {
  const repo = makeRepo()
  const remote = addOriginRemote(repo)
  const other = cloneRemote(remote)

  fs.writeFileSync(path.join(repo, 'tracked.txt'), 'local draft\n')
  await assert.rejects(() => syncPull(repo, 'git'), /uncommitted changes/)

  fs.writeFileSync(path.join(repo, 'tracked.txt'), 'tracked\n')
  fs.writeFileSync(path.join(other, 'tracked.txt'), 'remote update\n')
  execFileSync('git', ['add', 'tracked.txt'], { cwd: other })
  execFileSync('git', ['commit', '-qm', 'remote update'], { cwd: other })
  execFileSync('git', ['push', '-q', 'origin', 'HEAD'], { cwd: other })
  await syncFetch(repo, 'git')

  await assert.rejects(() => syncPush(repo, 'git'), /behind its upstream/)
})

test('syncPush sets an upstream on a new branch without force', async () => {
  const repo = makeRepo()
  addOriginRemote(repo)
  execFileSync('git', ['switch', '-qc', 'feature/sync'], { cwd: repo })
  fs.writeFileSync(path.join(repo, 'feature.txt'), 'feature\n')
  execFileSync('git', ['add', 'feature.txt'], { cwd: repo })
  execFileSync('git', ['commit', '-qm', 'feature'], { cwd: repo })

  const result = await syncPush(repo, 'git')
  assert.equal(result?.branch, 'feature/sync')
})

test('reviewList caps the file payload returned to the renderer', async () => {
  const dir = makeRepo()

  for (let i = 0; i < REVIEW_FILE_CAP + 10; i++) {
    fs.writeFileSync(path.join(dir, `untracked-${String(i).padStart(4, '0')}.txt`), 'generated\n')
  }

  const result = await reviewList(dir, 'uncommitted', null, 'git')

  assert.equal(result.files.length, REVIEW_FILE_CAP)
})
