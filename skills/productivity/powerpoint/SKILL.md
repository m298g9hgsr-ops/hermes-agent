---
name: powerpoint
description: 用 python-pptx 建立、讀取、編輯 .pptx 簡報.
version: 1.1.0
author: Nous Research
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [pptx, powerpoint, presentations, slides, office, python-pptx]
    category: productivity
    related_skills: [docx, xlsx, pdf]
---

# Powerpoint 技能

使用 python-pptx 函式庫建立、檢視與編輯 PowerPoint（.pptx）簡報。
五個輔助腳本涵蓋：依 JSON spec 建立簡報、結構化讀回、就地編輯、
範本驅動的品牌簡報，以及投影片渲染——全部離線運作，不需要安裝
PowerPoint。

## 使用時機

- 使用者要求建立投影片、報告簡報或提案簡報。
- 需要從別人分享的 .pptx 抽出文字、備註、表格、圖表資料或圖片。
- 需要更新既有簡報：取代文字、更新或修補圖表資料、更換 logo、
  複製／刪除／重排投影片、設定背景、頁尾、超連結或演講者備註。
- 必須依公司 .pptx 範本產出符合品牌規範的簡報。
- **不適用於** .ppt（舊版二進位）檔——若 LibreOffice 可用，
  請先用 `soffice --convert-to pptx old.ppt` 轉換。

## 前置需求

- Python 3.10+ 與已安裝的 `python-pptx`
  （`pip install python-pptx`）。
- 選擇性：LibreOffice（`soffice`）加上 poppler（`pdftoppm` 或
  `pdftocairo`），用於將投影片渲染成 PNG 與匯出 PDF。
  `pptx_render.py` 會用 `shutil.which` 偵測兩者，缺失時優雅降級
  （回報 `{"rendered": false, "missing": [...]}`，結束碼 0）——
  所有建立／讀取／編輯操作都不依賴它們。
- 用 `terminal` 檢查可用性：
  `python -c "import pptx; print(pptx.__version__)"` 以及
  `which soffice pdftoppm`。

## 執行方式

所有腳本都在 `scripts/`、支援 `--help`、將 JSON 印到 stdout，
並以非零結束碼表示失敗。用 `terminal` 執行：

```bash
python scripts/pptx_create.py deck.json out.pptx
python scripts/pptx_read.py deck.pptx --outline      # full JSON outline
python scripts/pptx_read.py deck.pptx --notes        # speaker notes
python scripts/pptx_read.py deck.pptx --images ./img # export pictures
python scripts/pptx_edit.py deck.pptx --replace-text "Old Corp" "New Corp"
python scripts/pptx_edit.py deck.pptx --chart-data update.json
python scripts/pptx_edit.py deck.pptx --duplicate-slide 2
python scripts/pptx_edit.py deck.pptx --remove-slide 3 --move-slide 2 0
python scripts/pptx_from_template.py brand.pptx out.pptx --values vals.json
python scripts/pptx_render.py deck.pptx --outdir ./render  # slide PNGs
```

用 `write_file` 撰寫 JSON spec；用 `read_file` 檢視腳本輸出與產生的 JSON。

## 快速參考

| 任務 | 指令 |
|---|---|
| 依 spec 建立新簡報 | `pptx_create.py spec.json out.pptx` |
| 16:9 vs 4:3 | spec 中的 `"slide_size": "16:9"` 或 `"4:3"` |
| 大綱輸出為 JSON | `pptx_read.py deck.pptx --outline` |
| 匯出圖片 | `pptx_read.py deck.pptx --images DIR` |
| 取代文字 | `pptx_edit.py deck.pptx --replace-text OLD NEW` |
| 取代圖表資料 | `pptx_edit.py deck.pptx --chart-data spec.json` |
| 修補單一數列 | 同一旗標，spec 加 `"ops"`（見下方） |
| 更換圖片 | `pptx_edit.py deck.pptx --swap-image N NAME new.png` |
| 複製投影片 | `pptx_edit.py deck.pptx --duplicate-slide N` |
| 刪除投影片 | `pptx_edit.py deck.pptx --remove-slide N` |
| 重排投影片 | `pptx_edit.py deck.pptx --move-slide FROM TO` |
| 投影片背景 | `pptx_edit.py deck.pptx --set-background N RRGGBB` |
| 超連結 runs | `pptx_edit.py deck.pptx --hyperlink N TEXT URL` |
| 啟用投影片編號 | `pptx_edit.py deck.pptx --enable-slide-number N` |
| 頁尾文字 | `pptx_edit.py deck.pptx --set-footer N TEXT` |
| 設定備註 | `pptx_edit.py deck.pptx --set-notes N TEXT` |
| 附加備註 | `pptx_edit.py deck.pptx --append-notes N TEXT` |
| 套用範本 | `pptx_from_template.py tpl.pptx out.pptx --values v.json` |
| 渲染投影片 PNG | `pptx_render.py deck.pptx --outdir DIR` |

