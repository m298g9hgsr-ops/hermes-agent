---
name: google-workspace
description: 透過 gws CLI 或 Python 存取 Gmail、日曆、雲端硬碟等.
version: 1.2.0
author: Nous Research
license: MIT
platforms: [linux, macos, windows]
required_credential_files:
  - path: google_token.json
    description: Google OAuth2 token (created by setup script)
  - path: google_client_secret.json
    description: Google OAuth2 client credentials (downloaded from Google Cloud Console)
metadata:
  hermes:
    tags: [Google, Gmail, Calendar, Drive, Sheets, Docs, Contacts, Email, OAuth]
    homepage: https://github.com/NousResearch/hermes-agent
    related_skills: [himalaya]
---

# Google Workspace

Gmail、Calendar、Drive、Contacts、Sheets 與 Docs——透過 Hermes 管理的
OAuth 與薄型 CLI 包裝程式存取。當 `gws` 已安裝時，本技能以它作為執行
後端以獲得更完整的 Google Workspace 覆蓋；否則退回內建的 Python 客戶端
實作。

## 參考文件

- `references/gmail-search-syntax.md` — Gmail 搜尋運算子（is:unread、from:、newer_than: 等）
- `references/daily-brief.md` — 每日／晨間簡報程序：排程＋衝突＋會議準備＋來自 Gmail 與 Calendar 的緊急郵件。當使用者要求晨間簡報、會議準備，或問「我的行事曆上有什麼、哪些郵件需要處理」時載入。

## 腳本

- `scripts/setup.py` — OAuth2 設定（執行一次完成授權）
- `scripts/google_api.py` — 相容性包裝 CLI。可用時優先採用 `gws`，同時保留 Hermes 既有的 JSON 輸出合約。

## 首次設定

設定完全非互動——由你逐步驅動，確保在 CLI、Telegram、Discord 或任何平台都能運作。

先定義簡寫：

```bash
GSETUP="python ${HERMES_HOME:-$HOME/.hermes}/skills/productivity/google-workspace/scripts/setup.py"
```

### 步驟 0：檢查是否已設定

```bash
$GSETUP --check
```

若輸出 `AUTHENTICATED`，直接跳到「使用方式」——設定已完成。

### 步驟 1：分診——詢問使用者需要什麼

開始 OAuth 設定前，先問使用者兩個問題：

**問題 1：「你需要哪些 Google 服務？只要電子郵件，還是也要 Calendar/Drive/Sheets/Docs？」**

- **只要電子郵件** → 他們根本不需要本技能。改用 `himalaya` 技能——它可用 Gmail 應用程式密碼（設定 → 安全性 → 應用程式密碼）運作，兩分鐘完成設定，不需要 Google Cloud 專案。載入 himalaya 技能並依其設定說明操作。

- **電子郵件＋Calendar** → 繼續使用本技能，但授權時加上 `--services email,calendar`，讓同意畫面只詢問他們實際需要的範圍。

- **只要 Calendar/Drive/Sheets/Docs** → 繼續使用本技能，並採用較窄的 `--services` 組合，例如 `calendar,drive,sheets,docs`。

- **完整 Workspace 存取** → 繼續使用本技能並採用預設的 `all` 服務組合。

**問題 2：「你的 Google 帳號有啟用 Advanced Protection（登入需硬體安全金鑰）嗎？不確定的話大概就是沒有——這是需要主動報名的服務。」**

- **否／不確定** → 正常設定，繼續下一步。
- **是** → 他們的 Workspace 管理員必須先將該 OAuth 用戶端 ID 加入組織的允許應用清單，步驟 4 才會成功。請事先告知。

### 步驟 2：建立 OAuth 憑證（一次性，約 5 分鐘）

告訴使用者：

