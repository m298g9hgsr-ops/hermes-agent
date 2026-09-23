---
name: maps
description: 透過 OpenStreetMap/OSRM 提供地理編碼、POI、路線與時區.
version: 1.2.0
author: Mibayy
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [maps, geocoding, places, routing, distance, directions, nearby, location, openstreetmap, nominatim, overpass, osrm]
    category: productivity
    requires_toolsets: [terminal]
    supersedes: [find-nearby]
---

# Maps 技能

使用免費開放資料來源的位置智慧。8 個指令、44 種 POI 類別、
零相依（僅 Python 標準函式庫）、不需 API 金鑰。

資料來源：OpenStreetMap/Nominatim、Overpass API、OSRM、TimeAPI.io。

本技能取代舊的 `find-nearby` 技能——find-nearby 的全部功能皆由下方的
`nearby` 指令涵蓋，同樣支援 `--near "<place>"` 簡寫與多類別。

## 使用時機

- 使用者傳送 Telegram 位置圖釘（訊息中的緯度／經度）→ `nearby`
- 使用者想要地名的座標 → `search`
- 使用者有座標並想要地址 → `reverse`
- 使用者詢問附近的餐廳、醫院、藥局、旅館等 → `nearby`
- 使用者想要開車／步行／騎車距離或行車時間 → `distance`
- 使用者想要兩地之間的逐段導航 → `directions`
- 使用者想要某位置的時區資訊 → `timezone`
- 使用者想在地理範圍內搜尋 POI → `area` ＋ `bbox`

## 前置需求

Python 3.8+（僅標準函式庫——不需 pip 安裝）。

腳本路徑：`~/.hermes/skills/maps/scripts/maps_client.py`

## 指令

```bash
MAPS=~/.hermes/skills/maps/scripts/maps_client.py
```

### search — 地名地理編碼

```bash
python $MAPS search "Eiffel Tower"
python $MAPS search "1600 Pennsylvania Ave, Washington DC"
```

回傳：緯度、經度、顯示名稱、類型、邊界框、重要性分數。

### reverse — 座標轉地址

```bash
python $MAPS reverse 48.8584 2.2945
```

回傳：完整地址分解（街道、城市、州、國家、郵遞區號）。

### nearby — 依類別尋找地點

```bash
# By coordinates (from a Telegram location pin, for example)
python $MAPS nearby 48.8584 2.2945 restaurant --limit 10
python $MAPS nearby 40.7128 -74.0060 hospital --radius 2000

# By address / city / zip / landmark — --near auto-geocodes
python $MAPS nearby --near "Times Square, New York" --category cafe
python $MAPS nearby --near "90210" --category pharmacy

# Multiple categories merged into one query
python $MAPS nearby --near "downtown austin" --category restaurant --category bar --limit 10
```

46 種類別：restaurant, cafe, bar, hospital, pharmacy, hotel, guest_house,
camp_site, supermarket, atm, gas_station, parking, museum, park, school,
university, bank, police, fire_station, library, airport, train_station,
bus_stop, church, mosque, synagogue, dentist, doctor, cinema, theatre, gym,
swimming_pool, post_office, convenience_store, bakery, bookshop, laundry,
car_wash, car_rental, bicycle_rental, taxi, veterinary, zoo, playground,
stadium, nightclub.

每個結果包含：`name`、`address`、`lat`／`lon`、`distance_m`、
`maps_url`（可點擊的 Google Maps 連結）、`directions_url`
（從搜尋點出發的 Google Maps 路線），以及可用時提升顯示的標籤——
`cuisine`、`hours`（opening_hours）、`phone`、`website`。

### distance — 行車距離與時間

```bash
python $MAPS distance "Paris" --to "Lyon"
python $MAPS distance "New York" --to "Boston" --mode driving
python $MAPS distance "Big Ben" --to "Tower Bridge" --mode walking
```

模式：driving（預設）、walking、cycling。回傳道路距離、時間，以及供
比較的直線距離。

### directions — 逐段導航

```bash
python $MAPS directions "Eiffel Tower" --to "Louvre Museum" --mode walking
python $MAPS directions "JFK Airport" --to "Times Square" --mode driving
```

回傳帶編號的步驟，含指示、距離、時間、道路名稱與操作類型
（turn、depart、arrive 等）。

### timezone — 座標的時區

```bash
python $MAPS timezone 48.8584 2.2945
python $MAPS timezone 35.6762 139.6503
```

回傳時區名稱、UTC 偏移與目前當地時間。

### area — 地點的邊界框與面積

```bash
python $MAPS area "Manhattan, New York"
python $MAPS area "London"
```

回傳邊界框座標、以公里計的寬／高與近似面積。可作為 bbox 指令的輸入。

### bbox — 在邊界框內搜尋

```bash
python $MAPS bbox 40.75 -74.00 40.77 -73.98 restaurant --limit 20
```

在地理矩形內尋找 POI。可先用 `area` 取得命名地點的邊界框座標。

## 處理 Telegram 位置圖釘

使用者傳送位置圖釘時，訊息中含有 `latitude:` 與 `longitude:` 欄位。
取出它們並直接傳給 `nearby`：

```bash
# User sent a pin at 36.17, -115.14 and asked "find cafes nearby"
python $MAPS nearby 36.17 -115.14 cafe --radius 1500
```

以帶編號的清單呈現結果，包含名稱、距離與 `maps_url` 欄位，讓使用者在
聊天中可點擊開啟。對於「現在有開嗎？」之類的問題，檢查 `hours` 欄位；
若缺失或不清楚，請用 `web_search` 驗證，因為 OSM 營業時間由社群
維護，不一定最新。

## 工作流程範例

**「找羅馬競技場附近的義大利餐廳」：**
1. `nearby --near "Colosseum Rome" --category restaurant --radius 500`
   ——單一指令，自動地理編碼

**「他們傳送的位置圖釘附近有什麼？」：**
1. 從 Telegram 訊息取出緯度／經度
2. `nearby LAT LON cafe --radius 1500`

**「從旅館怎麼步行到會議中心？」：**
1. `directions "Hotel Name" --to "Conference Center" --mode walking`

**「西雅圖市中心有哪些餐廳？」：**
1. `area "Downtown Seattle"` → 取得邊界框
2. `bbox S W N E restaurant --limit 30`

## 常見陷阱

- Nominatim 服務條款：每秒最多 1 個請求（腳本已自動處理）
- `nearby` 需要緯度／經度**或** `--near "<address>"`——兩者必具其一
- OSRM 路線規劃涵蓋以歐洲與北美最佳
- Overpass API 在尖峰時段可能變慢；腳本會自動在鏡像間切換
  （overpass-api.de → overpass.kumi.systems）
- `distance` 與 `directions` 的目的地使用 `--to` 旗標（非位置參數）
- 若單一郵遞區號在全球範圍內結果有歧義，請加上國家／州

## 驗證

```bash
python ~/.hermes/skills/maps/scripts/maps_client.py search "Statue of Liberty"
# Should return lat ~40.689, lon ~-74.044

python ~/.hermes/skills/maps/scripts/maps_client.py nearby --near "Times Square" --category restaurant --limit 3
# Should return a list of restaurants within ~500m of Times Square
```
