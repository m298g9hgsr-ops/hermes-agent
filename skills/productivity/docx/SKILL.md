---
name: docx
description: 建立、讀取、編輯、套用範本及檢閱 Word .docx 檔案.
version: 1.1.0
author: Nous Research
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [word, docx, documents, office, templates, revisions, comments]
    category: productivity
    related_skills: [pdf, xlsx, powerpoint]
---

# Docx 技能

用 python-docx 透過小型 CLI 建立、讀取、編輯與套用 Microsoft Word
`.docx` 範本。可處理文字、樣式、清單、表格、圖片、頁首／頁尾、
`{{token}}` 範本、追蹤修訂（列出／接受／拒絕）、註解（列出／新增／刪除）、
目錄與頁碼欄位，以及封裝健康檢查。本身不渲染文件
（轉 PDF 需要 LibreOffice——見「轉換為 PDF」），也不編輯舊版 `.doc`。

## 使用時機

- 使用者要求產生 Word 文件（報告、信函、合約）。
- 需要取得 `.docx` 的文字、大綱、樣式或內嵌圖片。
- 必須修改既有 `.docx`：取代文字、編輯表格儲存格、插入／刪除段落、
  套用樣式、合併碎片化的 runs。
- 有含 `{{placeholders}}` 的 `.docx` 範本，需以資料填入。
- 文件有追蹤修訂需要檢閱、接受或拒絕。
- 需要讀取審閱者的註解，或新增／刪除註解。
- `.docx` 打不開或行為異常，需要進行損毀診斷。
- 文件需要目錄或「第 X 頁／共 Y 頁」頁尾。
- 不適用於：`.doc`（舊版）、`.odt` 或所見即所得的版面工作。

## 前置需求

- Python 3.10+ 與已安裝的 `python-docx`：
  `pip install python-docx`（匯入名稱為 `docx`；lxml 隨附其中）。
- 註解的 `add` 在 python-docx >= 1.2 使用原生 API，舊版則退回 XML
  ——兩者皆自動處理。
- 圖片區塊：圖片檔案必須存在於本機（PNG/JPEG）。

## 執行方式

所有輔助腳本都在本檔旁的 `scripts/`。用 `terminal` 工具執行；
每個都支援 `--help` 並將 JSON 印到 stdout。

```bash
python scripts/docx_create.py spec.json out.docx
python scripts/docx_read.py out.docx --text
python scripts/docx_edit.py replace out.docx --find old --replace new
python scripts/docx_template.py tpl.docx values.json filled.docx
python scripts/docx_revisions.py list out.docx
python scripts/docx_comments.py list out.docx
python scripts/docx_validate.py out.docx
```

## 快速參考

| 任務 | 指令 |
| --- | --- |
| 依 JSON spec 建立 | `docx_create.py spec.json out.docx` |
| 完整文字（內文＋表格＋頁首／頁尾） | `docx_read.py f.docx --text` |
| 標題大綱＋表格形狀 | `docx_read.py f.docx --structure` |
| 實際使用的樣式 | `docx_read.py f.docx --styles` |
| 匯出內嵌圖片 | `docx_read.py f.docx --images outdir/` |
| 偵測追蹤修訂／註解 | `docx_read.py f.docx --revisions` |
| 尋找／取代（保留格式） | `docx_edit.py replace f.docx --find A --replace B -o out.docx` |
| 設定表格儲存格 | `docx_edit.py set-cell f.docx --table 0 --row 1 --col 2 --text X` |
| 在索引 N 前插入段落 | `docx_edit.py insert f.docx --index N --text X --style Normal` |
| 刪除第 N 段 | `docx_edit.py delete f.docx --index N` |
| 對第 N 段套用樣式 | `docx_edit.py style f.docx --index N --style "Heading 1"` |
| 合併格式相同的相鄰 runs | `docx_edit.py normalize f.docx -o out.docx` |
| 在第 N 段前插入目錄欄位 | `docx_edit.py toc f.docx --index N -o out.docx` |
| 「第 X 頁／共 Y 頁」頁尾欄位 | `docx_edit.py page-numbers f.docx` |
| 填入 `{{tokens}}` | `docx_template.py tpl.docx values.json out.docx --strict` |
| 列出修訂（id／作者／日期／文字） | `docx_revisions.py list f.docx` |
| 接受／拒絕全部修訂 | `docx_revisions.py accept-all f.docx -o out.docx`（或 `reject-all`） |
| 接受／拒絕單一修訂 | `docx_revisions.py accept f.docx --id 3 -o out.docx` |
| 列出註解（＋錨定文字） | `docx_comments.py list f.docx` |
| 新增錨定到文字的註解 | `docx_comments.py add f.docx --target "phrase" --text "note" --author You` |
| 依 id 刪除註解 | `docx_comments.py delete f.docx --id 0` |
| 封裝健康檢查 | `docx_validate.py f.docx`（有錯誤時結束碼 1） |

