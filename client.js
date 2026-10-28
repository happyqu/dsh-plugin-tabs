window.__ModuleLoader__.load({
  id: 'dsh-plugin-tabs',
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
        'scroll-left': 'Scroll tabs left',
        'scroll-right': 'Scroll tabs right',
        'tab-actions': 'Tab actions',
        'close-current': 'Close current tab',
        'close-others': 'Close other tabs',
        'close-left': 'Close tabs to the left',
        'close-right': 'Close tabs to the right',
        'close-all': 'Close all tabs',
        untitled: 'New Session',
      },
      zh: {
        'tabs-aria': '会话标签',
        'new-tab': '新建标签（开启新会话）',
        'close-tab': '关闭标签',
        'scroll-left': '向左滚动标签',
        'scroll-right': '向右滚动标签',
        'tab-actions': '标签操作',
        'close-current': '关闭当前标签',
        'close-others': '关闭其他标签',
        'close-left': '关闭左侧标签',
        'close-right': '关闭右侧标签',
        'close-all': '关闭全部标签',
        untitled: '新会话',
      },
    };

    // Reserve a compact row in the center column, below native window chrome.
    // Never transform the app or its fixed controls.
    const STRIP_H = 40;
    const CSS = `
      [data-dst-center]{padding-top:${STRIP_H}px;box-sizing:border-box}
      .dst-root{--dst-surface:var(--dsw-alias-bg-base,#fff);
        --dst-text:var(--dsw-alias-label-primary,#262626);
        --dst-primary:var(--dst-text);
        --dst-muted:var(--dsw-alias-label-secondary,#8c8c8c);
        --dst-raised:var(--dsw-alias-bg-layer-1,#f4f4f5);
        --dst-border:var(--dsw-alias-border-l1,rgb(0 0 0 / 8%));
        --dst-faint:color-mix(in srgb,var(--dst-text) 6%,transparent);
        position:absolute;top:var(--dst-top,0px);left:var(--dst-left,0px);
        width:var(--dst-width,100%);height:${STRIP_H}px;box-sizing:border-box;
        display:flex;align-items:center;gap:6px;padding:0 8px;
        pointer-events:auto;isolation:isolate;-webkit-app-region:no-drag;
        background:var(--dst-surface);
        color:var(--dst-text);font:12px/1.5 -apple-system,BlinkMacSystemFont,'Segoe UI',
        'PingFang SC','Microsoft YaHei','Helvetica Neue',Arial,sans-serif}
      .dst-root::before{content:'';position:absolute;bottom:0;left:0;right:0;
        height:1px;background:var(--dst-border);z-index:-1}
      .dst-root *{box-sizing:border-box}
      .dst-scroll{display:flex;align-items:center;gap:6px;overflow-x:auto;overflow-y:hidden;
        min-width:0;flex:0 1 auto;height:100%;scrollbar-width:none;overscroll-behavior-x:contain}
      .dst-scroll::-webkit-scrollbar{display:none}
      .dst-tab{position:relative;display:flex;align-items:center;gap:7px;flex:0 0 auto;
        width:max-content;min-width:96px;max-width:220px;height:28px;padding:0 8px 0 10px;
        border:1px solid transparent;border-radius:8px;
        cursor:pointer;user-select:none;touch-action:pan-y;
        background:transparent;
        color:var(--dst-muted);font:inherit;
        transition:color .08s,background-color .08s,border-color .08s}
      .dst-tab:hover{color:var(--dst-primary);background:var(--dst-faint)}
      .dst-tab.dst-active,.dst-tab.dst-active:hover{z-index:1;color:var(--dst-primary);
        background:var(--dst-raised);border-color:var(--dst-border)}
      .dst-tab-icon{display:inline-flex;align-items:center;flex:none;color:inherit;opacity:.75}
      .dst-dot{flex:none;width:7px;height:7px;border-radius:50%;
        background:var(--dsw-alias-state-idle-primary,#b4b8bd)}
      .dst-active .dst-dot{background:var(--dsw-alias-brand-primary,#4d6bfe)}
      .dst-active .dst-tab-icon{opacity:1}
      .dst-label{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
        flex:1;min-width:0;font:inherit}
      .dst-rename{flex:1;width:100px;min-width:0;height:22px;font:inherit;color:var(--dst-text);
        background:var(--dst-surface);border:1px solid var(--dst-primary);
        border-radius:4px;padding:0 4px;outline:none;
        box-shadow:0 0 0 2px color-mix(in srgb,var(--dst-text) 8%,transparent)}
      .dst-root button{display:inline-flex;align-items:center;justify-content:center;flex:none;
        border:0;box-shadow:none;background:transparent;color:var(--dst-muted);cursor:pointer;padding:0;
        -webkit-app-region:no-drag;transition:color .08s,background-color .08s,border-color .08s}
      .dst-root .dst-close{width:18px;height:18px;margin-left:2px;border-radius:4px;opacity:0;pointer-events:none}
      .dst-tab:hover .dst-close,.dst-active .dst-close,.dst-tab:focus-within .dst-close{opacity:.8;pointer-events:auto}
      .dst-root .dst-close:hover{color:var(--dst-text);
        background:color-mix(in srgb,var(--dst-text) 10%,transparent)}
      .dst-root .dst-new{width:26px;height:26px;border:0;border-radius:6px;background:transparent}
      .dst-root .dst-new:hover{color:var(--dst-primary);
        background:color-mix(in srgb,var(--dst-text) 8%,transparent)}
      .dst-root svg{display:block;width:14px;height:14px;pointer-events:none}
      .dst-tab-icon svg{width:14px;height:14px}
      .dst-tab:focus-visible,.dst-root button:focus-visible{outline:2px solid var(--dst-primary);outline-offset:-3px}
      .dst-root[data-dst-shadow]{display:none!important}
      .dst-spacer{flex:1 1 auto;min-width:8px}
      .dst-tools{display:flex;align-items:center;gap:2px;flex:none;height:26px;
        padding-left:6px;border-left:1px solid var(--dst-border)}
      .dst-root .dst-tool{width:26px;height:26px;border-radius:6px}
      .dst-root .dst-tool:hover:not(:disabled){color:var(--dst-text);
        background:color-mix(in srgb,var(--dst-text) 7%,transparent)}
      .dst-root button:disabled{opacity:.28;cursor:default}
      .dst-menu-wrap{position:relative;display:flex;align-items:center}
      .dst-menu{position:absolute;right:0;top:calc(100% + 6px);z-index:30;min-width:172px;
        padding:4px;border:1px solid var(--dst-border);border-radius:8px;
        background:var(--dsw-alias-bg-overlay,var(--dst-raised));box-shadow:0 8px 24px #0003}
      .dst-menu[hidden]{display:none}
      .dst-root .dst-menu-item{display:flex;width:100%;justify-content:flex-start;height:30px;
        padding:0 10px;border-radius:5px;font:inherit;color:var(--dst-text);white-space:nowrap}
      .dst-root .dst-menu-item:hover:not(:disabled),.dst-root .dst-menu-item:focus-visible{
        background:color-mix(in srgb,var(--dst-text) 7%,transparent)}
      .dst-menu-separator{height:1px;margin:4px;background:var(--dst-border)}
      @media(max-width:720px){.dst-tab{min-width:84px;max-width:168px;padding-left:8px}
        .dst-tab-icon{display:none}}
      @media(hover:none){.dst-root .dst-close{opacity:.8;pointer-events:auto}}
      @media(prefers-reduced-motion:reduce){.dst-tab,.dst-root button{transition:none}}
    `;

    function icon(kind) {
      return h('svg', { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5,
        strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true },
        h('path', { d: kind === 'close' ? 'M5 5l6 6M11 5l-6 6'
          : kind === 'session' ? 'M3 2.75h10a.75.75 0 0 1 .75.75v7a.75.75 0 0 1-.75.75H7l-3.5 2.5v-2.5H3a.75.75 0 0 1-.75-.75v-7A.75.75 0 0 1 3 2.75ZM5 6h6M5 8.5h4'
          : kind === 'left' ? 'M10 4 6 8l4 4'
          : kind === 'right' ? 'M6 4l4 4-4 4'
          : kind === 'menu' ? 'M3 7.5h.01M8 7.5h.01M13 7.5h.01'
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
      return closeTabs([sessionId]);
    }
    function closeTabs(sessionIds) {
      const removed = new Set(sessionIds);
      const idx = find(state.active);
      const tabs = state.tabs.filter((t) => !removed.has(t.sessionId));
      if (tabs.length === state.tabs.length) return;
      let active = state.active;
      let navigate;
      if (removed.has(active)) {
        const next = state.tabs.slice(idx + 1).find((tab) => !removed.has(tab.sessionId)) || tabs[tabs.length - 1];
        active = next ? next.sessionId : undefined;
        navigate = active;
      }
      set({ tabs, active });
      return navigate;
    }

    function afterClose(uiWorkspace, navigate) {
      if (navigate) goto(uiWorkspace, navigate);
      else if (!state.tabs.length && uiWorkspace) {
        pendingNav = undefined;
        try { uiWorkspace.startSession(); }
        catch (error) { console.error('startSession failed', error); }
      }
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
        const scrollRef = React.useRef(null);
        const menuRef = React.useRef(null);
        const menuButtonRef = React.useRef(null);
        const [menuOpen, setMenuOpen] = React.useState(false);
        const [scrollEdges, setScrollEdges] = React.useState({ left: false, right: false });

        React.useEffect(() => {
          const scroller = scrollRef.current;
          if (!scroller) return;
          function update() {
            const left = scroller.scrollLeft > 1;
            const right = scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
            setScrollEdges((prev) => prev.left === left && prev.right === right ? prev : { left, right });
          }
          const observer = new ResizeObserver(update);
          observer.observe(scroller);
          Array.from(scroller.children).forEach((tab) => observer.observe(tab));
          scroller.addEventListener('scroll', update, { passive: true });
          update();
          return () => { observer.disconnect(); scroller.removeEventListener('scroll', update); };
        }, [s.tabs]);

        React.useEffect(() => {
          if (!menuOpen) return;
          menuRef.current?.querySelector('button:not(:disabled)')?.focus();
          function outside(e) {
            if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
          }
          function escape(e) {
            if (e.key !== 'Escape') return;
            e.preventDefault();
            setMenuOpen(false);
            menuButtonRef.current?.focus();
          }
          document.addEventListener('pointerdown', outside);
          document.addEventListener('keydown', escape);
          return () => {
            document.removeEventListener('pointerdown', outside);
            document.removeEventListener('keydown', escape);
          };
        }, [menuOpen]);

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
          // The strip owns the top of the center column. The frame class name
          // is host-internal, so match on its suffix and fall back to the whole
          // frame instead of hiding the strip when the lookup fails.
          const center = frame && Array.from(frame.children).find((el) =>
            Array.from(el.classList).some((name) => name.endsWith('_centerCol')));
          const host = center || frame;
          const root = document.getElementById('root');
          if (root && root.style.transform && root.style.height === 'calc(100vh - ' + STRIP_H + 'px)') {
            root.style.removeProperty('transform');
            root.style.removeProperty('height');
          }
          // Retire a strip left behind by an earlier load of this plugin.
          Array.prototype.forEach.call(document.querySelectorAll('.dst-root'), (n) => {
            if (n !== node) n.setAttribute('data-dst-shadow', '');
          });
          let sync = () => {};
          if (host) {
            host.setAttribute('data-dst-center', '');
            sync = () => {
              node.style.setProperty('--dst-left', host.offsetLeft + 'px');
              node.style.setProperty('--dst-top', host.offsetTop + 'px');
              node.style.setProperty('--dst-width', host.offsetWidth + 'px');
            };
            sync();
          }
          const observer = new ResizeObserver(sync);
          if (frame) observer.observe(frame);
          if (host) observer.observe(host);
          window.addEventListener('resize', sync);
          return () => {
            observer.disconnect();
            window.removeEventListener('resize', sync);
            if (host) host.removeAttribute('data-dst-center');
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
                afterClose(uiWorkspace, go);
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
              left += startCenters.find((c) => c.sessionId === id).el.offsetWidth + 6;
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

        function scrollTabs(direction) {
          const scroller = scrollRef.current;
          if (scroller) scroller.scrollBy({ left: direction * Math.max(100, scroller.clientWidth * .8), behavior: 'auto' });
        }
        const activeIndex = s.tabs.findIndex((tab) => tab.sessionId === s.active);
        const menuItems = [
          ['close-current', s.tabs.filter((tab) => tab.sessionId === s.active)],
          ['close-others', activeIndex < 0 ? [] : s.tabs.filter((tab) => tab.sessionId !== s.active)],
          ['close-left', activeIndex < 0 ? [] : s.tabs.slice(0, activeIndex)],
          ['close-right', activeIndex < 0 ? [] : s.tabs.slice(activeIndex + 1)],
          ['close-all', s.tabs],
        ];

        return h(
          'div',
          { className: 'dst-root', role: 'tablist', 'aria-label': t('tabs-aria'), ref: stripRef },
          h('style', null, CSS),
          h(
            'div',
            { className: 'dst-scroll', ref: scrollRef },
            s.tabs.map((tab) => {
              const active = tab.sessionId === s.active;
              const fullTitle = tab.title || t('untitled');
              const label = fullTitle.replace(/\s+[—–-]\s+DeepSeek Harness$/, '').replace(/^https?:\/\/(?:www\.)?/, '');
              return h(
                'div',
                {
                  key: tab.sessionId,
                  className: 'dst-tab' + (active ? ' dst-active' : ''),
                  'data-sid': tab.sessionId,
                  role: 'tab',
                  'aria-selected': active,
                  title: fullTitle,
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
                      afterClose(uiWorkspace, go);
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
                  : [h('span', { key: 'dot', className: 'dst-dot', 'aria-hidden': true }), h('span', { key: 'label', className: 'dst-label' }, label)],
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
                      afterClose(uiWorkspace, go);
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
            ),
          h('div', { className: 'dst-spacer' }),
          h('div', { className: 'dst-tools' },
            h('button', { className: 'dst-tool dst-scroll-left', type: 'button',
              title: t('scroll-left'), 'aria-label': t('scroll-left'), disabled: !scrollEdges.left,
              onClick: () => scrollTabs(-1) }, icon('left')),
            h('button', { className: 'dst-tool dst-scroll-right', type: 'button',
              title: t('scroll-right'), 'aria-label': t('scroll-right'), disabled: !scrollEdges.right,
              onClick: () => scrollTabs(1) }, icon('right')),
            h('div', { className: 'dst-menu-wrap', ref: menuRef,
              onBlur: (e) => { if (!e.currentTarget.contains(e.relatedTarget)) setMenuOpen(false); } },
              h('button', { className: 'dst-tool dst-menu-trigger', type: 'button', ref: menuButtonRef,
                title: t('tab-actions'), 'aria-label': t('tab-actions'), 'aria-haspopup': 'menu', 'aria-expanded': menuOpen,
                onClick: () => setMenuOpen(!menuOpen),
                onKeyDown: (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setMenuOpen(true); } }
              }, icon('menu')),
              h('div', { className: 'dst-menu', role: 'menu', 'aria-label': t('tab-actions'), hidden: !menuOpen,
                onKeyDown: (e) => {
                  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
                  e.preventDefault();
                  const items = Array.from(e.currentTarget.querySelectorAll('button:not(:disabled)'));
                  if (!items.length) return;
                  const current = items.indexOf(document.activeElement);
                  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1
                    : (current + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
                  items[next].focus();
                }
              }, menuItems.map(([action, tabs]) => h(React.Fragment, { key: action },
                action === 'close-all' ? h('div', { className: 'dst-menu-separator', role: 'separator' }) : null,
                h('button', { className: 'dst-menu-item', type: 'button', role: 'menuitem',
                  disabled: !tabs.length, tabIndex: -1, 'data-action': action,
                  onClick: () => {
                    if (!tabs.length) return;
                    setMenuOpen(false);
                    afterClose(uiWorkspace, closeTabs(tabs.map((tab) => tab.sessionId)));
                    menuButtonRef.current?.focus();
                  }
                }, t(action))
              )))
            )
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
