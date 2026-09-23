---
name: hermes-agent
description: "使用、設定、主題、擴充與編排 Hermes Agent."
version: 3.2.0
author: Hermes Agent + Teknium
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hermes, setup, configuration, multi-agent, spawning, cli, gateway, bots, bot-mode, features, themes, skins, desktop-plugins, tui-widgets, petdex, development]
    homepage: https://github.com/NousResearch/hermes-agent
    related_skills: [claude-code, codex, opencode]
---

# Hermes Agent

Hermes Agent 是 Nous Research 開發的開源 AI 代理框架，可執行於終端機、原生桌面應用程式、訊息平台與 IDE 中。它與 Claude Code（Anthropic）、Codex（OpenAI）及 OpenClaw 屬同一類別——利用工具呼叫與系統互動的自主編碼與任務執行代理。Hermes 可搭配任何 LLM 供應商（OpenRouter、Anthropic、OpenAI、Google、DeepSeek、xAI、本地模型及其他 20 多家），並執行於 Linux、macOS、Windows 與 WSL。

Hermes 的不同之處：

- **透過技能自我改進** — Hermes 從經驗中學習，將可重複使用的程序儲存為技能，載入未來的會話。
- **跨會話的持久記憶** — 記得你的身分、偏好、環境細節與學到的教訓。記憶後端可插拔。
- **多平台閘道** — 同一個代理可執行於 Telegram、Discord、Slack、WhatsApp、iMessage、Signal、Matrix、Teams、Email 等十多個平台，擁有完整的工具存取，而不只是聊天。
- **多種介面** — 同一個代理核心驅動 CLI、Ink TUI、原生 Electron 桌面應用、Web 儀表板，以及供 IDE（VS Code / Zed / JetBrains）使用的 ACP 伺服器。
- **不綁定供應商** — 工作流程中隨時切換模型與供應商；憑證池會自動輪替多組 API 金鑰。
- **設定檔（Profiles）** — 以隔離的設定、會話、技能與記憶執行多個獨立的 Hermes 實例。
- **可擴充、可換膚** — 外掛、MCP 伺服器、自訂工具、Webhook 觸發、排程、可主題化所有介面的皮膚、桌面 UI 外掛、TUI 小工具與寵物吉祥物。

**本技能是一個樞紐。**本文涵蓋身分簡介、快速開始、產生／編排，以及嚴格不變原則。其餘內容都在參考檔中——**回答前先載入對應的參考檔（見下方）**；不要只憑本文回答細節問題。

**文件：** https://hermes-agent.nousresearch.com/docs/

## 範圍與驗證

本技能是精簡的操作指南，並非所有 Hermes 功能的完整事實來源。若某個 Hermes 功能、命令或設定未在此處或參考檔中提及，不要把該缺席當作它不存在的證據。在給出否定答案前，請查證實際儲存庫與官方文件。

良好的驗證目標，由成本最低者開始：

- **每個已發布功能各一行：https://hermes-agent.nousresearch.com/docs/llms.txt。**任何「Hermes 能不能做 X？」或「我該怎麼做 X？」都從這裡開始——它索引了整份文件集並連結到能回答的頁面。它在每次建置時從文件樹產生，因此永不落後於產品。用 `web_extract` 抓取，或在網路工具關閉時用 `curl -s https://hermes-agent.nousresearch.com/docs/llms.txt`。整份文件集的單一檔案位於 `/docs/llms-full.txt`。
- CLI 指令：`hermes --help`、`hermes <command> --help` 與 `hermes_cli/main.py`
- 原始碼樹：https://github.com/NousResearch/hermes-agent

絕不要憑記憶回答「Hermes 做不到」。Hermes 發布的功能遠多於本文所述，而索引的存在就是為了讓否定答案永遠可以被查證。

## 快速開始

```bash
# Install (shell installer — sets up uv, Python, the venv, and the launcher)
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Interactive chat (default surface; set display.interface: tui to launch the Ink TUI instead)
hermes

# Single query
hermes chat -q "What is the capital of France?"

# Setup wizard  /  pick model+provider  /  health check
hermes setup
hermes model
hermes doctor

# Other surfaces
hermes desktop                 # launch the native desktop app (alias: hermes gui)
hermes dashboard               # web admin panel + embedded chat
hermes proxy                   # OpenAI-compatible local proxy backed by your OAuth provider
```

## 關鍵路徑

