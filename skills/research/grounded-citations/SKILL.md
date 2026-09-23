---
name: grounded-citations
description: "讓回答與文件建立於可查證的引用來源之上."
version: 1.2.0
author: Hermes Agent + Teknium
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Research, Citations, Grounding, Sources, Web, Reports]
    category: research
    related_skills: [arxiv, pdf, reddit-reading, rss-feeds, youtube-content]
---

# 有根據的引用

每個取自外部來源的聲明都配上行內編號引用與 `Sources:` 清單，Perplexity 風格。一個帳冊腳本擁有 `url → [n]` 對映，使編號與 URL 來自檢索而非記憶 — 模型只會發出它被交給的小整數。

對高風險工作，同一個帳冊兼作查證鏈：逐字引文附到每個來源（除非字面上出現在抓取的頁面文字中，否則拒絕），來自模型知識的聲明標記 `[unverified]`，而 `verify --evidence` 會讓任何引用來源沒有證據的草稿失敗。

本技能涵蓋聊天中的回答、書面文件（markdown、PDF、docx、投影片）與研究報告。不涵蓋學術 BibTeX 管線 — 會議論文請用 `arxiv` 技能，本技能會為其提供資料（見 `references/citation-formats.md`）。

## 使用時機

只要回答或產出仰賴的是你抓取而來、而非本就知道的資訊，就使用：

- 研究、比較、新聞摘要、「X 的現況為何」
- 任何你寫入磁碟、引述／轉述／報告外部事實的產出 — 報告、簡報、文件、投影片、wiki 頁面
- 使用者會想查證你工作的事實查核
- 衝突來源必須標註出處的多來源綜合

當檢索只是另一個任務的附帶動作時，略過行內引用 — 編寫途中快速查語法／版本、隨意聊天、創意寫作。只有使用者可能會想要該連結時才提 URL。

## 前置需求

除標準工具集外無其他需求。`scripts/sources.py` 是僅用標準庫的 Python 3。檢索來自已設定的工具：`web_search`、`web_extract`、`browser_navigate` 或 `terminal`（curl、CLI）。

帳冊位置：`$HERMES_HOME/cache/citations/ledger.json`（依設定檔）。每個任務可用 `--ledger <path>` 或 `HERMES_CITATION_LEDGER` 覆寫。

## 執行方式

```bash
S=~/.hermes/skills/research/grounded-citations/scripts/sources.py

python "$S" reset                                  # start a clean ledger
python "$S" add https://example.com/a --title "A"  # prints: [1]
python "$S" add https://example.com/b --title "B"  # prints: [2]
python "$S" list                                   # ledger table
python "$S" render                                 # Sources: block
python "$S" verify draft.md                        # catch bad citations
```

`add` 是幂等且 URL 正規化的：同一頁面在同一帳冊內永遠回傳相同 id，因此 id 在多輪搜尋／擷取間保持穩定。

## 快速參考

| 操作 | 指令 |
|---|---|
| 為新任務建立乾淨帳冊 | `sources.py reset` |
| 註冊來源、取得其 id | `sources.py add <url> [--title T]` |
| 一次註冊多個 | `sources.py add <url1> <url2> ...` |
| 從 JSON 工具輸出註冊 | `sources.py ingest results.json` |
| 附加逐字證據到來源 | `sources.py quote <id> --text "exact wording" --from page.txt` |
| 顯示帳冊 | `sources.py list [--json]` |
| 渲染 Sources 區塊 | `sources.py render [--style markdown\|plain\|footnotes\|bibtex\|evidence] [--only 1,3]` |
| 只渲染草稿引用到的項目 | `sources.py render --cited-in draft.md` |
| 原地重寫草稿的 Sources 區塊 | `sources.py render --replace-in draft.md` |
| 檢查草稿的引用 | `sources.py verify draft.md [--strict] [--min-coverage 0.6] [--evidence]` |

## 操作步驟

① **在任務開始時重設帳冊**，當該任務將產生有根據的回答或文件。若要續做 id 已在草稿中的工作則跳過重設 — 重用帳冊可保持編號穩定。

