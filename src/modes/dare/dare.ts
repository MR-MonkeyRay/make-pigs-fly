import '../../styles/dare.css';
import { h } from '../../lib/dom';
import { pick } from '../../lib/rng';
import { hashUrl, shareLink } from '../../lib/share';
import { list, t } from '../../i18n';
import { FLY_EVENT, type Mode, type ModeContext } from '../types';
import { createStage, type StageController } from '../ways/stage';
import { methodNumber, SKIT_IDS, SKITS, skitById } from '../ways/registry';
import { loadUnlocked, unlock } from '../ways/progress';
import { nextSkitId } from '../ways/shuffle';
import { checkPromise, decodeDare, encodeDare, graphemeLength, PROMISE_MAX, splitTemplate } from './codec';

export function createMode(): Mode {
  return { mount };
}

function mount({ root, route, signal }: ModeContext): void {
  const friendSentence = decodeDare(route.query.get('d'));
  const isFriend = friendSentence !== null;
  const presets = list('dare.presets');
  const [prefix, suffix] = splitTemplate(t('dare.template'));

  let promise = pick(presets);
  let lastSkit: string | null = null;
  let flown = false;

  const stage: StageController = createStage(signal);

  // ── Ticket Top Bar ──────────────────────────────────────
  const statusDot = h('span', { class: 'dare-status-dot' });
  const statusCode = h('span', {
    class: 'dare-serial',
    text: isFriend ? 'DISPATCH // INCOMING DARE' : 'FLIGHT CONTRACT // #MPF-01',
  });
  const topBar = h(
    'div',
    { class: 'dare-topbar', 'aria-hidden': 'true' },
    h('div', { class: 'dare-topbar-left' }, statusDot, statusCode),
    h('div', { class: 'dare-perf' }),
  );

  // ── Sentence ────────────────────────────────────────────
  const promiseEl = h('span', { class: 'dare-promise' });
  const line = h('p', { class: 'dare-line', id: 'dare-line' });
  const renderLine = () => {
    if (isFriend) {
      line.replaceChildren(h('span', { class: 'dare-quote', text: friendSentence }));
    } else {
      promiseEl.textContent = promise;
      line.replaceChildren(prefix, promiseEl, suffix);
    }
  };
  renderLine();

  const heroBox = h(
    'div',
    { class: 'dare-hero' },
    isFriend ? h('p', { class: 'dare-intro', text: t('dare.friend.intro') }) : null,
    line,
  );

  // ── Controls ────────────────────────────────────────────
  const flyBtn = h('button', {
    class: 'btn btn-primary dare-fly',
    type: 'button',
    text: t(isFriend ? 'dare.friend.check' : 'dare.fly'),
  });
  const verdict = h('p', { class: 'dare-verdict', tabindex: '-1' });
  const method = h('p', { class: 'dare-method' });
  const unlockedLink = h('a', { class: 'dare-unlocked', href: '#/ways' });
  const anotherBtn = h('button', { class: 'btn btn-small', type: 'button', text: t('dare.another') });
  const writeBtn = h('button', { class: 'btn btn-small', type: 'button', text: t('dare.write') });
  const shareBtn = h('button', { class: 'btn btn-small btn-share', type: 'button', text: t('dare.share') });
  const ctaBtn = h('a', { class: 'btn btn-small btn-accent', href: '#/?compose=1', text: t('dare.friend.cta') });
  const afterRow = h('div', { class: 'dare-row' }, ...(isFriend ? [ctaBtn] : [anotherBtn, writeBtn, shareBtn]));
  const after = h(
    'div',
    { class: 'dare-after', hidden: true },
    h('div', { class: 'dare-verdict-box' }, verdict, method),
    afterRow,
    unlockedLink,
  );

  // ── Composer ────────────────────────────────────────────
  const input = h('input', {
    class: 'compose-input',
    type: 'text',
    id: 'compose-input',
    maxlength: String(PROMISE_MAX * 4),
    placeholder: t('dare.compose.placeholder'),
    autocomplete: 'off',
    enterkeyhint: 'done',
  });
  const charCount = h('span', { class: 'compose-counter', 'aria-hidden': 'true', text: `0/${PROMISE_MAX}` });
  const updateCounter = () => {
    const len = graphemeLength(input.value.trim());
    charCount.textContent = `${len}/${PROMISE_MAX}`;
    charCount.classList.toggle('is-over', len > PROMISE_MAX);
  };
  input.addEventListener('input', updateCounter, { signal });

  const error = h('p', { class: 'compose-error', role: 'alert' });
  const form = h(
    'form',
    { class: 'compose card', hidden: true },
    h(
      'div',
      { class: 'compose-head', 'aria-hidden': 'true' },
      h('span', { class: 'compose-badge', text: 'CUSTOM DARE TICKET' }),
      charCount,
    ),
    h('label', { class: 'compose-label', for: 'compose-input' }, h('span', { text: prefix.trim() }), input, h('span', { text: suffix.trim() })),
    h('p', { class: 'compose-hint', text: t('dare.compose.hint', { max: PROMISE_MAX }) }),
    error,
    h(
      'div',
      { class: 'dare-row' },
      h('button', { class: 'btn btn-small btn-accent', type: 'submit', text: t('dare.compose.make') }),
      h('button', { class: 'btn btn-small', type: 'button', 'data-cancel': '', text: t('dare.compose.cancel') }),
    ),
  );

  const card = h(
    'section',
    { class: `dare card${isFriend ? ' is-friend' : ''}`, 'aria-labelledby': 'dare-line' },
    topBar,
    heroBox,
    stage.wrap,
    h('div', { class: 'dare-actions' }, flyBtn),
    after,
  );
  root.append(h('h1', { class: 'visually-hidden', text: t('site.name') }), card, form);

  // ── Behaviour ───────────────────────────────────────────
  const sentence = () => (isFriend ? friendSentence : `${prefix}${promise}${suffix}`);

  async function fly(): Promise<void> {
    if (stage.busy) return;
    if (flown) resetPig();
    flyBtn.disabled = true;
    flyBtn.textContent = t('dare.flying');
    card.classList.add('is-flying');
    const id = nextSkitId(SKIT_IDS, loadUnlocked(SKIT_IDS), lastSkit);
    const skit = skitById(id) ?? SKITS[0];
    if (!skit) return;
    lastSkit = skit.id;
    const unlocked = unlock(skit.id, SKIT_IDS);
    const done = await stage.play(skit);
    if (signal.aborted) return;
    card.classList.remove('is-flying');
    flyBtn.disabled = false;
    flyBtn.textContent = t(isFriend ? 'dare.friend.check' : 'dare.fly');
    if (!done) return;
    flown = true;
    card.classList.add('is-flown');
    verdict.replaceChildren(
      ...(isFriend ? [t('dare.friend.verdict')] : [t('dare.verdict'), ' ', h('strong', { text: t('dare.yourTurn') })]),
    );
    method.textContent = t('skit.method', { n: methodNumber(skit.id), name: t(skit.nameKey) });
    unlockedLink.textContent = t('dare.unlocked', { n: unlocked.size, total: SKITS.length });
    after.hidden = false;
    flyBtn.hidden = true;
    verdict.focus({ preventScroll: true });
  }

  function resetPig(): void {
    stage.reset({ dropIn: true });
    flown = false;
    card.classList.remove('is-flown', 'is-flying');
    after.hidden = true;
    flyBtn.hidden = false;
  }

  function another(): void {
    const others = presets.filter((p) => p !== promise);
    promise = pick(others.length ? others : presets);
    renderLine();
    resetPig();
    flyBtn.focus({ preventScroll: true });
  }

  function openComposer(): void {
    form.hidden = false;
    error.textContent = '';
    input.value = presets.includes(promise) ? '' : promise;
    updateCounter();
    input.focus();
    form.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  async function share(): Promise<void> {
    const url = hashUrl(`#/?d=${encodeDare(sentence())}`);
    await shareLink(url, t('dare.shareText'));
  }

  flyBtn.addEventListener('click', () => void fly(), { signal });
  anotherBtn.addEventListener('click', another, { signal });
  writeBtn.addEventListener('click', openComposer, { signal });
  shareBtn.addEventListener('click', () => void share(), { signal });
  form.querySelector('[data-cancel]')?.addEventListener('click', () => (form.hidden = true), { signal });
  form.addEventListener(
    'submit',
    (e) => {
      e.preventDefault();
      const res = checkPromise(input.value);
      if (!res.ok) {
        error.textContent = res.reason === 'empty' ? t('dare.compose.empty') : t('dare.compose.hint', { max: PROMISE_MAX });
        input.focus();
        return;
      }
      promise = res.text;
      renderLine();
      resetPig();
      form.hidden = true;
      card.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      void share();
    },
    { signal },
  );
  window.addEventListener(FLY_EVENT, () => void fly(), { signal });

  if (!isFriend && route.query.get('compose') === '1') openComposer();
}