> 你需要一個 Google Cloud OAuth 用戶端。這是一次性設定：
>
> 1. 建立或選擇專案：
>    https://console.cloud.google.com/projectselector2/home/dashboard
> 2. 在 API Library 啟用所需 API：
>    https://console.cloud.google.com/apis/library
>    啟用：Gmail API、Google Calendar API、Google Drive API、
>    Google Sheets API、Google Docs API、People API
> 3. 在此建立 OAuth 用戶端：
>    https://console.cloud.google.com/apis/credentials
>    Credentials → Create Credentials → OAuth 2.0 Client ID
> 4. 應用程式類型：「Desktop app」→ Create
> 5. 若應用程式仍處於 Testing，將使用者的 Google 帳號加入測試使用者：
>    https://console.cloud.google.com/auth/audience
>    Audience → Test users → Add users
> 6. 下載 JSON 檔並告訴我檔案路徑
>
> 重要的 Hermes CLI 注意事項：若檔案路徑以 `/` 開頭，不要在 CLI 中把
> 裸路徑當成單獨一則訊息送出，否則可能被誤判為斜線指令。請把它放在
> 一句話裡送出，例如：
> `The JSON file path is: ~/Downloads/client_secret_....json`

對方提供路徑後：

```bash
$GSETUP --client-secret /path/to/client_secret.json
```

若對方貼的是原始用戶端 ID／用戶端機密值而非檔案路徑，請你自行寫出
有效的 Desktop OAuth JSON 檔，存到明確位置（例如
`~/Downloads/hermes-google-client-secret.json`），再對該檔執行
`--client-secret`。

### 步驟 3：取得授權 URL

使用步驟 1 選擇的服務組合。範例：

```bash
$GSETUP --auth-url --services email,calendar --format json
$GSETUP --auth-url --services calendar,drive,sheets,docs --format json
$GSETUP --auth-url --services all --format json
```

這會回傳含 `auth_url` 欄位的 JSON，並同時把精確 URL 存到
`~/.hermes/google_oauth_last_url.txt`。

此步驟的 agent 規則：
- 取出 `auth_url` 欄位，將該精確 URL 以單行傳給使用者。
- 告知使用者核准後瀏覽器很可能在 `http://localhost:1` 顯示失敗，這是預期行為。
- 請他們從瀏覽器網址列複製**整個**重新導向後的 URL。
- 若使用者遇到 `Error 403: access_denied`，直接請他們到
  `https://console.cloud.google.com/auth/audience` 把自己加為測試使用者。

### 步驟 4：交換授權碼

使用者會貼回 `http://localhost:1/?code=4/0A...&scope=...` 這類 URL，
或只貼授權碼字串，兩者皆可。`--auth-url` 步驟會在本機暫存待完成的
OAuth session，使 `--auth-code` 事後仍能完成 PKCE 交換，即使在無頭
系統上也行：

```bash
$GSETUP --auth-code "THE_URL_OR_CODE_THE_USER_PASTED" --format json
```

若 `--auth-code` 因授權碼過期、已被使用，或來自較舊的瀏覽器分頁而失敗，
它現在會回傳新的 `fresh_auth_url`。此時立即把新 URL 傳給使用者，
請他們只用最新的瀏覽器重新導向重試。

### 步驟 5：驗證

```bash
$GSETUP --check
```

應輸出 `AUTHENTICATED`。設定完成——從此之後 token 會自動更新。

### 注意事項

- Token 存於 `~/.hermes/google_token.json` 並自動更新。
- 待完成的 OAuth session 狀態／verifier 暫存於
  `~/.hermes/google_oauth_pending.json`，直到交換完成。
- 若安裝了 `gws`，`google_api.py` 會指向同一個
  `~/.hermes/google_token.json` 憑證檔。使用者不需要另外執行
  `gws auth login` 流程。
- 要撤銷：`$GSETUP --revoke`

## 使用方式

所有指令都透過 API 腳本執行。設定 `GAPI` 作為簡寫：

```bash
GAPI="python ${HERMES_HOME:-$HOME/.hermes}/skills/productivity/google-workspace/scripts/google_api.py"
```

### Gmail