## 操作步驟

1. **建立。** 用 `write_file` 撰寫 JSON spec，再執行
   `scripts/docx_create.py`。spec 支援：`page`（尺寸＋頁邊界，單位 mm）、
   `header`／`footer` 字串、`footer_page_numbers`（加入「第 X 頁／共 Y 頁」
   欄位頁尾）、`styles`（自訂段落樣式，含字型、大小、粗／斜體、十六進位
   `color`），以及 `blocks` —— `heading`（層級 1-9）、`paragraph`
   （`text` 或 `runs` 清單，每個 run 可設 `bold`／`italic`／`underline`）、
   `bullet_list`、`numbered_list`、`table`（`header` 列以粗體渲染、`rows`、
   選填的內建表格 `style` 如 `Table Grid`）、`image`（`path`、選填
   `width_mm`）、`toc`（目錄欄位）與 `page_break`。完整 spec 格式
   記錄在 `scripts/docx_create.py` 開頭。
2. **讀取。** 使用 `scripts/docx_read.py`，且只能指定一個模式旗標。
   `--text` 以 JSON 回傳內文段落、所有表格儲存格文字與頁首／頁尾文字。
   `--structure` 回傳標題大綱以及段落／表格／節的計數。
   `--images DIR` 將 `word/media/` 底下的所有檔案複製出封裝。
3. **編輯。** 使用 `scripts/docx_edit.py`。`replace` 會走訪內文、表格
   （含巢狀）、頁首與頁尾，並保留 run 格式；加 `--body-only` 可略過
   頁首／頁尾。指定 `-o out.docx` 可保留原始檔；省略則就地編輯。
   `insert`／`delete`／`style`／`toc` 的段落索引係對應
   `--structure`／`--text` 的內文順序。經過重度 Word 編輯的文件請先執行
   `normalize`——它會合併格式完全相同的相鄰 runs，讓後續的尋找取代
   能可靠比對。
4. **檢視修訂。** `docx_revisions.py list` 會回報內文、表格、頁首或頁尾
   中任何位置的 `w:ins` 與 `w:del`（id、作者、日期、受影響文字）。
   `accept-all`／`reject-all` 批量處理；`accept`／`reject --id N`
   處理單一修訂。接受會保留插入並捨棄被刪文字；拒絕則相反。
5. **註解。** `docx_comments.py list` 回傳每則註解的 id、作者、日期、
   內文，以及其錨定的文件文字。`add --target "some phrase"` 將新註解
   錨定到該片語首次出現處（必要時會拆分 runs；格式會保留）。
   `delete --id N` 移除註解與其標記，且不觸碰文件文字。
6. **範本。** 在文件中放入 `{{name}}` 形式的 tokens，並執行
   `scripts/docx_template.py`，搭配含值的 JSON 物件。使用 `--strict`
   可在仍有未填 tokens 時失敗；無論如何 JSON 輸出都會列出 `filled`
   數量與 `unfilled_tokens`。
