---
name: p5js
description: p5.js 草圖：生成藝術、著色器、互動與 3D.
version: 1.0.0
author: SHL0MS, Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [creative-coding, generative-art, p5js, canvas, interactive, visualization, webgl, shaders, animation]
    related_skills: [ascii-video, manim-video, excalidraw]
---

# p5.js 製作流程

## 使用時機

當使用者要求以下內容時使用：p5.js 草圖、創意程式設計、生成式藝術、互動式視覺化、canvas 動畫、瀏覽器視覺藝術、資料視覺化、著色器效果，或任何 p5.js 專案。

## 內容說明

使用 p5.js 的互動與生成式視覺藝術製作流程。建立瀏覽器草圖、生成式藝術、資料視覺化、互動體驗、3D 場景、音訊響應式視覺與動態圖形 — 匯出為 HTML、PNG、GIF、MP4 或 SVG。涵蓋：2D/3D 渲染、噪聲與粒子系統、流場、著色器（GLSL）、像素操控、動態字體排印、WebGL 場景、音訊分析、滑鼠／鍵盤互動，以及無頭高解析度匯出。

## 創作標準

這是在瀏覽器中渲染的視覺藝術。畫布是媒介；演算法是畫筆。

**在寫下第一行程式碼之前**，先說清楚創作概念。這個作品要傳達什麼？是什麼讓觀者停下捲動的手指？它與程式教學範例的差異在哪？使用者的提示只是起點 — 請以創作企圖心詮釋。

**首次渲染的優秀程度沒有商量餘地。** 成品必須在首次載入就視覺震撼。如果看起來像 p5.js 教學練習、預設設定，或「AI 生成的創意程式設計」，那就是錯的。發布前重新思考。

**超越參考詞彙。** 參考文件中的噪聲函式、粒子系統、色盤與著色器效果只是起步詞彙。每個專案都要組合、分層並發明。目錄是一盒顏料 — 真正的畫作由你執筆。

**主動創新。** 若使用者要求「一個粒子系統」，就交付一個具有浮現群集行為、殘影幽靈回聲、色盤位移深度霧、以及會呼吸的背景噪聲場的粒子系統。至少加入一個使用者沒要求但會感激的視覺細節。

**密集、分層、深思熟慮。** 每一幀都值得凝視。絕不用平白背景。永遠有構圖層級。永遠有意的用色。永遠要有仔細看才看得到的微細節。

**整體美學勝過功能數量。** 所有元素必須服務於統一的視覺語言 — 共用的色溫、一致的描邊粗細詞彙、和諧的動態速度。一個有十個不相關效果的草圖，不如三個彼此相配者。

## 模式

| 模式 | 輸入 | 輸出 | 參考 |
|------|-------|--------|-----------|
| **生成式藝術** | 種子／參數 | 程序化視覺構圖（靜態或動畫） | `references/visual-effects.md` |
| **資料視覺化** | 資料集／API | 互動圖表、圖形、自訂資料顯示 | `references/interaction.md` |
| **互動體驗** | 無（使用者驅動） | 滑鼠／鍵盤／觸控驅動草圖 | `references/interaction.md` |
| **動畫／動態圖形** | 時間軸／分鏡 | 計時序列、動態字體排印、轉場 | `references/animation.md` |
| **3D 場景** | 概念描述 | WebGL 幾何、照明、鏡頭、材質 | `references/webgl-and-3d.md` |
| **影像處理** | 影像檔案 | 像素操控、濾鏡、馬賽克、點描 | `references/visual-effects.md` § 像素操控 |
| **音訊響應式** | 音訊檔案／麥克風 | 聲音驅動的生成式視覺 | `references/interaction.md` § 音訊輸入 |

## 技術堆疊

每個專案一支自足的 HTML 檔案。不需要建置步驟。

