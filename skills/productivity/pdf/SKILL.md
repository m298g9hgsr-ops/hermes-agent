---
name: pdf
description: PDF 檔案：建立、讀取、合併、填表、OCR 與文字編輯.
version: 1.1.0
author: Nous Research
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [pdf, documents, forms, ocr, text-extraction, reportlab, pypdf, pdfplumber, pymupdf, marker]
    category: productivity
    related_skills: [docx, xlsx, powerpoint]
---

# PDF 技能

依結構化 spec 建立 PDF、建立與填寫 AcroForm 表單（含版面 lint 與視覺疊圖）、
擷取文字／表格／中繼資料、合併／分割／旋轉／浮水印／蓋章頁面、匯出頁面圖片、
管理中繼資料與附件，以及加密／解密——使用 pypdf、reportlab 與 pdfplumber。
兩個已納入的延伸能力放在 references/（執行該類任務前請先閱讀對應檔案）：

- **掃描／純圖片 PDF 與 OCR**（pymupdf 快速路徑、marker-pdf 品質路徑、
  scripts/extract_pymupdf.py ＋ scripts/extract_marker.py）：`references/ocr-extraction.md`
- **以自然語言提示編輯既有 PDF 內的文字**（nano-pdf CLI）：`references/nano-pdf-editing.md`

## 使用時機

- 產生報告、發票或多頁文件為 PDF。
- 依 JSON spec 建立可填寫的 AcroForm（文字／核取方塊／單選／下拉選單），
  並先進行版面 lint。
- 從 PDF 取出文字、表格（JSON/CSV）、中繼資料或表單欄位值。
- 合併、分割、旋轉、擷取頁面子集、加浮水印、在座標處蓋上文字／圖片、
  書籤，或壓縮 PDF。
- 將頁面匯出為 PNG 供視覺檢查或交給 OCR；設定／清除文件中繼資料；
  新增／擷取檔案附件。
- 填寫或壓平 AcroForm 表單；以密碼加密或解密。
- 不適用於掃描／純圖片 PDF（請用 `references/ocr-extraction.md`），
  也不適用於需要像素級精確的 HTML 轉 PDF（請用無頭瀏覽器）。

## 前置需求

- Python 3.10+ 與 `pypdf`、`reportlab`、`pdfplumber`：
  `python -m pip install pypdf reportlab pdfplumber`
- 選擇性：頁面點陣化（`pdf_page_image.py`、疊圖渲染）需要
  `python -m pip install pypdfium2`，或 PATH 上的 poppler `pdftoppm`。
  腳本依序退回 pypdfium2 → pdftoppm，兩者皆不存在時回傳
  `{"rendered": false, "missing": [...]}`（結束碼 0）。
- 每個輔助腳本皆延遲檢查 import，缺少相依套件時會印出安裝提示。

## 執行方式

所有輔助腳本都在 `scripts/` 且為 argparse CLI——用 `terminal` 工具執行；
每個都支援 `--help`。它們嚴格以 UTF-8 讀寫 JSON、將 JSON 結果印到
stdout，並以非零結束碼表示失敗。

```bash
python scripts/pdf_create.py spec.json -o out.pdf         # build PDF from JSON spec
python scripts/pdf_make_form.py formspec.json -o form.pdf # build fillable AcroForm from JSON spec
python scripts/pdf_form_layout.py formspec.json           # lint form layout BEFORE building
python scripts/pdf_form_layout.py formspec.json --render-overlay boxes.png [--pdf form.pdf]
python scripts/pdf_read.py doc.pdf --text                 # per-page text (JSON)
python scripts/pdf_read.py doc.pdf --tables --csv-dir t/  # tables to JSON + CSV files
python scripts/pdf_read.py doc.pdf --meta                 # metadata, page sizes, encrypted/scanned flags
python scripts/pdf_read.py form.pdf --fields              # form fields: name, type, value
python scripts/pdf_merge.py a.pdf b.pdf -o merged.pdf [--bookmarks]
python scripts/pdf_split.py doc.pdf --pages 1-3,7 -o part.pdf [--rotate 90]
python scripts/pdf_fill_form.py form.pdf --fields-json values.json -o filled.pdf [--flatten]
python scripts/pdf_secure.py doc.pdf --encrypt -o enc.pdf --user-password your-password
python scripts/pdf_secure.py enc.pdf --decrypt -o dec.pdf --password your-password
python scripts/pdf_watermark.py doc.pdf --stamp mark.pdf -o stamped.pdf [--under]
python scripts/pdf_stamp.py doc.pdf -o out.pdf --text "DRAFT" --x 150 --y 400 \
    --font-size 60 --rotation 45 --opacity 0.3 --color "#cc0000" [--pages 1-3]
python scripts/pdf_stamp.py doc.pdf -o out.pdf --image sig.png --x 400 --y 60 --width 120
python scripts/pdf_page_image.py doc.pdf --pages 1-3 --dpi 150 --out-dir imgs/
python scripts/pdf_meta.py doc.pdf --set-meta --title "T" --author "A" -o out.pdf
python scripts/pdf_meta.py doc.pdf --attach data.csv -o out.pdf
python scripts/pdf_meta.py doc.pdf --list-attachments | --extract-attachments dir/
```

