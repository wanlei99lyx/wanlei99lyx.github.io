# 文章阅读区深浅模式 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Jekyll 文章详情页增加默认深色、可持久化的暖白阅读模式，同时保持全站星空、地球、导航、页脚和评论区不变。

**Architecture:** 用 `data-reading-theme` 作为文章页唯一主题状态，独立脚本负责校验、应用和保存选择；文章布局提供语义化开关与阅读纸张容器；SCSS 仅在文章主题属性下覆盖阅读区 token。`<head>` 中的极小内联脚本在 CSS 绘制前恢复已保存值，消除跨文章跳转时的主题闪烁。

**Tech Stack:** Jekyll/Liquid、HTML、SCSS、原生 JavaScript、Node.js `node:test`

---

### Task 1: 用测试定义主题状态行为

**Files:**
- Create: `tests/reading-theme.test.js`
- Create: `assets/js/reading-theme.js`

- [ ] **Step 1: 写入失败测试**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const theme = require('../assets/js/reading-theme.js');

test('normalizeTheme only accepts dark and light', () => {
  assert.equal(theme.normalizeTheme('light'), 'light');
  assert.equal(theme.normalizeTheme('dark'), 'dark');
  assert.equal(theme.normalizeTheme('system'), 'dark');
  assert.equal(theme.normalizeTheme(null), 'dark');
});

test('applyTheme updates root state and accessible control text', () => {
  const root = { dataset: {} };
  const label = { textContent: '' };
  const control = {
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelector(selector) { return selector === '[data-reading-theme-label]' ? label : null; }
  };
  theme.applyTheme('light', root, control);
  assert.equal(root.dataset.readingTheme, 'light');
  assert.equal(control.attributes['aria-checked'], 'true');
  assert.equal(label.textContent, '浅色阅读');
});

test('toggleTheme persists the next theme and survives storage errors', () => {
  const root = { dataset: { readingTheme: 'dark' } };
  const control = { setAttribute() {}, querySelector() { return { textContent: '' }; } };
  const storage = { value: '', setItem(key, value) { this.value = `${key}:${value}`; } };
  assert.equal(theme.toggleTheme(root, control, storage), 'light');
  assert.equal(storage.value, 'post-reading-theme:light');
  assert.doesNotThrow(() => theme.toggleTheme(root, control, { setItem() { throw new Error('blocked'); } }));
});
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `node --test tests/reading-theme.test.js`

Expected: FAIL，错误包含 `Cannot find module '../assets/js/reading-theme.js'`。

- [ ] **Step 3: 实现最小主题控制模块**

```js
(function(root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root && root.document) api.init(root.document, root.localStorage);
})(typeof window !== 'undefined' ? window : null, function() {
  var STORAGE_KEY = 'post-reading-theme';

  function normalizeTheme(value) {
    return value === 'light' ? 'light' : 'dark';
  }

  function applyTheme(value, root, control) {
    var theme = normalizeTheme(value);
    root.dataset.readingTheme = theme;
    if (control) {
      control.setAttribute('aria-checked', theme === 'light' ? 'true' : 'false');
      var label = control.querySelector('[data-reading-theme-label]');
      if (label) label.textContent = theme === 'light' ? '浅色阅读' : '深色阅读';
    }
    return theme;
  }

  function toggleTheme(root, control, storage) {
    var next = root.dataset.readingTheme === 'light' ? 'dark' : 'light';
    applyTheme(next, root, control);
    try { storage.setItem(STORAGE_KEY, next); } catch (error) {}
    return next;
  }

  function init(document, storage) {
    var control = document.getElementById('readingThemeToggle');
    if (!control) return;
    var root = document.documentElement;
    applyTheme(root.dataset.readingTheme, root, control);
    control.addEventListener('click', function() { toggleTheme(root, control, storage); });
  }

  return { normalizeTheme: normalizeTheme, applyTheme: applyTheme, toggleTheme: toggleTheme, init: init };
});
```

- [ ] **Step 4: 运行测试并确认通过**

Run: `node --test tests/reading-theme.test.js`

Expected: 3 tests passed，0 failed。

- [ ] **Step 5: 提交行为模块**

```powershell
git add -- tests/reading-theme.test.js assets/js/reading-theme.js
git commit -m "feat: 添加文章阅读主题状态控制"
```

