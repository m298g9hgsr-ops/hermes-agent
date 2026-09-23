---
name: obsidian
description: "在 Obsidian 保管庫中讀取、搜尋、建立與編輯筆記."
version: 1.0.0
author: Teknium (teknium1), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Obsidian, Notes, Markdown, Vault]
    related_skills: []
---

# Obsidian Vault 技能

本技能用於以檔案系統為核心的 Obsidian 保管庫操作：讀取筆記、列出筆記、搜尋筆記檔案、建立筆記、附加內容與新增 wikilink。

## 保管庫路徑

呼叫檔案工具前，先使用已知或已解析的保管庫路徑。

文件記載的保管庫路徑慣例是 `OBSIDIAN_VAULT_PATH` 環境變數，例如來自 `${HERMES_HOME:-~/.hermes}/.env`。若未設定，請使用 `~/Documents/Obsidian Vault`。

檔案工具不會展開 shell 變數。不要將含有 `$OBSIDIAN_VAULT_PATH` 的路徑傳給 `read_file`、`write_file`、`patch` 或 `search_files`；請先解析保管庫路徑，再傳入具體的絕對路徑。保管庫路徑可能含有空格，這是偏好使用檔案工具而非 shell 指令的另一個原因。

如果保管庫路徑未知，可用 `terminal` 解析 `OBSIDIAN_VAULT_PATH`，或確認備用路徑是否存在。一旦取得路徑，就改回使用檔案工具。

## 讀取筆記

使用 `read_file`，傳入已解析的筆記絕對路徑。此方式優於 `cat`，因為它提供行號與分頁。

## 列出筆記

使用 `search_files`，搭配 `target: "files"` 與已解析的保管庫路徑。此方式優於 `find` 或 `ls`。

- 若要列出所有 markdown 筆記，在保管庫路徑下使用 `pattern: "*.md"`。
- 若要列出子資料夾，請在該子資料夾的絕對路徑下搜尋。

## 搜尋

檔名與內容搜尋都使用 `search_files`。此方式優於 `grep`、`find` 或 `ls`。

- 檔名搜尋時，使用 `search_files`，搭配 `target: "files"` 與檔名 `pattern`。
- 搜尋筆記內容時，使用 `search_files`，搭配 `target: "content"`、以內容正規表示式作為 `pattern`，並在只想限制比對 markdown 筆記時加上 `file_glob: "*.md"`。

## 建立筆記

使用 `write_file`，傳入已解析的絕對路徑與完整的 markdown 內容。此方式優於 shell heredoc 或 `echo`，因為它能避免 shell 引號問題並回傳結構化結果。

## 附加到筆記

在不致於彆扭的情況下，優先採用原生檔案工具流程：

- 用 `read_file` 讀取目標筆記。
- 當有穩定脈絡時（例如在既有標題後新增區段，或在已知的結尾區塊前附加），使用 `patch` 進行錨定式附加。
- 當整份重寫比建構脆弱的 patch 更清楚時，使用 `write_file`。

使用 `patch` 進行錨定式附加時，將錨點替換為錨點加上新內容。

對於沒有穩定脈絡的簡單附加，若 `terminal` 是最清楚且安全的方式，也可以使用。

## 標的式編輯

當目前內容能提供穩定脈絡時，使用 `patch` 進行聚焦的筆記變更。此方式優於以 shell 改寫文字。

## Wikilinks

Obsidian 使用 `[[Note Name]]` 語法連結筆記。建立筆記時，請用它連結相關內容。
