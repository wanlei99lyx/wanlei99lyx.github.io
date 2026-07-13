// Homepage: top 6 most viewed posts
(function() {
  var postsData = (function() {
    var el = document.getElementById('homePostsData');
    if (!el) return [];
    try { return JSON.parse(el.textContent); } catch(e) { return []; }
  })();

  if (postsData.length === 0) return;

  var grid = document.getElementById('homeFeaturedGrid');
  if (!grid) return;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderCard(post) {
    var cats = post.categories || [];
    var tags = post.tags || [];

    return '<article class="post-card">' +
      '<a href="' + escapeHtml(post.url) + '" class="post-card-link">' +
        '<div class="post-card-content">' +
          '<div class="post-card-meta">' +
            '<time>' + escapeHtml(post.date) + '</time>' +
            (cats.length ? '<span class="post-card-category">' + escapeHtml(cats[0]) + '</span>' : '') +
          '</div>' +
          '<h3 class="post-card-title">' + escapeHtml(post.title) + '</h3>' +
          '<p class="post-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
          '<div class="post-card-footer">' +
            (tags.length ? '<div class="post-card-tags">' + tags.slice(0, 3).map(function(t) { return '<span class="tag tag-sm">#' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</a>' +
    '</article>';
  }

  // Sort by views descending, take top 6
  postsData.sort(function(a, b) { return (b.views || 0) - (a.views || 0); });
  grid.innerHTML = postsData.slice(0, 6).map(renderCard).join('');

  // === Search ===
  var searchInput = document.getElementById('heroSearch');
  var resultsEl = document.getElementById('searchResults');
  if (!searchInput || !resultsEl) return;

  var allPosts = (function() {
    var el = document.getElementById('homePostsData');
    if (!el) return [];
    try { return JSON.parse(el.textContent); } catch(e) { return []; }
  })();

  var highlightedIndex = -1;

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
      return '<a href="' + escapeHtml(p.url) + '" class="search-result-item" data-index="' + escapeHtml(String(p.url)) + '">' +
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

  searchInput.addEventListener('input', function() {
    showResults();
  });

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
    if (!searchInput.contains(e.target) && !resultsEl.contains(e.target)) {
      resultsEl.classList.remove('visible');
    }
  });
})();
