---
name: python-debugpy
description: "用 pdb REPL 與 debugpy 遠端 (DAP) 除錯 Python."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [debugging, python, pdb, debugpy, breakpoints, dap, post-mortem]
    related_skills: [systematic-debugging, node-inspect-debugger]
---

# Python 偵錯器（pdb + debugpy）

## 總覽

三個工具，依情況挑選：

| 工具 | 時機 |
|---|---|
| **`breakpoint()` + pdb** | 本機、互動、最簡單。在原始碼加 `breakpoint()`、正常執行，就在那行拿到 REPL。 |
| **`python -m pdb`** | 不用改原始碼就在 pdb 下啟動既有腳本。適合快速探查。 |
| **`debugpy`** | 遠端 / 無頭 /「附加到已執行中的行程」。用 DAP 通話、可從終端機寫腳本、適用於長命行程（gateway、daemon、PTY 子行程）。 |

**從 `breakpoint()` 開始。** 它是成本最低又能運作的東西。

## 使用時機

- 測試失敗而 traceback 沒有透露值為什麼錯
- 你需要逐步走過一個函式，觀察集合在突變
- 長命行程（hermes gateway、tui_gateway）行為不軌，而且你不能重啟
- 事後剖析：例外在接近正式環境的程式碼中觸發，你想在崩潰點檢查 locals
- 子行程 / 子行程（Python `_SlashWorker`、PTY bridge 工作者）才是真正的 bug 所在地

**不要用於：** `print()` / `logging.debug` 一分鐘內能解決的事，或 `pytest -vv --tb=long --showlocals` 已經揭露的事。

## pdb 快速參考

在任何 pdb 提示（`(Pdb)`）內：

| 指令 | 動作 |
|---|---|
| `h` / `h cmd` | 求助 |
| `n` | 下一行（step over） |
| `s` | step into |
| `r` | 從目前函式 return |
| `c` | 繼續 |
| `unt N` | 繼續直到第 N 行 |
| `j N` | 跳到第 N 行（限同一個函式） |
| `l` / `ll` | 列出目前行附近原始碼 / 整個函式 |
| `w` | where（堆疊追蹤） |
| `u` / `d` | 在堆疊中往上 / 往下 |
| `a` | 印出目前函式的引數 |
| `p expr` / `pp expr` | 印出 / 美化印出運算式 |
| `display expr` | 每次停止時自動印出 expr |
| `b file:line` | 設中斷點 |
| `b func` | 函式進入時中斷 |
| `b file:line, cond` | 條件中斷點 |
| `cl N` | 清除中斷點 N |
| `tbreak file:line` | 一次性中斷點 |
| `!stmt` | 執行任意 Python（含指派） |
| `interact` | 在目前 scope 進入完整 Python REPL（Ctrl+D 退出） |
| `q` | 退出 |

`interact` 指令最強大 — 你可以 import 任何東西、檢查複雜物件，甚至呼叫會突變狀態的方法。Locals 預設唯讀；要突變就用 `(Pdb)` 提示中的 `!x = 42`。

## 做法 1：本機中斷點

最簡單。編輯檔案：

```python
def compute(x, y):
    result = some_helper(x)
    breakpoint()           # <-- drops into pdb here
    return result + y
```

正常執行程式碼。你落在 `breakpoint()` 那行，完整存取 locals。

**提交前別忘了移除 `breakpoint()`。** 用 `git diff` 或 pre-commit grep：
```bash
rg -n 'breakpoint\(\)' --type py
```

## 做法 2：在 pdb 下啟動腳本（不改原始碼）

```bash
python -m pdb path/to/script.py arg1 arg2
# Lands at first line of script
(Pdb) b path/to/script.py:42
(Pdb) c
```

## 做法 3：除錯 pytest 測試

hermes 測試執行器與 pytest 都支援：

```bash
# Drop to pdb on failure (or on any raised exception):
scripts/run_tests.sh tests/path/to/test_file.py::test_name --pdb

# Drop to pdb at the START of the test:
scripts/run_tests.sh tests/path/to/test_file.py::test_name --trace

# Show locals in tracebacks without pdb:
scripts/run_tests.sh tests/path/to/test_file.py --showlocals --tb=long
```

注意：`scripts/run_tests.sh` 透過 `run_tests_parallel.py` 在擷取的子行程中跑每個測試檔（無 xdist），所以互動式 pdb 在 wrapper 下**無法運作**。要 `--pdb` 直接跑 pytest：

```bash
source .venv/bin/activate
python -m pytest tests/foo_test.py::test_bar --pdb
```

這繞過 hermetic-env 保證 — 除錯沒問題，但推上去前要在 wrapper 下重跑確認。

## 做法 4：任何例外的事後剖析

```python
import pdb, sys
try:
    run_the_thing()
except Exception:
    pdb.post_mortem(sys.exc_info()[2])
```

或包住整個腳本：

```bash
python -m pdb -c continue script.py
# When it crashes, pdb catches it and you're in the frame of the exception
```

或在 repl/jupyter 中設全域 hook：

