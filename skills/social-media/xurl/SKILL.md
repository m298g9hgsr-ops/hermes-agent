---
name: xurl
description: "透過 xurl CLI 操作 X/Twitter：發文、搜尋、私訊、媒體."
version: 1.1.3
author: xdevplatform + openclaw + Hermes Agent
license: MIT
platforms: [linux, macos]
prerequisites:
  commands: [xurl]
metadata:
  hermes:
    tags: [twitter, x, social-media, xurl, official-api]
    homepage: https://github.com/xdevplatform/xurl
    upstream_skill: https://github.com/openclaw/openclaw/blob/main/skills/xurl/SKILL.md
---

# xurl 技能

`xurl` 是 X 開發者平台官方提供的 X API CLI。它支援常用動作的快捷指令，也支援以原始 curl 風格存取任何 v2 端點。所有指令都會以 JSON 輸出到 stdout。

使用時機：
- 發文、回覆、引用、刪除貼文
- 搜尋原始貼文（含 ID、可讓你互動的貼文 JSON）與讀取時間軸/提及
- 按讚、轉發、收藏
- 追蹤、取消追蹤、封鎖、靜音
- 私訊（direct message）
- 上傳媒體（圖片與影片）
- 以原始方式存取任何 X API v2 端點
- 多應用程式/多帳號的工作流程

本技能取代較舊的 `xitter` 技能（它封裝了第三方 Python CLI）。`xurl` 由 X 開發者平台團隊維護，支援帶自動重新整理的 OAuth 2.0 PKCE，並涵蓋大幅擴增的 API 表面。

---

## 祕密安全（強制）

在 agent/LLM 工作階段內操作時的關鍵規則：

- **絕對不要**將 `~/.xurl` 讀入、印出、解析、摘要、上傳或傳送給 LLM 脈絡。
- **絕對不要**請使用者把憑證/token 貼到對話中。
- 使用者必須在自己的機器上手動將祕密填入 `~/.xurl`。在 Docker 中，這必須是 Hermes 工具子程序所看到的 `~`；請參閱下方 Docker 注意事項。
- **絕對不要**在 agent 工作階段中推薦或執行帶有內嵌祕密的驗證指令。
- **絕對不要**在 agent 工作階段中使用 `--verbose` / `-v`——它可能洩露驗證標頭/token。
- 若要驗證憑證是否存在，只使用：`xurl auth status`。

在 agent 指令中禁止使用的旗標（它們接受內嵌祕密）：
`--bearer-token`, `--consumer-key`, `--consumer-secret`, `--access-token`, `--token-secret`, `--client-id`, `--client-secret`

應用程式的憑證註冊與憑證輪替必須由使用者在 agent 工作階段之外手動完成。憑證註冊後，使用者以 `xurl auth oauth2` 進行驗證——同樣在 agent 工作階段之外。Token 以 YAML 形式保存在 `~/.xurl`。每個應用程式都有彼此隔離的 token。OAuth 2.0 token 會自動重新整理。

---

## 安裝

選擇其中一種方式。在 Linux 上，shell 指令碼或 `go install` 最簡單。

```bash
# Shell script (installs to ~/.local/bin, no sudo, works on Linux + macOS)
curl -fsSL https://raw.githubusercontent.com/xdevplatform/xurl/main/install.sh | bash

# Homebrew (macOS)
brew install --cask xdevplatform/tap/xurl

# npm
npm install -g @xdevplatform/xurl

# Go
go install github.com/xdevplatform/xurl@latest
```

驗證：

```bash
xurl --help
xurl auth status
```

如果已安裝 `xurl`，但 `auth status` 顯示沒有應用程式或 token，使用者就必須手動完成驗證——請參閱下一節。

---

## 一次性使用者設定（由使用者在 agent 之外執行）

這些步驟必須由使用者直接執行，**不是**由 agent 執行，因為它們涉及貼上祕密。請引導使用者到這個區塊，不要替他們執行。

