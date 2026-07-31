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

const defaultLayout = fs.readFileSync(
  path.join(__dirname, '../_layouts/default.html'),
  'utf8'
);
const postLayout = fs.readFileSync(
  path.join(__dirname, '../_layouts/post.html'),
  'utf8'
);

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

test('post layout exposes an accessible reading theme control and script', () => {
  assert.match(postLayout, /<button[^>]*\bid="readingThemeToggle"[^>]*>/);
  assert.match(postLayout, /<button[^>]*\brole="switch"[^>]*>/);
  assert.match(postLayout, /<button[^>]*\baria-checked="false"[^>]*>/);
  assert.match(postLayout, /data-reading-theme-label/);
  assert.match(postLayout, /assets\/js\/reading-theme\.js/);
});

test('default layout bootstraps post reading theme before the main stylesheet', () => {
  const bootstrapIndex = defaultLayout.indexOf('post-reading-theme');
  const stylesheetIndex = defaultLayout.indexOf("'/assets/css/main.css'");
  const postScopeStart = defaultLayout.lastIndexOf(
    "{% if page.layout == 'post' %}",
    bootstrapIndex
  );
  const postScopeEnd = defaultLayout.indexOf('{% endif %}', bootstrapIndex);

  assert.notEqual(bootstrapIndex, -1);
  assert.ok(bootstrapIndex < stylesheetIndex);
  assert.notEqual(postScopeStart, -1);
  assert.ok(postScopeStart < bootstrapIndex && bootstrapIndex < postScopeEnd);
});

test('post reading surface wraps article chrome but excludes comments', () => {
  const wrappers = postLayout.match(/class="post-reading-surface"/g) || [];
  const surfaceStart = postLayout.indexOf('class="post-reading-surface"');
  const headerIndex = postLayout.indexOf('class="post-header"');
  const layoutIndex = postLayout.indexOf('class="post-layout-with-toc"');
  const footerIndex = postLayout.indexOf('class="post-footer"');
  const commentsIndex = postLayout.indexOf('class="post-comments"');
  const surfaceMarkup = postLayout.slice(surfaceStart, commentsIndex);

  assert.equal(wrappers.length, 1);
  assert.ok(surfaceStart < headerIndex);
  assert.ok(surfaceStart < layoutIndex);
  assert.ok(surfaceStart < footerIndex);
  assert.match(surfaceMarkup, /class="post-header"/);
  assert.match(surfaceMarkup, /class="post-layout-with-toc"/);
  assert.match(surfaceMarkup, /class="post-footer"/);
  assert.match(postLayout, /<\/footer>\s*<\/div>\s*<div class="post-comments">/);
  assert.match(postLayout, /\{% if page\.toc %\}[\s\S]*post-toc[\s\S]*toc\.js/);
  assert.match(postLayout, /page\.previous/);
  assert.match(postLayout, /page\.next/);
});
