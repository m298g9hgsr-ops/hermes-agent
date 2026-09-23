---
name: claude-code
description: "將編碼任務委派給 Claude Code CLI（功能、PR）."
version: 2.2.1
author: Hermes Agent + Teknium
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Coding-Agent, Claude, Anthropic, Code-Review, Refactoring, PTY, Automation]
    related_skills: [codex, hermes-agent, opencode]
---

# Claude Code — Hermes 編排指南

透過 Hermes 終端機將編碼任務委派給 [Claude Code](https://code.claude.com/docs/en/cli-reference)（Anthropic 的自主編碼代理 CLI）。Claude Code v2.x 可自主讀取檔案、撰寫程式碼、執行 shell 指令、產生子代理，並管理 git 工作流程。

## 前置需求

- **安裝：** `npm install -g @anthropic-ai/claude-code`
- **驗證：** 執行一次 `claude` 以登入（Pro/Max 使用瀏覽器 OAuth，或設定 `ANTHROPIC_API_KEY`）
- **Console 驗證：** `claude auth login --console` 用於 API 金鑰計費
- **SSO 驗證：** `claude auth login --sso` 用於企業版
- **檢查狀態：** `claude auth status`（JSON）或 `claude auth status --text`（人類可讀）
- **健康檢查：** `claude doctor` — 檢查自動更新器與安裝健康狀況
- **版本檢查：** `claude --version`（需要 v2.x 以上）
- **更新：** `claude update` 或 `claude upgrade`

## 兩種編排模式

Hermes 以兩種根本不同的方式與 Claude Code 互動。請依任務選擇。

### 模式 1：列印模式（`-p`）— 非互動式（大多數任務的首選）

列印模式執行單次任務、回傳結果並結束。不需要 PTY，沒有互動提示。這是最乾淨的整合路徑。

```
terminal(command="claude -p 'Add error handling to all API calls in src/' --allowedTools 'Read,Edit' --max-turns 10", workdir="/path/to/project", timeout=120)
```

**何時使用列印模式：**
- 單次編碼任務（修錯誤、加功能、重構）
- CI/CD 自動化與腳本
- 搭配 `--json-schema` 的結構化資料擷取
- 管線輸入處理（`cat file | claude -p "analyze this"`）
- 任何不需要多輪對話的任務

**列印模式略過所有互動式對話框** — 沒有工作区信任提示、沒有權限確認。這讓它成為自動化的理想選擇。

### 模式 2：透過 tmux 的互動式 PTY — 多輪會話

互動模式提供完整的對話式 REPL，可送出後續提示、使用斜線指令，並即時觀看 Claude 工作。**需要 tmux 編排。**

```
# Start a tmux session
terminal(command="tmux new-session -d -s claude-work -x 140 -y 40")

# Launch Claude Code inside it
terminal(command="tmux send-keys -t claude-work 'cd /path/to/project && claude' Enter")

# Wait for startup, then send your task
# (after ~3-5 seconds for the welcome screen)
terminal(command="sleep 5 && tmux send-keys -t claude-work 'Refactor the auth module to use JWT tokens' Enter")

# Monitor progress by capturing the pane
terminal(command="sleep 15 && tmux capture-pane -t claude-work -p -S -50")

# Send follow-up tasks
terminal(command="tmux send-keys -t claude-work 'Now add unit tests for the new JWT code' Enter")

# Exit when done
terminal(command="tmux send-keys -t claude-work '/exit' Enter")
```

**何時使用互動模式：**
- 多輪迭代工作（重構 → 審查 → 修正 → 測試循環）
- 需要人工參與決策的任務
- 探索式編碼會話
- 需要使用 Claude 的斜線指令時（`/compact`、`/review`、`/model`）

## PTY 對話框處理（互動模式的關鍵）

Claude Code 在首次啟動時最多會顯示兩個確認對話框。你必須透過 tmux send-keys 處理它們：

### 對話框 1：工作区信任（首次拜訪某個目錄）
```
❯ 1. Yes, I trust this folder    ← DEFAULT (just press Enter)
  2. No, exit
```
**處理方式：** `tmux send-keys -t <session> Enter` — 預設選項是正確的。

### 對話框 2：個別權限提示（正常流程）

每個需要核准的工具使用（檔案寫入、shell 指令、網路）都會顯示提示。逐一回應那個提示 — 這不同於停用整個執行期間的提示：
```
# Read the prompt before answering it
terminal(command="tmux capture-pane -t <session> -p -S -30")
# Allow this one action (Enter = default "Yes"); Esc declines it
terminal(command="tmux send-keys -t <session> Enter")
```
絕不要用計時器盲按 `Enter` 來核准你沒讀過的提示 — 那只是多了幾個步驟的旁路旗標。

比完整旁路更窄的選擇加入是 `--permission-mode acceptEdits`：工作目錄中的檔案編輯會被接受，shell 與其他工具呼叫仍會提示。只有在專用 worktree 中並已審視任務後才使用它。

### 穩健的對話框處理模式
```
# Default launch — keep permission prompts enabled
terminal(command="tmux send-keys -t claude-work 'claude \"your task\"' Enter")

# Handle trust dialog (Enter for default "Yes")
terminal(command="sleep 4 && tmux send-keys -t claude-work Enter")

# Now wait for Claude to work
terminal(command="sleep 15 && tmux capture-pane -t claude-work -p -S -60")
```

**注意：** 某個目錄首次信任核准後，信任對話框不會再出現。

### 選擇加入：--dangerously-skip-permissions（僅限隔離環境）

這會停用整個執行期間的權限提示 — 不經提示授予檔案系統、shell 與網路存取。只在一次性 worktree 或隔離容器中才可接受。
```
❯ 1. No, exit                    ← DEFAULT (safe choice)
  2. Yes, I accept
```
要接受：`tmux send-keys -t <session> Down && sleep 0.3 && tmux send-keys -t <session> Enter`

## CLI 子指令

| 子指令 | 用途 |
|------------|---------|
| `claude` | 啟動互動式 REPL |
| `claude "query"` | 以初始提示啟動 REPL |
| `claude -p "query"` | 列印模式（非互動，完成即結束） |
| `cat file \| claude -p "query"` | 將內容管線輸入作為 stdin 脈絡 |
| `claude -c` | 繼續此目錄中最近的對話 |
| `claude -r "id"` | 依 ID 或名稱續接指定會話 |
| `claude auth login` | 登入（API 計費加 `--console`，企業版加 `--sso`） |
| `claude auth status` | 檢查登入狀態（回傳 JSON；`--text` 為人類可讀） |
| `claude mcp add <name> -- <cmd>` | 新增 MCP 伺服器 |
| `claude mcp list` | 列出已設定的 MCP 伺服器 |
| `claude mcp remove <name>` | 移除 MCP 伺服器 |
| `claude agents` | 列出已設定的代理 |
| `claude doctor` | 對安裝與自動更新器執行健康檢查 |
| `claude update` / `claude upgrade` | 將 Claude Code 更新至最新版本 |
| `claude remote-control` | 啟動伺服器以從 claude.ai 或手機應用控制 Claude |
| `claude install [target]` | 安裝原生版本（stable、latest 或指定版本） |
| `claude setup-token` | 設定長效驗證權杖（需要訂閱） |
| `claude plugin` / `claude plugins` | 管理 Claude Code 外掛 |
| `claude auto-mode` | 檢視自動模式分類器設定 |

## 列印模式深入解析

### 結構化 JSON 輸出
```
terminal(command="claude -p 'Analyze auth.py for security issues' --output-format json --max-turns 5", workdir="/project", timeout=120)
```

回傳 JSON 物件，包含：
```json
{
  "type": "result",
  "subtype": "success",
  "result": "The analysis text...",
  "session_id": "75e2167f-...",
  "num_turns": 3,
  "total_cost_usd": 0.0787,
  "duration_ms": 10276,
  "stop_reason": "end_turn",
  "terminal_reason": "completed",
  "usage": { "input_tokens": 5, "output_tokens": 603, ... },
  "modelUsage": { "claude-sonnet-4-6": { "costUSD": 0.078, "contextWindow": 200000 } }
}
```

**關鍵欄位：** `session_id` 用於續接、`num_turns` 為代理迴圈次數、`total_cost_usd` 用於花費追蹤、`subtype` 用於成功／錯誤偵測（`success`、`error_max_turns`、`error_budget`）。

### 串流 JSON 輸出
若要即時 token 串流，搭配 `--verbose` 使用 `stream-json`：
```
terminal(command="claude -p 'Write a summary' --output-format stream-json --verbose --include-partial-messages", timeout=60)
```

回傳以換行分隔的 JSON 事件。用 jq 過濾以取得即時文字：
```
claude -p "Explain X" --output-format stream-json --verbose --include-partial-messages | \
  jq -rj 'select(.type == "stream_event" and .event.delta.type? == "text_delta") | .event.delta.text'
```

串流事件包含含 `attempt`、`max_retries` 與 `error` 欄位（例如 `rate_limit`、`billing_error`）的 `system/api_retry`。

### 雙向串流
若要同時即時輸入與輸出串流：
```
claude -p "task" --input-format stream-json --output-format stream-json --replay-user-messages
```
`--replay-user-messages` 會在 stdout 重新發出使用者訊息以供確認。

### 管線輸入
```
# Pipe a file for analysis
terminal(command="cat src/auth.py | claude -p 'Review this code for bugs' --max-turns 1", timeout=60)

# Pipe multiple files
terminal(command="cat src/*.py | claude -p 'Find all TODO comments' --max-turns 1", timeout=60)

# Pipe command output
terminal(command="git diff HEAD~3 | claude -p 'Summarize these changes' --max-turns 1", timeout=60)
```

### 用於結構化擷取的 JSON Schema
```
terminal(command="claude -p 'List all functions in src/' --output-format json --json-schema '{\"type\":\"object\",\"properties\":{\"functions\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}},\"required\":[\"functions\"]}' --max-turns 5", workdir="/project", timeout=90)
```

從 JSON 結果解析 `structured_output`。Claude 在回傳前會依 schema 驗證輸出。

### 會話續接
```
# Start a task
terminal(command="claude -p 'Start refactoring the database layer' --output-format json --max-turns 10 > ~/.hermes/cache/scratch/session.json", workdir="/project", timeout=180)

# Resume with session ID
terminal(command="claude -p 'Continue and add connection pooling' --resume $(cat ~/.hermes/cache/scratch/session.json | python -c 'import json,sys; print(json.load(sys.stdin)[\"session_id\"])') --max-turns 5", workdir="/project", timeout=120)

# Or resume the most recent session in the same directory
terminal(command="claude -p 'What did you do last time?' --continue --max-turns 1", workdir="/project", timeout=30)

# Fork a session (new ID, keeps history)
terminal(command="claude -p 'Try a different approach' --resume <id> --fork-session --max-turns 10", workdir="/project", timeout=120)
```

### CI／腳本用的 Bare 模式
```
terminal(command="claude --bare -p 'Run all tests and report failures' --allowedTools 'Read,Bash' --max-turns 10", workdir="/project", timeout=180)
```

`--bare` 會略過 hooks、外掛、MCP 偵測與 CLAUDE.md 載入。啟動最快。需要 `ANTHROPIC_API_KEY`（略過 OAuth）。

在 bare 模式中選擇性載入脈絡：
| 要載入的內容 | 旗標 |
|---------|------|
| 系統提示附加 | `--append-system-prompt "text"` 或 `--append-system-prompt-file path` |
| 設定 | `--settings <file-or-json>` |
| MCP 伺服器 | `--mcp-config <file-or-json>` |
| 自訂代理 | `--agents '<json>'` |

### 過載時的備援模型
```
terminal(command="claude -p 'task' --fallback-model haiku --max-turns 5", timeout=90)
```
當預設模型過載時自動切換到指定模型（僅限列印模式）。

## 完整 CLI 旗標參考

### 會話與環境
| 旗標 | 效果 |
|------|--------|
| `-p, --print` | 非互動單次模式（完成即結束） |
| `-c, --continue` | 續接目前目錄中最近的對話 |
| `-r, --resume <id>` | 依 ID 或名稱續接指定會話（無 ID 時開啟選擇器） |
| `--fork-session` | 續接時建立新的 session ID，而非重用原本的 |
| `--session-id <uuid>` | 為對話使用指定的 UUID |
| `--no-session-persistence` | 不將會話儲存到磁碟（僅限列印模式） |
| `--add-dir <paths...>` | 授予 Claude 存取額外工作目錄的權限 |
| `-w, --worktree [name]` | 在 `.claude/worktrees/<name>` 的隔離 git worktree 中執行 |
| `--tmux` | 為 worktree 建立 tmux 會話（需要 `--worktree`） |
| `--ide` | 啟動時自動連線到有效的 IDE |
| `--chrome` / `--no-chrome` | 啟用／停用 Chrome 瀏覽器整合以進行網頁測試 |
| `--from-pr [number]` | 續接連結到指定 GitHub PR 的會話 |
| `--file <specs...>` | 啟動時下載的檔案資源（格式：`file_id:relative_path`） |

### 模型與效能
| 旗標 | 效果 |
|------|--------|
| `--model <alias>` | 模型選擇：`sonnet`、`opus`、`haiku`，或如 `claude-sonnet-4-6` 的完整名稱 |
| `--effort <level>` | 推理深度：`low`、`medium`、`high`、`xhigh`、`max` |
| `--max-turns <n>` | 限制代理迴圈（僅限列印模式；防止失控） |
| `--max-budget-usd <n>` | 以美元限制 API 花費（僅限列印模式） |
| `--fallback-model <model>` | 預設模型過載時自動備援（僅限列印模式） |
| `--betas <betas...>` | 要包含在 API 請求中的 Beta 標頭（僅限 API 金鑰使用者） |

### 權限與安全
| 旗標 | 效果 |
|------|--------|
| `--dangerously-skip-permissions` | 僅限選擇加入：停用所有權限提示（檔案寫入、bash、網路）。僅限一次性 worktree／隔離容器 — 見上方「選擇加入」 |
| `--allow-dangerously-skip-permissions` | 將旁路作為*選項*啟用，但不預設啟用 |
| `--permission-mode <mode>` | `default`、`acceptEdits`、`plan`、`auto`、`dontAsk`、`bypassPermissions` |
| `--allowedTools <tools...>` | 白名單指定工具（以逗號或空格分隔） |
| `--disallowedTools <tools...>` | 黑名單指定工具 |
| `--tools <tools...>` | 覆寫內建工具集（`""` = 無、`"default"` = 全部，或工具名稱） |

### 輸出與輸入格式
| 旗標 | 效果 |
|------|--------|
| `--output-format <fmt>` | `text`（預設）、`json`（單一結果物件）、`stream-json`（換行分隔） |
| `--input-format <fmt>` | `text`（預設）或 `stream-json`（即時串流輸入） |
| `--json-schema <schema>` | 強制符合 schema 的結構化 JSON 輸出 |
| `--verbose` | 完整逐輪輸出 |
| `--include-partial-messages` | 即時包含部分訊息區塊（stream-json + print） |
| `--replay-user-messages` | 在 stdout 重新發出使用者訊息（stream-json 雙向） |

### 系統提示與脈絡
| 旗標 | 效果 |
|------|--------|
| `--append-system-prompt <text>` | **新增**到預設系統提示（保留內建能力） |
| `--append-system-prompt-file <path>` | **將檔案內容新增**到預設系統提示 |
| `--system-prompt <text>` | **取代**整個系統提示（通常改用 --append） |
| `--system-prompt-file <path>` | 以檔案內容**取代**系統提示 |
| `--bare` | 略過 hooks、外掛、MCP 偵測、CLAUDE.md、OAuth（啟動最快） |
| `--agents '<json>'` | 以 JSON 動態定義自訂子代理 |
| `--mcp-config <path>` | 從 JSON 檔案載入 MCP 伺服器（可重複） |
| `--strict-mcp-config` | 只使用 `--mcp-config` 的 MCP 伺服器，忽略所有其他 MCP 設定 |
| `--settings <file-or-json>` | 從 JSON 檔案或內聯 JSON 載入額外設定 |
| `--setting-sources <sources>` | 以逗號分隔要載入的來源：`user`、`project`、`local` |
| `--plugin-dir <paths...>` | 僅為此會話從目錄載入外掛 |
| `--disable-slash-commands` | 停用所有技能／斜線指令 |

### 疑難排解
| 旗標 | 效果 |
|------|--------|
| `-d, --debug [filter]` | 啟用除錯日誌，可選類別過濾（例如 `"api,hooks"`、`"!1p,!file"`） |
| `--debug-file <path>` | 將除錯日誌寫入檔案（隱含啟用除錯模式） |

### 代理團隊
| 旗標 | 效果 |
|------|--------|
| `--teammate-mode <mode>` | 代理團隊的顯示方式：`auto`、`in-process` 或 `tmux` |
| `--brief` | 啟用 `SendUserMessage` 工具以進行代理對使用者的通訊 |

### --allowedTools / --disallowedTools 的工具名稱語法
```
Read                    # All file reading
Edit                    # File editing (existing files)
Write                   # File creation (new files)
Bash                    # All shell commands
Bash(git *)             # Only git commands
Bash(git commit *)      # Only git commit commands
Bash(npm run lint:*)    # Pattern matching with wildcards
WebSearch               # Web search capability
WebFetch                # Web page fetching
mcp__<server>__<tool>   # Specific MCP tool
```

## 設定與組態

### 設定層級（由高至低優先權）
1. **CLI 旗標** — 覆寫一切
2. **本機專案：** `.claude/settings.local.json`（個人，git 忽略）
3. **專案：** `.claude/settings.json`（共享，git 追蹤）
4. **使用者：** `~/.claude/settings.json`（全域）

### 設定中的權限
```json
{
  "permissions": {
    "allow": ["Bash(npm run lint:*)", "WebSearch", "Read"],
    "ask": ["Write(*.ts)", "Bash(git push*)"],
    "deny": ["Read(.env)", "Bash(rm -rf *)"]
  }
}
```

### 記憶檔（CLAUDE.md）層級
1. **全域：** `~/.claude/CLAUDE.md` — 適用於所有專案
2. **專案：** `./CLAUDE.md` — 專案專屬脈絡（git 追蹤）
3. **本機：** `.claude/CLAUDE.local.md` — 個人專案覆寫（git 忽略）

在互動模式中用 `#` 前綴快速加入記憶：`# Always use 2-space indentation`。

## 互動式會話：斜線指令

### 會話與脈絡
| 指令 | 用途 |
|---------|---------|
| `/help` | 顯示所有指令（含自訂與 MCP 指令） |
| `/compact [focus]` | 壓縮脈絡以節省 token；CLAUDE.md 會在壓縮後保留。例如：`/compact focus on auth logic` |
| `/clear` | 清除對話歷史以全新開始 |
| `/context` | 以彩色網格視覺化脈絡用量並提供最佳化建議 |
| `/cost` | 檢視 token 用量，含各模型與快取命中明細 |
| `/resume` | 切換或續接另一個會話 |
| `/rewind` | 回復到對話或程式碼的先前檢查點 |
| `/btw <question>` | 問一個額外問題而不增加脈絡成本 |
| `/status` | 顯示版本、連線狀態與會話資訊 |
| `/todos` | 列出對話中追蹤的行動項目 |
| `/exit` 或 `Ctrl+D` | 結束會話 |

### 開發與審查
| 指令 | 用途 |
|---------|---------|
| `/review` | 要求對目前變更進行程式碼審查 |
| `/security-review` | 對目前變更執行安全分析 |
| `/plan [description]` | 進入計畫模式並自動開始任務規劃 |
| `/loop [interval]` | 在會話內排程循環任務 |
| `/batch` | 為大型平行變更自動建立 worktree（5-30 個） |

### 組態與工具
| 指令 | 用途 |
|---------|---------|
| `/model [model]` | 會話中切換模型（用方向鍵調整 effort） |
| `/effort [level]` | 設定推理強度：`low`、`medium`、`high`、`xhigh` 或 `max` |
| `/init` | 建立用於專案記憶的 CLAUDE.md 檔案 |
| `/memory` | 開啟 CLAUDE.md 進行編輯 |
| `/config` | 開啟互動式設定組態 |
| `/permissions` | 檢視／更新工具權限 |
| `/agents` | 管理專精子代理 |
| `/mcp` | 用於管理 MCP 伺服器的互動式 UI |
| `/add-dir` | 新增額外工作目錄（對 monorepo 有用） |
| `/usage` | 顯示方案限制與速率限制狀態 |
| `/voice` | 啟用按住說話的語音模式（20 種語言；按住 Space 錄音，放開發送） |
| `/release-notes` | 版本發行說明的互動式選擇器 |

### 自訂斜線指令
建立 `.claude/commands/<name>.md`（專案共享）或 `~/.claude/commands/<name>.md`（個人）：

```markdown
# .claude/commands/deploy.md
Run the deploy pipeline:
1. Run all tests
2. Build the Docker image
3. Push to registry
4. Update the $ARGUMENTS environment (default: staging)
```

用法：`/deploy production` — `$ARGUMENTS` 會被使用者的輸入取代。

### 技能（自然語言呼叫）
與斜線指令（手動呼叫）不同，`.claude/skills/` 中的技能是 Claude 在任務符合時透過自然語言自動呼叫的 markdown 指南：

```markdown
# .claude/skills/database-migration.md
When asked to create or modify database migrations:
1. Use Alembic for migration generation
2. Always create a rollback function
3. Test migrations against a local database copy
```

## 互動式會話：鍵盤快速鍵

### 一般控制
| 按鍵 | 動作 |
|-----|--------|
| `Ctrl+C` | 取消目前的輸入或產生 |
| `Ctrl+D` | 結束會話 |
| `Ctrl+R` | 反向搜尋指令歷史 |
| `Ctrl+B` | 將執行中的任務放到背景 |
| `Ctrl+V` | 貼上圖片到對話 |
| `Ctrl+O` | 轉錄模式 — 查看 Claude 的思考過程 |
| `Ctrl+G` 或 `Ctrl+X Ctrl+E` | 在外部編輯器開啟提示 |
| `Esc Esc` | 回復對話或程式碼狀態／總結 |

### 模式切換
| 按鍵 | 動作 |
|-----|--------|
| `Shift+Tab` | 循環切換權限模式（Normal → Auto-Accept → Plan） |
| `Alt+P` | 切換模型 |
| `Alt+T` | 切換思考模式 |
| `Alt+O` | 切換快速模式 |

### 多行輸入
| 按鍵 | 動作 |
|-----|--------|
| `\` + `Enter` | 快速換行 |
| `Shift+Enter` | 換行（替代） |
| `Ctrl+J` | 換行（替代） |

### 輸入前綴
| 前綴 | 動作 |
|--------|--------|
| `!` | 直接執行 bash，繞過 AI（例如 `!npm test`）。單獨使用 `!` 可切換 shell 模式。 |
| `@` | 以自動完成參照檔案／目錄（例如 `@./src/api/`） |
| `#` | 快速加入 CLAUDE.md 記憶（例如 `# Use 2-space indentation`） |
| `/` | 斜線指令 |

### 專業提示：「ultrathink」
在提示中使用關鍵字「ultrathink」，可讓該輪達到最大推理強度。無論目前的 `/effort` 設定為何，都會觸發最深層的思考模式。

## PR 審查模式

### 快速審查（列印模式）
```
terminal(command="cd /path/to/repo && git diff main...feature-branch | claude -p 'Review this diff for bugs, security issues, and style problems. Be thorough.' --max-turns 1", timeout=60)
```

### 深度審查（互動式 + Worktree）
```
terminal(command="tmux new-session -d -s review -x 140 -y 40")
terminal(command="tmux send-keys -t review 'cd /path/to/repo && claude -w pr-review' Enter")
terminal(command="sleep 5 && tmux send-keys -t review Enter")  # Trust dialog
terminal(command="sleep 2 && tmux send-keys -t review 'Review all changes vs main. Check for bugs, security issues, race conditions, and missing tests.' Enter")
terminal(command="sleep 30 && tmux capture-pane -t review -p -S -60")
```

### 依編號審查 PR
```
terminal(command="claude -p 'Review this PR thoroughly' --from-pr 42 --max-turns 10", workdir="/path/to/repo", timeout=120)
```

### 搭配 tmux 的 Claude Worktree
```
terminal(command="claude -w feature-x --tmux", workdir="/path/to/repo")
```
在 `.claude/worktrees/feature-x` 建立隔離的 git worktree **以及**對應的 tmux 會話。可用時使用 iTerm2 原生窗格；若要傳統 tmux 請加 `--tmux=classic`。

## 平行 Claude 實例

同時執行多個獨立的 Claude 任務：

```
# Task 1: Fix backend
terminal(command="tmux new-session -d -s task1 -x 140 -y 40 && tmux send-keys -t task1 'cd ~/project && claude -p \"Fix the auth bug in src/auth.py\" --allowedTools \"Read,Edit\" --max-turns 10' Enter")

# Task 2: Write tests
terminal(command="tmux new-session -d -s task2 -x 140 -y 40 && tmux send-keys -t task2 'cd ~/project && claude -p \"Write integration tests for the API endpoints\" --allowedTools \"Read,Write,Bash\" --max-turns 15' Enter")

# Task 3: Update docs
terminal(command="tmux new-session -d -s task3 -x 140 -y 40 && tmux send-keys -t task3 'cd ~/project && claude -p \"Update README.md with the new API endpoints\" --allowedTools \"Read,Edit\" --max-turns 5' Enter")

# Monitor all
terminal(command="sleep 30 && for s in task1 task2 task3; do echo '=== '$s' ==='; tmux capture-pane -t $s -p -S -5 2>/dev/null; done")
```

## CLAUDE.md — 專案脈絡檔

Claude Code 會從專案根目錄自動載入 `CLAUDE.md`。用它來持久保存專案脈絡：

```markdown
# Project: My API

## Architecture
- FastAPI backend with SQLAlchemy ORM
- PostgreSQL database, Redis cache
- pytest for testing with 90% coverage target

## Key Commands
- `make test` — run full test suite
- `make lint` — ruff + mypy
- `make dev` — start dev server on :8000

## Code Standards
- Type hints on all public functions
- Docstrings in Google style
- 2-space indentation for YAML, 4-space for Python
- No wildcard imports
```

**要具體。**與其寫「寫好的程式碼」，不如寫「JS 使用 2 空格縮排」或「測試檔以 `.test.ts` 副檔名命名」。具體指示可省下反覆修正的循環。

### 規則目錄（模組化 CLAUDE.md）
對於規則很多的專案，改用規則目錄而非一個巨大的 CLAUDE.md：
- **專案規則：** `.claude/rules/*.md` — 團隊共享，git 追蹤
- **使用者規則：** `~/.claude/rules/*.md` — 個人，全域

規則目錄中的每個 `.md` 檔案都會作為額外脈絡載入。這比把所有東西塞進單一 CLAUDE.md 更乾淨。

### 自動記憶
Claude 會自動將學到的專案脈絡儲存在 `~/.claude/projects/<project>/memory/`。
- **上限：** 每個專案 25KB 或 200 行
- 這與 CLAUDE.md 分開 — 是 Claude 自己對專案的筆記，跨會話累積

## 自訂子代理

在 `.claude/agents/`（專案）、`~/.claude/agents/`（個人），或透過 `--agents` CLI 旗標（會話）定義專精代理：

### 代理位置優先順序
1. `.claude/agents/` — 專案層級，團隊共享
2. `--agents` CLI 旗標 — 會話專屬，動態
3. `~/.claude/agents/` — 使用者層級，個人

### 建立代理
```markdown
# .claude/agents/security-reviewer.md
---
name: security-reviewer
description: Security-focused code review
model: opus
tools: [Read, Bash]
---
You are a senior security engineer. Review code for:
- Injection vulnerabilities (SQL, XSS, command injection)
- Authentication/authorization flaws
- Secrets in code
- Unsafe deserialization
```

呼叫方式：`@security-reviewer review the auth module`

### 透過 CLI 動態建立代理
```
terminal(command="claude --agents '{\"reviewer\": {\"description\": \"Reviews code\", \"prompt\": \"You are a code reviewer focused on performance\"}}' -p 'Use @reviewer to check auth.py'", timeout=120)
```

Claude 可編排多個代理：「Use @db-expert to optimize queries, then @security to audit the changes.」

## Hooks — 事件上的自動化

在 `.claude/settings.json`（專案）或 `~/.claude/settings.json`（全域）設定：

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Write(*.py)",
      "hooks": [{"type": "command", "command": "ruff check --fix $CLAUDE_FILE_PATHS"}]
    }],
    "PreToolUse": [{
      "matcher": "Bash",
      "hooks": [{"type": "command", "command": "if echo \"$CLAUDE_TOOL_INPUT\" | grep -q 'rm -rf'; then echo 'Blocked!' && exit 2; fi"}]
    }],
    "Stop": [{
      "hooks": [{"type": "command", "command": "echo 'Claude finished a response' >> ~/.hermes/cache/scratch/claude-activity.log"}]
    }]
  }
}
```

### 全部 8 種 Hook 類型
| Hook | 觸發時機 | 常見用途 |
|------|--------------|------------|
| `UserPromptSubmit` | Claude 處理使用者提示之前 | 輸入驗證、日誌 |
| `PreToolUse` | 工具執行之前 | 安全閘道、封鎖危險指令（exit 2 = 封鎖） |
| `PostToolUse` | 工具完成之後 | 自動格式化程式碼、執行 linter |
| `Notification` | 權限請求或等待輸入時 | 桌面通知、警報 |
| `Stop` | Claude 完成回應時 | 完成日誌、狀態更新 |
| `SubagentStop` | 子代理完成時 | 代理編排 |
| `PreCompact` | 脈絡記憶被清除之前 | 備份會話轉錄 |
| `SessionStart` | 會話開始時 | 載入開發脈絡（例如 `git status`） |

### Hook 環境變數
| 變數 | 內容 |
|----------|---------|
| `CLAUDE_PROJECT_DIR` | 目前專案路徑 |
| `CLAUDE_FILE_PATHS` | 正在修改的檔案 |
| `CLAUDE_TOOL_INPUT` | 以 JSON 表示的工具參數 |

### 安全 Hook 範例
```json
{
  "PreToolUse": [{
    "matcher": "Bash",
    "hooks": [{"type": "command", "command": "if echo \"$CLAUDE_TOOL_INPUT\" | grep -qE 'rm -rf|git push.*--force|:(){ :|:& };:'; then echo 'Dangerous command blocked!' && exit 2; fi"}]
  }]
}
```

## MCP 整合

新增資料庫、API 與服務的外部工具伺服器：

```
# GitHub integration
terminal(command="claude mcp add -s user github -- npx @modelcontextprotocol/server-github", timeout=30)

