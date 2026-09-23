---
name: popular-web-designs
description: 54 套真實設計系統，可直接生成 HTML/CSS.
version: 1.0.0
author: Hermes Agent + Teknium (design systems sourced from VoltAgent/awesome-design-md)
license: MIT
tags: [design, css, html, ui, web-development, design-systems, templates]
platforms: [linux, macos, windows]
triggers:
  - build a page that looks like
  - make it look like stripe
  - design like linear
  - vercel style
  - create a UI
  - web design
  - landing page
  - dashboard design
  - website styled like
---

# 熱門網頁設計

54 套真實世界的設計系統，生成 HTML/CSS 時可直接取用。每個範本都完整擷取一個網站的視覺語言：色盤、字體層級、元件樣式、間距系統、陰影、響應式行為，以及附有精確 CSS 數值的實用代理提示。

## 相關設計技能

- **`claude-design`** — 用於設計的*流程與品味*（界定設計需求、產出變體、驗證本機 HTML 作品、避免 AI 設計俗物）。當使用者想要一個經過用心設計、比照已知品牌風格的頁面時，與本技能搭配使用：`claude-design` 主導流程，本技能提供視覺詞彙。
- **`design-md`** — 當交付物是正式的 DESIGN.md 權杖規格檔，而非渲染後的成品時使用。

## 使用方式

1. 從下方目錄中挑選一個設計
2. 載入它：`skill_view(name="popular-web-designs", file_path="templates/<site>.md")`
3. 產生 HTML 時套用其設計權杖與元件規格
4. 搭配 `generative-widgets` 技能，透過 cloudflared tunnel 提供成果

每個範本頂端都有一個 **Hermes Implementation Notes** 區塊，包含：
- CDN 字體替代方案與 Google Fonts `<link>` 標籤（可直接貼上）
- 主要與等寬的 CSS font-family 字堆
- 提醒使用 `write_file` 建立 HTML、使用 `browser_vision` 進行驗證

## HTML 產生模式

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  <!-- Paste the Google Fonts <link> from the template's Hermes notes -->
  <link href="https://fonts.googleapis.com/css2?family=..." rel="stylesheet">
  <style>
    /* Apply the template's color palette as CSS custom properties */
    :root {
      --color-bg: #ffffff;
      --color-text: #171717;
      --color-accent: #533afd;
      /* ... more from template Section 2 */
    }
    /* Apply typography from template Section 3 */
    body {
      font-family: 'Inter', system-ui, sans-serif;
      color: var(--color-text);
      background: var(--color-bg);
    }
    /* Apply component styles from template Section 4 */
    /* Apply layout from template Section 5 */
    /* Apply shadows from template Section 6 */
  </style>
</head>
<body>
  <!-- Build using component specs from the template -->
