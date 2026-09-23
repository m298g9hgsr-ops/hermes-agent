---
name: node-inspect-debugger
description: "以 --inspect 與 Chrome DevTools Protocol CLI 除錯 Node.js."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [debugging, nodejs, node-inspect, cdp, breakpoints, ui-tui]
    related_skills: [systematic-debugging, python-debugpy]
---

# Node.js Inspect 除錯器

## 總覽

當 `console.log` 不夠用時，從終端機以程式化方式驅動 Node 內建的 V8 inspector。你能獲得真正的中斷點、step in/over/out、呼叫堆疊走查、local/closure scope 傾印，以及在暫停 frame 中求值任意表達式。

兩個工具，挑一個：

- **`node inspect`** — 內建、零安裝、CLI REPL。最適合快速探查。
- **`ndb` / 透過 `chrome-remote-interface` 的 CDP** — 可從 Node/Python 寫腳本；當你想自動化大量中斷點、跨執行收集狀態，或從代理迴圈中非互動除錯時最適合。

**優先試 `node inspect`。** 它永遠可用，而且 REPL 很快。

## 使用時機

- Node 測試失敗，你需要看中間狀態
- ui-tui 當掉或行為錯誤，你想檢查 pre-render 的 React/Ink 狀態
- tui_gateway 子行程（`_SlashWorker`、PTY bridge 工作者）行為不軌
- 你需要檢查閉包中的某個值，而 `console.log` 不打補丁到不了
- 效能：附加到執行中的行程，擷取 CPU profile 或 heap snapshot

**不要用於：** `console.log` 一分鐘內能解決的事。中斷點驅動的除錯比較重；在回報真的值得時才用它。

## 快速參考：`node inspect` REPL

從第一行暫停啟動：

```bash
node inspect path/to/script.js
# or with tsx
node --inspect-brk $(which tsx) path/to/script.ts
```

`debug>` 提示接受：

| 指令 | 動作 |
|---|---|
| `c` 或 `cont` | 繼續 |
| `n` 或 `next` | step over |
| `s` 或 `step` | step into |
| `o` 或 `out` | step out |
| `pause` | 暫停執行中的程式碼 |
| `sb('file.js', 42)` | 在 file.js 第 42 行設中斷點 |
| `sb(42)` | 在目前檔案第 42 行設中斷點 |
| `sb('functionName')` | 函式被呼叫時中斷 |
| `cb('file.js', 42)` | 清除中斷點 |
| `breakpoints` | 列出所有中斷點 |
| `bt` | backtrace（呼叫堆疊） |
| `list(5)` | 顯示目前位置周圍 5 行原始碼 |
| `watch('expr')` | 每次暫停時求值 expr |
| `watchers` | 顯示被 watch 的運算式 |
| `repl` | 在目前 scope 進入 REPL（Ctrl+C 退出 REPL） |
| `exec expr` | 求值一次運算式 |
| `restart` | 重新啟動腳本 |
| `kill` | 殺掉腳本 |
| `.exit` | 退出除錯器 |

**在 `repl` 子模式中：** 輸入任何 JS 運算式，包括存取 locals/closure 變數。`Ctrl+C` 回到 `debug>`。

## 附加到執行中的行程

當行程已在執行時（例如長命的 dev server 或 TUI gateway）：

```bash
# 1. Send SIGUSR1 to enable the inspector on an existing process
kill -SIGUSR1 <pid>
# Node prints: Debugger listening on ws://127.0.0.1:9229/<uuid>

# 2. Attach the debugger CLI
node inspect -p <pid>
# or by URL
node inspect ws://127.0.0.1:9229/<uuid>
```

從一開始就帶著 inspector 啟動行程：

```bash
node --inspect script.js           # listen on 127.0.0.1:9229, keep running
node --inspect-brk script.js       # listen AND pause on first line
node --inspect=0.0.0.0:9230 script.js   # custom host:port
```

TypeScript 經 tsx：

```bash
node --inspect-brk --import tsx script.ts
# or older tsx
node --inspect-brk -r tsx/cjs script.ts
```

## 程式化 CDP（從終端機寫腳本）

當你想自動化 — 設很多中斷點、擷取 scope 狀態、重現腳本化 — 用 `chrome-remote-interface`：

