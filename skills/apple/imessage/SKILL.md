---
name: imessage
description: "透過 macOS 的 imsg CLI 收發 iMessage 與 SMS."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [macos]
metadata:
  hermes:
    tags: [iMessage, SMS, messaging, macOS, Apple]
prerequisites:
  commands: [imsg]
---

# iMessage 技能

使用 `imsg` 透過 macOS 的 Messages.app 讀取與傳送 iMessage/SMS。

## 前置需求

- **macOS** 且已登入 Messages.app
- 安裝：`brew install steipete/tap/imsg`
- 授予終端完整磁碟存取權限（系統設定 → 隱私權與安全性 → 完整磁碟存取權限）
- 出現提示時，授予 Messages.app 自動化（Automation）權限

## 使用時機

- 使用者要求傳送 iMessage 或文字簡訊
- 讀取 iMessage 對話紀錄
- 查看 Messages.app 最近的對話
- 傳送訊息給電話號碼或 Apple ID

## 不適用時機

- Telegram/Discord/Slack/WhatsApp 訊息 → 請使用適當的 gateway 頻道
- 群組聊天管理（新增/移除成員）→ 不支援
- 大量發送訊息 → 務必先取得使用者確認

## 快速參考

### 列出對話

```bash
imsg chats --limit 10 --json
```

### 檢視歷史紀錄

```bash
# By chat ID
imsg history --chat-id 1 --limit 20 --json

# With attachments info
imsg history --chat-id 1 --limit 20 --attachments --json
```

### 傳送訊息

```bash
# Text only
imsg send --to "+14155551212" --text "Hello!"

# With attachment
imsg send --to "+14155551212" --text "Check this out" --file /path/to/image.jpg

# Force iMessage or SMS
imsg send --to "+14155551212" --text "Hi" --service imessage
imsg send --to "+14155551212" --text "Hi" --service sms
```

### 監看新訊息

```bash
imsg watch --chat-id 1 --attachments
```

## 服務選項

- `--service imessage` — 強制使用 iMessage（需要收件人也具備 iMessage）
- `--service sms` — 強制使用 SMS（綠色泡泡）
- `--service auto` — 由 Messages.app 自行決定（預設）

## 規則

1. **傳送前務必確認收件人與訊息內容**
2. **未經使用者明確同意，絕不傳送給未知號碼**
3. **附加檔案前先確認檔案路徑存在**
4. **不要濫發**——自行限制發送頻率

## 範例流程

使用者：「傳簡訊給媽媽說我會晚到」

```bash
# 1. Find mom's chat
imsg chats --limit 20 --json | jq '.[] | select(.displayName | contains("Mom"))'

# 2. Confirm with user: "Found Mom at +1555123456. Send 'I'll be late' via iMessage?"

# 3. Send after confirmation
imsg send --to "+1555123456" --text "I'll be late"
```
