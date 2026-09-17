import { getCollection, type CollectionEntry } from 'astro:content';
import { slugifyTag } from '@/lib/urls';
import { isCategoryKey, type CategoryKey } from '@/data/taxonomy';

/**
 * 集中内容查询层（指南 11.5）。
 * 所有页面通过本模块获取内容，不在各页面重复过滤逻辑；
 * 生产过滤、排序与发布判断集中在此。
 */

export type Post = CollectionEntry<'posts'>;
export type Note = CollectionEntry<'notes'>;
export type Project = CollectionEntry<'projects'>;

/**
 * 预览内容开关（指南 11.5 / 17.3）：
 * 本地开发可看到草稿与计划发布内容（页面顶部显示“预览内容”标记），
 * 生产构建一律过滤。构建环境识别集中在本文件，页面不得自行判断。
 */
export const showPreviewContent: boolean = import.meta.env.DEV;

/** 以 Asia/Shanghai 时区取“今天”的 YYYY-MM-DD，用于未来发布日期判断。 */
function todayInShanghai(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** 发布判断纯函数（指南 11.5）：草稿与未来发布日期在生产中排除。 */
export function isPublicContent(entry: { data: { draft: boolean; publishedAt?: string } }): boolean {
  if (showPreviewContent) return true;
  if (entry.data.draft) return false;
  const publishedAt = entry.data.publishedAt;
  if (publishedAt && publishedAt > todayInShanghai()) return false;
  return true;
}

/** 是否为"仅预览"内容（草稿或计划发布）：本地开发中显示醒目"预览内容"标记（指南 11.5）。 */
export function isPreviewOnly(entry: {
  data: { draft: boolean; publishedAt?: string };
}): boolean {
  if (!entry.data.draft && entry.data.publishedAt && entry.data.publishedAt > todayInShanghai()) {
    return true;
  }
  return entry.data.draft;
}

function byNewest(a: { data: { publishedAt?: string } }, b: { data: { publishedAt?: string } }) {
  return (b.data.publishedAt ?? '').localeCompare(a.data.publishedAt ?? '');
}

/* ---------------------------------- posts ---------------------------------- */

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', isPublicContent);
  return posts.sort(byNewest);
}

export async function getFeaturedPosts(max = 3): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.featured).slice(0, max);
}

export async function getPostsByCategory(key: CategoryKey): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.category === key);
}

export async function getPostsByTag(tag: string): Promise<Post[]> {
  const target = slugifyTag(tag);
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.data.tags.some((t) => slugifyTag(t) === target));
}

/** 相关文章（指南 13.3）：同分类加权 > 重合标签加权，同分优先较新，最多 4 篇。 */
export async function getRelatedPosts(current: Post, max = 4): Promise<Post[]> {
  const posts = await getPublishedPosts();
  const scored = posts
    .filter((post) => post.id !== current.id)
    .map((post) => {
      const sameCategory = post.data.category === current.data.category ? 2 : 0;
      const sharedTags = post.data.tags.filter((tag) =>
        current.data.tags.some((t) => slugifyTag(t) === slugifyTag(tag)),
      ).length;
      return { post, score: sameCategory + sharedTags };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.post, b.post));
  return scored.slice(0, max).map(({ post }) => post);
}

/** 上一篇 / 下一篇（按 publishedAt 降序列表中的相邻项）。 */
export async function getAdjacentPosts(current: Post): Promise<{ prev?: Post; next?: Post }> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((post) => post.id === current.id);
  if (index === -1) return {};
  return { prev: posts[index + 1], next: posts[index - 1] };
}

/* ---------------------------------- notes ---------------------------------- */

export async function getPublishedNotes(): Promise<Note[]> {
  const notes = await getCollection('notes', isPublicContent);
  return notes.sort(byNewest);
}

/* --------------------------------- projects -------------------------------- */

export async function getPublishedProjects(): Promise<Project[]> {
  const projects = await getCollection('projects', isPublicContent);
  return projects.sort((a, b) => {
    const featured = Number(b.data.featured) - Number(a.data.featured);
    if (featured !== 0) return featured;
    return (b.data.startedAt ?? '').localeCompare(a.data.startedAt ?? '');
  });
}

