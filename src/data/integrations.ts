/**
 * 第三方集成配置（指南 3.4「服务可替换」、第 10 节边界组件、第 16 节安全）。
 *
 * 所有取值都是会出现在页面源码中的公开标识符，不属于密钥；
 * 对应服务的访问控制由 GitHub Discussions 权限与 Cloudflare 域名管理承担。
 *
 * 留空 = 对应功能整体不渲染、不加载任何第三方脚本，
 * 正文与导航不受影响（指南 3.5 渐进增强、19 Phase 6 验收）。
 * 填写步骤见 docs/PHASE6-MANUAL-CHECKLIST.md。
 */

/** Giscus 评论（基于 GitHub Discussions，指南 ADR-008） */
export const giscusConfig = {
  /** 仓库，格式 `owner/repo` */
  repo: 'Frozensky-palace/cove',
  /** giscus.app 生成的仓库 Discussion ID（base64） */
  repoId: 'R_kgDOUdAnug',
  /** 存放评论的 Discussion 分类名（建议 Announcements，仅维护者可发起） */
  category: 'Comments',
  /** 对应分类的 ID（base64） */
  categoryId: 'DIC_kwDOUdAnus4DF-CU',
  /** 讨论 ↔ 页面映射：pathname（指南 19 Phase 6），URL 即标识，改名需处理重定向（指南 9.7） */
  mapping: 'pathname',
  /** 评论界面语言 */
  lang: 'zh-CN',
} as const;

/** Cloudflare Web Analytics（基础流量与真实用户性能，V1 不追踪个人画像，指南 6.3） */
export const analyticsConfig = {
  /** Cloudflare「Web Analytics」站点 beacon token */
  token: '',
} as const;
