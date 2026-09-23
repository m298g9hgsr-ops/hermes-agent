---
name: design-md
description: 撰寫、驗證與匯出 Google DESIGN.md token 規格檔.
version: 1.1.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [design, design-system, tokens, ui, accessibility, wcag, tailwind, dtcg, google]
    related_skills: [popular-web-designs, claude-design, excalidraw, architecture-diagram]
---

# DESIGN.md 技能

DESIGN.md 是 Google 的開放規格（Apache-2.0，`google-labs-code/design.md`），用於向編碼代理描述視覺識別。單一檔案結合：

- **YAML 前置資料** — 機器可讀的設計權杖（規範性數值）
- **Markdown 內文** — 人類可讀的設計理由，組織成標準章節

權杖提供精確數值。散文告訴代理*為什麼*存在這些數值以及如何套用。CLI（`npx @google/design.md`）會檢查結構與 WCAG 對比度、比對版本間的回歸，並匯出至 Tailwind 或 W3C DTCG JSON。

## 使用時機

- 使用者要求 DESIGN.md 檔案、設計權杖或設計系統規格
- 使用者想在多個專案或工具間保持一致的 UI／品牌
- 使用者貼上現有 DESIGN.md 並要求 lint、diff、匯出或擴充
- 使用者要求把風格指南移植成代理可消費的格式
- 使用者想對其色盤做對比度／WCAG 無障礙驗證

若只是要視覺靈感或版面範例，請改用 `popular-web-designs`。若是要*從零設計一次性 HTML 作品*（原型、簡報、著陸頁、元件實驗室）的*流程與品味*，請使用 `claude-design`。本技能針對的是*正式規格檔本身*。

## 檔案結構

```md
---
version: alpha
name: Heritage
description: Architectural minimalism meets journalistic gravitas.
colors:
  primary: "#1A1C1E"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  neutral: "#F7F5F2"
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body-md:
    fontFamily: Public Sans
    fontSize: 1rem
rounded:
  sm: 4px
  md: 8px
  lg: 16px
spacing:
  sm: 8px
  md: 16px
  lg: 24px
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
---

## Overview

Architectural Minimalism meets Journalistic Gravitas...

## Colors

- **Primary (#1A1C1E):** Deep ink for headlines and core text.
- **Tertiary (#B8422E):** "Boston Clay" — the sole driver for interaction.

## Typography

Public Sans for everything except small all-caps labels...

## Components

`button-primary` is the only high-emphasis action on a page...
```

## 權杖類型

| 類型 | 格式 | 範例 |
|------|--------|---------|
| 顏色 | 任何 CSS 顏色（hex、`rgb()`、`oklch()`、命名色） | `"#1A1C1E"`、`"oklch(62% 0.18 250)"` |
| 尺寸 | 數字＋單位（`px`、`em`、`rem`） | `48px`、`-0.02em` |
| 權杖參照 | `{path.to.token}` | `{colors.primary}` |
| 字體 | 含 `fontFamily`、`fontSize`、`fontWeight`、`lineHeight`、`letterSpacing`、`fontFeature`、`fontVariation` 的物件 | 見上表 |

元件屬性白名單：`backgroundColor`、`textColor`、`typography`、`rounded`、`padding`、`size`、`height`、`width`。變體（hover、active、pressed）是**獨立的元件條目**，使用相關鍵名（`button-primary-hover`），而非巢狀結構。

## 標準章節順序

章節是可選的，但存在的章節應依此順序出現。linter 會標記順序錯誤的章節（`section-order`，警告）與重複標題——依規格的消費者會拒絕重複項，因此回傳檔案前請把兩者都修正。

1. Overview（別名：Brand & Style）
2. Colors
3. Typography
4. Layout（別名：Layout & Spacing）
5. Elevation & Depth（別名：Elevation）
6. Shapes
7. Components
8. Do's and Don'ts

未知章節會被保留而非報錯。未知權杖名稱只要數值類型有效就會被接受。未知元件屬性會產生警告。

## 工作流程：撰寫新 DESIGN.md

1. **詢問使用者**（或推斷）品牌調性、重點色與字體方向。若他們提供了網站、圖片或氛圍，將其轉譯為上方的權杖形狀。
2. 在專案根目錄用 `write_file` **撰寫 `DESIGN.md`**。務必包含 `name:` 與 `colors:`；其他章節可選但建議加入。
3. 在 `components:` 區塊中**使用權杖參照**（`{colors.primary}`）而非重複輸入 hex 數值，讓色盤保持單一來源。
4. **執行 lint**（見下方）。回傳前修復任何損壞的參照或 WCAG 未通過項。
5. **若使用者有現有專案**，也把 Tailwind 或 DTCG 匯出檔寫在檔案旁（`tailwind.theme.json`、`tokens.json`）。

