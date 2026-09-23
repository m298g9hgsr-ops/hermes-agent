---
name: llm-wiki
description: "Karpathy 的 LLM Wiki：建立與查詢互鏈 Markdown 知識庫."
version: 2.1.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [wiki, knowledge-base, research, notes, markdown, rag-alternative]
    category: research
    related_skills: [obsidian, arxiv]
---

# Karpathy 的 LLM Wiki

建立並維護一個持久、持續複利的知識庫，以互相連結的 markdown 檔案形式存在。
基於 [Andrej Karpathy 的 LLM Wiki 模式](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)。

與傳統 RAG（每次查詢都從頭重新發現知識）不同，wiki 只編譯一次知識並保持其最新。
交叉引用已經就位。矛盾已被標記。綜合反映所有已吸收的內容。

**分工：** 人類策展來源並指導分析。代理負責摘要、交叉引用、歸檔並維持一致性。

## 本技能的啟動時機

當使用者有以下情形時使用本技能：
- 要求建立、打造或開始一個 wiki 或知識庫
- 要求將某個來源匯入、加入或處理到他們的 wiki
- 提出問題且已設定路徑上存在既有的 wiki
- 要求 lint、稽核或健康檢查他們的 wiki
- 在研究脈絡中提到他們的 wiki、知識庫或「筆記」

## Wiki 位置

**位置：** 透過 `WIKI_PATH` 環境變數設定（例如在 `${HERMES_HOME:-~/.hermes}/.env` 中）。

若未設定，預設為 `~/wiki`。

```bash
WIKI="${WIKI_PATH:-$HOME/wiki}"
```

wiki 只是一個 markdown 檔案目錄 — 用 Obsidian、VS Code 或任何編輯器開啟它。不需要資料庫，不需要特殊工具。

## 架構：三個層次

```
wiki/
├── SCHEMA.md           # Conventions, structure rules, domain config
├── index.md            # Sectioned content catalog with one-line summaries
├── log.md              # Chronological action log (append-only, rotated yearly)
├── raw/                # Layer 1: Immutable source material
│   ├── articles/       # Web articles, clippings
│   ├── papers/         # PDFs, arxiv papers
│   ├── transcripts/    # Meeting notes, interviews
│   └── assets/         # Images, diagrams referenced by sources
├── entities/           # Layer 2: Entity pages (people, orgs, products, models)
├── concepts/           # Layer 2: Concept/topic pages
├── comparisons/        # Layer 2: Side-by-side analyses
└── queries/            # Layer 2: Filed query results worth keeping
```

**第一層 — 原始來源：** 不可變。代理只讀取，永不修改它們。
**第二層 — Wiki：** 代理所有的 markdown 檔案。由代理建立、更新與交叉引用。
**第三層 — Schema：** `SCHEMA.md` 定義結構、慣例與標籤分類。

## 續接既有的 Wiki（關鍵 — 每次會話都要做）

當使用者已有 wiki 時，**務必先定向再做任何事**：

① **讀取 `SCHEMA.md`** — 理解領域、慣例與標籤分類。
② **讀取 `index.md`** — 瞭解有哪些頁面及其摘要。
③ **掃描近期的 `log.md`** — 讀最後 20-30 條記錄以瞭解近期活動。

```bash
WIKI="${WIKI_PATH:-$HOME/wiki}"
# Orientation reads at session start
read_file "$WIKI/SCHEMA.md"
read_file "$WIKI/index.md"
read_file "$WIKI/log.md" offset=<last 30 lines>
```

只有在定向之後才可匯入、查詢或 lint。這可防止：
- 為已存在的實體建立重複頁面
- 遺漏對既有內容的交叉引用
- 與 schema 的慣例矛盾
- 重複已記錄的工作

對於大型 wiki（100+ 頁面），在建立任何新東西之前也先針對當前主題執行一次快速的 `search_files`。

## 初始化新的 Wiki

當使用者要求建立或開始 wiki：

