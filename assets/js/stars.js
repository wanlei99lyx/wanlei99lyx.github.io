(function() {
  var field = document.getElementById('starField');
  if (!field) return;

  var count = 200;
  var html = '';

  // Generate deeper (slow) and shallower (fast) star layers
  for (var i = 0; i < count; i++) {
    var isDeep = Math.random() < 0.5;
    var x = Math.random() * 100;
    var y = Math.random() * 100;
    var size = isDeep ? (Math.random() * 1.5 + 0.5) : (Math.random() * 2.5 + 1);
    var opacity = isDeep ? (Math.random() * 0.3 + 0.1) : (Math.random() * 0.6 + 0.2);
    var delay = (Math.random() * 5).toFixed(2);
    var duration = (Math.random() * 3 + 2).toFixed(2);
    var depth = isDeep ? '0.15' : '0.4';

    var isBright = !isDeep && Math.random() < 0.12;
    var shadow = isBright ? ('box-shadow: 0 0 ' + (size * 4) + 'px rgba(255,255,255,' + (opacity * 0.4) + ');') : '';
    var sizeBig = isBright ? (size * 1.5) : size;

    html += '<div class="star" data-depth="' + depth + '" style="left:' + x + '%;top:' + y + '%;width:' + sizeBig + 'px;height:' + sizeBig + 'px;opacity:' + opacity + ';animation-delay:' + delay + 's;animation-duration:' + duration + 's;' + shadow + '"></div>';
  }

  field.innerHTML = html;

  // Parallax scroll — stars move slower than content
  var ticking = false;
  var stars = field.querySelectorAll('.star');

  function updateParallax() {
    var scrollY = window.scrollY || window.pageYOffset;
    var maxShift = 120; // max pixels stars can move

    for (var i = 0; i < stars.length; i++) {
      var depth = parseFloat(stars[i].getAttribute('data-depth'));
      var shift = Math.min(scrollY * depth, maxShift);
      var currentY = parseFloat(stars[i].style.top);
      stars[i].style.transform = 'translateY(' + shift + 'px)';
    }

    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
})();