| 層級 | 工具 | 用途 |
|-------|------|---------|
| 核心 | p5.js 1.11.3 (CDN) | Canvas 渲染、數學、變換、事件處理 |
| 3D | p5.js WebGL 模式 | 3D 幾何、鏡頭、照明、GLSL 著色器 |
| 音訊 | p5.sound.js (CDN) | FFT 分析、振幅、麥克風輸入、振盪器 |
| 匯出 | 內建 `saveCanvas()`／`saveGif()`／`saveFrames()` | PNG、GIF、幀序列輸出 |
| 擷取 | CCapture.js（選用） | 固定幀率影片擷取（WebM、GIF） |
| 無頭 | Puppeteer＋Node.js（選用） | 自動化高解析度渲染、經 ffmpeg 輸出 MP4 |
| SVG | p5.js-svg 1.6.0（選用） | 印刷用向量輸出 — 需要 p5.js 1.x |
| 自然媒材 | p5.brush（選用） | 水彩、炭筆、鋼筆 — 需要 p5.js 2.x＋WEBGL |
| 質感 | p5.grain（選用） | 底片顆粒、質感疊加 |
| 字體 | Google Fonts／`loadFont()` | 透過 OTF/TTF/WOFF2 自訂字體排印 |

### 版本註記

**p5.js 1.x**（1.11.3）是預設 — 穩定、文件完善、函式庫相容性最廣。除非專案需要 2.x 功能，否則使用它。

**p5.js 2.x**（2.2+）新增：`async setup()` 取代 `preload()`、OKLCH/OKLAB 色彩模式、`splineVertex()`、著色器 `.modify()` API、變動字體、`textToContours()`、指標事件。p5.brush 需要此版本。見 `references/core-api.md` § p5.js 2.0。

## 流程

每個專案都遵循相同的 6 階段路徑：

```
CONCEPT → DESIGN → CODE → PREVIEW → EXPORT → VERIFY
```

1. **CONCEPT** — 說清楚創作願景：情緒、色彩世界、動態詞彙、什麼讓它獨特
2. **DESIGN** — 選擇模式、畫布尺寸、互動模型、色彩系統、匯出格式。把概念對應到技術決策
3. **CODE** — 寫單一 HTML 檔案，內嵌 p5.js。結構：全域 → `preload()` → `setup()` → `draw()` → 輔助函式 → classes → 事件處理
4. **PREVIEW** — 在瀏覽器開啟，驗證視覺品質。以目標解析度測試。檢查效能
5. **EXPORT** — 擷取輸出：PNG 用 `saveCanvas()`、GIF 用 `saveGif()`、MP4 用 `saveFrames()`＋ffmpeg、批次無頭用 Puppeteer
6. **VERIFY** — 成品是否吻合概念？在目標顯示尺寸下是否視覺震撼？你會把它裱起來嗎？

## 創作指導

### 美學面向

| 面向 | 選項 | 參考 |
|-----------|---------|-----------|
| **色彩系統** | HSB/HSL、RGB、具名色盤、程序化和諧、漸層插值 | `references/color-systems.md` |
| **噪聲詞彙** | Perlin 噪聲、simplex、碎形（八度）、域扭曲、curl 噪聲 | `references/visual-effects.md` § 噪聲 |
| **粒子系統** | 物理驅動、群集、軌跡繪製、吸引子驅動、流場跟隨 | `references/visual-effects.md` § 粒子 |
| **形狀語言** | 幾何原語、自訂頂點、貝茲曲線、SVG 路徑 | `references/shapes-and-geometry.md` |
| **動態風格** | 補間、彈簧式、噪聲驅動、物理模擬、lerp、階梯式 | `references/animation.md` |
| **字體排印** | 系統字體、載入 OTF、`textToPoints()` 粒子文字、動態 | `references/typography.md` |
| **著色器效果** | GLSL fragment/vertex、濾鏡著色器、後處理、回饋迴圈 | `references/webgl-and-3d.md` § 著色器 |
| **構圖** | 網格、放射、黃金比例、三分法、有機散佈、平鋪 | `references/core-api.md` § 構圖 |
| **互動模型** | 滑鼠跟隨、點擊生成、拖曳、鍵盤狀態、捲動驅動、麥克風輸入 | `references/interaction.md` |
| **混色模式** | `BLEND`、`ADD`、`MULTIPLY`、`SCREEN`、`DIFFERENCE`、`EXCLUSION`、`OVERLAY` | `references/color-systems.md` § 混色模式 |
| **分層** | `createGraphics()` 離屏緩衝、alpha 合成、遮罩 | `references/core-api.md` § 離屏緩衝 |
| **質感** | Perlin 表面、點印、影線、網點、像素排序 | `references/visual-effects.md` § 質感生成 |