### Task 2: 接入文章布局并避免首次绘制闪烁

**Files:**
- Modify: `_layouts/default.html`
- Modify: `_layouts/post.html`
- Test: `tests/reading-theme.test.js`

- [ ] **Step 1: 在测试中增加布局契约检查**

```js
const fs = require('node:fs');
const path = require('node:path');

test('post layout exposes an accessible reading theme switch', () => {
  const html = fs.readFileSync(path.join(__dirname, '../_layouts/post.html'), 'utf8');
  assert.match(html, /id="readingThemeToggle"/);
  assert.match(html, /role="switch"/);
  assert.match(html, /aria-checked="false"/);
  assert.match(html, /reading-theme\.js/);
});

test('default layout restores the saved post theme before stylesheet load', () => {
  const html = fs.readFileSync(path.join(__dirname, '../_layouts/default.html'), 'utf8');
  const bootstrap = html.indexOf('post-reading-theme');
  const stylesheet = html.indexOf("'/assets/css/main.css'");
  assert.ok(bootstrap > -1 && bootstrap < stylesheet);
});
```

- [ ] **Step 2: 运行测试并确认两个布局测试失败**

Run: `node --test tests/reading-theme.test.js`

Expected: 3 tests passed，2 tests failed，失败原因是缺少开关和预加载脚本。

- [ ] **Step 3: 在默认布局样式表之前恢复文章主题**

在 `_layouts/default.html` 的 `<meta>` 后、主样式表前加入：

```html
{% if page.layout == 'post' %}
  <script>
    (function() {
      try {
        var saved = localStorage.getItem('post-reading-theme');
        document.documentElement.dataset.readingTheme = saved === 'light' ? 'light' : 'dark';
      } catch (error) {
        document.documentElement.dataset.readingTheme = 'dark';
      }
    })();
  </script>
{% endif %}
```

- [ ] **Step 4: 在文章标题下增加开关并包裹阅读区域**

在 `_layouts/post.html` 中将标题、目录、正文和文章导航放入 `.post-reading-surface`，在标签后加入：

```html
<div class="reading-theme-control">
  <button class="reading-theme-toggle" id="readingThemeToggle" type="button" role="switch" aria-checked="false" aria-label="切换文章阅读背景">
    <span class="reading-theme-icon" aria-hidden="true">☾</span>
    <span class="reading-theme-track" aria-hidden="true"><span class="reading-theme-thumb"></span></span>
    <span class="reading-theme-icon" aria-hidden="true">☀</span>
    <span class="reading-theme-label" data-reading-theme-label>深色阅读</span>
  </button>
</div>
```

在评论脚本之前加入：

```html
<script src="{{ '/assets/js/reading-theme.js' | relative_url }}"></script>
```

- [ ] **Step 5: 运行测试并确认全部通过**

Run: `node --test tests/reading-theme.test.js`

Expected: 5 tests passed，0 failed。

- [ ] **Step 6: 提交布局接入**

```powershell
git add -- _layouts/default.html _layouts/post.html tests/reading-theme.test.js
git commit -m "feat: 在文章页接入阅读模式开关"
```

### Task 3: 完成暖白阅读纸张与响应式细节

**Files:**
- Modify: `assets/css/main.scss`
- Test: `tests/reading-theme.test.js`

- [ ] **Step 1: 增加静态样式契约测试**

```js
test('stylesheet scopes light colors to the post reading surface', () => {
  const css = fs.readFileSync(path.join(__dirname, '../assets/css/main.scss'), 'utf8');
  assert.match(css, /data-reading-theme="light"/);
  assert.match(css, /--reading-bg:/);
  assert.match(css, /\.reading-theme-toggle/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
```

- [ ] **Step 2: 运行测试并确认样式契约失败**

Run: `node --test tests/reading-theme.test.js`

Expected: 5 tests passed，1 test failed，失败原因是缺少阅读主题样式。

- [ ] **Step 3: 添加阅读区 token、纸张和开关样式**

在 `assets/css/main.scss` 文章样式区加入以下完整规则，并在实现时保持选择器只作用于 `.post-reading-surface`：

