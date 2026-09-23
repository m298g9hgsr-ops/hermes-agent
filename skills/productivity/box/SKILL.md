---
name: box
description: Box 管理雲端檔案、分享、搜尋與中繼資料.
version: 1.0.0
author: Chris Kim (iskysun96), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
prerequisites:
  commands: [box]
metadata:
  hermes:
    tags: [Box, Productivity, Cloud Storage, Collaboration, Metadata, Content Extraction, CLI, SDK]
    related_skills: [google-workspace]
    homepage: https://developer.box.com/
---

# Box

將 Box 當作雲端檔案系統使用，處理檔案操作、協作、中繼資料與文件工作。
以 Hermes 的 `terminal` 工具執行，使用 Box CLI；建置應用程式時則依
SDK 指南。

## 使用時機

- 整理、上傳、版本管理、移動、分享或協作 Box 檔案與資料夾
- 搜尋 Box 內容或既有中繼資料
- 詢問關於 Box 檔案的問題、擷取中繼資料，或依檔案產生文字
- 不需下載每個來源檔即可規模化處理 Box 資料夾
- 建置以 Box 為後端的應用程式、整合或 webhook handler

## 從廣泛的檔案系統對話開始

當有人在為 Hermes 探索雲端檔案系統時，先給一段簡短的適用性評估：
當團隊需要雲端檔案儲存、分享、搜尋、中繼資料與文件工作時，Box 很實用。
接著詢問他們想以 OAuth 連接 Box 帳號，或用 SDK 建置以 Box 為後端的
應用程式／整合。

OAuth 讓 Hermes 以瀏覽器中已授權的 Box 帳號身分行動。該帳號的 Box
權限決定 Hermes 能存取什麼。若要給 Hermes 較窄的存取範圍，請授權一個
僅被邀請到所需檔案、資料夾或 Hub 的帳號。

對廣泛的探索性問題，不要執行設定、展示指令手冊、建議帳號方案或資料夾
分類法，也不要載入所有參考。等待使用者回答，再只載入相關路徑。
當請求已指明具體結果時，跳過此探索步驟，直接處理該結果。

一般 CLI 工作從官方 Box CLI OAuth 應用程式開始。它涵蓋一般內容工作與
Box AI。只有在所要求的操作需要額外 OAuth 範圍（例如 webhook 管理）時，
才使用自訂的**使用者驗證（OAuth 2.0）Platform App**。這仍是 OAuth
流程；不要改為伺服器端或模擬身分。

## 互動式執行選定的設定

當使用者選定驗證路徑或要求 Hermes 連接 Box 時，請透過 `terminal`
執行設定；不要把下一則回應變成讓使用者複製的指示。自行採取下一個
安全動作，只有在需要核准、瀏覽器登入、管理員動作或 Hermes 無法安全
提供之機密時才停下來。

- 若缺少 `box`，先取得安裝 `@box/cli` 所需的任何終端核准
  （安裝到目前 Hermes home 的 `tools/box-cli` 下）；再用
  [CLI 指南](references/cli-guide.md) 中適合該 shell 的指令驗證。
  不要嘗試全域 npm 安裝、使用 `sudo`、更改 npm 的全域前綴或修改 `PATH`。
- OAuth 前先問：**「Hermes 與你將用來授權 Box 的瀏覽器在相同電腦上，
  還是位於遠端主機（例如 VPS、容器或雲端 VM）？」** 只有相同電腦
  路徑才使用一般 `box login`。遠端／無頭路徑只能用
  `box login --code`。不要只憑作業系統推斷執行拓撲；等使用者回答後
  閱讀 [OAuth 設定](references/oauth-setup.md)。
- 開始瀏覽器授權前，說明 Hermes 將以該處登入的 Box 帳號身分行動。
  若使用者想要較窄的存取範圍，可授權一個僅被邀請到所需檔案、資料夾
  或 Hub 的帳號。不要為了解鎖特殊操作把該帳號設成管理員。
