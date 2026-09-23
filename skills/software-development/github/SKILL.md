---
name: github
description: "透過 gh CLI 操作 GitHub：PR、issue、審查、倉庫、授權."
version: 2.0.0
author: Ben Barclay (benbarclay), Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [github, gh, git, pull-requests, issues, code-review, repos, auth, ci]
    category: software-development
    related_skills: [codebase-inspection, requesting-code-review]
---

# GitHub

用 `gh` CLI 端對端操作 GitHub（註明處有 REST 後備）：auth、issue、PR 生命週期、issue 到 PR 的交付、程式碼審查與倉庫管理。本技能合併了先前的六個技能；每個工作流程都完整存在於各自的參考檔中 — 開始某個工作流程前**一律**先讀對應的參考檔，下方正文只做路由。

## 路由

| 任務 | 先閱讀 |
|---|---|
| Auth 壞掉 / 新機器 / token 或 SSH 設定 / gh login | `references/auth.md` |
| 建立、分類、標籤、指派、關閉 issue | `references/issues.md` |
| 開分支、commit、開 PR、看 CI、合併 | `references/pr-workflow.md` |
| 把一個 ISSUE 交付成已驗證的 PR（完整交付迴圈） | `references/issue-to-pr.md` |
| 審查別人的 PR：diff、內嵌評論、裁決 | `references/code-review.md` |
| 複製/建立/fork 倉庫、remote、release | `references/repo-management.md` |

輔助資產：`scripts/gh-env.sh` + `scripts/git-credential-token.py`（auth 輔助）、`templates/`（PR 內文、bug 報告、功能請求）、`references/ci-troubleshooting.md`、`references/conventional-commits.md`、`references/github-api-cheatsheet.md`、`references/review-output-template.md`。

## 核心紀律（適用於每個工作流程）

- 每個 session 開場先 preflight：`gh auth status` — 若失敗，在碰任何其他東西之前先去看 `references/auth.md`。
- 優先 `gh` 勝過裸 REST；只有 porcelain 沒有的端點才降級用 `gh api`（cheatsheet 列了它們）。
- 沒有親自查 `gh pr checks`，就不要回報 CI 綠；沒有驗證 `state,mergedAt`，就不要宣稱已合併。
- 動手寫之前先讀完整脈絡：`gh issue view --comments` / `gh pr view --comments` — 決定在討論串裡，不在標題裡。
- 建立任何東西之前先掃重複：`gh pr list --search` / `gh issue list --search`。

## 驗證

- 該工作流程自己的參考檔定義了何時算完成。
- 跨領域規則：所有關於遠端狀態（CI、合併、release、issue 狀態）的主張，都以全新的 `gh` 讀取為憑，不能憑記憶。