```scss
.post-reading-surface {
  --reading-bg: transparent;
  --reading-ink: var(--color-ink);
  --reading-secondary: var(--color-ink-secondary);
  --reading-muted: var(--color-muted);
  --reading-border: var(--color-border);
  color: var(--reading-ink);
  border: 1px solid transparent;
  border-radius: 18px;
  transition: background-color 220ms ease, color 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
}

html[data-reading-theme="light"] .post-reading-surface {
  --reading-bg: oklch(0.965 0.012 85 / 0.97);
  --reading-ink: oklch(0.24 0.018 70);
  --reading-secondary: oklch(0.42 0.018 70);
  --reading-muted: oklch(0.54 0.015 70);
  --reading-border: oklch(0.84 0.018 80);
  background: var(--reading-bg);
  border-color: var(--reading-border);
  box-shadow: 0 24px 70px oklch(0.02 0 0 / 0.36);
}

.reading-theme-control { margin-top: var(--space-5); }
.reading-theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 36px;
  padding: var(--space-1) var(--space-3);
  color: var(--reading-secondary);
  background: color-mix(in oklch, var(--reading-bg) 80%, var(--color-surface));
  border: 1px solid var(--reading-border);
  border-radius: 999px;
  cursor: pointer;
}
.reading-theme-toggle:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 3px; }
.reading-theme-track { width: 34px; height: 18px; padding: 2px; border-radius: 999px; background: var(--reading-border); }
.reading-theme-thumb { display: block; width: 14px; height: 14px; border-radius: 50%; background: var(--color-accent); transition: transform 180ms ease; }
html[data-reading-theme="light"] .reading-theme-thumb { transform: translateX(16px); }
.reading-theme-label { min-width: 4em; font-size: 0.75rem; font-weight: 600; }

html[data-reading-theme="light"] .post-reading-surface :is(.post-title, .post-content, .post-content strong) { color: var(--reading-ink); }
html[data-reading-theme="light"] .post-reading-surface :is(.post-meta, .post-toc-title, .post-toc-nav a, .post-nav-link) { color: var(--reading-muted); }
html[data-reading-theme="light"] .post-reading-surface :is(.post-content h2, .post-content hr, .post-toc-title, .post-footer) { border-color: var(--reading-border); }
html[data-reading-theme="light"] .post-reading-surface .post-content :is(blockquote, code, th) { background: oklch(0.92 0.015 82); }
html[data-reading-theme="light"] .post-reading-surface .post-content tr:nth-child(even) { background: oklch(0.94 0.012 82); }
html[data-reading-theme="light"] .post-reading-surface .post-content :is(th, td, img) { border-color: var(--reading-border); }
html[data-reading-theme="light"] .post-reading-surface .post-content pre { background: oklch(0.12 0.015 260); color: oklch(0.92 0.008 260); }

@media (max-width: 640px) {
  html[data-reading-theme="light"] .post-reading-surface { margin-inline: calc(var(--space-3) * -1); padding-inline: var(--space-3); border-radius: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  .post-reading-surface, .reading-theme-thumb { transition: none !important; }
}
```

- [ ] **Step 4: 运行测试并检查 SCSS 差异**

Run: `node --test tests/reading-theme.test.js`

Expected: 6 tests passed，0 failed。

Run: `git diff --check`

Expected: 无输出，退出码 0。

- [ ] **Step 5: 提交视觉实现**

```powershell
git add -- assets/css/main.scss tests/reading-theme.test.js
git commit -m "style: 添加暖白文章阅读纸张"
```

### Task 4: 集成验证与发布

**Files:**
- Verify: `_layouts/default.html`
- Verify: `_layouts/post.html`
- Verify: `assets/js/reading-theme.js`
- Verify: `assets/css/main.scss`
- Verify: `tests/reading-theme.test.js`

- [ ] **Step 1: 运行完整主题测试**

Run: `node --test tests/reading-theme.test.js`

Expected: 6 tests passed，0 failed。

- [ ] **Step 2: 验证工作区和提交范围**

Run: `git diff --check HEAD~3..HEAD`

Expected: 无输出，退出码 0。

Run: `git status --short`

Expected: 仅保留任务开始前已经存在的 `blog-publishing-skill`、`CLAUDE.md` 和两张旧图片状态。

- [ ] **Step 3: 通过既定代理推送**

```powershell
git -c http.proxy=http://127.0.0.1:7897 -c https.proxy=http://127.0.0.1:7897 push origin master --no-verify
```

Expected: `master -> master`，随后 `git rev-parse HEAD` 与 `git rev-parse origin/master` 相同。
