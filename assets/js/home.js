// Homepage: top 6 most viewed posts
(function() {
  var COUNT_API = 'https://api.countapi.xyz';
  var COUNT_NS = 'wanlei99lyx.github.io';

  var postsData = (function() {
    var el = document.getElementById('homePostsData');
    if (!el) return [];
    try { return JSON.parse(el.textContent); } catch(e) { return []; }
  })();

  if (postsData.length === 0) return;

  var grid = document.getElementById('homeFeaturedGrid');
  if (!grid) return;

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

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderCard(post) {
    var cats = post.categories || [];
    var tags = post.tags || [];

    var html = '<article class="post-card">' +
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

    return html;
  }

  // Fetch all counts and render top 6
  Promise.all(postsData.map(function(post) {
    return fetchCount(post.url).then(function(count) {
      post.count = count;
      return post;
    });
  })).then(function(all) {
    all.sort(function(a, b) { return b.count - a.count; });
    var top = all.slice(0, 6);

    grid.innerHTML = top.map(renderCard).join('');
  }).catch(function() {
    // CountAPI failed — keep server-rendered posts as-is
  });
})();