1. 在 https://developer.x.com/en/portal/dashboard 建立或開啟一個應用程式
2. 將重新導向 URI 設為 `http://localhost:8080/callback`
3. 複製應用程式的 Client ID 與 Client Secret
4. 在本機註冊應用程式（由使用者執行）：
   ```bash
   xurl auth apps add my-app --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
   ```
5. 進行驗證（指定 `--app` 以將 token 綁定到你的應用程式）：
   ```bash
   xurl auth oauth2 --app my-app
   ```
   （這會開啟瀏覽器進行 OAuth 2.0 PKCE 流程。）

   如果 X 在 OAuth 之後的 `/2/users/me` 查詢回傳 `UsernameNotFound` 錯誤或 403，請明確傳入你的使用者名稱（xurl v1.1.0+）：
   ```bash
   xurl auth oauth2 --app my-app YOUR_USERNAME
   ```
   這會將 token 綁定到你的使用者名稱，並略過故障的 `/2/users/me` 呼叫。
6. 將應用程式設為預設值，讓所有指令都使用它：
   ```bash
   xurl auth default my-app
   ```
7. 驗證：
   ```bash
   xurl auth status
   xurl whoami
   ```

完成之後，agent 無需進一步設定即可使用下列任何指令。OAuth 2.0 token 會自動重新整理。

> **常見陷阱：**如果從 `xurl auth oauth2` 省略 `--app my-app`，OAuth token 就會存到內建的 `default` 應用程式設定檔——而它沒有 client-id 或 client-secret。即使 OAuth 流程看似成功，指令仍會因驗證錯誤而失敗。若遇到這種情況，請重新執行 `xurl auth oauth2 --app my-app` 與 `xurl auth default my-app`。

> **Docker HOME 陷阱：**在官方 Hermes Docker 配置中，`/opt/data` 是 `HERMES_HOME`，但 Hermes 工具子程序使用 `/opt/data/home` 作為 `HOME`。這表示對由 Hermes 執行的 `xurl` 指令而言，`~/.xurl` 會解析為 `/opt/data/home/.xurl`，而不是 `/opt/data/.xurl`。請以相同的 HOME 執行使用者設定：
> ```bash
> HOME=/opt/data/home xurl auth apps add my-app --client-id YOUR_CLIENT_ID --client-secret YOUR_CLIENT_SECRET
> HOME=/opt/data/home xurl auth oauth2 --app my-app YOUR_USERNAME
> HOME=/opt/data/home xurl auth default my-app YOUR_USERNAME
> HOME=/opt/data/home xurl auth status
> ```
> 如果 `HOME=/opt/data xurl auth status` 成功，但 `HOME=/opt/data/home xurl auth status` 顯示沒有應用程式或 token，Hermes 工具呼叫就看不到這些憑證。

---

## 快速參考

| 動作 | 指令 |
| --- | --- |
| 發文 | `xurl post "Hello world!"` |
| 回覆 | `xurl reply POST_ID "Nice post!"` |
| 引用 | `xurl quote POST_ID "My take"` |
| 刪除貼文 | `xurl delete POST_ID` |
| 讀取貼文 | `xurl read POST_ID` |
| 搜尋貼文 | `xurl search "QUERY" -n 10` |
| 我是誰 | `xurl whoami` |
| 查詢使用者 | `xurl user @handle` |
| 首頁時間軸 | `xurl timeline -n 20` |
| 提及 | `xurl mentions -n 10` |
| 按讚 / 取消按讚 | `xurl like POST_ID` / `xurl unlike POST_ID` |
| 轉發 / 取消轉發 | `xurl repost POST_ID` / `xurl unrepost POST_ID` |
| 收藏 / 取消收藏 | `xurl bookmark POST_ID` / `xurl unbookmark POST_ID` |
| 列出收藏 / 按讚 | `xurl bookmarks -n 10` / `xurl likes -n 10` |
| 追蹤 / 取消追蹤 | `xurl follow @handle` / `xurl unfollow @handle` |
| 追蹤中 / 粉絲 | `xurl following -n 20` / `xurl followers -n 20` |
| 封鎖 / 解除封鎖 | `xurl block @handle` / `xurl unblock @handle` |
| 靜音 / 解除靜音 | `xurl mute @handle` / `xurl unmute @handle` |
| 傳送私訊 | `xurl dm @handle "message"` |
| 列出私訊 | `xurl dms -n 10` |
| 上傳媒體 | `xurl media upload path/to/file.mp4` |
| 媒體狀態 | `xurl media status MEDIA_ID` |
| 列出應用程式 | `xurl auth apps list` |
| 移除應用程式 | `xurl auth apps remove NAME` |
| 設定預設應用程式 | `xurl auth default APP_NAME [USERNAME]` |
| 每次請求指定應用程式 | `xurl --app NAME /2/users/me` |
| 驗證狀態 | `xurl auth status` |

