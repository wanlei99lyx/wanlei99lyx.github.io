(function (root, factory) {
  var api = factory(root);

  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.AiNewsNav = api;
    if (root && root.document) {
      if (root.document.readyState === 'loading') {
        root.document.addEventListener('DOMContentLoaded', function () {
          api.init(root.document, root);
        }, { once: true });
      } else {
        api.init(root.document, root);
      }
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function (host) {
  'use strict';

  function toggleExpanded(items, button, preservedItems) {
    var expanded = button.getAttribute('aria-expanded') !== 'true';
    var force = !expanded;
    var preserved = preservedItems || [];
    var label;

    Array.prototype.forEach.call(items || [], function (item) {
      if (preserved.indexOf(item) !== -1) {
        return;
      }
      item.hidden = force;
      if (item.classList && typeof item.classList.toggle === 'function') {
        item.classList.toggle('is-hidden', force);
      }
    });

    button.setAttribute('aria-expanded', String(expanded));
    label = button.querySelector('span');
    if (label) {
      label.textContent = expanded ? '收起' : '查看全部';
      button.setAttribute('aria-label', label.textContent);
    }

    return expanded;
  }

  function isNarrow(root) {
    if (root && typeof root.matchMedia === 'function') {
      return root.matchMedia('(max-width: 1024px)').matches;
    }
    return !!root && typeof root.innerWidth === 'number' && root.innerWidth <= 1024;
  }

  function revealCurrentItem(currentLink) {
    var item = currentLink;

    while (item && item !== currentLink.ownerDocument && item.parentElement) {
      item = item.parentElement;
      if (item.classList && typeof item.classList.contains === 'function' &&
          item.classList.contains('is-hidden')) {
        item.hidden = false;
        if (typeof item.classList.remove === 'function') {
          item.classList.remove('is-hidden');
        }
        return item;
      }
    }

    return null;
  }

  function init(documentObject, rootObject) {
    var document = documentObject || (host && host.document);
    var root = rootObject || host;
    var button;
    var list;
    var expandableItems;
    var currentLink;
    var currentItem;

    if (!document || typeof document.querySelector !== 'function') {
      return;
    }

    button = document.querySelector('#aiNewsNavMore');
    list = document.querySelector('#aiNewsNavList');
    if (!list) {
      return;
    }

    expandableItems = typeof list.querySelectorAll === 'function'
      ? Array.prototype.slice.call(list.querySelectorAll('.is-hidden'))
      : [];

    if (typeof list.querySelector === 'function') {
      currentLink = list.querySelector('[aria-current="page"]');
      if (currentLink) {
        currentItem = revealCurrentItem(currentLink);
        if (currentItem && expandableItems.indexOf(currentItem) === -1) {
          expandableItems.push(currentItem);
        }
        if (isNarrow(root) && typeof currentLink.scrollIntoView === 'function') {
          currentLink.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        }
      }
    }

    if (isNarrow(root)) {
      Array.prototype.forEach.call(expandableItems, function (item) {
        item.hidden = false;
        if (item.classList && typeof item.classList.remove === 'function') {
          item.classList.remove('is-hidden');
        }
      });
    }

    if (button && typeof button.addEventListener === 'function') {
      button.addEventListener('click', function () {
        toggleExpanded(expandableItems, button, currentItem ? [currentItem] : []);
      });
    }

  }

  return {
    toggleExpanded: toggleExpanded,
    init: init,
  };
});
