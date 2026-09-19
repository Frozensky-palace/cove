# Pages CMS 写作与发布说明

Phase 6 交付物（指南 19 Phase 6 / 第 12 节「Pages CMS 约定」）。面向通过网页编辑器写作与发布的场景；本地写作流程不受影响（指南 12：CMS 未接入前不阻塞本地写作，接入后同样不取代本地编辑）。

## 1. 入口与授权

1. 访问 <https://app.pagescms.org>，用 GitHub 账号登录；
2. 授权 Pages CMS 的 GitHub App 时**只勾选 `Frozensky-palace/cove` 一个仓库**（指南第 17 节安全约定：GitHub 启用 MFA，CMS App 只授权目标仓库）;
3. 打开 `cove` 仓库，CMS 按 `.pages.yml` 渲染出四个内容区：分类、文章、笔记、项目。

`.pages.yml` 位于仓库根目录，按分支读取——在哪个分支上编辑，改动就提交到哪个分支。

## 2. 文件名即 URL slug

- 文章与笔记的文件名决定访问地址（`/posts/<文件名>/`、`/notes/<文件名>/`），创建后**不要随意改名**，外部链接会失效；
- 文件名约定：小写 ASCII 字母、数字、连字符（指南 12）；
- 新建条目时 CMS 由标题派生文件名：**中文标题会被 slugify 处理，得到的结果可能为空或不含语义**。建议流程：先用英文工作标题创建条目（如 `astro-from-scratch-4`），确认文件名后再把标题改为正式中文标题；
- 笔记可选在文件名前加日期前缀（如 `2026-09-10-xxx.md`），与既有内容保持一致；项目固定使用语义化短名（如 `cove-site`）。

## 3. 字段与 schema 的对应

`.pages.yml` 的字段与 `src/content.config.ts` 的 zod schema 严格对应，保存时写入的 frontmatter 会在构建期再次校验：

| CMS 表单 | schema 约束 | 说明 |
| --- | --- | --- |
| 标题 | `title` | 文章/项目必填；笔记可省略 |
| 摘要 | `description` 8–200 字 | 文章必填；项目对应 `summary` |
| 发布日期 | `publishedAt` | date 字段，输出 `yyyy-MM-dd` 字符串 |
| 更新日期 | `updatedAt` | 不得早于发布日期，schema refine 校验 |
| 分类 | `category` 枚举 | reference 字段，选项来自「分类」内容区（见第 3.1 节），存储值为分类标识 |
| 标签 | `tags` 1–8（笔记 ≤5） | 自由输入，非下拉 |
| 草稿 | `draft`，默认 `true` | **新建内容默认勾选，不勾选即发布**（指南 12） |
| 语言 | `lang` 枚举 | 默认 `zh-CN` |
| 封面 / 替代文本 | `cover` / `coverAlt` | 有信息含义的封面必须填替代文本 |
| 系列名 | `series` | 同系列文章填相同字符串 |
| 相关链接 | `links[]` 对象数组 | 项目专用，URL 构建期校验 |
| 相关文章 | `relatedPosts[]` 字符串数组 | 手填文章 ID（文件名去 `.md`），构建期校验存在性 |

配置启用了 `settings.content.merge: true`：保存时保留表单之外的既有 frontmatter 键。但 schema 是 `.strict()` 的——**不要手工往内容文件里添加 schema 之外的键**，否则 `pnpm build` 会失败。

### 3.1 分类管理（分类内容区）

文章分类不再是 `.pages.yml` 里的固定下拉项，而是一个可增删改的 collection：每个分类是 `src/content/categories/` 下的一个小文件，构建期由 `src/data/taxonomy.ts` 派生整站分类体系（页脚导航、分类页、文章标注都读它）。

| 字段 | 规则 |
| --- | --- |
| 标识（key） | URL slug：小写字母、数字、连字符（如 `web-dev`）。同时是文件名与文章 `category` 的存储值 |
| 显示名称（label） | 站点展示名（如「Web 开发」），必填 |
| 排序（order） | 可选数字，越小越靠前；留空排在最后 |

操作约定：

- **新增**：分类内容区新建条目，填标识与显示名称。之后在文章表单的分类字段里即可选到，页脚分类入口同步出现；分类页 `/categories/<key>/` 与分类切换导航在发布首篇该分类文章后出现（空分类不生成独立页面）；
- **改显示名称**：随时可改，只影响展示，不影响 URL 与已发布文章；
- **改标识（key）**：等于改变所有相关文章的 URL（`/categories/<key>/`），**已发布分类的 key 视为冻结**。确需改名：新建新 key 的分类 → 把相关文章的分类逐篇改到新分类 → 删除旧分类，全程保持草稿或分批提交；
- **删除**：仍有文章引用时删除会导致 `pnpm build` 失败（schema 枚举校验报错，防止分类页与文章标注坏链）——这是有意的失败安全设计；先把文章改到其他分类再删；
- **本地同步**：`src/data/taxonomy.ts` 经 `import.meta.glob` 在构建期读取分类文件，dev 下 Vite 监听该目录，新增/修改通常自动生效；未见更新时重启 `pnpm dev`。CMS 发布触发的 CI 构建每次全新启动，不受影响。

