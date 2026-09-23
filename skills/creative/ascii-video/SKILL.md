---
name: ascii-video
description: ASCII 影片：將影片或音訊轉為彩色 ASCII MP4/GIF.
version: 1.0.0
author: SHL0MS, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [ASCII, Video, FFmpeg, Terminal-Art]
    related_skills: []
---

# ASCII 影片製作流程

## 使用時機

當使用者要求以下內容時使用：ASCII 影片、文字藝術影片、終端機風格影片、字元藝術動畫、復古文字視覺化、ASCII 音訊視覺化、將影片轉為 ASCII 藝術、矩陣風格效果，或任何動畫 ASCII 輸出。

## 內容說明

ASCII 藝術影片的製作流程 — 任何格式皆可。將影片／音訊／圖片／生成式輸入轉為彩色 ASCII 字元影片輸出（MP4、GIF、影像序列）。涵蓋：影片轉 ASCII、音訊響應式音樂視覺化、生成式 ASCII 藝術動畫、混合式影片＋音訊響應、文字／歌詞疊加、即時終端機渲染。

## 創作標準

這是視覺藝術。ASCII 字元是媒介；電影是標準。

**在寫下第一行程式碼之前**，先說清楚創作概念。情緒是什麼？這講述什麼視覺故事？是什麼讓*這個*專案不同於其他每一支 ASCII 影片？使用者的提示只是起點 — 請以創作企圖心詮釋，而非逐字轉錄。

**首次渲染的優秀程度沒有商量餘地。** 成品必須在不經修輪的情況下就視覺震撼。如果看起來俗套、平板，或像「AI 生成的 ASCII 藝術」，那就是錯的 — 在發布前重新思考創作概念。

**超越參考詞彙。** 參考文件中的效果目錄、著色器預設與色盤函式庫只是起步詞彙。每個專案都要組合、修改並發明新模式。目錄是一盒顏料 — 真正的畫作由你執筆。

**主動創新。** 當專案需要時擴充技能詞彙。如果參考內容沒有願景所需的東西，就把它造出來。至少加入一個使用者沒有要求但會感激的視覺時刻 — 一段轉場、一個效果、一個色彩選擇，讓整體更上一層。

**一致的美學勝過技術正確。** 影片中的所有場景必須透過統一的視覺語言彼此相連 — 共用的色溫、相關的字元色盤、一致動態詞彙。每個場景都用隨機不同效果的影片，即使技術正確也是美學上的失敗。

**密集、分層、深思熟慮。** 每一幀都值得凝視。絕不用扁平黑色背景。永遠多網格構圖。永遠依場景變化。永遠有意的用色。

## 模式

| 模式 | 輸入 | 輸出 | 參考 |
|------|-------|--------|-----------|
| **影片轉 ASCII** | 影片檔案 | 來源素材的 ASCII 重現 | `references/inputs.md` § 影片取樣 |
| **音訊響應式** | 音訊檔案 | 由音訊特徵驅動的生成式視覺 | `references/inputs.md` § 音訊分析 |
| **生成式** | 無（或種子參數） | 程序化 ASCII 動畫 | `references/effects.md` |
| **混合** | 影片＋音訊 | 含音訊響應式疊加的 ASCII 影片 | 兩份輸入參考 |
| **歌詞／文字** | 音訊＋文字/SRT | 附視覺效果的時間碼文字 | `references/inputs.md` § 文字／歌詞 |
| **TTS 旁白** | 文字引言＋TTS API | 附打字文字的旁白推薦／引言影片 | `references/inputs.md` § TTS 整合 |

## 技術堆疊

每個專案一支自足的 Python 腳本。不需要 GPU。

| 層級 | 工具 | 用途 |
|-------|------|---------|
| 核心 | Python 3.10+、NumPy | 數學、陣列運算、向量化效果 |
| 訊號 | SciPy | FFT、峰值偵測（音訊模式） |
| 影像 | Pillow (PIL) | 字體點陣化、幀解碼、影像 I/O |
| 影片 I/O | ffmpeg (CLI) | 解碼輸入、編碼輸出、混合音訊 |
| 平行 | concurrent.futures | N 個 worker 進行批次／片段渲染 |
| TTS | ElevenLabs API（選用） | 產生旁白片段 |
| 選用 | OpenCV | 影片幀取樣、邊緣偵測 |

