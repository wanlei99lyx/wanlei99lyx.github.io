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
})();
