---
name: manim-video
description: Manim CE 動畫：3Blue1Brown風格數學演算法影片.
version: 1.0.0
author: SHL0MS, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Manim, Animation, Math, Video]
    related_skills: []
---

# Manim 影片製作流程

## 使用時機

當使用者要求以下內容時使用：動畫解說、數學動畫、概念視覺化、演算法走查、技術解說、3Blue1Brown 風格影片，或任何含幾何／數學內容的程式化動畫。以 Manim Community Edition 製作 3Blue1Brown 風格解說影片、演算法視覺化、公式推導、架構圖與數據故事。

## 創作標準

這是教育電影。每一幀都在教學。每一個動畫都在揭示結構。

**在寫下第一行程式碼之前**，先說清楚敘事弧線。這修正了什麼誤解？「啊哈時刻」是什麼？什麼樣的視覺故事能帶領觀眾從困惑走向理解？使用者的提示只是起點——請以教學企圖心去詮釋它。

**先幾何，後代數。** 先展示形狀，再給公式。視覺記憶比符號記憶編碼更快。當觀眾先看到幾何模式再看到公式時，方程會讓人感覺是水到渠成的。

**首次渲染的優秀程度沒有商量餘地。** 成品必須在不經修輪的情況下視覺清晰且美學一致。如果看起來雜亂、節奏不佳，或像「AI 生成的投影片」，那就是錯的。

**不透明度分層引導注意力。** 永遠不要把所有東西都以全亮度顯示。主要元素 1.0、語境元素 0.4、結構元素（座標軸、格線）0.15。大腦是分層處理視覺顯著性的。

**呼吸空間。** 每個動畫之後都需要 `self.wait()`。觀眾需要時間消化剛出現的內容。永遠不要從一個動畫急著趕到下一個。關鍵揭曉後的 2 秒停頓永遠不浪費。

**一致的視覺語言。** 所有場景共用一套色盤、一致的字級尺寸、相符的動畫速度。每個場景都用隨機不同顏色的影片，即使技術正確也是美學上的失敗。

## 前置需求

執行 `scripts/setup.sh` 驗證所有相依性。需要：Python 3.10+、Manim Community Edition v0.20+（`pip install manim`）、LaTeX（Linux 上 `texlive-full`、macOS 上 `mactex`）以及 ffmpeg。參考文件依 Manim CE v0.20.1 測試。

## 模式

| 模式 | 輸入 | 輸出 | 參考 |
|------|-------|--------|-----------|
| **概念解說** | 主題／概念 | 含幾何直覺的動畫解說 | `references/scene-planning.md` |
| **公式推導** | 數學表達式 | 逐步動畫證明 | `references/equations.md` |
| **演算法視覺化** | 演算法描述 | 含資料結構的逐步執行 | `references/graphs-and-data.md` |
| **數據故事** | 數據／指標 | 動畫圖表、比較、計數器 | `references/graphs-and-data.md` |
| **架構圖** | 系統描述 | 元件逐步建構與連線 | `references/mobjects.md` |
| **論文解說** | 研究論文 | 關鍵發現與方法動畫化 | `references/scene-planning.md` |
| **3D 視覺化** | 3D 概念 | 旋轉曲面、參數曲線、空間幾何 | `references/camera-and-3d.md` |

## 技術堆疊

每個專案一支 Python 腳本。不需要瀏覽器、Node.js 或 GPU。

| 層級 | 工具 | 用途 |
|-------|------|---------|
| 核心 | Manim Community Edition | 場景渲染、動畫引擎 |
| 數學 | LaTeX（texlive/MiKTeX） | 透過 `MathTex` 渲染公式 |
| 影片 I/O | ffmpeg | 場景串接、格式轉換、音訊混合 |
| TTS | ElevenLabs / Qwen3-TTS（選用） | 旁白配音 |

## 流程

```
PLAN --> CODE --> RENDER --> STITCH --> AUDIO (optional) --> REVIEW
```

1. **PLAN** — 撰寫 `plan.md`，包含敘事弧線、場景清單、視覺元素、色盤、旁白腳本
2. **CODE** — 撰寫 `script.py`，每個場景一個 class，各自可獨立渲染
3. **RENDER** — `manim -ql script.py Scene1 Scene2 ...` 產出草稿，`-qh` 產出正式版
4. **STITCH** — 用 ffmpeg 將場景片段串接為 `final.mp4`
5. **AUDIO**（選用）— 透過 ffmpeg 加入旁白及／或背景音樂。見 `references/rendering.md`
6. **REVIEW** — 渲染預覽靜幀，對照計畫驗證並調整