### 專案變化規則

絕不使用預設設定。每個專案：
- **自訂色盤** — 絕不用原始 `fill(255, 0, 0)`。永遠是含 3-7 色的設計過色盤
- **自訂描邊粗細詞彙** — 細重點（0.5）、中結構（1-2）、粗強調（3-5）
- **背景處理** — 絕不用普通 `background(0)` 或 `background(255)`。永遠是質感、漸層或分層
- **動態多樣** — 不同元素不同速度。主要 1x、次要 0.3x、環境 0.1x
- **至少一個發明元素** — 自訂粒子行為、全新的噪聲應用、獨特的互動回應

### 專案自訂發明

每個專案至少發明以下一項：
- 符合情緒的自訂色盤（不是預設）
- 全新的噪聲場組合（如 curl 噪聲＋域扭曲＋回饋）
- 獨特的粒子行為（自訂力、自訂軌跡、自訂生成）
- 使用者沒要求但讓作品更上一層的互動機制
- 創造視覺層級的構圖技巧

### 參數設計哲學

參數應從演算法中浮現，而不是來自通用面板。問：「*這個*系統的哪些屬性應該可調？」

**好參數**揭露演算法的個性：
- **數量** — 多少粒子、分支、細胞（控制密度）
- **尺度** — 噪聲頻率、元素尺寸、間距（控制質感）
- **速率** — 速度、成長率、衰減（控制能量）
- **閾值** — 行為何時改變？（控制戲劇性）
- **比例** — 比例關係、力之間的平衡（控制和諧）

**壞參數**是與演算法無關的通用控制：
- 「color1」、「color2」、「size」 — 沒有語境就是無意義
- 與效果無關的開關
- 只改變外觀、不改變行為的參數

每個參數都應改變演算法*思考*的方式，而不只是*看起來*的方式。一個改變噪聲八度的「turbulence」參數是好參數。一個只改變 `ellipse()` 半徑的「粒子尺寸」滑桿則太淺。

## 工作流程

### 步驟 1：創作願景

寫任何程式碼之前，先說清楚：

- **情緒／氛圍**：觀眾應該感受到什麼？沉思？活力？不安？俏皮？
- **視覺故事**：隨時間（或互動）發生什麼？建構？衰敗？轉化？振盪？
- **色彩世界**：暖／冷？單色？互補？主導色相是什麼？重點色呢？
- **形狀語言**：有機曲線？銳利幾何？點？線？混合？
- **動態詞彙**：緩慢漂浮？爆炸噴發？呼吸脈動？機械精準？
- **是什麼讓 THIS 與眾不同**：讓這個草圖獨一無二的那件事是什麼？

把使用者的提示對應到美學選擇。「放鬆的生成式背景」與「故障資料視覺化」需要的每一個元素都不同。

### 步驟 2：技術設計

- **模式** — 上表 7 種模式之一
- **畫布尺寸** — 橫向 1920x1080、直向 1080x1920、方形 1080x1080，或響應式 `windowWidth/windowHeight`
- **渲染器** — `P2D`（預設）或 `WEBGL`（用於 3D、著色器、進階混色模式）
- **幀率** — 60fps（互動）、30fps（環境動畫），或 `noLoop()`（靜態生成）
- **匯出目標** — 瀏覽器顯示、PNG 靜態、GIF 迴圈、MP4 影片、SVG 向量
- **互動模型** — 被動（無輸入）、滑鼠驅動、鍵盤驅動、音訊響應、捲動驅動
- **觀者 UI** — 對互動式生成藝術，從 `templates/viewer.html` 出發，它提供種子導覽、參數滑桿與下載。對簡單草圖或影片匯出，使用裸 HTML

### 步驟 3：撰寫草圖程式碼

對**互動式生成藝術**（種子探索、參數調校）：從 `templates/viewer.html` 出發。先讀範本，保留固定區段（種子導覽、動作），替換演算法與參數控制。這給你種子的 prev/next/random/jump、即時更新的參數滑桿，與 PNG 下載 — 全部接好線。

對**動畫、影片匯出或簡單草圖**：使用裸 HTML：

