---
name: codex
description: "將編碼任務委派給 OpenAI Codex CLI（功能、PR）."
version: 1.0.1
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Coding-Agent, Codex, OpenAI, Code-Review, Refactoring]
    related_skills: [claude-code, hermes-agent]
---

# Codex CLI

透過 Hermes 終端機將編碼任務委派給 [Codex](https://github.com/openai/codex)。Codex 是 OpenAI 的自主編碼代理 CLI。

## 使用時機

- 開發功能
- 重構
- PR 審查
- 批次修正問題

需要 codex CLI 與一個 git 儲存庫。

## 前置需求

- 已安裝 Codex：`npm install -g @openai/codex`
- 已設定 OpenAI 驗證：`OPENAI_API_KEY`，或來自 Codex CLI
  登入流程的 Codex OAuth 憑證
- **必須在 git 儲存庫內執行** — Codex 拒絕在其外執行
- 在 terminal 呼叫中使用 `pty=true` — Codex 是互動式終端機應用

對 Hermes 本身而言，`model.provider: openai-codex` 會使用執行 `hermes auth add openai-codex`
後由 `~/.hermes/auth.json` 管理的 Hermes Codex OAuth。對獨立的 Codex CLI，
有效的 CLI OAuth 會話可能存在於 `~/.codex/auth.json`；不要只憑缺少
`OPENAI_API_KEY` 就斷定 Codex 驗證缺失。

## 單次任務

```
terminal(command="codex exec 'Add dark mode toggle to settings'", workdir="~/project", pty=true)
```

暫存工作用（Codex 需要 git repo）：
```
terminal(command="cd $(mktemp -d) && git init && codex exec 'Build a snake game in Python'", pty=true)
```

## 背景模式（長任務）

```
# Start in background with PTY
terminal(command="codex exec --sandbox workspace-write 'Refactor the auth module'", workdir="~/project", background=true, pty=true)
# Returns session_id

# Monitor progress
process(action="poll", session_id="<id>")
process(action="log", session_id="<id>")

# Send input if Codex asks a question
process(action="submit", session_id="<id>", data="yes")

# Kill if needed
process(action="kill", session_id="<id>")
```

## 關鍵旗標

| 旗標 | 效果 |
|------|--------|
| `exec "prompt"` | 單次執行，完成即結束 |
| `--sandbox workspace-write`（`-s`） | 沙箱化但自動核准工作區內的檔案變更（建議的自動建置模式） |
| `--dangerously-bypass-approvals-and-sandbox` | 無沙箱、無核准（最快也最危險；`--yolo` 仍作為隱藏別名可用） |
| `--sandbox danger-full-access` | 無 Codex 沙箱；當宿主服務環境破壞 bubblewrap 時有用 |

> **已棄用：** `--full-auto` 仍可用，但實際 CLI 會警告改用 `--sandbox workspace-write`。

## Hermes 閘道注意事項

從 Hermes 閘道／服務環境（例如 Telegram 驅動的代理會話）呼叫 Codex CLI 時，
即使相同指令在使用者的互動 shell 中可行，Codex 的 `workspace-write` 沙箱也可能失敗。
典型症狀是 bubblewrap／user-namespace 錯誤，例如
`setting up uid map: Permission denied` 或
`loopback: Failed RTM_NEWADDR: Operation not permitted`。

在該環境中，請優先使用：

```
codex exec --sandbox danger-full-access "<task>"
```

改以程序邊界作為安全層：明確的 `workdir`、啟動前乾淨的 git 狀態、
狹窄的任務提示、`git diff` 審查、針對性測試，以及在提交大範圍變更前
取得人／代理確認。

## PR 審查

複製到暫存目錄以安全審查：

```
terminal(command="REVIEW=$(mktemp -d) && git clone https://github.com/user/repo.git $REVIEW && cd $REVIEW && gh pr checkout 42 && codex review --base origin/main", pty=true)
```

## 以 Worktree 平行修正問題

```
# Create worktrees
terminal(command="git worktree add -b fix/issue-78 ~/.hermes/cache/scratch/issue-78 main", workdir="~/project")
terminal(command="git worktree add -b fix/issue-99 ~/.hermes/cache/scratch/issue-99 main", workdir="~/project")

# Launch Codex in each
terminal(command="codex --sandbox workspace-write exec 'Fix issue #78: <description>. Commit when done.'", workdir="~/.hermes/cache/scratch/issue-78", background=true, pty=true)
terminal(command="codex --sandbox workspace-write exec 'Fix issue #99: <description>. Commit when done.'", workdir="~/.hermes/cache/scratch/issue-99", background=true, pty=true)

# Monitor
process(action="list")

# After completion, push and create PRs
terminal(command="cd ~/.hermes/cache/scratch/issue-78 && git push -u origin fix/issue-78")
terminal(command="gh pr create --repo user/repo --head fix/issue-78 --title 'fix: ...' --body '...'")

# Cleanup
terminal(command="git worktree remove ~/.hermes/cache/scratch/issue-78", workdir="~/project")
```

## 批次 PR 審查

```
# Fetch all PR refs
terminal(command="git fetch origin '+refs/pull/*/head:refs/remotes/origin/pr/*'", workdir="~/project")

# Review multiple PRs in parallel
terminal(command="codex exec 'Review PR #86. git diff origin/main...origin/pr/86'", workdir="~/project", background=true, pty=true)
terminal(command="codex exec 'Review PR #87. git diff origin/main...origin/pr/87'", workdir="~/project", background=true, pty=true)

# Post results
terminal(command="gh pr comment 86 --body '<review>'", workdir="~/project")
```

## 規則

1. **始終使用 `pty=true`** — Codex 是互動式終端機應用，沒有 PTY 會掛住
2. **需要 git repo** — Codex 不會在 git 目錄外執行。暫存工作用 `mktemp -d && git init`
3. **單次任務用 `exec`** — `codex exec "prompt"` 執行後乾淨結束
4. **建置用 `--sandbox workspace-write`** — 自動核准沙箱內的變更（`--full-auto` 對此已棄用）
5. **長任務放背景** — 使用 `background=true` 並以 `process` 工具監控
6. **不要干擾** — 用 `poll`／`log` 監控，對長時間任務保持耐心
7. **可以平行** — 批次工作可同時執行多個 Codex 程序