## 操作步驟

### 1. 建立簡報

撰寫 JSON spec（完整格式見 `pptx_create.py --help`），再執行
`pptx_create.py`。每張投影片可設定：`layout`（title、
title_content、section、two_content、title_only、blank）、`title`、
`subtitle`、`bullets`（字串，或含 `level` 0-4、`size` pt、
`bold`、`italic`、`font`、十六進位 `color`、超連結 `link` URL 的
字典）、`background`（純色 hex）、`footer`（文字；啟用版面配置的
頁尾預留區）、`slide_number`（true；啟用版面配置的投影片編號
預留區）、`images`（路徑＋以英吋計的 left/top/width/height）、
`tables`（`rows` 為串列的串列）、`shapes`（rectangle、
rounded_rectangle、oval、diamond、right_arrow、chevron，含 `fill`
hex＋選填 `text`）、`charts`（bar、bar_h、line、pie，含
`categories`＋`series`），以及 `notes`（演講者備註）。

### 2. 讀取簡報

`pptx_read.py deck.pptx --outline` 回傳投影片尺寸、版面配置清單，
以及每張投影片的：版面配置名稱、所有形狀文字、表格儲存格、圖片清單
（檔名／副檔名／位元組）、圖表 categories/series/values，以及演講者備註。
用 `--images DIR` 把內嵌圖片傾印成檔案，需要查看內容時再對匯出的圖片
執行 `vision_analyze`。

### 3. 編輯簡報

`pptx_edit.py` 會在一次執行中組合多個操作；用 `--output` 保留原始檔。
文字取代會掃描投影片形狀、表格儲存格與備註。
圖片更換會重新指向圖片的 relationship id，以保留位置與大小。
刪除投影片會移除對應 relationship 與 `<p:sldId>` 項目；重排則在
`<p:sldIdLst>` 內移動 `<p:sldId>` 元素（python-pptx 沒有公開 API
——腳本直接處理 XML 層）。`--duplicate-slide N` 會附加投影片 N 的
獨立深層複本：形狀 XML 加上圖片／媒體／超連結 relationships 皆會
複製且 rId 重新對應，因此編輯副本絕不會動到原投影片。含圖表的投影片
會被拒絕（見常見陷阱）。`--set-notes`／`--append-notes` 編輯演講者
備註；`--set-background`、`--hyperlink`、`--enable-slide-number`
與 `--set-footer` 負責簡報整體修飾。

圖表更新透過 `--chart-data` 接收 JSON spec。完整取代：
`{"slide": 0, "chart": 0, "categories": [...], "series": {...}}`。
需要精細編輯時改傳 `"ops"` ——一個包含
`{"op": "update_series", "name": ..., "values": [...]}`、
`add_series`、`remove_series`、`rename_category`（`from`／`to` 或
`index`）與 `set_title` 的清單。python-pptx 只能整批取代圖表資料集
（`replace_data`），因此 ops 的實作是「讀取現有 → 修改 → 取代」；
逐部位的體驗只是包裝層，任何無法以 categories＋數值 series 表達的
圖表資料都會在往返過程中被正規化。

### 4. 依範本建立

`pptx_from_template.py` 會開啟品牌 .pptx、跨投影片／表格／備註
取代每個 `{{token}}`（依 values JSON），並可附加使用範本自身版面配置
的新投影片（依版面配置名稱或索引），使其繼承母版的字型與色彩。
小技巧：想從零投影片的範本開始，事後用
`pptx_edit.py --remove-slide` 刪除既有投影片。

