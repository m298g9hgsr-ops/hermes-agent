---
name: gif-search
description: "透過 curl + jq 從 Tenor 搜尋與下載 GIF."
version: 1.1.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
prerequisites:
  env_vars: [TENOR_API_KEY]
  commands: [curl, jq]
metadata:
  hermes:
    tags: [GIF, Media, Search, Tenor, API]
---

# GIF Search（Tenor API）

直接透過 Tenor API 用 curl 搜尋與下載 GIF。不需要額外工具。

## 使用時機

適用於尋找反應 GIF、製作視覺內容，以及在聊天中傳送 GIF。

## 設定

在環境中設定你的 Tenor API 金鑰（加到 `${HERMES_HOME:-~/.hermes}/.env`）：

```bash
TENOR_API_KEY=your_key_here
```

在 https://developers.google.com/tenor/guides/quickstart 取得免費 API 金鑰 — Google Cloud Console 的 Tenor API 金鑰免費且有寬裕的速率限制。

## 前置需求

- `curl` 與 `jq`（macOS/Linux 皆為標準配備）
- `TENOR_API_KEY` 環境變數

## 搜尋 GIF

```bash
# Search and get GIF URLs
curl -s "https://tenor.googleapis.com/v2/search?q=thumbs+up&limit=5&key=${TENOR_API_KEY}" | jq -r '.results[].media_formats.gif.url'

# Get smaller/preview versions
curl -s "https://tenor.googleapis.com/v2/search?q=nice+work&limit=3&key=${TENOR_API_KEY}" | jq -r '.results[].media_formats.tinygif.url'
```

## 下載 GIF

```bash
# Search and download the top result
URL=$(curl -s "https://tenor.googleapis.com/v2/search?q=celebration&limit=1&key=${TENOR_API_KEY}" | jq -r '.results[0].media_formats.gif.url')
curl -sL "$URL" -o celebration.gif
```

## 取得完整中繼資料

```bash
curl -s "https://tenor.googleapis.com/v2/search?q=cat&limit=3&key=${TENOR_API_KEY}" | jq '.results[] | {title: .title, url: .media_formats.gif.url, preview: .media_formats.tinygif.url, dimensions: .media_formats.gif.dims}'
```

## API 參數

| 參數 | 說明 |
|-----------|-------------|
| `q` | 搜尋查詢（空白以 `+` 作 URL 編碼） |
| `limit` | 最大結果數（1-50，預設 20） |
| `key` | API 金鑰（來自 `$TENOR_API_KEY` 環境變數） |
| `media_filter` | 過濾格式：`gif`、`tinygif`、`mp4`、`tinymp4`、`webm` |
| `contentfilter` | 安全等級：`off`、`low`、`medium`、`high` |
| `locale` | 語言：`en_US`、`es`、`fr` 等 |

## 可用的媒體格式

每個結果在 `.media_formats` 下有多種格式：

| 格式 | 使用情境 |
|--------|----------|
| `gif` | 全品質 GIF |
| `tinygif` | 小型預覽 GIF |
| `mp4` | 影片版本（檔案較小） |
| `tinymp4` | 小型預覽影片 |
| `webm` | WebM 影片 |
| `nanogif` | 極小縮圖 |

## 注意事項

- 查詢要做 URL 編碼：空白用 `+`、特殊字元用 `%XX`
- 在聊天中傳送時，`tinygif` URL 較輕量
- GIF URL 可直接用在 markdown：`![alt](url)`