② **在檢索時註冊每個來源。** 每次 `web_search` / `web_extract` / `browser_navigate` / 抓取之後，將 URL 傳給 `sources.py add`（或將原始 JSON 管線到 `sources.py ingest`）。要在撰寫散文之*前*做。事後憑記憶註冊，正是本技能要防止的失敗模式。

③ **邊撰寫邊引用。** 將括號中的 id 緊接在來源支持的每句之後：

```
Ice floats because it is less dense than liquid water.[1][2]
```

- 括號前不留空格；每個 id 各用一組括號。
- 每句最多 3 個 id。逐句引用，不要在結尾一次倒出。
- 只用帳冊回傳的 id。絕不捏造 id 或 URL。
- 來自你自己知識的聲明不加引用。
- 衝突來源：呈現兩種讀法，各自帶自己的 id。
- 依來源所述逐字引用數字、日期與名稱；明確標記缺口（「找不到 X 的來源」），不要粉飾。

④ **用 `sources.py render --cited-in <draft>` 附加 Sources 區塊**，使 id → URL 對映由帳冊機械產生，而非重新打字。非 markdown 目標請挑選對應的 `--style` 並遵循 `references/citation-formats.md` 的放置規則（docx 用腳註、PDF/LaTeX 用章節末註、投影片用 Sources 頁、wiki 輸出用逐頁來源清單）。

⑤ **交付前驗證** — `sources.py verify <draft>` 在未知 id、與帳冊不符的 Sources 區塊，或（搭配 `--min-coverage`）引用過於稀薄的散文時以非零結束。修正後重跑。

⑥ **聊天回答**遵循相同步驟，草稿就是你的回覆：註冊來源、行內引用、以渲染的 `Sources:` 清單結尾。簡短回答可用 `sources.py render --only <ids>` 渲染區塊，不必寫入檔案。

## 多平台掃描

「大家對 X 有什麼看法」／「在網路上研究 X」不是一次 `web_search`。散開到各類來源、平行蒐集，然後綜合，每個聲明都標註其來自的平台：

| 來源類型 | 路徑 | 補充什麼 |
|---|---|---|
| 開放網路 | `web_search` → `web_extract` | 官方文件、文章、公告 |
| 社群討論 | `reddit-reading`（`search`、`thread`） | 真實使用者經驗、抱怨、變通方法 |
| 部落格／發行版／變更日誌 | `rss-feeds`（`read`、`discover`） | 有日期的一手文章、版本歷史 |
| 影片 | `youtube-content` | 操作示範、展示、演講 |
| 程式碼 | 搭配 `gh search repos` / `gh search issues` 的 `terminal` | 實作、公開缺陷 |
| X/Twitter | `xurl`（需要 API 存取） | 公告、開發者閒聊 |

`reddit-reading` 與 `rss-feeds` 技能是選用的。若不存在，先安裝 `hermes skills install official/social-media/reddit-reading` 或 `hermes skills install official/research/rss-feeds` 再使用。

依步驟 ②，每條路徑一到 URL 就在帳冊中註冊。將意見與量測分開：Reddit 討論串證明使用者*回報*了某事，而非該事為真；搭配一手來源或標註為輿情。回報各平台的覆蓋缺口（「Reddit 搜尋沒有比三月更新的結果」），而非默默縮減到有效的部分。

## 事實查核模式

對讀者必須能查證鏈條的工作 — 醫療、法律、財務、安全、爭議聲明，或使用者要求事實查核時 — 從引用升級到證據：

① **為每個來源附加逐字引文。** 擷取頁面後，將其文字存檔，並附加承載每個聲明的句子：

```bash
python "$S" quote 1 --text "Ice is about 9% less dense than liquid water." --from page1.txt
```

除非引文逐字出現在證據文字中，否則會被拒絕（忽略空白、大小寫與 markdown 標記 — 擷取文字中的 `_[ERAP1](https://…)_` 這類行內連結會與讀者看到的純散文相符），因此轉述或記錯的數字無法冒充證據。從抓取的文字複製貼上；絕不重新打字。依讀者看到的樣子引用該句 — 比對器會替你看穿擷取器的標記，所以你不必在引文中重現連結語法或跳脫星號。

② **用 `[unverified]` 標記模型知識的聲明。** 找不到來源的關鍵聲明改用明確標記而非引用：