# PostgreSQL queries
terminal(command="claude mcp add -s local postgres -- npx @anthropic-ai/server-postgres --connection-string postgresql://localhost/mydb", timeout=30)

# Puppeteer for web testing
terminal(command="claude mcp add puppeteer -- npx @anthropic-ai/server-puppeteer", timeout=30)
```

### MCP 作用域
| 旗標 | 範圍 | 儲存位置 |
|------|-------|---------|
| `-s user` | 全域（所有專案） | `~/.claude.json` |
| `-s local` | 此專案（個人） | `.claude/settings.local.json`（git 忽略） |
| `-s project` | 此專案（團隊共享） | `.claude/settings.json`（git 追蹤） |

### 列印／CI 模式中的 MCP
```
terminal(command="claude --bare -p 'Query database' --mcp-config mcp-servers.json --strict-mcp-config", timeout=60)
```
`--strict-mcp-config` 會忽略來自 `--mcp-config` 以外的所有 MCP 伺服器。

在聊天中參照 MCP 資源：`@github:issue://123`

### MCP 限制與調校
- **工具描述：** 每個伺服器的工具描述與伺服器指示上限 2KB
- **結果大小：** 預設有上限；使用 `maxResultSizeChars` 註解可允許最多 **500K** 字元以輸出大型內容
- **輸出 token：** `export MAX_MCP_OUTPUT_TOKENS=50000` — 限制 MCP 伺服器的輸出以防止脈絡氾濫
- **傳輸方式：** `stdio`（本機程序）、`http`（遠端）、`sse`（server-sent events）