```bash
# Search (returns JSON array with id, from, subject, date, snippet)
$GAPI gmail search "is:unread" --max 10
$GAPI gmail search "from:boss@company.com newer_than:1d"
$GAPI gmail search "has:attachment filename:pdf newer_than:7d"

# Read full message (returns JSON with body text)
$GAPI gmail get MESSAGE_ID

# Send
$GAPI gmail send --to user@example.com --subject "Hello" --body "Message text"
$GAPI gmail send --to user@example.com --subject "Report" --body "<h1>Q4</h1><p>Details...</p>" --html
$GAPI gmail send --to user@example.com --subject "Hello" --from '"Research Agent" <user@example.com>' --body "Message text"

# Reply (automatically threads and sets In-Reply-To)
$GAPI gmail reply MESSAGE_ID --body "Thanks, that works for me."
$GAPI gmail reply MESSAGE_ID --from '"Support Bot" <user@example.com>' --body "Thanks"

# Labels
$GAPI gmail labels
$GAPI gmail modify MESSAGE_ID --add-labels LABEL_ID
$GAPI gmail modify MESSAGE_ID --remove-labels UNREAD
```

### Calendar

```bash
# List events (defaults to next 7 days)
$GAPI calendar list
$GAPI calendar list --start 2026-03-01T00:00:00Z --end 2026-03-07T23:59:59Z

# Create event (ISO 8601 with timezone required)
$GAPI calendar create --summary "Team Standup" --start 2026-03-01T10:00:00-06:00 --end 2026-03-01T10:30:00-06:00
$GAPI calendar create --summary "Lunch" --start 2026-03-01T12:00:00Z --end 2026-03-01T13:00:00Z --location "Cafe"
$GAPI calendar create --summary "Review" --start 2026-03-01T14:00:00Z --end 2026-03-01T15:00:00Z --attendees "alice@co.com,bob@co.com"

# Delete event
$GAPI calendar delete EVENT_ID
```

### Drive

```bash
# Search existing files
$GAPI drive search "quarterly report" --max 10
$GAPI drive search "mimeType='application/pdf'" --raw-query --max 5

# Get metadata for a single file
$GAPI drive get FILE_ID

# Upload a local file (auto-detects MIME type)
$GAPI drive upload /path/to/report.pdf
$GAPI drive upload /path/to/image.png --name "Logo.png" --parent FOLDER_ID

# Download (binary files download as-is; Google-native files export to a
# sensible default — Docs→pdf, Sheets→csv, Slides→pdf, Drawings→png)
$GAPI drive download FILE_ID
$GAPI drive download DOC_ID --output ~/doc.pdf
$GAPI drive download DOC_ID --export-mime text/plain --output ~/doc.txt

# Create a folder
$GAPI drive create-folder "Reports"
$GAPI drive create-folder "Q4" --parent FOLDER_ID

# Share
$GAPI drive share FILE_ID --email alice@example.com --role reader
$GAPI drive share FILE_ID --email alice@example.com --role writer --notify
$GAPI drive share FILE_ID --type anyone --role reader        # anyone with link
$GAPI drive share FILE_ID --type domain --domain example.com --role reader

# Delete — defaults to trash (reversible). Use --permanent to skip the trash.
$GAPI drive delete FILE_ID
$GAPI drive delete FILE_ID --permanent
```

### Contacts

```bash
$GAPI contacts list --max 20
```

### Sheets

```bash
# Create a new spreadsheet
$GAPI sheets create --title "Q4 Budget"
$GAPI sheets create --title "Inventory" --sheet-name "Stock"

# Read
$GAPI sheets get SHEET_ID "Sheet1!A1:D10"

# Write
$GAPI sheets update SHEET_ID "Sheet1!A1:B2" --values '[["Name","Score"],["Alice","95"]]'

# Append rows
$GAPI sheets append SHEET_ID "Sheet1!A:C" --values '[["new","row","data"]]'
```

### Docs

