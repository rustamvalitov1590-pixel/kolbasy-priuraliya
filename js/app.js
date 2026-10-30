/* ==========================================================================
   Колбасы Приуралья — логика интерфейса (без зависимостей)
   ========================================================================== */
(function () {
  'use strict';

  var KP = window.KP;
  if (!KP) return;
  var config = KP.config;
  var categories = KP.categories;
  var products = KP.products;

  /* ---------- Утилиты ---------- */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var byId = {};
  products.forEach(function (p) { byId[p.id] = p; });
  var catById = {};
  categories.forEach(function (c) { catById[c.id] = c; });

  var nf = new Intl.NumberFormat('ru-RU');
  function money(n) { return nf.format(Math.round(n)) + '\u00a0₸'; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function icon(name, cls) {
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  }
  function step(p) { return p.unit === 'кг' ? 0.5 : 1; }
  function qtyLabel(p, q) {
    return p.unit === 'кг' ? String(q).replace('.', ',') + '\u00a0кг' : q + '\u00a0шт';
  }
  function priceUnit(p) { return p.unit === 'кг' ? '/кг' : '/шт'; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  var mqDesktop = window.matchMedia('(min-width: 768px)');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Корзина ---------- */
  var Cart = (function () {
    var KEY = 'kp-cart-v1';
    var items = {};
    try { items = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { items = {}; }
    // Удаляем позиции, которых больше нет в каталоге
    Object.keys(items).forEach(function (id) { if (!byId[id] || !(items[id] > 0)) delete items[id]; });
    var listeners = [];

    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* приватный режим */ }
      listeners.forEach(function (fn) { fn(); });
    }
    return {
      get: function (id) { return items[id] || 0; },
      set: function (id, q) {
        q = Math.round(q * 10) / 10;
        if (q > 0) items[id] = Math.min(q, 99); else delete items[id];
        save();
      },
      inc: function (id) { this.set(id, this.get(id) + step(byId[id])); },
      dec: function (id) { this.set(id, this.get(id) - step(byId[id])); },
      clear: function () { items = {}; save(); },
      entries: function () {
        return Object.keys(items).map(function (id) { return { p: byId[id], q: items[id] }; });
      },
      count: function () { return Object.keys(items).length; },
      total: function () {
        return this.entries().reduce(function (s, e) { return s + e.p.price * e.q; }, 0);
      },
      on: function (fn) { listeners.push(fn); }
    };
  })();

  // Синхронизация между вкладками
  window.addEventListener('storage', function (e) { if (e.key === 'kp-cart-v1') location.reload(); });

  /* ---------- Шаблоны ---------- */
  function actionHTML(p, size) {
    var q = Cart.get(p.id);
    var lg = size === 'lg';
    if (q > 0) {
      return '<div class="stepper' + (lg ? ' stepper--lg' : '') + '" role="group" aria-label="Количество: ' + esc(p.name) + '">' +
        '<button type="button" data-dec="' + p.id + '" aria-label="Уменьшить">' + icon('minus') + '</button>' +
        '<span class="stepper__value" aria-live="polite">' + qtyLabel(p, q) + '</span>' +
        '<button type="button" data-inc="' + p.id + '" aria-label="Увеличить">' + icon('plus') + '</button>' +
        '</div>';
    }
    if (lg) {
      return '<button type="button" class="btn btn--primary" data-add="' + p.id + '">' + icon('plus', 'icon--sm') + 'В корзину</button>';
    }
    return '<button type="button" class="add-btn" data-add="' + p.id + '" aria-label="Добавить в корзину: ' + esc(p.name) + '">' + icon('plus') + '</button>';
  }

  function tagsHTML(p) {
    var t = '';
    if (p.tags.indexOf('hit') > -1) t += '<span class="tag tag--hit">Хит</span>';
    if (p.tags.indexOf('new') > -1) t += '<span class="tag tag--new">Новинка</span>';
    return t ? '<div class="card__tags">' + t + '</div>' : '';
  }

  function cardHTML(p) {
    return '<article class="card">' +
      '<button type="button" class="card__open" data-open="' + p.id + '"><span class="visually-hidden">Подробнее: ' + esc(p.name) + '</span></button>' +
      '<div class="card__media"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="600" height="600">' + tagsHTML(p) + '</div>' +
      '<div class="card__body">' +
        '<p class="card__meta">' + esc(p.pack) + '</p>' +
        '<h3 class="card__title">' + esc(p.name) + '</h3>' +
        '<div class="card__foot">' +
          '<p class="price">' + money(p.price) + '<span class="price__unit">' + priceUnit(p) + '</span></p>' +
          '<div class="card__action" data-action-for="' + p.id + '">' + actionHTML(p) + '</div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function refreshActions() {
    $$('[data-action-for]').forEach(function (el) {
      var p = byId[el.getAttribute('data-action-for')];
      if (!p) return;
      var html = actionHTML(p, el.getAttribute('data-size'));
      if (el.innerHTML !== html) {
        var hadFocus = el.contains(document.activeElement);
        var focusedAttr = hadFocus ? (document.activeElement.hasAttribute('data-inc') ? 'data-inc' : document.activeElement.hasAttribute('data-dec') ? 'data-dec' : null) : null;
        el.innerHTML = html;
        if (hadFocus) {
          var target = (focusedAttr && el.querySelector('[' + focusedAttr + ']')) || el.querySelector('button');
          if (target) target.focus({ preventScroll: true });
        }
      }
    });
  }

  function refreshBadges() {
    var n = Cart.count();
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = n ? String(n) : '';
      el.setAttribute('data-count', String(n));
    });
    $$('[data-cart-label]').forEach(function (el) {
      el.setAttribute('aria-label', n ? 'Корзина, позиций: ' + n : 'Корзина');
    });
  }

  /* ---------- Шторки (dialog) ---------- */
  var openDialogs = 0;
  function lockScroll(on) {
    openDialogs = Math.max(0, openDialogs + (on ? 1 : -1));
    document.documentElement.classList.toggle('is-locked', openDialogs > 0);
  }

  function openSheet(dlg) {
    if (dlg.open) return;
    dlg.classList.remove('is-closing');
    dlg.style.transform = '';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    // Фокус на саму шторку, а не на первую кнопку (без лишней обводки), Tab ведёт дальше по элементам
    dlg.focus({ preventScroll: true });
    lockScroll(true);
  }

  function closeSheet(dlg) {
    if (!dlg.open || dlg.classList.contains('is-closing')) return;
    var done = function () {
      dlg.classList.remove('is-closing');
      dlg.style.transform = '';
      if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
      lockScroll(false);
    };
    if (reduceMotion.matches) return done();
    dlg.classList.add('is-closing');
    var fired = false;
    var finish = function () { if (fired) return; fired = true; done(); };
    dlg.addEventListener('animationend', function h(e) {
      if (e.target !== dlg) return;
      dlg.removeEventListener('animationend', h);
      finish();
    });
    setTimeout(finish, 320);
  }

  function setupSheet(dlg) {
    // Esc
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeSheet(dlg); });
    // Клик по подложке
    dlg.addEventListener('click', function (e) {
      if (e.target === dlg) closeSheet(dlg);
      if (e.target.closest('[data-close]')) closeSheet(dlg);
    });
    // Свайп вниз для закрытия (мобильные)
    var handle = dlg.querySelectorAll('.sheet__grabber, .sheet__head');
    var startY = 0, dy = 0, dragging = false;
    function down(e) {
      if (mqDesktop.matches || e.target.closest('button')) return;
      dragging = true; startY = e.clientY; dy = 0;
      dlg.style.transition = 'none';
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    function move(e) {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      dlg.style.transform = 'translateY(' + dy + 'px)';
    }
    function up() {
      if (!dragging) return;
      dragging = false;
      dlg.style.transition = 'transform .2s cubic-bezier(.2,.7,.2,1)';
      if (dy > 90) { dlg.style.transform = ''; dlg.style.transition = ''; closeSheet(dlg); }
      else { dlg.style.transform = ''; setTimeout(function () { dlg.style.transition = ''; }, 200); }
    }
    Array.prototype.forEach.call(handle, function (h) {
      h.addEventListener('pointerdown', down);
      h.addEventListener('pointermove', move);
      h.addEventListener('pointerup', up);
      h.addEventListener('pointercancel', up);
    });
  }

  /* ---------- Карточка товара ---------- */
  var productSheet, cartSheet, currentProduct = null;

  function buildProductSheet() {
    productSheet = document.createElement('dialog');
    productSheet.className = 'sheet';
    productSheet.tabIndex = -1;
    productSheet.setAttribute('aria-labelledby', 'pd-title');
    productSheet.innerHTML =
      '<div class="sheet__grabber" aria-hidden="true"></div>' +
      '<div class="sheet__head"><span class="eyebrow" data-pd-cat></span>' +
      '<button type="button" class="icon-btn sheet__close" data-close aria-label="Закрыть">' + icon('x') + '</button></div>' +
      '<div class="sheet__body" data-pd-body></div>' +
      '<div class="sheet__foot"><div class="pd__buy" data-pd-buy></div></div>';
    document.body.appendChild(productSheet);
    setupSheet(productSheet);
    productSheet.addEventListener('close', function () { currentProduct = null; });
  }

  function renderProductBuy() {
    if (!currentProduct) return;
    var p = currentProduct;
    var q = Cart.get(p.id);
    var buy = $('[data-pd-buy]', productSheet);
    buy.innerHTML =
      '<div><div class="pd__price">' + money(p.price) + '<span class="price__unit"> ' + priceUnit(p) + '</span></div>' +
      (q ? '<div class="field__hint">В корзине на ' + money(p.price * q) + '</div>' : '<div class="field__hint">' + (p.unit === 'кг' ? 'Весовой товар, шаг 0,5 кг' : 'Цена за упаковку') + '</div>') + '</div>' +
      '<div data-action-for="' + p.id + '" data-size="lg">' + actionHTML(p, 'lg') + '</div>';
  }

  function openProduct(id) {
    var p = byId[id];
    if (!p) return;
    currentProduct = p;
    var c = catById[p.cat];
    $('[data-pd-cat]', productSheet).textContent = c ? c.name : '';
    $('[data-pd-body]', productSheet).innerHTML =
      '<div class="pd">' +
        '<div class="pd__media"><img src="' + p.img + '" alt="' + esc(p.name) + '" width="800" height="800">' + tagsHTML(p) + '</div>' +
        '<div class="pd__info">' +
          '<h2 class="pd__title" id="pd-title">' + esc(p.name) + '</h2>' +
          '<p class="pd__desc">' + esc(p.desc) + '</p>' +
          '<dl class="pd__specs">' +
            '<dt>Сырьё</dt><dd>' + esc(p.meat) + '</dd>' +
            '<dt>Фасовка</dt><dd>' + esc(p.pack) + '</dd>' +
            '<dt>Стандарт</dt><dd>Халал</dd>' +
            '<dt>Производство</dt><dd>' + esc(config.city) + ', собственный цех</dd>' +
          '</dl>' +
          '<div class="note">' + icon('info') + '<span>Состав, срок годности и пищевая ценность указаны на этикетке. Уточнить наличие можно по телефону <a href="' + config.phones[0].href + '" class="nowrap"><b>' + config.phones[0].label + '</b></a>.</span></div>' +
        '</div>' +
      '</div>';
    renderProductBuy();
    $('[data-pd-body]', productSheet).scrollTop = 0;
    openSheet(productSheet);
  }

  /* ---------- Корзина: шторка ---------- */
  function buildCartSheet() {
    cartSheet = document.createElement('dialog');
    cartSheet.className = 'sheet sheet--side';
    cartSheet.tabIndex = -1;
    cartSheet.setAttribute('aria-labelledby', 'cart-title');
    cartSheet.innerHTML =
      '<div class="sheet__grabber" aria-hidden="true"></div>' +
      '<div class="sheet__head"><h2 class="sheet__title" id="cart-title">Корзина</h2>' +
      '<div><button type="button" class="btn btn--ghost btn--sm" data-cart-clear>Очистить</button>' +
      '<button type="button" class="icon-btn sheet__close" data-close aria-label="Закрыть">' + icon('x') + '</button></div></div>' +
      '<div class="sheet__body" data-cart-body></div>' +
      '<div class="sheet__foot" data-cart-foot></div>';
    document.body.appendChild(cartSheet);
    setupSheet(cartSheet);

    cartSheet.addEventListener('change', function (e) {
      if (e.target.name === 'delivery') {
        var addr = $('[data-address-field]', cartSheet);
        var isDelivery = e.target.value === 'delivery';
        addr.hidden = !isDelivery;
        $('input', addr).required = isDelivery;
      }
    });
    cartSheet.addEventListener('submit', function (e) {
      e.preventDefault();
      submitOrder(e.target);
    });
    $('[data-cart-clear]', cartSheet).addEventListener('click', function () {
      if (Cart.count() && window.confirm('Удалить все товары из корзины?')) Cart.clear();
    });
  }

  var orderDraft = { name: '', phone: '', delivery: 'pickup', address: '', comment: '' };

  function saveDraft() {
    var f = $('form', cartSheet);
    if (!f) return;
    orderDraft = {
      name: f.name.value, phone: f.phone.value,
      delivery: f.delivery.value, address: f.address.value, comment: f.comment.value
    };
  }

  function renderCart() {
    if (!cartSheet) return;
    var body = $('[data-cart-body]', cartSheet);
    var foot = $('[data-cart-foot]', cartSheet);
    var entries = Cart.entries();
    $('[data-cart-clear]', cartSheet).hidden = !entries.length;

    if (!entries.length) {
      body.innerHTML =
        '<div class="cart-empty">' + icon('bag') +
        '<h3 class="h3">В корзине пока пусто</h3>' +
        '<p class="muted">Добавьте колбасы и деликатесы из каталога — заказ отправится нам в WhatsApp.</p></div>';
      foot.innerHTML = '<a class="btn btn--primary btn--block" href="catalog.html">Перейти в каталог</a>';
      return;
    }

    // Список товаров обновляем, форму — сохраняем как есть (чтобы не терять ввод)
    var listHTML = '<ul class="cart-list" role="list">' + entries.map(function (e) {
      var p = e.p;
      return '<li class="cart-item">' +
        '<img class="cart-item__img" src="' + p.img + '" alt="" width="64" height="64" loading="lazy">' +
        '<div class="cart-item__main">' +
          '<div class="cart-item__top"><div><div class="cart-item__name">' + esc(p.name) + '</div>' +
          '<div class="cart-item__unit">' + money(p.price) + ' ' + priceUnit(p) + '</div></div>' +
          '<button type="button" class="cart-item__remove" data-remove="' + p.id + '" aria-label="Удалить ' + esc(p.name) + '">' + icon('trash', 'icon--sm') + '</button></div>' +
          '<div class="cart-item__bottom"><div data-action-for="' + p.id + '">' + actionHTML(p) + '</div>' +
          '<b class="nowrap">' + money(p.price * e.q) + '</b></div>' +
        '</div></li>';
    }).join('') + '</ul>';

    var list = $('[data-cart-list]', body);
    if (list) {
      list.innerHTML = listHTML;
    } else {
      body.innerHTML =
        '<div data-cart-list>' + listHTML + '</div>' +
        '<form class="form" id="order-form" novalidate>' +
          '<h3 class="cart-section-title">Получатель</h3>' +
          '<div class="field"><label for="o-name">Имя</label><input class="input" id="o-name" name="name" autocomplete="name" required></div>' +
          '<div class="field"><label for="o-phone">Телефон</label><input class="input" id="o-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="+7 7__ ___-__-__" required></div>' +
          '<div class="field"><span class="field__label" id="o-del-label">Способ получения</span>' +
            '<div class="segmented" role="radiogroup" aria-labelledby="o-del-label">' +
              '<input type="radio" id="o-pickup" name="delivery" value="pickup" checked><label for="o-pickup">Самовывоз</label>' +
              '<input type="radio" id="o-delivery" name="delivery" value="delivery"><label for="o-delivery">Доставка</label>' +
            '</div>' +
            '<span class="field__hint" data-pickup-hint>Фирменный магазин: ' + esc(config.address) + '</span>' +
          '</div>' +
          '<div class="field" data-address-field hidden><label for="o-address">Адрес доставки</label><input class="input" id="o-address" name="address" autocomplete="street-address" placeholder="Улица, дом, квартира"></div>' +
          '<div class="field"><label for="o-comment">Комментарий</label><textarea class="textarea" id="o-comment" name="comment" rows="2" placeholder="Например: нарезать, удобное время"></textarea></div>' +
        '</form>';
      var f = $('form', body);
      f.name.value = orderDraft.name;
      f.phone.value = orderDraft.phone;
      f.address.value = orderDraft.address;
      f.comment.value = orderDraft.comment;
      if (orderDraft.delivery === 'delivery') {
        f.querySelector('#o-delivery').checked = true;
        $('[data-address-field]', body).hidden = false;
        f.address.required = true;
      }
      f.addEventListener('input', saveDraft);
      f.addEventListener('change', saveDraft);
    }

    foot.innerHTML =
      '<div class="cart-total"><span class="cart-total__label">Итого, ориентировочно<br>Точная сумма — после взвешивания</span>' +
      '<span class="cart-total__value">' + money(Cart.total()) + '</span></div>' +
      '<button type="submit" form="order-form" class="btn btn--primary btn--block">' + icon('whatsapp', 'icon--sm') + 'Отправить заказ в WhatsApp</button>';
  }

  function openCart() {
    renderCart();
    openSheet(cartSheet);
  }

  function submitOrder(form) {
    var invalid = Array.prototype.find.call(form.elements, function (el) { return el.willValidate && !el.checkValidity(); });
    var phoneDigits = form.phone.value.replace(/\D/g, '');
    if (!invalid && phoneDigits.length < 10) { invalid = form.phone; }
    if (invalid) {
      invalid.focus();
      invalid.setAttribute('aria-invalid', 'true');
      toast('Заполните ' + (invalid === form.phone ? 'номер телефона' : invalid === form.name ? 'имя' : 'адрес доставки'));
      return;
    }
    var lines = ['Здравствуйте! Хочу оформить заказ:', ''];
    Cart.entries().forEach(function (e, i) {
      lines.push((i + 1) + '. ' + e.p.name + ' — ' + qtyLabel(e.p, e.q).replace(/\u00a0/g, ' ') + ' (' + money(e.p.price * e.q).replace(/\u00a0/g, ' ') + ')');
    });
    lines.push('', 'Итого ≈ ' + money(Cart.total()).replace(/\u00a0/g, ' '), '');
    lines.push('Имя: ' + form.name.value.trim());
    lines.push('Телефон: ' + form.phone.value.trim());
    lines.push(form.delivery.value === 'delivery' ? 'Доставка: ' + form.address.value.trim() : 'Самовывоз: ' + config.address);
    if (form.comment.value.trim()) lines.push('Комментарий: ' + form.comment.value.trim());
    openWhatsApp(lines.join('\n'));
  }

  function openWhatsApp(text) {
    var url = 'https://wa.me/' + config.whatsapp + '?text=' + encodeURIComponent(text);
    var w = window.open(url, '_blank', 'noopener');
    if (!w) location.href = url;
  }

  /* ---------- Тост ---------- */
  var toastEl, toastTimer;
  function toast(text, withCartLink) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
      toastEl.addEventListener('click', function (e) {
        if (e.target.closest('[data-toast-cart]')) { hideToast(); if (productSheet.open) closeSheet(productSheet); openCart(); }
      });
    }
    toastEl.innerHTML = icon('check') + '<span>' + esc(text) + '</span>' +
      (withCartLink ? '<button type="button" data-toast-cart>Корзина</button>' : '');
    requestAnimationFrame(function () { toastEl.classList.add('is-visible'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 2600);
  }
  function hideToast() { if (toastEl) toastEl.classList.remove('is-visible'); }

  /* ---------- Режим работы ---------- */
  var DAY_SHORT = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  var DAY_ACC = ['в воскресенье', 'в понедельник', 'во вторник', 'в среду', 'в четверг', 'в пятницу', 'в субботу'];

  function localNow() {
    var now = new Date();
    return new Date(now.getTime() + (now.getTimezoneOffset() + config.utcOffset * 60) * 60000);
  }

  function storeStatus() {
    var t = localNow();
    var d = t.getDay();
    var h = t.getHours() + t.getMinutes() / 60;
    var today = config.hours[d];
    if (today && h >= today[0] && h < today[1]) return { open: true, text: 'Открыто до ' + pad(today[1]) + ':00' };
    if (today && h < today[0]) return { open: false, text: 'Закрыто · откроется в ' + pad(today[0]) + ':00' };
    for (var i = 1; i <= 7; i++) {
      var nd = (d + i) % 7;
      var hh = config.hours[nd];
      if (hh) return { open: false, text: 'Закрыто · откроется ' + (i === 1 ? 'завтра' : DAY_ACC[nd]) + ' в ' + pad(hh[0]) + ':00' };
    }
    return { open: false, text: 'Закрыто' };
  }

  function renderStatus() {
    var s = storeStatus();
    $$('[data-status]').forEach(function (el) {
      el.textContent = s.text;
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
    });
  }

  function renderHours() {
    var els = $$('[data-hours]');
    if (!els.length) return;
    var order = [1, 2, 3, 4, 5, 6, 0];
    var groups = [];
    order.forEach(function (d) {
      var h = config.hours[d];
      var key = h ? h.join('-') : 'off';
      var last = groups[groups.length - 1];
      if (last && last.key === key) last.days.push(d); else groups.push({ key: key, h: h, days: [d] });
    });
    var today = localNow().getDay();
    var html = groups.map(function (g) {
      var label = g.days.length > 1 ? DAY_SHORT[g.days[0]] + '–' + DAY_SHORT[g.days[g.days.length - 1]] : DAY_SHORT[g.days[0]];
      var val = g.h ? pad(g.h[0]) + ':00–' + pad(g.h[1]) + ':00' : 'выходной';
      var cls = g.days.indexOf(today) > -1 ? ' class="is-today"' : '';
      return '<dt' + cls + '>' + label + '</dt><dd' + cls + '>' + val + '</dd>';
    }).join('');
    els.forEach(function (el) { el.innerHTML = html; });
  }

  /* ---------- Главная ---------- */
  function renderHome() {
    var cats = $('[data-cats]');
    if (cats) {
      cats.innerHTML = categories.map(function (c) {
        return '<li><a class="cat" href="catalog.html?cat=' + c.id + '">' +
          '<span class="cat__img"><img src="' + c.img + '" alt="" loading="lazy" decoding="async" width="300" height="300"></span>' +
          '<span class="cat__name">' + esc(c.short) + '</span></a></li>';
      }).join('');
    }
    var hits = $('[data-hits]');
    if (hits) {
      hits.innerHTML = products.filter(function (p) { return p.tags.indexOf('hit') > -1; }).slice(0, 8).map(cardHTML).join('');
    }
  }

  /* ---------- Каталог ---------- */
  function setupCatalog() {
    var root = $('[data-catalog]');
    if (!root) return;
    var chipsEl = $('[data-chips]');
    var searchEl = $('[data-search]');
    var clearEl = $('[data-search-clear]');
    var sortEl = $('[data-sort]');
    var infoEl = $('[data-result-info]');
    var params = new URLSearchParams(location.search);
    var state = {
      cat: catById[params.get('cat')] ? params.get('cat') : 'all',
      q: params.get('q') || '',
      sort: params.get('sort') || 'default'
    };
    searchEl.value = state.q;
    sortEl.value = state.sort;

    function norm(s) { return s.toLowerCase().replace(/ё/g, 'е').replace(/[«»"]/g, ''); }

    function filtered() {
      var q = norm(state.q.trim());
      var list = products.filter(function (p) {
        if (state.cat !== 'all' && p.cat !== state.cat) return false;
        if (!q) return true;
        return norm(p.name + ' ' + p.meat + ' ' + (catById[p.cat] || {}).name).indexOf(q) > -1;
      });
      if (state.sort === 'price-asc') list.sort(function (a, b) { return a.price - b.price; });
      if (state.sort === 'price-desc') list.sort(function (a, b) { return b.price - a.price; });
      if (state.sort === 'name') list.sort(function (a, b) { return norm(a.name).localeCompare(norm(b.name), 'ru'); });
      return list;
    }

    function renderChips() {
      var q = norm(state.q.trim());
      var countFor = function (cid) {
        return products.filter(function (p) {
          return (cid === 'all' || p.cat === cid) && (!q || norm(p.name + ' ' + p.meat).indexOf(q) > -1);
        }).length;
      };
      chipsEl.innerHTML = [{ id: 'all', short: 'Все' }].concat(categories).map(function (c) {
        return '<button type="button" class="chip" data-chip="' + c.id + '" aria-pressed="' + (state.cat === c.id) + '">' +
          esc(c.short) + ' <span class="chip__count">' + countFor(c.id) + '</span></button>';
      }).join('');
    }

    function render() {
      var list = filtered();
      clearEl.hidden = !state.q;
      var grouped = state.cat === 'all' && !state.q && state.sort === 'default';
      if (!list.length) {
        root.innerHTML = '<div class="empty">' + icon('search') + '<h3 class="h3">Ничего не нашли</h3>' +
          '<p>Попробуйте изменить запрос или <button type="button" class="link-arrow" data-reset>сбросить фильтры</button></p></div>';
      } else if (grouped) {
        root.innerHTML = categories.map(function (c) {
          var items = list.filter(function (p) { return p.cat === c.id; });
          if (!items.length) return '';
          return '<section class="catalog-group" aria-labelledby="g-' + c.id + '">' +
            '<div class="catalog-group__head"><h2 class="h3" id="g-' + c.id + '">' + esc(c.name) + '</h2><span>' + items.length + ' поз.</span></div>' +
            '<div class="products products--catalog">' + items.map(cardHTML).join('') + '</div></section>';
        }).join('');
      } else {
        root.innerHTML = '<div class="products products--catalog">' + list.map(cardHTML).join('') + '</div>';
      }
      infoEl.textContent = grouped ? 'В каталоге ' + list.length + ' позиций' : 'Найдено: ' + list.length;
      var title = state.cat !== 'all' ? catById[state.cat].name : 'Каталог продукции';
      var h1 = $('[data-catalog-title]');
      if (h1) h1.textContent = title;
      document.title = title + ' — Колбасы Приуралья';
    }

    function syncURL() {
      var p = new URLSearchParams();
      if (state.cat !== 'all') p.set('cat', state.cat);
      if (state.q) p.set('q', state.q);
      if (state.sort !== 'default') p.set('sort', state.sort);
      var qs = p.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
    }

    function update() { renderChips(); render(); syncURL(); }

    chipsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-chip]');
      if (!b) return;
      state.cat = b.getAttribute('data-chip');
      update();
      b = chipsEl.querySelector('[data-chip="' + state.cat + '"]');
      if (b && b.scrollIntoView) b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      var top = root.getBoundingClientRect().top + window.scrollY - 180;
      if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: 'auto' });
    });
    var t;
    searchEl.addEventListener('input', function () {
      clearTimeout(t);
      t = setTimeout(function () { state.q = searchEl.value; update(); }, 150);
    });
    searchEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); searchEl.blur(); } });
    clearEl.addEventListener('click', function () { searchEl.value = ''; state.q = ''; update(); searchEl.focus(); });
    sortEl.addEventListener('change', function () { state.sort = sortEl.value; update(); });
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-reset]')) {
        state = { cat: 'all', q: '', sort: 'default' };
        searchEl.value = ''; sortEl.value = 'default';
        update();
      }
    });

    update();
    if (location.hash === '#search') setTimeout(function () { searchEl.focus(); }, 50);

    // Тень у панели фильтров при прилипании
    var toolbar = $('.toolbar');
    var sentinel = $('[data-toolbar-sentinel]');
    if (toolbar && sentinel && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        toolbar.classList.toggle('is-stuck', !en[0].isIntersecting);
      }, { rootMargin: '-' + (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--appbar-h'), 10) + 1) + 'px 0px 0px 0px' }).observe(sentinel);
    }
  }

  /* ---------- Форма для оптовиков ---------- */
  function setupWholesale() {
    $$('[data-wholesale-form]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var invalid = Array.prototype.find.call(f.elements, function (el) { return el.willValidate && !el.checkValidity(); });
        if (invalid) { invalid.focus(); toast('Заполните обязательные поля'); return; }
        var lines = ['Здравствуйте! Заявка на оптовое сотрудничество.', ''];
        lines.push('Компания / магазин: ' + f.company.value.trim());
        lines.push('Контактное лицо: ' + f.name.value.trim());
        lines.push('Телефон: ' + f.phone.value.trim());
        if (f.city && f.city.value.trim()) lines.push('Город: ' + f.city.value.trim());
        if (f.message.value.trim()) lines.push('', f.message.value.trim());
        openWhatsApp(lines.join('\n'));
      });
    });
  }

  /* ---------- Делегирование кликов ---------- */
  document.addEventListener('click', function (e) {
    var t;
    if ((t = e.target.closest('[data-add]'))) {
      var id = t.getAttribute('data-add');
      Cart.set(id, step(byId[id]) * (byId[id].unit === 'кг' ? 2 : 1)); // весовой — сразу 1 кг
      toast('Добавлено: ' + byId[id].name, true);
      return;
    }
    if ((t = e.target.closest('[data-inc]'))) { Cart.inc(t.getAttribute('data-inc')); return; }
    if ((t = e.target.closest('[data-dec]'))) { Cart.dec(t.getAttribute('data-dec')); return; }
    if ((t = e.target.closest('[data-remove]'))) { Cart.set(t.getAttribute('data-remove'), 0); return; }
    if ((t = e.target.closest('[data-open]'))) { openProduct(t.getAttribute('data-open')); return; }
    if ((t = e.target.closest('[data-cart-open]'))) { e.preventDefault(); openCart(); return; }
  });

  /* ---------- Шапка ---------- */
  function setupHeader() {
    var header = $('.header');
    if (!header) return;
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 4); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Старт ---------- */
  buildProductSheet();
  buildCartSheet();
  Cart.on(function () {
    refreshActions();
    refreshBadges();
    if (cartSheet.open) renderCart();
    if (productSheet.open) renderProductBuy();
  });

  renderHome();
  setupCatalog();
  setupWholesale();
  setupHeader();
  renderStatus();
  renderHours();
  refreshBadges();
  setInterval(renderStatus, 60000);

  if (location.hash === '#cart') { history.replaceState(null, '', location.pathname + location.search); openCart(); }

  // Год в подвале
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

