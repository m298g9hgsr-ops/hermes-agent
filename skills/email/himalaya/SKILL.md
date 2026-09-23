---
name: himalaya
description: "Himalaya CLI：從終端執行 IMAP/SMTP 電子郵件."
version: 1.1.0
author: community
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Email, IMAP, SMTP, CLI, Communication]
    homepage: https://github.com/pimalaya/himalaya
prerequisites:
  commands: [himalaya]
---

# Himalaya Email CLI 技能

Himalaya 是一個 CLI 郵件客戶端，可讓你在終端中透過 IMAP、SMTP、Notmuch 或 Sendmail 後端管理電子郵件。

本技能與 Hermes 的 Email gateway 介接器（adapter）是不同的。gateway 介接器讓其他人可以寄信給代理，並使用 Hermes 內建的 IMAP/SMTP 介接器；本技能則是讓代理從終端工具操作信箱，且需要外部的 `himalaya` CLI。

## 參考資料

- `references/configuration.md`（設定檔配置 + IMAP/SMTP 驗證）
- `references/message-composition.md`（撰寫電子郵件的 MML 語法）

## 前置需求

1. 已安裝 Himalaya CLI（以 `himalaya --version` 驗證）
2. 在 `~/.config/himalaya/config.toml` 有設定檔
3. 已設定 IMAP/SMTP 憑證（密碼安全儲存）

### 安裝

```bash
# Pre-built binary (Linux/macOS — recommended)
curl -sSL https://raw.githubusercontent.com/pimalaya/himalaya/master/install.sh | PREFIX=~/.local sh

# macOS via Homebrew
brew install himalaya

# Or via cargo (any platform with Rust)
cargo install himalaya --locked
```

## 設定組態

執行互動式精靈以設定帳號：

```bash
himalaya account configure
```

或手動建立 `~/.config/himalaya/config.toml`：

```toml
[accounts.personal]
email = "you@example.com"
display-name = "Your Name"
default = true

backend.type = "imap"
backend.host = "imap.example.com"
backend.port = 993
backend.encryption.type = "tls"
backend.login = "you@example.com"
backend.auth.type = "password"
backend.auth.cmd = "pass show email/imap"  # or use keyring

message.send.backend.type = "smtp"
message.send.backend.host = "smtp.example.com"
message.send.backend.port = 587
message.send.backend.encryption.type = "start-tls"
message.send.backend.login = "you@example.com"
message.send.backend.auth.type = "password"
message.send.backend.auth.cmd = "pass show email/smtp"

# Folder aliases (himalaya v1.2.0+ syntax). Required whenever the
# server's folder names don't match himalaya's canonical names
# (inbox/sent/drafts/trash). Gmail is the common case — see
# `references/configuration.md` for the `[Gmail]/Sent Mail` mapping.
folder.aliases.inbox = "INBOX"
folder.aliases.sent = "Sent"
folder.aliases.drafts = "Drafts"
folder.aliases.trash = "Trash"
```

> **關於別名語法的提醒。** v1.2.0 之前的文件使用 `[accounts.NAME.folder.alias]` 子區段（單數 `alias`）。v1.2.0 會默默忽略這種寫法——TOML 可以正常解析，但別名解析器永遠不會讀取它，因此每次查詢都會退回使用標準名稱。在 Gmail 上，這表示 *SMTP 投遞成功之後*，儲存到「已寄出」會失敗，而 `himalaya message send` 會以非零狀態結束。任何依據該結束碼重試的呼叫端（代理、指令碼、使用者）都會重新執行整個傳送流程——包括 SMTP——導致收件人收到重複的郵件。請一律使用 `folder.aliases.X`（複數、點分隔的鍵，直接放在 `[accounts.NAME]` 之下）。

## Hermes 整合備註

- **讀取、列出、搜尋、移動、刪除**都可直接透過 `terminal` 工具完成
- **撰寫/回覆/轉寄**——建議使用管線輸入（`cat << EOF | himalaya template send`）以確保可靠性。互動式 `$EDITOR` 模式可搭配 `pty=true` + 背景 + `process` 工具運作，但你需要知道編輯器及其指令
- 使用 `--output json` 取得結構化輸出，方便程式化解析
- `himalaya account configure` 精靈需要互動式輸入——請使用 PTY 模式：`terminal(command="himalaya account configure", pty=true)`