1. 決定 wiki 路徑（來自 `$WIKI_PATH` 環境變數，或詢問使用者；預設 `~/wiki`）
2. 建立上述目錄結構
3. 詢問使用者 wiki 涵蓋什麼領域 — 要具體
4. 撰寫依該領域客製的 `SCHEMA.md`（見下方範本）
5. 撰寫含分區標頭的初始 `index.md`
6. 撰寫含建立記錄的初始 `log.md`
7. 確認 wiki 已就緒並建議第一批要匯入的來源

### SCHEMA.md 範本

依使用者的領域調整。schema 約束代理行為並確保一致性：

```markdown
# Wiki Schema

## Domain
[What this wiki covers — e.g., "AI/ML research", "personal health", "startup intelligence"]

## Conventions
- File names: lowercase, hyphens, no spaces (e.g., `transformer-architecture.md`)
- Every wiki page starts with YAML frontmatter (see below)
- Use `[[wikilinks]]` to link between pages (minimum 2 outbound links per page)
- When updating a page, always bump the `updated` date
- Every new page must be added to `index.md` under the correct section
- Every action must be appended to `log.md`
- **Provenance markers:** On pages that synthesize 3+ sources, append `^[raw/articles/source-file.md]`
  at the end of paragraphs whose claims come from a specific source. This lets a reader trace each
  claim back without re-reading the whole raw file. Optional on single-source pages where the
  `sources:` frontmatter is enough.

## Frontmatter
  ```yaml
  ---
  title: Page Title
  created: YYYY-MM-DD
  updated: YYYY-MM-DD
  type: entity | concept | comparison | query | summary
  tags: [from taxonomy below]
  sources: [raw/articles/source-name.md]
  # Optional quality signals:
  confidence: high | medium | low        # how well-supported the claims are
  contested: true                        # set when the page has unresolved contradictions
  contradictions: [other-page-slug]      # pages this one conflicts with
  ---
  ```

`confidence` and `contested` are optional but recommended for opinion-heavy or fast-moving
topics. Lint surfaces `contested: true` and `confidence: low` pages for review so weak claims
don't silently harden into accepted wiki fact.

### raw/ Frontmatter

Raw sources ALSO get a small frontmatter block so re-ingests can detect drift:

```yaml
---
source_url: https://example.com/article   # original URL, if applicable
ingested: YYYY-MM-DD
sha256: <hex digest of the raw content below the frontmatter>
---
```

The `sha256:` lets a future re-ingest of the same URL skip processing when content is unchanged,
and flag drift when it has changed. Compute over the body only (everything after the closing
`---`), not the frontmatter itself.

## Tag Taxonomy
[Define 10-20 top-level tags for the domain. Add new tags here BEFORE using them.]

Example for AI/ML:
- Models: model, architecture, benchmark, training
- People/Orgs: person, company, lab, open-source
- Techniques: optimization, fine-tuning, inference, alignment, data
- Meta: comparison, timeline, controversy, prediction

Rule: every tag on a page must appear in this taxonomy. If a new tag is needed,
add it here first, then use it. This prevents tag sprawl.

## Page Thresholds
- **Create a page** when an entity/concept appears in 2+ sources OR is central to one source
- **Add to existing page** when a source mentions something already covered
- **DON'T create a page** for passing mentions, minor details, or things outside the domain
- **Split a page** when it exceeds ~200 lines — break into sub-topics with cross-links
- **Archive a page** when its content is fully superseded — move to `_archive/`, remove from index

## Entity Pages
One page per notable entity. Include:
- Overview / what it is
- Key facts and dates
- Relationships to other entities ([[wikilinks]])
- Source references

## Concept Pages
One page per concept or topic. Include:
- Definition / explanation
- Current state of knowledge
- Open questions or debates
- Related concepts ([[wikilinks]])

## Comparison Pages
Side-by-side analyses. Include:
- What is being compared and why
- Dimensions of comparison (table format preferred)
- Verdict or synthesis
- Sources

## Update Policy
When new information conflicts with existing content:
1. Check the dates — newer sources generally supersede older ones
2. If genuinely contradictory, note both positions with dates and sources
3. Mark the contradiction in frontmatter: `contradictions: [page-name]`
4. Flag for user review in the lint report
```

### index.md 範本

索引依類型分區。每個條目一行：wikilink + 摘要。

