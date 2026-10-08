---
title: 用 satori 在构建期生成中文分享图
description: 每篇内容一张品牌分享卡：satori + resvg 的构建期管线、中文渲染的字体陷阱，以及为什么放弃"直接把封面图当 og:image"。
publishedAt: '2026-09-24'
category: tech
tags:
  - satori
  - OG 图片
  - 建站工具
draft: true
lang: zh-CN
---

<!-- 初稿（未发布）：供温晚安改定后翻转 draft -->

分享到社交平台的链接如果没有像样的卡片图，点击率会差一个量级。Cove 现在的每篇文章、笔记、项目和角色档案都有一张统一的 1200×630 品牌卡，在构建期自动生成。这篇文章讲管线与坑。

## 为什么不用封面图直接当 og:image

最初的方案是"有封面用封面，没封面用默认图"。问题是：封面图是为页面排版准备的，比例不定、没有标题文字、没有品牌信息——分享出去就是一张裸图。理想分享卡应该像报纸头版：标题、分类、日期、品牌标识，尺寸统一。

手动做图不可持续（每篇一张，谁来坚持），所以走向构建期生成：**分享卡是内容的派生物，派生物就该在构建链里生产**。

## 管线：satori 渲染 JSX 风格的对象

satori 是 Vercel 出的库：吃一段 JSX 风格的对象描述（不是真 React，就是嵌套对象），吐 SVG；再用 resvg 把 SVG 转成 PNG。两个库都是构建期依赖，不进浏览器。

```js
const svg = await satori(
  {
    type: 'div',
    props: {
      style: { display: 'flex', width: 1200, height: 630, /* 品牌版式 */ },
      children: [/* 徽标行、meta 行、标题、描述、页脚 */],
    },
  },
  { width: 1200, height: 630, fonts },
);
const png = new Resvg(svg, { fitTo: { mode: 'original' } }).render().asPng();
```

数据全部来自内容 frontmatter：标题、描述、分类、日期、作者。每类内容一个版式函数，共享同一套品牌框架——顶部渐变条、徽标与域名、底部署名条。长标题手工截断（CJK 全角字宽好估算），尺寸控制在 50KB 以内。

## 最大的坑：中文字体

第一版跑出来全是"豆腐块"。原因值得记下来：**satori 不做同族字体的逐字回退**。我最初按字体子集加载了几十个同名 `Noto Sans SC` 的 unicode-range 分片，satori 只认其中一个，中文字形全部缺失。

解法朴素得惊人：不用分片，改用单个完整的中文字重文件：

```js
const fonts = [400, 700].map((weight) => ({
  name: 'Noto Sans SC',
  data: readFileSync(`noto-sans-sc-chinese-simplified-${weight}-normal.woff`),
  weight,
  style: 'normal',
}));
```

一个文件约 1.5MB，但这是构建期依赖——只影响安装体积，不影响站点产物。另外两个小坑：satori 只认 TTF/OTF/WOFF，不认 WOFF2；CommonJS 下 `require('satori')` 拿到的是模块对象，要取 `.default`。

## 接线：确定性的路径约定

页面引用的图片路径是确定性的：`/og/posts/<id>.png`、`/og/notes/<id>.png`、`/og/projects/<id>.png`、`/og/character/<key>.png`。构建脚本读同一份内容集合决定生成哪些卡，页面模板按同一约定引用——两边不需要通信，构建链的顺序（先 astro build 再生成 OG 图再跑守卫）保证了引用与产物必然对齐。

附带收益：角色页此前把 2~3MB 的立绘原图直接给社交平台当 og:image，现在换成 40KB 的品牌卡，分享体验和加载速度同时改善。

## 门槛与替代

这套管线的前提是愿意写一点 Node 脚本。如果不想维护脚本，替代方案按成本排序：静态模板图 + 手工改字（零代码但不可持续）、云端截图服务（每篇一次 API 调用，有外部依赖）、Vercel/Cloudflare 的边缘渲染函数（运行时生成，引入函数计算成本）。对一个已经在跑构建链的静态站点，构建期生成是唯一"加内容不加维护"的选项。