/**
 * 解析项目关联文章并校验引用存在（指南 11.4）。
 * 引用不存在的文章会在构建期抛错，避免死链进入产物。
 */
export async function resolveProjectRelatedPosts(project: Project): Promise<Post[]> {
  const posts = await getPublishedPosts();
  return project.data.relatedPosts.map((id) => {
    const post = posts.find((entry) => entry.id === id);
    if (!post) {
      throw new Error(
        `项目「${project.data.title}」引用了不存在的文章 ID：${id}（published 或不存在）`,
      );
    }
    return post;
  });
}

/* ------------------------------ 聚合与派生数据 ------------------------------ */

export interface TagStat {
  /** URL slug */
  slug: string;
  /** 展示名（以内容中的写法为准） */
  label: string;
  count: number;
}

/** 聚合全部标签并检测 URL slug 碰撞（指南 11.1 / 7.3）。 */
export async function collectTagStats(): Promise<TagStat[]> {
  const posts = await getPublishedPosts();
  const notes = await getPublishedNotes();
  const bySlug = new Map<string, TagStat>();
  for (const { tags } of [...posts.map((p) => p.data), ...notes.map((n) => n.data)]) {
    for (const tag of tags ?? []) {
      const slug = slugifyTag(tag);
      const existing = bySlug.get(slug);
      if (existing) {
        if (existing.label !== tag) {
          throw new Error(
            `标签 URL 碰撞：「${existing.label}」与「${tag}」都规范化为 ${slug}，请调整标签写法`,
          );
        }
        existing.count += 1;
      } else {
        bySlug.set(slug, { slug, label: tag, count: 1 });
      }
    }
  }
  return [...bySlug.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export async function getCategoryStats(): Promise<{ key: CategoryKey; count: number }[]> {
  const posts = await getPublishedPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.data.category, (counts.get(post.data.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([key]) => isCategoryKey(key))
    .map(([key, count]) => ({ key: key as CategoryKey, count }));
}

/** 归档分组（指南 /archive/）：按年份倒序。 */
export async function groupPostsByYear(): Promise<{ year: string; posts: Post[] }[]> {
  const posts = await getPublishedPosts();
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const year = post.data.publishedAt.slice(0, 4);
    groups.set(year, [...(groups.get(year) ?? []), post]);
  }
  return [...groups.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, list]) => ({ year, posts: list }));
}

/* --------------------------------- series --------------------------------- */

export interface SeriesGroup {
  /** 系列展示名（frontmatter 中首次出现的写法） */
  name: string;
  /** 阅读顺序：publishedAt 升序（发布顺序即阅读顺序） */
  posts: Post[];
  /** 系列最新一篇日期（用于系列间排序） */
  latestAt: string;
}

/**
 * 全部系列（指南 11.1 预留字段的落地）：同名 series 值聚合为一个系列，
 * 系列间按最近更新倒序；与标签同策略检测 URL slug 碰撞。
 */
export async function getAllSeries(): Promise<SeriesGroup[]> {
  const posts = await getPublishedPosts();
  const byName = new Map<string, Post[]>();
  for (const post of posts) {
    const name = post.data.series;
    if (!name) continue;
    byName.set(name, [...(byName.get(name) ?? []), post]);
  }

  const bySlug = new Map<string, string>();
  for (const name of byName.keys()) {
    const slug = slugifyTag(name);
    const existing = bySlug.get(slug);
    if (existing && existing !== name) {
      throw new Error(
        `系列 URL 碰撞：「${existing}」与「${name}」都规范化为 ${slug}，请调整系列写法`,
      );
    }
    bySlug.set(slug, name);
  }

  return [...byName.entries()]
    .map(([name, list]) => {
      const ascending = [...list].reverse(); // getPublishedPosts 为倒序
      return { name, posts: ascending, latestAt: list[0]?.data.publishedAt ?? '' };
    })
    .sort((a, b) => b.latestAt.localeCompare(a.latestAt));
}

