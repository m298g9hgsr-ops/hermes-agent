---
name: apple-reminders
description: "透過 remindctl 管理 Apple Reminders：新增、列出、完成."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [macos]
metadata:
  hermes:
    tags: [Reminders, tasks, todo, macOS, Apple]
prerequisites:
  commands: [remindctl]
---

# Apple Reminders 技能

使用 `remindctl` 直接從終端管理 Apple Reminders。任務會透過 iCloud 同步到所有 Apple 裝置。

## 前置需求

- **macOS** 且已安裝 Reminders.app
- 安裝：`brew install steipete/tap/remindctl`
- 出現提示時，授予 Reminders 存取權限
- 檢查：`remindctl status` / 請求授權：`remindctl authorize`

## 使用時機

- 使用者提到「reminder」或「Reminders app」
- 建立具有截止日期且會同步到 iOS 的個人待辦事項
- 管理 Apple Reminders 清單
- 使用者希望任務出現在其 iPhone/iPad 上

## 不適用時機

- 排定代理提醒 → 請改用 cronjob 工具
- 行事曆事件 → 請使用 Apple Calendar 或 Google Calendar
- 專案任務管理 → 請使用 GitHub Issues、Notion 等
- 若使用者說「提醒我」但指的是代理提醒 → 請先確認

## 快速參考

### 檢視提醒

```bash
remindctl                    # Today's reminders
remindctl today              # Today
remindctl tomorrow           # Tomorrow
remindctl week               # This week
remindctl overdue            # Past due
remindctl all                # Everything
remindctl 2026-01-04         # Specific date
```

### 管理清單

```bash
remindctl list               # List all lists
remindctl list Work          # Show specific list
remindctl list Projects --create    # Create list
remindctl list Work --delete        # Delete list
```

### 建立提醒

```bash
remindctl add "Buy milk"
remindctl add --title "Call mom" --list Personal --due tomorrow
remindctl add --title "Meeting prep" --due "2026-02-15 09:00"
```

### 到期時間與鬧鐘/提早提醒

`--due` 與 `--alarm` 是不同欄位：

- `--due` 設定提醒的到期日期/時間。
- `--alarm` 設定 EventKit 的鬧鐘/通知觸發時間。有到期時間的提醒預設會在到期時刻觸發鬧鐘，但當使用者要求提早提醒時，請明確傳入 `--alarm`。

例如提醒在下午 2:00 到期，但需提早 30 分鐘通知：

```bash
remindctl add --title "Hairdresser" --due "2026-05-15 14:00" --alarm "2026-05-15 13:30"
```

編輯既有的提醒：

```bash
remindctl edit 87354 --due "2026-05-15 14:00" --alarm "2026-05-15 13:30"
```

Reminders 介面可能會以鬧鐘時間顯示或分組項目，因為那才是通知觸發的時刻。請改用 JSON 驗證，而不要假定到期時間有變動：

```bash
remindctl today --json
```

預期的格式結構：

- `dueDate`：實際到期時間
- `alarmDate`：通知/提早提醒時間

Apple 公開的 `EKReminder` 文件只列出提醒專用的屬性。鬧鐘支援來自繼承自 `EKCalendarItem` 的行為，透過 remindctl 的 `--alarm` 旗標對外提供。

### 完成/刪除

```bash
remindctl complete 1 2 3          # Complete by ID
remindctl delete 4A83 --force     # Delete by ID
```

### 輸出格式

```bash
remindctl today --json       # JSON for scripting
remindctl today --plain      # TSV format
remindctl today --quiet      # Counts only
```

## 日期格式

`--due` 與日期篩選可接受的格式：

- `today`, `tomorrow`, `yesterday`
- `YYYY-MM-DD`
- `YYYY-MM-DD HH:mm`
- ISO 8601 (`2026-01-04T12:34:56Z`)

## 規則

1. 當使用者說「提醒我」時，先釐清：Apple Reminders（同步到手機）還是代理的 cronjob 提醒
2. 建立前務必先確認提醒內容與到期日期
3. 程式化解析時請使用 `--json`
