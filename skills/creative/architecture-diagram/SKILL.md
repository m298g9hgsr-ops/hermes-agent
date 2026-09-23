---
name: architecture-diagram
description: 以 HTML 產生暗色系 SVG 架構、雲端與基礎設施圖表.
version: 1.0.0
author: Cocoon AI (hello@cocoon-ai.com), ported by Hermes Agent
license: MIT
dependencies: []
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [architecture, diagrams, SVG, HTML, visualization, infrastructure, cloud]
    related_skills: [concept-diagrams, excalidraw]
---

# 架構圖技能

將專業、暗色系技術架構圖生成為獨立的 HTML 檔案，內嵌 SVG 圖形。不需要外部工具、API 金鑰或渲染函式庫 — 只要寫出 HTML 檔案，然後用瀏覽器開啟。

## 適用範圍

**最適合：**
- 軟體系統架構（前端／後端／資料庫層）
- 雲端基礎設施（VPC、區域、子網路、受管服務）
- 微服務／服務網格拓撲
- 資料庫＋API 對應圖、部署圖
- 任何符合暗色、網格背景美學的技術基礎設施主題

**請先考慮其他方案：**
- 物理、化學、數學、生物或其他科學主題
- 實體物件（車輛、硬體、解剖、剖面）
- 平面圖、敘事旅程、教育／教科書式視覺
- 手繪白板草圖（考慮 `excalidraw`）
- 動畫解說（考慮動畫類技能）

若該主題已有更專業的技能，優先使用它。若都不適合，本技能也可作為通用的 SVG 圖表後備方案 — 只是輸出會帶有下述的暗色科技美學。

改編自 [Cocoon AI's architecture-diagram-generator](https://github.com/Cocoon-AI/architecture-diagram-generator)（MIT）。

## 工作流程

1. 使用者描述其系統架構（元件、連線、技術）
2. 依照下方設計系統生成 HTML 檔案
3. 用 `write_file` 存成 `.html` 檔案（例如 `~/architecture-diagram.html`）
4. 使用者用任何瀏覽器開啟 — 可離線運作，無相依性

### 輸出位置

將圖表存到使用者指定的路徑，或預設存到目前工作目錄：
```
./[project-name]-architecture.html
```

### 預覽

存檔後，建議使用者開啟：
```bash
# macOS
open ./my-architecture.html
# Linux
xdg-open ./my-architecture.html
```

## 設計系統與視覺語言

### 色盤（語意對應）

使用特定的 `rgba` 填色與 hex 描邊來分類元件：

| 元件類型 | 填色 (rgba) | 描邊 (Hex) |
| :--- | :--- | :--- |
| **前端** | `rgba(8, 51, 68, 0.4)` | `#22d3ee` (cyan-400) |
| **後端** | `rgba(6, 78, 59, 0.4)` | `#34d399` (emerald-400) |
| **資料庫** | `rgba(76, 29, 149, 0.4)` | `#a78bfa` (violet-400) |
| **AWS/雲端** | `rgba(120, 53, 15, 0.3)` | `#fbbf24` (amber-400) |
| **安全** | `rgba(136, 19, 55, 0.4)` | `#fb7185` (rose-400) |
| **訊息匯流排** | `rgba(251, 146, 60, 0.3)` | `#fb923c` (orange-400) |
| **外部** | `rgba(30, 41, 59, 0.5)` | `#94a3b8` (slate-400) |

### 字體與背景
- **字體：** JetBrains Mono（等寬），從 Google Fonts 載入
- **字級：** 12px（名稱）、9px（副標籤）、8px（註解）、7px（小型標籤）
- **背景：** Slate-950（`#020617`）搭配細微的 40px 網格圖案

```svg
<!-- Background Grid Pattern -->
<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" stroke-width="0.5"/>
</pattern>
```

## 技術實作細節

### 元件渲染
元件是圓角矩形（`rx="6"`），搭配 1.5px 描邊。為了防止箭頭從半透明填色中透出，使用**雙矩形遮罩技術**：
1. 先畫一個不透明背景矩形（`#0f172a`）
2. 再於其上疊加半透明樣式矩形

### 連線規則
- **Z 順序：** 在 SVG 中*早*畫箭頭（網格之後），讓它們渲染在元件方框後方
- **箭頭端點：** 透過 SVG markers 定義
- **安全流：** 使用玫瑰色（`#fb7185`）虛線
- **邊界：**
  - *安全群組：* 虛線（`4,4`）、玫瑰色
  - *區域：* 大虛線（`8,4`）、琥珀色、`rx="12"`

### 間距與版面邏輯
- **標準高度：** 60px（服務）；80-120px（大型元件）
- **垂直間距：** 元件之間至少 40px
- **訊息匯流排：** 必須放在服務之間的*空隙*，不可與服務重疊
- **圖例位置：** **關鍵。** 必須放在所有邊界框之外。計算所有邊界的最低 Y 座標，並把圖例放在它下方至少 20px 處。

## 文件結構

產生的 HTML 檔案採用四段式版面：
1. **標頭：** 標題搭配脈動圓點指示器與副標題
2. **主 SVG：** 包含在圓角邊框卡片中的圖表
3. **摘要卡片：** 圖表下方三張卡片的網格，呈現高層細節
4. **頁尾：** 極簡的後設資料

### 資訊卡片模式
```html
<div class="card">
  <div class="card-header">
    <div class="card-dot cyan"></div>
    <h3>Title</h3>
  </div>
  <ul>
    <li>• Item one</li>
    <li>• Item two</li>
  </ul>
</div>
```

## 輸出需求
- **單一檔案：** 一個自足的 `.html` 檔案
- **無外部相依：** 所有 CSS 與 SVG 必須內嵌（Google Fonts 除外）
- **無 JavaScript：** 僅使用純 CSS 處理任何動畫（例如脈動圓點）
- **相容性：** 必須能在任何現代網頁瀏覽器中正確渲染

## 範本參考

載入完整的 HTML 範本以取得精確結構、CSS 與 SVG 元件範例：

```
skill_view(name="architecture-diagram", file_path="templates/template.html")
```

範本包含每種元件類型（前端、後端、資料庫、雲端、安全）的可用範例、箭頭樣式（標準、虛線、曲線）、安全群組、區域邊界與圖例 — 生成圖表時將它作為結構參考。
