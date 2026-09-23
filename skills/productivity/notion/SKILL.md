---
name: notion
description: 用 ntn CLI 或 curl 操作 Notion 頁面與資料庫.
version: 2.0.0
author: community
license: MIT
platforms: [linux, macos, windows]
prerequisites:
  env_vars: [NOTION_API_KEY]
metadata:
  hermes:
    tags: [Notion, Productivity, Notes, Database, API, CLI, Workers]
    homepage: https://developers.notion.com
---

# Notion

有兩種方式連接 Notion，兩者共用同一個整合權杖——依現場可用的工具選擇即可。

◆ **`ntn` CLI** — Notion 官方 CLI。語法較簡短、可一行上傳檔案，且 Workers 必須使用它。截至 2026 年 5 月僅支援 macOS + Linux（Windows 支援「即將推出」）。**安裝後為預設首選。**
◆ **HTTP + curl** — 各平台皆可用，包含 Windows。`ntn` 未安裝時的**預設備援方案**。

## 設定

### 1. 取得整合權杖（兩條路徑皆需要）

1. 在 https://notion.so/my-integrations 建立整合
2. 複製 API 金鑰（開頭為 `ntn_` 或 `secret_`）
3. 存入 `${HERMES_HOME:-~/.hermes}/.env`：
   ```
   NOTION_API_KEY=ntn_your_key_here
   ```
4. **在 Notion 中將目標頁面／資料庫分享給該整合**：頁面選單 `...` → `Connect to` → 你的整合名稱。未分享時，即使該頁面存在，API 仍會回傳 404。

### 2. 安裝 `ntn`（macOS / Linux 的首選路徑）

```bash
# Recommended
curl -fsSL https://ntn.dev | bash

# Or via npm (needs Node 22+, npm 10+)
npm install --global ntn

ntn --version    # verify
```

**略過 `ntn login`——改用整合權杖。** 這可無頭運作，完全不需要瀏覽器：
```bash
export NOTION_API_TOKEN=$NOTION_API_KEY      # ntn reads NOTION_API_TOKEN
export NOTION_KEYRING=0                       # don't try to use the OS keychain
```

把這些 export 加入你的 shell 設定檔（或 `${HERMES_HOME:-~/.hermes}/.env`），讓每個 session 都繼承。

### 3. 執行時選擇路徑

```bash
if command -v ntn >/dev/null 2>&1; then
  # use ntn
else
  # fall back to curl
fi
```

Windows 使用者：在原生 `ntn` 推出前完全略過步驟 2——路徑 B 即可正常運作。若現在就想要 CLI 的便利性，可在 WSL2 內安裝 `ntn`。

## API 基本概念

所有 HTTP 請求都需要帶 `Notion-Version: 2025-09-03`。`ntn` 會代為處理。在此版本中，使用者所稱的「資料庫」在 API 裡稱為**資料來源（data sources）**。

## 路徑 A — `ntn` CLI（首選，macOS / Linux）

### 原始 API 呼叫（curl 的簡寫）
```bash
ntn api v1/users                                  # GET
# POST with inline body
ntn api v1/pages parent[page_id]=abc123 \
  properties[title][0][text][content]="Notes"
ntn api v1/pages/abc123 -X PATCH archived:=true   # PATCH; := is non-string (bool/num/null)
```

語法說明：
- `key=value` — 字串欄位
- `key[nested]=value` — 巢狀物件欄位
- `key:=value` — 型別指派（布林值、數字、null、陣列）

### 搜尋
```bash
ntn api v1/search query="page title"
```

### 讀取頁面中繼資料
```bash
ntn api v1/pages/{page_id}
```

### 以 Markdown 讀取頁面（對 agent 友善）
```bash
ntn api v1/pages/{page_id}/markdown
```

### 以區塊讀取頁面內容
```bash
ntn api v1/blocks/{page_id}/children
```

### 從 Markdown 建立頁面
```bash
ntn api v1/pages \
  parent[page_id]=xxx \
  properties[title][0][text][content]="Notes from meeting" \
  markdown="# Agenda

- Q3 roadmap
- Hiring"
```

### 以 Markdown 修補頁面
```bash
ntn api v1/pages/{page_id}/markdown -X PATCH \
  markdown="## Update

Shipped the prototype."
```

### 查詢資料庫（資料來源）
```bash
ntn api v1/data_sources/{data_source_id}/query -X POST \
  filter[property]=Status filter[select][equals]=Active
```

若查詢較複雜（含 `sorts`、多個篩選條件子句或複合邏輯），改以管線輸入 JSON：
```bash
echo '{"filter": {"property": "Status", "select": {"equals": "Active"}}, "sorts": [{"property": "Date", "direction": "descending"}]}' | \
  ntn api v1/data_sources/{data_source_id}/query -X POST --json -
```

### 檔案上傳（單行完成——CLI 最大優勢）
```bash
ntn files create < photo.png
ntn files create --external-url https://example.com/photo.png
ntn files list
```

相比三步驟 HTTP 流程（建立上傳 → PUT 位元組 → 引用）。