## 監控互動式會話

### 讀取 TUI 狀態
```
# Periodic capture to check if Claude is still working or waiting for input
terminal(command="tmux capture-pane -t dev -p -S -10")
```

留意這些指標：
- 底部的 `❯` = 等待你的輸入（Claude 完成或在提問）
- `●` 列 = Claude 正在積極使用工具（讀取、寫入、執行命令）
- `⏵⏵ bypass permissions on` = 顯示權限模式的狀態列
- `◐ medium · /effort` = 狀態列中的目前 effort 等級
- `ctrl+o to expand` = 工具輸出被截斷（可互動展開）

### 脈絡視窗健康狀況
在互動模式中使用 `/context` 查看脈絡用量的彩色網格。關鍵門檻：
- **< 70%** — 正常運作，完整精度
- **70-85%** — 精度開始下降，考慮 `/compact`
- **> 85%** — 幻覺風險顯著升高，使用 `/compact` 或 `/clear`

## 環境變數

| 變數 | 效果 |
|----------|--------|
| `ANTHROPIC_API_KEY` | 用於驗證的 API 金鑰（OAuth 的替代） |
| `CLAUDE_CODE_EFFORT_LEVEL` | 預設 effort：`low`、`medium`、`high`、`max` 或 `auto` |
| `MAX_THINKING_TOKENS` | 限制思考 token（設為 `0` 可完全停用思考） |
| `MAX_MCP_OUTPUT_TOKENS` | 限制 MCP 伺服器的輸出（預設因情況而異；例如設為 `50000`） |
| `CLAUDE_CODE_NO_FLICKER=1` | 啟用 alt-screen 渲染以消除終端機閃爍 |
| `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB` | 為安全起見從子程序中剝除憑證 |

