---
name: youtube-content
description: "將 YouTube 轉錄稿轉為摘要、論壇串與部落格."
version: 1.0.0
author: Teknium (teknium1), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [YouTube, Video, Transcripts, Media]
    related_skills: []
---

# YouTube 內容工具

## 使用時機

當使用者分享 YouTube URL 或影片連結、要求總結影片、要求轉錄稿，或想從任何 YouTube 影片擷取並重整內容時使用。將轉錄稿轉換為結構化內容（章節、摘要、論壇串、部落格文章）。

從 YouTube 影片擷取轉錄稿並轉換為有用的格式。

## 設定

使用 `uv`，讓相依套件安裝到與執行輔助腳本相同的 Hermes 管理環境中：

```bash
uv pip install youtube-transcript-api
```

## 輔助腳本

`SKILL_DIR` 是包含本 SKILL.md 的目錄。腳本接受任何標準 YouTube URL 格式、短連結（youtu.be）、shorts、embed、直播連結，或原始的 11 字元影片 ID。

```bash
# JSON output with metadata
uv run python SKILL_DIR/scripts/fetch_transcript.py "https://youtube.com/watch?v=VIDEO_ID"

# Plain text (good for piping into further processing)
uv run python SKILL_DIR/scripts/fetch_transcript.py "URL" --text-only

# With timestamps
uv run python SKILL_DIR/scripts/fetch_transcript.py "URL" --timestamps

# Specific language with fallback chain
uv run python SKILL_DIR/scripts/fetch_transcript.py "URL" --language tr,en
```

## 輸出格式

取得轉錄稿後，依使用者要求格式化：

- **章節**：依主題轉折分組，輸出帶時間碼的章節清單
- **摘要**：整部影片精簡的 5-10 句總覽
- **章節摘要**：各章節附一段簡短說明
- **論壇串**：Twitter/X 串文格式 — 編號貼文，每則 280 字元以內
- **部落格文章**：含標題、段落與重點的完整文章
- **引言**：附時間碼的名言

### 範例 — 章節輸出

```
00:00 Introduction — host opens with the problem statement
03:45 Background — prior work and why existing solutions fall short
12:20 Core method — walkthrough of the proposed approach
24:10 Results — benchmark comparisons and key takeaways
31:55 Q&A — audience questions on scalability and next steps
```

## 工作流程

1. **取得**轉錄稿：用輔助腳本搭配 `--text-only --timestamps`，透過 `uv run python` 執行。
2. **驗證**：確認輸出非空且為預期語言。若為空，不帶 `--language` 重試以取得任何可用的轉錄稿。若仍為空，告知使用者該影片可能已停用字幕。
3. **必要時分塊**：若轉錄稿超過約 50K 字元，切成重疊區塊（約 40K、2K 重疊），各自總結後再合併。
4. **轉換**為要求的輸出格式。若使用者未指定格式，預設為摘要。
5. **驗證**：呈現前重新讀取轉換後的輸出，檢查連貫性、正確的時間碼與完整性。

## 錯誤處理

- **字幕已停用**：告知使用者；建議他們檢查影片頁面上是否有可用字幕。
- **私人／不可用影片**：轉達錯誤並請使用者確認 URL。
- **無符合語言**：不帶 `--language` 重試以取得任何可用轉錄稿，然後向使用者說明實際語言。
- **缺少相依套件**：執行 `uv pip install youtube-transcript-api` 後重試。
