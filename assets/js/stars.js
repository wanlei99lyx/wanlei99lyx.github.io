(function() {
  var field = document.getElementById('starField');
  if (!field) return;

  var count = 180;
  var html = '';
  var w = window.innerWidth;
  var h = window.innerHeight;

  for (var i = 0; i < count; i++) {
    var x = Math.random() * 100;
    var y = Math.random() * 100;
    var size = Math.random() * 2.5 + 0.5;
    var opacity = Math.random() * 0.6 + 0.15;
    var delay = (Math.random() * 4).toFixed(2);
    var duration = (Math.random() * 2 + 2).toFixed(2);

    // A few "bright" stars get a glow
    var isBright = Math.random() < 0.08;
    var shadow = isBright ? ('box-shadow: 0 0 ' + (size * 3) + 'px rgba(255,255,255,' + (opacity * 0.5) + ');') : '';

    html += '<div class="star" style="left:' + x + '%;top:' + y + '%;width:' + size + 'px;height:' + size + 'px;opacity:' + opacity + ';animation-delay:' + delay + 's;animation-duration:' + duration + 's;' + shadow + '"></div>';
  }

  field.innerHTML = html;
})();
