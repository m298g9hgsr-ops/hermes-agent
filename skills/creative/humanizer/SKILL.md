---
name: humanizer
description: 讓文字更人性化：去除 AI 腔調並增添真實語氣.
version: 2.5.1
author: Siqi Chen (@blader, https://github.com/blader/humanizer), ported by Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [writing, editing, humanize, anti-ai-slop, voice, prose, text]
    category: creative
    homepage: https://github.com/blader/humanizer
    related_skills: [songwriting-and-ai-music]
---

# 人性化：去除 AI 寫作模式

辨識並去除 AI 生成文字的特徵，讓文章自然得像人寫的。改編自維基百科的「Signs of AI writing」指南（由 WikiProject AI Cleanup 維護），源於對數千份 AI 生成文字實例的觀察。

**關鍵洞見：** LLM 使用統計演算法猜測下一個該出現什麼。結果傾向於最有統計可能性的完成方式，這就是下方那些可疑特徵被刻進文字的由來。

## 使用時機

當使用者要求以下事項時載入本技能：
- 「人性化」、「去 AI 化」、「去俗套」、「反 ChatGPT 化」一段文字
- 改寫某段文字，讓它聽起來不像 LLM 寫的
- 編輯草稿（部落格文章、文章、PR 描述、文件、備忘錄、email、推文、履歷要點）讓它更自然
- 在他們寫作時貼合他們的語氣
- 發布前檢查文章中是否有 AI 特徵

同時也要把本技能套用到**你自己的**對外散文上，例如發行說明、PR 描述、文件與摘要。Hermes 的基準語氣已經去掉大多數這些特徵，但一趟聚焦的檢視能攔住漏網之魚。

## 在 Hermes 中使用方法

文字通常以以下三種方式之一送達：
1. **內嵌。** 使用者在訊息中貼上文字。就地處理並回覆改寫結果。
2. **檔案。** 使用者指向一個檔案。用 `read_file` 載入，再用 `patch` 或 `write_file` 套用編輯。對 repo 裡的 markdown 文件，逐章節做有針對性的 `patch` 比整份重寫更乾淨。
3. **語氣校準樣本。** 使用者提供一段自己寫的樣本（內嵌或檔案路徑），要求你貼合。先讀樣本，再改寫。見下方語氣校準一節。

務必向使用者展示改寫結果。對檔案編輯，展示 diff 或改動的章節，而不是默默覆寫。

## 你的任務

當被要求人性化一段文字時：

1. **辨識 AI 模式。** 掃描下方列出的 34 種模式。
2. **改寫問題章節。** 用自然的替代寫法取代 AI 腔。
3. **保留意涵。** 保持核心訊息完整。
4. **維持語氣。** 貼合預期的語調（正式、隨興、技術性等）。若有提供語氣樣本，具體貼合它。
5. **注入靈魂。** 去除壞模式只完成一半；改寫還需要真實的個性。見下方「個性與靈魂」。
6. **做最後一趟反 AI 檢視。** 問自己：「下面這段哪裡明顯是 AI 生成的？」簡短回答還留下的特徵，然後再修一輪。


## 語氣校準（選用）

若使用者提供寫作樣本（他們先前自己的寫作），改寫前先分析：

1. **先讀樣本。** 記下：
   - 句子長度模式（短而有力？長而流暢？混合？）
   - 用字層次（隨興？學術？介於兩者之間？）
   - 段落的開頭方式（直接切入？先鋪陳？）
   - 標點習慣（很愛破折號？括號插語？分號？）
   - 任何重複的短語或口頭禪
   - 他們如何處理轉折（明確的連結詞？還是直接開始下一點？）

2. **在改寫中貼合他們的語氣。** 去除 AI 模式只完成一半；也要把樣本中的模式換進來。若他們寫短句，不要寫長句。若他們用「stuff」和「things」，不要升級成「elements」和「components」。

3. **沒提供樣本時，** 退回預設行為（下方「個性與靈魂」一節的自然、多變、有主見語氣）。

### 如何提供樣本
- 內嵌：「Humanize this text. Here's a sample of my writing for voice matching: [sample]」
- 檔案：「Humanize this text. Use my writing style from [file path] as a reference.」


## 個性與靈魂

避開 AI 模式只完成一半。冷冰冰、沒有語氣的寫作跟俗物一樣明顯。好的寫作背後有個真人。

### 沒有靈魂的寫作特徵（即使技術上「乾淨」）：
- 每個句子長度與結構都一樣
- 沒有主見，只是中性陳述
- 不承認不確定或矛盾心情
- 適當時沒有第一人稱
- 沒有幽默、沒有銳利、沒有個性
- 讀起來像維基百科條目或新聞稿

### 如何增添語氣：

**要有主見。** 陳述事實，然後對它做出反應。「我真心不知道該怎麼看待這個」比中性地列出優缺點更像人。

**變化你的節奏。** 短而有力的句子。然後是慢慢抵達目的地長句子。混著來。

**承認複雜性。** 真人有一言難盡的感受。「這很了不起，但也有點讓人心神不寧」勝過「這很了不起」。

**在合適處用「我」。** 第一人稱讀起來誠實，也適合多數散文。「我老是回到……」、「這裡讓我介意的是……」顯示背後有個真人在思考。

**容許一些混亂。** 完美的結構感覺像演算法。離題、插話、半成形的想法都是人性的。

**具體描述感受。** 與其寫「這令人擔憂」，不如寫「三更半夜沒人看管、我們那些 agent 卻在嘎嘎運作，有些什麼讓人心神不寧」。

### 之前（乾淨但沒有靈魂）：
> 這個實驗產生了有趣的結果。agent 生成了三百萬行程式碼。有些開發者印象深刻，有些則抱持懷疑。其意涵仍不明朗。

### 之後（有心跳）：
> 我真心不知道該怎麼看待這個。三百萬行程式碼，在人類大約都睡著的時間生成。整個開發社群一半人快要抓狂，一半人在解釋這為什麼不算數。真相大概就無聊地落在中間，但我一直想到那些整夜運作的 agent。


## 內容模式

### 1. 過度強調重要性、遺產與更廣的趨勢

**要留意的詞：** stands/serves as, is a testament/reminder, a vital/significant/crucial/pivotal/key role/moment, underscores/highlights its importance/significance, reflects broader, symbolizing its ongoing/enduring/lasting, contributing to the, setting the stage for, marking/shaping the, represents/marks a shift, key turning point, evolving landscape, focal point, indelible mark, deeply rooted

**問題：** LLM 寫作會透過加入「任意的面向代表或貢獻於更廣主題」這類陳述來吹捧重要性。

**之前：**
> The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain. This initiative was part of a broader movement across Spain to decentralize administrative functions and enhance regional governance.

**之後：**
> The Statistical Institute of Catalonia was established in 1989 to collect and publish regional statistics independently from Spain's national statistics office.


### 2. 過度強調知名度與媒體報導

**要留意的詞：** independent coverage, local/regional/national media outlets, written by a leading expert, active social media presence

**問題：** LLM 會用一連串知名度主張猛砸讀者，常常列出一堆沒有脈絡的來源。

**之前：**
> Her views have been cited in The New York Times, BBC, Financial Times, and The Hindu. She maintains an active social media presence with over 500,000 followers.

**之後：**
> In a 2024 New York Times interview, she argued that AI regulation should focus on outcomes rather than methods.


### 3. 以 -ing 結尾的膚淺分析

**要留意的詞：** highlighting/underscoring/emphasizing..., ensuring..., reflecting/symbolizing..., contributing to..., cultivating/fostering..., encompassing..., showcasing...

**問題：** AI 聊天機器人會在句子上綴上現在分詞（「-ing」）短語，添加虛假的深度。

**之前：**
> The temple's color palette of blue, green, and gold resonates with the region's natural beauty, symbolizing Texas bluebonnets, the Gulf of Mexico, and the diverse Texan landscapes, reflecting the community's deep connection to the land.

**之後：**
> The temple uses blue, green, and gold colors. The architect said these were chosen to reference local bluebonnets and the Gulf coast.


### 4. 促銷與廣告式語言

**要留意的詞：** boasts a, vibrant, rich (figurative), profound, enhancing its, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking (figurative), renowned, breathtaking, must-visit, stunning

**問題：** LLM 在維持中性語調上有嚴重問題，尤其是「文化遺產」類主題。

**之前：**
> Nestled within the breathtaking region of Gonder in Ethiopia, Alamata Raya Kobo stands as a vibrant town with a rich cultural heritage and stunning natural beauty.

**之後：**
> Alamata Raya Kobo is a town in the Gonder region of Ethiopia, known for its weekly market and 18th-century church.


### 5. 模糊歸因與含糊其辭

**要留意的詞：** Industry reports, Observers have cited, Experts argue, Some critics argue, several sources/publications (when few cited)

**問題：** AI 聊天機器人把意見歸給模糊的權威，卻沒有具體來源。

**之前：**
> Due to its unique characteristics, the Haolai River is of interest to researchers and conservationists. Experts believe it plays a crucial role in the regional ecosystem.

**之後：**
> The Haolai River supports several endemic fish species, according to a 2019 survey by the Chinese Academy of Sciences.


### 6. 清單式「挑戰與未來展望」章節

**要留意的詞：** Despite its... faces several challenges..., Despite these challenges, Challenges and Legacy, Future Outlook

**問題：** 許多 LLM 生成的文章都有公式化的「挑戰」章節。

**之前：**
> Despite its industrial prosperity, Korattur faces challenges typical of urban areas, including traffic congestion and water scarcity. Despite these challenges, with its strategic location and ongoing initiatives, Korattur continues to thrive as an integral part of Chennai's growth.

**之後：**
> Traffic congestion increased after 2015 when three new IT parks opened. The municipal corporation began a stormwater drainage project in 2022 to address recurring floods.


## 語言與文法模式

### 7. 過度使用的「AI 詞彙」

**高頻 AI 詞：** Actually, additionally, align with, crucial, delve, emphasizing, enduring, enhance, fostering, garner, highlight (verb), interplay, intricate/intricacies, key (adjective), landscape (abstract noun), pivotal, showcase, tapestry (abstract noun), testament, underscore (verb), valuable, vibrant

**行銷與部落格陳腔濫調（同一特徵，不同語域）：** at the end of the day, when it comes to, in a world where, moving forward, circle back, deep dive, game-changer, double down, take a step back, on the same page, make no mistake, it turns out, let me be clear, navigate (for challenges), lean into, unpack (before analysis), straightforward (to describe anything)

**問題：** 這些詞在 2023 年後的文章中出現頻率遠高於以往。它們往往成群出現。

**之前：**
> Additionally, a distinctive feature of Somali cuisine is the incorporation of camel meat. An enduring testament to Italian colonial influence is the widespread adoption of pasta in the local culinary landscape, showcasing how these dishes have integrated into the traditional diet.

**之後：**
> Somali cuisine also includes camel meat, which is considered a delicacy. Pasta dishes, introduced during Italian colonization, remain common, especially in the south.


### 8. 迴避「is」／「are」（系動詞迴避）

**要留意的詞：** serves as/stands as/marks/represents [a], boasts/features/offers [a]

**問題：** LLM 用精心構造的結構取代簡單的系動詞。

**之前：**
> Gallery 825 serves as LAAA's exhibition space for contemporary art. The gallery features four separate spaces and boasts over 3,000 square feet.

**之後：**
> Gallery 825 is LAAA's exhibition space for contemporary art. The gallery has four rooms totaling 3,000 square feet.


### 9. 否定平行與尾隨否定

**問題：** 「Not only...but...」或「It's not just about..., it's...」這類結構被過度使用。同樣，剪短式尾隨否定殘片，例如把「no guessing」或「no wasted motion」甩在句尾，而不是寫成真正的子句。

**之前：**
> It's not just about the beat riding under the vocals; it's part of the aggression and atmosphere. It's not merely a song, it's a statement.

**之後：**
> The heavy beat adds to the aggressive tone.

**之前（尾隨否定）：**
> The options come from the selected item, no guessing.

**之後：**
> The options come from the selected item without forcing the user to guess.


### 10. 三連句過度使用

**問題：** LLM 強迫把想法塞進三的群組，來顯得面面俱到。

**之前：**
> The event features keynote sessions, panel discussions, and networking opportunities. Attendees can expect innovation, inspiration, and industry insights.

**之後：**
> The event includes talks and panels. There's also time for informal networking between sessions.


### 11. 華麗變體（同義詞輪換）

**問題：** AI 有重複懲罰的程式碼，導致過度的同義詞替換。

**之前：**
> The protagonist faces many challenges. The main character must overcome obstacles. The central figure eventually triumphs. The hero returns home.

**之後：**
> The protagonist faces many challenges but eventually triumphs and returns home.


### 12. 虛假範圍

**問題：** LLM 使用「from X to Y」的結構，但 X 和 Y 並不在同一條有意義的尺度上。

**之前：**
> Our journey through the universe has taken us from the singularity of the Big Bang to the grand cosmic web, from the birth and death of stars to the enigmatic dance of dark matter.

**之後：**
> The book covers the Big Bang, star formation, and current theories about dark matter.


### 13. 被動語態與無主詞殘片

**問題：** LLM 常隱藏動作主體或整個拿掉主詞，例如「No configuration file needed」或「The results are preserved automatically」。當主動語態能讓句子更清楚直接時，改寫這些。

**之前：**
> No configuration file needed. The results are preserved automatically.

**之後：**
> You do not need a configuration file. The system preserves the results automatically.


## 風格模式

### 14. 破折號過度使用

**問題：** LLM 使用破折號（—）的頻率高於人類，模仿「有力」的銷售寫法。實際上，其中大多數可以用逗號、句號或括號改寫得更乾淨。

**之前：**
> The term is primarily promoted by Dutch institutions—not by the people themselves. You don't say "Netherlands, Europe" as an address—yet this mislabeling continues—even in official documents.

**之後：**
> The term is primarily promoted by Dutch institutions, not by the people themselves. You don't say "Netherlands, Europe" as an address, yet this mislabeling continues in official documents.


### 15. 粗體過度使用

**問題：** AI 聊天機器人被動地以粗體強調短語。

**之前：**
> It blends **OKRs (Objectives and Key Results)**, **KPIs (Key Performance Indicators)**, and visual strategy tools such as the **Business Model Canvas (BMC)** and **Balanced Scorecard (BSC)**.

**之後：**
> It blends OKRs, KPIs, and visual strategy tools like the Business Model Canvas and Balanced Scorecard.


### 16. 行內標頭垂直清單

**問題：** AI 輸出以粗體標頭後接冒號開頭的清單項目。

**之前：**
> - **User Experience:** The user experience has been significantly improved with a new interface.
> - **Performance:** Performance has been enhanced through optimized algorithms.
> - **Security:** Security has been strengthened with end-to-end encryption.

**之後：**
> The update improves the interface, speeds up load times through optimized algorithms, and adds end-to-end encryption.


### 17. 標題中的 Title Case

**問題：** AI 聊天機器人讓標題中所有主要單詞都大寫。

**之前：**
> ## Strategic Negotiations And Global Partnerships

**之後：**
> ## Strategic negotiations and global partnerships


### 18. Emoji

**問題：** AI 聊天機器人常在標題或項目符號上裝飾 emoji。

**之前：**
> 🚀 **Launch Phase:** The product launches in Q3
> 💡 **Key Insight:** Users prefer simplicity
> ✅ **Next Steps:** Schedule follow-up meeting

**之後：**
> The product launches in Q3. User research showed a preference for simplicity. Next step: schedule a follow-up meeting.


### 19. 彎引號

**問題：** ChatGPT 使用彎引號（「...」）而不是直引號（"..."）。

**之前：**
> He said "the project is on track" but others disagreed.

**之後：**
> He said "the project is on track" but others disagreed.


## 溝通模式

### 20. 協作式溝通產物

**要留意的詞：** I hope this helps, Of course!, Certainly!, You're absolutely right!, Would you like..., let me know, here is a...

**問題：** 原本用於聊天機器人來往的文字被當成內容貼上。

**之前：**
> Here is an overview of the French Revolution. I hope this helps! Let me know if you'd like me to expand on any section.

**之後：**
> The French Revolution began in 1789 when financial crisis and food shortages led to widespread unrest.


### 21. 知識截止聲明

**要留意的詞：** as of [date], Up to my last training update, While specific details are limited/scarce..., based on available information...

**問題：** AI 關於資訊不完整的免責聲明被留在文字裡。

**之前：**
> While specific details about the company's founding are not extensively documented in readily available sources, it appears to have been established sometime in the 1990s.

**之後：**
> The company was founded in 1994, according to its registration documents.


### 22. 諂媚／討好語氣

**問題：** 過度正面、討好人的語言。

**之前：**
> Great question! You're absolutely right that this is a complex topic. That's an excellent point about the economic factors.

**之後：**
> The economic factors you mentioned are relevant here.


## 填充與躊躇語

### 23. 填充短語

**之前 → 之後：**
- "In order to achieve this goal" → "To achieve this"
- "Due to the fact that it was raining" → "Because it was raining"
- "At this point in time" → "Now"
- "In the event that you need help" → "If you need help"
- "The system has the ability to process" → "The system can process"
- "It is important to note that the data shows" → "The data shows"


### 24. 過度躊躇

**問題：** 過度限定的陳述。

**之前：**
> It could potentially possibly be argued that the policy might have some effect on outcomes.

**之後：**
> The policy may affect outcomes.


### 25. 空泛正面的結尾

**問題：** 含糊的振奮式結尾。

**之前：**
> The future looks bright for the company. Exciting times lie ahead as they continue their journey toward excellence. This represents a major step in the right direction.

**之後：**
> The company plans to open two more locations next year.


### 26. 連字號複合詞過度使用

**要留意的詞：** third-party, cross-functional, client-facing, data-driven, decision-making, well-known, high-quality, real-time, long-term, end-to-end

**問題：** AI 以完美的規律性為常見複合詞加上連字號。人類很少一致地加，而就算加了也不一致。較不常見或技術性的複合修飾語加連字號沒問題。

**之前：**
> The cross-functional team delivered a high-quality, data-driven report on our client-facing tools. Their decision-making process was well-known for being thorough and detail-oriented.

**之後：**
> The cross functional team delivered a high quality, data driven report on our client facing tools. Their decision making process was known for being thorough and detail oriented.


### 27. 說服性權威套話

**要留意的短語：** The real question is, at its core, in reality, what really matters, fundamentally, the deeper issue, the heart of the matter

**問題：** LLM 用這些短語假裝自己穿透雜訊直指某種更深層的真相，而那句話後面往往只是用更多儀式重述一個普通論點。

**之前：**
> The real question is whether teams can adapt. At its core, what really matters is organizational readiness.

**之後：**
> The question is whether teams can adapt. That mostly depends on whether the organization is ready to change its habits.


### 28. 預告與宣告

**要留意的短語：** Let's dive in, let's explore, let's break this down, here's what you need to know, now let's look at, without further ado

**問題：** LLM 會宣告自己要去做什麼，然後才去做。這種後設評論拖慢寫作，給人一種教學腳本的感覺。

**之前：**
> Let's dive into how caching works in Next.js. Here's what you need to know.

**之後：**
> Next.js caches data at multiple layers, including request memoization, the data cache, and the router cache.


### 29. 碎片化標頭

**要留意的徵兆：** 一個標題後面接著一段只有一行、只是重述標題的段落，然後才進入真正的內容。

**問題：** LLM 常在標題後加一句泛泛的暖身句子。它通常什麼都沒加，還讓散文感覺像在灌水。

**之前：**
> ## Performance
>
> Speed matters.
>
> When users hit a slow page, they leave.

**之後：**
> ## Performance
>
> When users hit a slow page, they leave.


## 風格、節奏與修辭模式

### 30. 強硬隱喻與比喻過度書寫

**要留意的徵兆：** 原創但牽強的隱喻、混合隱喻、以比喻替換本可更清楚的樸實詞語、用後立刻解釋的隱喻

**問題：** 除了模式 4 與 7 標出的常見比喻詞語，LLM 還會發明裝飾性隱喻，只添加意象不加意義，而且隨後常解釋它們。樸實描述通常更清楚也更誠實。若隱喻贏不到位置，就砍掉它、說直白的話。

**之前：**
> The codebase is a garden we must tend, pruning dead branches and planting seeds of innovation so the whole ecosystem can flourish. In other words, delete unused code and add features.

**之後：**
> Delete unused code and add the features users are asking for.


### 31. 戲劇性碎片與強力結句

**要留意的徵兆：** 用來製造戲劇感的兩三個字、無主詞句子，斷奏的「X. And Y. And Z.」串，每段或每節結尾的一句短引用式句子，可愛的同位語碎片（「the catalog, honestly priced」）

**問題：** LLM 把句子切成碎片製造虛假強調，並用一句適合引用的「霸氣收尾」結束每節。讀起來像廣告文案或勵志海報。若某句聽起來該放上海報，就砍掉它，或把它摺回有主詞的真實句子。這與模式 13 不同（那是關於文法的被動語態）；這裡的特徵是節奏與表演欲，不是隱藏的主體。

**之前：**
> The catalog, honestly priced. Pay for what it does. Not promises. It just works. Every time.

**之後：**
> The catalog is priced by usage, so you pay for the calls you actually make rather than a flat monthly fee.


### 32. 立刻自答的修辭性問題

**要留意的徵兆：**「What if...?」、「The question is...」、「Ever wondered...?」、一個問題緊接著自己的答案、「Think about it.」

**問題：** LLM 提問只是為了在一拍之後自答。問題沒有增加資訊，還拖住了句子。直接陳述重點。

**之前：**
> What makes an API good? It comes down to predictability. Think about it: developers want to know exactly what they will get back.

**之後：**
> A good API is predictable, so developers know exactly what they will get back.


### 33. 句首口頭禪

**要留意的詞：** So..., Look,, 慣用句首的 And/But、「I think」/「I believe」搭配事實陳述、副詞開頭（Interestingly, Importantly, Notably, Crucially, Essentially, Ultimately）

**問題：** LLM 依賴一組少數的開頭。副詞開頭告訴讀者該怎麼感受，而不是自己去贏得它；「So」或「Look」則假造對話的溫暖。拿掉開頭，直接進入實質內容。

**之前：**
> So, the results were mixed. Interestingly, adoption went up. Importantly, churn went up too. I think that means the feature still needs work.

**之後：**
> The results were mixed: adoption rose, but churn rose alongside it, so the feature still needs work.


### 34. 安撫式結句

**要留意的徵兆：** And that's okay., And that's fine., There's nothing wrong with that., no shame in..., you're not alone, it's completely normal

**問題：** LLM 會綴上讀者沒要求的安撫。它軟化文章，並假設讀者需要被安慰。信任讀者：把重點講完就停。

**之前：**
> You might not have a testing setup yet. And that's okay. Plenty of teams start without one, and there's nothing wrong with that.

**之後：**
> Many teams start without a testing setup and add one once regressions begin costing real time.

---

## 流程

1. 仔細閱讀輸入文字（若是檔案，用 `read_file`）。
2. 辨識上述所有模式的實例。
3. 改寫每個問題章節。
4. 確保改寫後文字：
   - 朗讀起來自然
   - 自然地變化句子結構
   - 用具體細節勝過空泛主張
   - 維持適合情境的語調
   - 在合適處使用簡單結構（is/are/has）
5. 提出人性化草稿版本。
6. 自我質問：「下面這段哪裡明顯是 AI 生成的？」
7. 簡短回答還留下的特徵（如果有的話）。
8. 自我質問：「現在，讓它不再明顯是 AI 生成的。」
9. 提出最終版本（審查後修訂的）。
10. 若文字來自檔案，用 `patch`（針對性）或 `write_file`（整份改寫）套用編輯，並向使用者展示改動內容。

## 輸出格式

提供：
1. 草稿改寫
2. 「下面這段哪裡明顯是 AI 生成的？」（簡短條列）
3. 最終改寫
4. 改動摘要（選用，若有用）


## 完整範例

**之前（聽起來像 AI）：**
> Great question! Here is an essay on this topic. I hope this helps!
>
> AI-assisted coding serves as an enduring testament to the transformative potential of large language models, marking a pivotal moment in the evolution of software development. In today's rapidly evolving technological landscape, these groundbreaking tools—nestled at the intersection of research and practice—are reshaping how engineers ideate, iterate, and deliver, underscoring their vital role in modern workflows.
>
> At its core, the value proposition is clear: streamlining processes, enhancing collaboration, and fostering alignment. It's not just about autocomplete; it's about unlocking creativity at scale, ensuring that organizations can remain agile while delivering seamless, intuitive, and powerful experiences to users. The tool serves as a catalyst. The assistant functions as a partner. The system stands as a foundation for innovation.
>
> Industry observers have noted that adoption has accelerated from hobbyist experiments to enterprise-wide rollouts, from solo developers to cross-functional teams. The technology has been featured in The New York Times, Wired, and The Verge. Additionally, the ability to generate documentation, tests, and refactors showcases how AI can contribute to better outcomes, highlighting the intricate interplay between automation and human judgment.
>
> - 💡 **Speed:** Code generation is significantly faster, reducing friction and empowering developers.
> - 🚀 **Quality:** Output quality has been enhanced through improved training, contributing to higher standards.
> - ✅ **Adoption:** Usage continues to grow, reflecting broader industry trends.
>
> While specific details are limited based on available information, it could potentially be argued that these tools might have some positive effect. Despite challenges typical of emerging technologies—including hallucinations, bias, and accountability—the ecosystem continues to thrive. In order to fully realize this potential, teams must align with best practices.
>
> In conclusion, the future looks bright. Exciting times lie ahead as we continue this journey toward excellence. Let me know if you'd like me to expand on any section!

**草稿改寫：**
> AI coding assistants speed up some tasks. In a 2024 study by Google, developers using Codex completed simple functions 55% faster than a control group, but showed no improvement on debugging or architectural decisions.
>
> The tools are good at boilerplate: config files, test scaffolding, repetitive refactors. They are bad at knowing when they are wrong. I have mass-accepted suggestions that compiled, passed lint, and still did the wrong thing because I stopped paying attention.
>
> Mira, an engineer at a fintech startup I interviewed, said she uses Copilot "like autocomplete for boring code" but reviews every line before committing. Jake, a senior dev at a larger company, disabled it after it kept suggesting patterns from a deprecated internal library.
>
> The productivity claims are hard to verify. GitHub says Copilot users "accept 30% of suggestions," but acceptance is not correctness, and correctness is not value. The 2024 Uplevel study found no statistically significant difference in pull-request throughput between teams with and without AI assistants.
>
> None of this means the tools are useless. It means they are tools. They do not replace judgment, and they do not eliminate the need for tests. If you do not have tests, you cannot tell whether the suggestion is right.

**下面這段哪裡明顯是 AI 生成的？**
- 節奏還是太工整（乾淨的對比、等速推進的段落）。
- 點名的人與引用研究，除非是真實且有來源，否則讀起來像「可信但杜撰」的佔位符。
- 收尾句有點像口號（「If you do not have tests...」），不像一個人在說話。

**現在，讓它不再明顯是 AI 生成的。**
> AI coding assistants can make you faster at the boring parts. Not everything. Definitely not architecture.
>
> They're great at boilerplate: config files, test scaffolding, repetitive refactors. They're also great at sounding right while being wrong. I've accepted suggestions that compiled, passed lint, and still missed the point because I stopped paying attention.
>
> People I talk to tend to land in two camps. Some use it like autocomplete for chores and review every line. Others disable it after it keeps suggesting patterns they don't want. Both feel reasonable.
>
> The productivity metrics are slippery. GitHub can say Copilot users "accept 30% of suggestions," but acceptance isn't correctness, and correctness isn't value. If you don't have tests, you're basically guessing.

**改動內容：**
- 移除聊天機器人產物（「Great question!」、「I hope this helps!」、「Let me know if...」）
- 移除重要性膨脹（「testament」、「pivotal moment」、「evolving landscape」、「vital role」）
- 移除促銷語言（「groundbreaking」、「nestled」、「seamless, intuitive, and powerful」）
- 移除模糊歸因（「Industry observers」）
- 移除膚淺的 -ing 短語（「underscoring」、「highlighting」、「reflecting」、「contributing to」）
- 移除否定平行（「It's not just X; it's Y」）
- 移除三連句模式與同義詞輪換（「catalyst/partner/foundation」）
- 移除虛假範圍（「from X to Y, from A to B」）
- 移除破折號、emoji、粗體標頭與彎引號
- 移除以「is」／「are」取代系動詞迴避（「serves as」、「functions as」、「stands as」）
- 移除公式化挑戰章節（「Despite challenges... continues to thrive」）
- 移除知識截止躊躇（「While specific details are limited...」）
- 移除過度躊躇（「could potentially be argued that... might have some」）
- 移除填充短語與說服性框架（「In order to」、「At its core」）
- 移除空泛正面的結尾（「the future looks bright」、「exciting times lie ahead」）
- 讓語氣更個人、更少「組裝感」（變化節奏、更少佔位符）


## 出處

本技能移植自 [blader/humanizer](https://github.com/blader/humanizer)（MIT 授權），其本身以 [Wikipedia: Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) 為基礎，由 WikiProject AI Cleanup 維護。文件中的模式來自對維基百科上數千份 AI 生成文字實例的觀察。

原作者：Siqi Chen（[@blader](https://github.com/blader)）。原始 repo：https://github.com/blader/humanizer（2.5.1 版）。移植至 Hermes Agent 時加入 Hermes 原生工具參考（`read_file`、`patch`、`write_file`）與載入本技能的時機指引。原始 29 種模式來自上游來源，前後對照範例（含完整演練範例）原樣保留作為示範。模式 30-34 與加進模式 7 的「行銷與部落格陳腔濫調」清單是 Hermes 新增，不屬於上游來源。本技能自身的說明散文也做了輕量編輯，以遵循自身建議（例如移除敘事中的破折號與否定平行），讓技能成為它要求的那種寫作的示範。原始 MIT 授權保留在本 `SKILL.md` 旁的 `LICENSE` 檔案中。

來自維基百科的關鍵洞見：「LLM 使用統計演算法猜測下一個該出現什麼。結果傾向於適用最廣泛情境、最有統計可能性的結果。」
