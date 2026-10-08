# 《靠岸之前》｜Cove 彩蛋短篇页面设计

状态：v2 三值守者版（同日第二稿：三个视角由海湾意象升格为站点三位值守者——温晚安、许朝夕、沈予舟；用户已定三分叉：船靠岸收束、人物以远景身影入画、保留标题）。替代《潮汐之间》小游戏方向。**美术与装配（2026-10-07）**：六幅正式场景画已生成并装入页面，人物以站内立绘为参考，统一沿用封面画风；Astro 构建期输出响应式 AVIF/WebP。手机完整展示横幅，避免裁掉人物和灯塔。**短篇集化（IMPL-083，2026-10-08）**：`/story/` 为短篇集首页（书架），本篇移至 `/story/before-landing/`；页面级 noindex 已移除（IMPL-084，2026-10-08），非 main 分支构建仍由响应头兜底。日期：2026-10-06（v2）；2026-10-07（美术版、生图装配）；2026-10-08（短篇集化）。

**页面文案第二稿（2026-10-07）**：实际页面以 `src/pages/story/before-landing/index.astro` 为准（短篇集首页为 `src/pages/story/index.astro`，IMPL-083）。三幕以三位值守者姓名标出视角；第二幕先埋本子上的圈，读者翻开后才揭示礁脊与浪的作用；尾声回到三人的具体行动。减少动态效果时夜景保留已绘好的灯光并隐藏无反馈的重播按钮。第 8 节保留最初剧本，供追溯叙事取舍。

## 1. 定位与承诺

这是藏在首页插画中的**可翻阅的插画短篇**，读完约 90–150 秒。三个视角属于站点的三位值守者——**沈予舟**（船坞管理员，符号是未完成的小船）、**许朝夕**（沿岸记录员，符号是贝壳与潮汐）、**温晚安**（灯塔值守人，符号是灯塔；档案见 `src/content/authors/`）。海湾意象（小船、浪、灯塔）是三人符号的延伸。读者先随予舟的船误读一件事，再从朝夕的本子与晚安的灯里看见它的另一面。页面有可触发的动作，但没有通关、积分和收集任务。结尾回到阅读。

一句话故事：**黄昏，予舟造了很久的船第一次朝灯塔开，造船的人没跟到岸边；朝夕早已在退潮前记下礁脊的位置，晚安照着她钉在塔门的那一页，把光落在湾口外侧的门上。三条互不知情的小事，在同一夜合成一艘船的平安。** 三者没有对白，性格由动作与各自的文字风格表达。尾页清晨，船靠岸：造它的人没有急着画新的图，记录的人写下下一次的潮时，守灯的人睡了——完成不是告别，因为下一次已被照亮。这同时是站点的自况：项目、笔记、文章各做各的小事，读者是那艘被护送的船。

页面的目标是让人记住 Cove 的一则故事，而非制造一个离开博客后才成立的游戏。主 CTA 只有「继续阅读」，链接由编辑指定一篇真实、已发布且与主题相合的文章或笔记。没有合适内容时不勉强放链接。

## 2. 页面编排

采用自然纵向滚动的单页，分为封面、三幕和尾页。桌面端一侧为大型画面，另一侧为每幕 40–80 字的旁白；手机端图文交替，不把桌面横画幅硬缩成邮票。滚动即阅读方式，不设幕间翻页控件（IMPL-079）。页面不自动播放，也不劫持滚轮。

| 镜头 | 画面和叙事任务 | 读者动作 |
| --- | --- | --- |
| 0 封面 | 海湾全景；左岸船坞的窗刚亮起暖黄的灯；标题「靠岸之前」 | 点「翻开故事」 |
| 1 出坞（幕一 · 予舟） | 坞门开，船第一次朝灯塔去；窗口挽袖的身影没有跟出来。读者与日志一样不知道海面发生了什么 | 读画面下方的日志补记小字：「它右满舵避了一道浪。原因不明。」 |
| 2 浪推船（幕二 · 朝夕） | 同一岸线，浪弧横在船头；远处滩上散步的身影停住，翻开小本子 | 继续翻页 |
| 3 本子那一页（幕二反转） | 俯视摊开的贝壳色小本子：同一片海湾的铅笔速写，礁脊画了圈，写着退潮时刻 | 「翻开本子那一页」→ 速写与岸线叠合，礁位对上 |
| 4 塔上（幕三 · 晚安） | 灯室墙上钉着朝夕的那一页纸，纸角一枚贝壳 | 点「点亮灯室」按钮 |
| 5 光照安全入口 | 光束穿过雾，只扫一次，停在湾口外侧的弧形水道；塔窗里小小的身影 | 静帧可再看，翻页 |
| 6 清晨靠岸（尾声） | 船靠上木栈桥；予舟去系缆、朝夕写下一次潮时、塔门槛上多了一枚贝壳 | 「继续阅读」主按钮与「再读一次」链接 |