備註：
- `POST_ID` 也接受完整 URL（例如 `https://x.com/user/status/1234567890`）——xurl 會自行擷取 ID。
- 使用者名稱有或沒有開頭的 `@` 皆可。

---

## 指令詳解

### 發文

```bash
xurl post "Hello world!"
xurl post "Check this out" --media-id MEDIA_ID
xurl post "Thread pics" --media-id 111 --media-id 222

xurl reply 1234567890 "Great point!"
xurl reply https://x.com/user/status/1234567890 "Agreed!"
xurl reply 1234567890 "Look at this" --media-id MEDIA_ID

xurl quote 1234567890 "Adding my thoughts"
xurl delete 1234567890
```

### 讀取與搜尋

`xurl search` 會以你已驗證的帳號查詢 X 索引，並回傳原始貼文物件——ID、作者、完整內文——因此可以立即與結果互動（回覆、按讚、轉發、引用）。當你需要的是實際貼文，而不是關於某主題的摘要回答時，請使用它。

```bash
xurl read 1234567890
xurl read https://x.com/user/status/1234567890

xurl search "golang"
xurl search "from:elonmusk" -n 20
xurl search "#buildinpublic lang:en" -n 15
```

處理 X Articles 時，請使用原始 API 模式，而不是 `read` 快捷指令。`xurl read` 預期接收貼文 ID 或貼文 URL；不要在 `/2/tweets/...` 端點前加上 `read`。請求 `article` 推文欄位，並從 JSON 回應中取出 `data.article.plain_text`：

```bash
xurl --app APP_NAME '/2/tweets/2057909493250539891?expansions=author_id,attachments.media_keys,referenced_tweets.id&tweet.fields=created_at,lang,public_metrics,context_annotations,entities,possibly_sensitive,conversation_id,in_reply_to_user_id,referenced_tweets,article'
```

### 使用者、時間軸、提及

```bash
xurl whoami
xurl user elonmusk
xurl user @XDevelopers

xurl timeline -n 25
xurl mentions -n 20
```

### 互動

```bash
xurl like 1234567890
xurl unlike 1234567890

xurl repost 1234567890
xurl unrepost 1234567890

xurl bookmark 1234567890
xurl unbookmark 1234567890

xurl bookmarks -n 20
xurl likes -n 20
```

### 社交關係圖

```bash
xurl follow @XDevelopers
xurl unfollow @XDevelopers

xurl following -n 50
xurl followers -n 50

# Another user's graph
xurl following --of elonmusk -n 20
xurl followers --of elonmusk -n 20

xurl block @spammer
xurl unblock @spammer
xurl mute @annoying
xurl unmute @annoying
```

### 私訊

```bash
xurl dm @someuser "Hey, saw your post!"
xurl dms -n 25
```

### 上傳媒體

```bash
# Auto-detect type
xurl media upload photo.jpg
xurl media upload video.mp4

# Explicit type/category
xurl media upload --media-type image/jpeg --category tweet_image photo.jpg

# Videos need server-side processing — check status (or poll)
xurl media status MEDIA_ID
xurl media status --wait MEDIA_ID

# Full workflow
xurl media upload meme.png                  # returns media id
xurl post "lol" --media-id MEDIA_ID
```