```bash
npm i -g chrome-remote-interface        # or project-local
# Start your target:
node --inspect-brk=9229 target.js &
```

驅動腳本（存為 `~/.hermes/cache/scratch/cdp-debug.js`）：

```javascript
const CDP = require('chrome-remote-interface');

(async () => {
  const client = await CDP({ port: 9229 });
  const { Debugger, Runtime } = client;

  Debugger.paused(async ({ callFrames, reason }) => {
    const top = callFrames[0];
    console.log(`PAUSED: ${reason} @ ${top.url}:${top.location.lineNumber + 1}`);

    // Walk scopes for locals
    for (const scope of top.scopeChain) {
      if (scope.type === 'local' || scope.type === 'closure') {
        const { result } = await Runtime.getProperties({
          objectId: scope.object.objectId,
          ownProperties: true,
        });
        for (const p of result) {
          console.log(`  ${scope.type}.${p.name} =`, p.value?.value ?? p.value?.description);
        }
      }
    }

    // Evaluate an expression in the paused frame
    const { result } = await Debugger.evaluateOnCallFrame({
      callFrameId: top.callFrameId,
      expression: 'typeof state !== "undefined" ? JSON.stringify(state) : "n/a"',
    });
    console.log('state =', result.value ?? result.description);

    await Debugger.resume();
  });

  await Runtime.enable();
  await Debugger.enable();

  // Set a breakpoint by URL regex + line
  await Debugger.setBreakpointByUrl({
    urlRegex: '.*app\\.tsx$',
    lineNumber: 119,       // 0-indexed
    columnNumber: 0,
  });

  await Runtime.runIfWaitingForDebugger();
})();
```

執行它：

```bash
node ~/.hermes/cache/scratch/cdp-debug.js
```

Hermes 特定註記：`chrome-remote-interface` **不在** `ui-tui/package.json` 裡。若你不想弄髒專案，把它裝到一個可丟棄的位置：

```bash
mkdir -p ~/.hermes/cache/scratch/cdp-tools && cd ~/.hermes/cache/scratch/cdp-tools && npm i chrome-remote-interface
NODE_PATH=~/.hermes/cache/scratch/cdp-tools/node_modules node ~/.hermes/cache/scratch/cdp-debug.js
```

## 除錯 Hermes ui-tui

TUI 用 Ink + tsx 建構。兩個常見情境：

### 在開發模式下除錯單一 Ink 元件

`ui-tui/package.json` 有 `npm run dev`（tsx --watch）。直接跑 tsx 來加上 `--inspect-brk`：

```bash
cd <hermes-agent-repo>/ui-tui
npm run build    # produce dist/ once so transpile isn't needed on first load
node --inspect-brk dist/entry.js
# In another terminal:
node inspect -p <node pid>
```

然後在 `debug>` 內：

```
sb('dist/app.js', 220)     # or wherever the suspect render is
cont
```

暫停時，`repl` → 檢查 `props`、state refs、`useInput` handler 值等。

### 除錯執行中的 `hermes --tui`

TUI 從 Python CLI 產生 Node。最簡單的路徑：

```bash
# 1. Launch TUI
hermes --tui &
TUI_PID=$(pgrep -f 'ui-tui/dist/entry' | head -1)

# 2. Enable inspector on that Node PID
kill -SIGUSR1 "$TUI_PID"

# 3. Find the WS URL
curl -s http://127.0.0.1:9229/json/list | jq -r '.[0].webSocketDebuggerUrl'

# 4. Attach
node inspect ws://127.0.0.1:9229/<uuid>
```

與 TUI 互動（在其視窗中輸入）會繼續推進執行；你的除錯器可以在任何 `sb(...)` 中斷點上暫停它。

### 除錯 `_SlashWorker` / PTY 子行程

那些是 Python，不是 Node — 用 `python-debugpy` 技能。只有 Node 的部分（Ink UI、tui_gateway 用戶端、`ui-tui/` 下以 tsx 跑的測試）用本技能。

## 在除錯器下執行 Vitest 測試

```bash
cd <hermes-agent-repo>/ui-tui
# Run a single test file paused on entry
node --inspect-brk ./node_modules/vitest/vitest.mjs run --no-file-parallelism src/app/foo.test.tsx
```