```python
import sys
def excepthook(etype, value, tb):
    import pdb; pdb.post_mortem(tb)
sys.excepthook = excepthook
```

## 做法 5：用 debugpy 遠端除錯（附加到執行中的行程）

適用於長命行程：Hermes gateway、tui_gateway、daemon、或已在行為不軌、無法乾淨重啟的行程。

### 設定

```bash
source <hermes-agent-repo>/.venv/bin/activate
pip install debugpy
```

### 模式 A：修改原始碼 — 啟動時等待除錯器

在進入點頂部附近（或你想除錯的函式內）加入：

```python
import debugpy
debugpy.listen(("127.0.0.1", 5678))
print("debugpy listening on 5678, waiting for client...", flush=True)
debugpy.wait_for_client()
debugpy.breakpoint()       # optional: pause immediately once attached
```

啟動行程；它會阻塞在 `wait_for_client()`。

### 模式 B：不改原始碼 — 用 `-m debugpy` 啟動

```bash
python -m debugpy --listen 127.0.0.1:5678 --wait-for-client your_script.py arg1
```

模組進入點的對應寫法：

```bash
python -m debugpy --listen 127.0.0.1:5678 --wait-for-client -m your.module
```

### 模式 C：附加到已是執行中的行程

需要 PID，且目標環境預先裝好 debugpy：

```bash
python -m debugpy --listen 127.0.0.1:5678 --pid <pid>
# debugpy injects itself into the process. Then attach a client as below.
```

某些 kernel/安全設定會擋基於 ptrace 的注入（`/proc/sys/kernel/yama/ptrace_scope`）。修法：
```bash
echo 0 | sudo tee /proc/sys/kernel/yama/ptrace_scope
```

### 從終端機連接用戶端

最簡單的終端側 DAP 用戶端是 VS Code CLI 或一支小腳本。在 Hermes 內你有兩個實用選項：

**選項 1：`debugpy` 自己的 CLI REPL** — 不是正式功能，而是一支很小的 DAP 用戶端腳本：

```python
# ~/.hermes/cache/scratch/dap_client.py
import socket, json, itertools, time, sys

HOST, PORT = "127.0.0.1", 5678
s = socket.create_connection((HOST, PORT))
seq = itertools.count(1)

def send(msg):
    msg["seq"] = next(seq)
    body = json.dumps(msg).encode()
    s.sendall(f"Content-Length: {len(body)}\r\n\r\n".encode() + body)

def recv():
    header = b""
    while b"\r\n\r\n" not in header:
        header += s.recv(1)
    length = int(header.decode().split("Content-Length:")[1].split("\r\n")[0].strip())
    body = b""
    while len(body) < length:
        body += s.recv(length - len(body))
    return json.loads(body)

send({"type": "request", "command": "initialize", "arguments": {"adapterID": "python"}})
print(recv())
send({"type": "request", "command": "attach", "arguments": {}})
print(recv())
send({"type": "request", "command": "setBreakpoints",
      "arguments": {"source": {"path": sys.argv[1]},
                    "breakpoints": [{"line": int(sys.argv[2])}]}})
print(recv())
send({"type": "request", "command": "configurationDone"})
# ... loop reading events and sending continue/stepIn/etc.
```

對一次性自動化夠用，但作為互動式 UX 很痛苦。

**選項 2：從 VS Code / Cursor / Zed 附加** — 若使用者有開其中一個，他們可以加 `launch.json`：

```json
{
  "name": "Attach to Hermes",
  "type": "debugpy",
  "request": "attach",
  "connect": { "host": "127.0.0.1", "port": 5678 },
  "justMyCode": false,
  "pathMappings": [
    { "localRoot": "${workspaceFolder}", "remoteRoot": "<hermes-agent-repo>" }
  ]
}
```

**選項 3：丟掉 DAP，用 `remote-pdb`** — 這通常是終端機代理真正想要的：

```bash
pip install remote-pdb
```

在你的程式碼中：
```python
from remote_pdb import set_trace
set_trace(host="127.0.0.1", port=4444)   # blocks until connection
```

然後從終端機：
```bash
nc 127.0.0.1 4444
# You get a (Pdb) prompt exactly as if debugging locally.
```

當 `debugpy` 的 DAP 協定小題大作時，`remote-pdb` 是對代理最友善的乾淨選擇。只有當你真的需要 IDE 整合時才用 `debugpy`。

## 除錯 Hermes 特定行程

### 測試
見做法 3。wrapper 會擷取子行程輸出，所以要互動式 pdb 必須直接跑 pytest。

### `run_agent.py` / CLI — 單次執行
最簡單：在可疑行附近加 `breakpoint()`，然後正常執行 `hermes`。控制權在暫停點回到你的終端機。

### `tui_gateway` 子行程（由 `hermes --tui` 產生）
gateway 以 Node TUI 的子行程執行。選項：

**A. 修改 gateway 原始碼：**
```python
# tui_gateway/server.py near the top of serve()
import debugpy
debugpy.listen(("127.0.0.1", 5678))
debugpy.wait_for_client()
```
啟動 `hermes --tui`。TUI 看起來會凍結（它的後端在等待）。附加用戶端；你 `continue` 時執行恢復。

