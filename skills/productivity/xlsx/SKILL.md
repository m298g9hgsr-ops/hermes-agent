---
name: xlsx
description: 建立、讀取、編輯 Excel .xlsx 活頁簿與 CSV.
version: 1.1.0
author: Nous Research
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [excel, spreadsheet, xlsx, csv, openpyxl, productivity]
    category: productivity
    related_skills: [docx, pdf, powerpoint]
---

# Xlsx 技能

用 Python 與 openpyxl 處理 Excel .xlsx 活頁簿：建立含公式與圖表的
多工作表樣式活頁簿、檢視或傾印既有檔案、編輯儲存格與結構，以及與 CSV
互相轉換。所有輔助腳本皆為 argparse CLI，輸出 JSON 並使用明確的 UTF-8 I/O。

## 使用時機

- 建立 .xlsx 報表：多工作表、數字格式、樣式、合併儲存格、凍結窗格、
  自動篩選、設定格式化條件、圖表、資料驗證下拉選單、原生 Excel 表格、
  已定義名稱、超連結、儲存格註解、工作表保護。
- 讀取活頁簿：工作表清單、傾印資料為 JSON 或 CSV、列出公式與快取值、
  註解、已定義名稱、表格。
- 編輯既有檔案：設定儲存格、附加列、插入／刪除列欄
  （透過 `xlsx_restructure.py` 可感知參照）、複製／重新命名工作表、
  表格、名稱、註解、保護。
- 透過 LibreOffice 無頭重新計算公式（`xlsx_recalc.py`）。
- CSV 互通：支援型別推論與非 UTF-8 編碼。
- 不適用於舊版 .xls 二進位格式（先用 LibreOffice 轉換：
  `soffice --headless --convert-to xlsx old.xls`）。

## 前置需求

- Python 3.10+ 與 `openpyxl`（`pip install openpyxl`）。不需要其他
  第三方套件；其餘皆屬標準函式庫。
- 選擇性：LibreOffice（`soffice`），用於無頭重新計算或格式轉換。

## 執行方式

在本技能的 `scripts/` 目錄下用 `terminal` 工具執行輔助腳本
（每個腳本都支援 `--help`）：

```bash
python scripts/xlsx_create.py spec.json report.xlsx   # build from JSON spec
python scripts/xlsx_read.py report.xlsx --sheets      # inventory
python scripts/xlsx_read.py report.xlsx --json --sheet Data
python scripts/xlsx_read.py report.xlsx --formulas
python scripts/xlsx_edit.py report.xlsx --sheet Data --set B2=42 --recalc
python scripts/xlsx_restructure.py report.xlsx --sheet Data --insert-rows 3:2
python scripts/xlsx_recalc.py report.xlsx
python scripts/csv_to_xlsx.py data.csv out.xlsx --encoding utf-8
python scripts/xlsx_to_csv.py report.xlsx out.csv --sheet Data
```

用 `write_file` 撰寫 JSON spec，用 `read_file` 或直接從 stdout 檢視腳本的 JSON 輸出。

## 快速參考

