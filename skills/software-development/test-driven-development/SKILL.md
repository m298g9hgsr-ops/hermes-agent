---
name: test-driven-development
description: "TDD：強制 RED-GREEN-REFACTOR，先寫測試再寫程式."
version: 1.1.0
author: Hermes Agent (adapted from obra/superpowers)
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [testing, tdd, development, quality, red-green-refactor]
    related_skills: [systematic-debugging, subagent-driven-development]
---

# 測試驅動開發（TDD）

## 總覽

先寫測試。看著它失敗。寫最小程式碼讓它通過。

**核心原則：** 如果你沒看到測試失敗，你就不知道它測的是不是對的東西。

**違背規則的條文，就是違背規則的精神。**

## 使用時機

**一律：**
- 新功能
- Bug 修復
- 重構
- 行為變更

**例外（先問使用者）：**
- 可丟棄的原型
- 產生的程式碼
- 設定檔

心想「就這次跳過 TDD」？停。那是合理化藉口。

## 鐵律

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

測試之前先寫了程式碼？刪掉。重來。

**沒有例外：**
- 不要留著當「參考」
- 寫測試時不要「順便改」它
- 不要看它
- 刪除就是刪除

完全由測試起步重新實作。就是這樣。

## RED-GREEN-REFACTOR 迴圈

### RED — 寫失敗的測試

寫一個最小測試，展示應該發生什麼。

**好的測試：**
```python
def test_retries_failed_operations_3_times():
    attempts = 0
    def operation():
        nonlocal attempts
        attempts += 1
        if attempts < 3:
            raise Exception('fail')
        return 'success'

    result = retry_operation(operation)

    assert result == 'success'
    assert attempts == 3
```
名稱清楚、測真實行為、一件事。

**壞的測試：**
```python
def test_retry_works():
    mock = MagicMock()
    mock.side_effect = [Exception(), Exception(), 'success']
    result = retry_operation(mock)
    assert result == 'success'  # What about retry count? Timing?
```
名稱含糊、測的是 mock 不是真實程式碼。

**要求：**
- 每個測試一件行為
- 清楚描述性的名稱（名稱裡有「and」？拆開）
- 真實程式碼，不是 mock（除非真的無法避免）
- 名稱描述行為，不是實作

### 驗證 RED — 看著它失敗

**強制。絕不跳過。**

```bash
# Use terminal tool to run the specific test
pytest tests/test_feature.py::test_specific_behavior -v
```

確認：
- 測試失敗（不是拼字錯誤造成的 error）
- 失敗訊息符合預期
- 是因為功能缺少而失敗

**測試立刻通過？** 你在測既有行為。修測試。

**測試報 error？** 修 error，重跑到它正確地失敗。

### GREEN — 最小程式碼

寫最簡單、能讓測試通過的程式碼。不多不少。

**好的：**
```python
def add(a, b):
    return a + b  # Nothing extra
```

**壞的：**
```python
def add(a, b):
    result = a + b
    logging.info(f"Adding {a} + {b} = {result}")  # Extra!
    return result
```

不要加功能、不要重構其他程式碼、不要「改善」到超出測試。

**GREEN 階段允許作弊：**
- 硬編碼回傳值
- 複製貼上
- 重複程式碼
- 跳過邊緣案例

我們會在 REFACTOR 修。

### 驗證 GREEN — 看著它通過

**強制。**

```bash
# Run the specific test
pytest tests/test_feature.py::test_specific_behavior -v

# Then run ALL tests to check for regressions
pytest tests/ -q
```

確認：
- 測試通過
- 其他測試仍通過
- 輸出乾淨（無 error、無警告）

**測試失敗？** 修程式碼，不是修測試。

**其他測試失敗？** 現在就修回歸。

### REFACTOR — 整理

只在綠燈之後：
- 移除重複
- 改善命名
- 抽出輔助函式
- 簡化表達式

全程保持測試綠。不要加行為。

**重構時測試失敗：** 立刻復原。分更小的步。

### 重複

下一個行為的下一個失敗測試。一次一個迴圈。

## 避免水平切片

**不要**先把所有測試寫完、再寫所有實作。那就是水平切片：RED 變成「寫一堆想像中的測試」，GREEN 變成「讓那一堆通過」。它會產生脆弱的測試，因為測試是在實作教會你什麼行為、什麼介面才真的重要之前設計的。

改用垂直曳光彈：

```text
WRONG:
  RED:   test1, test2, test3, test4
  GREEN: impl1, impl2, impl3, impl4

RIGHT:
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
```

曳光彈就是一個端對端的行為切片。它證明路線可行、讓你看清介面，並讓每個下一個測試立足於你剛學到的事。

## 為什麼順序很重要

**「我之後再寫測試來驗證它能跑」**

事後寫的測試立刻通過。立刻通過證明不了任何事：
- 可能測錯東西
- 可能測到實作，而不是行為
- 可能漏掉你忘了的邊緣案例
- 你從沒看它抓到過 bug

測試先行強迫你看到測試失敗，證明它確實測了點東西。

**「邊緣案例我都手動測過了」**

手動測試是臨時的。你以為測了一切，但：
- 沒有測了什麼的記錄
- 程式碼變更時無法重跑
- 壓力下容易忘記案例
- 「我試的時候能跑」≠ 全面

自動化測試是系統化的。它們每次以同樣方式執行。