```
~/.hermes/config.yaml       Main configuration (settings — never secrets)
~/.hermes/.env              API keys and secrets ONLY (under $HERMES_HOME if set)
$HERMES_HOME/skills/        Installed skills
~/.hermes/skins/            Custom themes (see references/themes.md)
~/.hermes/desktop-plugins/  Desktop app UI plugins (see references/desktop-plugins.md)
~/.hermes/tui-widgets/      TUI widget apps (see references/tui-widgets.md)
~/.hermes/pets/             Installed pet mascots (see references/petdex.md)
~/.hermes/state.db          Canonical session store (SQLite + FTS5)
~/.hermes/sessions/         Gateway routing index, request dumps, *.jsonl transcripts
~/.hermes/logs/             Gateway and error logs
~/.hermes/auth.json         OAuth tokens and credential pools
~/.hermes/hermes-agent/     Source code (if git-installed)
```

設定檔使用 `~/.hermes/profiles/<name>/`，結構相同。當設定檔啟用時，請從 `$HERMES_HOME` 解析真正的家目錄——絕不要硬編碼 `~/.hermes`。

## 路由表 — 載入任務對應的參考檔

| 使用者想要... | 載入 |
|---|---|
| **以下未列出的任何事——「Hermes 能做 X 嗎？」「怎麼設定 X？」** | **https://hermes-agent.nousresearch.com/docs/llms.txt** |
| 會聊天、執行例行任務或互相傳訊的機器人；Bots 分頁 | docs: `/user-guide/bot-mode` |
| CLI 指令、子命令、旗標、「怎麼執行 X」 | `references/cli-reference.md` |
| 會話中的斜線指令 | `references/slash-commands.md` |
| 供應商設定、API 金鑰、OAuth | `references/providers-and-models.md` |
| config.yaml 區段、工具集、語音/STT/TTS | `references/configuration.md` |
| AGENTS.md / .hermes.md / CLAUDE.md 專案規則 | `references/project-context-files.md` |
| 機密遮蔽、PII、核准模式、「重設權限」 | `references/security-privacy.md` |
| 委派、cron、curator、kanban | `references/background-systems.md` |
| MCP 伺服器（新增、目錄、`hermes mcp`） | `references/native-mcp.md` |
| Webhook 路由與事件驅動執行 | `references/webhooks.md` |
| 自訂主題／皮膚（「synthwave 主題」「改掉金色 ●」） | `references/themes.md` + `templates/skin.yaml` |
| 桌面應用 UI 元素（窗格、小工具、⌘K 指令、頁面） | `references/desktop-plugins.md` + `templates/plugin.js` |
| 即時 TUI 面板或模態小工具（報價、時鐘、儀表板） | `references/tui-widgets.md` + `templates/clock.mjs` |
| 寵物吉祥物 — 安裝、選擇、縮放、診斷 | `references/petdex.md` |
| Windows 專屬問題（按鍵綁定、WinError 10106、BOM） | `references/windows-quirks.md` |
| 疑難排解：語音、工具遺失、閘道、輔助模型 | `references/troubleshooting.md` |
| 貢獻程式碼：新增工具、斜線指令、測試 | `references/contributor-guide.md` |
| delegate_task「capped at N」回報 | `references/delegate-task-concurrency-diagnosis.md` |
| 「應用 X 能用我的 Nous Portal 訂閱／OAuth 嗎？」 | `references/portal-auth-for-third-party-apps.md` |
| 連接訊息平台（Telegram、Discord、Slack、WhatsApp、…） | docs: `/user-guide/messaging` |

上方的參考清單不是功能清單——它只是那些需要比其文件頁更多說明的主題。對於 Hermes 發布的其他一切，抓取 `llms.txt`，它會把問題對應到能回答的頁面。

即使不載入參考檔也成立的兩條主題規則：**皮膚由你自己套用**（`hermes config set display.skin <name>` — 每個介面都會在約一秒內即時重繪；別叫使用者執行 `/skin`），以及**要調整單一顏色，請編輯啟用中的皮膚**（`hermes skin set <key> <hex>`）— 絕不要複製分叉 `default`，那會丟掉色盤並重設背景。

## 產生額外的 Hermes 實例

將額外的 Hermes 程序作為完全獨立的子程序執行——各自擁有獨立的會話、工具與環境。

### 何時使用此方式 vs delegate_task

| | `delegate_task` | 產生 `hermes` 程序 |
|-|-----------------|--------------------------|
| 隔離性 | 獨立對話、共享程序 | 完全獨立的程序 |
| 持續時間 | 數分鐘（受父迴圈限制） | 數小時／數天 |
| 工具存取 | 父代理工具的子集 | 完整工具存取 |
| 互動式 | 否 | 是（PTY 模式） |
| 使用情境 | 快速的平行子任務 | 長時間自主任務 |

### 單次模式

```
terminal(command="hermes chat -q 'Research GRPO papers and write summary to ~/research/grpo.md'", timeout=300)

# Background for long tasks:
terminal(command="hermes chat -q 'Set up CI/CD for ~/myapp'", background=true)
```

### 互動式 PTY 模式（透過 tmux）

