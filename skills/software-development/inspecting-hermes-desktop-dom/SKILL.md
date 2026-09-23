---
name: inspecting-hermes-desktop-dom
description: "透過 CDP 讀取執行中 Hermes 桌面版的 DOM/CSS."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [desktop, electron, cdp, dom, ui-verification, self-inspection]
    related_skills: [node-inspect-debugger, systematic-debugging, dogfood]
---

# 檢視執行中的 Hermes 桌面版 DOM

## 總覽

當你在開發 `apps/desktop`、而使用者正在跑同一個應用（`hgui` / `npm run dev`）時，你可以直接讀取使用者正在看的那個視窗的**即時渲染 DOM** — 計算後的樣式、幾何、哪條 CSS 規則真正勝出、console 輸出 — 而不是從 `.tsx` 推論然後推錯。

Dev-server 執行時會自動在 `127.0.0.1:9222` 開一個 Chrome DevTools Protocol 埠。渲染器是 Chromium 頁面，所以 DevTools 讀得到的一切，腳本也讀得到。

**這不能取代親眼去看。** CDP 回答*事實*問題（「計算後的 padding 是多少」、「這個元素有渲染嗎」、「哪個 selector 命中」）。它不會告訴你結果好不好看。色彩平衡、間距手感、還有「這是不是很醜」仍然需要使用者的眼睛或截圖。用 CDP 回答事實；把美感交給使用者。

## 使用時機

- 驗證某個 UI 變更在執行中的應用裡真的生效
- 「這個元素為什麼還是 X？」— 編輯任何東西之前先找出勝出的規則
- 為你正要改的元件找一個穩定的 selector
- 在真實節點上檢查某個設計 token 的計算值
- 讀取使用者提到、卻複製不出來的渲染器 console 錯誤

**不要用於：** 效能剖析或 heap 工作（`node-inspect-debugger`、`debugging-hermes-desktop`），或任何真正問題是「這樣看起來對嗎」的情況。

## 埠號

任何 dev-server 執行時都開在 `127.0.0.1:9222`。只在兩種情況下關閉（`apps/desktop/electron/dev-cdp.ts`）：

- **打包後的 build** — 一律關，而且沒有環境變數能覆蓋它；
- **沒有 `HERMES_DESKTOP_DEV_SERVER`** — 針對 `dist/` 跑未打包的 `electron .` 是打包後 app 冒煙測試的方式，所以它的行為就像打包版。

`HERMES_DESKTOP_CDP_PORT` 可以移走埠號（`=9333`）或停用它（`=off`）。

做任何其他事之前先檢查：

```bash
curl -s --max-time 3 http://127.0.0.1:${HERMES_DESKTOP_CDP_PORT:-9222}/json/version
```

空 → 沒有埠。不要靜默猜另一個埠號。

**絕不要為了拿埠號而重啟使用者的 app。** 那會摧毀他們的 session 和狀態。改用你自己的隔離實例（見下方）。

## 讀取 DOM

`apps/desktop/scripts/eval.mjs` 是一行式的做法：

```bash
cd apps/desktop
node scripts/eval.mjs "document.querySelectorAll('[data-slot]').length"
```

多步驟工作用共享用戶端 — 它有 target 發現與 promise-aware eval：

```js
import { CDP, SELECTORS } from './scripts/perf/lib/cdp.mjs'

const cdp = await CDP.connect({ port: 9222, match: '5174' })
const out = await cdp.eval(`JSON.stringify({
  radius: getComputedStyle(document.documentElement).getPropertyValue('--radius-scalar').trim(),
  composer: !!document.querySelector('[data-slot="composer-rich-input"]')
})`)
cdp.close()
```

`scripts/perf/lib/cdp.mjs` 中的 `SELECTORS` 持有穩定的 `data-slot` 鉤子（composer、thread viewport、assistant message、turn pair、profile rail）。優先用它勝過自己發明 `querySelector` — 元件移動時它們會當一個整體更新。

## 它最擅長回答的問題：哪條規則勝出？

因為某個樣式「沒套用」就去改每個呼叫點，是經典的浪費。先讀真實節點：

```js
const el = document.querySelector('[data-slot="aui_assistant-message-root"] a')
JSON.stringify({
  ownClasses: el.className,
  weight: getComputedStyle(el).fontWeight,
  parents: (() => {
    const out = []
    let n = el
    while ((n = n.parentElement) && out.length < 6) out.push(n.className)
    return out
  })()
})
```

若節點自己沒有 class，那個值就是**繼承**的 — 大掃呼叫點修不好它，你需要祖先的規則。外掛 stylesheet（例如 `@tailwindcss/typography` 的 `prose a { font-weight: 500 }`）常態上會壓過工具 class；請在共享 class 上覆寫，而不是在每個使用處。

## 你自己的隔離實例

當沒有埠，或你不能再打擾使用者的視窗時：

```bash
cd apps/desktop
HERMES_HOME=$HOME/.hermes/cache/scratch/cdp-probe-home \
HERMES_DESKTOP_DEV_SERVER=http://127.0.0.1:5174 \
HERMES_DESKTOP_CDP_PORT=9333 \
  npx electron . --user-data-dir=$HOME/.hermes/cache/scratch/cdp-probe-userdata
```

分開的 `--user-data-dir` 繞過 Electron 的 single-instance 鎖，所以它不會與執行中的 `hgui` 相撞；分開的 `HERMES_HOME` 讓它遠離真實 session。基於同樣理由挑一個 9222 以外的埠。在背景跑它，用完殺掉。

`npm run perf:serve` 做同樣的事，內建一個臨時的 `HERMES_HOME`，若你同時想要效能 harness 可以用它。

## 常見陷阱

- **絕不要為「釋放」什麼而殺掉使用者的 dev server 或 app。** 在 serve 中途殺掉會炸掉 Chromium 的 socket pool，隨之而來的 `ERR_NETWORK_CHANGED` 會被怪到你剛改的東西頭上。
- **可丟棄的 `HERMES_HOME` 沒有後端。** app 對 `hermes:api` 記錄 `ECONNREFUSED`，而且可能自己退出。渲染器仍會掛載、DOM 仍可讀 — 快點讀，不要把自行退出的探測誤認為埠壞掉。Chromium 綁定成功時會記錄 `DevTools listening on ws://127.0.0.1:<port>/…`；那行就是埠已開的證明。
- **輪詢，不要只探一次。** 剛啟動的 app 需要一兩秒埠才會回應。
- **絕不傾倒整個 DOM。** 桌面版渲染數百個節點，`outerHTML` 會埋掉你的脈絡。在求值運算式內縮小成一個小的 JSON 物件。
- **把 `match` 傳給 `CDP.connect`。** 沒有它，你可能附加到 pet overlay、快速輸入視窗或 devtools target，而不是主視窗。
- **`cdp.eval` 回傳值；裸 `Runtime.evaluate` 會把它雙層巢套**（`.result.result.value`）。用 wrapper。
- **這個 repo 中 `import.meta.env.DEV` 在 `vite dev` 下是 `true`。** `apps/desktop/scripts/profile-typing-lag.md` 裡宣稱相反的註記已經過時。