```markdown
# Wiki Index

> Content catalog. Every wiki page listed under its type with a one-line summary.
> Read this first to find relevant pages for any query.
> Last updated: YYYY-MM-DD | Total pages: N

## Entities
<!-- Alphabetical within section -->

## Concepts

## Comparisons

## Queries
```

**擴充規則：** 任一分區超過 50 個條目時，依首字母或子領域拆分成子分區。索引總計超過 200 個條目時，建立 `_meta/topic-map.md`，依主題分組頁面以便更快導覽。

### log.md 範本

```markdown
# Wiki Log

> Chronological record of all wiki actions. Append-only.
> Format: `## [YYYY-MM-DD] action | subject`
> Actions: ingest, update, query, lint, create, archive, delete
> When this file exceeds 500 entries, rotate: rename to log-YYYY.md, start fresh.

## [YYYY-MM-DD] create | Wiki initialized
- Domain: [domain]
- Structure created with SCHEMA.md, index.md, log.md
```

## 核心操作

### 1. 匯入

當使用者提供來源（URL、檔案、貼上文字），將其整合進 wiki：

① **擷取原始來源：**
   - URL → 用 `web_extract` 取得 markdown，存到 `raw/articles/`
   - PDF → 用 `web_extract`（可處理 PDF），存到 `raw/papers/`
   - 貼上的文字 → 存到適當的 `raw/` 子目錄
   - 檔名要有描述性：`raw/articles/karpathy-llm-wiki-2026.md`
   - **加入原始 frontmatter**（`source_url`、`ingested`、正文的 `sha256`）。
     重新匯入同一 URL 時：重算 sha256、與儲存值比較 —
     相同則跳過，不同則標記偏離並更新。這在每次重新匯入時都夠便宜，
     且能抓到來源的靜默變更。

② **與使用者討論重點** — 什麼有趣、對領域什麼重要。
   （在自動化／cron 背景中略過此步 — 直接進行。）

③ **檢查既有內容** — 搜尋 index.md 並用 `search_files` 找出
   提及的實體／概念的既有頁面。這是成長中的 wiki 與一堆重複的差別。

④ **撰寫或更新 wiki 頁面：**
   - **新實體／概念：** 只有符合 SCHEMA.md 的頁面門檻才建立頁面
     （2+ 來源提及，或為某來源的核心）
   - **既有頁面：** 加入新資訊、更新事實、更新 `updated` 日期。
     新資訊與既有內容矛盾時，遵循更新政策。
   - **交叉引用：** 每個新頁面或更新的頁面必須透過 `[[wikilinks]]`
     連結到至少 2 個其他頁面。檢查既有頁面是否有回連。
   - **標籤：** 只使用 SCHEMA.md 分類中的標籤
   - **出處：** 綜合 3+ 來源的頁面，在其聲明可追溯到特定來源的段落結尾
     附加 `^[raw/articles/source.md]` 標記。
   - **信心：** 對意見重、變化快或單一來源的聲明，在 frontmatter 設定
     `confidence: medium` 或 `low`。除非聲明在多個來源間有充分支持，
     否則不要標為 `high`。

⑤ **更新導覽：**
   - 將新頁面依字母順序加入 `index.md` 的正確分區
   - 更新索引標頭中的「總頁面數」與「最後更新」日期
   - 追加到 `log.md`：`## [YYYY-MM-DD] ingest | Source Title`
   - 在日誌記錄中列出每個建立或更新的檔案

⑥ **回報變更** — 向使用者列出每個建立或更新的檔案。

單一來源可能觸及 5-15 個 wiki 頁面的更新。這是正常且預期的 — 就是複利效應。

### 2. 查詢

當使用者詢問 wiki 領域的問題：

① **讀取 `index.md`** 找出相關頁面。
② **對 100+ 頁面的 wiki**，也對所有 `.md` 檔案用 `search_files`
   搜尋關鍵詞 — 索引本身可能遺漏相關內容。
③ 用 `read_file` **讀取相關頁面**。
④ 由編譯的知識**綜合出答案**。引用你依據的 wiki 頁面：
   「Based on [[page-a]] and [[page-b]]...」
