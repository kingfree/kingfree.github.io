import katex from 'katex';
import { defineHastPlugin } from 'satteri';

/**
 * 把 Sätteri 解析出的数学公式（inline: code.math-inline / display: pre > code.math-display）
 * 渲染成 KaTeX。站点样式里同时引入了 katex 的 CSS。
 */
const textOf = (node) => {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (!node.children) return '';
  return node.children.map(textOf).join('');
};

const render = (tex, displayMode) => {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false, strict: false, output: 'htmlAndMathml' });
  } catch {
    return '<code>' + tex.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]) + '</code>';
  }
};

const classes = (node) => node.properties?.className ?? [];

export default defineHastPlugin({
  name: 'katex',
  element: [
    {
      filter: ['code'],
      visit(node, ctx) {
        if (!classes(node).includes('math-inline')) return;
        ctx.replaceNode(node, { type: 'raw', value: render(textOf(node).trim(), false) });
      },
    },
    {
      filter: ['pre'],
      visit(node, ctx) {
        const code = node.children?.[0];
        if (!code || code.type !== 'element' || code.tagName !== 'code') return;
        if (!classes(code).includes('math-display')) return;
        ctx.replaceNode(node, { type: 'raw', value: '<div class="math-block">' + render(textOf(code).trim(), true) + '</div>' });
      },
    },
  ],
});
