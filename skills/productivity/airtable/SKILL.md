---
name: airtable
description: 用 curl 操作 Airtable REST API：記錄 CRUD 與篩選.
version: 1.1.0
author: community
license: MIT
platforms: [linux, macos, windows]
prerequisites:
  env_vars: [AIRTABLE_API_KEY]
  commands: [curl]
metadata:
  hermes:
    tags: [Airtable, Productivity, Database, API]
    homepage: https://airtable.com/developers/web/api/introduction
---

# Airtable — 資料庫、資料表與記錄

用 `terminal` 工具直接透過 `curl` 操作 Airtable 的 REST API。不需要 MCP server、不需要 OAuth 流程、不需要 Python SDK——只要 `curl` 與個人存取權杖。

## 前置需求

1. 在 https://airtable.com/create/tokens 建立**個人存取權杖（PAT）**（權杖開頭為 `pat...`）。
2. 授與以下權限範圍（最低要求）：
   - `data.records:read` — 讀取列
   - `data.records:write` — 建立／更新／刪除列
   - `schema.bases:read` — 列出資料庫與資料表
3. **重要：**在同一個權杖 UI 中，把你想要存取的每個資料庫加入該權杖的 **Access** 清單。PAT 是以資料庫為範圍——用在錯誤資料庫上的有效權杖會回傳 `403`。
4. 將權杖存入 `${HERMES_HOME:-~/.hermes}/.env`（或透過 `hermes setup`）：
   ```
   AIRTABLE_API_KEY=pat_your_token_here
   ```

> 注意：舊版 `key...` API 金鑰已於 2024 年 2 月棄用。目前僅 PAT 與 OAuth 權杖可用。

## API 基本概念

- **端點：** `https://api.airtable.com/v0`
- **驗證標頭：** `Authorization: Bearer $AIRTABLE_API_KEY`
- **所有請求**皆使用 JSON（任何 POST/PATCH/PUT body 都用 `Content-Type: application/json`）。
- **物件 ID：** 資料庫 `app...`、資料表 `tbl...`、記錄 `rec...`、欄位 `fld...`。ID 永不改變；名稱可改。自動化中請優先使用 ID。
- **速率限制：** 每個資料庫每秒 5 個請求。`429` → 退避。對單一資料庫的突發請求會被限流。

基本 curl 模式：
```bash
curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?maxRecords=5" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```

`-s` 會隱藏 curl 的進度條——每次呼叫都保留它，讓 Hermes 的工具輸出保持乾淨。可透過 `python -m json.tool`（一律存在）或 `jq`（若已安裝）管線處理以取得可讀 JSON。

## 欄位型別（請求 body 形式）

| 欄位型別 | 寫入形式 |
|---|---|
| 單行文字 | `"Name": "hello"` |
| 長文字 | `"Notes": "multi\nline"` |
| 數字 | `"Score": 42` |
| 核取方塊 | `"Done": true` |
| 單選 | `"Status": "Todo"`（除非 `typecast: true`，名稱必須已存在） |
| 多選 | `"Tags": ["urgent", "bug"]` |
| 日期 | `"Due": "2026-04-01"` |
| 日期時間（UTC） | `"At": "2026-04-01T14:30:00.000Z"` |
| URL／電子郵件／電話 | `"Link": "https://…"` |
| 附件 | `"Files": [{"url": "https://…"}]`（Airtable 負責抓取＋重新託管） |
| 關聯記錄 | `"Owner": ["recXXXXXXXXXXXXXX"]`（記錄 ID 陣列） |
| 使用者 | `"AssignedTo": {"id": "usrXXXXXXXXXXXXXX"}` |

在建立／更新 body 的頂層傳入 `"typecast": true`，可讓 Airtable 自動轉換值（例如即興建立新的選項、將 `"42"` 轉為 `42`）。

## 常見查詢

### 列出權杖可見的資料庫
```bash
curl -s "https://api.airtable.com/v0/meta/bases" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```

### 列出某資料庫的資料表＋結構
```bash
curl -s "https://api.airtable.com/v0/meta/bases/$BASE_ID/tables" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```
**在任何變更前**先執行此步——可確認精確的欄位名稱與 ID、顯示選取欄位的 `options.choices`，以及主要欄位名稱。

