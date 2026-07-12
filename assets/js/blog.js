// Category filter + top viewed featured section
(function() {
  var COUNT_API = 'https://api.countapi.xyz';
  var COUNT_NS = 'wanlei99lyx.github.io';

  /* ========== Category Tabs ========== */
  var tabs = document.querySelectorAll('.blog-tab');
  var cards = document.querySelectorAll('.blog-card');

  if (tabs.length && cards.length) {
    tabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var filter = tab.getAttribute('data-filter');
        cards.forEach(function(card) {
          var cats = (card.getAttribute('data-category') || '').trim().split(/\s+/);
          card.style.display = (filter === 'all' || cats.indexOf(filter) !== -1) ? '' : 'none';
        });
      });
    });
  }

  /* ========== Top Viewed Featured ========== */
  var postsData = (function() {
    var el = document.getElementById('blogPostsData');
    if (!el) return [];
    try { return JSON.parse(el.textContent); } catch(e) { return []; }
  })();

  if (postsData.length === 0) return;

  var TOP_N = 3;

  function getKey(url) {
    return url.replace(/^\//, '').replace(/\/$/, '') || 'home';
  }

  function fetchCount(url) {
    var key = getKey(url);
    return fetch(COUNT_API + '/get/' + COUNT_NS + '/' + encodeURIComponent(key))
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) { return d && typeof d.value === 'number' ? d.value : 0; })
      .catch(function() { return 0; });
  }

  function renderFeatured(topPosts) {
    var container = document.getElementById('blogFeaturedContent');
    var label = document.getElementById('blogFeaturedLabel');
    if (!container) return;

    if (!topPosts || topPosts.length === 0) return;

    // Change label
    if (label) label.textContent = '热门文章';

    // Build grid of top viewed cards
    var grid = document.createElement('div');
    grid.className = 'blog-featured-grid';

    topPosts.forEach(function(post, i) {
      var rank = i + 1;
      var card = document.createElement('a');
      card.href = post.url;
      card.className = 'blog-featured-card';

      var cats = post.categories || [];
      var tags = post.tags || [];

      card.innerHTML =
        '<span class="blog-featured-rank">#' + rank + '</span>' +
        '<div class="blog-featured-card-meta">' +
          '<time>' + post.date + '</time>' +
          (cats.length ? '<span class="post-card-category">' + escapeHtml(cats[0]) + '</span>' : '') +
        '</div>' +
        '<h3 class="blog-featured-card-title">' + escapeHtml(post.title) + '</h3>' +
        '<p class="blog-featured-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
        (tags.length ? '<div class="blog-featured-card-tags">' + tags.slice(0, 3).map(function(t) { return '<span class="tag tag-sm">#' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '');

      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);

    // Hide featured posts from the grid to avoid duplication
    var featuredUrls = {};
    topPosts.forEach(function(p) { featuredUrls[p.url] = true; });
    cards.forEach(function(card) {
      var url = card.getAttribute('data-url');
      if (featuredUrls[url]) {
        card.style.display = 'none';
      }
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Fetch all counts and render top N
  Promise.all(postsData.map(function(post) {
    return fetchCount(post.url).then(function(count) {
      post.count = count;
      return post;
    });
  })).then(function(all) {
    all.sort(function(a, b) { return b.count - a.count; });
    var top = all.slice(0, TOP_N);
    renderFeatured(top);
  }).catch(function() {
    // CountAPI failed — keep server-rendered fallback as-is
  });
})();
