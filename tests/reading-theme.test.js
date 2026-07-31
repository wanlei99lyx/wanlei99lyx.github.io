const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normalizeTheme,
  applyTheme,
  toggleTheme,
} = require('../assets/js/reading-theme.js');

function createControl() {
  const label = { textContent: '' };

  return {
    attributes: {},
    label,
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    querySelector(selector) {
      return selector === '[data-reading-theme-label]' ? label : null;
    },
  };
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
