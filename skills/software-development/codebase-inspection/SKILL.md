---
name: codebase-inspection
description: "用 pygount 檢視程式碼庫：LOC、語言、比例."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [LOC, Code Analysis, pygount, Codebase, Metrics, Repository]
    related_skills: [github]
prerequisites:
  commands: [pygount]
---

# 使用 pygount 檢視程式碼庫

使用 `pygount` 分析倉庫的程式碼行數、語言拆解、檔案數，以及程式碼與註解的比率。

## 使用時機

- 使用者要求 LOC（code lines）計數
- 使用者想要倉庫的語言拆解
- 使用者問程式碼庫的大小或組成
- 使用者要程式碼與註解的比率
- 一般的「這倉庫多大」問題

## 前置需求

```bash
pip install --break-system-packages pygount 2>/dev/null || pip install pygount
```

## 1. 基本摘要（最常用）

取得完整的語言拆解，含檔案數、程式碼行數與註解行數：

```bash
cd /path/to/repo
pygount --format=summary \
  --folders-to-skip=".git,node_modules,venv,.venv,__pycache__,.cache,dist,build,.next,.tox,.eggs,*.egg-info" \
  .
```

**重要：** 一律用 `--folders-to-skip` 排除相依/建置目錄，否則 pygount 會爬進去並耗費很長時間或卡住。

## 2. 常見的目錄排除

依專案類型調整：

```bash
# Python projects
--folders-to-skip=".git,venv,.venv,__pycache__,.cache,dist,build,.tox,.eggs,.mypy_cache"

# JavaScript/TypeScript projects
--folders-to-skip=".git,node_modules,dist,build,.next,.cache,.turbo,coverage"

# General catch-all
--folders-to-skip=".git,node_modules,venv,.venv,__pycache__,.cache,dist,build,.next,.tox,vendor,third_party"
```

## 3. 依特定語言篩選

```bash
# Only count Python files
pygount --suffix=py --format=summary .

# Only count Python and YAML
pygount --suffix=py,yaml,yml --format=summary .
```

## 4. 詳細的逐檔輸出

```bash
# Default format shows per-file breakdown
pygount --folders-to-skip=".git,node_modules,venv" .

# Sort by code lines (pipe through sort)
pygount --folders-to-skip=".git,node_modules,venv" . | sort -t$'\t' -k1 -nr | head -20
```

## 5. 輸出格式

```bash
# Summary table (default recommendation)
pygount --format=summary .

# JSON output for programmatic use
pygount --format=json .

# Pipe-friendly: Language, file count, code, docs, empty, string
pygount --format=summary . 2>/dev/null
```

## 6. 解讀結果

摘要表的欄位：
- **Language** — 偵測到的程式語言
- **Files** — 該語言的檔案數
- **Code** — 實際程式碼的行數（可執行/宣告式）
- **Comment** — 註解或文件的行數
- **%** — 總數的百分比

特殊的虛擬語言：
- `__empty__` — 空檔案
- `__binary__` — 二進位檔案（圖片、編譯產物等）
- `__generated__` — 自動產生檔案（啟發式偵測）
- `__duplicate__` — 內容完全相同的檔案
- `__unknown__` — 無法辨識的檔案類型

## 常見陷阱

1. **一律排除 .git、node_modules、venv** — 沒有 `--folders-to-skip`，pygount 會爬所有東西，在大型相依樹上可能花幾分鐘或卡住。
2. **Markdown 顯示 0 行程式碼** — pygount 把全部 Markdown 內容分類為註解，不是程式碼。這是預期行為。
3. **JSON 檔案程式碼數偏低** — pygount 對 JSON 行可能保守計數。要精確的 JSON 行數，直接用 `wc -l`。
4. **大型 monorepo** — 對非常大的倉庫，考慮用 `--suffix` 針對特定語言，而不是掃描所有東西。
