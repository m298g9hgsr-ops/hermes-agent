---
name: arxiv
description: "以關鍵字、作者、類別或 ID 搜尋 arXiv 論文."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [Research, Arxiv, Papers, Academic, Science, API]
    related_skills: [pdf]
---

# arXiv 研究

透過 arXiv 的免費 REST API 搜尋與取得學術論文。不需 API 金鑰、不需相依套件 — 只要 curl。

## 快速參考

| 操作 | 指令 |
|--------|---------|
| 搜尋論文 | `curl "https://export.arxiv.org/api/query?search_query=all:QUERY&max_results=5"` |
| 取得特定論文 | `curl "https://export.arxiv.org/api/query?id_list=2402.03300"` |
| 讀摘要（網頁） | `web_extract(urls=["https://arxiv.org/abs/2402.03300"])` |
| 讀全文（PDF） | `web_extract(urls=["https://arxiv.org/pdf/2402.03300"])` |

## 搜尋論文

API 回傳 Atom XML。用 `grep`/`sed` 解析，或管線透過 `python` 取得乾淨輸出。

### 基本搜尋

```bash
curl -s "https://export.arxiv.org/api/query?search_query=all:GRPO+reinforcement+learning&max_results=5"
```

### 乾淨輸出（將 XML 解析為可讀格式）

```bash
curl -s "https://export.arxiv.org/api/query?search_query=all:GRPO+reinforcement+learning&max_results=5&sortBy=submittedDate&sortOrder=descending" | python -c "
import sys, xml.etree.ElementTree as ET
ns = {'a': 'http://www.w3.org/2005/Atom'}
root = ET.parse(sys.stdin).getroot()
for i, entry in enumerate(root.findall('a:entry', ns)):
    title = entry.find('a:title', ns).text.strip().replace('\n', ' ')
    arxiv_id = entry.find('a:id', ns).text.strip().split('/abs/')[-1]
    published = entry.find('a:published', ns).text[:10]
    authors = ', '.join(a.find('a:name', ns).text for a in entry.findall('a:author', ns))
    summary = entry.find('a:summary', ns).text.strip()[:200]
    cats = ', '.join(c.get('term') for c in entry.findall('a:category', ns))
    print(f'{i+1}. [{arxiv_id}] {title}')
    print(f'   Authors: {authors}')
    print(f'   Published: {published} | Categories: {cats}')
    print(f'   Abstract: {summary}...')
    print(f'   PDF: https://arxiv.org/pdf/{arxiv_id}')
    print()
"
```

## 搜尋查詢語法

| 前綴 | 搜尋範圍 | 範例 |
|--------|----------|---------|
| `all:` | 所有欄位 | `all:transformer+attention` |
| `ti:` | 標題 | `ti:large+language+models` |
| `au:` | 作者 | `au:vaswani` |
| `abs:` | 摘要 | `abs:reinforcement+learning` |
| `cat:` | 分類 | `cat:cs.AI` |
| `co:` | 評論 | `co:accepted+NeurIPS` |

### 布林運算子

```
# AND (default when using +)
search_query=all:transformer+attention

# OR
search_query=all:GPT+OR+all:BERT

# AND NOT
search_query=all:language+model+ANDNOT+all:vision

# Exact phrase
search_query=ti:"chain+of+thought"

# Combined
search_query=au:hinton+AND+cat:cs.LG
```

## 排序與分頁

| 參數 | 選項 |
|-----------|---------|
| `sortBy` | `relevance`、`lastUpdatedDate`、`submittedDate` |
| `sortOrder` | `ascending`、`descending` |
| `start` | 結果偏移（從 0 起算） |
| `max_results` | 結果數量（預設 10，上限 30000） |

```bash
# Latest 10 papers in cs.AI
curl -s "https://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending&max_results=10"
```

## 取得特定論文