⑤ **有價值的答案回存** — 若答案是實質的比較、深度探討或新的綜合，
   在 `queries/` 或 `comparisons/` 建立頁面。
   不要歸檔瑣碎查閱 — 只存那些重新推導會很痛苦的答案。
⑥ **更新 log.md**，記錄查詢及其是否被歸檔。

### 3. Lint

當使用者要求 lint、健康檢查或稽核 wiki：

① **孤兒頁面：** 找出沒有來自其他頁面的入站 `[[wikilinks]]` 的頁面。
```python
# Use execute_code for this — programmatic scan across all wiki pages
import os, re
from collections import defaultdict
wiki = "<WIKI_PATH>"
# Scan all .md files in entities/, concepts/, comparisons/, queries/
# Extract all [[wikilinks]] — build inbound link map
# Pages with zero inbound links are orphans
```

② **損壞的 wikilink：** 找出指向不存在頁面的 `[[links]]`。

③ **索引完整性：** 每個 wiki 頁面都應出現在 `index.md`。比對
   檔案系統與索引條目。

④ **Frontmatter 驗證：** 每個 wiki 頁面都必須具備所有必要欄位
   （title、created、updated、type、tags、sources）。標籤必須在分類中。

⑤ **過時內容：** `updated` 日期比提及相同實體的最新來源還舊 90 天以上的頁面。

⑥ **矛盾：** 同主題但聲明衝突的頁面。尋找共享標籤／實體但陳述不同事實的頁面。
   將所有帶 `contested: true` 或 `contradictions:` frontmatter 的頁面
   提交使用者審閱。

⑦ **品質訊號：** 列出 `confidence: low` 的頁面，以及任何只引用單一來源
   卻未設信心欄位的頁面 — 這些是尋找佐證或降級為
   `confidence: medium` 的候選。

⑧ **來源偏離：** 對 `raw/` 中每個帶 `sha256:` frontmatter 的檔案，重算
   雜湊並標記不符。不符表示原始檔被編輯過（不應發生 — raw/ 不可變）
   或匯入後 URL 內容已變更。不是硬錯誤，但值得回報。

⑨ **頁面大小：** 標記超過 200 行的頁面 — 拆分候選。

⑩ **標籤稽核：** 列出使用中的所有標籤，標記不在 SCHEMA.md 分類中的。

⑪ **日誌輪替：** 若 log.md 超過 500 條記錄，輪替它。

⑫ **回報發現**，附具體檔案路徑與建議動作，依嚴重度分組
    （損壞連結 > 孤兒 > 來源偏離 > 爭議頁面 > 過時內容 > 風格問題）。

⑬ **追加到 log.md：** `## [YYYY-MM-DD] lint | N issues found`

## Wiki 的日常使用

### 搜尋

```bash
# Find pages by content
search_files "transformer" path="$WIKI" file_glob="*.md"

# Find pages by filename
search_files "*.md" target="files" path="$WIKI"

# Find pages by tag
search_files "tags:.*alignment" path="$WIKI" file_glob="*.md"

# Recent activity
read_file "$WIKI/log.md" offset=<last 20 lines>
```

### 批次匯入

一次匯入多個來源時，批次處理更新：
1. 先讀取所有來源
2. 識別所有來源中的實體與概念
3. 一次檢查它們的既有頁面（一次搜尋，而非 N 次）
4. 一次建立／更新頁面（避免冗餘更新）
5. 最後更新一次 index.md
6. 寫一條涵蓋整批的日誌記錄

### 歸檔

當內容被完全取代或領域範圍變更時：
1. 若 `_archive/` 目錄不存在則建立
2. 將頁面連同其原始路徑移到 `_archive/`（例如 `_archive/entities/old-page.md`）
3. 從 `index.md` 移除
4. 更新連結到它的頁面 — 將 wikilink 換成純文字 +「（已歸檔）」
5. 記錄歸檔動作

### Obsidian 整合

wiki 目錄開箱即可作為 Obsidian vault 使用：
- `[[wikilinks]]` 渲染為可點擊連結
- Graph View 視覺化知識網路
- YAML frontmatter 驅動 Dataview 查詢
- `raw/assets/` 資料夾存放以 `![[image.png]]` 參照的圖片