```bash
# Read (a tabbed Doc returns a "tabs" array; single-tab and legacy Docs also return "body")
$GAPI docs get DOC_ID
$GAPI docs get DOC_ID --tab TAB_ID     # read one tab of a tabbed Doc

# Create a new Doc (optionally seeded with body text)
$GAPI docs create --title "Meeting Notes"
$GAPI docs create --title "Draft" --body "First paragraph..."

# Append text to the end of an existing Doc
$GAPI docs append DOC_ID --text "Additional content to append"
$GAPI docs append DOC_ID --tab TAB_ID --text "..."   # --tab required when the Doc has multiple tabs
```

## 輸出格式

所有指令皆回傳 JSON。可用 `jq` 解析或直接讀取。關鍵欄位：

- **Gmail search**：`[{id, threadId, from, to, subject, date, snippet, labels}]`
- **Gmail get**：`{id, threadId, from, to, subject, date, labels, body}`
- **Gmail send/reply**：`{status: "sent", id, threadId}`
- **Calendar list**：`[{id, summary, start, end, location, description, htmlLink}]`
- **Calendar create**：`{status: "created", id, summary, htmlLink}`
- **Drive search**：`[{id, name, mimeType, modifiedTime, webViewLink}]`
- **Drive get**：`{id, name, mimeType, modifiedTime, size, webViewLink, parents, owners}`
- **Drive upload**：`{status: "uploaded", id, name, mimeType, webViewLink}`
- **Drive download**：`{status: "downloaded", id, name, path, mimeType}`
- **Drive create-folder**：`{status: "created", id, name, webViewLink}`
- **Drive share**：`{status: "shared", permissionId, fileId, role, type}`
- **Drive delete**：`{status: "trashed" | "deleted", fileId, permanent}`
- **Contacts list**：`[{name, emails: [...], phones: [...]}]`
- **Sheets get**：`[[cell, cell, ...], ...]`
- **Sheets create**：`{status: "created", spreadsheetId, title, spreadsheetUrl}`
- **Docs create**：`{status: "created", documentId, title, url}`
- **Docs append**：`{status: "appended", documentId, inserted_at, characters}`

## 規則

1. **未經先與使用者確認，絕不寄送電子郵件、建立／刪除行事曆事件、刪除 Drive 檔案、分享檔案，或修改 Docs/Sheets。** 展示將要執行的內容（收件人、檔案 ID、內容、分享角色）並請求核准。`drive delete` 請優先採用預設的資源回收桶（可復原）而非 `--permanent`。
2. **首次使用前檢查驗證** ——執行 `setup.py --check`。若失敗，引導使用者完成設定。
3. **複雜查詢請用 Gmail 搜尋語法參考** ——以 `skill_view("google-workspace", file_path="references/gmail-search-syntax.md")` 載入。
4. **Calendar 時間必須含時區** ——一律使用帶偏移的 ISO 8601（例如 `2026-03-01T10:00:00-06:00`）或 UTC（`Z`）。
5. **遵守速率限制** ——避免快速連續的 API 呼叫。儘可能批次讀取。

## 疑難排解

| 問題 | 解法 |
|---------|-----|
| `NOT_AUTHENTICATED` | 執行上方步驟 2-5 |
| `REFRESH_FAILED` | Token 已撤銷或過期——重做步驟 3-5 |
| `HttpError 403: Insufficient Permission` | 缺少 API 範圍——`$GSETUP --revoke` 後重做步驟 3-5 |
| `AUTHENTICATED (partial)` 或「Token missing scopes」 | 新的寫入能力（Drive 寫入／刪除、Docs 建立／編輯）需要重新授權。`$GSETUP --revoke` 後重做步驟 3-5 以授與升級後的範圍。 |
| `HttpError 403: Access Not Configured` | API 未啟用——使用者需在 Google Cloud Console 啟用 |
| `ModuleNotFoundError` | 執行 `$GSETUP --install-deps` |
| Advanced Protection 阻擋授權 | Workspace 管理員必須將該 OAuth 用戶端 ID 加入白名單 |

## 撤銷存取權

```bash
$GSETUP --revoke
```
