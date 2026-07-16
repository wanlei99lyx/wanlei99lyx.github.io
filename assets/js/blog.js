// Top viewed featured section
(function() {
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

      var cats = post.categories || [];
      var tags = post.tags || [];

      card.innerHTML =
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

    // Hide featured posts from grid to avoid duplication
    var cards = document.querySelectorAll('.blog-card');
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