## 快速參考

| 任務 | 工具 | 指令 / API |
|---|---|---|
| 建立文件（標題、表格、圖片） | reportlab platypus | `pdf_create.py spec.json -o out.pdf` |
| 建立可填寫表單 | reportlab acroForm | `pdf_make_form.py formspec.json -o form.pdf` |
| 表單版面 lint／疊圖 | 純 Python + PIL | `pdf_form_layout.py formspec.json [--render-overlay o.png]` |
| 逐頁文字 | pdfplumber | `pdf_read.py f.pdf --text` |
| 表格 → JSON/CSV | pdfplumber | `pdf_read.py f.pdf --tables` |
| 中繼資料／尺寸／加密／掃描 | pypdf + pdfplumber | `pdf_read.py f.pdf --meta` |
| 合併（＋大綱） | pypdf | `pdf_merge.py a.pdf b.pdf -o m.pdf` |
| 分割／擷取／旋轉 | pypdf | `pdf_split.py f.pdf --pages 2-5 --rotate 90` |
| 列出／填寫／壓平表單 | pypdf | `pdf_read.py --fields`, `pdf_fill_form.py` |
| 加密／解密（AES-256） | pypdf | `pdf_secure.py --encrypt/--decrypt` |
| 浮水印／蓋章 PDF 頁面 | pypdf | `pdf_watermark.py f.pdf --stamp w.pdf` |
| 在座標處蓋文字／圖片 | reportlab + pypdf | `pdf_stamp.py f.pdf --text "Sign here" --x 400 --y 60` |
| 頁面 → PNG（檢查／交給 OCR） | pypdfium2 或 pdftoppm | `pdf_page_image.py f.pdf --pages 1-3 --out-dir imgs/` |
| 設定／清除中繼資料、附件 | pypdf | `pdf_meta.py --set-meta / --attach / --extract-attachments` |
| 壓縮內容串流 | pypdf | `pdf_split.py f.pdf --pages 1-N --compress` |

## 操作步驟

1. **先檢查。** 執行 `pdf_read.py file.pdf --meta`。檢查 `encrypted`
   （若為 true，先用 `pdf_secure.py --decrypt` 解密）與
   `likely_scanned_pages`。若頁面為純圖片，用
   `pdf_page_image.py --pages <scanned> --dpi 300 --out-dir imgs/`
   匯出後，把 PNG 交給 `references/ocr-extraction.md` 技能——不要把
   空白文字回報成「沒有內容」。
2. **建立。** 用 `write_file` 撰寫 JSON spec（元素：`heading`、
   `paragraph`、`table`、`image`、`pagebreak`；選填 `title`／`author`
   中繼資料；頁碼會自動加入），然後執行 `pdf_create.py`。
   版面很重要時，用 `vision_analyze` 檢視渲染出的頁面圖片。
3. **擷取。** `--text` 回傳逐頁字串的 JSON 陣列；`--tables` 回傳逐頁
   列陣列，也可輸出 CSV 檔。用 `read_file` 讀取結果；絕不直接目視
   二進位 PDF。
4. **操作。** `pdf_merge.py` 串接並可為每個來源檔加一個書籤；
   `pdf_split.py` 處理頁面範圍（從 1 開始，例如 `1-3,5,9-`）、
   以 90° 為單位的旋轉，以及 `--compress`。浮水印作法是先準備單頁
   蓋章 PDF（例如用 `pdf_create.py`），再用 `pdf_watermark.py` 疊上；
   需要一行完成的蓋章（「在此簽名」、斜向 DRAFT、角落標籤）時，
   用 `pdf_stamp.py` 在明確座標蓋上文字或圖片。
5. **建立表單。** 寫一份表單 spec JSON（欄位的 `label_box`／`entry_box`
   以 PDF 點為單位——見 `references/forms.md`），用
   `pdf_form_layout.py` lint 並修正所有回報問題，選擇性用
   `vision_analyze` 檢視 `--render-overlay` PNG，然後用
   `pdf_make_form.py` 建立，並以 `pdf_read.py --fields` 確認。
6. **填寫表單。** 先列出欄位（`--fields`）確認精確名稱與型別，用
   `write_file` 寫入 UTF-8 JSON `{"FieldName": "value"}`
   （核取方塊接受 `true`／`false`；單選／選擇值必須符合欄位的匯出選項），
   再執行 `pdf_fill_form.py`。之後以 `--fields` 重新讀取確認值已寫入。
7. **中繼資料與附件。** `pdf_meta.py --set-meta` 寫入
   Title/Author/Subject/Keywords（DocInfo）；`--clear-meta` 清除；
   `--attach`／`--list-attachments`／`--extract-attachments` 處理內嵌
   檔案的往返。
8. **保護。** 以不同的使用者／擁有者密碼與 AES-256 加密。要移除你
   知道的密碼時，`--decrypt` 會寫出未加密的副本。
