(function (root, factory) {
  var api = factory();

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.ReadingTheme = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var STORAGE_KEY = 'post-reading-theme';

  function normalizeTheme(theme) {
    return theme === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme, root, control) {
    var normalizedTheme = normalizeTheme(theme);
    var label;

    root.dataset.readingTheme = normalizedTheme;
    control.setAttribute('aria-checked', normalizedTheme === 'light' ? 'true' : 'false');

    label = control.querySelector('[data-reading-theme-label]');
    if (label) {
      label.textContent = normalizedTheme === 'light' ? '浅色阅读' : '深色阅读';
    }

    return normalizedTheme;
  }

  function toggleTheme(theme, root, control, storage) {
    var nextTheme = normalizeTheme(theme) === 'dark' ? 'light' : 'dark';

    applyTheme(nextTheme, root, control);

    try {
      storage.setItem(STORAGE_KEY, nextTheme);
    } catch (error) {
      // Theme switching should still work when storage is unavailable.
    }

    return nextTheme;
  }

  function init(documentObject, storage) {
    var doc = documentObject || document;
    var control = doc.querySelector('#readingThemeToggle');
    var root;

    if (!control) {
      return;
    }

    root = doc.documentElement;
    storage = storage || window.localStorage;
    applyTheme(root.dataset.readingTheme, root, control);
    control.addEventListener('click', function () {
      toggleTheme(root.dataset.readingTheme, root, control, storage);
    });
  }

  return {
    normalizeTheme: normalizeTheme,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme,
    init: init,
  };
});