## 流程架構

每個模式都遵循相同的 6 階段流程：

```
INPUT → ANALYZE → SCENE_FN → TONEMAP → SHADE → ENCODE
```

1. **INPUT** — 載入／解碼來源素材（影片幀、音訊樣本、圖片，或什麼都沒有）
2. **ANALYZE** — 擷取每幀特徵（音訊頻帶、影片亮度／邊緣、運動向量）
3. **SCENE_FN** — 場景函式渲染到像素畫布（`uint8 H,W,3`）。透過 `_render_vf()` 與像素混色模式組合多個字元網格。見 `references/composition.md`
4. **TONEMAP** — 基於百分位數的自適應亮度歸一化。見 `references/composition.md` § 自適應 Tonemap
5. **SHADE** — 透過 `ShaderChain`＋`FeedbackBuffer` 後製。見 `references/shaders.md`
6. **ENCODE** — 將原始 RGB 幀送入 ffmpeg 進行 H.264/GIF 編碼

## 創作指導

### 美學面向

| 面向 | 選項 | 參考 |
|-----------|---------|-----------|
| **字元色盤** | 密度漸層、區塊元素、符號、文字系統（片假名、希臘文、符文、點字）、專案自訂 | `architecture.md` § 色盤 |
| **色彩策略** | HSV、OKLAB/OKLCH、離散 RGB 色盤、自動生成和諧、單色、色溫 | `architecture.md` § 色彩系統 |
| **背景質感** | 正弦場、fBM 噪聲、域扭曲、voronoi、反應擴散、細胞自動機、影片 | `effects.md` |
| **主要效果** | 圓環、螺旋、隧道、渦旋、波浪、干涉、極光、火焰、SDF、奇異吸引子 | `effects.md` |
| **粒子** | 火花、雪、雨、氣泡、符文、軌道、群集 boids、流場跟隨者、軌跡 | `effects.md` § 粒子 |
| **著色器氛圍** | 復古 CRT、乾淨現代、故障藝術、電影感、夢幻、工業、迷幻 | `shaders.md` |
| **網格密度** | xs(8px) 到 xxl(40px)，可依層混用 | `architecture.md` § 網格系統 |
| **座標空間** | 笛卡爾、極座標、平鋪、旋轉、魚眼、莫比烏斯、域扭曲 | `effects.md` § 變換 |
| **回饋** | 縮放隧道、彩虹軌跡、幽靈回聲、旋轉曼陀羅、色彩演化 | `composition.md` § 回饋 |
| **遮罩** | 圓形、圓環、漸層、文字模板、動畫光圈／擦除／溶解 | `composition.md` § 遮罩 |
| **轉場** | 交叉淡化、擦除、溶解、故障切換、光圈、遮罩揭示 | `shaders.md` § 轉場 |

### 段落變化

絕不對整支影片使用相同設定。每個段落／場景：
- **不同的背景效果**（或組合 2-3 個）
- **不同的字元色盤**（配合情緒）
- **不同的色彩策略**（或至少不同的色相）
- **變化著色器強度**（高峰期更多輝光、安靜時更多顆粒）
- 若有粒子則**使用不同粒子類型**

### 專案自訂發明

每個專案至少發明以下一項：
- 符合主題的自訂字元色盤
- 自訂背景效果（組合／修改既有積木）
- 自訂色盤（符合品牌／情緒的離散 RGB 集合）
- 自訂粒子字元集
- 新穎的場景轉場或視覺時刻

不要只是從目錄挑選。目錄是詞彙 — 真正的詩由你執筆。

## 工作流程

### 步驟 1：創作願景

寫任何程式碼之前，先說清楚創作概念：

