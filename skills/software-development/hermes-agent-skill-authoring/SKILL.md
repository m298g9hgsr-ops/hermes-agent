---
name: hermes-agent-skill-authoring
description: "撰寫倉庫內 SKILL.md 的 frontmatter 與結構."
version: 2.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [skills, authoring, hermes-agent, conventions, skill-md]
    related_skills: [requesting-code-review]
---

# 撰寫 Hermes-Agent 技能（倉庫內）

## 總覽

SKILL.md 有兩個可能的所在地：

1. **使用者本機：** `~/.hermes/skills/<maybe-category>/<name>/SKILL.md` — 個人用，不共享。透過 `skill_manage(action='create')` 建立。
2. **倉庫內（本技能講的就是這種）：** hermes-agent 倉庫中的 `skills/<category>/<name>/SKILL.md` 或 `optional-skills/<category>/<name>/SKILL.md` — 會提交、隨套件發布。使用 `write_file` + `git add`。`skill_manage(action='create')` **不會**指向這棵樹。

倉庫內技能必須符合倉庫的**嚴格撰寫標準**（見 AGENTS.md 的「Skill authoring standards (HARDLINE)」— 那一節才是準繩；本技能是操作導覽）。審查者會打回違反標準的 PR，所以事先符合比事後搶救便宜。

## 使用時機

- 使用者要你在「這個分支 / 倉庫 / commit」加上一個技能
- 你要提交一個應隨 hermes-agent 發布的可重用工作流程
- 你在編輯 `skills/` 或 `optional-skills/` 下的既有技能（小改用 `patch`，重寫用 `write_file`；`skill_manage` 對倉庫內技能仍可做 patch，但不能 `create`）
- **不要**用於：`~/.hermes/skills/` 的個人技能（直接用 `skill_manage`）

## 先決定層級：內建 vs 選用

- **內建（`skills/<category>/`）** — 日常主力行為、跨多種使用者廣泛有用、footprint 低。嚴格門檻：你能面不改色地說「使用者每個月會在 5 個以上的 session 載入它」。
- **選用（`optional-skills/<category>/`）** — 專屬利基、垂直領域（區塊鏈、遊戲、金融、單一應用）、例行工作/任務技能，或任何重型技能。透過 `hermes skills install official/<category>/<skill>` 安裝。

**不確定就放選用。** 之後升級很容易；降級很折騰。「任何需要它的人都會覺得有用」是選用層級的論點，不是內建的論點。

依工具**是什麼**挑類別，而不是它感覺像什麼（AI 代理 CLI 放進 `autonomous-ai-agents/`，即使它「感覺像 productivity」）。用 `search_files(pattern='*', target='files', path='skills')` 確認既有類別，不要隨意發明新的頂層類別。

**不要 router / index / hub 技能。** 核心內容是指向同儕技能的路由表的技能，只會多一層間接並重複同儕自己的 `使用時機` 觸發條件。如果少了「改載入技能 X」的指向就沒內容，那就別寫 — 目錄和各同儕的觸發條件已經在做那件事。

## 必要的 frontmatter

驗證器準繩：`tools/skill_manager_tool.py::_validate_frontmatter`。驗證器硬性要求：

- 以 `---` 作為最開頭位元組（前面不能有空白行）。
- 在內文前以 `\n---\n` 收尾。
- 能解析成 YAML mapping。
- 有 `name` 欄位。
- 有 `description` 欄位（驗證器上限 1024 字元 — 但見下方倉庫嚴格標準，那嚴得多）。
- 結尾 `---` 之後的內文非空。

倉庫標準形狀（所有欄位都要有，即使驗證器不強制）：

```yaml
---
name: my-skill-name               # lowercase, hyphens, ≤64 chars (MAX_NAME_LENGTH)
description: Concise capability statement, under sixty chars.
version: 0.1.0                    # semver; new skills start at 0.1.0
author: Real Name (github-handle), Hermes Agent
license: MIT
platforms: [linux, macos, windows]   # audit, don't guess — see Platform Gating
metadata:
  hermes:
    tags: [Short, Descriptive, Tags]
    related_skills: [other-in-repo-skill]
---
```