| 任務 | 指令 |
|---|---|
| 依 spec 建立活頁簿 | `xlsx_create.py spec.json out.xlsx` |
| 工作表名稱＋維度 | `xlsx_read.py f.xlsx --sheets` |
| 傾印工作表為 JSON | `xlsx_read.py f.xlsx --json --sheet S` |
| 傾印工作表為 CSV | `xlsx_read.py f.xlsx --csv --out d.csv` |
| 列出公式＋快取值 | `xlsx_read.py f.xlsx --formulas` |
| 設定儲存格／公式 | `xlsx_edit.py f.xlsx --set "A1==SUM(B:B)"` |
| 附加一列 | `xlsx_edit.py f.xlsx --append '[1,"x",true]'` |
| 插入 2 列，參照不平移 | `xlsx_edit.py f.xlsx --insert-rows 3:2` |
| 插入 2 列，參照平移 | `xlsx_restructure.py f.xlsx --insert-rows 3:2` |
| 刪除欄，參照平移 | `xlsx_restructure.py f.xlsx --delete-cols B` |
| 建立原生表格 | `xlsx_edit.py f.xlsx --add-table Sales:A1:C9` |
| 在表格內附加 | `--table-append 'Sales=["West",5]'` |
| 列出表格 | `xlsx_edit.py f.xlsx --list-tables` |
| 已定義名稱 | `--define-name "Rates='Data'!$B$2:$B$9"` / `--delete-name Rates` / `xlsx_read.py f.xlsx --names` |
| 超連結 | `--hyperlink "A1=https://example.com|Docs"` |
| 儲存格註解 | `--note "B2=Check this|Reviewer"`；以 `xlsx_read.py f.xlsx --notes` 讀取 |
| 保護工作表（見常見陷阱） | `--protect your-password --unlock B2:B9` |
| 以 LibreOffice 重新計算 | `xlsx_recalc.py f.xlsx` |
| 複製／重新命名工作表 | `--copy-sheet Src:New --rename-sheet Old:New` |
| 開啟時強制重算 | `xlsx_edit.py f.xlsx --recalc` |
| CSV → 有樣式的 xlsx | `csv_to_xlsx.py in.csv out.xlsx` |
| xlsx → CSV | `xlsx_to_csv.py f.xlsx out.csv --encoding utf-8` |

## 操作步驟

1. **建立**：撰寫 JSON spec（格式記錄在 `xlsx_create.py --help`
   與其 docstring）。每個工作表支援 `rows`（純量或有樣式的儲存格物件）、
   稀疏的 `cells` 覆寫、`column_widths`、`row_heights`、`merges`、
   `freeze_panes`、`autofilter`、`conditional_formats`（cell_is 規則與
   色階）、`charts`（由儲存格範圍產生直條／折線／圓形圖）、
   `validations`（清單下拉選單）、`tables`（帶樣式名稱的原生 Excel
   表格）以及 `protection`。活頁簿層級的 `defined_names` 將名稱對應到
   參照。儲存格物件也可帶 `hyperlink` 與 `note`。
   型別值：JSON 數字／布林值直接通過；日期用
   `{"value": "2026-01-31", "type": "date"}`。
   數字格式為 Excel 格式字串：貨幣 `"$#,##0.00"`、百分比 `"0.0%"`、
   日期 `"yyyy-mm-dd"`。
2. **公式**：在 spec 中用 `"formula": "SUM(B2:B9)"`，或在編輯器中用
   `--set "C1==SUM(A:A)"` 設定。寫入公式時，請加上
   `"full_calc_on_load": true`（spec）或 `--recalc`（編輯器）；這會設定
   活頁簿的 `fullCalcOnLoad` 旗標，讓 Excel/LibreOffice 在開啟時重算
   全部內容。openpyxl 本身從不評估公式。
3. **讀取**：`--sheets` 取得清單（名稱、維度、合併範圍、圖表數、表格、
   保護、已定義名稱），`--json`／`--csv` 取得資料，`--formulas`
   將每條公式字串與其快取結果配對，`--notes` 取得儲存格註解，
   `--names` 取得已定義名稱。快取結果只有在檔案最後是由真正的試算表
   應用程式儲存時才存在；openpyxl 產生的檔案此處回傳 `null`。
   若要無頭產生結果，執行 `xlsx_recalc.py file.xlsx`
   （使用 LibreOffice；`soffice` 不存在時印出
   `{"recalculated": false, ...}` 並以 0 結束），再以 `--data-only` 重新載入。
4. **編輯**：`xlsx_edit.py` 依序套用重新命名／複製、結構性列欄變更，
   然後才是 `--set`／`--append`。未指定 `--out` 時直接就地編輯——
   若需要保留原始檔，請先複製。