## 專案結構

```
project-name/
  plan.md                # 敘事弧線、場景拆解
  script.py              # 所有場景在單一檔案
  concat.txt             # ffmpeg 場景清單
  final.mp4              # 串接後的成品
  media/                 # 由 Manim 自動產生
    videos/script/480p15/
```

## 創作指導

### 色盤

| 色盤 | 背景 | 主色 | 次色 | 重點色 | 使用情境 |
|---------|-----------|---------|-----------|--------|----------|
| **經典 3B1B** | `#1C1C1C` | `#58C4DD` (BLUE) | `#83C167` (GREEN) | `#FFFF00` (YELLOW) | 一般數學／CS |
| **溫暖學院** | `#2D2B55` | `#FF6B6B` | `#FFD93D` | `#6BCB77` | 平易近人 |
| **霓虹科技** | `#0A0A0A` | `#00F5FF` | `#FF00FF` | `#39FF14` | 系統、架構 |
| **單色** | `#1A1A2E` | `#EAEAEA` | `#888888` | `#FFFFFF` | 極簡 |

### 動畫速度

| 情境 | run_time | 之後的 self.wait() |
|---------|----------|-------------------|
| 標題／開場出現 | 1.5s | 1.0s |
| 關鍵公式揭曉 | 2.0s | 2.0s |
| 轉換／變形 | 1.5s | 1.5s |
| 輔助標籤 | 0.8s | 0.5s |
| FadeOut 清場 | 0.5s | 0.3s |
| 「啊哈時刻」揭曉 | 2.5s | 3.0s |

### 字級層級

| 角色 | 字級 | 用途 |
|------|-----------|-------|
| 標題 | 48 | 場景標題、開場文字 |
| 標頭 | 36 | 場景內的段落標題 |
| 內文 | 30 | 說明文字 |
| 標籤 | 24 | 註記、座標軸標籤 |
| 說明 | 20 | 字幕、補充小字 |

### 字體

**所有文字都使用等寬字體。** Manim 的 Pango 渲染器在任何字級下與比例字體搭配都會產生破損的字距。完整建議見 `references/visual-design.md`。

```python
MONO = "Menlo"  # define once at top of file

Text("Fourier Series", font_size=48, font=MONO, weight=BOLD)  # titles
Text("n=1: sin(x)", font_size=20, font=MONO)                  # labels
MathTex(r"\nabla L")                                            # math (uses LaTeX)
```

最低 `font_size=18` 以確保可讀性。

### 場景變化

絕不對所有場景使用相同設定。每個場景：
- 從色盤中選**不同的主導色**
- **不同的版面** — 不要總是把所有東西置中
- **不同的動畫入場** — 在 Write、FadeIn、GrowFromCenter、Create 之間變化
- **不同的視覺重量** — 有些場景緊密，有些疏朗

## 工作流程

### 步驟 1：規劃（plan.md）

寫任何程式碼之前，先撰寫 `plan.md`。完整範本見 `references/scene-planning.md`。

### 步驟 2：撰寫程式碼（script.py）

每個場景一個 class。每個場景都可獨立渲染。

```python
from manim import *

BG = "#1C1C1C"
PRIMARY = "#58C4DD"
SECONDARY = "#83C167"
ACCENT = "#FFFF00"
MONO = "Menlo"

class Scene1_Introduction(Scene):
    def construct(self):
        self.camera.background_color = BG
        title = Text("Why Does This Work?", font_size=48, color=PRIMARY, weight=BOLD, font=MONO)
        self.add_subcaption("Why does this work?", duration=2)
        self.play(Write(title), run_time=1.5)
        self.wait(1.0)
        self.play(FadeOut(title), run_time=0.5)
```

關鍵模式：
- **每個動畫都有字幕**：`self.add_subcaption("text", duration=N)` 或在 `self.play()` 上使用 `subcaption="text"`
- **共用色彩常數**置於檔案頂端，確保跨場景一致
- **`self.camera.background_color`** 在每個場景中設定
- **乾淨離場** — 場景結束時 FadeOut 所有 mobject：`self.play(FadeOut(Group(*self.mobjects)))`

### 步驟 3：渲染

```bash
manim -ql script.py Scene1_Introduction Scene2_CoreConcept  # draft
manim -qh script.py Scene1_Introduction Scene2_CoreConcept  # production
```

### 步驟 4：串接