### `description` 規則（嚴格標準 — 驗證器的 1024 不是準則）

- **≤ 60 字元。** 一句話。以句點收尾。
- 陳述能力，不要陳述實作，也不要重複技能名稱。
- 不要用行銷字眼（「powerful」、「comprehensive」、「seamless」、「advanced」）。
- 系統提示的技能索引在 57 字元 + "..." 虛化 — 觸發/能力必須在這個窗口內自成一格。
- 若 description 含 `:`，請用雙引號包起來，否則 YAML 會解析成 mapping 而讓文件產生器崩潰。引號不計入 60 字元。

好的：`Track named companies for material news with cited digests.`
壞的：`Use when a user asks to monitor named competitors or companies for product launches, pricing changes, funding, ...`（240 字元 — 審查會打回）

### `author` 規則

- **人類優先**，其次才是「Hermes Agent」這個協作者：`Ben Barclay (benbarclay), Hermes Agent`。
- 投稿的技能絕不要只寫 `author: Hermes Agent` — 罵名給人類，不是工具，尤其（特別是）當代理起草了文字時。
- 維護者自撰的技能：`Teknium (teknium1), Hermes Agent`。

### `related_skills` 規則

- 每一項都必須對應到與你 PR 同一棵樹狀態下既有的**倉庫內**技能。不要參照只在規劃中、活在另一個 PR、或只存在於 `~/.hermes/skills/` 的技能。
- 驗證每一項：`search_files(pattern='<name>', target='files', path='skills')`（以及 `optional-skills/`）。

## 平台閘門：稽核，別照抄

`platforms:` 依主機 OS 閘門載入。依技能內文與腳本實際呼叫的東西設定：

| 技能僅使用… | `platforms:` |
|---|---|
| Hermes 工具 + 標準 Python + 跨平台 CLI | `[linux, macos, windows]` |
| bash 管線、`grep`/`awk`/`sed` 鏈、heredoc | `[linux, macos]` |
| `osascript`、`defaults`、`pmset` | `[macos]` |
| `apt`/`systemctl`/`/proc` | `[linux]` |

<!-- no-tmp: ok — names the anti-pattern skill authors must avoid -->
在 `scripts/` 中要搜尋的 POSIX-only 訊號：`fcntl`、`termios`、`pty`、`os.fork`、`os.killpg`、`signal.SIGKILL`、`os.kill(pid, 0)` 存活檢查、寫死的 `/tmp` `/proc` `/etc`。預設姿態：先修跨平台（`tempfile.gettempdir()`、`pathlib.Path`、`psutil.pid_exists`）；只有在相依真正綁定平台時才收窄閘門，並在 `## Pitfalls` 說明原因。

## 大小限制

- 完整 SKILL.md：上限 100,000 字元（`MAX_SKILL_CONTENT_CHARS` 強制），但目標是**簡單技能約 100 行、複雜技能約 200 行**。同儕技能落在 8-14k 字元。
- 重或分支特定的材料放 `references/*.md`、`templates/` 或 `scripts/` — 由 SKILL.md 指向，不要內聯。
- 不要預期模型每次呼叫都內聯寫出剖析器或非平凡邏輯 — 在 `scripts/` 附一支輔助腳本並以路徑指向它。

## 內文結構（現代化章節順序）

```
# <Skill> Skill
2-3 sentence intro: what it does, what it doesn't do, dependency stance.

## When to Use          — bulleted triggers (+ "Don't use for:" counter-triggers)
## Prerequisites        — exact env vars, installs, API key sourcing
## How to Run           — canonical invocation through the `terminal` tool
## Quick Reference      — flat command list, no narration
## Procedure            — numbered steps, each with a checkable completion criterion
## Pitfalls             — known limits, things that look broken but aren't
## Verification         — how to prove the skill worked
```