單一 HTML 檔案。結構：

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Name</title>
  <script>p5.disableFriendlyErrors = true;</script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/p5.min.js"></script>
  <!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.3/addons/p5.sound.min.js"></script> -->
  <!-- <script src="https://unpkg.com/p5.js-svg@1.6.0"></script> -->  <!-- SVG export -->
  <!-- <script src="https://cdn.jsdelivr.net/npm/ccapture.js-npmfixed/build/CCapture.all.min.js"></script> -->  <!-- video capture -->
  <style>
    html, body { margin: 0; padding: 0; overflow: hidden; }
    canvas { display: block; }
  </style>
</head>
<body>
<script>
// === Configuration ===
const CONFIG = {
  seed: 42,
  // ... project-specific params
};

// === Color Palette ===
const PALETTE = {
  bg: '#0a0a0f',
  primary: '#e8d5b7',
  // ...
};

// === Global State ===
let particles = [];

// === Preload (fonts, images, data) ===
function preload() {
  // font = loadFont('...');
}

// === Setup ===
function setup() {
  createCanvas(1920, 1080);
  randomSeed(CONFIG.seed);
  noiseSeed(CONFIG.seed);
  colorMode(HSB, 360, 100, 100, 100);
  // Initialize state...
}

// === Draw Loop ===
function draw() {
  // Render frame...
}

// === Helper Functions ===
// ...

// === Classes ===
class Particle {
  // ...
}

// === Event Handlers ===
function mousePressed() { /* ... */ }
function keyPressed() { /* ... */ }
function windowResized() { resizeCanvas(windowWidth, windowHeight); }
</script>
</body>
</html>
```

關鍵實作模式：
- **種子化隨機**：一律 `randomSeed()`＋`noiseSeed()` 以保證可重現
- **色彩模式**：用 `colorMode(HSB, 360, 100, 100, 100)` 取得直觀的顏色控制
- **狀態分離**：CONFIG 放參數、PALETTE 放顏色、全域變數放可變狀態
- **Class 化實體**：粒子、代理、形狀做成 class，配 `update()`＋`display()` 方法
- **離屏緩衝**：`createGraphics()` 做分層構圖、軌跡、遮罩

### 步驟 4：預覽與迭代

- 直接在瀏覽器開啟 HTML 檔案 — 基礎草圖不需伺服器
- 從本機檔案 `loadImage()`／`loadFont()` 時：使用 `scripts/serve.sh` 或 `python -m http.server`
- 用 Chrome DevTools 的 Performance 分頁驗證 60fps
- 以目標匯出解析度測試，而不只是視窗尺寸
- 調整參數直到視覺吻合步驟 1 的概念

### 步驟 5：匯出

| 格式 | 方法 | 指令 |
|--------|--------|---------|
| **PNG** | 在 `keyPressed()` 用 `saveCanvas('output', 'png')` | 按 's' 儲存 |
| **高解析 PNG** | Puppeteer 無頭擷取 | `node scripts/export-frames.js sketch.html --width 3840 --height 2160 --frames 1` |
| **GIF** | `saveGif('output', 5)` — 擷取 N 秒 | 按 'g' 儲存 |
| **幀序列** | `saveFrames('frame', 'png', 10, 30)` — 10 秒 @ 30fps | 然後 `ffmpeg -i frame-%04d.png -c:v libx264 output.mp4` |
| **MP4** | Puppeteer 幀擷取＋ffmpeg | `bash scripts/render.sh sketch.html output.mp4 --duration 30 --fps 30` |
| **SVG** | 用 `createCanvas(w, h, SVG)` 搭配 p5.js-svg | `save('output.svg')` |

### 步驟 6：品質驗證

- **是否吻合願景？** 將輸出比對創作概念。若看起來俗套，回到步驟 1
- **解析度檢查**：在目標顯示尺寸下是否銳利？無鋸齒瑕疵？
- **效能檢查**：瀏覽器中是否維持 60fps？（動畫至少 30fps）
- **色彩檢查**：顏色是否協調？在亮與暗的螢幕上都測試
- **邊界案例**：畫布邊緣發生什麼？resize 時？連續跑 10 分鐘後？

## 關鍵實作注意事項

### 效能 — 先關閉 FES

友善錯誤系統（FES）最多增加 10 倍開銷。每個正式草圖都要關閉它：

```javascript
p5.disableFriendlyErrors = true;  // BEFORE setup()

