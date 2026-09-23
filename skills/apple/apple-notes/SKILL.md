---
name: apple-notes
description: "透過 memo CLI 管理 Apple Notes：建立、搜尋、編輯."
version: 1.0.1
author: Hermes Agent
license: MIT
platforms: [macos]
metadata:
  hermes:
    tags: [Notes, Apple, macOS, note-taking]
    related_skills: [obsidian]
prerequisites:
  commands: [memo]
---

# Apple Notes 技能

使用 `memo` 直接從終端管理 Apple Notes。筆記會透過 iCloud 同步到所有 Apple 裝置。

## 前置需求

- **macOS** 且已安裝 Notes.app
- 安裝：`brew tap antoniorodr/memo && brew install antoniorodr/memo/memo`
- 出現提示時，授予 Notes.app 自動化（Automation）存取權限（系統設定 → 隱私權與安全性 → 自動化）

## 使用時機

- 使用者要求建立、檢視或搜尋 Apple Notes
- 將資訊儲存到 Notes.app，以供跨裝置存取
- 將筆記整理到資料夾中
- 將筆記匯出為 Markdown/HTML

## 不適用時機

- Obsidian 保管庫管理 → 請使用 `obsidian` 技能
- Bear Notes → 獨立的應用程式（此處不支援）
- 僅供代理內部使用的快速筆記 → 請改用 `memory` 工具

## 快速參考

### 檢視筆記

```bash
memo notes                        # List all notes
memo notes -f "Folder Name"       # Filter by folder
memo notes -s "query"             # Search notes (fuzzy)
```

### 建立筆記

```bash
memo notes -a                     # Add a note (opens your $EDITOR)
memo notes -a -f "Folder Name"    # Add a note into a specific folder
```

`-a`/`--add` 是無參數旗標——它會開啟你的 `$EDITOR` 來撰寫筆記，不接受標題參數。使用 `-f/--folder` 指定目標資料夾。請先設定 `$EDITOR`（例如 `export EDITOR=vim`）。

### 編輯筆記

```bash
memo notes -e                     # Interactive selection to edit
```

### 刪除筆記

```bash
memo notes -d                     # Interactive selection to delete
```

### 移動筆記

```bash
memo notes -m                     # Move note to folder (interactive)
```

### 匯出筆記

```bash
memo notes -ex                    # Export to HTML/Markdown
```

## 限制

- 無法編輯包含圖片或附件的筆記
- 互動式提示需要終端存取（如有需要請使用 pty=true）
- 僅限 macOS——需要 Apple Notes.app

## 規則

1. 當使用者需要跨裝置同步（iPhone/iPad/Mac）時，優先使用 Apple Notes
2. 不需要同步的代理內部筆記，請使用 `memory` 工具
3. 以 Markdown 為主的知識管理，請使用 `obsidian` 技能