```bash
# By arXiv ID
curl -s "https://export.arxiv.org/api/query?id_list=2402.03300"

# Multiple papers
curl -s "https://export.arxiv.org/api/query?id_list=2402.03300,2401.12345,2403.00001"
```

## BibTeX 產生

取得論文的中繼資料後，產生 BibTeX 條目：

{% raw %}
```bash
curl -s "https://export.arxiv.org/api/query?id_list=1706.03762" | python -c "
import sys, xml.etree.ElementTree as ET
ns = {'a': 'http://www.w3.org/2005/Atom', 'arxiv': 'http://arxiv.org/schemas/atom'}
root = ET.parse(sys.stdin).getroot()
entry = root.find('a:entry', ns)
if entry is None: sys.exit('Paper not found')
title = entry.find('a:title', ns).text.strip().replace('\n', ' ')
authors = ' and '.join(a.find('a:name', ns).text for a in entry.findall('a:author', ns))
year = entry.find('a:published', ns).text[:4]
raw_id = entry.find('a:id', ns).text.strip().split('/abs/')[-1]
cat = entry.find('arxiv:primary_category', ns)
primary = cat.get('term') if cat is not None else 'cs.LG'
last_name = entry.find('a:author', ns).find('a:name', ns).text.split()[-1]
print(f'@article{{{last_name}{year}_{raw_id.replace(\".\", \"\")},')
print(f'  title     = {{{title}}},')
print(f'  author    = {{{authors}}},')
print(f'  year      = {{{year}}},')
print(f'  eprint    = {{{raw_id}}},')
print(f'  archivePrefix = {{arXiv}},')
print(f'  primaryClass  = {{{primary}}},')
print(f'  url       = {{https://arxiv.org/abs/{raw_id}}}')
print('}')
"
```
{% endraw %}

## 閱讀論文內容

找到論文後，閱讀它：

```
# Abstract page (fast, metadata + abstract)
web_extract(urls=["https://arxiv.org/abs/2402.03300"])

# Full paper (PDF → markdown via Firecrawl)
web_extract(urls=["https://arxiv.org/pdf/2402.03300"])
```

本地 PDF 處理請見 `ocr-and-documents` 技能。

## 常見分類

| 分類 | 領域 |
|----------|-------|
| `cs.AI` | 人工智慧 |
| `cs.CL` | 計算與語言（NLP） |
| `cs.CV` | 電腦視覺 |
| `cs.LG` | 機器學習 |
| `cs.CR` | 密碼學與安全 |
| `stat.ML` | 機器學習（統計） |
| `math.OC` | 最佳化與控制 |
| `physics.comp-ph` | 計算物理 |

完整清單：https://arxiv.org/category_taxonomy

## 輔助腳本

`scripts/search_arxiv.py` 腳本處理 XML 解析並提供乾淨輸出：

```bash
python scripts/search_arxiv.py "GRPO reinforcement learning"
python scripts/search_arxiv.py "transformer attention" --max 10 --sort date
python scripts/search_arxiv.py --author "Yann LeCun" --max 5
python scripts/search_arxiv.py --category cs.AI --sort date
python scripts/search_arxiv.py --id 2402.03300
python scripts/search_arxiv.py --id 2402.03300,2401.12345
```

無相依套件 — 只用 Python 標準庫。

---

## Semantic Scholar（引用、相關論文、作者檔案）

arXiv 不提供引用資料或推薦。改用 **Semantic Scholar API** — 免費，基本使用不需金鑰（每秒 1 次請求），回傳 JSON。

### 取得論文詳情 + 引用數

```bash
# By arXiv ID
curl -s "https://api.semanticscholar.org/graph/v1/paper/arXiv:2402.03300?fields=title,authors,citationCount,referenceCount,influentialCitationCount,year,abstract" | python -m json.tool

# By Semantic Scholar paper ID or DOI
curl -s "https://api.semanticscholar.org/graph/v1/paper/DOI:10.1234/example?fields=title,citationCount"
```

### 取得某篇論文的引用（誰引用了它）