叙事转折发生在镜头 3：本子那一页不是新信息从天而降，而是读者认出速写画的正是第 1–2 镜头的那片岸线——误读由此解开。镜头 4–5 解决空间方向，镜头 6 提供情绪停顿并把「完成＝告别」的矛盾当场解开。三位值守者以远景身影入画：发色、外套、工装与标志色须与既有立绘可对认。最终文案不先定一句励志口号；先完成分镜，再让文字准确描述画面没有说完的部分。

## 3. 视觉方案：绘本级编辑插画

> **实施注记（IMPL-077）**：~~正式美术以站内内嵌 SVG 矢量插画落地~~——矢量稿完成 QA 后被用户否决（线条感过重，不达绘本级）；最终按第 9 节管线改为**用户外部生图（同一水彩风格、六幅 ≥1600×1000），站内 astro:assets 装配**，图见 `src/assets/story/`。保留矢量阶段的两条资产：值守者特征表（发色、外套、裙装、工装，进生图参考图）与竖裁安全区构图纪律（生图提示词 §9.3 内沿用）。

**画法**：成人向编辑插画，层叠的水粉和透明水彩、细纸纹、局部干笔触。保留现有品牌插画的船形、塔形、蓝粉双浪和留白比例，让它们从简化符号长成同一世界中的形象。线条不再承担整幅画面的质感；光、雾、海水的层次与材料触感负责情绪。避免写实照片拼贴、通用扁平矢量、儿童绘本大眼睛、暗黑奇幻海岸。

色彩从雾白与灰蓝起步，三位值守者各管画面的一层：**暖灯黄 `#e9b44c`**（温晚安）只用于光束、灯室与船坞的窗；**贝壳粉 `#dea0af`**（许朝夕）落在浪尖、本子与她的身影；**船木棕 `#8b5e3c` 与铁锈橙 `#c4652f`**（沈予舟）落在坞屋、栈桥与船身点缀。第三幕压低明度，尾页回到晨光。正文区域保留足够浅、安静的留白。深色主题需要独立调色的画面，不能仅用 CSS filter 反色。

[第一版夜景样张](COVE-STORY-ART-STUDY.png)证明光和海面可以更丰富，但礁石较重、主角过于写实；[第二版校准样张](COVE-STORY-ART-STUDY-v2.png)更接近 Cove 的明亮与蓝粉波线。两者均是**气氛测试，不是待发布素材**：目前没有稳定的角色造型、分层文件、竖屏构图和清晰的暗礁叙事。正式制作须重新绘制角色设定和完整分镜。

### 美术交付清单

1. 一页角色设定：小船正侧面与受浪转向姿态、灯塔日夜两态、双浪的形状语法和相互尺度；三位值守者的远景身影设定（以既有立绘为基准的剪影、比例与标志色，档案与立绘见 `src/content/authors/` 与 `src/assets/characters/`）；海湾意象一律不画脸，人物身影不放大到近景。
2. 七张关键画面：封面、船出坞、浪推船、本子那一页、塔上远景、光照安全入口、清晨靠岸。每张先做黑白明度稿，再做彩稿。
3. 每张画面拆为远景／中景／主体／前景／雾／光六类图层；同一角色使用主文件绘制，不能每张用独立 AI 结果直接拼合。
4. 桌面宽画幅与 375px 竖屏构图各一套；手机保留主体和叙事线索，允许另裁画面，不允许缩小文字。
5. 每幕一张完整静态图作为无动画与加载失败时的画面；动画只增强镜头，不承载独有信息。

## 4. 素材来源与使用边界

主角与关键镜头采用**以现有 Cove 品牌资产为原型的定制创作**。AI 生成用于气氛草图和局部方案探索；正式画面要经过角色统一、结构修正、分层重绘与逐幕审稿。直接抓取网上的船、灯塔、海浪插画并排在一起，无法保证镜头连续性，也可能混入不兼容的授权。