---

## 原始 API 存取

快捷指令涵蓋常見操作。其他需求請以原始 curl 風格模式對任何 X API v2 端點操作：

```bash
# GET
xurl /2/users/me

# POST with JSON body
xurl -X POST /2/tweets -d '{"text":"Hello world!"}'

# DELETE / PUT / PATCH
xurl -X DELETE /2/tweets/1234567890

# Custom headers
xurl -H "Content-Type: application/json" /2/some/endpoint

# Force streaming
xurl -s /2/tweets/search/stream

# Full URLs also work
xurl https://api.x.com/2/users/me
```

---

## 全域旗標

| 旗標 | 簡寫 | 說明 |
| --- | --- | --- |
| `--app` | | 使用特定的已註冊應用程式（覆寫預設值） |
| `--auth` | | 強制驗證類型：`oauth1`、`oauth2` 或 `app` |
| `--username` | `-u` | 要使用哪個 OAuth2 帳號（若有多個） |
| `--verbose` | `-v` | **在 agent 工作階段中禁止**——會洩露驗證標頭 |
| `--trace` | `-t` | 新增 `X-B3-Flags: 1` 追蹤標頭 |

---

## 串流

串流端點會自動偵測。已知的包括：

- `/2/tweets/search/stream`
- `/2/tweets/sample/stream`
- `/2/tweets/sample10/stream`

在任何端點加上 `-s` 即可強制串流。

---

## 輸出格式

所有指令都會以 JSON 輸出到 stdout。結構與 X API v2 一致：

```json
{ "data": { "id": "1234567890", "text": "Hello world!" } }
```

錯誤同樣是 JSON 格式：

```json
{ "errors": [ { "message": "Not authorized", "code": 403 } ] }
```

---

## 常見工作流程

### 附圖發文
```bash
xurl media upload photo.jpg
xurl post "Check out this photo!" --media-id MEDIA_ID
```

### 回覆對話
```bash
xurl read https://x.com/user/status/1234567890
xurl reply 1234567890 "Here are my thoughts..."
```

### 搜尋並互動
```bash
xurl search "topic of interest" -n 10
xurl like POST_ID_FROM_RESULTS
xurl reply POST_ID_FROM_RESULTS "Great point!"
```

### 查看你的動態
```bash
xurl whoami
xurl mentions -n 20
xurl timeline -n 20
```

### 多個應用程式（憑證已手動預先設定）
```bash
xurl auth default prod alice               # prod app, alice user
xurl --app staging /2/users/me             # one-off against staging
```

---

## 錯誤處理

- 任何錯誤都會有非零的結束碼。
- API 錯誤仍會以 JSON 印到 stdout，方便你解析。
- 驗證錯誤 → 請使用者退出 agent 工作階段後重新執行 `xurl auth oauth2`。
- 需要呼叫端使用者 ID 的指令（按讚、轉發、收藏、追蹤等）會透過 `/2/users/me` 自動取得。該處的驗證失敗會以驗證錯誤的形式出現。

---

## Agent 工作流程

1. 驗證前置需求：`xurl --help` 與 `xurl auth status`。
2. 使用 `xurl search` 前，先確認意圖。當任務需要實際的貼文物件、已驗證帳號的脈絡，或會導向 X 寫入動作時才使用它——當使用者想要可以互動的貼文，而不只是某主題的摘要時，它就是正確的工具。
3. **檢查預設應用程式是否有憑證。**解析 `auth status` 的輸出。預設應用程式會以 `▸` 標示。如果預設應用程式顯示 `oauth2: (none)`，但另一個應用程式有有效的 oauth2 使用者，請告訴使用者執行 `xurl auth default <that-app>` 來修正。這是最常見的設定錯誤——使用者新增了自訂名稱的應用程式，卻沒有把它設為預設值，導致 xurl 一直嘗試空白 `default` 設定檔。
4. 如果完全沒有驗證資訊，請停止並引導使用者到「一次性使用者設定」一節——**不要**自行嘗試註冊應用程式或傳遞祕密。
5. 先做一次低成本讀取（`xurl whoami`、`xurl user @handle`、`xurl search ... -n 3`）以確認可連通。
6. 在進行任何寫入動作（發文、回覆、按讚、轉發、私訊、追蹤、封鎖、刪除）之前，先確認目標貼文/使用者與使用者意圖。
7. 只有 `xurl` 指令的輸出（或原始 X API 回應）才能證明某個會改變狀態的 X 動作真的發生過。絕不要依據其他來源——搜尋結果、摘要或先前脈絡——就回報寫入已完成。
8. 直接使用 JSON 輸出——每一則回應都已是結構化資料。
9. 絕不要把 `~/.xurl` 的內容貼回對話中。

