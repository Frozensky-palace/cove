# Phase 7 手动操作与验证清单

Phase 7（部署、质量门禁与上线）的自动化与线上排查已完成（IMPL-048 收尾，含 www
绑定与重定向实测）。以下各项**只能在真实浏览器/真机上由你操作验证**，全部通过后
Phase 7 即可关闭。前置：本文档所在提交已合并到 `main` 并完成线上构建（giscus.json
需在线上生效后才可验第 2 节的域名限制项）。

---

## 1. 主题切换动效（View Transitions）

**环境**：Chrome / Edge（支持 View Transitions API）；Firefox / Safari 只验证功能降级。

- [ ] ① Chrome 打开任意页面 → 点页头主题按钮 → 深浅色以按钮为圆心的圆形揭示动画展开，无白闪；
- [ ] ② 连续快速点击多次不卡死、终态正确；
- [ ] ③ 刷新页面后主题保持（localStorage），无「先浅后深」闪烁；
- [ ] ④ Firefox 或 Safari 打开同一页面：点击直接切换、功能正常（无动画属预期降级）。

## 2. Giscus 评论（生产环境实测）

**环境**：登录过 GitHub 的浏览器；站点需已部署含 `giscus.json` 的 `main`。

- [ ] ① 打开任一文章页滚动到评论区 → giscus 懒加载出现 → 首次「以 GitHub 身份继续」授权成功；
- [ ] ② 实发一条评论 → 仓库 Discussions 的 `Comments` 分类自动创建对应 Discussion，评论内容与页面 pathname 回链正确；
- [ ] ③ 切换站点深浅主题 → 评论区跟随变色（含 transparent_dark）；
- [ ] ④ 域名限制生效（本次 `giscus.json` 的验证点）：
  - 生产 `https://cove.xin`：评论区正常加载（allowlist 命中）；
  - 本地 `pnpm dev`（localhost）：评论区正常加载（originsRegex 命中）；
  - 其他来源（如 workers.dev 预览地址，若存在）：评论区拒绝加载并显示错误提示——属预期阻断；
- [ ] ⑤ 未登录窗口打开评论区：可匿名产生 reaction（giscus 默认），发表评论要求授权。

## 3. 广告拦截 / 网络异常降级

**环境**：安装 uBlock Origin（或类似拦截器）的浏览器。

- [ ] ① 开启拦截器访问文章页：页面主体完全正常，无 JS 报错中断；
- [ ] ② giscus 脚本被拦截时：约 10 秒超时后出现降级提示与「重试」按钮，点击重试生效（或提示保持友好）；
- [ ] ③ Cloudflare Analytics beacon 被拦截：无控制台致命错误，页面功能不受影响。

## 4. Phase 5 遗留运行时验收（README 进度表注记项）

**环境**：Chrome DevTools Lighthouse（Mobile 模拟），对生产 URL `https://cove.xin` 跑分。

- [ ] ① Lighthouse 四项（性能 / 可访问性 / 最佳实践 / SEO）达到指南设定的门禁值；
- [ ] ② 浏览器缩放 200%：首页、文章页布局不横向溢出、不遮挡、不重叠；
- [ ] ③ 纯键盘走查：页头导航 → 文章链接 → 主题按钮 → 搜索，焦点环可见、顺序合理；
- [ ] ④ 真机抽查（手机）：移动导航、搜索、目录、评论区可用，字号行距舒适。

## 5. 运营链路确认（随本次合并顺带验证）

- [ ] ① 推送 `main` 后 Cloudflare 控制台出现构建记录，2–3 分钟内线上生效；
- [ ] ② Cloudflare Web Analytics 控制面板开始收到真实访问数据（beacon 上报）；
- [ ] ③ 按 [`OPERATIONS.md`](OPERATIONS.md) 第 2.1 节在测试分支或本地演练一次 `git revert` 流程（不必真回滚线上）。

---

## 验收表

| 项 | 结果 | 备注 |
| --- | --- | --- |
| 1 主题切换动效 | ☐ 通过 | |
| 2 giscus 实测与域名限制 | ☐ 通过 | |
| 3 拦截降级 | ☐ 通过 | |
| 4 Lighthouse / 200% / 键盘 / 真机 | ☐ 通过 | |
| 5 运营链路 | ☐ 通过 | |

全部勾收后：更新 `README.md` 阶段进度表（Phase 7 备注可移除），Phase 7 关闭，进入 Phase 8（上线观察与后续迭代）。
