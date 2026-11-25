import { markdownToHast, hastToHtml } from 'satteri';

/**
 * 把「加粗说话人 + 后续内容」的 Markdown 渲染成对话气泡 HTML。
 * 在构建期完成，不依赖客户端脚本；只给 frontmatter 写了 chat: [...] 的文章用。
 */
const textOf = (node) => {
  if (!node) return '';
  if (node.type === 'text') return node.value ?? '';
  if (!node.children) return '';
  return node.children.map(textOf).join('');
};

const h = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children });
const t = (value) => ({ type: 'text', value });

const speakerOf = (node, speakers) => {
  if (!node || node.type !== 'element' || node.tagName !== 'p') return null;
  const first = node.children?.[0];
  if (!first || first.type !== 'element' || first.tagName !== 'strong') return null;
  const name = textOf(first).trim();
  return speakers.includes(name) ? name : null;
};

export function renderChat(source, speakers) {
  const body = source.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const tree = markdownToHast(body);
  const root = tree.type === 'root' ? tree : { type: 'root', children: [tree] };

  const out = [];
  let turn = null;

  for (const node of root.children ?? []) {
    if (node.type === 'element' && node.tagName === 'hr') {
      turn = null;
      continue;
    }

    const name = speakerOf(node, speakers);
    if (name) {
      const me = name === '我';
      const note = textOf({ children: node.children.slice(1) }).trim();
      const head = h('div', { className: ['chat-head'] }, [
        h('span', { className: ['chat-avatar'] }, [t(me ? '我' : name.slice(0, 1))]),
        h('span', { className: ['chat-name'] }, [t(name)]),
        ...(note ? [h('span', { className: ['chat-note'] }, [t(note)])] : []),
      ]);
      turn = h('div', { className: ['chat-body'] }, []);
      out.push(h('section', { className: ['chat-turn', me ? 'me' : 'ai'] }, [head, turn]));
      continue;
    }

    if (node.type === 'text' && !(node.value ?? '').trim()) continue;
    if (turn) turn.children.push(node);
    else out.push(node);
  }

  return hastToHtml({ type: 'root', children: out });
}