function setup() {
  pixelDensity(1);  // prevent 2x-4x overdraw on retina
  createCanvas(1920, 1080);
}
```

在熱迴圈（粒子、像素運算）中，使用 `Math.*` 而非 p5 包裝 — 可量測地更快：

```javascript
// In draw() or update() hot paths:
let a = Math.sin(t);          // not sin(t)
let r = Math.sqrt(dx*dx+dy*dy); // not dist() — or better: skip sqrt, compare magSq
let v = Math.random();        // not random() — when seed not needed
let m = Math.min(a, b);       // not min(a, b)
```

絕不在 `draw()` 內 `console.log()`。絕不在 `draw()` 內操作 DOM。見 `references/troubleshooting.md` § 效能。

### 種子化隨機 — 永遠

每個生成式草圖都必須可重現。同樣種子、同樣輸出。

```javascript
function setup() {
  randomSeed(CONFIG.seed);
  noiseSeed(CONFIG.seed);
  // All random() and noise() calls now deterministic
}
```

生成內容絕不使用 `Math.random()` — 只用在效能關鍵的非視覺程式碼。視覺元素一律使用 `random()`。若需要隨機種子：`CONFIG.seed = floor(random(99999))`。

### 生成式藝術平台支援（fxhash / Art Blocks）

對生成式藝術平台，用平台的確定性隨機取代 p5 的 PRNG：

```javascript
// fxhash convention
const SEED = $fx.hash;              // unique per mint
const rng = $fx.rand;               // deterministic PRNG
$fx.features({ palette: 'warm', complexity: 'high' });

// In setup():
randomSeed(SEED);   // for p5's noise()
noiseSeed(SEED);