---

## 疑難排解

| 症狀 | 原因 | 修正 |
| --- | --- | --- |
| OAuth 流程成功後仍出現驗證錯誤 | Token 存到 `default` 應用程式（沒有 client-id/secret），而不是你的具名應用程式 | 執行 `xurl auth oauth2 --app my-app`，再執行 `xurl auth default my-app` |
| OAuth 期間出現 `unauthorized_client` | 在 X 管理後台將應用程式類型設為「Native App」 | 在使用者驗證設定中改為「Web app, automated app or bot」 |
| OAuth 後立即在 `/2/users/me` 出現 `UsernameNotFound` 或 403 | X 無法可靠地從 `/2/users/me` 回傳使用者名稱 | 重新執行 `xurl auth oauth2 --app my-app YOUR_USERNAME`（xurl v1.1.0+）以明確傳入使用者名稱 |
| 每個請求都回傳 401 | Token 已過期或預設應用程式錯誤 | 檢查 `xurl auth status`——確認 `▸` 指向帶有 oauth2 token 的應用程式 |
| `client-forbidden` / `client-not-enrolled` | X 平台註冊問題 | 後台 → Apps → Manage → 移至「Pay-per-use」方案 → Production 環境 |
| `CreditsDepleted` | X API 餘額為 $0 | 在 Developer Console → Billing 購買額度（最低 $5） |
| 上傳圖片時出現 `media processing failed` | 預設類別是 `amplify_video` | 加上 `--category tweet_image --media-type image/png` |
| X 管理後台有兩個「Client Secret」值 | UI 錯誤——第一個其實是 Client ID | 在「Keys and tokens」頁面確認；ID 結尾為 `MTpjaQ` |

---

## 備註

- **速率限制：**X 會對每個端點施加速率限制。429 表示請等待後重試。寫入端點（發文、回覆、按讚、轉發）的限制比讀取更嚴格。
- **權限範圍（scope）：**OAuth 2.0 token 使用寬泛的權限範圍。某個動作出現 403 通常代表 token 缺少某個 scope——請使用者重新執行 `xurl auth oauth2`。
- **Token 重新整理：**OAuth 2.0 token 會自動重新整理。無需任何動作。
- **多個應用程式：**每個應用程式都有隔離的憑證/token。用 `xurl auth default` 或 `--app` 切換。
- **每個應用程式可有多個帳號：**用 `-u / --username` 選擇，或以 `xurl auth default APP USER` 設定預設值。
- **Token 儲存位置：**`~/.xurl` 是 YAML 格式。在 Docker 中，請使用 Hermes 子程序的 HOME（官方映像為 `/opt/data/home`），讓 token 落在 `/opt/data/home/.xurl`。絕不要把這個檔案讀入或傳送給 LLM 脈絡。
- **費用：**X API 的大量使用通常需付費。許多失敗是方案/權限問題，而不是程式碼問題。

---

## 出處

- 上游 CLI：https://github.com/xdevplatform/xurl（X 開發者平台團隊，Chris Park 等人）
- 上游 agent 技能：https://github.com/openclaw/openclaw/blob/main/skills/xurl/SKILL.md
- Hermes 改編版：依 Hermes 技能慣例重新排版；安全防護規則逐字保留。
