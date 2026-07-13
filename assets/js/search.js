// Global search: filter posts from sitePostsData
(function() {
  var searchInput = document.getElementById('searchInput');
  var resultsEl = document.getElementById('searchResults');
  if (!searchInput || !resultsEl) return;

  var allPosts = (function() {
    var el = document.getElementById('sitePostsData');
    if (!el) return [];
    try { return JSON.parse(el.textContent); } catch(e) { return []; }
  })();

  if (allPosts.length === 0) return;

  var highlightedIndex = -1;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function filterPosts(query) {
    if (!query.trim()) return [];
    var q = query.toLowerCase();
    return allPosts.filter(function(p) {
      return p.title.toLowerCase().indexOf(q) !== -1 ||
        (p.excerpt && p.excerpt.toLowerCase().indexOf(q) !== -1) ||
        (p.categories && p.categories.some(function(c) { return c.toLowerCase().indexOf(q) !== -1; })) ||
        (p.tags && p.tags.some(function(t) { return t.toLowerCase().indexOf(q) !== -1; }));
    });
  }

  function renderResults(results) {
    if (results.length === 0) {
      resultsEl.innerHTML = '<div class="search-empty">没有找到相关内容，试试其他关键词</div>';
      return;
    }
    resultsEl.innerHTML = results.map(function(p) {
      var cats = p.categories || [];
      var views = p.views || 0;
      return '<a href="' + escapeHtml(p.url) + '" class="search-result-item">' +
        '<div class="search-result-title">' + escapeHtml(p.title) + '</div>' +
        '<div class="search-result-meta">' +
          (cats.length ? '<span>' + escapeHtml(cats[0]) + '</span><span>·</span>' : '') +
          '<span>' + views + ' 次阅读</span>' +
        '</div>' +
      '</a>';
    }).join('');
    highlightedIndex = -1;
  }

  function showResults() {
    var query = searchInput.value;
    if (!query.trim()) {
      resultsEl.classList.remove('visible');
      resultsEl.innerHTML = '';
      highlightedIndex = -1;
      return;
    }
    var results = filterPosts(query);
    renderResults(results);
    resultsEl.classList.add('visible');
  }

  function getVisibleItems() {
    return resultsEl.querySelectorAll('.search-result-item');
  }

  function highlightNext() {
    var items = getVisibleItems();
    if (items.length === 0) return;
    if (highlightedIndex >= 0) items[highlightedIndex].classList.remove('highlighted');
    highlightedIndex = (highlightedIndex + 1) % items.length;
    items[highlightedIndex].classList.add('highlighted');
    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
  }

  function highlightPrev() {
    var items = getVisibleItems();
    if (items.length === 0) return;
    if (highlightedIndex >= 0) items[highlightedIndex].classList.remove('highlighted');
    highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
    items[highlightedIndex].classList.add('highlighted');
    items[highlightedIndex].scrollIntoView({ block: 'nearest' });
  }

  function goHighlighted() {
    if (highlightedIndex < 0) return;
    var items = getVisibleItems();
    if (items[highlightedIndex]) items[highlightedIndex].click();
  }

  searchInput.addEventListener('input', showResults);

  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); highlightNext(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); highlightPrev(); }
    else if (e.key === 'Enter') { e.preventDefault(); goHighlighted(); }
    else if (e.key === 'Escape') {
      resultsEl.classList.remove('visible');
      searchInput.blur();
    }
  });

  searchInput.addEventListener('focus', function() {
    if (searchInput.value.trim()) showResults();
  });

  document.addEventListener('click', function(e) {
    var navSearch = document.getElementById('navSearch');
    if (navSearch && !navSearch.contains(e.target)) {
      resultsEl.classList.remove('visible');
    }
  });
})();