// Replace random() with rng() for platform determinism
let x = rng() * width;  // instead of random(width)
```

見 `references/export-pipeline.md` § 平台匯出。

### 色彩模式 — 使用 HSB

對生成式藝術而言，HSB（色相、飽和、明度）比 RGB 容易操作得多：

```javascript
colorMode(HSB, 360, 100, 100, 100);
// Now: fill(hue, sat, bri, alpha)
// Rotate hue: fill((baseHue + offset) % 360, 80, 90)
// Desaturate: fill(hue, sat * 0.3, bri)
// Darken: fill(hue, sat, bri * 0.5)
```

絕不硬編碼原始 RGB 數值。定義一個色盤物件，再程序化推導變體。見 `references/color-systems.md`。

### 噪聲 — 多八度，不要裸噪聲

裸 `noise(x, y)` 看起來像平滑模糊塊。分層八度以取得自然質感：

```javascript
function fbm(x, y, octaves = 4) {
  let val = 0, amp = 1, freq = 1, sum = 0;
  for (let i = 0; i < octaves; i++) {
    val += noise(x * freq, y * freq) * amp;
    sum += amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val / sum;
}
```

對流動的有機形態，使用**域扭曲**：把噪聲輸出當成噪聲輸入座標送回。見 `references/visual-effects.md`。

### 用 createGraphics() 分層 — 非選用

平面單次渲染看起來很平。用離屏緩衝做構圖：

```javascript
let bgLayer, fgLayer, trailLayer;
function setup() {
  createCanvas(1920, 1080);
  bgLayer = createGraphics(width, height);
  fgLayer = createGraphics(width, height);
  trailLayer = createGraphics(width, height);
}
function draw() {
  renderBackground(bgLayer);
  renderTrails(trailLayer);   // persistent, fading
  renderForeground(fgLayer);  // cleared each frame
  image(bgLayer, 0, 0);
  image(trailLayer, 0, 0);
  image(fgLayer, 0, 0);
}
```

### 效能 — 盡可能向量化

p5.js 的 draw 呼叫很昂貴。對數千個粒子：

```javascript
// SLOW: individual shapes
for (let p of particles) {
  ellipse(p.x, p.y, p.size);
}

// FAST: single shape with beginShape()
beginShape(POINTS);
for (let p of particles) {
  vertex(p.x, p.y);
}
endShape();

// FASTEST: pixel buffer for massive counts
loadPixels();
for (let p of particles) {
  let idx = 4 * (floor(p.y) * width + floor(p.x));
  pixels[idx] = r; pixels[idx+1] = g; pixels[idx+2] = b; pixels[idx+3] = 255;
}
updatePixels();
```

見 `references/troubleshooting.md` § 效能。

### 多草圖的實例模式

全域模式會污染 `window`。正式製作使用實例模式：

```javascript
const sketch = (p) => {
  p.setup = function() {
    p.createCanvas(800, 800);
  };
  p.draw = function() {
    p.background(0);
    p.ellipse(p.mouseX, p.mouseY, 50);
  };
};
new p5(sketch, 'canvas-container');
```

在單一頁面嵌入多個草圖或與框架整合時必要。

### WebGL 模式雷區

- `createCanvas(w, h, WEBGL)` — 原點在中心，不是左上角
- Y 軸反向（WEBGL 中正 Y 向上、P2D 中向下）
- `translate(-width/2, -height/2)` 取得 P2D 風座標
- 每個變換都配 `push()`／`pop()` — 矩陣堆疊會靜默溢出
- `texture()` 要在 `rect()`／`plane()` 之前 — 不是之後
- 自訂著色器：`createShader(vert, frag)` — 在多重瀏覽器上測試

### 匯出 — 按鍵綁定慣例

每個草圖都應在 `keyPressed()` 中包含：

```javascript
function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('output', 'png');
  if (key === 'g' || key === 'G') saveGif('output', 5);
  if (key === 'r' || key === 'R') { randomSeed(millis()); noiseSeed(millis()); }
  if (key === ' ') CONFIG.paused = !CONFIG.paused;
}
```

### 無頭影片匯出 — 使用 noLoop()

對透過 Puppeteer 的無頭渲染，草圖**必須**在 setup 中使用 `noLoop()`。沒有它，p5 的 draw 迴圈會在截圖緩慢時自由運行 — 草圖超前執行，你會得到跳幀／重複幀。

```javascript
function setup() {
  createCanvas(1920, 1080);
  pixelDensity(1);
  noLoop();                    // capture script controls frame advance
  window._p5Ready = true;      // signal readiness to capture script
}
```

隨附的 `scripts/export-frames.js` 偵測 `_p5Ready` 並每次擷取呼叫一次 `redraw()`，達到精確的一對一幀對應。見 `references/export-pipeline.md` § 確定性擷取。

對多場景影片，使用每個片段架構：每個場景一個 HTML，獨立渲染，用 `ffmpeg -f concat` 串接。見 `references/export-pipeline.md` § 每片段架構。

### 代理工作流

建立 p5.js 草圖時：

1. **撰寫 HTML 檔案** — 單一自足檔案，所有程式碼內嵌
2. **在瀏覽器開啟** — `open sketch.html`（macOS）或 `xdg-open sketch.html`（Linux）
3. **本機資源**（字體、圖片）需要伺服器：在專案目錄中 `python -m http.server 8080`，然後開啟 `http://localhost:8080/sketch.html`
4. **匯出 PNG/GIF** — 如上所述加入 `keyPressed()` 快捷鍵，並告訴使用者按哪個鍵
5. **無頭匯出** — `node scripts/export-frames.js sketch.html --frames 300` 進行自動化幀擷取（草圖必須使用 `noLoop()`＋`_p5Ready`）
6. **MP4 渲染** — `bash scripts/render.sh sketch.html output.mp4 --duration 30`
7. **迭代精修** — 編輯 HTML 檔案，使用者重新整理瀏覽器看變化
8. **按需載入參考** — 實作過程中使用 `skill_view(name="p5js", file_path="references/...")` 載入特定參考檔案

## 效能目標

| 指標 | 目標 |
|--------|--------|
| 幀率（互動） | 持續 60fps |
| 幀率（動畫匯出） | 至少 30fps |
| 粒子數（P2D 形狀） | 60fps 下 5,000-10,000 |
| 粒子數（像素緩衝） | 60fps 下 50,000-100,000 |
| Canvas 解析度 | 最高 3840x2160（匯出）、1920x1080（互動） |
| 檔案大小（HTML） | < 100KB（不含 CDN 函式庫） |
| 載入時間 | 到第一幀 < 2s |

## 參考文件

