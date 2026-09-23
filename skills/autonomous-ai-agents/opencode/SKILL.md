---
name: opencode
description: "將編碼任務委派給 OpenCode CLI（功能、PR 審查）."
version: 1.2.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Coding-Agent, OpenCode, Autonomous, Refactoring, Code-Review]
    related_skills: [claude-code, codex, hermes-agent]
---

# OpenCode CLI

將 [OpenCode](https://opencode.ai) 作為自主編碼工作者，由 Hermes 的 terminal/process 工具編排。OpenCode 是一個不綁定供應商的開源 AI 編碼代理，具備 TUI 與 CLI。

## 使用時機

- 使用者明確要求使用 OpenCode
- 你想要一個外部編碼代理來實作／重構／審查程式碼
- 你需要長時間進行的編碼會話並需要檢查進度
- 你想要在隔離的 workdir/worktree 中平行執行任務

## 前置需求

- 已安裝 OpenCode：`npm i -g opencode-ai@latest` 或 `brew install anomalyco/tap/opencode`
- 已設定驗證：`opencode auth login` 或設定供應商環境變數（OPENROUTER_API_KEY 等）
- 驗證：`opencode auth list` 應至少顯示一個供應商
- 程式碼任務建議使用 Git 儲存庫
- 互動式 TUI 會話需 `pty=true`

## 執行檔解析（重要）

Shell 環境可能解析到不同的 OpenCode 執行檔。若你的終端機與 Hermes 之間行為不同，請檢查：

```
terminal(command="which -a opencode")
terminal(command="opencode --version")
```

必要時釘住明確的執行檔路徑：

```
terminal(command="$HOME/.opencode/bin/opencode run '...'", workdir="~/project", pty=true)
```

## 單次任務

使用 `opencode run` 執行有界、非互動的任務：

```
terminal(command="opencode run 'Add retry logic to API calls and update tests'", workdir="~/project")
```

用 `-f` 附加脈絡檔案：

```
terminal(command="opencode run 'Review this config for security issues' -f config.yaml -f .env.example", workdir="~/project")
```

用 `--thinking` 顯示模型思考過程：

```
terminal(command="opencode run 'Debug why tests fail in CI' --thinking", workdir="~/project")
```

強制指定模型：

```
terminal(command="opencode run 'Refactor auth module' --model openrouter/anthropic/claude-sonnet-4", workdir="~/project")
```

## 互動式會話（背景）

需要多次往返的迭代工作，請在背景啟動 TUI：

```
terminal(command="opencode", workdir="~/project", background=true, pty=true)
# Returns session_id

# Send a prompt
process(action="submit", session_id="<id>", data="Implement OAuth refresh flow and add tests")

# Monitor progress
process(action="poll", session_id="<id>")
process(action="log", session_id="<id>")

# Send follow-up input
process(action="submit", session_id="<id>", data="Now add error handling for token expiry")

# Exit cleanly — Ctrl+C
process(action="write", session_id="<id>", data="\x03")
# Or just kill the process
process(action="kill", session_id="<id>")
```

**重要：** 請勿使用 `/exit` — 它不是有效的 OpenCode 指令，會改而開啟代理選擇對話框。請用 Ctrl+C（`\x03`）或 `process(action="kill")` 離開。

### TUI 按鍵綁定

| 按鍵 | 動作 |
|-----|--------|
| `Enter` | 送出訊息（必要時按兩次） |
| `Tab` | 在代理間切換（build/plan） |
| `Ctrl+P` | 開啟指令面板 |
| `Ctrl+X L` | 切換會話 |
| `Ctrl+X M` | 切換模型 |
| `Ctrl+X N` | 新增會話 |
| `Ctrl+X E` | 開啟編輯器 |
| `Ctrl+C` | 結束 OpenCode |

### 續接會話

結束後，OpenCode 會印出一個 session ID。用以下方式續接：

```
terminal(command="opencode -c", workdir="~/project", background=true, pty=true)  # Continue last session
terminal(command="opencode -s ses_abc123", workdir="~/project", background=true, pty=true)  # Specific session
```

## 常用旗標

| 旗標 | 用途 |
|------|-----|
| `run 'prompt'` | 單次執行後結束 |
| `--continue` / `-c` | 繼續上一個 OpenCode 會話 |
| `--session <id>` / `-s` | 繼續指定會話 |
| `--agent <name>` | 選擇 OpenCode 代理（build 或 plan） |
| `--model provider/model` | 強制指定模型 |
| `--format json` | 機器可讀的輸出／事件 |
| `--file <path>` / `-f` | 將檔案附加到訊息 |
| `--thinking` | 顯示模型思考區塊 |
| `--variant <level>` | 推理強度（high, max, minimal） |
| `--title <name>` | 為會話命名 |
| `--attach <url>` | 連線到執行中的 opencode 伺服器 |

## 操作步驟

1. 確認工具已就緒：
   - `terminal(command="opencode --version")`
   - `terminal(command="opencode auth list")`
2. 有界任務使用 `opencode run '...'`（不需要 pty）。
3. 迭代任務以 `background=true, pty=true` 啟動 `opencode`。
4. 用 `process(action="poll"|"log")` 監控長任務。
5. 若 OpenCode 詢問輸入，用 `process(action="submit", ...)` 回應。
6. 用 `process(action="write", data="\x03")` 或 `process(action="kill")` 結束。
7. 將檔案變更、測試結果與後續步驟總結回報給使用者。

## PR 審查流程

OpenCode 有內建的 PR 指令：

```
terminal(command="opencode pr 42", workdir="~/project", pty=true)
```

或在暫存複本中審查以取得隔離性：

```
terminal(command="REVIEW=$(mktemp -d) && git clone https://github.com/user/repo.git $REVIEW && cd $REVIEW && opencode run 'Review this PR vs main. Report bugs, security risks, test gaps, and style issues.' -f $(git diff origin/main --name-only | head -20 | tr '\n' ' ')", pty=true)
```

## 平行工作模式

使用個別的 workdir/worktree 以避免衝突：

```
terminal(command="opencode run 'Fix issue #101 and commit'", workdir="~/.hermes/cache/scratch/issue-101", background=true, pty=true)
terminal(command="opencode run 'Add parser regression tests and commit'", workdir="~/.hermes/cache/scratch/issue-102", background=true, pty=true)
process(action="list")
```

## 會話與成本管理

列出過去的會話：

```
terminal(command="opencode session list")
```

檢查 token 用量與成本：

```
terminal(command="opencode stats")
terminal(command="opencode stats --days 7 --models anthropic/claude-sonnet-4")
```

## 常見陷阱

- 互動式 `opencode`（TUI）會話需要 `pty=true`。`opencode run` 指令不需要 pty。
- `/exit` 不是指令 — 它會開啟代理選擇器。用 Ctrl+C 離開 TUI。
- PATH 不一致可能選到錯誤的 OpenCode 執行檔／模型設定。
- 若 OpenCode 似乎卡住，先檢查日誌再結束：
  - `process(action="log", session_id="<id>")`
- 避免多個平行 OpenCode 會話共用同一個工作目錄。
- 在 TUI 中可能需要按兩次 Enter 才能送出（一次定稿文字，一次發送）。

## 驗證

煙霧測試：

```
terminal(command="opencode run 'Respond with exactly: OPENCODE_SMOKE_OK'")
```

成功標準：
- 輸出包含 `OPENCODE_SMOKE_OK`
- 指令結束時沒有供應商／模型錯誤
- 程式碼任務：預期檔案已變更且測試通過

## 規則

1. 一次性自動化優先用 `opencode run` — 較簡單且不需要 pty。
2. 只有需要迭代時才使用互動式背景模式。
3. 始終將 OpenCode 會話限定在單一 repo/workdir。
4. 長任務請從 `process` 日誌提供進度更新。
5. 回報具體結果（變更的檔案、測試、殘留風險）。
6. 用 Ctrl+C 或 kill 結束互動式會話，絕不用 `/exit`。