### 列出記錄（前 10 筆）
```bash
curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?maxRecords=10" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```

### 取得單筆記錄
```bash
curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE/$RECORD_ID" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```

### 篩選記錄（filterByFormula）
Airtable 公式必須經 URL 編碼。交給 Python 標準函式庫處理——絕不手動編碼：
```bash
FORMULA="{Status}='Todo'"
ENC=$(python -c 'import sys, urllib.parse; print(urllib.parse.quote(sys.argv[1], safe=""))' "$FORMULA")
curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?filterByFormula=$ENC&maxRecords=20" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```

實用公式模式：
- 完全相符：`{Email}='user@example.com'`
- 包含：`FIND('bug', LOWER({Title}))`
- 多個條件：`AND({Status}='Todo', {Priority}='High')`
- 或：`OR({Owner}='alice', {Owner}='bob')`
- 非空：`NOT({Assignee}='')`
- 日期比較：`IS_AFTER({Due}, TODAY())`

### 排序＋選取特定欄位
```bash
curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?sort%5B0%5D%5Bfield%5D=Priority&sort%5B0%5D%5Bdirection%5D=asc&fields%5B%5D=Name&fields%5B%5D=Status" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```
查詢參數中的方括號**必須**經 URL 編碼（`%5B` / `%5D`）。

### 使用命名檢視
```bash
curl -s "https://api.airtable.com/v0/$BASE_ID/$TABLE?view=Grid%20view&maxRecords=50" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```
檢視會在伺服器端套用其已儲存的篩選與排序。

## 常見變更操作

### 建立記錄
```bash
curl -s -X POST "https://api.airtable.com/v0/$BASE_ID/$TABLE" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"Name":"New task","Status":"Todo","Priority":"High"}}' | python -m json.tool
```

### 一次呼叫最多建立 10 筆記錄
```bash
curl -s -X POST "https://api.airtable.com/v0/$BASE_ID/$TABLE" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "typecast": true,
    "records": [
      {"fields": {"Name": "Task A", "Status": "Todo"}},
      {"fields": {"Name": "Task B", "Status": "In progress"}}
    ]
  }' | python -m json.tool
```
批次端點上限為**每次請求 10 筆記錄**。大量插入請以 10 筆為一批迴圈執行，並加上短暫 sleep，以遵守每資料庫每秒 5 個請求的限制。

### 更新記錄（PATCH — 合併並保留未變更欄位）
```bash
curl -s -X PATCH "https://api.airtable.com/v0/$BASE_ID/$TABLE/$RECORD_ID" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"fields":{"Status":"Done"}}' | python -m json.tool
```

### 依合併欄位 Upsert（不需 ID）
```bash
curl -s -X PATCH "https://api.airtable.com/v0/$BASE_ID/$TABLE" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "performUpsert": {"fieldsToMergeOn": ["Email"]},
    "records": [
      {"fields": {"Email": "user@example.com", "Status": "Active"}}
    ]
  }' | python -m json.tool
```
`performUpsert` 會為合併欄位值是新的記錄建立新列，為已存在的記錄套用 PATCH。非常適合需要冪等的同步作業。

### 刪除記錄
```bash
curl -s -X DELETE "https://api.airtable.com/v0/$BASE_ID/$TABLE/$RECORD_ID" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```

### 一次呼叫最多刪除 10 筆記錄
```bash
curl -s -X DELETE "https://api.airtable.com/v0/$BASE_ID/$TABLE?records%5B%5D=rec1&records%5B%5D=rec2" \
  -H "Authorization: Bearer $AIRTABLE_API_KEY" | python -m json.tool
```

## 分頁

列出端點每頁最多回傳 **100 筆記錄**。若回應包含 `"offset": "..."`，下次請求請傳回該值。持續迴圈直到此欄位不存在：

```bash
OFFSET=""
while :; do
  URL="https://api.airtable.com/v0/$BASE_ID/$TABLE?pageSize=100"
  [ -n "$OFFSET" ] && URL="$URL&offset=$OFFSET"
  RESP=$(curl -s "$URL" -H "Authorization: Bearer $AIRTABLE_API_KEY")
  echo "$RESP" | python -c 'import json,sys; d=json.load(sys.stdin); [print(r["id"], r["fields"].get("Name","")) for r in d["records"]]'
  OFFSET=$(echo "$RESP" | python -c 'import json,sys; d=json.load(sys.stdin); print(d.get("offset",""))')
  [ -z "$OFFSET" ] && break
done
```