5. **結構調整**：對含公式、合併、表格或篩選的工作表進行插入／刪除時，
   請改用 `xlsx_restructure.py` 而非 `xlsx_edit.py`。它會重寫**所有**
   工作表上的公式參照（絕對 `$` 參照、範圍、跨工作表參照）、平移合併、
   自動篩選、凍結窗格、驗證與設定格式化範圍、表格參照、已定義名稱以及
   列／欄尺寸，然後印出包含 `not_shifted` 清單的 JSON 報告。
   規則與限制見 `references/restructuring.md`。
6. **CSV 互通**：`csv_to_xlsx.py` 逐格推論 int/float/bool/ISO 日期並為
   標題列上樣式；`xlsx_to_csv.py` 輸出 ISO 日期、空儲存格輸出空字串。
   兩者預設皆為 UTF-8，並接受 `--encoding`（例如 `utf-8-sig` 取得
   Excel 相容的 BOM，`cp1252` 用於舊版 Windows 匯出）。

## 轉換為 PDF

LibreOffice 可無頭轉換（單一工作表的 CSV 匯出也適用）：

```bash
soffice --headless --convert-to pdf report.xlsx --outdir out/
soffice --headless --convert-to csv report.xlsx --outdir out/  # 1st sheet only
```

CSV 只會收錄第一個工作表；其他工作表請用
`xlsx_to_csv.py --sheet NAME`。若缺少 `soffice`，請安裝
LibreOffice，或將未轉換的檔案交還使用者。

## 常見陷阱

- **openpyxl 不做計算。** 公式結果只有在檔案先前曾由
  Excel/LibreOffice 儲存時，才能透過
  `load_workbook(path, data_only=True)` 取得，否則會得到 `None`。
- **`xlsx_edit.py` 的插入／刪除不會平移參照**（openpyxl 的原始行為）。
  請改用會平移的 `xlsx_restructure.py`——但即使它也無法移動圖表錨點、
  圖片或設定格式化的**規則**公式；請閱讀其 JSON 報告的 `not_shifted`
  清單與 `references/restructuring.md`。
- **工作表保護不是安全機制。** `--protect` 設定的是標準 xlsx
  工作表保護雜湊：只會向守規矩的應用程式表示「請勿編輯」，僅此而已。
  任何人都能透過編輯 zip 內的 XML 或在 LibreOffice 取消勾選來解除。
  永遠不要仰賴它保護機密性或完整性；它不做任何加密。
- **先用 `data_only=True` 再儲存**會靜默丟棄所有公式（被快取值取代）。
  除非這就是你的目的，否則絕不要以這種方式載入後儲存活頁簿。
- **載入會剔除圖表／圖片**：openpyxl 無法往返保留圖表，編輯含圖表的
  活頁簿後儲存會遺失圖表。編輯後請重新加入圖表，或避免重新儲存含圖表的檔案。
- **CSV 地區設定陷阱**：一律明確指定編碼（腳本已如此），並記得歐洲
  CSV 常用 `;` 分隔、小數點用逗號——請用 `--delimiter ';'`，並預期
  `"12,5"` 這類值仍是字串。
- **日期即日期時間**：Excel 以序號儲存日期；openpyxl 回傳
  `datetime`／`date` 物件。此處的傾印會輸出 ISO 字串。
- 工作表名稱上限 31 個字元，且不可含 `[ ] : * ? / \`。

## 驗證

- 建立後：執行 `xlsx_read.py out.xlsx --sheets`，確認工作表名稱、維度、
  合併範圍與圖表數符合預期。
- 以 `--json` 傾印資料，與來源值比對。
- 編輯後：重新傾印受影響的範圍；若寫入了公式，確認 `--formulas`
  有列出它們，且已套用 `--recalc`。
- 執行 `xlsx_restructure.py` 後：閱讀其 JSON 報告，再重跑
  `--formulas` 與 `--sheets`，確認參照與範圍落在預期位置。
- 需要完整視覺檢查時，用 LibreOffice 開啟：
  `soffice --headless --convert-to pdf out.xlsx` 並檢視 PDF。
