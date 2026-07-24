// Category filter with sub-tag dropdown + top viewed featured section
(function() {
  /* ========== Category Tabs ========== */
  var tabs = document.querySelectorAll('.blog-tab');
  var cards = document.querySelectorAll('.blog-card');
  var activeSubTag = 'all';

  function applyFilter(category, subTag) {
    cards.forEach(function(card) {
      var cats = (card.getAttribute('data-category') || '').trim().split(/\s+/);
      var tags = (card.getAttribute('data-tags') || '').trim().split(/\s+/);
      var catMatch = category === 'all' || cats.indexOf(category) !== -1;
      var tagMatch = subTag === 'all' || tags.indexOf(subTag) !== -1;
      card.style.display = catMatch && tagMatch ? '' : 'none';
    });
  }

  function setActiveTab(activeTab) {
    tabs.forEach(function(t) { t.classList.remove('active'); });
    activeTab.classList.add('active');
  }

  function updateDropdownLabel(label) {
    var dropdown = document.querySelector('.blog-tab-dropdown');
    if (!dropdown) return;
    var btn = dropdown.querySelector('.blog-tab-with-dropdown');
    var items = dropdown.querySelectorAll('.blog-dropdown-item');
    items.forEach(function(item) { item.classList.remove('active'); });
    var match = dropdown.querySelector('[data-tag="' + label + '"]');
    if (match) match.classList.add('active');
  }

  // Tab click
  if (tabs.length && cards.length) {
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function(e) {
        // Don't handle clicks on the dropdown toggle button here
        if (tab.classList.contains('blog-tab-with-dropdown')) return;
        setActiveTab(tab);
        activeSubTag = 'all';
        var filter = tab.getAttribute('data-filter');
        applyFilter(filter, 'all');
        // Reset dropdown label
        updateDropdownLabel('all');
      });
    });
  }

  // Dropdown toggle
  var dropdowns = document.querySelectorAll('.blog-tab-dropdown');
  dropdowns.forEach(function(dd) {
    var btn = dd.querySelector('.blog-tab-with-dropdown');
    var menu = dd.querySelector('.blog-dropdown-menu');

    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = dd.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) dd.classList.add('open');
    });

    // Dropdown item click
    menu.addEventListener('click', function(e) {
      var item = e.target.closest('.blog-dropdown-item');
      if (!item) return;
      var tag = item.getAttribute('data-tag');
      activeSubTag = tag;
      updateDropdownLabel(tag);

      // Activate the parent tab
      var parentTab = dd.querySelector('.blog-tab-with-dropdown');
      setActiveTab(parentTab);

      var filter = parentTab.getAttribute('data-filter');
      applyFilter(filter, tag);
      closeAllDropdowns();
    });
  });

  function closeAllDropdowns() {
    document.querySelectorAll('.blog-tab-dropdown.open').forEach(function(d) {
      d.classList.remove('open');
    });
  }

  document.addEventListener('click', closeAllDropdowns);

  /* ========== Top Viewed Featured ========== */
  var postsData = (function() {
    var el = document.getElementById('blogPostsData');
    if (!el) return [];
    try { return JSON.parse(el.textContent); } catch(e) { return []; }
  })();

  if (postsData.length === 0) return;

  var TOP_N = 3;

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderFeatured(topPosts) {
    var container = document.getElementById('blogFeaturedContent');
    var label = document.getElementById('blogFeaturedLabel');
    if (!container) return;
    if (!topPosts || topPosts.length === 0) return;

    if (label) label.textContent = '热门文章';

    var grid = document.createElement('div');
    grid.className = 'blog-featured-grid';

    topPosts.forEach(function(post) {
      var card = document.createElement('a');
      card.href = post.url;
      card.className = 'blog-featured-card';

      var tags = post.tags || [];

      card.innerHTML =
        '<div class="blog-featured-card-meta">' +
          '<time>' + post.date + '</time>' +
        '</div>' +
        '<h3 class="blog-featured-card-title">' + escapeHtml(post.title) + '</h3>' +
        '<p class="blog-featured-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
        (tags.length ? '<div class="blog-featured-card-tags">' + tags.slice(0, 3).map(function(t) { return '<span class="tag tag-sm">#' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '');

      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);

    // Hide featured posts from grid to avoid duplication
    var featuredUrls = {};
    topPosts.forEach(function(p) { featuredUrls[p.url] = true; });
    cards.forEach(function(card) {
      var url = card.getAttribute('data-url');
      if (featuredUrls[url]) {
        card.style.display = 'none';
      }
    });
  }

  // Sort by views embedded in page, take top N
  var sorted = postsData.slice().sort(function(a, b) { return (b.views || 0) - (a.views || 0); });
  renderFeatured(sorted.slice(0, TOP_N));
})();
