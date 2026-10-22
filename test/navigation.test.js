import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8');

// Exercise the plugin's actual event handlers against the host navigation contract.
function mount({ fail = false } = {}) {
  const effects = [], views = {}, events = {}, opened = [], panels = [], errors = [];
  let stored = JSON.stringify({
    tabs: ['a', 'b', 'c'].map(sessionId => ({ sessionId, title: sessionId })), active: 'b',
  });
  let visibleSession = 'b';
  const React = {
    Component: class {},
    createElement: (type, props, ...children) => ({ type, props: props || {}, children }),
    useSyncExternalStore: (_subscribe, get) => get(),
    useRef: value => ({ current: value }),
    useState: value => [value, () => {}],
    useEffect: fn => effects.push(fn),
  };
  const ctx = {
    uiWorkspace: {
      openSession(target) {
        // Normal sessions use strings; objects belong to subagent navigation.
        assert.equal(typeof target, 'string');
        if (fail) throw new Error('Session unavailable');
        opened.push(target);
        visibleSession = target;
        ctx.layout.selectPanel(null);
      },
    },
    layout: { selectPanel: id => panels.push(id) },
    locale: { bind: () => key => key, register: () => () => {} },
    effect: fn => fn(),
    slots: {
      inject: (_name, register) => register(),
      register: ({ name }, view) => { views[name] = view; return () => {}; },
    },
  };
  const window = {
    __ModuleLoader__: { load: ({ factory }) => factory(() => React).apply(ctx) },
    addEventListener: (name, fn) => { events[name] = fn; },
    removeEventListener: () => {},
  };
  runInNewContext(source, {
    window, localStorage: { getItem: () => stored, setItem: (_key, value) => { stored = value; } },
    console: { error: (...args) => errors.push(args) },
  });
  const tree = views['shell.overlay']({});
  for (const effect of effects) effect();
  function nodes(node, className) {
    if (!node || typeof node !== 'object') return [];
    if (Array.isArray(node)) return node.flatMap(child => nodes(child, className));
    return [ ...(node.props.className?.split(' ').includes(className) ? [node] : []),
      ...node.children.flatMap(child => nodes(child, className)) ];
  }
  return {
    tabs: nodes(tree, 'dst-tab'), opened, panels, errors,
    active: () => JSON.parse(stored).active,
    visible: () => visibleSession,
    key: key => events.keydown({ key, ctrlKey: true, preventDefault() {} }),
  };
}

test('click opens the target session and leaves the host conversation visible', () => {
  const app = mount();
  app.tabs[0].props.onClick();
  assert.deepEqual(app.opened, ['a']);
  assert.equal(app.visible(), 'a');
  assert.equal(app.active(), 'a');
  assert.deepEqual(app.panels, [null]);
});

test('closing the active tab opens its neighbour', () => {
  const app = mount();
  app.tabs[1].children.at(-1).props.onClick({ stopPropagation() {} });
  assert.deepEqual(app.opened, ['c']);
  assert.equal(app.visible(), 'c');
  assert.equal(app.active(), 'c');
});

test('keyboard switching and closing use the same session navigation', () => {
  const app = mount();
  app.key('Tab');
  app.key('1');
  app.key('w');
  assert.deepEqual(app.opened, ['c', 'a', 'b']);
  assert.equal(app.visible(), 'b');
  assert.deepEqual(app.panels, [null, null, null]);
});

test('failed navigation keeps the previous tab active', () => {
  const app = mount({ fail: true });
  app.tabs[0].props.onClick();
  assert.equal(app.active(), 'b');
  assert.equal(app.visible(), 'b');
  assert.equal(app.errors.length, 1);
});