| 素材 | 已筛选的来源 | 用途与处理 |
| --- | --- | --- |
| 品牌形象 | 本仓库 `src/assets/brand/cove-support-illustration.jpg` | 船、塔、浪的造型基准；不直接放大为故事画面 |
| 海雾、礁岸光线参考 | [Miguel A Amutio 的海雾灯塔照片](https://unsplash.com/photos/misty-coastal-cliffs-with-a-distant-lighthouse-WCu6omRLGKc)、[海上雾与天际线照片](https://unsplash.com/photos/ocean-horizon-with-rolling-fog-and-blue-sky-VWPQL5cCEKQ) | 只用于光线、尺度、色温参考；正式页面不嵌入照片。Unsplash 的现行许可允许商业使用和修改，但仍记录作者与来源 |
| 海浪环境音候选 | [Andrew Holman 的 Gentle Waves](https://freesound.org/people/amholma/sounds/376795/) | 页面标注为 CC0；制作时裁取极短片段、压缩、自托管，仅在用户开启声音后加载。最终仍逐项保存来源与许可快照 |
| 纸纹 | 自制扫描或程序生成的低对比颗粒 | 避免为一层底纹引入与画面不合的现成纹理；不依赖远程资源 |

Unsplash [许可](https://unsplash.com/license)允许免费商业使用与修改；Freesound [许可说明](https://freesound.org/help/faq/)指出不同音源可能分别为 CC0、署名或非商业，须检查**具体音源页面**。不批量抓站、不从搜索结果页直接复制未核实授权的图片。外部素材如进入正式站点，保存原始链接、作者、许可、获取日期和加工记录，并转换为本站本地文件；运行时不热链，符合当前 `img-src 'self' data:`。

## 5. 动效与技术

> **修订（IMPL-077，2026-10-07）**：原稿「没有持续波浪循环」一条，随用户「加足够的动效」的要求放宽为下述三层语法；其余底线（动效不承载独有信息、reduced-motion 下完整静态成立、无 JS 完整阅读序、不劫持滚动）不变。
> **再修订（IMPL-081，生图装配版）**：画面改为静态生图后，第 2 层「环境循环」（依赖 SVG 图层的纯 CSS 动画）随之移除，动效收敛为两层——入场与主动作反馈；入场由纵向浮现改为**侧面渐入·平行移入**（画面与旁白均自所在一侧水平滑入——画面 64px、旁白 48px、居中段 32px，`--sn-x` 控制方向与距离、`--sn` 保留错峰；中途试过「文字上浮 8px」的折中，因位移不可感知、观感等同直接出现而被否决，IMPL-082）。底线不变。

动效按两层语法组织，服务于视角转换而不是替代阅读：

1. **入场编排（一次性）**：各元素按序号错峰、自所在一侧渐入（标题→画面→旁白），由 IntersectionObserver 触发，只播一次，之后是可阅读的静帧。
2. **主动作反馈**：两处（IMPL-079 收敛）——翻开朝夕的本子那一页（画面对翻页转场）；灯室的灯光回响（光已绘在画里，点按后自灯位起沿光路轻微漂移一次，1.8s）。日志补记为画面下方静态小字，不设交互。

声音默认关闭，也不参与叙事判定；不使用粒子与跟随指针的视差。

实现上使用 Astro 静态路由：`/story/` 为短篇集首页（书架），各短篇为独立手工页面 `/story/<slug>/`，本篇位于 `/story/before-landing/`（IMPL-083）；故事文案为可选择和朗读的 HTML。六幅画面为**生图装配**（第 9 节管线：`astro:assets` 构建期输出 AVIF/WebP 响应式尺寸；镜头 2、3 合为第二幕双画面叠合，镜头 4、5 合为第三幕单画面加光晕回响层）。小屏不另切图，画面完整显示横幅构图。`prefers-reduced-motion` 下动效整体冻结仍可完整读完；全局 CSS 的减少动效规则之外，脚本驱动的入场由 `.no-js` 兜底关闭。

首页整张品牌卡成为指向短篇集的带可访问名称链接。页面不加入常驻导航抢入口（页脚入口已随 IMPL-083 移除）；发现路径为三处内容内链——三位值守者档案收束行、`/posts/hello-cove/` 文末回链、404 深夜彩蛋联动，特指落具体短篇、泛指落书架。从文章阅读返回时不自动弹出故事。无 JS 时照样呈现完整图文顺序。制作完成后检查手机 320／375px、桌面、浅深色、触屏、键盘、读屏和低速网络。

## 6. 制作流程与质量门槛

1. **剧本**：先完成约 300–450 字的三视角短篇和七镜头脚本；删掉画面已表达的解释句。
2. **分镜**：黑白明度稿先验收叙事。请 3–5 位未听过设定的人只看静态分镜，确认他们能理解第 2 幕的反转。看不懂就改镜头，不用旁白补洞。
3. **角色统一**：完成三形象的造型表，制作第一幕和第二幕的跨镜头一致性测试；船的比例、塔的轮廓、浪的蓝粉曲率保持稳定。
4. **精绘与分层**：完成七幅正式画面、手机重构、深色调色和静态回退。每张画作检查焦点、留白、文字安全区及上一幕到下一幕的视线方向。
5. **网页装配**：先把静态故事做成优质可读的页面，再加入三处主动作、音效和轻量过渡。
6. **验收**：不看说明的新读者能复述误读与反转；静音、减少动态效果、无 JS 和慢网下故事仍成立；`pnpm check`、`pnpm build` 通过，浏览器中无 CSP 错误。

设计签收标准不是「看上去像 AI 做的精美小页面」，而是**角色在七个镜头中始终是同一组角色，画面本身讲清了故事，网页操作没有挡住阅读**。前两阶段达不到这一点，不进入全量美术制作。

## 7. 与旧方案的关系

`COVE-TIDES-EXPERIENCE-DESIGN.md` 和对应扉页 SVG/PNG 保留作已讨论过的探索稿；其三章游戏、进度和合景玩法不进入本方案。正式实施以本文件为设计依据，旧稿不应作为开发任务清单。

### 样张生成记录

两张气氛样张由内置 imagegen 工具生成，以本仓库原品牌插画为图像参考；第二张另参考第一张的光雾层次。提示词核心：成人向编辑绘本、水粉与透明水彩、船左塔右、蓝粉双浪、黄昏海雾、宽画幅和文字留白；避免照片写实、厚重暗礁、儿童化表情、文字和界面。两张均为新生成的风格探索，没有使用从第三方网站抓取的图片作为生成输入。

第一版完整提示词：

> Use case: illustration-story. Asset type: visual direction sample for a premium interactive literary short story on the Cove blog. Edit the supplied brand illustration as the identity reference: retain its three recognizable motifs and relative composition—a small white sailboat toward the left, a sheltered lighthouse toward the right, and two flowing blue and shell-pink wave gestures. Transform the sparse logo artwork into one cinematic, full-bleed illustrated scene at blue-hour dusk. The small boat has just been guided away from a shallow hidden reef; a warm, restrained lighthouse beam reveals the safer cove. Art direction: mature editorial picture-book illustration, layered hand-painted gouache and translucent watercolor washes over subtly textured paper, rich atmospheric depth, elegant shapes and painterly edges, sophisticated light and shadow, original artwork with deliberate composition, visually polished to a commercial art-director standard. Keep a calm expansive sea, generous negative space for HTML story text, muted fog blue, slate, ivory, and restrained shell pink. The boat and lighthouse should remain unmistakably related to the reference, with greater depth, richer silhouettes, and much more beautiful rendering. No lettering, no logo, no card border, no interface, no photorealism, no children's-book cuteness, no neon, no generic stock illustration, no watermark.

第二版完整提示词：

> Use case: illustration-story. Asset type: refined visual direction sample for the Cove blog's interactive short story. Image 1 is the brand identity reference and MUST govern the shapes and colors of the three motifs. Image 2 is the atmospheric painting study to refine, especially its layered mist and lighthouse light. Create a new scene in the same wide composition: small simple WHITE sailboat left, slender blue-gray lighthouse right with a small soft shell-pink cap, and TWO clearly recognizable broad wave gestures across the foreground, one misty blue and one pale shell pink. Keep the subtle sheltered-bay outline from Image 1. The sea has carried the boat away from an unseen reef at dusk while the lighthouse reveals a safe inlet. Make this brighter and airier than Image 2: muted cream sky, pale fog blue water, restrained coral-pink dusk, much larger quiet negative space. Art style: premium hand-painted editorial storybook for adults, gouache plus translucent watercolor wash on fine paper, sophisticated but deliberately simplified shapes, nuanced atmospheric depth, painterly details only around the beam and water. The character designs must look like elegant, expanded versions of Image 1 rather than realistic replacements. No text, no logo, no card border, no interface, no photorealism, no rugged dark cliffs dominating the frame, no neon, no childish faces, no watermark.

## 8. 剧本与镜头脚本（制作产物 · A 稿 v2）

按第 6 节流程第 1 步产出；v2 随三值守者改道重写，用户已定三分叉（船靠岸收束、远景身影入画、保留标题）。体裁约定：三个视角各是一份**被写下的文字**——予舟的日志、朝夕的本子、晚安的灯室——旁白叙述不使角色开口；各档案的标志句每人至多回响一次。三段短文合计约 460 字，页面文案由它蒸馏，随分镜验收修订。日期：2026-10-06。

### 8.1 三值守者短篇

**沈予舟的日志**
下水测试，第三夜。风从湾外来，合适。船离开坞门的时候比往常稳，朝灯塔去了。我没有跟到岸边——坞里还有一张画了一半的图。图上是一艘新船，龙骨线只描了一半。日志补记：它右满舵避了一道浪。原因不明。

**许朝夕的本子**
傍晚退潮，滩头的礁石一列一列露出脊背。我早就记下了：位置、潮时，还有画圈的滩。浪每天都不一样，可惜大多数人只看一次。船看不见水下的黑石头，浪没法说话，我的本子可以。那一页撕下来，压在塔门的门缝里。

**温晚安的灯室**
墙上钉着一页纸：退潮的时刻，画圈的滩，湾口外侧可走。每一步都清楚。我把光压得很低，让它贴着水面走，避开那个圈，落在弧形水道上。船、浪和本子都不在我这里，但今晚他们做的是同一件事。灯塔不催促任何船，它只是亮着。

**清晨**
船靠岸了。造它的人沿着栈桥走过去，手里没有拿新的图纸，拿的是缆绳。记录的人写下一次的潮时，把一枚新捡的贝壳放在塔的门槛上。守灯的人睡了。靠岸之前的那一夜，三条互不知情的小路，原来是同一条水路。

### 8.2 七镜头脚本

| # | 镜头 | 画面要点 | 页面旁白（A 稿） | 读者动作与反馈 |
| --- | --- | --- | --- | --- |
| 0 | 封面 | 黄昏海湾全景；左岸船坞的窗刚亮起暖灯；标题「靠岸之前」 | 一个海湾，三位值守者，最后一夜的水路。约两分钟。 | 点「翻开故事」进入第一幕 |
| 1 | 出坞 | 坞门开，船第一次朝灯塔去；窗口挽袖的身影没有跟出来 | 下水测试，第三夜。风从湾外来，合适。船朝灯塔去了。造它的人没有跟到岸边——坞里还有一张画了一半的图。 | 触船，浮现日志补记：「它右满舵避了一道浪。原因不明。」 |
| 2 | 浪推船 | 同岸线，浪弧横在船头；远处滩上散步的身影停住，翻开小本子 | 傍晚退潮。浪把船往外送。岸上有人停下来，翻开了小本子。 | 继续翻页 |
| 3 | 本子那一页 | 俯视摊开的贝壳色小本子：同一片海湾的铅笔速写，礁脊画了圈，写着退潮时刻 | 她记过：这片滩，退潮会露出脊背。浪不是在拦船，是在把船从礁上抬过去。 | 「翻开本子那一页」→ 速写与岸线叠合，礁位对上；「合上本子」返回 |
| 4 | 塔上 | 灯室墙上钉着一页潮汐记录，纸角一枚贝壳 | 灯室的墙上钉着一页纸：退潮的时刻，画圈的滩，湾口外侧可走。每一步都清楚。 | 点灯室，光束只扫过一次，随后停在弧形水道入口 |
| 5 | 光照安全入口 | 光束穿过雾落在湾口外侧弧形水道；塔窗里小小的身影 | 灯塔不催促任何船，它只是亮着。船、浪和本子，要很久以后才会明白它们做的是同一件事。 | 静帧可再看，翻页 |
| 6 | 清晨靠岸 | 船靠上木栈桥；予舟拿缆绳走向船，朝夕写下一次的潮时，塔门槛上一枚贝壳 | 清晨，船靠岸了。造它的人没有急着画新的图——手里是缆绳；记录的人写下一次的潮时；守灯的人睡了。 | 「再读一次」「返回首页」「继续阅读」 |

> 页面装配注：镜头 2、3 合为网页第二幕的双画面（基础画面＋本子速写叠合）；镜头 4、5 合为第三幕的单画面两态（光束扫过前／后）。「继续阅读」链接须由编辑指定一篇真实、已发布且主题相合的文章或笔记；暂无合适内容时按第 1 节约定不放链接。

## 9. 美术生成物料（生图提示词与规格 · IMPL-078）

正式画面采用「生图 + 站内装配」管线：本节保留出图物料与交付约定。六张图现已用站内封面和角色立绘作为参考完成生成，放入 `src/assets/story/` 并装配到页面。以下提示词仍供后续单张返工参考。

### 9.1 通用规范（每张都适用）

- **画幅**：16:10 横幅（1600×1000 或更高）。小屏由装配端中心裁切为 5/4，**所有叙事主体收在画面中央约 76% 宽度内**（左右各约 12% 是可裁留边，只放天空、海面、云等环境元素）。
- **画风（style block，拼在每条提示词末尾）**：

  > Mature editorial picture-book illustration for adults, layered gouache and translucent watercolor washes on subtly grained paper, muted fog-blue, ivory and slate palette with restrained shell pink and warm lamplight yellow, broad calm negative space, quiet literary mood, flat matte finish, no gloss.

- **负面清单（同样每张都拼）**：

  > No text, no lettering, no watermark, no logo, no border, no interface; no photorealism, no 3D render, no neon, no children's-book cuteness, no big cute eyes, no dark rugged cliffs dominating the frame.

- **文字一律不进画面**：生成模型的文字必然乱码。本子上的字、标题全部由页面以真实 HTML 叠加（可选、可朗读、无 JS 可读），所以 S3 本子页要在提示词里明确留白、无字。
- **人物一律远景身影，不画脸**：三位值守者只以远景小身影出现，绝无面部特写。
- **主题适配**：图片是固定画作，不随浅深主题反色——夜与晨的时间感画进画面本身；页框与文字照常随主题。

### 9.2 角色与招牌元素一致性表（相关提示词直接引用英文短语）

| 元素 | 一致性描述 |
| --- | --- |
| 小船 | a small sailboat with white hull, single mast, mainsail and small jib, a tiny rust-red pennant at the masthead |
| 灯塔 | a slender blue-gray lighthouse with a pale gallery and a soft shell-pink conical cap |
| 双浪 | two broad flowing wave gestures across the water, one misty blue and one pale shell pink |
| 温晚安 | a tiny distant woman silhouette in the lamp room, long flowing blue-gray hair, never close-up |
| 许朝夕 | a small distant figure of a woman with a brown side ponytail tied with a pink scrunchie, wearing a shell-pink jacket and a long fog-gray skirt |
| 沈予舟 | a small distant figure of a man with messy dark hair, wearing an ivory hoodie under a dark work vest and cargo pants |
| 暖灯黄 | warm lamplight yellow reserved for windows, the lamp room and the light beam only |

### 9.3 六张完整生成词（整段复制即用 · 2026-10-07 修订）

每张已内嵌**同一段**画风与禁止条款——这是六张同族的关键，不要删改；【参考图】随提示词附给生成工具，不进正文。人物场景参考图至多两张（画风基准 1 ＋ 人物立绘 1），参考过多会稀释画风。

**一致性操作建议**：

1. 六张用同一工具、同一模型一次出完；支持 seed 的固定同一 seed。
2. 先出 S0，满意后把 S0 成图也加为画风参考，再出其余五张（级联锚定最有效）。
3. 不满意超过三张时，先改画风段措辞再整批重出；不要把两批产物混用。
4. 三人合照版立绘 `src/assets/characters/cove-keepers-v1.png` 可作单参考位的替代人物参考。

**S0 封面 → `cover`** — 参考图：`docs/COVE-STORY-ART-STUDY-v2.png`（画风基准）＋ `src/assets/brand/cove-support-illustration.jpg`（船/塔/浪造型）

```text
黄昏的静谧海湾全景：左岸一座小木船坞，唯一的窗透出暖黄灯光；画面中偏左，一艘白色船身、单桅、挂主帆与前帆的小帆船静浮在平静水面上，桅顶有一面小小的铁锈红旗；右岸立着一座纤细的蓝灰色灯塔，浅色灯廊、贝壳粉锥形塔顶，灯尚未点亮；两道宽阔的涌浪横过前景，一道雾蓝、一道淡贝壳粉；天上悬着一弯淡月和几缕软云，两只小海鸟掠过，天空留白充分。画风与参考图严格保持一致：成人向绘本届编辑插画，水粉与透明水彩在细纹纸面上层叠，哑光质感；主色调为雾蓝、象牙白、石板灰蓝，以少量贝壳粉与暖灯黄点缀；构图安静，留白充分，有文学感。画面中禁止出现：任何文字、字母、数字、水印、标志、边框、界面元素；照片写实、3D 渲染、霓虹光效、儿童绘本式的可爱风格与大眼睛；占满画面的深色嶙峋礁石。所有叙事主体集中在画面中央约四分之三宽度内，左右两侧只画天空、海面、云等环境。画幅 16:10 横幅。
```

**S1 出坞 → `act1-departure`** — 参考图：`docs/COVE-STORY-ART-STUDY-v2.png`（画风基准）

```text
黄昏的船坞滑道近景：木船坞在画面左缘，唯一的窗亮着暖黄光，窗玻璃后隐约可见一个挽着袖子、低头伏案的男性身影，没有走到窗外；一艘白色船身、挂主帆与前帆的小帆船刚离开滑道，驶向画面右侧远处一座纤细的蓝灰色灯塔；船尾拖着一串渐渐淡去的点状航迹；黄昏天空以雾蓝与象牙白为主；前景是木系缆桩与几丛稀疏的岸草。画风与参考图严格保持一致：成人向绘本届编辑插画，水粉与透明水彩在细纹纸面上层叠，哑光质感；主色调为雾蓝、象牙白、石板灰蓝，以少量贝壳粉与暖灯黄点缀；构图安静，留白充分，有文学感。画面中禁止出现：任何文字、字母、数字、水印、标志、边框、界面元素；照片写实、3D 渲染、霓虹光效、儿童绘本式的可爱风格与大眼睛；占满画面的深色嶙峋礁石。所有叙事主体集中在画面中央约四分之三宽度内，左右两侧只画天空、海面、云等环境。画幅 16:10 横幅。
```

**S2 浪推船 → `act2-waves`** — 参考图：`docs/COVE-STORY-ART-STUDY-v2.png`（画风基准）＋ `src/assets/characters/xu-zhaoxi.png`（左下身影的人物特征）

```text
傍晚退潮的岸线：一艘白色船身、单桅的小帆船正骑在缓缓涌起的浪脊上，一道淡贝壳粉的浪峰在船底卷起、托着船身；画面左下的浅滩上，一个很小的远景身影——扎棕色侧马尾、系粉色发圈、穿贝壳粉外套与雾灰长裙的年轻女子——停住脚步，安静地望着小船；清澈的傍晚海水下，隐约露出几道深色的礁脊；光线安静而克制。人物特征以参考立绘为准，只画远景身影，不画面部特写。画风与参考图严格保持一致：成人向绘本届编辑插画，水粉与透明水彩在细纹纸面上层叠，哑光质感；主色调为雾蓝、象牙白、石板灰蓝，以少量贝壳粉与暖灯黄点缀；构图安静，留白充分，有文学感。画面中禁止出现：任何文字、字母、数字、水印、标志、边框、界面元素；照片写实、3D 渲染、霓虹光效、儿童绘本式的可爱风格与大眼睛；占满画面的深色嶙峋礁石。所有叙事主体集中在画面中央约四分之三宽度内，左右两侧只画天空、海面、云等环境。画幅 16:10 横幅。
```

**S3 本子那一页 → `act2-notebook`** — 参考图：`docs/COVE-STORY-ART-STUDY-v2.png`（画风基准）

```text
俯视一本摊开的野外记录本：暖纸色的内页，贝壳粉的封边，两个金属装订环；页上是一幅松动随意的铅笔速写，画的正是那片海湾——一道水平线、几座小礁丘、其中一座被铅笔线圈起、几组短虚线的潮位记号，笔迹像野外随手记录；页面下面三分之一完全留白；页角压着一枚小小的贝壳。整页绝对不出现任何文字、字母或数字，铅笔痕迹只是图形。画风与参考图严格保持一致：成人向绘本届编辑插画，水粉与透明水彩在细纹纸面上层叠，哑光质感；主色调为雾蓝、象牙白、石板灰蓝，以少量贝壳粉与暖灯黄点缀；构图安静，留白充分，有文学感。画面中禁止出现：任何文字、字母、数字、水印、标志、边框、界面元素；照片写实、3D 渲染、霓虹光效、儿童绘本式的可爱风格与大眼睛；占满画面的深色嶙峋礁石。画幅 16:10 横幅。
```

**S4 灯塔夜 → `act3-beam`** — 参考图：`docs/COVE-STORY-ART-STUDY-v2.png`（画风基准）＋ `src/assets/characters/wen-wanan.png`（灯室身影的人物特征）。**构图要求：灯室右上、光束指向左下**——装配端要在实际灯位锚定扫光叠加层。

```text
深夜的海湾：一座纤细的蓝灰色灯塔立在画面右缘的礁石岬角上，浅色灯廊、贝壳粉锥形塔顶；灯室透出暖黄的光，里面有一个极小的远景女性身影，深蓝灰色的长发柔软垂流；一道柔和的暖黄光束贴着深色平静的海面向左下方低掠，光尾停在湾口外一道弧形浅滩水道上；夜空散着几粒疏星，一层软雾贴着水面；整体是安静的深蓝石板色调，暗部克制、不压抑。构图要求：灯室位于画面右上区域，光束指向左下方。人物特征以参考立绘为准，只画远景身影，不画面部特写。画风与参考图严格保持一致：成人向绘本届编辑插画，水粉与透明水彩在细纹纸面上层叠，哑光质感；构图安静，留白充分，有文学感。画面中禁止出现：任何文字、字母、数字、水印、标志、边框、界面元素；照片写实、3D 渲染、霓虹光效、儿童绘本式的可爱风格与大眼睛；占满画面的深色嶙峋礁石。所有叙事主体集中在画面中央约四分之三宽度内。画幅 16:10 横幅。
```

**S5 清晨靠岸 → `end-morning`** — 参考图：`docs/COVE-STORY-ART-STUDY-v2.png`（画风基准）＋ `src/assets/characters/shen-yuzhou.png`、`src/assets/characters/xu-zhaoxi.png`（两个人物特征；工具限两张参考时舍人物图，文字描述已足够）

```text
清晨的浅光：一艘白色船身的小帆船已经靠在右侧伸入画面的低矮木栈桥旁；栈桥上，一个很小的远景男性身影——深色工装马甲、内衬象牙白连帽衫、深色工装裤——手里拿着一卷缆绳，正走向小船；画面左下的沙滩上，一个扎棕色侧马尾、穿贝壳粉外套与雾灰长裙的小小身影低头在本子上写字；天边低悬一轮柔和的粉白色朝阳，两只海鸟掠过，湿润的沙面泛着微光；右侧远处，那座纤细的蓝灰色灯塔安静地立着。人物特征以参考立绘为准，只画远景身影，不画面部特写。画风与参考图严格保持一致：成人向绘本届编辑插画，水粉与透明水彩在细纹纸面上层叠，哑光质感；主色调为雾蓝、象牙白、石板灰蓝，以少量贝壳粉与暖灯黄点缀；构图安静，留白充分，有文学感。画面中禁止出现：任何文字、字母、数字、水印、标志、边框、界面元素；照片写实、3D 渲染、霓虹光效、儿童绘本式的可爱风格与大眼睛；占满画面的深色嶙峋礁石。所有叙事主体集中在画面中央约四分之三宽度内，左右两侧只画天空、海面、云等环境。画幅 16:10 横幅。
```

### 9.4 交付约定

- **目录与命名**：`src/assets/story/` 下 `cover` / `act1-departure` / `act2-waves` / `act2-notebook` / `act3-beam` / `end-morning`，png 或 jpg，≥1600×1000，越大越好。
- **装配（已完成）**：`astro:assets` 构建响应式 AVIF/WebP；六景均有场景说明。小屏展示完整横幅，保留两岸的人物和灯塔；本子翻页与灯光回响作为渐进增强，核心叙事不依赖动画。无 JS 时两张第二幕画面按顺序呈现；reduced-motion 下动效冻结。加载期以场景底色占位。
- **单张返工**：某张不满意只重出那一张，文件名不变直接覆盖即可。