**「刪掉 X 小時的工作好浪費」**

沉沒成本謬誤。時間已經沒了。你現在的選擇：
- 刪掉，用 TDD 重寫（高信心）
- 留著，之後補測試（低信心、可能有 bug）

真正的「浪費」是留著你無法信賴的程式碼。

**「TDD 太教條了，務實就是調整」**

TDD 才是務實：
- 提交前就找到 bug（比事後除錯快）
- 防止回歸（測試立刻抓到破壞）
- 記錄行為（測試示範怎麼用程式碼）
- 讓重構可行（自由改，測試抓破壞）

「務實」的捷徑 = 在生產環境除錯 = 更慢。

**「事後測試也能達成同樣目標 — 那是精神而不是儀式」**

不。事後測試回答「這是做什麼的？」；測試先行回答「這應該做什麼？」

事後測試被你的實作帶偏。你測的是你建的，不是需要的。測試先行強迫你在實作前探索邊緣案例。

## 常見的合理化藉口

| 藉口 | 現實 |
|--------|---------|
| 「太簡單，不用測」 | 簡單的程式碼也會壞。測試只要 30 秒。 |
| 「我之後再測」 | 立刻通過的測試證明不了任何事。 |
| 「事後測試達成同樣目標」 | 事後 =「這是做什麼的？」先行 =「這應該做什麼？」 |
| 「已經手動測過了」 | 臨時 ≠ 系統化。沒記錄、無法重跑。 |
| 「刪掉 X 小時好浪費」 | 沉沒成本謬誤。留著未驗證的程式碼是技術債。 |
| 「留著當參考，先寫測試」 | 你會去改它。那還是事後測試。刪除就是刪除。 |
| 「需要先探索」 | 可以。丟掉探索成果，用 TDD 開始。 |
| 「測試難寫 = 設計不清楚」 | 聽測試的。難測 = 難用。 |
| 「TDD 會拖慢我」 | TDD 比除錯快。務實 = 測試先行。 |
| 「手動測試比較快」 | 手動證明不了邊緣案例。每次變更都要重測。 |
| 「既有程式碼沒測試」 | 你正在改善它。為你碰的程式碼加測試。 |

## 警訊 — 停下來重來

發現自己在做下面任何一項，就刪掉程式碼並用 TDD 重來：

- 測試之前先寫程式碼
- 實作後才寫測試
- 測試第一次跑就通過
- 說不出測試為什麼失敗
- 測試「之後」才補
- 合理化「就這次而已」
- 「我已經手動測過了」
- 「事後測試達成同樣目的」
- 「留著當參考」或「調整既有程式碼」
- 「已經花 X 小時了，刪掉很浪費」
- 「TDD 太教條，我是在務實」
- 「這個不一樣，因為……」

**以上全部代表：刪除程式碼。用 TDD 重來。**

## 驗證清單

在標記工作完成之前：

- [ ] 每個新函式/方法都有測試
- [ ] 實作前看過每個測試失敗
- [ ] 每個測試都因預期原因失敗（功能缺少，不是拼字錯誤）
- [ ] 寫了最小程式碼通過每個測試
- [ ] 所有測試通過
- [ ] 輸出乾淨（無 error、無警告）
- [ ] 測試用真實程式碼（mock 僅在無法避免時）
- [ ] 邊緣案例與錯誤都有涵蓋

有打勾打不完的？你跳過了 TDD。重來。

## 卡住時

| 問題 | 解決方式 |
|---------|----------|
| 不知道怎麼測 | 寫出你想要的 API。先寫斷言。問使用者。 |
| 測試太複雜 | 設計太複雜。簡化介面。 |
| 什麼都要 mock | 程式碼耦合太重。用依賴注入。 |
| 測試設定很龐大 | 抽出輔助函式。還是很複雜？簡化設計。 |

## Hermes Agent 整合

### 執行測試

每個步驟用 `terminal` 工具執行測試：

```python
# RED — verify failure
terminal("pytest tests/test_feature.py::test_name -v")

# GREEN — verify pass
terminal("pytest tests/test_feature.py::test_name -v")

# Full suite — verify no regressions
terminal("pytest tests/ -q")
```

### 搭配 delegate_task

派遣子代理實作時，在目標中強制 TDD：

```python
delegate_task(
    goal="Implement [feature] using strict TDD",
    context="""
    Follow test-driven-development skill:
    1. Write failing test FIRST
    2. Run test to verify it fails
    3. Write minimal code to pass
    4. Run test to verify it passes
    5. Refactor if needed
    6. Commit

    Project test command: pytest tests/ -q
    Project structure: [describe relevant files]
    """,
    toolsets=['terminal', 'file']
)
```

### 搭配 systematic-debugging

發現 bug？寫一個重現它的失敗測試。遵循 TDD 迴圈。測試證明修復並防止回歸。

絕不無測試修 bug。

## 測試反模式

- **測 mock 的行為而不是真實行為** — mock 應該驗證互動，不是取代受測系統
- **測實作細節** — 測行為/結果，不要測內部方法呼叫
- **只有 happy path** — 永遠測邊緣案例、錯誤與邊界
- **脆弱的測試** — 測試應驗證行為，不是結構；重構不該弄壞它們

## 最終法則

```
Production code → test exists and failed first
Otherwise → not TDD
```

未經使用者明確許可，沒有例外。
