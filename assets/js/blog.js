// Category filter for blog page
(function() {
  var tabs = document.querySelectorAll('.blog-tab');
  var cards = document.querySelectorAll('.blog-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');

      var filter = tab.getAttribute('data-filter');
      var hasActiveFilter = filter !== 'all';

      cards.forEach(function(card) {
        var cats = (card.getAttribute('data-category') || '').trim().split(/\s+/);
        var match = filter === 'all' || cats.indexOf(filter) !== -1;
        card.style.display = match ? '' : 'none';
      });
    });
  });
})();
