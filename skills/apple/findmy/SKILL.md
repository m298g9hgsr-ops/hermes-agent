---
name: findmy
description: "在 macOS 上透過 FindMy.app 追蹤 Apple 裝置與 AirTag."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [macos]
metadata:
  hermes:
    tags: [FindMy, AirTag, location, tracking, macOS, Apple]
---

# Find My (Apple) 技能

透過 macOS 上的 FindMy.app 追蹤 Apple 裝置與 AirTag。由於 Apple 並未為 FindMy 提供 CLI，本技能使用 AppleScript 開啟應用程式，並用螢幕截圖來讀取裝置位置。

## 前置需求

- **macOS** 且已安裝 Find My 應用程式並登入 iCloud
- 裝置/AirTag 已註冊在 Find My 中
- 終端具備螢幕錄製權限（系統設定 → 隱私權與安全性 → 螢幕錄製）
- **選用但仍建議**：安裝 `peekaboo` 以獲得更可靠的 UI 自動化：
  `brew install steipete/tap/peekaboo`

## 使用時機

- 使用者詢問「我的[裝置/貓/鑰匙/包包]在哪裡？」
- 追蹤 AirTag 的位置
- 檢查裝置位置（iPhone、iPad、Mac、AirPods）
- 長期監控寵物或物品的移動（AirTag 巡邏路線）

## 方法 1：AppleScript + 螢幕截圖（基礎）

### 開啟 FindMy 並導覽

```bash
# Open Find My app
osascript -e 'tell application "FindMy" to activate'

# Wait for it to load
sleep 3

# Take a screenshot of the Find My window
screencapture -w -o ~/.hermes/cache/scratch/findmy.png
```

接著使用 `vision_analyze` 讀取螢幕截圖：

```
vision_analyze(image_url="~/.hermes/cache/scratch/findmy.png", question="What devices/items are shown and what are their locations?")
```

### 切換分頁

```bash
# Switch to Devices tab
osascript -e '
tell application "System Events"
    tell process "FindMy"
        click button "Devices" of toolbar 1 of window 1
    end tell
end tell'

# Switch to Items tab (AirTags)
osascript -e '
tell application "System Events"
    tell process "FindMy"
        click button "Items" of toolbar 1 of window 1
    end tell
end tell'
```

## 方法 2：Peekaboo UI 自動化（建議）

若已安裝 `peekaboo`，請用它進行更可靠的 UI 互動：

```bash
# Open Find My
osascript -e 'tell application "FindMy" to activate'
sleep 3

# Capture and annotate the UI
peekaboo see --app "FindMy" --annotate --path ~/.hermes/cache/scratch/findmy-ui.png

# Click on a specific device/item by element ID
peekaboo click --on B3 --app "FindMy"

# Capture the detail view
peekaboo image --app "FindMy" --path ~/.hermes/cache/scratch/findmy-detail.png
```

接著使用 vision 分析：

```
vision_analyze(image_url="~/.hermes/cache/scratch/findmy-detail.png", question="What is the location shown for this device/item? Include address and coordinates if visible.")
```

## 操作流程：長時間追蹤 AirTag 位置

例如監控 AirTag（如追蹤貓的巡邏路線）：

```bash
# 1. Open FindMy to Items tab
osascript -e 'tell application "FindMy" to activate'
sleep 3

# 2. Click on the AirTag item (stay on page — AirTag only updates when page is open)

# 3. Periodically capture location
while true; do
    screencapture -w -o ~/.hermes/cache/scratch/findmy-$(date +%H%M%S).png
    sleep 300  # Every 5 minutes
done
```

用 vision 分析每張螢幕截圖以取得座標，再彙整成一條路線。

## 限制

- FindMy **沒有 CLI 或 API**——必須使用 UI 自動化
- AirTag 只有在 FindMy 頁面持續顯示時才會更新位置
- 位置準確度取決於 FindMy 網路中附近的 Apple 裝置
- 進行螢幕截圖需要螢幕錄製權限
- AppleScript UI 自動化在不同 macOS 版本間可能失效

## 規則

1. 追蹤 AirTag 時應讓 FindMy 應用程式維持在前景（最小化後更新會停止）
2. 使用 `vision_analyze` 讀取螢幕截圖內容——不要試圖解析像素
3. 若要持續追蹤，請用 cronjob 定期擷取並記錄位置
4. 尊重隱私——只追蹤使用者擁有的裝置/物品
