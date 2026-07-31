const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const {
  normalizeTheme,
  applyTheme,
  toggleTheme,
} = require('../assets/js/reading-theme.js');

function createControl() {
  const label = { textContent: '' };
  const listeners = {};

  return {
    attributes: {},
    label,
    listeners,
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    querySelector(selector) {
      return selector === '[data-reading-theme-label]' ? label : null;
    },
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
  };
}

function runBrowserModule(context) {
  const source = fs.readFileSync(
    path.join(__dirname, '../assets/js/reading-theme.js'),
    'utf8'
  );

  vm.runInNewContext(source, context);
}

test('normalizeTheme accepts light and dark, defaulting invalid values to dark', () => {
  assert.equal(normalizeTheme('light'), 'light');
  assert.equal(normalizeTheme('dark'), 'dark');
  assert.equal(normalizeTheme('sepia'), 'dark');
  assert.equal(normalizeTheme(null), 'dark');
});

test('applyTheme applies light state to the reading surface and control', () => {
  const root = { dataset: {} };
  const control = createControl();

  applyTheme('light', root, control);

  assert.equal(root.dataset.readingTheme, 'light');
  assert.equal(control.attributes['aria-checked'], 'true');
  assert.equal(control.label.textContent, '浅色阅读');
});

test('toggleTheme changes dark to light and ignores storage write failures', () => {
  const root = { dataset: { readingTheme: 'dark' } };
  const control = createControl();
  const writes = [];
  const storage = {
    setItem(key, value) {
      writes.push([key, value]);
    },
  };

  assert.equal(toggleTheme('dark', root, control, storage), 'light');
  assert.deepEqual(writes, [['post-reading-theme', 'light']]);
  assert.equal(root.dataset.readingTheme, 'light');
  assert.doesNotThrow(() => {
    toggleTheme('dark', root, control, {
      setItem() {
        throw new Error('storage unavailable');
      },
    });
  });
});

test('browser script initializes the control and persists click changes', () => {
  const control = createControl();
  const root = { dataset: { readingTheme: 'dark' } };
  const writes = [];
  const context = {
    document: {
      documentElement: root,
      querySelector(selector) {
        return selector === '#readingThemeToggle' ? control : null;
      },
    },
    localStorage: {
      setItem(key, value) {
        writes.push([key, value]);
      },
    },
  };

  runBrowserModule(context);

  assert.equal(typeof control.listeners.click, 'function');
  control.listeners.click();
  assert.equal(root.dataset.readingTheme, 'light');
  assert.deepEqual(writes, [['post-reading-theme', 'light']]);
});

test('browser initialization survives a throwing localStorage getter', () => {
  const control = createControl();
  const root = { dataset: { readingTheme: 'dark' } };
  const context = {
    document: {
      documentElement: root,
      querySelector() {
        return control;
      },
    },
  };

  Object.defineProperty(context, 'localStorage', {
    get() {
      throw new DOMException('Access denied', 'SecurityError');
    },
  });

  assert.doesNotThrow(() => runBrowserModule(context));
  assert.doesNotThrow(() => control.listeners.click());
  assert.equal(root.dataset.readingTheme, 'light');
});