## 成本與效能提示

1. **在列印模式使用 `--max-turns`** 防止失控迴圈。多數任務從 5-10 開始。
2. **使用 `--max-budget-usd`** 設定成本上限。注意：建立系統提示快取最低約需 $0.05。
3. **簡單任務使用 `--effort low`**（更快、更便宜）。複雜推理用 `high` 或 `max`。
4. **CI／腳本使用 `--bare`** 以略過外掛／hook 偵測的開銷。
5. **使用 `--allowedTools`** 只限制到所需（例如審查只用 `Read`）。
6. **互動式會話中脈絡變大時使用 `/compact`**。
7. **需要分析已知內容時用管線輸入**，而非讓 Claude 讀取檔案。
8. **簡單任務用 `--model haiku`**（較便宜），複雜多步驟工作用 `--model opus`。
9. **列印模式使用 `--fallback-model haiku`** 以優雅處理模型過載。
10. **為不同任務開啟新會話** — 會話持續 5 小時；新鮮脈絡更有效率。
11. **CI 中使用 `--no-session-persistence`** 以避免在磁碟累積已儲存的會話。

## 常見陷阱與注意事項

1. **互動模式需要 tmux** — Claude Code 是完整的 TUI 應用。在 Hermes 終端機單獨使用 `pty=true` 可行，但 tmux 提供 `capture-pane` 監控與 `send-keys` 輸入，對編排至關重要。
2. **`--dangerously-skip-permissions` 警告對話框預設選「No, exit」** — 那個預設是安全答案；只有在你刻意於隔離環境選擇旁路時才送 Down 再 Enter。列印模式（`-p`）完全略過該對話框。
3. **`--max-budget-usd` 最低約 $0.05** — 僅建立系統提示快取就要花這麼多。設更低會立即報錯。
4. **`--max-turns` 僅限列印模式** — 在互動式會話中會被忽略。
5. **Claude 可能使用 `python` 而非 `python`** — 在沒有 `python` 符號連結的系統上，Claude 的 bash 指令第一次會失敗，但會自我修正。
6. **續接會話需要相同目錄** — `--continue` 會為目前工作目錄找最近的會話。
7. **`--json-schema` 需要足夠的 `--max-turns`** — Claude 必須先讀取檔案才能產生結構化輸出，這需要多輪。
8. **信任對話框每個目錄只出現一次** — 僅首次，之後會快取。
9. **背景 tmux 會話會持續存在** — 完成後務必用 `tmux kill-session -t <name>` 清理。
10. **斜線指令（如 `/commit`）只在互動模式有效** — 在 `-p` 模式請改以自然語言描述任務。
11. **`--bare` 略過 OAuth** — 需要 `ANTHROPIC_API_KEY` 環境變數或設定中的 `apiKeyHelper`。
12. **脈絡劣化是真的** — 脈絡視窗用量超過 70% 時，AI 輸出品質會可測地劣化。用 `/context` 監控並主動 `/compact`。

## Hermes 代理的規則

1. **單一任務優先用列印模式（`-p`）** — 更乾淨、無對話框處理、結構化輸出
2. **多輪互動工作用 tmux** — 編排 TUI 唯一可靠的方式
3. **始終設定 `workdir`** — 讓 Claude 專注在正確的專案目錄
4. **列印模式設定 `--max-turns`** — 防止無限迴圈與失控成本
5. **監控 tmux 會話** — 用 `tmux capture-pane -t <session> -p -S -50` 檢查進度
6. **留意 `❯` 提示** — 表示 Claude 正在等待輸入（完成或提問）
7. **清理 tmux 會話** — 完成後結束它們以避免資源洩漏
8. **向使用者回報結果** — 完成後總結 Claude 做了什麼、變更了什麼
9. **不要結束緩慢的會話** — Claude 可能在做多步驟工作；改為檢查進度
10. **使用 `--allowedTools`** — 將能力限制到任務真正需要的範圍