### 實用環境變數
| 變數 | 作用 |
|---|---|
| `NOTION_API_TOKEN` | 驗證權杖（覆寫金鑰鏈）——設為你的整合權杖 |
| `NOTION_KEYRING=0` | 改以 `~/.config/notion/auth.json` 檔案儲存認證，取代作業系統金鑰鏈 |
| `NOTION_WORKSPACE_ID` | 跳過工作區選擇提示 |

## 路徑 B — HTTP + curl（跨平台，Windows 預設）

所有請求共用以下模式：

```bash
curl -s -X GET "https://api.notion.com/v1/..." \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json"
```

在 Windows 上，Windows 10+ 內建的 `curl` 可直接使用。PowerShell 使用者也可改用 `Invoke-RestMethod`。

### 搜尋
```bash
curl -s -X POST "https://api.notion.com/v1/search" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"query": "page title"}'
```

### 讀取頁面中繼資料
```bash
curl -s "https://api.notion.com/v1/pages/{page_id}" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03"
```

### 以 Markdown 讀取頁面（對 agent 友善）

比區塊 JSON 更容易餵給模型。

```bash
curl -s "https://api.notion.com/v1/pages/{page_id}/markdown" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03"
```

### 以區塊讀取頁面內容（需要結構時）
```bash
curl -s "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03"
```

### 從 Markdown 建立頁面

`POST /v1/pages` 接受 `markdown` body 參數。

```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"page_id": "xxx"},
    "properties": {"title": [{"text": {"content": "Notes from meeting"}}]},
    "markdown": "# Agenda\n\n- Q3 roadmap\n- Hiring\n\n## Decisions\n- Ship MVP Friday"
  }'
```

### 以 Markdown 修補頁面
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/{page_id}/markdown" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"markdown": "## Update\n\nShipped the prototype."}'
```

### 在資料庫中建立頁面（具型別屬性）
```bash
curl -s -X POST "https://api.notion.com/v1/pages" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"database_id": "xxx"},
    "properties": {
      "Name": {"title": [{"text": {"content": "New Item"}}]},
      "Status": {"select": {"name": "Todo"}}
    }
  }'
```

### 查詢資料庫（資料來源）
```bash
curl -s -X POST "https://api.notion.com/v1/data_sources/{data_source_id}/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "filter": {"property": "Status", "select": {"equals": "Active"}},
    "sorts": [{"property": "Date", "direction": "descending"}]
  }'
```

### 建立資料庫
```bash
curl -s -X POST "https://api.notion.com/v1/data_sources" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "parent": {"page_id": "xxx"},
    "title": [{"text": {"content": "My Database"}}],
    "properties": {
      "Name": {"title": {}},
      "Status": {"select": {"options": [{"name": "Todo"}, {"name": "Done"}]}},
      "Date": {"date": {}}
    }
  }'
```

### 更新頁面屬性
```bash
curl -s -X PATCH "https://api.notion.com/v1/pages/{page_id}" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"properties": {"Status": {"select": {"name": "Done"}}}}'
```

### 將區塊附加到頁面
```bash
curl -s -X PATCH "https://api.notion.com/v1/blocks/{page_id}/children" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{
    "children": [
      {"object": "block", "type": "paragraph", "paragraph": {"rich_text": [{"text": {"content": "Hello from Hermes!"}}]}}
    ]
  }'
```

### 檔案上傳（三步驟流程）
```bash
# 1. Create upload
curl -s -X POST "https://api.notion.com/v1/file_uploads" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2025-09-03" \
  -H "Content-Type: application/json" \
  -d '{"filename": "photo.png", "content_type": "image/png"}'

# 2. PUT bytes to the upload_url returned above
curl -s -X PUT "{upload_url}" --data-binary @photo.png

# 3. Reference {file_upload_id} in a page/block payload
```

## 屬性型別

資料庫項目的常見屬性格式：

- **標題：** `{"title": [{"text": {"content": "..."}}]}`
- **Rich text：** `{"rich_text": [{"text": {"content": "..."}}]}`
- **單選：** `{"select": {"name": "Option"}}`
- **多選：** `{"multi_select": [{"name": "A"}, {"name": "B"}]}`
- **日期：** `{"date": {"start": "2026-01-15", "end": "2026-01-16"}}`
- **核取方塊：** `{"checkbox": true}`
- **數字：** `{"number": 42}`
- **URL：** `{"url": "https://..."}`
- **電子郵件：** `{"email": "user@example.com"}`
- **關聯：** `{"relation": [{"id": "page_id"}]}`

## API 版本 2025-09-03 — 資料庫 vs 資料來源

- **資料庫變成了資料來源。** 查詢與取得請使用 `/data_sources/` 端點。
- **每個資料庫有兩個 ID：** `database_id` 與 `data_source_id`。
  - 建立頁面時用 `database_id`：`parent: {"database_id": "..."}`
  - 查詢時用 `data_source_id`：`POST /v1/data_sources/{id}/query`
- 搜尋會以 `"object": "data_source"` 回傳資料庫，並帶有 `data_source_id` 欄位。

## Notion Workers（進階，需要 `ntn`）

Workers 是由 Notion 替你託管的 TypeScript 程式。單一 worker 可以揭露以下任意組合：
- **同步（Syncs）** — 依排程（預設 30 分鐘）從外部 API 拉取資料到 Notion 資料庫。
- **工具（Tools）** — 以可呼叫工具的形式出現在 Notion 的 Custom Agents 中。
- **Webhooks** — 接收外部服務（GitHub、Stripe 等）的 HTTP 事件並在 Notion 中採取行動。

**方案／平台限制：**
- CLI 在所有方案皆可用。**部署 Workers 需要 Business 或 Enterprise 方案。**
- 截至 2026 年 5 月，`ntn` 僅限 macOS/Linux。Windows 使用者需使用 WSL2 或等待原生支援。
- 2026 年 8 月 11 日前免費；之後改以 Notion credits 計量。

### 最小 Worker

```bash
ntn workers new my-worker      # scaffold
cd my-worker
# Edit src/index.ts
ntn workers deploy --name my-worker
```

`src/index.ts`：
```typescript
import { Worker } from "@notionhq/workers";