/** 按展示名取单个系列（getStaticPaths 传 props.series，ArticleLayout 传 frontmatter 值）。 */
export async function getSeriesGroup(name: string): Promise<SeriesGroup | null> {
  const all = await getAllSeries();
  return all.find((series) => series.name === name) ?? null;
}

/** 文章列表条目：独立文章，或折叠了整个系列的系列组（IMPL-030）。 */
export type FeedEntry = Post | SeriesGroup;

/**
 * 从给定文章集合构建系列组（IMPL-035 抽出为共用逻辑）：
 * 同名 series 聚合，阅读顺序 = publishedAt 升序，latestAt 取最新一篇。
 * 输入集合先行过滤（如按分类），组内自然只含过滤后的篇目——
 * 跨分类系列在分类页只呈现该分类的部分，与页面语境一致。
 */
function groupSeriesByName(posts: Post[]): Map<string, SeriesGroup> {
  const byName = new Map<string, Post[]>();
  for (const post of posts) {
    const name = post.data.series;
    if (!name) continue;
    byName.set(name, [...(byName.get(name) ?? []), post]);
  }
  return new Map(
    [...byName.entries()].map(([name, list]) => [
      name,
      { name, posts: [...list].reverse(), latestAt: list[0]?.data.publishedAt ?? '' },
    ]),
  );
}

/**
 * 列表折叠（IMPL-030/035）：同系列文章收束为一个系列组，
 * 组的位置取系列最新一篇在时间线中的位置；组外文章原样保留。
 * 输入集合已按页面语境过滤（全部文章 / 单一分类）。
 */
function collapseSeries(posts: Post[]): FeedEntry[] {
  const byName = groupSeriesByName(posts);
  const emitted = new Set<string>();
  const feed: FeedEntry[] = [];
  for (const post of posts) {
    const group = post.data.series ? byName.get(post.data.series) : undefined;
    if (!group) {
      feed.push(post);
      continue;
    }
    if (emitted.has(group.name)) continue;
    emitted.add(group.name);
    feed.push(group);
  }
  return feed;
}

/**
 * 文章列表 feed（IMPL-030，用户需求）：同系列文章在列表层
 * 收束为一个系列组（可展开卡片），不再逐篇占据条目。
 * 折叠发生在分页之前，同一系列不会跨页拆开。
 */
export async function getPostFeed(): Promise<FeedEntry[]> {
  return collapseSeries(await getPublishedPosts());
}

/**
 * 分类页 feed（IMPL-035，用户需求）：分类页与 /posts/ 同款系列折叠。
 * 先按分类过滤再折叠：系列组内仅含该分类的篇目，
 * 位置仍取组内最新一篇在该分类时间线中的位置。
 */
export async function getCategoryFeed(key: CategoryKey): Promise<FeedEntry[]> {
  const posts = (await getPublishedPosts()).filter((post) => post.data.category === key);
  return collapseSeries(posts);
}

/* --------------------------------- 格式化 --------------------------------- */

/**
 * 将 YYYY-MM-DD 解释为上海时区当日，避免 UTC 偏移（指南 11.1）。
 * 输出 Date 仅用于 RSS 等需要时间戳的场合。
 */
export function shanghaiDate(dateString: string): Date {
  return new Date(`${dateString}T00:00:00+08:00`);
}

/** 展示用日期：YYYY年M月D日（可选）。 */
export function formatDate(dateString: string, withTime = false): string {
  const [y, m, d] = dateString.split('-');
  const base = `${Number(y)} 年 ${Number(m)} 月 ${Number(d)} 日`;
  return withTime ? `${base}（更新）` : base;
}

/**
 * 阅读时长（构建期派生，指南 11.1）：中文按约 400 字/分钟，
 * 英文单词按约 200 词/分钟，至少 1 分钟。
 */
export function readingMinutes(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) ?? []).length;
  const words = (text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, ' ').match(/[A-Za-z0-9]+/g) ?? [])
    .length;
  return Math.max(1, Math.round(cjk / 400 + words / 200));
}