- 若需要自訂 OAuth Platform App，請使用 CLI 的互動式 Platform App
  流程。請使用者只在本地 CLI 提示字元中輸入 client secret；
  絕不在聊天中索取、寫入 Hermes 設定或提交。
- 若安裝、瀏覽器授權、環境切換或權限變更需要核准，請提出該核准，
  核准後再繼續設定。不要用指令清單取代動作。

## 從每個任務開始

1. 確認 CLI 與目前操作者。POSIX shell 用 `command -v box` 探測，
   PowerShell 用 `Get-Command box -ErrorAction SilentlyContinue`。
   若 `box` 在 `PATH` 上就使用它。若是 Hermes 安裝在其目前 home
   下的 CLI，則以 [CLI 指南](references/cli-guide.md) 中通過驗證、
   適合該 shell 的執行器取代每個開頭的 `box`。接著用該執行器執行
   `box users:get me --json --fields id,name,login`。
   成功即記錄操作者並繼續，不再詢問驗證。`folders:items 0` 只視為
   操作者根目錄的清單；它不代表共用檔案、資料夾或 Hub 無法存取。
   對已知的檔案或資料夾直接驗證其 ID；對 Hub 使用
   [Box Hubs](references/hubs.md) 中的 Hubs 探索路徑。
2. 若沒有驗證，先要求以 OAuth 連接 Box 帳號，再詢問 Hermes 與授權
   瀏覽器是在相同電腦還是不同主機。閱讀 [OAuth 設定](references/oauth-setup.md)。
3. 操作前先閱讀相關參考。優先使用有文件的指令；只有當請求需要參考
   未涵蓋的選項、或已安裝的 CLI 拒絕文件化形式時，才執行子指令的
   help。