- **情緒／氛圍**：觀眾應該感受到什麼？活力、冥想、混亂、優雅、不祥？
- **視覺故事**：整段時間內發生什麼？堆疊張力？轉化？溶解？
- **色彩世界**：暖／冷？單色？霓虹？大地色調？主導色相是什麼？
- **字元質感**：密集數據？稀疏星辰？有機點？幾何區塊？
- **是什麼讓 THIS 與眾不同**：讓這個專案獨一無二的那件事是什麼？
- **情緒弧線**：場景如何推進？以能量開場、堆疊到高潮、收束？

把使用者的提示對應到美學選擇。「放鬆的 lo-fi 視覺化」與「故障駭客資料串流」需要的每一個元素都不同。

### 步驟 2：技術設計

- **模式** — 上述 6 種模式之一
- **解析度** — 橫向 1920x1080（預設）、直向 1080x1920、方形 1080x1080 @ 24fps
- **硬體偵測** — 自動偵測核心／記憶體，設定品質設定檔。見 `references/optimization.md`
- **段落** — 將時間戳對應到場景函式，每段各有自己的效果／色盤／顏色／著色器設定
- **輸出格式** — MP4（預設）、GIF（640x360 @ 15fps）、PNG 序列

### 步驟 3：撰寫腳本

單一 Python 檔案。元件（含參考）：

1. **硬體偵測＋品質設定檔** — `references/optimization.md`
2. **輸入載入器** — 依模式而定；`references/inputs.md`
3. **特徵分析器** — 音訊 FFT、影片亮度，或合成
4. **網格＋渲染器** — 含點陣圖快取的多密度網格；`references/architecture.md`
5. **字元色盤** — 每個專案多個；`references/architecture.md` § 色盤
6. **色彩系統** — HSV＋離散 RGB＋和諧生成；`references/architecture.md` § 色彩
7. **場景函式** — 每個回傳 `canvas (uint8 H,W,3)`；`references/scenes.md`
8. **Tonemap** — 自適應亮度歸一化；`references/composition.md`
9. **著色器流程** — `ShaderChain`＋`FeedbackBuffer`；`references/shaders.md`
10. **場景表＋調度器** — 時間 → 場景函式＋設定；`references/scenes.md`
11. **平行編碼器** — N-worker 片段渲染搭配 ffmpeg 管道
12. **Main** — 統籌完整流程

### 步驟 4：品質驗證

- **先測幀**：在完整渲染前，先於關鍵時間戳渲染單幀
- **亮度檢查**：所有 ASCII 內容的 `canvas.mean() > 8`。若過暗，降低 gamma
- **視覺一致性**：所有場景是否感覺屬於同一支影片？
- **創作願景檢查**：成品是否吻合步驟 1 的概念？如果看起來俗套，回頭重做

## 關鍵實作注意事項

### 亮度 — 使用 `tonemap()`，不要用線性乘數

這是第 1 號視覺問題。黑色之上的 ASCII 天生偏暗。**絕不使用 `canvas * N` 乘數** — 它們會裁切亮點。請使用自適應 tonemap：

```python
def tonemap(canvas, gamma=0.75):
    f = canvas.astype(np.float32)
    lo, hi = np.percentile(f[::4, ::4], [1, 99.5])
    if hi - lo < 10: hi = lo + 10
    f = np.clip((f - lo) / (hi - lo), 0, 1) ** gamma
    return (f * 255).astype(np.uint8)
```

流程：`scene_fn() → tonemap() → FeedbackBuffer → ShaderChain → ffmpeg`

每場景 gamma：預設 0.75、負片 0.55、海報化 0.50、明亮場景 0.85。暗層請使用 `screen` 混色（而非 `overlay`）。

### 字元格高度

macOS Pillow：`textbbox()` 回傳的高度不正確。請使用 `font.getmetrics()`：`cell_height = ascent + descent`。見 `references/troubleshooting.md`。

### ffmpeg 管道死鎖

長時間執行的 ffmpeg 絕不要用 `stderr=subprocess.PIPE` — 緩衝區在 64KB 會填滿並死鎖。改為導向檔案。見 `references/troubleshooting.md`。

### 字體相容性

並非所有 Unicode 字元都在所有字體中渲染。初始化時驗證色盤 — 渲染每個字元，檢查是否有空白輸出。見 `references/troubleshooting.md`。