**B. 在特定 handler 用 `remote-pdb`：**
```python
from remote_pdb import set_trace
set_trace(host="127.0.0.1", port=4444)   # in the RPC handler you want to trap
```
從 TUI 觸發對應的 slash 指令，然後在另一個終端機 `nc 127.0.0.1 4444`。

### `_SlashWorker` 子行程
同樣模式 — 在 worker 的 `exec` 路徑內用 `remote-pdb` 的 `set_trace()`。worker 跨 slash 指令持久存在，所以第一次觸發會阻塞到連上；之後的 slash 指令正常通過，除非你再次設下陷阱。

### Gateway（`gateway/run.py`）
長生命的。在 handler 用 `remote-pdb`，或反正要重啟 gateway 時用 `debugpy` 的 `--wait-for-client`。

## 常見陷阱

1. **pdb 在平行/擷取輸出的 runner 下會靜默無事發生。** 你看不到提示，測試只是卡住（pytest-xdist 與 `scripts/run_tests.sh` 擷取的逐檔子行程都如此）。互動除錯要在單一檔案上直接跑 pytest。

2. **CI / 非 TTY 環境中的 `breakpoint()` 會卡住行程。** 本機安全；絕不提交。加個 pre-commit grep 當安全網。

3. **`PYTHONBREAKPOINT=0`** 停用所有 `breakpoint()` 呼叫。你的中斷點不中時檢查這個 env：
   ```bash
   echo $PYTHONBREAKPOINT
   ```

4. **`debugpy.listen` 只在你也呼叫 `wait_for_client()` 時才阻塞。** 沒有它，執行繼續，而且你的第一個中斷點可能在用戶端附加前就觸發。

5. **在加固的 kernel 上附加 PID 會失敗。** `ptrace_scope=1`（Ubuntu 預設）只允許同使用者的 ptrace 子行程。Workaround：`echo 0 > /proc/sys/kernel/yama/ptrace_scope`（需要 root）或從頭就用 `debugpy` 啟動。

6. **執行緒。** `pdb` 只除錯目前執行緒。對多執行緒程式碼，用 `debugpy`（執行緒感知的 DAP），或逐執行緒設 `threading.settrace()`。

7. **asyncio。** `pdb` 在協程中可用，但 pdb 內的 `await` 需要 Python 3.13+，舊版本則要從 `interact` 模式 `await`。對 3.11/3.12，用 `asyncio.run_coroutine_threadsafe` 技巧，或用 `asyncio.ensure_future` 做 `!stmt` 式 await。

8. **`scripts/run_tests.sh` 會剝掉憑證並設 `HOME=<tmpdir>`。** 若你的 bug 依賴使用者設定或真實 API key，在 wrapper 下無法重現。先用裸 `pytest` 除錯重現，再在 wrapper 下重確認。

9. **Fork / multiprocessing。** pdb 不跟隨 fork。每個子行程需要自己的 `breakpoint()` 或 `set_trace()`。對 Hermes 子代理，一次除錯一個行程。

## 驗證清單

- [ ] 在 `pip install debugpy` 之後，確認：`python -c "import debugpy; print(debugpy.__version__)"`
- [ ] 遠端除錯時，確認埠號真的有在監聽：`ss -tlnp | grep 5678`
- [ ] 第一個中斷點真的有中（沒中，你大概有 `PYTHONBREAKPOINT=0`、在平行/擷取 runner 下，或執行在附加前就結束了）
- [ ] `where` / `w` 顯示預期的呼叫堆疊
- [ ] 除錯後清理：已提交的程式碼中沒有殘留的 `breakpoint()` / `set_trace()`
  ```bash
  rg -n 'breakpoint\(\)|set_trace\(|debugpy\.listen' --type py
  ```

## 單次除錯配方

**「這個 dict 為什麼少了 key？」**
```python
# add above the KeyError site
breakpoint()
# then in pdb:
(Pdb) pp d
(Pdb) pp list(d.keys())
(Pdb) w                # how did we get here
```

**「這個測試單獨跑會過、整套跑會掛。」**
```bash
scripts/run_tests.sh tests/the_test.py   # confirm it fails under the isolated runner first
# For interactive debugging, or if it only fails WITH other tests:
source .venv/bin/activate
python -m pytest tests/ -x --pdb
# Now it pdb-traps at the exact failing test after state accumulated.
```

**「我的 async handler 死鎖。」**
```python
# Add at handler entry
import remote_pdb; remote_pdb.set_trace(host="127.0.0.1", port=4444)
```
觸發 handler。`nc 127.0.0.1 4444`，然後 `w` 看懸空的 frame，`!import asyncio; asyncio.all_tasks()` 看還有什麼在 pending。

**「Ink 子行程 / 子行程崩潰的事後剖析。」**
```bash
PYTHONFAULTHANDLER=1 python -m pdb -c continue path/to/entrypoint.py
# On crash, pdb lands at the frame of the exception with full locals
```