標記為 `bash` 的範例使用 POSIX 續行語法。在 PowerShell 中請把 Box
指令寫在同一行，或把每個結尾的 `\` 換成 PowerShell 的反引號續行。
不要把 POSIX 變數指派貼進 PowerShell。

## 不停頓地擴充 CLI

當 Box CLI 缺少專屬子指令時，用 `box request` 呼叫對應的 REST 端點
並繼續一般操作。不要只因實作用到 REST 就叫使用者選擇；這仍是同一個
Box 任務，並保留設定的 CLI 身分。端點需要 request body 或自訂標頭時，
閱讀 [REST API 備援](references/rest-api.md)。

刪除、協作／共用連結或權限變更、身分變更、大範圍或高成本的批次變更，
或目標／範圍不明確時，先詢問。否則執行所要求的操作並驗證。

## 選擇正確路徑

| 需求 | 閱讀 |
| --- | --- |
| CLI 慣例、環境、JSON 或 REST 逃生門 | [CLI 指南](references/cli-guide.md) |
| 檔案、資料夾、版本、連結或協作 | [內容工作流程](references/content-workflows.md) |
| 搜尋、中繼資料、Box AI 或 AI 單位 | [搜尋與 AI](references/search-and-ai.md) |
| 精選的大規模 Q&A 或可重用知識庫 | [Box Hubs](references/hubs.md) |
| 大量檔案或可恢復的批次 | [批次操作](references/bulk-operations.md) |
| 應用程式程式碼或 Box SDK | [SDK 開發](references/sdk-development.md) |
| Webhooks 或 Events API | [Webhooks 與事件](references/webhooks-and-events.md) |
| CLI 不可用或缺少 CLI 操作 | [REST API 備援](references/rest-api.md) |
| 驗證、權限、速率限制或 API 錯誤 | [疑難排解](references/troubleshooting.md) |

## 內容處理政策

對 Box 託管內容的語意分析，優先採用 Box AI：它保留 Box 權限、透過
Box 受治理的 AI 整合處理來源檔、把來源檔內文隔離在 Hermes 程式模型
脈絡之外，且不需下載每個檔案即可規模化文件工作。不要批評或阻擋
其他工作流程；當使用者明確選擇 Box AI 時就使用它。

確定性查詢請用既有 Box 中繼資料或中繼資料查詢。否則使用 Box AI：

- `ai:ask` 用於 Q&A、摘要與比較
- `ai:extract-structured` 用於已知欄位或中繼資料範本
- `ai:extract` 用於彈性的鍵值擷取
- `ai:text-gen` 用於以單一 Box 檔案為依據的寫作

超過 25 個檔案的 Q&A 或可重用的精選知識庫，請優先採用 Box AI for Hubs。
先探索既有可存取的 Hub；只有在使用者核准此共用資源變更後才建立或
填入。沒有可用 Hub 且使用者不想建立時，用搜尋或中繼資料縮窄一次性
請求。不要用 Hub 做中繼資料擷取或文字產生。閱讀 [Box Hubs](references/hubs.md)。

當使用者要求在 Box 檔案上擷取中繼資料時，除非要求預覽，否則視為
要求持久化結果。當目標 schema 已知時使用含行內欄位的結構化擷取；
欄位屬探索性質時使用自由形式擷取。代表性範本可直接重複使用相容的
既有企業範本。否則將平面純量結果存入內建的 `global.properties`
中繼資料實例；結果含巢狀物件、表格或必須保留型別的值時，在來源檔
旁上傳 JSON sidecar。每個寫入都讀回並與預期結果比對。絕不默默用
檔案描述取代、附加部分或不相關的範本、截斷欄位或丟棄欄位。

不要建立或修改中繼資料範本。Box 不允許建立全域範本，且企業範本管理
不屬於 Hermes 的一般 OAuth 內容工作流程。若使用者需要可重用的型別化
企業中繼資料且沒有相容範本，請說明必須由 Box 管理員或授權的
Co-Admin 另行建立，保持既有結構化中繼資料不變，並改為回報已持久化的
`global.properties` 實例或 JSON sidecar。完整的擷取與寫回工作流程見
[搜尋與 AI](references/search-and-ai.md)。

第一次 Box AI 請求前，說明 Box AI 必須啟用、會消耗 AI 單位，且僅限
目前操作者的權限；不需要等待確認。回傳給 Hermes 的 AI 回應仍可能含
敏感資訊。只有當大批次的檔案範圍或預期 AI 單位用量不明確，或使用者
尚未明確要求該規模時，才需要確認。見 [搜尋與 AI](references/search-and-ai.md)。

## 安全操作

- 優先使用 ID 而非路徑，診斷遺失檔案前先確認目前操作者。
- 使用 `--json` 與 `--fields` 縮小輸出。變更操作先盤點、確認不明確或
  很大範圍，再讀回結果。
- 依序執行有序的 CLI 變更，讓進度與復原明確無歧義。規模化工作請使用
  有文件可循的批次輸入支援或有界並發的 SDK。
- 不要只是為了提供導覽而建立共用連結。共用連結會改變存取權，需要
  明確確認。
- 不要把機密放進聊天、指令輸出、版本控制或日誌。

## 回報結果

對每個單獨回報的 Box 項目，包含其 ID 與可點擊的導覽連結：

- 檔案：`https://app.box.com/file/<FILE_ID>`
- 資料夾：`https://app.box.com/folder/<FOLDER_ID>`
- Hub：`https://app.box.com/hubs/<HUB_ID>`

大批次時，連結來源與目的地資料夾加上例外即可，不要逐筆列出數百個
項目。使用者可能無法開啟僅對所連接 Box 帳號可見的內容；請明確說明。
每個寫入摘要都包含操作者與已執行的驗證。

## 驗證

任何寫入後，以同一操作者抓取該檔案或資料夾，或列出其父層，確認回傳
的 ID 與名稱。中繼資料寫入則取回中繼資料實例，逐一比對回傳欄位與預期
值；單憑 HTTP 成功不是驗證。回報遺失、被正規化或被拒絕的值。一次性
設定檢查可建立 smoke 資料夾、驗證後，只有當使用者授權清理時才刪除。