## 工作流程：lint / diff / 匯出

CLI 是 `@google/design.md`（Node）。使用 `npx` — 不需要全域安裝。

```bash
# Validate structure + token references + WCAG contrast
npx -y @google/design.md lint DESIGN.md

# Compare two versions, fail on regression (exit 1 = regression)
npx -y @google/design.md diff DESIGN.md DESIGN-v2.md

# Export to Tailwind v3 theme JSON (`tailwind` is a back-compat alias)
npx -y @google/design.md export --format json-tailwind DESIGN.md > tailwind.theme.json

# Export to a Tailwind v4 CSS @theme block (--color-*, --text-*, --radius-*, ...)
npx -y @google/design.md export --format css-tailwind DESIGN.md > theme.css

# Export to W3C DTCG (Design Tokens Format Module) JSON
npx -y @google/design.md export --format dtcg DESIGN.md > tokens.json

# Print the spec itself — useful when injecting into an agent prompt
npx -y @google/design.md spec --rules-only --format json
```

所有指令都接受 `-` 讀取 stdin。`lint` 在有錯誤時回傳 exit 1（僅有警告時 exit 0）。`export` 即使來源有 lint 發現也一律在成功匯出時 exit 0 — 若要以此為關卡，請另外執行 `lint`。輸出預設為 JSON；若需結構化回報發現事項，請自行解析。

在 Windows 上，`design.md` 的 bin 名稱可能與 `.md` 檔案關聯衝突（靜默無效或檔案被編輯器開啟）。請使用無點別名：`npx -y -p @google/design.md designmd lint DESIGN.md`。

### Lint 規則參考（9 條規則，CLI 0.3.0 為止）

- `broken-ref`（錯誤）— `{colors.missing}` 指向不存在的權杖
- `contrast-ratio`（警告）— 元件 `textColor` 對 `backgroundColor` 低於 WCAG AA（4.5:1）
- `missing-primary`（警告）— 定義了顏色但沒有 `primary` 權杖
- `missing-typography`（警告）— 定義了顏色但沒有字體權杖
- `orphaned-tokens`（警告）— 顏色權杖從未被任何元件參照
- `section-order`（警告）— 章節脫離標準順序
- `unknown-key`（警告）— 頂層 YAML 鍵看起來像 schema 鍵的拼寫錯誤（`colours:` → `colors:`）；自訂擴充鍵保持沉默
- `token-summary`、`missing-sections`（資訊）— 數量統計與缺席的選用章節

當使用者在意無障礙時，在摘要中明確指出——WCAG 發現事項是使用此 CLI 最關鍵的理由。

## 常見陷阱

- **不要巢狀元件變體。** `button-primary.hover` 是錯的；作為同層鍵的 `button-primary-hover` 才是對的。
- **Hex 顏色必須是引號字串。** 否則 YAML 會被 `#` 噎到，或奇特地截斷 `#1A1C1E` 之類的數值。
- **負數尺寸也需要引號。** `letterSpacing: -0.02em` 會被解析成 YAML flow — 請寫 `letterSpacing: "-0.02em"`。
- **章節順序很重要，即使 linter 只發警告。** 若使用者給你的散文順序混亂，儲存前請重新排序以符合標準清單——合規的消費者會期待如此。
- **字體子屬性拼錯會被靜默丟棄。** 截至 CLI 0.3.0，像 `fontwight:` 這樣的拼寫錯誤不會產生任何發現，數值會從匯出中消失——請對照 schema 逐一確認子屬性名稱（`fontFamily`、`fontSize`、`fontWeight`、`lineHeight`、`letterSpacing`、`fontFeature`、`fontVariation`）。
- **`version: alpha` 是目前的規格版本**（截至 2026 年 7 月、CLI 0.3.0）。規格標記為 alpha — 留意破壞性變更。
- **權杖參照以點號路徑解析。** `{colors.primary}` 可行；`{primary}` 不行。

## 規格真相來源

- Repo: https://github.com/google-labs-code/design.md (Apache-2.0)
- CLI: `@google/design.md` on npm
- 產生的 DESIGN.md 檔案授權：依使用者專案所採用者；規格本身為 Apache-2.0。
