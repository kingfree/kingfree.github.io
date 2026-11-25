import { defineHastPlugin } from 'satteri';

/**
 * 正文图片一律懒加载 + 异步解码：长文（几十张图的游记、制作记录）首屏不必等全部图片。
 */
export default defineHastPlugin({
  name: 'img-lazy',
  element: [
    {
      filter: ['img'],
      visit(node, ctx) {
        if (!node.properties?.loading) ctx.setProperty(node, 'loading', 'lazy');
        if (!node.properties?.decoding) ctx.setProperty(node, 'decoding', 'async');
      },
    },
  ],
});
