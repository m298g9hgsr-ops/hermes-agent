---
name: spike
description: "在動工前以丟棄式實驗驗證想法."
version: 1.0.0
author: Hermes Agent (adapted from gsd-build/get-shit-done)
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [spike, prototype, experiment, feasibility, throwaway, exploration, research, planning, mvp, proof-of-concept]
    related_skills: [sketch, subagent-driven-development]
---

# Spike 實驗

當使用者想在真正動工前**試探一個想法** — 驗證可行性、比較做法，或把任何數量研究都回答不了的未知浮上檯面 — 就使用本技能。Spike 天生就是可丟棄的。一旦還清它們的債，就扔掉。

當使用者說「let me try this」、「I want to see if X works」、「spike this out」、「before I commit to Y」、「quick prototype of Z」、「is this even possible?」或「compare A vs B」之類的話時載入本技能。

## 何時不使用

- 答案從文件或閱讀程式碼就知道 — 直接做研究，不用動手建
- 這是要上生產的路 — 改用 `plan` 技能
- 想法已經驗證過 — 直接跳去實作

## 若使用者安裝了完整 GSD 系統

若 `gsd-spike` 以兄弟技能出現（透過 `npx get-shit-done-cc --hermes` 安裝），當使用者想要完整 GSD 工作流程時，優先選 **`gsd-spike`**：持久的 `.planning/spikes/` 狀態、跨 session 的 MANIFEST 追蹤、Given/When/Then 裁決格式，以及與 GSD 其餘部分整合的 commit 模式。本技能是給沒有（或不想要）完整系統的使用者的輕量獨立版本。

## 核心方法

無論規模大小，每個 spike 都遵循這個迴圈：

```
decompose  →  research  →  build  →  verdict
   ↑__________________________________________↓
                  iterate on findings
```

### 1. 拆解

把使用者的想法拆成 **2-5 個獨立的可行性問題**。每個問題就是一個 spike。以 Given/When/Then 框架的表格呈現：

| # | Spike | 驗證（Given/When/Then） | 風險 |
|---|-------|----------------------------|------|
| 001 | websocket-streaming | Given a WS connection, when LLM streams tokens, then client receives chunks < 100ms | High |
| 002a | pdf-parse-pdfjs | Given a multi-page PDF, when parsed with pdfjs, then structured text is extractable | Medium |
| 002b | pdf-parse-camelot | Given a multi-page PDF, when parsed with camelot, then structured text is extractable | Medium |

**Spike 類型：**
- **standard** — 一種做法回答一個問題
- **comparison** — 同一個問題、不同做法（共享編號，字母後綴 `a`/`b`/`c`）

**好的 spike 問題：** 具體的可行性，帶可觀察的輸出。
**壞的 spike 問題：** 太廣、沒有可觀察的輸出，或只是「去讀 X 的文件」。

**依風險排序。** 最可能殺掉這個想法的 spike 最先跑。如果困難的部分行不通，原型做簡單部分沒有意義。

**只有**當使用者已確切知道要 spike 什麼並明說時，才跳過拆解。然後把他們的想法當單一 spike 處理。

### 2. 對齊（多 spike 的想法）

呈現 spike 表格。詢問：「照這個順序全建，還是要調整？」讓使用者在你寫任何程式碼之前刪除、重排或重新框定。

### 3. 研究（每個 spike 動工前）

Spike 不是免研究 — 你研究到足以選對做法，然後動手建。每個 spike：

1. **簡報。** 2-3 句：這個 spike 是什麼、為何重要、關鍵風險。
2. **若有真正的選擇，攤出競逐的做法：**

   | 做法 | 工具/函式庫 | 優點 | 缺點 | 狀態 |
   |----------|-------------|------|------|--------|
   | ... | ... | ... | ... | maintained / abandoned / beta |

3. **選一個。** 說明理由。若 2 個以上都可信，在 spike 內建快速變體。
4. **純邏輯且無外部相依時，跳過研究。**

研究步驟使用 Hermes 工具：

- `web_search("python websocket streaming libraries 2025")` — 找候選者
- `web_extract(urls=["https://websockets.readthedocs.io/..."])` — 讀實際文件（回傳 markdown）
- `terminal("pip show websockets | grep Version")` — 檢查專案的 venv 裡裝了什麼

沒有文件頁的函式庫，用 `read_file` 複製並讀它們的 `README.md` / `examples/`。Context7 MCP（若使用者有設定）也是好來源 — `mcp_*_resolve-library-id` 然後 `mcp_*_query-docs`。