## 4. 媒体与封面

- 配置了两个媒体源：`文章媒体`（`src/assets/posts`）与 `项目媒体`（`src/assets/projects`）。封面字段的图片上传进对应目录，frontmatter 写入相对引用（如 `../../assets/posts/foo.jpg`），构建期由 Astro `image()` 处理；
- 上传文件名会被 slugify 为安全文件名（`rename: safe`，待验证项见第 7 节）；
- 既有内容还有一种封面存放方式：与文章同名的子目录（如 `hello-cove/cover.svg`）。CMS 编辑这类旧文章时**不要改动封面字段的既有值**；如需换图，先在本地迁移到 `src/assets/posts` 再编辑；
- 正文（rich-text）内插图走媒体库，与封面共用媒体源；
- 一篇文章与其媒体会作为一个原子变更提交（指南第 18 节）。

## 5. 草稿 → 提交 → 预览 → 发布

1. **写**：CMS 中新建条目，保持「草稿」勾选，保存；
2. **提交**：保存即向当前分支提交一次 Git commit；生产构建会过滤 `draft: true` 与未来日期内容（指南 11.1），因此草稿直接提交到 `main` 不会出现在线上；
3. **预览**：草稿预览需本地或非生产分支执行 `pnpm build && pnpm preview`（用户自行运行）。指南 18 的约定：若 CMS 流程只能直写 `main`，则只保存 `draft: true` 的内容，该模式不视为具备线上草稿预览；
4. **发布**：取消「草稿」勾选并保存 → 提交到 `main` → 触发 Cloudflare Pages 自动构建 → 构建通过后上线。schema 校验失败会导致构建失败、站点停留在上一个成功版本——这是有意的失败安全设计；
5. **回滚**：内容即 Git 历史，回滚 = revert 对应 commit。

## 6. 边界与限制

- **MDX 与含组件的内容不进 CMS**：富文本编辑器可能改写组件语法（指南 12），含组件的草稿一律本地编辑；
- **正文复杂语法**：围栏代码块、表格、脚注建议编辑后切换源码模式核对，或直接本地编辑；
- **相关文章**：CMS 中手填 ID，无关联选择器（reference 字段默认写入条目路径而非 ID，与 schema 不符；文章分类用 reference 是因为它显式配置了 `value: "{primary}"`，存储值恰为分类标识）；
- **系列管理**：`series` 是自由字符串，系列顺序由文章日期决定，无独立实体。

## 7. 上线前验证清单（需一篇测试文章实测）

指南 12 明确要求：配置中的示意语法必须用当前版本的 Pages CMS 验证，不能当作已验证成品。首次使用时用一篇 `draft: true` 的测试文章逐项确认：

1. **date 字段输出**：保存后检查 frontmatter 是否为带引号的 `'YYYY-MM-DD'` 字符串（schema 拒绝 Date 对象与 ISO 时间戳）；
2. **媒体路径**：上传封面，确认 frontmatter 写入 `../../assets/posts/...`，且 `pnpm build` 通过（指南 12 指定的 `media.input` / `media.output` 与 `image()` 兼容性验证）；
3. **`rename: safe` 键名**：上传中文或含空格文件名的图片，确认被重命名为安全文件名；若无效，删去该键并在上传前手工命名；
4. **image 字段的 `media:` 选项**：确认项目封面走 `项目媒体` 源而非默认源；
5. **filename 模板**：中文标题创建条目，确认文件名派生行为，必要时手工重命名；
6. **merge 行为**：编辑一篇含 `series`/`canonicalURL` 的旧文，确认未展示字段不被删除；
7. **rich-text 保真**：含代码块、表格、引用的正文经 CMS 保存后 diff 检查，确认 Markdown 未被改写；
8. **select 选项**：语言/状态/链接类型下拉能看到全部选项（2026-09 曾因 `options` 写成裸对象列表导致下拉为空，已按官方文档改为 `options.values`，需在当前版本复核）；
9. **分类 reference 字段**：文章表单的分类字段能搜索并选到分类，保存后 frontmatter `category` 的值是分类标识（如 `engineering`）而非文件路径；新建分类条目时文件名由标识派生（如 `engineering.md`）；
10. **分类删除保护**：删除一个仍被文章引用的分类并保存，`pnpm build` 应报 schema 枚举错误（预期失败，恢复该分类即可）。

任一项不符合：回到本地工作流，并在 `docs/decision-log.md` 记录修正。

## 8. 安全

- GitHub App 授权范围限定为 `cove` 仓库，可在 GitHub → Settings → Applications 随时撤销；
- CMS 保存产生的 commit 作者为授权账号，与本地提交同等参与 Git 审计；
- 不要把 CMS 凭据（GitHub token）写入任何文件。