## 常見操作

### 列出資料夾

```bash
himalaya folder list
```

### 列出郵件

列出 INBOX 中的郵件（預設）：

```bash
himalaya envelope list
```

列出特定資料夾中的郵件：

```bash
himalaya envelope list --folder "Sent"
```

使用分頁列出：

```bash
himalaya envelope list --page 1 --page-size 20
```

### 搜尋郵件

```bash
himalaya envelope list from john@example.com subject meeting
```

### 讀取郵件

依 ID 讀取郵件（顯示純文字）：

```bash
himalaya message read 42
```

匯出原始 MIME：

```bash
himalaya message export 42 --full
```

### 回覆郵件

若要從 Hermes 以非互動方式回覆，請讀取原始郵件、撰寫回覆內容，然後透過管線送出：

```bash
# Get the reply template, edit it, and send
himalaya template reply 42 | sed 's/^$/\nYour reply text here\n/' | himalaya template send
```

或手動組建回覆內容：

```bash
cat << 'EOF' | himalaya template send
From: you@example.com
To: sender@example.com
Subject: Re: Original Subject
In-Reply-To: <original-message-id>

Your reply here.
EOF
```

回覆所有人（互動式——需要 $EDITOR，請改用上述的 template 方式）：

```bash
himalaya message reply 42 --all
```

### 轉寄郵件

```bash
# Get forward template and pipe with modifications
himalaya template forward 42 | sed 's/^To:.*/To: newrecipient@example.com/' | himalaya template send
```

### 撰寫新郵件

**非互動式（從 Hermes 使用這種方式）**——透過 stdin 以管線傳入郵件內容：

```bash
cat << 'EOF' | himalaya template send
From: you@example.com
To: recipient@example.com
Subject: Test Message

Hello from Himalaya!
EOF
```

或搭配 headers 旗標：

```bash
himalaya message write -H "To:recipient@example.com" -H "Subject:Test" "Message body here"
```

備註：`himalaya message write` 沒有管線輸入時會開啟 `$EDITOR`。這可搭配 `pty=true` + 背景模式運作，但使用管線更簡單也更可靠。

### 移動/複製郵件

移動到資料夾（先指定目標資料夾，再接訊息 ID）：

```bash
himalaya message move "Archive" 42
```

複製到資料夾（先指定目標資料夾，再接訊息 ID）：

```bash
himalaya message copy "Important" 42
```

### 刪除郵件

```bash
himalaya message delete 42
```

### 管理旗標

新增旗標：

```bash
himalaya flag add 42 --flag seen
```

移除旗標：

```bash
himalaya flag remove 42 --flag seen
```

## 多個帳號

列出帳號：

```bash
himalaya account list
```

使用特定帳號：

```bash
himalaya --account work envelope list
```

## 附件

從郵件儲存附件：

```bash
himalaya attachment download 42
```

儲存到特定目錄：

```bash
himalaya attachment download 42 --downloads-dir ~/Downloads
```

## 輸出格式

大部分指令都支援 `--output` 以輸出結構化資料：

```bash
himalaya envelope list --output json
himalaya envelope list --output plain
```

## 除錯

啟用除錯紀錄：

```bash
RUST_LOG=debug himalaya envelope list
```

含回溯（backtrace）的完整追蹤：

```bash
RUST_LOG=trace RUST_BACKTRACE=1 himalaya envelope list
```

## 小技巧

- 使用 `himalaya --help` 或 `himalaya <command> --help` 取得詳細用法。
- 訊息 ID 是相對於目前資料夾的；更換資料夾後請重新列出。
- 若要撰寫含附件的豐富郵件，請使用 MML 語法（參見 `references/message-composition.md`）。
- 使用 `pass`、系統金鑰環（keyring）或會輸出密碼的指令來安全儲存密碼。