## 典型 Hermes 工作流程

1. **確認驗證。** `curl -s -o /dev/null -w "%{http_code}\n" https://api.airtable.com/v0/meta/bases -H "Authorization: Bearer $AIRTABLE_API_KEY"` ——預期 `200`。
2. **找出資料庫。** 列出資料庫（上一步），或當權杖缺少 `schema.bases:read` 時直接向使用者索取 `app...` ID。
3. **檢查結構。** `GET /v0/meta/bases/$BASE_ID/tables` ——在變更任何內容前，先在 session 本機快取精確的欄位名稱與主要欄位名稱。
4. **先讀後寫。** 對於「在 Y 條件下更新 X」，先用 `filterByFormula` 解析出 `rec...` ID，再 `PATCH /v0/$BASE_ID/$TABLE/$RECORD_ID`。絕不猜測記錄 ID。
5. **批次寫入。** 把相關的建立操作合併成一次 10 筆的 POST，以維持在每秒 5 個請求的預算內。
6. **破壞性操作。** 刪除無法透過 API 復原。若使用者說「刪除所有 X」，請先回傳篩選條件＋記錄數量並確認後再執行。

## 常見陷阱

- **`filterByFormula` 必須經 URL 編碼。** 含空格或非 ASCII 的欄位名稱同樣需要編碼（`{My Field}` → `%7BMy%20Field%7D`）。請使用 Python 標準函式庫（見上方模式）——絕不手動跳脫。
- **空欄位不會出現在回應中。** 缺少 `"Assignee"` 鍵不代表該欄位不存在——只代表這筆記錄的值為空。下結論說欄位不存在前，先檢查結構（步驟 3）。
- **PATCH vs PUT。** `PATCH` 把提供的欄位併入記錄。`PUT` 會完全取代記錄並清空你未包含的所有欄位。預設用 `PATCH`。
- **單選選項必須已存在。** 當 `Shipping` 不在欄位的選項清單中卻寫入 `"Status": "Shipping"` 時，會回傳 `INVALID_MULTIPLE_CHOICE_OPTIONS` 錯誤，除非你傳入 `"typecast": true`（會自動建立該選項）。
- **權杖以資料庫為範圍。** 某個資料庫回 `403` 而另一個正常，代表權杖的 Access 清單未包含該資料庫——不是範圍或驗證問題。請使用者到 https://airtable.com/create/tokens 授與權限。
- **速率限制以資料庫計，不是以權杖計。** `baseA` 每秒 5 個請求同時 `baseB` 每秒 5 個請求沒問題；但 `baseA` 單獨每秒 6 個請求就會被限流。`429` 時請監控 `Retry-After` 標頭。

## 給 Hermes 的重要注意事項

- **一律用 `terminal` 工具搭配 `curl`。** 不要使用 `web_extract`（無法送出驗證標頭）或 `browser_navigate`（需要 UI 驗證且速度慢）。
- **本技能載入時，`AIRTABLE_API_KEY` 會自動從 `${HERMES_HOME:-~/.hermes}/.env` 注入子行程**——每次 `curl` 呼叫前不需要重新匯出。
- **公式中的花括號要小心跳脫。** 在 heredoc body 中，`{Status}` 是字面值。在 shell 引數中，`{...}`  brace-expansion 之外的 `{Status}` 是安全的——但動態字串在拼進 URL 前，請先經過 `python urllib.parse.quote`。
- **用 `python -m json.tool` 美化輸出**（一律存在）而非 `jq`（選擇性）。只有需要篩選／投影時才用 `jq`。
- **分頁是逐頁而非全域。** Airtable 的 100 筆上限是硬限制，無法調高。用 `offset` 迴圈直到欄位不存在。
- **讀取非 2xx 回應的 `errors` 陣列** ——Airtable 會回傳結構化錯誤碼，例如 `AUTHENTICATION_REQUIRED`、`INVALID_PERMISSIONS`、`MODEL_ID_NOT_FOUND`、`INVALID_MULTIPLE_CHOICE_OPTIONS`，可確切告訴你哪裡出了問題。