9. **驗證**（見下方）後再回報成功。

## 常見陷阱

- **掃描 PDF**：`extract_text()` 為空且頁面皆為圖片，代表沒有文字層。
  請轉往 `references/ocr-extraction.md`；不要捏造文字。
- **壓平限制**：`pdf_fill_form.py --flatten` 使用 pypdf 的壓平支援，
  會把 widget 外觀轉成頁面內容。對純文字欄位與核取方塊可靠，但可能
  遺失或錯誤渲染特殊 widget（rich text、自訂外觀串流、某些單選群組）。
  請用 `vision_analyze` 視覺檢查壓平結果；需要萬無一失的壓平時，
  備援方案是外部渲染器（例如 Ghostscript 或 `pdftoppm`＋重組）。
- **NeedAppearances**：填寫後，檢視器只有在外觀串流存在時才會渲染值。
  填寫腳本會設定 AcroForm 的 `NeedAppearances` 旗標，讓合規檢視器
  重新產生；某些精簡檢視器會忽略它——需要顯示保真度時請壓平。
- **非拉丁文表單值**：值本身正確儲存（UTF-16），但欄位的預設字型可能
  缺少字形，即使資料往返正常，檢視器仍可能顯示空白。請用 `--fields`
  驗證，不要只靠目視。
- **壓縮預期**：`--compress` 只壓縮內容串流。典型節省 0–20%；對以圖片
  為主或已壓縮串流的 PDF 毫無幫助。它無法取代圖片降採樣
  （那屬於 Ghostscript 的領域）。
- **權限旗標不具強制力**：擁有者密碼的權限位元（禁止列印、禁止複製）
  是檢視器「可能」尊重的禮貌性請求；任何函式庫（含 pypdf）都能讀取
  並剝除它們。只有使用者密碼才真正以加密守住內容。絕不要把權限旗標
  當成安全機制。
- **表格擷取是啟發式的**：pdfplumber 由框線／字詞對齊偵測表格；
  無框線或含合併儲存格的表格可能需要調整 `table_settings` 或人工清理。
- **頁碼索引**：輔助 CLI 採用從 1 開始的頁碼；pypdf API 從 0 開始。
  腳本會轉換——不要重複轉換。
- **旋轉蓋章文字擷取**：pdfplumber 的行分組會打亂旋轉字形
  （45° 的「DRAFT」會擷取成散落字母）；旋轉蓋章請改用 pypdf 的
  `extract_text()` 或渲染圖片驗證。
- **單選群組**：reportlab 每群組需要 ≥2 個 `radio()` widget，填寫需要
  帶斜線的匯出值（`"/red"`），且單選的壓平保真度最差——見
  `references/forms.md`。
- **中繼資料範圍**：`pdf_meta.py` 只寫入經典的 DictInfo 字典；
  內嵌的 XMP 中繼資料（若有）不受影響，可能在某些檢視器顯示不同值。
- **PDF/A 不在範圍內**：pypdf/reportlab 無法產製或驗證符合標準的
  PDF/A。若需要歸檔一致性，請透過 `terminal` 工具執行 Ghostscript
  （例如 `gs -dPDFA=2 -dPDFACompatibilityPolicy=1 -sColorConversionStrategy=UseDeviceIndependentColor -sDEVICE=pdfwrite -o out.pdf in.pdf`
  並搭配合適的 ICC 設定檔），再用 veraPDF 驗證——兩者皆為外部安裝，
  且結果仍需驗證而非假設。
- 旋轉角度必須是 90 的倍數；加密輸入必須先解密才能進行其他操作。

## 驗證

- 建立／合併／分割後：`pdf_read.py out.pdf --meta` ——確認
  `page_count`，若有旋轉則確認逐頁 `rotation`。
- 擷取後：檢查 JSON 非空，並抽核一個已知字串或儲存格。
- 表單設計迴圈：`pdf_form_layout.py spec.json` 必須以 0 結束；接著
  `--render-overlay boxes.png --pdf form.pdf`，用 `vision_analyze`
  檢視 PNG（紅色＝帶欄位名稱的輸入框，藍色＝標籤框），詢問是否有重疊、
  錯位、標籤脫離欄位。反覆 spec → lint → 疊圖直到乾淨。
- 建立表單後：`pdf_read.py form.pdf --fields` 應列出每個 spec 欄位，
  型別與選項正確。
- 填表後：`pdf_read.py filled.pdf --fields` 並比對值
  （完全相符，含非 ASCII）。
- 蓋章後：重新擷取文字（旋轉蓋章用 pypdf），或用 `pdf_page_image.py`
  渲染頁面並以 `vision_analyze` 檢查。
- 中繼資料／附件變更後：`pdf_read.py --meta` ／
  `pdf_meta.py --list-attachments`，並重新擷取附件做位元組比對。
- 加密後：`--meta` 顯示 `"encrypted": true` 且無密碼開啟失敗；
  解密後，文字擷取結果應與原始檔一致。
- 任何視覺項目（浮水印、壓平表單）：渲染後用 `vision_analyze` 檢查。
