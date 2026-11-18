type Attrs = Record<string, string | number | boolean | null | undefined>;

/** Tiny element factory. Text children are always inserted as text nodes (never parsed as HTML). */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Attrs = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') el.className = String(v);
    else if (k === 'text') el.textContent = String(v);
    else if (k === 'style') el.setAttribute('style', String(v));
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

/** Build an element from a TRUSTED, static markup string (our own SVG art). Never pass user input. */
export function fromMarkup<T extends Element = Element>(markup: string): T {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup.trim();
  const el = tpl.content.firstElementChild;
  if (!el) throw new Error('fromMarkup: empty markup');
  return el as T;
}

let toastTimer = 0;
export function toast(message: string, extra?: string): void {
  let el = document.getElementById('toast');
  if (!el) return;
  el.replaceChildren(h('span', { text: message }));
  if (extra) el.append(h('code', { class: 'toast-extra', text: extra }));
  el.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el?.classList.remove('show'), extra ? 6000 : 2200);
}
