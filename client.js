window.__ModuleLoader__.load({
  id: '@local/dsh-session-tabs',
  factory(require) {
    const React = require('react');
    const h = React.createElement;

    const NS = 'sessionTabs';
    const STORE_KEY = 'dsh-session-tabs:v2';
    const NAV_TIMEOUT_MS = 4000;
    const SEED_LIMIT = 3;

    const DICTS = {
      en: {
        'tabs-aria': 'Session tabs',
        'new-tab': 'New tab (opens a fresh session)',
        'close-tab': 'Close tab',
        untitled: 'New Session',
      },
      zh: {
        'tabs-aria': '会话标签',
        'new-tab': '新建标签（开启新会话）',
        'close-tab': '关闭标签',
        untitled: '新会话',
      },
    };

    // The strip belongs to the center column, below native window chrome.
    // Reserve space in that column rather than transforming the app root:
    // transforms change the containing block of every fixed host control.
    const STRIP_H = 36;
    const CSS = `
      [data-dst-center]{padding-top:${STRIP_H}px;box-sizing:border-box}
      .dst-root{--dst-surface:var(--dsw-alias-bg-base,#fff);
        --dst-text:var(--dsw-alias-label-primary,#262626);
        --dst-primary:var(--dst-text);
        --dst-muted:var(--dsw-alias-label-secondary,#8c8c8c);
        --dst-border:color-mix(in srgb,var(--dst-text) 12%,var(--dst-surface));
        position:absolute;top:var(--dst-top,0px);left:var(--dst-left,0px);
        width:var(--dst-width,100%);height:${STRIP_H}px;box-sizing:border-box;
        display:flex;align-items:flex-end;gap:6px;padding:4px 10px 0;
        pointer-events:auto;isolation:isolate;-webkit-app-region:no-drag;
        background:color-mix(in srgb,var(--dst-text) 3%,var(--dst-surface));
        color:var(--dst-text);font:12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',
        'PingFang SC','Microsoft YaHei','Helvetica Neue',Arial,sans-serif}
      .dst-root::before{content:'';position:absolute;bottom:0;left:0;right:0;
        height:1px;background:var(--dst-border);z-index:-1}
      .dst-root *{box-sizing:border-box}
      .dst-scroll{display:flex;align-items:flex-end;gap:4px;overflow-x:auto;overflow-y:hidden;
        min-width:0;flex:0 1 auto;height:100%;scrollbar-width:none;overscroll-behavior-x:contain}
      .dst-scroll::-webkit-scrollbar{display:none}
      .dst-tab{position:relative;display:flex;align-items:center;gap:6px;flex:0 0 auto;
        min-width:104px;max-width:216px;height:32px;padding:0 8px 0 10px;
        border:1px solid var(--dst-border);border-radius:4px 4px 0 0;
        cursor:pointer;user-select:none;touch-action:pan-y;
        background:color-mix(in srgb,var(--dst-text) 2%,var(--dst-surface));
        color:var(--dst-muted);font:inherit;
        transition:color .18s,background-color .18s,border-color .18s}
      .dst-tab:hover{color:var(--dst-primary);background:var(--dst-surface)}
      .dst-tab.dst-active{color:var(--dst-primary);background:var(--dst-surface);
        border-bottom-color:var(--dst-surface)}
      .dst-tab-icon{display:inline-flex;align-items:center;flex:none;color:inherit;opacity:.75}
      .dst-active .dst-tab-icon{opacity:1}
      .dst-label{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        flex:1;min-width:0;font:inherit}
      .dst-rename{flex:1;width:100px;min-width:0;height:22px;font:inherit;color:var(--dst-text);
        background:var(--dst-surface);border:1px solid var(--dst-primary);
        border-radius:4px;padding:0 4px;outline:none;
        box-shadow:0 0 0 2px color-mix(in srgb,var(--dst-text) 8%,transparent)}
      .dst-root button{display:inline-flex;align-items:center;justify-content:center;flex:none;
        border:0;box-shadow:none;background:transparent;color:var(--dst-muted);cursor:pointer;padding:0;
        -webkit-app-region:no-drag;transition:color .18s,background-color .18s,border-color .18s}
      .dst-root .dst-close{width:18px;height:18px;margin-left:2px;border-radius:3px;opacity:.6}
      .dst-tab:hover .dst-close,.dst-active .dst-close,.dst-tab:focus-within .dst-close{opacity:1}
      .dst-root .dst-close:hover{color:var(--dst-text);
        background:color-mix(in srgb,var(--dst-text) 8%,transparent)}
      .dst-root .dst-new{width:32px;height:32px;border:1px dashed var(--dst-border);
        border-radius:4px 4px 0 0;background:color-mix(in srgb,var(--dst-text) 2%,var(--dst-surface))}
      .dst-root .dst-new:hover{color:var(--dst-primary);border-color:var(--dst-primary);
        background:var(--dst-surface)}
      .dst-root svg{display:block;width:14px;height:14px;pointer-events:none}
      .dst-tab-icon svg{width:14px;height:14px}
      .dst-tab:focus-visible,.dst-root button:focus-visible{outline:2px solid var(--dst-primary);outline-offset:-4px}
      .dst-root[data-dst-shadow]{display:none!important}
      @media(max-width:720px){.dst-tab{min-width:96px;max-width:180px;padding-left:8px}
        .dst-root{padding-left:8px;padding-right:8px;gap:6px}}
      @media(prefers-reduced-motion:reduce){.dst-tab,.dst-root button{transition:none}}
    `;

    function icon(kind) {
      return h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: kind === 'close' ? 'M5 5l6 6M11 5l-6 6'
          : kind === 'session' ? 'M3 2.75h10a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-.75.75H7l-3.5 2.5v-2.5H3a.75.75 0 0 1-.75-.75v-7A.75.75 0 0 1 3 2.75ZM5 6h6M5 8.5h4'
          : 'M8 3v10M3 8h10' }));
    }

    // ---------- plugin-local store, browser-persisted ----------
    function loadState() {
      try {
        const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
        if (parsed && Array.isArray(parsed.tabs)) {
          return {
            tabs: parsed.tabs
              .filter((t) => t && typeof t.sessionId === 'string')
              .map((t) => ({
                sessionId: t.sessionId,
                title: typeof t.title === 'string' && t.title ? t.title : undefined,
              })),
            active: typeof parsed.active === 'string' ? parsed.active : undefined,
          };
        }
      } catch (e) {}
      return { tabs: [], active: undefined };
    }

    let state = loadState();
    let pendingNav; // { sessionId, at }
    let seeded = false;
    const listeners = new Set();

    function set(next) {
      state = next;
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify({ tabs: state.tabs, active: state.active }));
      } catch (e) {}
      for (const fn of Array.from(listeners)) fn();
    }
    function subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
    function useStore() {
      return React.useSyncExternalStore(subscribe, () => state, () => state);
    }

    function find(sessionId) {
      return state.tabs.findIndex((t) => t.sessionId === sessionId);
    }
    function addTab(sessionId, title, activate) {
      if (!sessionId) return;
      const idx = find(sessionId);
      let tabs = state.tabs;
      let changed = false;
      if (idx < 0) {
        tabs = [...tabs, { sessionId, title }];
        changed = true;
      } else if (title && tabs[idx].title !== title) {
        tabs = tabs.slice();
        tabs[idx] = { sessionId, title };
        changed = true;
      }
      const active = activate || !state.active ? sessionId : state.active;
      if (active !== state.active) changed = true;
      if (changed) set({ tabs, active });
    }
    function setActive(sessionId) {
      if (state.active !== sessionId) set({ ...state, active: sessionId });
    }
    function moveTab(from, to) {
      if (from === to || from < 0 || to < 0 || from >= state.tabs.length || to >= state.tabs.length) return;
      const tabs = state.tabs.slice();
      const [tab] = tabs.splice(from, 1);
      tabs.splice(to, 0, tab);
      set({ tabs, active: state.active });
    }
    function closeTab(sessionId) {
      const idx = find(sessionId);
      if (idx < 0) return undefined;
      const tabs = state.tabs.filter((t) => t.sessionId !== sessionId);
      let active = state.active;
      let navigate;
      if (active === sessionId) {
        const next = tabs[idx] || tabs[idx - 1];
        active = next ? next.sessionId : undefined;
        navigate = active;
      }
      set({ tabs, active });
      return navigate;
    }

    function goto(uiWorkspace, sessionId) {
      if (!uiWorkspace || !sessionId) return;
      pendingNav = { sessionId, at: Date.now() };
      try {
        // A string selects a normal session; object targets are subagent addresses.
        // openSession also reveals the conversation with layout.selectPanel(null).
        uiWorkspace.openSession(sessionId);
        setActive(sessionId);
      } catch (e) {
        pendingNav = undefined;
        console.error('openSession failed', e);
      }
    }

    // ---------- error boundary: a plugin failure must never blank host UI ----
    class Boundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { failed: false };
      }
      static getDerivedStateFromError() {
        return { failed: true };
      }
      componentDidCatch(error) {
        console.error('session-tabs entry crashed:', error);
      }
      render() {
        return this.state.failed ? null : this.props.children;
      }
    }
    function guarded(view) {
      return function Guarded(props) {
        return h(Boundary, null, view(props));
      };
    }

    // ---------- title source: plain slot props + one guarded async roster --
    function makeTitles(ctx) {
      const cache = new Map();
      let inflight = null;
      function pickRows(value) {
        if (Array.isArray(value)) return value;
        if (value && typeof value === 'object') {
          const rows = value.items || value.sessions || value.rows || value.list;
          if (Array.isArray(rows)) return rows;
        }
        return null;
      }
      function absorb(rows) {
        const out = [];
        for (const row of rows || []) {
          const id = row && (row.id || row.sessionId);
          const title = row && (row.title || row.displayTitle);
          if (typeof id === 'string') {
            if (typeof title === 'string' && title.trim()) cache.set(id, title.trim());
            out.push({ sessionId: id, title: typeof title === 'string' && title.trim() ? title.trim() : undefined });
          }
        }
        return out;
      }
      async function viaRemote() {
        const remote = ctx.get && ctx.get('remote');
        const list = remote && remote.session && typeof remote.session.list === 'function' ? remote.session.list : null;
        if (!list) return null;
        return absorb(pickRows(await list.call(remote.session, {})));
      }
      async function viaSessions() {
        const sessions = ctx.get && ctx.get('sessions');
        if (!sessions || typeof sessions.search !== 'function') return null;
        const ac = new AbortController();
        const result = await sessions.search('', ac.signal);
        return absorb(pickRows(result && (result.items || result)));
      }
      function load() {
        if (!inflight) {
          inflight = viaRemote()
            .catch(() => viaSessions().catch(() => null))
            .then((rows) => {
              inflight = null;
              return rows;
            });
        }
        return inflight;
      }
      return { load, get: (id) => cache.get(id) };
    }

    // ---------- invisible probe: plain props only, no foreign hooks -------
    function makeProbe(deps) {
      const { titles } = deps;
      return function Probe(props) {
        const sessionId = (props && (props.sessionId || (props.session && props.session.id))) || undefined;
        let title = (props && (props.displayTitle || (props.session && props.session.title))) || undefined;
        if (!title && sessionId) title = titles.get(sessionId);
        if (title && !title.trim()) title = undefined;

        React.useEffect(() => {
          if (!sessionId) return;
          if (pendingNav) {
            if (pendingNav.sessionId === sessionId || Date.now() - pendingNav.at > NAV_TIMEOUT_MS) pendingNav = undefined;
            else return;
          }
          if (find(sessionId) < 0) addTab(sessionId, title, true);
          else {
            setActive(sessionId);
            if (title) addTab(sessionId, title, false);
          }
          if (!title) {
            // The shell writes the selected Session's title to document.title
            // (layout presenter). It is the one title source that is always
            // present, so capture it for whichever Session is active now.
            const docTitle = String(document.title || '').trim();
            if (docTitle && docTitle !== 'DeepSeek Harness' && find(sessionId) >= 0) {
              addTab(sessionId, docTitle, false);
            } else {
              titles
                .load()
                .then((rows) => {
                  const t2 = titles.get(sessionId);
                  if (t2 && find(sessionId) >= 0) addTab(sessionId, t2, false);
                  if (!seeded && rows && rows.length) {
                    seeded = true;
                    if (!state.tabs.length) {
                      const tabs = rows.slice(0, SEED_LIMIT).map((r) => ({ sessionId: r.sessionId, title: r.title }));
                      if (find(sessionId) < 0 && tabs.length < SEED_LIMIT) tabs.push({ sessionId, title: t2 });
                      set({ tabs, active: sessionId });
                    }
                  }
                })
                .catch(() => {});
            }
          }
        }, [sessionId, title]);
        return null;
      };
    }

    // ---------- tab strip ----------
    function makeStrip(deps) {
      const { t, uiWorkspace } = deps;
      return function TabStrip() {
        const s = useStore();
        const stripRef = React.useRef(null);
        const dragRef = React.useRef(null);
        const [renaming, setRenaming] = React.useState(null);
        const renameRef = React.useRef(null);

        React.useEffect(() => {
          if (renaming && renameRef.current) {
            renameRef.current.focus();
            renameRef.current.select();
          }
        }, [renaming]);

        React.useEffect(() => {
          const node = stripRef.current;
          if (!node) return;
          const overlay = node.closest('[data-shell-overlay]');
          const frame = overlay && overlay.parentElement;
          const center = frame && Array.from(frame.children).find((el) =>
            Array.from(el.classList).some((name) => name.endsWith('_centerCol')));
          if (!center) {
            node.setAttribute('data-dst-shadow', '');
            console.error('session-tabs: center column was not found');
            return;
          }
          // Retire the previous generation before installing new layout ownership.
          const previous = window.__dshSessionTabsLayout;
          if (previous) previous.dispose();
          const root = document.getElementById('root');
          if (root && root.style.transform === 'translateY(36px)' && root.style.height === 'calc(100vh - 36px)') {
            root.style.removeProperty('transform');
            root.style.removeProperty('height');
          }
          Array.prototype.forEach.call(document.querySelectorAll('.dst-root'), (n) => {
            if (n !== node) n.setAttribute('data-dst-shadow', '');
          });
          center.setAttribute('data-dst-center', '');
          function sync() {
            node.style.setProperty('--dst-left', center.offsetLeft + 'px');
            node.style.setProperty('--dst-top', center.offsetTop + 'px');
            node.style.setProperty('--dst-width', center.offsetWidth + 'px');
          }
          sync();
          const observer = new ResizeObserver(sync);
          observer.observe(frame);
          observer.observe(center);
          window.addEventListener('resize', sync);
          const owner = { dispose() {
            observer.disconnect();
            window.removeEventListener('resize', sync);
            center.removeAttribute('data-dst-center');
          } };
          window.__dshSessionTabsLayout = owner;
          return () => {
            if (window.__dshSessionTabsLayout !== owner) return;
            owner.dispose();
            delete window.__dshSessionTabsLayout;
          };
        }, []);

        React.useEffect(() => {
          const node = stripRef.current;
          const active = node && Array.from(node.querySelectorAll('.dst-tab')).find((el) => el.dataset.sid === s.active);
          if (!active) return;
          const scroller = active.parentElement;
          const left = active.offsetLeft - scroller.offsetLeft;
          if (left < scroller.scrollLeft) scroller.scrollLeft = left;
          else if (left + active.offsetWidth > scroller.scrollLeft + scroller.clientWidth) {
            scroller.scrollLeft = left + active.offsetWidth - scroller.clientWidth;
          }
        }, [s.active, s.tabs.length]);

        React.useEffect(() => {
          function onKey(e) {
            try {
              const el = e.target;
              if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
              if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
              const tabs = state.tabs;
              if (!tabs.length) return;
              const idx = Math.max(0, find(state.active));
              if (e.key === 'Tab') {
                if (tabs.length < 2) return;
                e.preventDefault();
                const next = tabs[(idx + (e.shiftKey ? -1 : 1) + tabs.length) % tabs.length];
                goto(uiWorkspace, next.sessionId);
              } else if (e.key === 'w' || e.key === 'W') {
                if (!state.active) return;
                e.preventDefault();
                const go = closeTab(state.active);
                if (go) goto(uiWorkspace, go);
              } else if (/^[1-9]$/.test(e.key)) {
                const tab = tabs[Number(e.key) - 1];
                if (!tab) return;
                e.preventDefault();
                goto(uiWorkspace, tab.sessionId);
              }
            } catch (err) {
              console.error('session-tabs shortcut failed', err);
            }
          }
          window.addEventListener('keydown', onKey);
          return () => window.removeEventListener('keydown', onKey);
        }, []);

        function centerX(el) {
          const r = el.getBoundingClientRect();
          return r.left + r.width / 2;
        }

        function onPointerDown(e) {
          if (e.button !== 0 || !stripRef.current || e.target.closest('input,button')) return;
          const own = e.currentTarget;
          const startX = e.clientX;
          const startCenters = Array.from(stripRef.current.querySelectorAll('.dst-tab')).map((el) => ({
            el,
            sessionId: el.dataset.sid,
          }));
          const rec = { sessionId: own.dataset.sid, moved: false, startX, lastX: startX, startCenters };
          dragRef.current = rec;

          function move(ev) {
            rec.lastX = ev.clientX;
            if (!rec.moved && Math.abs(ev.clientX - startX) < 5) return;
            rec.moved = true;
            own.style.zIndex = '5';
            own.style.transform = 'translateX(' + (ev.clientX - startX) + 'px)';
            const order = startCenters.map((c) => c.sessionId).filter((id) => id !== rec.sessionId);
            let to = 0;
            for (const c of startCenters) {
              if (c.sessionId === rec.sessionId) continue;
              if (centerX(c.el) < ev.clientX) to++;
            }
            order.splice(to, 0, rec.sessionId);
            const positions = new Map();
            let left = startCenters[0].el.offsetLeft;
            for (const id of order) {
              positions.set(id, left);
              left += startCenters.find((c) => c.sessionId === id).el.offsetWidth + 4;
            }
            for (const c of startCenters) {
              if (c.sessionId === rec.sessionId) continue;
              c.el.style.transform = 'translateX(' + (positions.get(c.sessionId) - c.el.offsetLeft) + 'px)';
            }
          }
          function up() {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            dragRef.current = null;
            own.style.zIndex = '';
            for (const c of startCenters) c.el.style.transform = '';
            if (!rec.moved) return;
            const from = find(rec.sessionId);
            if (from < 0) return;
            let to = 0;
            for (const c of startCenters) {
              if (c.sessionId === rec.sessionId) continue;
              if (centerX(c.el) < rec.lastX) to++;
            }
            moveTab(from, to);
          }
          window.addEventListener('pointermove', move);
          window.addEventListener('pointerup', up);
        }

        function onClickTab(sessionId) {
          if (dragRef.current) return;
          goto(uiWorkspace, sessionId);
        }
        function commitRename(sessionId, value) {
          setRenaming(null);
          const title = (value || '').trim();
          if (!title) return;
          addTab(sessionId, title, false);
        }
        function newTab() {
          if (!uiWorkspace) return;
          try {
            uiWorkspace.startSession();
          } catch (e) {
            console.error('startSession failed', e);
          }
        }

        return h(
          'div',
          { className: 'dst-root', role: 'tablist', 'aria-label': t('tabs-aria'), ref: stripRef },
          h('style', null, CSS),
          h(
            'div',
            { className: 'dst-scroll' },
            s.tabs.map((tab) => {
              const active = tab.sessionId === s.active;
              const label = tab.title || t('untitled');
              return h(
                'div',
                {
                  key: tab.sessionId,
                  className: 'dst-tab' + (active ? ' dst-active' : ''),
                  'data-sid': tab.sessionId,
                  role: 'tab',
                  'aria-selected': active,
                  title: label,
                  tabIndex: active ? 0 : -1,
                  onKeyDown: (e) => {
                    if (e.target !== e.currentTarget) return;
                    let index = find(tab.sessionId);
                    if (e.key === 'ArrowRight') index = (index + 1) % s.tabs.length;
                    else if (e.key === 'ArrowLeft') index = (index - 1 + s.tabs.length) % s.tabs.length;
                    else if (e.key === 'Home') index = 0;
                    else if (e.key === 'End') index = s.tabs.length - 1;
                    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClickTab(tab.sessionId); return; }
                    else return;
                    e.preventDefault();
                    onClickTab(s.tabs[index].sessionId);
                    stripRef.current.querySelectorAll('.dst-tab')[index].focus();
                  },
                  onPointerDown: onPointerDown,
                  onClick: () => onClickTab(tab.sessionId),
                  onAuxClick: (e) => {
                    if (e.button === 1) {
                      const go = closeTab(tab.sessionId);
                      if (go) goto(uiWorkspace, go);
                    }
                  },
                  onDoubleClick: () => setRenaming(tab.sessionId),
                },
                renaming === tab.sessionId
                  ? h('input', {
                      className: 'dst-rename',
                      defaultValue: tab.title || '',
                      ref: renameRef,
                      onBlur: (e) => commitRename(tab.sessionId, e.target.value),
                      onKeyDown: (e) => {
                        if (e.key === 'Enter') e.currentTarget.blur();
                        else if (e.key === 'Escape') {
                          e.currentTarget.value = tab.title || '';
                          e.currentTarget.blur();
                        }
                        e.stopPropagation();
                      },
                    })
                  : [h('span', { key: 'icon', className: 'dst-tab-icon', 'aria-hidden': true }, icon('session')), h('span', { key: 'label', className: 'dst-label' }, label)],
                h(
                  'button',
                  {
                    className: 'dst-close',
                    type: 'button',
                    'aria-label': t('close-tab'),
                    tabIndex: -1,
                    onPointerDown: (e) => e.stopPropagation(),
                    onClick: (e) => {
                      e.stopPropagation();
                      const go = closeTab(tab.sessionId);
                      if (go) goto(uiWorkspace, go);
                    },
                  },
                  icon('close')
                )
              );
            })
          ),
            h(
              'button',
              {
                className: 'dst-new',
                type: 'button',
                'aria-label': t('new-tab'),
                title: t('new-tab'),
                onClick: newTab,
              },
              icon('new')
            )
        );
      };
    }

    return {
      inject: ['slots', 'locale', 'uiWorkspace'],
      apply(ctx) {
        const uiWorkspace = ctx.uiWorkspace;
        const t = ctx.locale.bind(NS);
        const titles = makeTitles(ctx);

        ctx.effect(() => ctx.locale.register(NS, DICTS), 'session-tabs: locale');

        ctx.effect(() => {
          const registerStrip = () => {
            const view = guarded(makeStrip({ t, uiWorkspace }));
            return ctx.slots.register({ name: 'shell.overlay', id: 'session-tabs', order: 5 }, view);
          };
          const strip = ctx.slots.inject('shell.overlay', registerStrip);
          const probe = ctx.slots.inject('conversation.input.dock', () =>
            ctx.slots.register({ name: 'conversation.input.dock', id: 'session-tabs.probe', order: 9999 }, guarded(makeProbe({ titles })))
          );
          return () => {
            strip();
            probe();
          };
        }, 'session-tabs: slots');
      },
    };
  },
});
