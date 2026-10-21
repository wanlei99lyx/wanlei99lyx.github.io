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
const { init: initAiNewsNav, toggleExpanded } = require('../assets/js/ai-news-nav.js');

const defaultLayout = fs.readFileSync(
  path.join(__dirname, '../_layouts/default.html'),
  'utf8'
);
const postLayout = fs.readFileSync(
  path.join(__dirname, '../_layouts/post.html'),
  'utf8'
);
const mainStyles = fs.readFileSync(
  path.join(__dirname, '../assets/css/main.scss'),
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

test('AI news posts use the wide container alongside TOC posts', () => {
  assert.match(
    postLayout,
    /assign is_ai_news[\s\S]*container\{% unless page\.toc or is_ai_news %\} container-narrow\{% endunless %\}/
  );
  assert.match(postLayout, /if page\.toc or is_ai_news/);
});

test('post sidebar contains the industry news navigation and its Liquid data source', () => {
  const sidebarStart = postLayout.indexOf('post-sidebar');
  const contentStart = postLayout.indexOf('post-content', sidebarStart);
  const sidebar = postLayout.slice(sidebarStart, contentStart);

  assert.match(
    postLayout,
    /{%\s*if\s+page\.categories\s+contains\s+['\"]行业动态['\"]\s*%}/
  );
  assert.notEqual(sidebarStart, -1);
  assert.ok(contentStart > sidebarStart);
  assert.match(sidebar, /<nav[^>]*\bid="aiNewsNavList"[^>]*>/);
  assert.match(sidebar, /<button[^>]*\bid="aiNewsNavMore"[^>]*>/);
  assert.match(sidebar, /class="ai-news-nav(?:\s|["'])/);
  assert.match(sidebar, /class="ai-news-nav-more(?:\s|["'])/);
  assert.match(sidebar, /aria-current\s*=\s*["']page["']/);
  assert.match(postLayout, /site\.posts/);
});

test('existing TOC stays inside the post sidebar', () => {
  const sidebarStart = postLayout.indexOf('class="post-sidebar"');
  const sidebarEnd = postLayout.indexOf('</aside>', sidebarStart);
  const tocStart = postLayout.indexOf('class="post-toc"');

  assert.notEqual(sidebarStart, -1);
  assert.notEqual(sidebarEnd, -1);
  assert.ok(sidebarStart < tocStart && tocStart < sidebarEnd);
});

test('AI news sidebar styles use direct selectors and scoped responsive rules', () => {
  assert.match(mainStyles, /\.ai-news-nav-link\.is-current\s*\{/);
  assert.match(mainStyles, /\.ai-news-nav-item\.is-hidden\s*\{[^}]*display\s*:\s*none/);
  assert.match(mainStyles, /\.ai-news-nav-list\s*\{/);
  assert.match(
    mainStyles,
    /@media\s*\(max-width\s*:\s*1024px\)[\s\S]*?\.ai-news-nav[\s\S]*?\{[\s\S]*?overflow-x\s*:\s*auto/
  );
  assert.match(
    mainStyles,
    /@media\s*\(prefers-reduced-motion\s*:\s*reduce\)[\s\S]*?\.(?:ai-news-nav-link|ai-news-nav-more)[\s\S]*?\{/
  );
});

test('AI news navigation initializes with only expandable items', () => {
  const listeners = {};
  const hiddenItem = { hidden: true, classList: { toggle() {} } };
  const visibleItem = { hidden: false, classList: { toggle() {} } };
  const label = { textContent: '查看全部' };
  const button = {
    attributes: { 'aria-expanded': 'false' },
    getAttribute(name) {
      return this.attributes[name];
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
    querySelector() {
      return label;
    },
  };
  const list = {
    querySelectorAll(selector) {
      assert.equal(selector, '.is-hidden');
      return [hiddenItem];
    },
    querySelector() {
      return null;
    },
  };
  const documentObject = {
    querySelector(selector) {
      return selector === '#aiNewsNavMore' ? button : list;
    },
  };

  initAiNewsNav(documentObject, { innerWidth: 1280 });
  listeners.click();

  assert.equal(hiddenItem.hidden, false);
  assert.equal(visibleItem.hidden, false);
  assert.equal(button.attributes['aria-expanded'], 'true');
});

test('AI news navigation reveals the current hidden item on every viewport', () => {
  const listeners = {};
  const currentItem = {
    hidden: true,
    classList: {
      contains(className) {
        return className === 'is-hidden';
      },
      remove(className) {
        assert.equal(className, 'is-hidden');
      },
    },
  };
  const currentLink = {
    parentElement: currentItem,
    scrollIntoView() {
      throw new Error('desktop should not scroll the navigation');
    },
  };
  const label = { textContent: '查看全部' };
  const button = {
    attributes: { 'aria-expanded': 'false' },
    getAttribute(name) {
      return this.attributes[name];
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
    querySelector() {
      return label;
    },
  };
  const list = {
    querySelectorAll() {
      return [currentItem];
    },
    querySelector(selector) {
      return selector === '[aria-current="page"]' ? currentLink : null;
    },
  };
  const documentObject = {
    querySelector(selector) {
      return selector === '#aiNewsNavMore' ? button : list;
    },
  };

  initAiNewsNav(documentObject, { innerWidth: 1280 });

  assert.equal(currentItem.hidden, false);
  assert.equal(button.attributes['aria-expanded'], 'false');
  assert.equal(label.textContent, '查看全部');
  assert.equal(typeof listeners.click, 'function');
});

test('mobile reveal then expand and collapse keeps the current item visible', () => {
  const listeners = {};
  const currentItem = {
    hidden: true,
    classList: {
      contains(className) {
        return className === 'is-hidden';
      },
      remove() {},
      toggle(className, force) {
        if (className === 'is-hidden') {
          this.hiddenState = force;
        }
      },
    },
  };
  const otherHiddenItem = {
    hidden: true,
    classList: {
      toggle(className, force) {
        if (className === 'is-hidden') {
          this.hiddenState = force;
        }
      },
    },
  };
  const currentLink = {
    parentElement: currentItem,
    scrollIntoView() {},
  };
  const label = { textContent: '查看全部' };
  const button = {
    attributes: { 'aria-expanded': 'false' },
    getAttribute(name) {
      return this.attributes[name];
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    addEventListener(type, listener) {
      listeners[type] = listener;
    },
    querySelector() {
      return label;
    },
  };
  const list = {
    querySelectorAll() {
      return [currentItem, otherHiddenItem];
    },
    querySelector(selector) {
      return selector === '[aria-current="page"]' ? currentLink : null;
    },
  };
  const documentObject = {
    querySelector(selector) {
      return selector === '#aiNewsNavMore' ? button : list;
    },
  };

  initAiNewsNav(documentObject, {
    matchMedia() {
      return { matches: true };
    },
  });

  assert.equal(currentItem.hidden, false);
  assert.equal(otherHiddenItem.hidden, false);
  assert.equal(button.attributes['aria-expanded'], 'false');
  assert.equal(label.textContent, '查看全部');

  listeners.click();
  assert.equal(button.attributes['aria-expanded'], 'true');
  assert.equal(label.textContent, '收起');

  listeners.click();
  assert.equal(button.attributes['aria-expanded'], 'false');
  assert.equal(label.textContent, '查看全部');
  assert.equal(currentItem.hidden, false);
  assert.equal(otherHiddenItem.hidden, true);
});

test('toggleExpanded reveals hidden items and updates the navigation button', () => {
  const toggles = [];
  const hiddenItems = [
    {
      hidden: true,
      classList: {
        toggle(className, force) {
          toggles.push([className, force]);
        },
      },
    },
    {
      hidden: true,
      classList: {
        toggle(className, force) {
          toggles.push([className, force]);
        },
      },
    },
  ];
  const label = { textContent: '更多' };
  const button = {
    attributes: { 'aria-expanded': 'false' },
    getAttribute(name) {
      return this.attributes[name];
    },
    setAttribute(name, value) {
      this.attributes[name] = value;
    },
    querySelector(selector) {
      return selector === 'span' ? label : null;
    },
  };

  toggleExpanded(hiddenItems, button);

  assert.equal(hiddenItems[0].hidden, false);
  assert.equal(hiddenItems[1].hidden, false);
  assert.equal(button.attributes['aria-expanded'], 'true');
  assert.equal(label.textContent, '收起');
  assert.deepEqual(toggles, [
    ['is-hidden', false],
    ['is-hidden', false],
  ]);

  toggleExpanded(hiddenItems, button);

  assert.equal(hiddenItems[0].hidden, true);
  assert.equal(hiddenItems[1].hidden, true);
  assert.equal(button.attributes['aria-expanded'], 'false');
  assert.equal(label.textContent, '查看全部');
  assert.deepEqual(toggles, [
    ['is-hidden', false],
    ['is-hidden', false],
    ['is-hidden', true],
    ['is-hidden', true],
  ]);
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

test('reading theme styles provide scoped paper tokens, control, and reduced motion', () => {
  assert.match(mainStyles, /html\[data-reading-theme=["']light["']\]/);
  assert.match(mainStyles, /--reading-bg\s*:/);
  assert.match(mainStyles, /\.reading-theme-toggle\s*\{/);
  assert.match(
    mainStyles,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.post-reading-surface[\s\S]*\.reading-theme-thumb/
  );
});

test('light reading styles stay surface-scoped and preserve the dark layout', () => {
  const defaultSurface = mainStyles.match(/\.post-reading-surface\s*\{([^}]*)\}/)?.[1] || '';
  const lightSelectors = [
    ...mainStyles.matchAll(/html\[data-reading-theme=["']light["'][^{,\r\n]*/g),
  ].map((match) => match[0].trim());

  assert.doesNotMatch(defaultSurface, /^\s*(?:border|padding)(?:-[\w-]+)?\s*:/m);
  assert.ok(lightSelectors.length > 0);
  for (const selector of lightSelectors) {
    assert.match(selector, /\.post-reading-surface(?:\s|$)/);
  }
  assert.match(
    mainStyles,
    /html\[data-reading-theme=["']light["']\]\s+\.post-reading-surface\s+\.post-category[^\{]*\{[^}]*color\s*:[^;}]+!important/
  );
});

test('light paper handles code, mobile overflow, and reduced motion explicitly', () => {
  assert.match(
    mainStyles,
    /html\[data-reading-theme=["']light["']\]\s+\.post-reading-surface\s+\.post-content\s+pre[^\{]*\{[^}]*background\s*:\s*oklch\(0\.08/
  );
  assert.match(
    mainStyles,
    /@media\s*\(max-width:\s*640px\)[\s\S]*\.post-reading-surface[\s\S]*overflow-x\s*:\s*auto/
  );
  assert.match(
    mainStyles,
    /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.post-reading-surface[\s\S]*\.reading-theme-thumb[\s\S]*transition\s*:\s*none/
  );
});

test('light reading control uses a dedicated surface-scoped focus color', () => {
  assert.match(
    mainStyles,
    /html\[data-reading-theme=["']light["']\]\s+\.post-reading-surface\s*\{[^}]*--reading-focus\s*:/
  );
  assert.match(
    mainStyles,
    /html\[data-reading-theme=["']light["']\]\s+\.post-reading-surface\s+\.reading-theme-toggle:focus-visible\s*\{[^}]*outline\s*:\s*2px\s+solid\s+var\(--reading-focus\)[^}]*box-shadow\s*:[^;}]*var\(--reading-focus-halo\)/
  );
});
