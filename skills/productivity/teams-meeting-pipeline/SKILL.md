---
name: teams-meeting-pipeline
description: Teams 會議摘要、作業重放與 Graph 訂閱管理.
version: 1.1.0
author: Hermes Agent + Teknium
license: MIT
platforms: [linux, macos, windows]
prerequisites:
  env_vars: [MSGRAPH_TENANT_ID, MSGRAPH_CLIENT_ID, MSGRAPH_CLIENT_SECRET]
  commands: [hermes]
metadata:
  hermes:
    tags: [Teams, Microsoft Graph, Meetings, Productivity, Operations]
    # Channel-gated: this pipeline only makes sense on the Teams gateway
    # channel (and in cron jobs, where its scheduled summary/replay work
    # actually runs). Hidden from every other session's skills index.
    session_platforms: [teams, cron]
    related_docs:
      - /docs/guides/microsoft-graph-app-registration
      - /docs/user-guide/messaging/teams-meetings
      - /docs/guides/operate-teams-meeting-pipeline
---

# Teams 會議管線

只要使用者詢問 Microsoft Teams 會議摘要、逐字稿、錄影、行動項目、Graph 訂閱，或任何關於 Teams 會議管線的營運問題，就使用本技能。任何語言皆可——下方觸發詞只是範例，並非完整清單。

所有面向操作員的功能都是透過 terminal 工具執行的 `hermes teams-pipeline` 子指令。此管線沒有新的模型工具——CLI 就是介面。

## 何時使用本技能

使用者想要：
- 摘要 Teams 會議／萃取行動項目／取得會議紀錄
- 檢查管線狀態、檢視已儲存的會議作業，或查看近期會議
- 重放／重新執行失敗或需要重新摘要的已儲存作業
- 在變更環境變數或設定後驗證 Microsoft Graph 設定
- 排解「會議摘要從未送達」或「沒有新會議被匯入」的問題
- 管理 Graph webhook 訂閱（建立、續約、刪除、檢視）
- 設定自動訂閱續約（見下方陷阱）

多語觸發詞範例（並非完整清單）：
- 英文："summarize the Teams meeting"、"pipeline status"、"replay job X"
- 土耳其文："Teams meeting özetle"、"action item çıkar"、"toplantı notu"、"pipeline durumu"、"replay job"

## 前置需求

使用管線前，先確認以下項目已設在 `${HERMES_HOME:-~/.hermes}/.env`：

```bash
MSGRAPH_TENANT_ID=...
MSGRAPH_CLIENT_ID=...
MSGRAPH_CLIENT_SECRET=...
```

若有遺漏，請引導使用者參閱位於 `/docs/guides/microsoft-graph-app-registration` 的 Azure 應用程式註冊指南——管線運作前，他們需要完成 Azure AD 應用程式註冊並取得管理員同意的 Graph 應用程式權限。

## 指令參考

### 狀態與檢視（從這裡開始）

```bash
hermes teams-pipeline validate              # config snapshot — run first after any change
hermes teams-pipeline token-health          # Graph token status
hermes teams-pipeline token-health --force-refresh   # force a fresh token acquisition
hermes teams-pipeline list                  # recent meeting jobs
hermes teams-pipeline list --status failed  # only failed jobs
hermes teams-pipeline show <job-id>         # full detail of one job
hermes teams-pipeline subscriptions         # current Graph webhook subscriptions
```

### 重新執行／除錯

```bash
hermes teams-pipeline run <job-id>          # replay a stored job (re-summarize, re-deliver)
hermes teams-pipeline fetch --meeting-id <id>   # dry-run: resolve meeting + transcript without persisting
hermes teams-pipeline fetch --join-web-url "<url>"   # dry-run by join URL
hermes teams-pipeline fetch --join-web-url "<url>" --organizer-user-id <id>   # organizer-scoped lookup (required for /meet/ short URLs)
```

