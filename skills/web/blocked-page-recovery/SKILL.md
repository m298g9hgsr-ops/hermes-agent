---
name: blocked-page-recovery
description: "網頁擷取失敗時使用：403/429、付費牆、WAF、機器人驗證牆."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Research, Archives, Wayback, Paywall, WAF, Fallback]
    related_skills: [grounded-citations]
---

# Blocked-Page Recovery 技能

當網頁無法擷取時——403/429、Cloudflare 的「Just a moment...」、付費牆或機器人偵測的過渡頁——不要放棄，也不要對同一個 URL 一直重試。第三方服務通常保有該頁面的**副本**。請依序循著下面的階梯，先從成本最低的開始。

## 階梯

```
1. Wayback Machine  — archive.org "available" API  (snapshot + timestamp)
2. archive.today    — domain rotation: archive.ph → .md → .li → .is
3. Jina Reader      — only if JINA_API_KEY is set  (live server-side render)
4. API-first pivot  — look for /api/, /graphql, .json, or RSS on the same host
5. Real browser     — browser tool as the last, most expensive resort
```

使用隨附的指令碼一次執行：

```bash
python3 scripts/recover_page.py "https://example.com/blocked-article" --json
```

指令碼會依序嘗試每一種途徑、驗證每一份取得的內容（見下方「假的成功」），並輸出第一個真正命中的結果及其來源資訊。

## 來源紀律（不可妥協）

每一份復原的副本都帶有來源資訊，引用時你**必須**保留：

| 途徑 | 來源類型 | 引用方式 |
|-------|-----------|-------------|
| Wayback / archive.today | `snapshot` | 引用時**附上快照日期**：「as archived 2026-08-06」。絕不要把快照當成線上頁面——它可能是過時的。 |
| Jina Reader | `live` | 線上頁面的伺服器端重新渲染；正常引用即可。 |
| Live fetch / browser | `live` | 正常引用即可。 |

若使用者需要的是*最新的*資料（價格、庫存、即時新聞），快照只能當作參考脈絡，而不是答案——請明確說明，並註明快照的日期有多舊。

## 手動途徑

### 1. Wayback Machine（來源最佳，優先嘗試）

```bash
# Discovery: returns closest snapshot URL + timestamp as JSON
curl -sL "https://archive.org/wayback/available?url={URL}"
# Then fetch archived_snapshots.closest.url
```

若要列舉大量快照（或復原已刪除的頁面），可使用 CDX 索引：

```bash
curl -sL "https://web.archive.org/cdx/search/cdx?url={URL}&output=json&limit=10"
```

CDX 在負載高時會間歇性回傳 503——若發生這種情況，請改用 `available` API，不要猛力重試。

適用於：任何經公開爬取的 URL。不適用於：被 robots 封鎖的網站、從未被爬取的 URL、純 JS 的 SPA（快照無法渲染）。

### 2. archive.today（付費牆、已刪除的內容）

使用者自行提交的封存——通常收錄了 Wayback 沒有的付費牆新聞文章。它會強力限制速率（429）並輪替網域，因此請嘗試多個：

```bash
for d in archive.ph archive.md archive.li archive.is; do
  curl -sL --max-time 20 "https://$d/newest/{URL}" -o ~/.hermes/cache/scratch/page.html \
    -w "%{http_code}" && break
done
```

**驗證的是內容本身，而不是狀態碼**——429 仍會回傳數 KB 的限流 HTML，單憑大小檢查看起來會像成功。

### 3. Jina Reader（需要 JINA_API_KEY）

`r.jina.ai` 會在真實瀏覽器中於伺服器端重新渲染線上頁面，並回傳 markdown。匿名存取已經失效（401 → Turnstile）；需要 API 金鑰：

```bash
curl -s -H "Authorization: Bearer $JINA_API_KEY" "https://r.jina.ai/{URL}"
```

可處理封存服務無法應付的 JS SPA。當環境變數未設定時，請完全跳過此途徑。

### 4. 優先轉向 API

WAF 對 HTML 表面的保護遠比其背後的資料端點嚴密得多。對某個網站阻塞了 2-3 次之後，別再跟 HTML 纏鬥，改找：

- 頁面 URL 的 `/api/...`、`/graphql` 或 `.json` 變體
- RSS/Atom 訂閱源（`/feed`、`/rss`，或任何你成功復原副本中的 `<link rel="alternate">`）
- 站台地圖（`/sitemap.xml`），可能揭示未受封鎖的 canonical URL

## 假成功——會騙人的途徑

這些途徑會回傳 HTTP 200 與看似合理的內容，但內容**不是**目標頁面。指令碼會自動拒絕它們；手動操作時也請拒絕：

- **Google 快取已失效**（自 2024 年中起）。`webcache.googleusercontent.com` 會回傳 200 與數十 KB，但那是帶 JS 重新導向的 Google 搜尋過渡頁，並非快取。絕對不要使用。
- **AMP 快取**（`*.cdn.ampproject.org`）大多回傳約 300 位元組的 `<title>Redirecting</title>` meta 重新整理 stub，指向原始（被封鎖的）URL。把這當作成功會造成抓取迴圈。
- **限流內容**：archive.today 的 429 頁面是多 KB 的 HTML。請檢查目標頁面的實際內容（標題字詞、預期字串），而不是只看大小。

指令碼套用的偵測啟發式：內容低於各途徑的位元組下限；meta 重新整理/JS 重新導向 stub 指向原始主機；過渡頁標題（「Just a moment」、「Redirecting」、「Google Search」、「Attention Required」）。

## 代理轉送器：不要用

一般的「網頁代理」轉送器本質上就是中間人攻擊。絕對不要經由它們傳送 cookie 或 Authorization 標頭，也不要用它們處理任何使用者會依賴的事情——來源無法驗證。請優先使用封存服務，至少有時間戳記其副本。