### 每片段架構

對於分段影片（引言、場景、章節），將每段渲染成獨立片段檔，以便平行渲染與選擇性重渲染。見 `references/scenes.md`。

## 效能目標

| 元件 | 預算 |
|-----------|--------|
| 特徵抽取 | 1-5ms |
| 效果函式 | 2-15ms |
| 字元渲染 | 80-150ms（瓶頸） |
| 著色器流程 | 5-25ms |
| **總計** | ~100-200ms/幀 |

## 參考文件

| 檔案 | 內容 |
|------|----------|
| `references/architecture.md` | 網格系統、解析度預設、字體選擇、字元色盤（20+）、色彩系統（HSV＋OKLAB＋離散 RGB＋和諧生成）、`_render_vf()` 輔助、GridLayer class |
| `references/composition.md` | 像素混色模式（20 種模式）、`blend_canvas()`、多網格構圖、自適應 `tonemap()`、`FeedbackBuffer`、`PixelBlendStack`、遮罩／模板系統 |
| `references/effects.md` | 效果積木：數值場產生器、色相場、噪聲/fBM/域扭曲、voronoi、反應擴散、細胞自動機、SDF、奇異吸引子、粒子系統、座標變換、時間相干性 |
| `references/shaders.md` | `ShaderChain`、`_apply_shader_step()` 調度、38 款著色器目錄、音訊響應縮放、轉場、色彩基調預設、輸出格式編碼、終端機渲染 |
| `references/scenes.md` | 場景協定、`Renderer` class、`SCENES` 表、`render_clip()`、節拍同步剪輯、平行渲染、設計模式（層級結構、定向弧線、視覺隱喻、構圖技巧）、各種複雜度的完整場景範例、場景設計檢查清單 |
| `references/inputs.md` | 音訊分析（FFT、頻帶、節拍）、影片取樣、圖片轉換、文字／歌詞、TTS 整合（ElevenLabs、配音指派、音訊混音） |
| `references/optimization.md` | 硬體偵測、品質設定檔、向量化模式、平行渲染、記憶體管理、效能預算 |
| `references/troubleshooting.md` | NumPy 廣播陷阱、混色模式雷區、多處理／pickle、亮度診斷、ffmpeg 問題、字體問題、常見錯誤 |

---

## 創作發散（僅在使用者要求實驗性／創意／獨特輸出時使用）

若使用者要求創意、實驗性、令人驚喜或非傳統的輸出，請選擇最適合的策略，並在生成程式碼之前先想清楚步驟。

- **強制連結** — 當使用者想要跨領域靈感（「讓它看起來有機」、「工業美學」）
- **概念融合** — 當使用者指定要合併的兩件事（「海洋遇上音樂」、「太空＋書法」）
- **迂迴策略** — 當使用者完全開放（「讓我驚喜」、「我從沒見過的東西」）

### 強制連結
1. 挑一個與視覺目標無關的領域（天氣系統、微生物學、建築、流體動力學、織物編織）
2. 列出其核心視覺／結構元素（侵蝕 → 漸進揭示；有絲分裂 → 分裂複製；編織 → 交錯圖案）
3. 將這些元素映射到 ASCII 字元與動畫模式
4. 綜合成形 — 「侵蝕」或「結晶化」在字元網格中長什麼樣？

### 概念融合
1. 命名兩個不同的視覺／概念空間（例如海浪＋樂譜）
2. 映射對應關係（波峰 = 高音、波谷 = 休止符、浪花 = 斷奏）
3. 選擇性融合 — 保留最有趣的映射，丟棄牽強的
4. 發展只存在於融合中的浮現性質

### 迂迴策略
1. 抽一張：「Honor thy error as a hidden intention」／「Use an old idea」／「What would your closest friend do?」／「Emphasize the flaws」／「Turn it upside down」／「Only a part, not the whole」／「Reverse」
2. 把指令詮釋為對當前 ASCII 動畫挑戰的具體指引
3. 在寫程式碼之前，把這個側向洞見套用到視覺設計上