| 檔案 | 內容 |
|------|----------|
| `references/core-api.md` | Canvas 設定、座標系統、draw 迴圈、`push()`／`pop()`、離屏緩衝、構圖模式、`pixelDensity()`、響應式設計 |
| `references/shapes-and-geometry.md` | 2D 原語、`beginShape()`／`endShape()`、Bezier/Catmull-Rom 曲線、`vertex()` 系統、自訂形狀、`p5.Vector`、有號距離場、SVG 路徑轉換 |
| `references/visual-effects.md` | 噪聲（Perlin、碎形、域扭曲、curl）、流場、粒子系統（物理、群集、軌跡）、像素操控、質感生成（點印、影線、網點）、回饋迴圈、反應擴散 |
| `references/animation.md` | 幀式動畫、補間函式、`lerp()`／`map()`、彈簧物理、狀態機、時間軸序列、基於 `millis()` 的計時、轉場模式 |
| `references/typography.md` | `text()`、`loadFont()`、`textToPoints()`、動態字體排印、文字遮罩、字體度量、響應式文字尺寸 |
| `references/color-systems.md` | `colorMode()`、HSB/HSL/RGB、`lerpColor()`、`paletteLerp()`、程序化色盤、色彩和諧、`blendMode()`、漸層渲染、策展色盤函式庫 |
| `references/webgl-and-3d.md` | WEBGL 渲染器、3D 原語、鏡頭、照明、材質、自訂幾何、GLSL 著色器（`createShader()`、`createFilterShader()`）、framebuffer、後處理 |
| `references/interaction.md` | 滑鼠事件、鍵盤狀態、觸控輸入、DOM 元素、`createSlider()`／`createButton()`、音訊輸入（p5.sound FFT/amplitude）、捲動驅動動畫、響應式事件 |
| `references/export-pipeline.md` | `saveCanvas()`、`saveGif()`、`saveFrames()`、確定性無頭擷取、ffmpeg 幀轉影片、CCapture.js、SVG 匯出、每片段架構、平台匯出（fxhash）、影片雷區 |
| `references/troubleshooting.md` | 效能剖析、每像素預算、常見錯誤、瀏覽器相容性、WebGL 除錯、字體載入問題、像素密度陷阱、記憶體洩漏、CORS |
| `templates/viewer.html` | 互動式觀看範本：種子導覽（prev/next/random/jump）、參數滑桿、下載 PNG、響應式 canvas。可探索的生成藝術由此出發 |

---

## 創作發散（僅在使用者要求實驗性／創意／獨特輸出時使用）

若使用者要求創意、實驗性、令人驚喜或非傳統的輸出，請選擇最適合的策略，並在生成程式碼之前先想清楚步驟。

- **概念融合** — 當使用者命名要合併的兩件事，或想要混合美學
- **SCAMPER** — 當使用者想在已知生成式藝術模式上做變化
- **距離聯想** — 當使用者給單一概念並想要探索（「做點關於時間的」）

### 概念融合
1. 命名兩個不同的視覺系統（例如粒子物理＋手寫）
2. 映射對應關係（粒子 = 墨滴、力 = 筆壓、場 = 字形）
3. 選擇性融合 — 保留能產生有趣浮現視覺的映射
4. 把融合寫成一個統一系統，而不是兩套並行的系統

### SCAMPER 轉化
取一個已知的生成式模式（流場、粒子系統、L-system、細胞自動機）並系統化轉化它：
- **Substitute（替代）**：把圓形換成文字字元、線換成漸層
- **Combine（合併）**：合併兩個模式（流場＋voronoi）
- **Adapt（改編）**：把 2D 模式套到 3D 投影
- **Modify（修改）**：誇大尺度、扭曲座標空間
- **Purpose（另作他用）**：用物理模擬做字體排印、用排序演算法做顏色
- **Eliminate（消除）**：移除網格、移除色彩、移除對稱
- **Reverse（顛倒）**：反向執行模擬、反轉參數空間

### 距離聯想
1. 錨定在使用者的概念上（例如「孤獨」）
2. 在三個距離生成聯想：
   - 近（顯而易見）：空房間、孤單身影、寂靜
   - 中（有趣）：魚群中游錯方向的一條魚、沒有通知的手機、地鐵車廂間的縫隙
   - 遠（抽象）：質數、漸近曲線、凌晨三點的顏色
3. 發展中距離的聯想 — 它們夠具體可視覺化，又夠出乎意料而有趣