### 訂閱管理

```bash
hermes teams-pipeline subscribe \
  --resource communications/onlineMeetings/getAllTranscripts \
  --notification-url https://<your-public-host>/msgraph/webhook \
  --client-state "$MSGRAPH_WEBHOOK_CLIENT_STATE"

hermes teams-pipeline renew-subscription <sub-id> --expiration <iso-8601>
hermes teams-pipeline delete-subscription <sub-id>
hermes teams-pipeline maintain-subscriptions            # renew near-expiry ones
hermes teams-pipeline maintain-subscriptions --dry-run  # show what would be renewed
```

## 常見請求的決策樹

- 使用者問「為什麼我今天會議的摘要沒送來？」→ 先 `list --status failed`，再對相關列執行 `show <job-id>`。若該作業根本不存在，檢查 `subscriptions`——webhook 可能已過期（見下方陷阱）。
- 使用者問「設定正常嗎？」→ `validate`，然後 `token-health`，然後 `subscriptions`。三者都通過的話，請對方開一個測試會議，再檢查 `list` 是否出現新列。
- 使用者說「重新執行會議 X 的摘要」→ 用 `list` 找出作業 ID，再 `run <job-id>` 重放。若再次失敗，用 `show <job-id>` 檢視錯誤，並用 `fetch --meeting-id` 乾跑驗證產物解析。
- 使用者說「把會議 X 加入管線」→ 通常不需要——管線由訂閱驅動，不逐會議處理。若他們想摘要某場過去的會議，用 `fetch` 取得逐字稿，待作業建立後再 `run`。

## 關鍵陷阱：Graph 訂閱 72 小時後過期

Microsoft Graph 將 webhook 訂閱上限設為 72 小時，且**不會自動續約**。若未排程 `maintain-subscriptions`，任何手動建立的訂閱在 3 天後，會議通知就會默默停止送達。

當使用者回報「管線昨天還好好的，今天卻什麼都沒來」：
1. 執行 `hermes teams-pipeline subscriptions` ——若為空，或所有條目的 `expirationDateTime` 都已過期，那就是原因。
2. 依上所示用 `subscribe` 重建。
3. **立即透過** `hermes cron add`、systemd timer 或一般 crontab **設定自動續約**。操作手冊 `/docs/guides/operate-teams-meeting-pipeline#automating-subscription-renewal-required-for-production` 有完整三種選項。12 小時間隔是安全的（對 72 小時上限有 6 倍餘裕）。

## 其他陷阱

- **逐字稿尚未就緒。** 會議結束後 Teams 需要一些時間產生逐字稿產物。對剛結束的會議執行 `fetch --meeting-id` 可能回傳空結果。等待 2-5 分鐘後重試，或讓 Graph webhook 自然驅動匯入。
- **傳送模式不符。** 若摘要已產出（`list` 顯示 success）卻沒有進入 Teams，檢查 `platforms.teams.extra.delivery_mode` 與對應的目標設定（`incoming_webhook_url` 或 `chat_id` 或 `team_id`＋`channel_id`）。寫入器會從 config.yaml 或 `TEAMS_*` 環境變數讀取這些設定。
- **Graph 應用程式權限。** 權杖取得正常（`token-health` 通過），但 Graph API 呼叫回傳 401/403，通常是新增權限後未重新取得管理員同意。請使用者回到 Azure 入口網站的應用程式註冊，再次點選「Grant admin consent」。

## 相關文件

當本技能涵蓋的深度不足時，請指引使用者參閱：
- Azure 應用程式註冊步驟：`/docs/guides/microsoft-graph-app-registration`
- 完整管線設定：`/docs/user-guide/messaging/teams-meetings`
- 操作手冊（續約自動化、排錯、上線檢查清單）：`/docs/guides/operate-teams-meeting-pipeline`
- Webhook 監聽器設定：`/docs/user-guide/messaging/msgraph-webhook`