最佳設定：
- 將 Obsidian 的附件資料夾設為 `raw/assets/`
- 在 Obsidian 設定中啟用「Wikilinks」（通常預設已啟用）
- 安裝 Dataview 外掛以執行如 `TABLE tags FROM "entities" WHERE contains(tags, "company")` 的查詢

若與本技能一起使用 Obsidian 技能，將 `OBSIDIAN_VAULT_PATH` 設為與 wiki 路徑相同的目錄。

### Obsidian 無頭模式（伺服器與無顯示器機器）

在沒有顯示器的機器上，使用 `obsidian-headless` 取代桌面應用。
它透過 Obsidian Sync 在無 GUI 下同步 vault — 非常適合代理跑在伺服器上
寫入 wiki，而 Obsidian 桌面版在另一台裝置讀取的場景。

**設定：**
```bash
# Requires Node.js 22+
npm install -g obsidian-headless

# Login (requires Obsidian account with Sync subscription)
ob login --email <email> --password '<password>'

# Create a remote vault for the wiki
ob sync-create-remote --name "LLM Wiki"

# Connect the wiki directory to the vault
cd ~/wiki
ob sync-setup --vault "<vault-id>"

# Initial sync
ob sync

# Continuous sync (foreground — use systemd for background)
ob sync --continuous
```

**透過 systemd 的持續背景同步：**
```ini
# ~/.config/systemd/user/obsidian-wiki-sync.service
[Unit]
Description=Obsidian LLM Wiki Sync
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/path/to/ob sync --continuous
WorkingDirectory=%h/wiki
Restart=on-failure
RestartSec=10

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now obsidian-wiki-sync
# Enable linger so sync survives logout:
sudo loginctl enable-linger $USER
```

這讓代理在伺服器上寫入 `~/wiki`，而你在筆電／手機的 Obsidian 中瀏覽同一個
vault — 變更會在幾秒內出現。

## 常見陷阱

- **絕不修改 `raw/` 中的檔案** — 來源不可變。更正寫在 wiki 頁面。
- **務必先定向** — 新會話中的任何操作前先讀 SCHEMA + index + 近期 log。
  跳過會造成重複與遺漏交叉引用。
- **務必更新 index.md 與 log.md** — 跳過會讓 wiki 退化。它們是導覽骨幹。
- **不要為順帶提及建立頁面** — 遵循 SCHEMA.md 的頁面門檻。腳注中出現一次
  的名字不足以建立實體頁面。
- **不要建立沒有交叉引用的頁面** — 孤立頁面是隱形的。每個頁面必須
  連結到至少 2 個其他頁面。
- **Frontmatter 是必需的** — 它啟用搜尋、過濾與過時偵測。
- **標籤必須來自分類** — 隨手自創的標籤會退化成噪音。先把新標籤加到 SCHEMA.md
  再使用。
- **保持頁面可掃視** — wiki 頁面應能在 30 秒內讀完。超過 200 行的頁面請拆分。
  詳細分析移到專門的深度探討頁面。
- **大量更新前先詢問** — 若一次匯入會觸及 10+ 個既有頁面，先與使用者確認
  範圍。
- **輪替日誌** — log.md 超過 500 條記錄時，更名為 `log-YYYY.md` 重新開始。
  代理應在 lint 時檢查日誌大小。
- **明確處理矛盾** — 不要默默覆寫。標註兩邊聲明及日期、
  在 frontmatter 標記、提交使用者審閱。

## 相關工具

[llm-wiki-compiler](https://github.com/atomicmemory/llm-wiki-compiler) 是一個 Node.js CLI，
以同樣的 Karpathy 啟發把來源編譯成概念 wiki。它與 Obsidian 相容，
所以想要排程／CLI 驅動編譯管線的使用者可以指向本技能維護的同一個 vault。
取捨：它擁有頁面產生權（取代代理在頁面建立上的判斷），且為小型語料調校。
想要代理參與的策展就用本技能；想要批次編譯來源目錄就用 llmwiki。
