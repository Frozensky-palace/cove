/**
 * 站点级配置的唯一来源。
 *
 * Phase 0 说明：作者名、简介、社交链接与正式域名均为占位值，
 * 待确认后逐项替换（见 docs/content-checklist.md 第五节）。
 * 页面与组件不得另行硬编码站点信息。
 */

export interface NavItem {
  label: string;
  href: string;
}

export type SocialIcon = 'github' | 'rss' | 'email';

export interface SocialLink {
  label: string;
  href: string;
  icon: SocialIcon;
}

export const siteConfig = {
  /** 站点名称 */
  name: 'Cove',
  /** TODO(Phase 0)：正式域名确认后替换 */
  url: 'https://cove.example.com',
  /** 站点主张，用于页脚与首页 Hero */
  tagline: '小海湾里的文字、项目与技术分享',
  /** 默认 SEO 描述 */
  description:
    'Cove 是一个温柔、静谧的个人内容空间，沉淀完整论述的文章、随手记录的笔记与有过程、有反思的项目。',

  /** TODO(Phase 0)：替换为真实作者信息 */
  author: {
    name: 'Cove 作者',
    url: '',
  },

  locale: 'zh-CN',

  /** 主导航（指南 7.1）；搜索与主题为页头独立按钮，不在此列 */
  nav: [
    { label: '首页', href: '/' },
    { label: '文章', href: '/posts/' },
    { label: '笔记', href: '/notes/' },
    { label: '项目', href: '/projects/' },
    { label: '关于', href: '/about/' },
  ] satisfies NavItem[],

  /** 页脚“发现与订阅”入口（指南 7.1：分类、标签、归档在页脚提供入口） */
  footerNav: [
    { label: '归档', href: '/archive/' },
    { label: 'RSS', href: '/rss.xml' },
  ] satisfies NavItem[],

  /** TODO(Phase 0)：社交链接确认后补充 */
  social: [] satisfies SocialLink[],
} as const;