7. **驗證**（務必執行）：用 `--text` 或 `--structure` 重新讀取輸出，
   並對任何經過修訂／註解手術的產物執行 `docx_validate.py`。

## 轉換為 PDF

不需腳本。安裝 LibreOffice 後即可無頭轉換：

```bash
soffice --headless --convert-to pdf --outdir outdir/ file.docx
```

先確認可用性（`command -v soffice || command -v
libreoffice`）。兩者皆不存在時，請告知使用者此環境無法轉 PDF，
不要自行 improvise——python-docx 無法渲染 PDF，版面保真度需要真正的渲染器。

## 常見陷阱

- **Token 被拆散到多個 runs。** Word 常把文字碎裂成多個 runs。
  取消輔助腳本會合併比對到的 runs（取代文字繼承第一個 run 的格式）；
  先執行 `docx_edit.py normalize` 可減少後續所有編輯的碎裂問題。
- **修訂涵蓋範圍。** `docx_revisions.py` 可處理 run 層級的插入與刪除
  （占絕大多數）。段落標記與表格列修訂、格式變更記錄以及移動
  可由 `--revisions` 偵測但不會自動解決——見
  `references/revisions-and-comments.md`，此類請交給 Word 處理。
- **註解串接。** 回覆與「已解決」狀態存於 `commentsExtended.xml`，
  本技能忽略該檔；新增的註解都是單純的頂層註解。
- **欄位結果由 Word 計算。** `toc`、`page-numbers` 以及 spec 選項
   `toc`／`footer_page_numbers` 寫入的是*欄位代碼*。
  Word/LibreOffice 在檔案開啟時才填入實際條目與編號（Word 可能會提示
  更新欄位）；python-docx 從不計算它們，因此在此之前顯示的是預留文字。
- **驗證是健康檢查，不是 schema 驗證。** `docx_validate.py` 檢查
  zip、必要部件、關係目標、圖片魔術位元組與被引用的樣式。
  它不是 XSD 驗證——檔案可能通過卻仍含 Word 不喜歡的 XML。
- **樣式名稱必須存在。** 套用文件中未定義的樣式會引發 `KeyError`。
  `Heading 1`、`List Bullet`、`List Number`、`Table Grid` 等內建樣式
  存在於預設範本；自訂樣式必須先在建立 spec 中宣告。
- **編號清單會重新起算。** `List Number` 依賴 Word 的預設編號；
  同一文件中的不同清單可能延續編號而非重新起算。需要精確多清單編號時
  請提醒使用者。
- **寫入儲存格會覆蓋格式。** `set-cell` 使用 `cell.text = ...`，
  會將該儲存格的 runs 重設為一般格式。
- **編碼。** 所有 JSON spec／數值檔皆明確以 UTF-8 讀取；
  撰寫自己的串接程式碼時，切勿依賴 locale 預設值。
- **不要解壓後直接 sed XML。** 請透過腳本（或 python-docx）編輯；
  對 `document.xml` 做純文字取代極易損壞檔案。`patch`／`write_file`
  只用於 JSON 輸入，絕不用於 `.docx` 本身。

## 驗證

- 建立／編輯／範本後，執行 `docx_read.py out.docx --text`，
  確認預期字串出現（且舊字串已消失）。
- 接受／拒絕後，`docx_revisions.py list` 應回傳 `[]`（或僅剩你刻意
  保留的 id）；註解手術後，`docx_comments.py list` 應反映變更，
  且 `--text` 輸出必須完全未變。
- `docx_validate.py out.docx` 對健康封裝應以 0 結束並回傳
  `"ok": true`——任何修訂／註解／欄位操作後都應執行。
- 範本請以 `--strict` 執行，或檢查 `unfilled_tokens == []`。
- 結構檢查：`--structure` 應顯示預期的標題大綱與表格形狀；
  `--styles` 確認自訂樣式已套用。
