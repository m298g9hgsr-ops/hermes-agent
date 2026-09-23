---
name: dogfood
description: "Web 應用的探索式 QA：找 bug、收證據、出報告."
version: 1.0.0
author: Teknium (teknium1), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [qa, testing, browser, web, dogfood]
    related_skills: []
---

# Dogfood：系統化 Web 應用 QA 測試

## 總覽

本技能引導你使用瀏覽器工具組對 Web 應用進行系統化的探索式 QA 測試。你將瀏覽應用程式、與元素互動、擷取問題的證據，並產出結構化的 bug 報告。

## 前置需求

- 必須有瀏覽器工具組可用（`browser_navigate`、`browser_snapshot`、`browser_click`、`browser_type`、`browser_vision`、`browser_console`、`browser_scroll`、`browser_back`、`browser_press`）
- 使用者提供目標 URL 與測試範圍

## 輸入

使用者提供：
1. **目標 URL** — 測試的進入點
2. **範圍** — 要聚焦哪些區域/功能（或完整網站以做全面測試）
3. **輸出目錄**（選用）— 截圖與報告的儲存位置（預設：`./dogfood-output`）

## 工作流程

遵循這個 5 階段系統化工作流程：

### 第一階段：規劃

1. 建立輸出目錄結構：
   ```
   {output_dir}/
   ├── screenshots/       # Evidence screenshots
   └── report.md          # Final report (generated in Phase 5)
   ```
2. 依使用者輸入界定測試範圍。
3. 規劃要測試的頁面與功能，建立粗略的網站地圖：
   - 著陸/首頁
   - 導覽連結（頁首、頁尾、側邊欄）
   - 關鍵使用者流程（註冊、登入、搜尋、結帳等）
   - 表單與互動元素
   - 邊緣案例（空狀態、錯誤頁、404）

### 第二階段：探索

對計畫中的每個頁面或功能：

1. **導覽**到該頁面：
   ```
   browser_navigate(url="https://example.com/page")
   ```

2. **拍快照**以了解 DOM 結構：
   ```
   browser_snapshot()
   ```

3. **檢查 console** 是否有 JavaScript 錯誤：
   ```
   browser_console(clear=true)
   ```
   每次導覽後、每次重要互動後都做。靜默的 JS 錯誤是高價值發現。

4. **拍帶註記的截圖**，以視覺方式評估頁面並找出互動元素：
   ```
   browser_vision(question="Describe the page layout, identify any visual issues, broken elements, or accessibility concerns", annotate=true)
   ```
   `annotate=true` 旗標會在互動元素上疊加編號的 `[N]` 標籤。每個 `[N]` 對應到 `@eN` ref，供後續瀏覽器指令使用。

5. **系統化測試互動元素**：
   - 點擊按鈕與連結：`browser_click(ref="@eN")`
   - 填寫表單：`browser_type(ref="@eN", text="test input")`
   - 測試鍵盤導覽：`browser_press(key="Tab")`、`browser_press(key="Enter")`
   - 捲動內容：`browser_scroll(direction="down")`
   - 用無效輸入測試表單驗證
   - 測試空提交

6. **每次互動後**，檢查：
   - Console 錯誤：`browser_console()`
   - 視覺變化：`browser_vision(question="What changed after the interaction?")`
   - 預期 vs 實際行為

### 第三階段：蒐集證據

對發現的每個問題：

1. **拍截圖**顯示該問題：
   ```
   browser_vision(question="Capture and describe the issue visible on this page", annotate=false)
   ```
   從回應中儲存 `screenshot_path` — 報告中會參照它。

2. **記錄細節**：
   - 問題發生的 URL
   - 重現步驟
   - 預期行為
   - 實際行為
   - Console 錯誤（若有）
   - 截圖路徑

3. **分類問題**，使用問題分類法（見 `references/issue-taxonomy.md`）：
   - 嚴重度：Critical / High / Medium / Low
   - 類別：Functional / Visual / Accessibility / Console / UX / Content

### 第四階段：分類

1. 檢視所有蒐集到的問題。
2. 去重 — 合併同一個 bug 在不同地方表現的案例。
3. 為每個問題指派最終嚴重度與類別。
4. 依嚴重度排序（Critical 優先，接著 High、Medium、Low）。
5. 依嚴重度與類別統計問題數，供執行摘要使用。

### 第五階段：報告

使用 `templates/dogfood-report-template.md` 的範本產生最終報告。

報告必須包含：
1. **執行摘要**，含問題總數、依嚴重度拆解、測試範圍
2. **每個問題的專節**，含：
   - 問題編號與標題
   - 嚴重度與類別徽章
   - 觀察到的 URL
   - 問題描述
   - 重現步驟
   - 預期 vs 實際行為
   - 截圖參照（用 `MEDIA:<screenshot_path>` 內嵌圖片）
   - 相關的 console 錯誤
3. **所有問題的摘要表**
4. **測試註記** — 測試了什麼、沒測什麼、任何阻礙因素

把報告儲存到 `{output_dir}/report.md`。

## 工具參考

| 工具 | 用途 |
|------|---------|
| `browser_navigate` | 前往一個 URL |
| `browser_snapshot` | 取得 DOM 文字快照（無障礙樹） |
| `browser_click` | 依 ref（`@eN`）或文字點擊元素 |
| `browser_type` | 在輸入欄位中輸入 |
| `browser_scroll` | 在頁面上上下捲動 |
| `browser_back` | 在瀏覽器歷史中往回 |
| `browser_press` | 按一個鍵盤按鍵 |
| `browser_vision` | 截圖 + AI 分析；用 `annotate=true` 取得元素標籤 |
| `browser_console` | 取得 JS console 輸出與錯誤 |

## 小提示

- **導覽後與重要互動後一律檢查 `browser_console()`。** 靜默的 JS 錯誤是價值最高的發現之一。
- **需要推理互動元素位置或 snapshot refs 不清楚時**，對 `browser_vision` 用 `annotate=true`。
- **有效與無效輸入都要測** — 表單驗證 bug 很常見。
- **長頁面要捲動** — 摺疊線以下的內容可能有渲染問題。
- **測試導覽流程** — 端對端點完多步驟流程。
- **檢查回應式行為** — 留意截圖中可見的版面問題。
- **別忘了邊緣案例：** 空狀態、超長文字、特殊字元、快速連點。
- 向使用者回報截圖時，加上 `MEDIA:<screenshot_path>` 讓他們能以內嵌方式看到證據。