不是每個章節都適用於每個技能（純程序的任務技能可能沒有快速參考），但使用時機 + 可操作的內文 + 常見陷阱 + 驗證是最底線。砍掉行銷開場、「Setup Check」這種空轉，以及 Prerequisites 已經講過的環境變數重複解釋。

### 指向 Hermes 工具，不要用裸 shell

技能需要某項能力時，在反引號中點名正確的 Hermes 工具：`terminal`、`read_file`、`write_file`、`patch`、`search_files`、`web_search`、`web_extract`、`browser_navigate`、`vision_analyze`、`delegate_task`、`cronjob`。**不要**點名代理已包裝的 shell 工具（`grep` → `search_files`、`cat` → `read_file`、`sed`/`awk` → `patch`、`find`/`ls` → `search_files target='files'`）。CLI 包裝類技能應把呼叫框成 `terminal(command="<tool> ...", timeout=...)` — 裸 shell 敘述（「執行 `foo --version`」）是會被審查打回的不合規。若技能相依 MCP 伺服器，點名它並在 Prerequisites 記錄安裝方式。

### 永遠不要使用機器本機路徑

寫倉庫相對路徑（`skills/...`、`tools/skill_manager_tool.py`）。寫死在已提交技能中的 `/home/<you>/...` 路徑會對所有其他使用者失效，而且是審查立即亮紅燈的項目。

## 寫作品質原則

技能存在的目的是讓代理的流程更可預測 — 代理能可靠地遵循同一套有用的紀律。

1. **最佳化流程的可預測性。** 若某行不改變行為，就砍掉。
2. **選擇正確的上下文載入。** description 每個回合都要付費；細節放內文或連結的參考。
3. **步驟以完成條件收尾。** 可檢查，且在重要處要窮盡：「每個被修改的檔案都有交代」勝過「總結變更」。
4. **規則與它管的概念放在一起。**
5. **用強而有力的領頭詞**（「緊湊迴圈」、「根因」、「回歸測試」）取代又長又重複的解釋。
6. **修剪重複與空話。** 「小心一點」和「使用最佳實踐」不會改變模型行為 — 換成可檢查的條件或刪掉。

## 測試與文件（倉庫技能的必要項目）

1. **測試**放在 `tests/skills/test_<skill>_skill.py` — 只用標準庫 + pytest + `unittest.mock`，不碰真實網路。執行方式：`scripts/run_tests.sh tests/skills/test_<skill>_skill.py -q`。（通用的 `tests/tools/test_skill_manager_tool.py` 通過，不能證明**你的**技能的任何事。）
2. **文件重新產生：** 執行 `python website/scripts/generate-skill-docs.py`，然後套用範圍紀律 — 產生器會改寫**每一頁**自動產生頁。用 `git checkout --` 把不是你的東西全部還原；最終 diff 只該顯示你的 SKILL.md、你的每一頁技能文件、一列目錄列，以及一列 `website/sidebars.ts` 插入（用 `search_files(pattern='<your-slug>', path='website/sidebars.ts')` 驗證 — 恰好一個命中，否則該頁是孤兒）。
3. **`.env.example`**（只有技能需要新環境變數時）：一個清楚劃界的註解區塊；檔案其他地方一律不要動。

## 工作流程

