import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { categoryKeys } from '@/data/taxonomy';

/**
 * 内容 schema（指南 11 内容模型）。
 *
 * 日期约定（指南 11.1）：frontmatter 一律写 `YYYY-MM-DD` 字符串，站点按
 * Asia/Shanghai 解释与展示。刻意不用 z.coerce.date()：它按 UTC 解析，
 * 序列化与格式化时会产生日期偏移；字符串排序（字典序）与 ISO 日期排序一致。
 *
 * Astro 7：image() 经 schema 上下文（SchemaContext）提供，不在 z 命名空间上。
 */
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须写为 YYYY-MM-DD（如 2026-09-16）');

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
      }),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z
    .object({
      title: z.string().min(1).optional(),
      publishedAt: dateString,
      updatedAt: dateString.optional(),
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

export const collections = { posts, notes, projects };