```
The refactor likely predates the 2.0 release.[unverified]
```

`verify --min-coverage` 將 `[unverified]` 句計為已涵蓋 — 目標是每個聲明都有宣告的出處，而非每句都有引用。若關鍵聲明可以查證，就去查；`[unverified` 留給真正無法查證的，而以 `[unverified]` 標記為主的事實查核產出應在摘要中說明此事。

③ **對有爭議的事實以第二個獨立來源交叉查核。** 當兩個來源不一致時，引用兩種讀法各自的 id 與引文，並說明你偏重哪一個及為何。單一來源是轉述；兩個獨立來源才是佐證。

④ **用證據閘道驗證並渲染證據區塊：**

```bash
python "$S" verify report.md --evidence --min-coverage 0.5
python "$S" render --style evidence --replace-in report.md
```

`--evidence` 若任何引用的來源沒有附加引文就使草稿失敗。`evidence` 渲染樣式在每個來源的 URL 下印出其引文，使產出呈現聲明 → 來源 → 確切支持文字，沒有 anything 被信以為真。用 `--replace-in <draft>` 原地重寫既有 Sources 區塊（幂等 — 附加更多引文後可安全重跑）；`--cited-in` 改印到 stdout。兩者都輸出標題 `## Sources`（`--style plain` 輸出 `Sources:`）。

**`--min-coverage` 計算什麼。** 覆蓋率是
`已宣告出處的句子 / 散文句子`。散文句子是 Sources 區塊之後、標題（`#`）、
表格列（`|`）與圍欄程式碼被剔除後，4+ 個字詞的非空行片段；
區塊引號標記會被剝除。出處由 `[n]` 引用或 `[unverified]`
標記宣告，兩者兼具的句子只計一次。先不設門檻執行 `verify`
並讀取 `info: stats:` 行以查看計數，再挑選數字。

## 常見陷阱

- **撰寫之後才註冊。** 帳冊必須由工具輸出填充，而非從草稿重建 — 那正好重新引入編號要消除的幻覺 URL 風險。
- **任務中途重新編號。** 絕不手動編輯草稿中的 id。id 是帳冊身份；若草稿引用 `[4]`，`[4]` 必須仍是該來源。`reset` 只在任務之間執行。
- **把 URL 打進 Sources 區塊。** 一律 `render`。手打的 URL 是未經驗證的聲明。
- **把搜尋片段當成你讀過頁面來引用。** `web_search` 描述只支持它字面所說的。當聲明需要內文時引用擷取的頁面 — 先 `web_extract` 它。
- **過度引用。** 一句三個 id 是上限；每個子句都有引用會讓文字難以閱讀，並掩蓋哪個來源承載主要重量。
- **在程式碼／設定產出中引用帳冊。** 來源註解屬於散文產出與文件標頭，不在產生的程式碼內部。
- **平行子代理。** 每個子代理有自己的工作目錄；若輸出會合併，用 `--ledger`（或 `HERMES_CITATION_LEDGER`）將它們都指向同一個帳冊，否則 id 會衝突。
- **從片段而非頁面引用。** 證據引文必須來自擷取的頁面文字，而非搜尋結果描述 — 先 `web_extract`、儲存文字，再 `quote --from` 該檔案。
- **轉述後放進 `quote --text`。** 逐字檢查會拒絕它；修法是找到真正的句子，而不是改寫到碰巧相符。
- **把 `[unverified]` 當逃生艙。** 它標記的是少數真正無法找到來源的聲明；若多數句子都帶著它，代表任務需要更多檢索，而不是更多標記。
- **手動編輯 Sources 區塊。** 用 `render --replace-in <draft>`；自己切檔案可能造成過時或重複的區塊，隨後被 `verify` 標記。

## 驗證

```bash
python "$S" verify report.md --strict --min-coverage 0.5
```

綠色代表：草稿中的每個 `[n]` 都存在於帳冊、Sources 區塊恰好列出被引用的 id 及其帳冊 URL、且有來源句子中被引用的比例達標。即使結束碼為 0 也要閱讀警告 — 未被引用的已註冊來源通常代表某個聲明在編輯過程中失去了出處。