```bash
curl -s "https://api.semanticscholar.org/graph/v1/paper/arXiv:2402.03300/citations?fields=title,authors,year,citationCount&limit=10" | python -m json.tool
```

### 取得某篇論文的參考文獻（它引用了什麼）

```bash
curl -s "https://api.semanticscholar.org/graph/v1/paper/arXiv:2402.03300/references?fields=title,authors,year,citationCount&limit=10" | python -m json.tool
```

### 搜尋論文（arXiv 搜尋的替代，回傳 JSON）

```bash
curl -s "https://api.semanticscholar.org/graph/v1/paper/search?query=GRPO+reinforcement+learning&limit=5&fields=title,authors,year,citationCount,externalIds" | python -m json.tool
```

### 取得論文推薦

```bash
curl -s -X POST "https://api.semanticscholar.org/recommendations/v1/papers/" \
  -H "Content-Type: application/json" \
  -d '{"positivePaperIds": ["arXiv:2402.03300"], "negativePaperIds": []}' | python -m json.tool
```

### 作者檔案

```bash
curl -s "https://api.semanticscholar.org/graph/v1/author/search?query=Yann+LeCun&fields=name,hIndex,citationCount,paperCount" | python -m json.tool
```

### 有用的 Semantic Scholar 欄位

`title`、`authors`、`year`、`abstract`、`citationCount`、`referenceCount`、`influentialCitationCount`、`isOpenAccess`、`openAccessPdf`、`fieldsOfStudy`、`publicationVenue`、`externalIds`（含 arXiv ID、DOI 等）

---

## 完整研究流程

1. **探索**：`python scripts/search_arxiv.py "your topic" --sort date --max 10`
2. **評估影響力**：`curl -s "https://api.semanticscholar.org/graph/v1/paper/arXiv:ID?fields=citationCount,influentialCitationCount"`
3. **讀摘要**：`web_extract(urls=["https://arxiv.org/abs/ID"])`
4. **讀全文**：`web_extract(urls=["https://arxiv.org/pdf/ID"])`
5. **找相關研究**：`curl -s "https://api.semanticscholar.org/graph/v1/paper/arXiv:ID/references?fields=title,citationCount&limit=20"`
6. **取得推薦**：POST 到 Semantic Scholar 推薦端點
7. **追蹤作者**：`curl -s "https://api.semanticscholar.org/graph/v1/author/search?query=NAME"`

## 速率限制

| API | 速率 | 驗證 |
|-----|------|------|
| arXiv | 約每 3 秒 1 次請求 | 不需要 |
| Semantic Scholar | 每秒 1 次請求 | 不需要（有 API 金鑰為每秒 100 次） |

## 注意事項

- arXiv 回傳 Atom XML — 用輔助腳本或解析片段取得乾淨輸出
- Semantic Scholar 回傳 JSON — 管線透過 `python -m json.tool` 以提升可讀性
- arXiv ID：舊格式（`hep-th/0601001`）vs 新格式（`2402.03300`）
- PDF：`https://arxiv.org/pdf/{id}` — 摘要：`https://arxiv.org/abs/{id}`
- HTML（有提供時）：`https://arxiv.org/html/{id}`
- 本地 PDF 處理請見 `ocr-and-documents` 技能

## ID 版本

- `arxiv.org/abs/1706.03762` 一律解析到**最新**版本
- `arxiv.org/abs/1706.03762v1` 指向**特定**不可變版本
- 產生引用時，保留你實際閱讀的版本後綴以防引用漂移（後續版本可能大幅變更內容）
- API 的 `<id>` 欄位回傳含版本的 URL（例如 `http://arxiv.org/abs/1706.03762v7`）

## 已撤回的論文

論文提交後可能被撤回。發生時：
- `<summary>` 欄位包含撤回通知（尋找 "withdrawn" 或 "retracted"）
- 中繼資料欄位可能不完整
- 將結果視為有效論文前務必檢查摘要
