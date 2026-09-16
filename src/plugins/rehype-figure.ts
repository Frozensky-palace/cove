/**
 * 本地 rehype 插件：将"仅含一张图片的段落"转换为 <figure> + <figcaption>。
 * caption 取图片 alt（空 alt 的装饰图不转换）。
 * 避免为此引入额外依赖（指南 21.2：新增依赖需说明理由）。
 */
import { visit } from 'unist-util-visit';
import type { Root, Element } from 'hast';

export function rehypeFigure() {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (parent?.type !== 'element' || parent.tagName !== 'p' || index === undefined) return;
      if (node.tagName !== 'img') return;

      const img = node as Element & { properties: { alt?: string } };
      const alt = typeof img.properties.alt === 'string' ? img.properties.alt.trim() : '';
      if (!alt) return;

      // 仅当段落内只有这一张图片（无兄弟文本）时转换
      const hasOnlyImage =
        parent.children.filter(
          (child) => child.type === 'text' ? child.value.trim().length > 0 : true,
        ).length === 1;
      if (!hasOnlyImage) return;

      const figure: Element = {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['prose-figure'] },
        children: [
          node,
          { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: alt }] },
        ],
      };
      parent.children[index] = figure;
    });
  };
}
