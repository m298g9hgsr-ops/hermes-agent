---
name: songsee
description: "透過 CLI 產生音訊頻譜圖與特徵（mel、chroma、MFCC）."
version: 1.0.0
author: community
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Audio, Visualization, Spectrogram, Music, Analysis]
    homepage: https://github.com/steipete/songsee
prerequisites:
  commands: [songsee]
---

# songsee

從音訊檔案產生頻譜圖與多面板音訊特徵視覺化。

## 前置需求

需要 [Go](https://go.dev/doc/install)：
```bash
go install github.com/steipete/songsee/cmd/songsee@latest
```

選用：WAV/MP3 以外的格式需要 `ffmpeg`。

## 快速開始

```bash
# Basic spectrogram
songsee track.mp3

# Save to specific file
songsee track.mp3 -o spectrogram.png

# Multi-panel visualization grid
songsee track.mp3 --viz spectrogram,mel,chroma,hpss,selfsim,loudness,tempogram,mfcc,flux

# Time slice (start at 12.5s, 8s duration)
songsee track.mp3 --start 12.5 --duration 8 -o slice.jpg

# From stdin
cat track.mp3 | songsee - --format png -o out.png
```

## 視覺化類型

搭配 `--viz` 使用以逗號分隔的值：

| 類型 | 說明 |
|------|-------------|
| `spectrogram` | 標準頻率頻譜圖 |
| `mel` | Mel 刻度頻譜圖 |
| `chroma` | 音高類別分佈 |
| `hpss` | 和聲／打擊分離 |
| `selfsim` | 自相似度矩陣 |
| `loudness` | 響度隨時間變化 |
| `tempogram` | 速度估計 |
| `mfcc` | Mel 頻率倒頻譜係數 |
| `flux` | 頻譜通量（起音偵測） |

多個 `--viz` 類型會以網格形式渲染在單張圖片中。

## 常用旗標

| 旗標 | 說明 |
|------|-------------|
| `--viz` | 視覺化類型（以逗號分隔） |
| `--style` | 色盤：`classic`、`magma`、`inferno`、`viridis`、`gray` |
| `--width` / `--height` | 輸出圖片尺寸 |
| `--window` / `--hop` | FFT 視窗與 hop 大小 |
| `--min-freq` / `--max-freq` | 頻率範圍過濾 |
| `--start` / `--duration` | 音訊的時間切片 |
| `--format` | 輸出格式：`jpg` 或 `png` |
| `-o` | 輸出檔案路徑 |

## 注意事項

- WAV 與 MP3 原生解碼；其他格式需要 `ffmpeg`
- 輸出圖片可用 `vision_analyze` 檢視以進行自動化音訊分析
- 適用於比較音訊輸出、除錯合成，或記錄音訊處理管線