在另一個終端機：`node inspect -p <pid>`，然後 `sb('src/app/foo.tsx', 42)`、`cont`。

用 `--no-file-parallelism`（vitest）或 `--runInBand`（jest）讓只有一個 worker 存在 — 除錯一個 pool 很痛苦。

## Heap 快照與 CPU Profile（非互動）

在上述 CDP 驅動中，把 Debugger 換成 `HeapProfiler` / `Profiler`：

```javascript
// CPU profile for 5 seconds
await client.Profiler.enable();
await client.Profiler.start();
await new Promise(r => setTimeout(r, 5000));
const { profile } = await client.Profiler.stop();
require('fs').writeFileSync('~/.hermes/cache/scratch/cpu.cpuprofile', JSON.stringify(profile));
// Open ~/.hermes/cache/scratch/cpu.cpuprofile in Chrome DevTools → Performance tab
```

```javascript
// Heap snapshot
await client.HeapProfiler.enable();
const chunks = [];
client.HeapProfiler.addHeapSnapshotChunk(({ chunk }) => chunks.push(chunk));
await client.HeapProfiler.takeHeapSnapshot({ reportProgress: false });
require('fs').writeFileSync('~/.hermes/cache/scratch/heap.heapsnapshot', chunks.join(''));
```

## 常見陷阱

1. **TS 原始碼中的行號錯誤。** 中斷點打在產生的 JS 上，不是 `.ts`。要嘛 (a) 在已建置的 `dist/*.js` 中斷，要嘛 (b) 啟用 sourcemap（`node --enable-source-maps`）並用 `sb('src/app.tsx', N)` — 但只在會跟隨 sourcemap 的 CDP client 下才行。`node inspect` CLI 不會。

2. **`--inspect` vs `--inspect-brk`。** `--inspect` 啟動 inspector 但不暫停；你附加太晚時，腳本會衝過你的第一個中斷點。要在任何程式碼執行前設中斷點，用 `--inspect-brk`。

3. **埠號衝突。** 預設是 `9229`。若多個 Node 行程在 inspect，傳 `--inspect=0`（隨機埠）並從 `/json/list` 讀實際 URL：
   ```bash
   curl -s http://127.0.0.1:9229/json/list   # lists all inspectable targets on the host
   ```

4. **子行程。** 父行程的 `--inspect` **不會**檢查它的子行程。用 `NODE_OPTIONS='--inspect-brk' node parent.js` 傳播給每個子行程；注意它們都需要獨特埠號（當繼承 `NODE_OPTIONS='--inspect'` 時 Node 會自動遞增）。

5. **背景殺除。** 若目標暫停時你 `Ctrl+C` 退出 `node inspect`，目標會停在暫停狀態。先 `cont`，或明確 `kill` 目標。

6. **透過代理終端機跑 `node inspect`。** 它是 PTY 友善的 REPL。在 Hermes 中，用 `terminal(pty=true)` 或 `background=true` + `process(action='submit', data='...')` 啟動它。非 PTY 的前景模式可用於單次指令，但不適用於互動式 step。

7. **安全。** `--inspect=0.0.0.0:9229` 暴露任意程式碼執行。除非你有隔離網路，否則一律綁到 `127.0.0.1`（預設）。

## 驗證清單

設定除錯 session 後驗證：

- [ ] `curl -s http://127.0.0.1:9229/json/list` 回傳的正是你預期的目標
- [ ] 第一個中斷點真的有中（沒中，你大概漏了 `--inspect-brk`，或在執行完成後才附加）
- [ ] 暫停時原始碼列出的檔案正確（不符 = sourcemap 問題，見陷阱 1）
- [ ] 在 `repl` 中 `exec process.pid` 回傳你本想附加的 PID

## 單次除錯配方

**「這個變數為什麼在第 X 行是 undefined？」**
```bash
node --inspect-brk script.js &
node inspect -p $!
# debug>
sb('script.js', X)
cont
# paused. Now:
repl
> myVariable
> Object.keys(this)
```

**「這函式的呼叫路徑是什麼？」**
```
debug> sb('suspectFn')
debug> cont
# paused on entry
debug> bt
```

**「這條 async 鏈卡住了 — 卡在哪？」**
```
# Start with --inspect (no -brk), let it run to the hang, then:
debug> pause
debug> bt
# Now you see the stuck frame
```