const worker = new Worker();
export default worker;

worker.tool("greet", {
  title: "Greet a User",
  description: "Returns a friendly greeting",
  inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
  execute: async ({ name }) => `Hello, ${name}!`,
});
```

### Webhook 功能

```typescript
worker.webhook("onGithubPush", {
  title: "GitHub Push Handler",
  execute: async (events, { notion }) => {
    for (const event of events) {
      // event.body, event.rawBody (for signature verification), event.headers
      console.log("got delivery", event.deliveryId);
    }
  },
});
```

部署後：`ntn workers webhooks list` 會顯示 Notion 產生的 URL。請把該 URL 視為機密——任何持有它的人都可以 POST 事件，除非你加上簽章驗證。

### Worker 生命週期指令

```bash
ntn workers deploy
ntn workers list
ntn workers exec <capability-key> -d '{"name": "world"}'
ntn workers sync trigger <key>            # run a sync now
ntn workers sync pause <key>
ntn workers env set GITHUB_WEBHOOK_SECRET=...
ntn workers runs list                     # recent invocations
ntn workers runs logs <run-id>
ntn workers webhooks list
```

被要求建立 Worker 時：用 `ntn workers new` 產生骨架、在 `src/index.ts` 撰寫程式碼、用 `ntn workers env set` 設定機密，然後部署。Notion 官方文件 https://developers.notion.com/workers 涵蓋完整 API。

## Notion 風格 Markdown（`/markdown` 端點使用）

標準 CommonMark 加上 Notion 專屬區塊的類 XML 標籤。縮排請使用**定位鍵（tab）**。

**超越 CommonMark 的區塊：**
```
<callout icon="🎯" color="blue_bg">
	Ship the MVP by **Friday**.
</callout>

<details color="gray">
<summary>Toggle title</summary>
	Children indented one tab
</details>

<columns>
	<column>Left side</column>
	<column>Right side</column>
</columns>

<table_of_contents color="gray"/>
```

**行內元素：**
- 提及：`<mention-user url="..."/>`、`<mention-page url="...">Title</mention-page>`、`<mention-date start="2026-05-15"/>`
- 底線：`<span underline="true">text</span>`
- 顏色：`<span color="blue">text</span>`，或在第一行使用區塊層級的 `{color="blue"}`
- 數學：行內 `$x^2$`、區塊 `$$ ... $$`
- 引用：`[^https://example.com]`

**顏色：** `gray brown orange yellow green blue purple pink red`，另有 `*_bg` 變體作為背景色。

標題 5/6 會收合成 H4。多行 `>` 會渲染成各自獨立的引言區塊——多行引言請在單一 `>` 內使用 `<br>`。

## 選擇正確路徑

| 任務 | mac / Linux | Windows |
|---|---|---|
| 讀寫頁面、搜尋、查詢資料庫 | `ntn api ...` | curl |
| 讀取頁面供 agent 摘要 | `ntn api v1/pages/{id}/markdown` | curl `/markdown` 端點 |
| 上傳檔案 | `ntn files create < file` | 三步驟 HTTP 流程 |
| 一次性 API 探索 | `ntn api ...` | curl |
| 建立由 Notion 託管的同步／webhook／agent 工具 | `ntn workers ...` | WSL2 + `ntn workers ...` |

## 說明

- 頁面／資料庫 ID 是 UUID（有無連字號皆可接受）。
- 速率限制：平均約每秒 3 個請求。CLI 無法繞過此限制。
- API 無法設定資料庫的**檢視**篩選——那只在 UI 可用。
- 建立資料來源時使用 `"is_inline": true` 可將其嵌入頁面。
- 給 curl 一律加 `-s` 以隱藏進度條（讓 agent 輸出更乾淨）。
- 讀取時可用 `jq` 處理 JSON：`... | jq '.results[0].properties'`。
- Notion 現在也提供 MCP server（`Notion MCP`，資料庫操作比前一版節省約 91% token）——若想在 session 內串流存取 Notion，可透過 Hermes 的 MCP 支援接上；但上述路徑已足夠應付大多數一次性任務。
