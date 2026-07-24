(function () {
  'use strict';

  var tocNav = document.getElementById('postTocNav');
  var content = document.getElementById('postContent');
  var tocSidebar = document.getElementById('postToc');

  if (!tocNav || !content) return;

  // Gather h2, h3 elements
  var headings = content.querySelectorAll('h2, h3');
  if (headings.length === 0) return;

  var tocItems = [];
  headings.forEach(function (h, i) {
    if (!h.id) {
      h.id = 'toc-' + i;
    }
    tocItems.push({
      el: h,
      tag: h.tagName.toLowerCase(),
      id: h.id,
      text: h.textContent,
    });
  });

  // Build TOC HTML
  var html = '';
  tocItems.forEach(function (item) {
    html += '<a class="toc-' + item.tag + '" href="#' + item.id + '">' + item.text + '</a>';
  });
  tocNav.innerHTML = html;

  // Scroll spy
  var links = tocNav.querySelectorAll('a');
  var SCROLL_OFFSET = 120;

  function updateActive() {
    var scrollTop = window.scrollY;
    var activeIdx = -1;

    for (var i = tocItems.length - 1; i >= 0; i--) {
      var offsetTop = tocItems[i].el.offsetTop;
      if (scrollTop >= offsetTop - SCROLL_OFFSET) {
        activeIdx = i;
        break;
      }
    }
    if (activeIdx === -1 && tocItems.length > 0) {
      activeIdx = 0;
    }

    for (var j = 0; j < links.length; j++) {
      if (j === activeIdx) {
        links[j].classList.add('active');
      } else {
        links[j].classList.remove('active');
      }
    }
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  // Mobile toggle
  var tocTitle = document.querySelector('.post-toc-title');
  if (tocTitle && window.innerWidth <= 1024) {
    tocTitle.addEventListener('click', function () {
      tocNav.classList.toggle('open');
      tocTitle.classList.toggle('open');
    });
  }
})();