```bash
cat > concat.txt << 'EOF'
file 'media/videos/script/480p15/Scene1_Introduction.mp4'
file 'media/videos/script/480p15/Scene2_CoreConcept.mp4'
EOF
ffmpeg -y -f concat -safe 0 -i concat.txt -c copy final.mp4
```

### 步驟 5：檢視

```bash
manim -ql --format=png -s script.py Scene2_CoreConcept  # preview still
```

## 關鍵實作注意事項

### LaTeX 使用原始字串
```python
# WRONG: MathTex("\frac{1}{2}")
# RIGHT:
MathTex(r"\frac{1}{2}")
```

### 靠邊文字的 buff >= 0.5
```python
label.to_edge(DOWN, buff=0.5)  # never < 0.5
```

### 替換文字前先 FadeOut
```python
self.play(ReplacementTransform(note1, note2))  # not Write(note2) on top
```

### 絕不對未加入的 Mobject 執行動畫
```python
self.play(Create(circle))  # must add first
self.play(circle.animate.set_color(RED))  # then animate
```

## 效能目標

| 品質 | 解析度 | FPS | 速度 |
|---------|-----------|-----|-------|
| `-ql`（草稿） | 854x480 | 15 | 5-15s/場景 |
| `-qm`（中等） | 1280x720 | 30 | 15-60s/場景 |
| `-qh`（正式版） | 1920x1080 | 60 | 30-120s/場景 |

迭代一律使用 `-ql`。只有最終成品才渲染 `-qh`。

## 參考文件

| 檔案 | 內容 |
|------|----------|
| `references/animations.md` | 核心動畫、速率函數、組合、`.animate` 語法、節奏模式 |
| `references/mobjects.md` | 文字、形狀、VGroup/Group、定位、樣式、自訂 mobject |
| `references/visual-design.md` | 12 條設計原則、不透明度分層、版面範本、色盤 |
| `references/equations.md` | Manim 中的 LaTeX、TransformMatchingTex、推導模式 |
| `references/graphs-and-data.md` | 座標軸、繪圖、BarChart、動畫數據、演算法視覺化 |
| `references/camera-and-3d.md` | MovingCameraScene、ThreeDScene、3D 曲面、鏡頭控制 |
| `references/scene-planning.md` | 敘事弧線、版面範本、場景轉場、規劃範本 |
| `references/rendering.md` | CLI 參考、品質預設、ffmpeg、旁白工作流、GIF 匯出 |
| `references/troubleshooting.md` | LaTeX 錯誤、動畫錯誤、常見錯誤、除錯 |
| `references/animation-design-thinking.md` | 何時動畫 vs 靜態展示、拆解、節奏、旁白同步 |
| `references/updaters-and-trackers.md` | ValueTracker、add_updater、always_redraw、時間驅動 updater、模式 |
| `references/paper-explainer.md` | 將研究論文轉為動畫 — 工作流、範本、領域模式 |
| `references/decorations.md` | SurroundingRectangle、Brace、箭頭、DashedLine、Angle、註記生命週期 |
| `references/production-quality.md` | 寫碼前、渲染前、渲染後檢查清單、空間版面、色彩、節奏 |

---

## 創作發散（僅在使用者要求實驗性／創意／獨特輸出時使用）

若使用者要求創意、實驗性或非傳統的解說手法，請先選擇策略並想清楚步驟，再設計動畫。

- **SCAMPER** — 當使用者想要對標準解說有新鮮看法
- **假設顛覆** — 當使用者想挑戰某主題的典型教法

### SCAMPER 轉化
取一個標準的數學／技術視覺化並轉化它：
- **Substitute（替代）**：替換標準視覺隱喻（數字線 → 迂迴路徑、矩形 → 城市街廓）
- **Combine（合併）**：融合兩種解說方式（代數＋幾何同時進行）
- **Reverse（顛倒）**：反向推導 — 從結果出發，拆解回公理
- **Modify（修改）**：誇大參數以說明其重要性（學習率 10 倍、樣本數 1000 倍）
- **Eliminate（消除）**：移除所有符號 — 純粹用動畫與空間關係解說

### 假設顛覆
1. 列出此主題視覺化方式中所有「標準」之處（左到右、2D、離散步驟、正式符號）
2. 挑出最根本的假設
3. 顛倒它（右到左推導、2D 概念的 3D 嵌入、以連續變形取代步驟、零符號）
4. 探索這個顛倒揭示了什麼標準手法所隱藏的東西
