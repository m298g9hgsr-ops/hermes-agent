---
name: baoyu-infographic
description: 資訊圖表：21 種版面 × 21 種風格.
version: 1.56.1
author: 宝玉 (JimLiu)
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [infographic, visual-summary, creative, image-generation]
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-infographic
---

# 資訊圖表產生器

改編自 [baoyu-infographic](https://github.com/JimLiu/baoyu-skills)，適用於 Hermes Agent 的工具生態系。

兩個維度：**版面**（資訊結構）×**風格**（視覺美學）。可自由將任何版面與任何風格組合。

## 使用時機

當使用者要求建立資訊圖表、視覺摘要、圖文資訊，或使用「信息圖」、「視覺化」、「高密度信息大圖」等詞彙時觸發本技能。使用者提供內容（文字、檔案路徑、URL 或主題），並可選指定版面、風格、長寬比或語言。

## 選項

| 選項 | 數值 |
|--------|--------|
| 版面 | 21 種（見版面圖庫），預設：bento-grid |
| 風格 | 21 種（見風格圖庫），預設：craft-handmade |
| 長寬比 | 具名：landscape（16:9）、portrait（9:16）、square（1:1）。自訂：任何 W:H 比例（如 3:4、4:3、2.35:1） |
| 語言 | en、zh、ja 等 |

## 版面圖庫

| 版面 | 最適合 |
|--------|----------|
| `linear-progression` | 時間軸、流程、教學 |
| `binary-comparison` | A vs B、前後對比、優缺點 |
| `comparison-matrix` | 多因素比較 |
| `hierarchical-layers` | 金字塔、優先級層級 |
| `tree-branching` | 分類、分類學 |
| `hub-spoke` | 中心概念搭配相關項目 |
| `structural-breakdown` | 爆炸視圖、剖面 |
| `bento-grid` | 多主題、總覽（預設） |
| `iceberg` | 表面 vs 隱藏面向 |
| `bridge` | 問題-解決方案 |
| `funnel` | 轉換、過濾 |
| `isometric-map` | 空間關係 |
| `dashboard` | 指標、KPI |
| `periodic-table` | 分類收藏集 |
| `comic-strip` | 敘事、序列 |
| `story-mountain` | 情節結構、張力弧線 |
| `jigsaw` | 相互連結的部分 |
| `venn-diagram` | 重疊概念 |
| `winding-roadmap` | 旅程、里程碑 |
| `circular-flow` | 循環、重複流程 |
| `dense-modules` | 高密度模組、資料豐富的指南 |

完整定義：`references/layouts/<layout>.md`

## 風格圖庫

| 風格 | 描述 |
|-------|-------------|
| `craft-handmade` | 手繪、紙藝（預設） |
| `claymation` | 3D 黏土人偶、停格動畫 |
| `kawaii` | 日系可愛、柔和粉彩 |
| `storybook-watercolor` | 柔和塗繪、奇想 |
| `chalkboard` | 黑板上的粉筆 |
| `cyberpunk-neon` | 霓虹光暈、未來感 |
| `bold-graphic` | 漫畫風格、網點 |
| `aged-academia` | 復古科學、褐色調 |
| `corporate-memphis` | 平面向量、鮮亮 |
| `technical-schematic` | 藍圖、工程 |
| `origami` | 摺紙、幾何 |
| `pixel-art` | 復古 8-bit |
| `ui-wireframe` | 灰階介面模型 |
| `subway-map` | 交通路線圖 |
| `ikea-manual` | 極簡線條藝術 |
| `knolling` | 整齊平鋪擺放 |
| `lego-brick` | 積木建構 |
| `pop-laboratory` | 藍圖網格、座標標記、實驗室精準 |
| `morandi-journal` | 手繪塗鴉、溫暖莫蘭迪色調 |
| `retro-pop-grid` | 1970 復古普普藝術、瑞士網格、粗輪廓 |
| `hand-drawn-edu` | 馬卡龍粉彩、手繪晃動線條、火柴人 |

完整定義：`references/styles/<style>.md`

## 推薦組合

| 內容類型 | 版面＋風格 |
|--------------|----------------|
| 時間軸／歷史 | `linear-progression`＋`craft-handmade` |
| 逐步教學 | `linear-progression`＋`ikea-manual` |
| A vs B | `binary-comparison`＋`corporate-memphis` |
| 層級 | `hierarchical-layers`＋`craft-handmade` |
| 重疊 | `venn-diagram`＋`craft-handmade` |
| 轉換 | `funnel`＋`corporate-memphis` |
| 循環 | `circular-flow`＋`craft-handmade` |
| 技術 | `structural-breakdown`＋`technical-schematic` |
| 指標 | `dashboard`＋`corporate-memphis` |
| 教育 | `bento-grid`＋`chalkboard` |
| 旅程 | `winding-roadmap`＋`storybook-watercolor` |
| 分類 | `periodic-table`＋`bold-graphic` |
| 產品指南 | `dense-modules`＋`morandi-journal` |
| 技術指南 | `dense-modules`＋`pop-laboratory` |
| 潮流指南 | `dense-modules`＋`retro-pop-grid` |
| 教育圖表 | `hub-spoke`＋`hand-drawn-edu` |
| 流程教學 | `linear-progression`＋`hand-drawn-edu` |

預設：`bento-grid`＋`craft-handmade`

## 關鍵字捷徑

當使用者輸入含以下關鍵字時，**自動選取**對應版面，並在步驟 3 中優先推薦相關風格。比對到關鍵字時跳過內容式版面推斷。

若某捷徑有**提示備註（Prompt Notes）**，把備註附加到生成的提示（步驟 5）中，作為額外的風格指示。

| 使用者關鍵字 | 版面 | 推薦風格 | 預設長寬比 | 提示備註 |
|--------------|--------|--------------------|----------------|--------------|
| 高密度信息大圖 / high-density-info | `dense-modules` | `morandi-journal`、`pop-laboratory`、`retro-pop-grid` | portrait | — |
| 信息圖 / infographic | `bento-grid` | `craft-handmade` | landscape | Minimalist: clean canvas, ample whitespace, no complex background textures. Simple cartoon elements and icons only. |

## 輸出結構

```
infographic/{topic-slug}/
├── source-{slug}.{ext}
├── analysis.md
├── structured-content.md
├── prompts/infographic.md
└── infographic.png
```

Slug：主題的 2-4 個詞，kebab-case。衝突時：附加 `-YYYYMMDD-HHMMSS`。

## 核心原則

- 忠實保留來源資料 — 不摘要、不改寫（但在放入輸出前務必**去除任何憑證、API 金鑰、權杖或機密**）
- 結構化內容之前先定義學習目標
- 為視覺溝通而結構化（標題、標籤、視覺元素）

## 工作流程

### 步驟 1：分析內容

**載入參考**：閱讀本技能的 `references/analysis-framework.md`。

1. 儲存來源內容（檔案路徑或貼上 → 用 `write_file` 存成 `source.md`）
   - **備份規則**：若 `source.md` 已存在，改名為 `source-backup-YYYYMMDD-HHMMSS.md`
2. 分析：主題、資料類型、複雜度、語調、受眾
3. 偵測來源語言與使用者語言
4. 從使用者輸入擷取設計指示
5. 將分析存成 `analysis.md`
   - **備份規則**：若 `analysis.md` 已存在，改名為 `analysis-backup-YYYYMMDD-HHMMSS.md`

詳細格式見 `references/analysis-framework.md`。

### 步驟 2：生成結構化內容 → `structured-content.md`

將內容轉為資訊圖表結構：
1. 標題與學習目標
2. 章節包含：核心概念、內容（逐字）、視覺元素、文字標籤
3. 資料點（所有統計／引言完全照抄）
4. 使用者的設計指示

**規則**：只用 Markdown。不加新資訊。忠實保留資料。輸出中去除任何憑證或機密。

詳細格式見 `references/structured-content-template.md`。

### 步驟 3：推薦組合

**3.1 先檢查關鍵字捷徑**：若使用者輸入比對到**關鍵字捷徑**表中的關鍵字，自動選取對應版面，並優先推薦對應風格。跳過內容式版面推斷。

**3.2 否則**，基於以下推薦 3-5 個版面×風格組合：
- 資料結構 → 配對版面
- 內容語調 → 配對風格
- 受眾期望
- 使用者設計指示

### 步驟 4：確認選項

使用 `clarify` 工具與使用者確認選項。由於 `clarify` 一次只處理一個問題，請先問最重要的：

**Q1 — 組合**：提出 3 個以上版面×風格組合並附理由。請使用者挑一個。

**Q2 — 長寬比**：詢問長寬比偏好（landscape/portrait/square 或自訂 W:H）。

**Q3 — 語言**（僅當來源 ≠ 使用者語言）：詢問文字內容應使用哪種語言。

### 步驟 5：生成提示 → `prompts/infographic.md`

**備份規則**：若 `prompts/infographic.md` 已存在，改名為 `prompts/infographic-backup-YYYYMMDD-HHMMSS.md`

**載入參考**：從 `references/layouts/<layout>.md` 讀取所選版面，從 `references/styles/<style>.md` 讀取所選風格。

組合：
1. 來自 `references/layouts/<layout>.md` 的版面定義
2. 來自 `references/styles/<style>.md` 的風格定義
3. 來自 `references/base-prompt.md` 的基礎範本
4. 步驟 2 的結構化內容
5. 所有以已確認語言撰寫的文字

**`{{ASPECT_RATIO}}` 的長寬比解析**：
- 具名預設 → 比例字串：landscape→`16:9`、portrait→`9:16`、square→`1:1`
- 自訂 W:H 比例 → 原樣使用（如 `3:4`、`4:3`、`2.35:1`）

用 `write_file` 將組好的提示存成 `prompts/infographic.md`。

### 步驟 6：生成圖片

使用 `image_generate` 工具搭配步驟 5 組好的提示。

- 將長寬比對應到 image_generate 的格式：`16:9` → `landscape`、`9:16` → `portrait`、`1:1` → `square`
- 自訂比例請挑最接近的具名長寬比
- 失敗時自動重試一次
- 將產生的圖片 URL／路徑存到輸出目錄

### 步驟 7：輸出摘要

回報：主題、版面、風格、長寬比、語言、輸出路徑、建立的檔案。

## 參考文件

- `references/analysis-framework.md` — 分析方法論
- `references/structured-content-template.md` — 內容格式
- `references/base-prompt.md` — 提示範本
- `references/layouts/<layout>.md` — 21 種版面定義
- `references/styles/<style>.md` — 21 種風格定義

## 常見陷阱

1. **資料完整性至上** — 絕不摘要、改寫或更動來源統計資料。「73% 成長」必須維持「73% 成長」，不能變成「顯著成長」。
2. **去除機密** — 在放入任何輸出檔案前，務必掃描來源內容是否有 API 金鑰、權杖或憑證。
3. **每節一個訊息** — 每個資訊圖表章節應傳達一個清晰概念。章節過載會降低可讀性。
4. **風格一致性** — 參考檔案中的風格定義必須在整張資訊圖表中一致套用。不要混合風格。
5. **image_generate 長寬比** — 工具只支援 `landscape`、`portrait`、`square`。`3:4` 之類的自訂比例應對應到最接近的選項（此例為 portrait）。