### 5. 視覺驗證

`pptx_render.py deck.pptx --outdir ./render` 用 `soffice --headless`
把簡報轉成 PDF，再用 `pdftoppm`（或 `pdftocairo`）分割成每張投影片
一張 PNG。輸出 JSON 列出 PNG 路徑——逐一用 `vision_analyze` 檢查。
任一工具缺失時，腳本以 0 結束並輸出
`{"rendered": false, "missing": [...]}` 與指引；請退回
`pptx_read.py` 的 JSON 大綱，它驗證內容與結構，只是無法驗證視覺。

## 轉換為 PDF

若已安裝 LibreOffice，可直接把完成的簡報匯出為 PDF：

```bash
soffice --headless --convert-to pdf --outdir ./out deck.pptx
```

輸出位於 `./out/deck.pdf`。主機上未安裝的字型會被取代，因此出貨 PDF 前
請先做渲染驗證（操作步驟第 5 步）。沒有離線的純 Python .pptx→PDF
路徑；若缺少 `soffice`，請據實說明，不要近似代替。

## 常見陷阱

- **Run 拆分**：PowerPoint 會在拼字檢查與編輯邊界把段落文字拆成多個
  runs。`--replace-text` 會先合併格式完全相同的相鄰 runs，因此跨這類
  runs 的比對項仍會在完全保留格式下被取代。只有當比對項跨越*格式確實
  不同*的多個 runs 時，段落才會以第一個 run 的格式重寫——取代後請
  檢查這些投影片。
- **含圖表的投影片無法複製**：每個圖表 relationship 都內嵌獨立的
  XLSX 活頁簿部件；可靠複製該圖表不受支援，因此 `--duplicate-slide`
  會乾淨地拒絕含圖表的投影片，而不是損壞簡報。請改在新投影片上
  重建圖表。外部超連結與圖片／媒體 rels 會被帶過去；版面配置與
  備註 rels 則重新建立。
- **圖表 ops 只是包裝層**：python-pptx 會取代整個資料集；
  `"ops"` 是透過 `replace_data` 往返既有繪圖資料，且無法更改圖表
  *型別*。
- **重排是 XML 層操作**：python-pptx 沒有受支援的重排 API。
  `--move-slide` 直接操作 `<p:sldIdLst>`；一般簡報安全，但事後請
  重新讀取確認。
- **不支援跨簡報複製投影片** ——複製只在同一份簡報內有效，該處
  版面配置與母版是共用的。
- 頁尾／投影片編號的啟用是從投影片的版面配置複製預留區；在沒有這些
  預留區的版面配置上，`--set-footer` 會以清楚的訊息失敗（請改為
  新增文字方塊）。
- 超連結套用到整個 run；`--hyperlink` 會連結該投影片上所有包含指定
  文字的 run。
- python-pptx 預設範本為 4:3；建立腳本除非在 spec 中另行指定，一律
  設為 16:9。自訂範本會保留自己的尺寸。
- 版面配置索引因範本而異。品牌範本請先列出版面配置名稱：
  `pptx_read.py template.pptx --outline`（`layouts_available`）。
- 空白版面配置上 `slide.shapes.title` 為 None——建立腳本已處理，
  但撰寫臨時 python-pptx 程式碼時請記得這點。
- 寫入 spec 檔時一律傳入 `encoding="utf-8"`；`{{city}}` 這類 tokens
  可能被填入非 ASCII 值。

## 驗證

1. 任何建立／編輯後，執行 `pptx_read.py OUT.pptx --outline`，檢查
   投影片數量、文字、表格、備註與圖表值符合預期。
2. `--images DIR` 加上檔案大小檢查可確認圖片已內嵌。
3. 用 `pptx_render.py deck.pptx --outdir ./render` 渲染每張投影片，
   並逐一用 `vision_analyze` 檢查 PNG——這能抓到大綱無法發現的形狀
   重疊、文字截斷與色彩問題。渲染工具缺失時腳本會說明；此時改依賴
   大綱。
4. 內建測試套件是完整合約：
   `python -m pytest tests/ -q`（需要 python-pptx ＋ pytest）。