### 4. 建造

每個 spike 一個目錄。保持獨立。

```
spikes/
├── 001-websocket-streaming/
│   ├── README.md
│   └── main.py
├── 002a-pdf-parse-pdfjs/
│   ├── README.md
│   └── parse.js
└── 002b-pdf-parse-camelot/
    ├── README.md
    └── parse.py
```

**偏向讓使用者能親手體驗的東西。** 當唯一的輸出是一行「it works」的日誌時，spike 就失敗了。使用者要能*感受* spike 在運作。預設選擇，依偏好順序：

1. 可執行的 CLI，接收輸入並印出可觀察的輸出
2. 展示該行為的最小 HTML 頁面
3. 只有一個端點的小 web server
4. 以可辨識的斷言鍛煉這個問題的單元測試

**深度勝過速度。** 絕不要跑完一次 happy path 就宣稱「好使」。測試邊緣案例。追著意外發現走。只有當調查是誠實的，裁決才可信。

**除非 spike 明確需要，否則避免：** 複雜的套件管理、建置工具/bundler、Docker、env 檔、設定系統。全部硬編碼 — 這是 spike。

**建造單一 spike** — 典型的工具序列：

```
terminal("mkdir -p spikes/001-websocket-streaming")
write_file("spikes/001-websocket-streaming/README.md", "# 001: websocket-streaming\n\n...")
write_file("spikes/001-websocket-streaming/main.py", "...")
terminal("cd spikes/001-websocket-streaming && python main.py")
# Observe output, iterate.
```

**平行比較 spike（002a / 002b）— 委派。** 當兩種做法可平行進行、且都需要真正的工程（不是 10 行的原型）時，用 `delegate_task` 分散：

```
delegate_task(tasks=[
    {"goal": "Build 002a-pdf-parse-pdfjs: ...", "toolsets": ["terminal", "file", "web"]},
    {"goal": "Build 002b-pdf-parse-camelot: ...", "toolsets": ["terminal", "file", "web"]},
])
```

每個子代理回傳自己的裁決；你寫對決結果。

### 5. 判定

每個 spike 的 `README.md` 以這樣收尾：

```markdown
## Verdict: VALIDATED | PARTIAL | INVALIDATED

### What worked
- ...

### What didn't
- ...

### Surprises
- ...

### Recommendation for the real build
- ...
```

**VALIDATED** = 核心問題以證據得到肯定的答案。
**PARTIAL** = 在 X、Y、Z 限制下能運作 — 記錄下來。
**INVALIDATED** = 行不通，原因是這個。這是一次成功的 spike。

## 比較型 spike

當兩種做法回答同一個問題（002a / 002b）時，**背靠背**地建，然後在最後做一次對決比較：

```markdown
## Head-to-head: pdfjs vs camelot

| Dimension | pdfjs (002a) | camelot (002b) |
|-----------|--------------|----------------|
| Extraction quality | 9/10 structured | 7/10 table-only |
| Setup complexity | npm install, 1 line | pip + ghostscript |
| Perf on 100-page PDF | 3s | 18s |
| Handles rotated text | no | yes |

**Winner:** pdfjs for our use case. Camelot if we need table-first extraction later.
```

## 前沿模式（挑下一個要 spike 的目標）

若 spike 已存在，而使用者問「我接下來該 spike 什麼？」，走訪既有目錄，找：

- **整合風險** — 兩個各自通過驗證、卻觸碰同一資源但從未一起測過的 spike
- **資料交接** — spike A 的輸出入指得與 spike B 的輸入相容；從未證明
- **願景缺口** — 被假定但未證明的能力
- **替代做法** — 對 PARTIAL 或 INVALIDATED spike 的不同角度

提出 2-4 個候選，以 Given/When/Then 呈現。讓使用者挑。

## 輸出

- 在倉庫根目錄建立 `spikes/`（若使用者用 GSD 慣例，則 `.planning/spikes/`）
- 每個 spike 一個目錄：`NNN-descriptive-name/`
- 每個 spike 的 `README.md` 記錄問題、做法、結果與裁決
- 把程式碼當可丟棄的 — 一個花 2 天「為生產環境清理」的 spike 是爛 spike

## 出處

改編自 GSD（Get Shit Done）專案的 `/gsd-spike` 工作流程 — MIT © 2025 Lex Christopherson（[gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)）。完整 GSD 系統提供持久化 spike 狀態、MANIFEST 追蹤，以及與更廣泛的規格驅動開發管線的整合；以 `npx get-shit-done-cc --hermes --global` 安裝。
