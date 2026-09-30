import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { categoryKeys } from '@/data/taxonomy';
import { authorKeys } from '@/data/authors';

/**
 * 内容 schema（指南 11 内容模型）。
 *
 * 日期约定（指南 11.1）：frontmatter 日期按 `YYYY-MM-DD` 解释，站点按
 * Asia/Shanghai 展示。刻意不用 z.coerce.date()：它按 UTC 解析，
 * 序列化与格式化时会产生日期偏移；字符串排序（字典序）与 ISO 日期排序一致。
 *
 * Pages CMS 实测（IMPL-042）：date 字段保存的 YAML 不加引号
 * （`publishedAt: 2026-09-20`），YAML 解析后是 Date 对象而非字符串——
 * preprocess 把它规范化为日期字符串（js-yaml 对裸日期按 UTC 零点解析，
 * 取 UTC 分量在任何时区都得原日期），手工书写的字符串仍走同一正则校验。
 *
 * Astro 7：image() 经 schema 上下文（SchemaContext）提供，不在 z 命名空间上。
 */
const dateString = z.preprocess(
  (value) => {
    if (value instanceof Date) {
      const y = value.getUTCFullYear();
      const m = String(value.getUTCMonth() + 1).padStart(2, '0');
      const d = String(value.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return value;
  },
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须写为 YYYY-MM-DD（如 2026-09-16）'),
);

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(8).max(200),
        publishedAt: dateString,
        updatedAt: dateString.optional(),
        category: z.enum(categoryKeys),
        /** 值守者署名（IMPL-052）：缺省为站长，历史文章无需回填 */
        author: z.enum(authorKeys).default('wen-wanan'),
        tags: z.array(z.string().min(1).max(30)).min(1).max(8),
        draft: z.boolean().default(true),
        featured: z.boolean().default(false),
        lang: z.enum(['zh-CN', 'en']).default('zh-CN'),
        cover: image().optional(),
        /** 有信息含义的封面必须提供（内容检查表人工把关） */
        coverAlt: z.string().min(1).optional(),
        canonicalURL: z.url().nullable().optional(),
        series: z.string().optional(),
      })
      .strict()
      .refine((entry) => !entry.updatedAt || entry.updatedAt >= entry.publishedAt, {
        message: 'updatedAt 不得早于 publishedAt',
        path: ['updatedAt'],
      })
      .refine((entry) => !entry.featured || Boolean(entry.cover), {
        message:
          'featured 文章必须提供 cover——首页精选区是全站唯一封面展示位，无封面进入精选会造成主卡弱于副卡的层级倒挂（IMPL-069）',
        path: ['cover'],
      }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z
    .object({
      title: z.string().min(1).optional(),
      publishedAt: dateString,
      updatedAt: dateString.optional(),
      /** 值守者署名（IMPL-052）：小记默认由沿岸记录员发布 */
      author: z.enum(authorKeys).default('xu-zhaoxi'),
      tags: z.array(z.string().min(1).max(30)).max(5).default([]),
      draft: z.boolean().default(true),
      lang: z.enum(['zh-CN', 'en']).default('zh-CN'),
    })
    .strict()
    .refine((entry) => !entry.updatedAt || entry.updatedAt >= entry.publishedAt, {
      message: 'updatedAt 不得早于 publishedAt',
      path: ['updatedAt'],
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        summary: z.string().min(4).max(120),
        status: z.enum(['active', 'completed', 'archived']),
        /** 值守者署名（IMPL-052）：项目默认由船坞管理员记录 */
        author: z.enum(authorKeys).default('shen-yuzhou'),
        startedAt: dateString.optional(),
        completedAt: dateString.optional(),
        stack: z.array(z.string().min(1)).max(12).default([]),
        cover: image().optional(),
        featured: z.boolean().default(false),
        draft: z.boolean().default(true),
        links: z
          .array(
            z
              .object({
                label: z.string().min(1),
                url: z.url(),
                type: z.enum(['demo', 'source', 'paper', 'download', 'other']).default('other'),
              })
              .strict(),
          )
          .default([]),
        /** 相关文章 ID（posts collection）；引用在 lib/content.ts 构建期校验 */
        relatedPosts: z.array(z.string().min(1)).default([]),
      })
      .strict()
      .refine(
        (entry) => !entry.startedAt || !entry.completedAt || entry.completedAt >= entry.startedAt,
        { message: 'completedAt 不得早于 startedAt', path: ['completedAt'] },
      ),
});

/**
 * 值守者档案（IMPL-052）：三类内容的作者字典，可在 CMS 增改。
 * key = 文件名 = /character/<key>/ 的 slug，发布后视为冻结；
 * name/role/order 由 src/data/authors.ts 同步派生（z.enum 与卡片），
 * avatar/正文（设定文）供 /character/[key]/ 档案页与署名组件使用。
 */
const authors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: ({ image }) =>
    z
      .object({
        key: z.string().min(1),
        name: z.string().min(1),
        role: z.string().min(1),
        tagline: z.string().min(1).max(120),
        avatar: image(),
        symbol: z.string().min(1),
        colors: z
          .array(z.object({ name: z.string().min(1), value: z.string().min(1) }).strict())
          .max(3)
          .default([]),
        order: z.number().int().default(99),
      })
      .strict(),
});

/**
 * 站点里程碑（IMPL-054）：about「站点大事记」时间线的数据源，可在 CMS
 * 增改。date 沿用全站 YYYY-MM-DD 字符串约定；按 date 升序展示即溯源方向。
 */
const milestones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/milestones' }),
  schema: z
    .object({
      title: z.string().min(1),
      date: dateString,
      description: z.string().max(200).optional(),
    })
    .strict(),
});

export const collections = { posts, notes, projects, authors, milestones };