</body>
</html>
```

用 `write_file` 寫入檔案，以 `generative-widgets` 工作流（cloudflared tunnel）提供服務，並用 `browser_vision` 驗證成果是否符合視覺預期。

## 字體替換參考

多數網站使用的專有字體無法透過 CDN 取得。每個範本都對應一個能保留原設計個性的 Google Fonts 替代字體。常見對應：

| 專有字體 | CDN 替代 | 特性 |
|---|---|---|
| Geist / Geist Sans | Geist（Google Fonts 上） | 幾何感、緊縮字距 |
| Geist Mono | Geist Mono（Google Fonts 上） | 乾淨等寬、連字 |
| sohne-var (Stripe) | Source Sans 3 | 細字重的優雅 |
| Berkeley Mono | JetBrains Mono | 技術感等寬 |
| Airbnb Cereal VF | DM Sans | 圓潤友善的幾何風 |
| Circular (Spotify) | DM Sans | 幾何感、溫暖 |
| figmaSans | Inter | 乾淨人文風 |
| Pin Sans (Pinterest) | DM Sans | 友善、圓潤 |
| NVIDIA-EMEA | Inter（或 Arial 系統字） | 工業感、乾淨 |
| CoinbaseDisplay/Sans | DM Sans | 幾何感、值得信賴 |
| UberMove | DM Sans | 大膽、緊湊 |
| HashiCorp Sans | Inter | 企業感、中性 |
| waldenburgNormal (Sanity) | Space Grotesk | 幾何感、略緊縮 |
| IBM Plex Sans/Mono | IBM Plex Sans/Mono | Google Fonts 上可取得 |
| Rubik (Sentry) | Rubik | Google Fonts 上可取得 |

當範本的 CDN 字體與原版相同（Inter、IBM Plex、Rubik、Geist）時，沒有替換損失。當使用替代字體時（以 DM Sans 取代 Circular、以 Source Sans 3 取代 sohne-var），請緊密遵循範本的字重、字級與字距數值——這些比特定字體本身承載更多視覺識別。

## 設計目錄

### AI 與機器學習

| 範本 | 網站 | 風格 |
|---|---|---|
| `claude.md` | Anthropic Claude | 溫暖赤陶色重點、乾淨的編輯式版面 |
| `cohere.md` | Cohere | 明亮漸層、資料豐富的儀表板美學 |
| `elevenlabs.md` | ElevenLabs | 暗色電影感 UI、音波美學 |
| `minimax.md` | Minimax | 大膽暗色介面搭配霓虹重點色 |
| `mistral.ai.md` | Mistral AI | 法式工程極簡風、紫色調 |
| `ollama.md` | Ollama | 終端機優先、單色純粹 |
| `opencode.ai.md` | OpenCode AI | 開發者導向暗色主題、全等寬字體 |
| `replicate.md` | Replicate | 乾淨白色畫布、程式碼優先 |
| `runwayml.md` | RunwayML | 電影感暗色 UI、媒體豐富版面 |
| `together.ai.md` | Together AI | 技術感、藍圖風格設計 |
| `voltagent.md` | VoltAgent | 虛空黑畫布、翡翠綠重點、終端機原生 |
| `x.ai.md` | xAI | 冷峻單色、未來感極簡、全等寬字體 |

### 開發者工具與平台

| 範本 | 網站 | 風格 |
|---|---|---|
| `cursor.md` | Cursor | 流暢暗色介面、漸層重點色 |
| `expo.md` | Expo | 暗色主題、緊字距、程式碼為本 |
| `linear.app.md` | Linear | 超極簡暗色模式、精準、紫色重點 |
| `lovable.md` | Lovable | 俏皮漸層、友善開發美學 |
| `mintlify.md` | Mintlify | 乾淨、綠色重點、閱讀優化 |
| `posthog.md` | PostHog | 俏皮品牌、開發者友善暗色 UI |
| `raycast.md` | Raycast | 流暢暗色金屬感、明亮漸層重點 |
| `resend.md` | Resend | 極簡暗色主題、等寬重點色 |
| `sentry.md` | Sentry | 暗色儀表板、資料密集、粉紫重點 |
| `supabase.md` | Supabase | 暗翡翠主題、程式碼優先開發工具 |
| `superhuman.md` | Superhuman | 高端暗色 UI、鍵盤優先、紫色光暈 |
| `vercel.md` | Vercel | 黑白精準、Geist 字體系統 |
| `warp.md` | Warp | 暗色 IDE 風介面、區塊式指令 UI |
| `zapier.md` | Zapier | 溫暖橘色、友善插畫驅動 |

### 基礎設施與雲端

| 範本 | 網站 | 風格 |
|---|---|---|
| `clickhouse.md` | ClickHouse | 黃色重點、技術文件風格 |
| `composio.md` | Composio | 現代暗色搭配繽紛整合圖示 |
| `hashicorp.md` | HashiCorp | 企業級乾淨、黑白 |
| `mongodb.md` | MongoDB | 綠葉品牌、開發者文件導向 |
| `sanity.md` | Sanity | 紅色重點、內容優先編輯版面 |
| `stripe.md` | Stripe | 標誌性紫色漸層、300 字重的優雅 |

### 設計與生產力

| 範本 | 網站 | 風格 |
|---|---|---|
| `airtable.md` | Airtable | 繽紛、友善、結構化資料美學 |
| `cal.md` | Cal.com | 乾淨中性 UI、開發者導向的簡潔 |
| `clay.md` | Clay | 有機形狀、柔和漸層、藝術指導版面 |
| `figma.md` | Figma | 明亮多彩、俏皮而專業 |
| `framer.md` | Framer | 大膽黑藍、動效優先、設計導向 |
| `intercom.md` | Intercom | 友善藍色系、對話式 UI 模式 |
| `miro.md` | Miro | 明亮黃色重點、無限畫布美學 |
| `notion.md` | Notion | 溫暖極簡、襯線標題、柔和表面 |
| `pinterest.md` | Pinterest | 紅色重點、瀑布流網格、圖片優先版面 |
| `webflow.md` | Webflow | 藍色重點、精緻行銷網站美學 |

### 金融科技與加密貨幣

| 範本 | 網站 | 風格 |
|---|---|---|
| `coinbase.md` | Coinbase | 乾淨藍色識別、信任導向、機構感 |
| `kraken.md` | Kraken | 紫色重點暗色 UI、資料密集儀表板 |
| `revolut.md` | Revolut | 流暢暗色介面、漸層卡片、金融科技精準感 |
| `wise.md` | Wise | 明亮綠色重點、友善清晰 |

### 企業與消費品牌

| 範本 | 網站 | 風格 |
|---|---|---|
| `airbnb.md` | Airbnb | 溫暖珊瑚色重點、攝影驅動、圓角 UI |
| `apple.md` | Apple | 高端留白、SF Pro、電影感影像 |
| `bmw.md` | BMW | 暗色高端表面、精密工程美學 |
| `ibm.md` | IBM | Carbon 設計系統、結構化藍色系 |
| `nvidia.md` | NVIDIA | 綠黑能量、技術力量美學 |
| `spacex.md` | SpaceX | 冷峻黑白、滿版影像、未來感 |
| `spotify.md` | Spotify | 暗底上的明亮綠色、大膽字體、專輯封面驅動 |
| `uber.md` | Uber | 大膽黑白、緊湊字體、都市能量 |

## 選擇設計

讓設計與內容相符：

- **開發者工具／儀表板：** Linear、Vercel、Supabase、Raycast、Sentry
- **文件／內容網站：** Mintlify、Notion、Sanity、MongoDB
- **行銷／著陸頁：** Stripe、Framer、Apple、SpaceX
- **暗色模式 UI：** Linear、Cursor、ElevenLabs、Warp、Superhuman
- **淺色／乾淨 UI：** Vercel、Stripe、Notion、Cal.com、Replicate
- **俏皮／友善：** PostHog、Figma、Lovable、Zapier、Miro
- **高端／奢華：** Apple、BMW、Stripe、Superhuman、Revolut
- **資料密集／儀表板：** Sentry、Kraken、Cohere、ClickHouse
- **等寬／終端機美學：** Ollama、OpenCode、x.ai、VoltAgent