1. **調查同儕** — 用 `search_files(target='files')` 看目標類別，讀 2-3 個同儕 SKILL.md 以對齊語氣與結構。優先擴充既有技能，而不是建立狹隘的兄弟技能。
2. **決定層級與類別**（見上文）。不確定就放選用 — 並且先問再推，不要預設。
3. **起草** — 用 `write_file` 寫到 `skills/<category>/<name>/SKILL.md`（或 `optional-skills/...`）。
4. **本機驗證**：
   ```python
   import yaml, re, pathlib
   content = pathlib.Path("skills/<category>/<name>/SKILL.md").read_text()
   assert content.startswith("---")
   m = re.search(r'\n---\s*\n', content[3:])
   fm = yaml.safe_load(content[3:m.start()+3])
   assert "name" in fm and "description" in fm
   assert len(fm["description"]) <= 60, f"description {len(fm['description'])} chars — hardline is 60"
   assert fm["description"].endswith(".")
   assert "platforms" in fm
   assert len(content) <= 100_000
   ```
   同時確認每個 `related_skills` 項目存在於倉庫內。
5. **加上測試 + 重新產生文件**（上一節）。
6. **git add + commit** 在作用中的分支；開 PR。
7. **注意：** 目前 session 的技能載入器有快取 — `skill_view` / `skills_list` 在新 session 之前不會看到新技能。這是預期行為，不是 bug。

## 編輯既有的倉庫內技能

- **小修：** `skill_manage(action='patch', ...)` 可用於倉庫內技能，`patch` 也可以。
- **大改重寫：** 用 `write_file` 寫整個 SKILL.md。
- **輔助檔案：** `write_file` 到技能目錄下的 `references/`、`templates/` 或 `scripts/`。
- **一律提交** — 倉庫內技能是原始碼，不是執行期狀態。frontmatter 變更後要重跑文件產生器。

## 常見陷阱

1. **對倉庫內技能用 `skill_manage(action='create')`。** 它會寫到 `~/.hermes/skills/`，不是倉庫樹。請用 `write_file`。
2. **把驗證器的限制當準則。** 驗證器允許 1024 字元的 description；審查打回超過 60 的。驗證器不檢查 `platforms:`、author 格式、測試或文件 — 審查會。
3. **投稿技能寫 `author: Hermes Agent`。** 人類優先。
4. **`---` 前有前導空白。** 任何前導空白行或 BOM 都會驗證失敗。
5. **Description 過於籠統，或觸發點埋在第 57 字元之後。**
6. **`related_skills` 指向不存在於倉庫內的技能**（使用者本機、規劃中、或在兄弟 PR）。
7. **重複同儕。** 先調查類別；擴充而不是另立兄弟。
8. **跳過文件產生器，或把它造成的無關漂移一起推上去。** 兩個方向都錯：不重新產生 = 沒有文件頁的孤兒技能；盲產生 = 湧入其他技能漂移的臃腫 diff。
9. **預期目前 session 看到新技能。** 載入器在 session 啟動時初始化。
10. **讓技能累積沉積物。** 加入新規則時，把被取代的舊措辭移除。

## 驗證清單

- [ ] 層級是刻意決定的（內建門檻：每月 5+ session；否則放 `optional-skills/`）
- [ ] 檔案在 `skills/<category>/<name>/SKILL.md` 或 `optional-skills/<category>/<name>/SKILL.md`
- [ ] Frontmatter 從第 0 位元組以 `---` 開頭、以 `\n---\n` 收尾
- [ ] `name`、`description`、`version`、`author`、`license`、`platforms`、`metadata.hermes.{tags, related_skills}` 全部齊備
- [ ] Description ≤ 60 字元、一句話、以句點收尾、無行銷字眼
- [ ] `author` 人類貢獻者優先
- [ ] `platforms:` 依實際內文/腳本稽核，不是從同儕抄來
- [ ] 每個 `related_skills` 項目在倉庫內解析得到
- [ ] 內文遵循現代化章節順序；指令透過 Hermes 工具框定
- [ ] 檔案中任何地方都沒有機器本機路徑
- [ ] 每個有序步驟都有可檢查的完成條件
- [ ] `tests/skills/test_<skill>_skill.py` 在 `scripts/run_tests.sh` 下通過
- [ ] 文件已重新產生且有範圍紀律；側欄對該 slug 恰有一個條目
- [ ] 在預定分支 `git add` + commit；PR 已開