Hermes 使用 prompt_toolkit，需要真實終端機。用 tmux 進行互動式產生：

```
# Start
terminal(command="tmux new-session -d -s agent1 -x 120 -y 40 'hermes'", timeout=10)

# Wait for startup, then send a message
terminal(command="sleep 8 && tmux send-keys -t agent1 'Build a FastAPI auth service' Enter", timeout=15)

# Read output
terminal(command="sleep 20 && tmux capture-pane -t agent1 -p", timeout=5)

# Send follow-up
terminal(command="tmux send-keys -t agent1 'Add rate limiting middleware' Enter", timeout=5)

# Exit
terminal(command="tmux send-keys -t agent1 '/exit' Enter && sleep 2 && tmux kill-session -t agent1", timeout=10)
```

### 多代理協作

```
# Agent A: backend
terminal(command="tmux new-session -d -s backend -x 120 -y 40 'hermes -w'", timeout=10)
terminal(command="sleep 8 && tmux send-keys -t backend 'Build REST API for user management' Enter", timeout=15)

# Agent B: frontend
terminal(command="tmux new-session -d -s frontend -x 120 -y 40 'hermes -w'", timeout=10)
terminal(command="sleep 8 && tmux send-keys -t frontend 'Build React dashboard for user management' Enter", timeout=15)

# Check progress, relay context between them
terminal(command="tmux capture-pane -t backend -p | tail -30", timeout=5)
terminal(command="tmux send-keys -t frontend 'Here is the API schema from the backend agent: ...' Enter", timeout=5)
```

### 會話續接

```
# Resume most recent session
terminal(command="tmux new-session -d -s resumed 'hermes --continue'", timeout=10)

# Resume specific session
terminal(command="tmux new-session -d -s resumed 'hermes --resume 20260225_143052_a1b2c3'", timeout=10)
```

### 技巧

- **快速子任務優先用 `delegate_task`** — 比產生完整程序的開銷低
- **產生會編輯程式碼的代理時使用 `-w`（worktree 模式）** — 避免 git 衝突
- **為單次模式設定逾時** — 複雜任務可能需要 5-10 分鐘
- **發射後即可不管的任務用 `hermes chat -q`** — 不需要 PTY
- **互動式會話用 tmux** — 原始 PTY 模式在 prompt_toolkit 下有 `\r` 與 `\n` 的問題
- **排程任務**請用 `cronjob` 工具而非產生程序 — 它處理送達與重試
- **「delegate_task is capped at N」回報** — 見 `references/delegate-task-concurrency-diagnosis.md`。Hermes 有三條真實的上限路徑；若都未觸發，則是模型自我限制並將其合理化為「執行環境的上限」。
- **「$external_app 能用我的 Nous Portal 訂閱／OAuth 嗎？」** — 見 `references/portal-auth-for-third-party-apps.md`。帶使用者走過三個層面（外掛 vs 應用、Portal 實際暴露什麼、local-broker-proxy 選項）。

## 介面（快速導覽）

- **桌面應用**（`hermes desktop` / `hermes gui`）— 適用 macOS/Linux/Windows 的原生 Electron 應用：串流聊天、會話清單、Cmd+K 指令面板、拖放檔案、原生通知、依設定檔的遠端閘道登入。用 UI 外掛擴充它 — `references/desktop-plugins.md`。
- **Web 儀表板**（`hermes dashboard`）— 完整管理面板：訊息通道、MCP 目錄、Webhook、記憶、設定檔產生器，加上內嵌的 `hermes --tui` 聊天。以 OAuth／權杖閘道保護。
- **Ink TUI**（`hermes --tui` 或 `display.interface: tui`）— 搭載停靠式小工具應用的終端機 UI — `references/tui-widgets.md`。
- **OpenAI 相容代理**（`hermes proxy`）— 由你已登入的 OAuth 供應商支援的本機 OpenAI API。將 Codex CLI、Aider、Cline 或任何腳本指向它 — 不需 API 金鑰。

## 嚴格不變原則（無論載入了什麼都絕不違反）

- **絕不破壞提示快取** — 不要在對話中途變更既往脈絡、工具集或系統提示。唯一例外是脈絡壓縮。
- **訊息角色交替** — 絕不連續兩則 assistant 或兩則 user 訊息；只有 `tool` 結果可以重複。
- **機密放 `.env`，設定放 `config.yaml`** — 絕不要叫使用者把非憑證設定放進 `.env`。
- **設定檔安全路徑** — 程式碼用 `get_hermes_home()`，會話中解析路徑用 `$HERMES_HOME`。
- **絕不替使用者手動編輯 `config.yaml`** — 用 `hermes config set KEY VAL`；一個多餘的縮排就可能損毀檔案並弄壞執行中的閘道。
