var App = {
  currentRoute: '',
  currentParams: {},

  init: function() {
    this.setupRouting();
    this.updateHeader();
    this.updateBadges();
    this.setupGlobalListeners();
    this.showWelcomeModal();
    this.updateUserName();
  },

  setupGlobalListeners: function() {
    var self = this;
    document.getElementById('app').addEventListener('click', function(e) {
      var card = e.target.closest('.product-card');
      if (card && card.dataset.pid) {
        self.navigate('producto', { id: parseInt(card.dataset.pid) });
      }
    });
  },

  setupRouting: function() {
    var self = this;
    window.addEventListener('hashchange', function() { self.handleRoute(); });
    this.handleRoute();
  },

  handleRoute: function() {
    var hash = window.location.hash.replace('#', '') || 'home';
    var parts = hash.split('/');
    var route = parts[0];
    var params = {};
    if (parts.length > 1) params.id = parts[1];

    this.currentRoute = route;
    this.currentParams = params;

    this.renderRoute(route, params);
    this.updateSidebar(route);
  },

  navigate: function(route, params) {
    params = params || {};
    var hash = route;
    if (params.id) hash += '/' + params.id;
    window.location.hash = hash;
  },

  renderRoute: function(route, params) {
    var app = document.getElementById('app');

    if (route === 'home') { this.renderHome(app); }
    else if (route === 'test') { this.renderTest(app); }
    else if (route === 'productos') { this.renderProductos(app); }
    else if (route === 'producto') { this.renderProducto(app, params); }
    else if (route === 'diary') { SkinDiary.render(); }
    else if (route === 'consultas') { Consultas.render(); }
    else if (route === 'profile') {
      if (typeof Profile !== 'undefined' && Profile.init) {
        app.innerHTML = '';
        Profile.init();
      } else {
        this.renderProfile(app);
      }
    }
    else if (route === 'cart') { this.renderCart(app); }
    else if (route === 'favorites') { this.renderFavorites(app); }
    else if (route === 'contacto') { this.renderContacto(app); }
    else if (route === 'privacidad') { this.renderPrivacidad(app); }
    else if (route === 'terminos') { this.renderTerminos(app); }
    else { this.renderHome(app); }

    window.scrollTo(0, 0);
  },

  updateSidebar: function(route) {
    var items = document.querySelectorAll('.sidebar-item');
    items.forEach(function(item) {
      item.classList.toggle('active', item.dataset.route === route);
    });
  },

  toggleSidebar: function() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('open');
  },

  updateHeader: function() {
    var user = Storage.getCurrentUser();
    var btn = document.getElementById('loginBtn');
    var nameEl = document.getElementById('sidebarUserName');
    if (user) {
      btn.textContent = '👤';
      btn.title = 'Cerrar sesión';
      btn.onclick = function() {
        Storage.logout();
        App.updateHeader();
        App.navigate('home');
        Utils.showModal({ type: 'success', title: 'Sesión cerrada', message: 'Has cerrado sesión correctamente.' });
      };
      nameEl.textContent = user.name || 'Mi Perfil';
    } else {
      btn.textContent = '🔑';
      btn.title = 'Login/Registro';
      btn.onclick = function() { App.showLogin(); };
      nameEl.textContent = 'Iniciar sesión';
    }
  },

  updateBadges: function() {
    var cart = Storage.getCart();
    var favs = Storage.getFavorites();
    var cartBadge = document.getElementById('cartBadge');
    var favBadge = document.getElementById('favBadge');
    if (cart.length > 0) { cartBadge.textContent = cart.length; cartBadge.classList.add('visible'); }
    else { cartBadge.classList.remove('visible'); }
    if (favs.length > 0) { favBadge.textContent = favs.length; favBadge.classList.add('visible'); }
    else { favBadge.classList.remove('visible'); }
  },

  renderHome: function(app) {
    var profile = Storage.getProfile();
    var hasProfile = !!profile;

    var ctaSection = hasProfile
      ? '<div class="hero-cta-group" style="margin-top:1.5rem;">' +
        '<a class="btn btn-primary btn-lg hero-cta" onclick="App.navigate(\'productos\')">Ver mis Productos 🧴</a>' +
        '<a class="btn btn-secondary btn-lg hero-cta" onclick="App.navigate(\'profile\')">Mi Rutina 📋</a></div>'
      : '<div class="hero-cta-group">' +
        '<a class="btn btn-primary btn-lg hero-cta" onclick="App.navigate(\'test\')">Prueba Gratuita 🧪<span class="hero-cta-sub">Diagnóstico de tipo de piel + recomendaciones personalizadas</span></a>' +
        '<a class="btn btn-outline-light btn-lg hero-cta" onclick="App.showPlans()" style="border-color:var(--wine);color:var(--wine);">Plan Best ✨<span class="hero-cta-sub">Planes de suscripción con beneficios exclusivos</span></a></div>';

    var carouselHtml = this.renderCarousel();

    app.innerHTML = '<div class="hero">' +
      '<div class="hero-bg"></div>' +
      '<div class="hero-content">' +
      '<h1>Fórmulas <em>reales</em>.<br>Resultados <em>reales</em>.<br>Tu piel en manos <em>expertas</em>.</h1>' +
      '<p>Descubre tu tipo de piel con nuestro diagnóstico dermatológico y recibe una rutina personalizada con los mejores productos para ti.</p>' +
      ctaSection +
      '</div>' +
      '<div class="hero-image"><div class="hero-image-placeholder">🧴</div></div>' +
      '</div>' +
      carouselHtml +
      '<div class="premium-section"><button class="premium-btn" onclick="App.showPremiumPayment()">Plan Premium<span class="premium-btn-sub">ingresa al control total</span></button></div>' +
      '<div class="benefits">' +
      '<div class="benefit-card"><div class="benefit-icon">🔬</div><h3>Diagnóstico preciso</h3><p>Basado en ciencia dermatológica y validado por expertos.</p></div>' +
      '<div class="benefit-card"><div class="benefit-icon">🎯</div><h3>Recomendaciones a medida</h3><p>Productos seleccionados específicamente para tu tipo de piel.</p></div>' +
      '<div class="benefit-card"><div class="benefit-icon">📊</div><h3>Seguimiento continuo</h3><p>Registra tu evolución y ajusta tu rutina cuando lo necesites.</p></div>' +
      '</div>';

    this.initCarousel();
  },

  renderCarousel: function() {
    var slides = [
      {
        type: 'productos',
        img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140"%3E%3Crect fill="%23f3e5f5" width="140" height="140" rx="12"/%3E%3Ccircle cx="70" cy="55" r="20" fill="%23ce93d8"/%3E%3Crect x="45" y="80" width="50" height="6" rx="3" fill="%23ab47bc"/%3E%3Crect x="55" y="92" width="30" height="6" rx="3" fill="%23ab47bc" opacity="0.6"/%3E%3Ctext x="70" y="125" text-anchor="middle" fill="%236A4C93" font-size="14" font-weight="bold"%3E🧴%3C/text%3E%3C/svg%3E',
        title: 'Productos más pedidos',
        body: 'Descubre los favoritos de nuestra comunidad: limpiadores, hidratantes y protectores solares mejor evaluados.',
        action: 'Ver detalles',
        onClick: "App.navigate('productos')"
      },
      {
        type: 'dermatologas',
        avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"%3E%3Crect fill="%23ce93d8" width="44" height="44" rx="22"/%3E%3Ccircle cx="22" cy="16" r="8" fill="%23f3e5f5"/%3E%3Cellipse cx="22" cy="32" rx="14" ry="10" fill="%23f3e5f5"/%3E%3C/svg%3E',
        name: 'Dra. Valeria Mendoza',
        specialty: 'Dermatóloga Cosmética',
        title: 'Dermatólogas recomendadas',
        body: 'Agenda una consulta con nuestras especialistas certificadas en cuidado de la piel.',
        action: 'Agendar consulta',
        onClick: "App.navigate('consultas')"
      },
      {
        type: 'educativo',
        img: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140"%3E%3Crect fill="%23e8eaf6" width="140" height="140" rx="12"/%3E%3Ccircle cx="70" cy="50" r="18" fill="%239c27b0" opacity="0.2"/%3E%3Ctext x="70" y="56" text-anchor="middle" fill="%236A4C93" font-size="24"%3E📖%3C/text%3E%3Crect x="35" y="75" width="70" height="6" rx="3" fill="%236A4C93" opacity="0.3"/%3E%3Crect x="45" y="87" width="50" height="6" rx="3" fill="%236A4C93" opacity="0.2"/%3E%3Crect x="50" y="99" width="40" height="6" rx="3" fill="%236A4C93" opacity="0.15"/%3E%3C/svg%3E',
        title: 'Contenido educativo',
        body: 'Aprende sobre rutinas de cuidado, ingredientes clave y las mejores promociones del mes.',
        action: 'Leer más',
        onClick: "App.navigate('contacto')"
      }
    ];

    var slidesHtml = '';
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i];
      var imgOrAvatar = '';
      if (s.type === 'dermatologas') {
        imgOrAvatar = '<div class="carousel-slide-author">' +
          '<img class="carousel-slide-avatar" src="' + s.avatar + '" alt="' + s.name + '">' +
          '<div class="carousel-slide-author-info"><strong>' + s.name + '</strong>' + s.specialty + '</div></div>';
      } else {
        imgOrAvatar = '<img class="carousel-slide-img" src="' + s.img + '" alt="' + s.title + '">';
      }
      slidesHtml += '<div class="carousel-slide" data-index="' + i + '">' +
        imgOrAvatar +
        '<div class="carousel-slide-content">' +
        '<h3>' + s.title + '</h3>' +
        '<p>' + s.body + '</p>' +
        '<button class="btn btn-primary" onclick="' + s.onClick + '">' + s.action + '</button>' +
        '</div></div>';
    }

    var dotsHtml = '';
    for (var i = 0; i < slides.length; i++) {
      dotsHtml += '<button class="carousel-dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" onclick="App.goToSlide(' + i + ')"></button>';
    }

    return '<div class="carousel-section">' +
      '<div class="carousel-wrapper">' +
      '<button class="carousel-btn carousel-btn-prev" onclick="App.prevSlide()">‹</button>' +
      '<div class="carousel-track">' + slidesHtml + '</div>' +
      '<button class="carousel-btn carousel-btn-next" onclick="App.nextSlide()">›</button>' +
      '</div>' +
      '<div class="carousel-dots">' + dotsHtml + '</div>' +
      '</div>';
  },

  initCarousel: function() {
    var track = document.querySelector('.carousel-track');
    if (!track) return;
    this.carouselIndex = 0;
    this.carouselCount = track.children.length;
    this.updateCarousel();
    var self = this;
    if (this._carouselTimer) clearInterval(this._carouselTimer);
    this._carouselTimer = setInterval(function() { self.nextSlide(); }, 4000);
  },

  updateCarousel: function() {
    var track = document.querySelector('.carousel-track');
    var dots = document.querySelectorAll('.carousel-dot');
    if (!track) return;
    track.style.transform = 'translateX(-' + (this.carouselIndex * 100) + '%)';
    dots.forEach(function(d, i) {
      d.classList.toggle('active', i === this.carouselIndex);
    }.bind(this));
  },

  nextSlide: function() {
    if (this.carouselIndex === undefined) return;
    this.carouselIndex = (this.carouselIndex + 1) % this.carouselCount;
    this.updateCarousel();
    this.resetCarouselTimer();
  },

  prevSlide: function() {
    if (this.carouselIndex === undefined) return;
    this.carouselIndex = (this.carouselIndex - 1 + this.carouselCount) % this.carouselCount;
    this.updateCarousel();
    this.resetCarouselTimer();
  },

  goToSlide: function(index) {
    this.carouselIndex = index;
    this.updateCarousel();
    this.resetCarouselTimer();
  },

  resetCarouselTimer: function() {
    if (this._carouselTimer) {
      clearInterval(this._carouselTimer);
      var self = this;
      this._carouselTimer = setInterval(function() { self.nextSlide(); }, 4000);
    }
  },

  renderTest: function(app) {
    if (typeof QuizApp === 'undefined') return;
    var profile = Storage.getProfile();
    app.innerHTML = '<div id="quizContainer"></div>';
    if (!window.quizApp) { window.quizApp = new QuizApp(); }
    window.quizApp.state = 'welcome';
    window.quizApp.currentQuestion = 0;
    window.quizApp.answers = {};
    window.quizApp.render();
  },

  renderProductos: function(app) {
    var profile = Storage.getProfile();
    var allProducts = Products.getAll();
    var recommended = profile ? Products.getBySkinType(profile.typeName) : allProducts;
    var productsHtml = '';
    try {
      productsHtml = recommended.slice(0, 6).map(function(p) { return Products.renderCard(p); }).join('');
    } catch(e) {
      productsHtml = '<p style="color:var(--wine);padding:1rem;">Error al cargar productos. Intenta de nuevo.</p>';
    }
    app.innerHTML = '<div class="container">' +
      '<h2 style="margin-bottom:1rem;">🧴 Productos</h2>' +
        '<input type="text" class="input-search" placeholder="Buscar productos..." id="searchInput" onkeyup="var e=event||window.event;if(e.key==\'Enter\')App.searchProducts()">' +
      '<div class="chips" style="margin-top:0.75rem;">' +
      '<div class="chip" onclick="App.filterProducts(\'normal\',this)">Normal</div>' +
      '<div class="chip" onclick="App.filterProducts(\'dry\',this)">Seca</div>' +
      '<div class="chip" onclick="App.filterProducts(\'oily\',this)">Grasa</div>' +
      '<div class="chip" onclick="App.filterProducts(\'mixed\',this)">Mixta</div>' +
      '<div class="chip" onclick="App.filterProducts(\'sensitive\',this)">Sensible</div>' +
      '<div class="chip" onclick="App.filterProducts(\'all\',this)">Todos</div></div>' +
      '<div class="product-grid" id="productGrid">' +
      productsHtml +
      '</div></div>';
  },

  filterProducts: function(type, el) {
    document.querySelectorAll('.chip').forEach(function(c) { c.classList.remove('active'); });
    if (el) el.classList.add('active');
    var products = type === 'all' ? Products.getAll() : Products.filter({ type: type });
    document.getElementById('productGrid').innerHTML = products.map(function(p) { return Products.renderCard(p); }).join('');
  },

  searchProducts: function() {
    var search = document.getElementById('searchInput').value.trim();
    var results = search ? Products.filter({ search: search }) : Products.getAll();
    document.getElementById('productGrid').innerHTML = results.map(function(p) { return Products.renderCard(p); }).join('');
  },

  renderProducto: function(app, params) {
    var id = params.id;
    if (!id) { App.navigate('productos'); return; }
    var p = Products.getById(id);
    if (!p) { App.navigate('productos'); return; }

    var storedReviews = Storage.getProductReviews(id);
    if (storedReviews) p.reviews = storedReviews;

    var badges = '';
    if (p.eco) badges += '<span class="badge badge-eco">🌿 Ecológico</span>';
    if (p.cruelty) badges += '<span class="badge badge-cruelty">🐰 Sin crueldad</span>';

    var stars = '';
    for (var i = 0; i < Math.round(p.rating); i++) stars += '★';
    for (var i = Math.round(p.rating); i < 5; i++) stars += '☆';

    var isFav = Storage.isFavorite(p.id);

    app.innerHTML = '<div class="container">' +
      '<div class="goto-back" onclick="App.navigate(\'productos\')">← Volver a productos</div>' +
      '<div style="position:relative;">' +
      '<img src="' + p.image + '" alt="' + p.name + '" class="product-detail-img">' +
      '<button class="product-card-fav ' + (isFav ? 'active' : '') + '" onclick="App.toggleFav(' + p.id + ',this)">' + (isFav ? '♥' : '♡') + '</button>' +
      '</div>' +
      '<div class="product-detail-header">' +
      '<div><div class="product-detail-name">' + p.name + '</div><div class="product-detail-brand">' + p.brand + '</div></div>' +
      '<div class="product-detail-price">S/.' + p.price.toFixed(2) + '</div></div>' +
      '<div class="product-detail-rating"><span>' + stars + '</span><span>' + p.rating + '</span><span style="margin-left:0.5rem;">' + badges + '</span></div>' +
      '<div class="product-detail-section"><h4>Ingredientes</h4><p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:0.5rem;">' + p.ingredients + '</p><div class="ingredients-list">' + p.ingredients.split(', ').map(function(i) { return '<span class="ingredient-tag">' + i + '</span>'; }).join('') + '</div></div>' +
      '<div class="product-detail-section"><h4>¿Cómo ayuda a mi piel?</h4><p style="color:var(--text-secondary);">' + p.description + '</p><p style="color:var(--text-secondary);margin-top:0.5rem;">' + p.howHelps + '</p></div>' +
      '<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">' +
      '<a class="btn btn-primary" style="flex:1;text-decoration:none;" href="https://w.app/dermamatch" target="_blank">📱 Contactar tienda</a>' +
      '</div>' +
      '</div>';
  },

  toggleFav: function(productId, btn) {
    var isNowFav = Storage.toggleFavorite(productId);
    btn.textContent = isNowFav ? '♥' : '♡';
    btn.classList.toggle('active', isNowFav);
  },

  renderCart: function(app) {
    var cart = Storage.getCart();
    if (cart.length === 0) {
      app.innerHTML = '<div class="container"><div class="empty-state"><div class="empty-state-icon">🛒</div><h3>Tu carrito está vacío</h3><p>Explora nuestros productos y agrega los que más te gusten.</p><button class="btn btn-primary" onclick="App.navigate(\'productos\')">Ver productos</button></div></div>';
      return;
    }
    var total = 0;
    var itemsHtml = cart.map(function(item) {
      total += item.price * item.qty;
      return '<div class="cart-item">' +
        '<img src="' + item.image + '" alt="' + item.name + '">' +
        '<div class="cart-item-info"><div class="cart-item-name">' + item.name + '</div><div class="cart-item-price">S/.' + (item.price * item.qty).toFixed(2) + '</div></div>' +
        '<button class="cart-item-remove" onclick="App.removeFromCart(' + item.id + ')">✕</button></div>';
    }).join('');
    app.innerHTML = '<div class="container">' +
      '<h2 style="margin-bottom:1rem;">🛒 Carrito</h2>' +
      itemsHtml +
      '<div class="cart-total"><span>Total</span><span>S/.' + total.toFixed(2) + '</span></div>' +
      '<div class="cart-section">' +
      '<h3>Opción de entrega</h3>' +
      '<label class="cart-radio"><input type="radio" name="deliveryOption" value="delivery" checked onchange="App.toggleDeliveryAddress(true)"> 🚚 Delivery a domicilio</label>' +
      '<label class="cart-radio"><input type="radio" name="deliveryOption" value="pickup" onchange="App.toggleDeliveryAddress(false)"> 🏪 Recojo en tienda</label>' +
      '</div>' +
      '<div id="deliveryAddressSection" class="cart-section">' +
      '<h3>Dirección de entrega</h3>' +
      '<input type="text" id="cartAddress" class="cart-input" placeholder="Dirección (ej. Av. Larco 123, Miraflores)">' +
      '<input type="text" id="cartCity" class="cart-input" placeholder="Ciudad / Distrito">' +
      '<input type="text" id="cartPhone" class="cart-input" placeholder="Teléfono de contacto">' +
      '<textarea id="cartNotes" class="cart-input cart-textarea" placeholder="Notas adicionales (opcional)"></textarea>' +
      '</div>' +
      '<div class="cart-section">' +
      '<h3>Medio de pago</h3>' +
      '<label class="cart-radio"><input type="radio" name="paymentMethod" value="card" checked> 💳 Tarjeta de crédito/débito</label>' +
      '<label class="cart-radio"><input type="radio" name="paymentMethod" value="cash"> 💵 Efectivo</label>' +
      '<label class="cart-radio"><input type="radio" name="paymentMethod" value="yape"> 📱 Yape</label>' +
      '<label class="cart-radio"><input type="radio" name="paymentMethod" value="plin"> 📱 Plin</label>' +
      '<label class="cart-radio"><input type="radio" name="paymentMethod" value="transfer"> 🏦 Transferencia bancaria</label>' +
      '</div>' +
      '<button class="btn btn-primary btn-full" onclick="App.checkout()">Finalizar compra</button>' +
      '</div>';
  },

  removeFromCart: function(productId) {
    Storage.removeFromCart(productId);
    App.renderCart(document.getElementById('app'));
  },

  checkout: function() {
    var deliveryOption = document.querySelector('input[name="deliveryOption"]:checked');
    var paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    var deliveryType = deliveryOption ? deliveryOption.value : 'delivery';
    var paymentType = paymentMethod ? paymentMethod.value : 'card';

    var paymentNames = {
      card: 'Tarjeta de crédito/débito',
      cash: 'Efectivo',
      yape: 'Yape',
      plin: 'Plin',
      transfer: 'Transferencia bancaria'
    };

    var deliveryMessage = deliveryType === 'delivery'
      ? 'Tu pedido será entregado en la dirección indicada.'
      : 'Puedes recoger tu pedido en nuestra tienda.';

    Storage.clearCart();
    Utils.showModal({ type: 'success', title: '¡Compra realizada!', message: 'Gracias por tu compra. Pagarás con ' + (paymentNames[paymentType] || paymentType) + '. ' + deliveryMessage });
    App.navigate('home');
  },

  toggleDeliveryAddress: function(show) {
    var section = document.getElementById('deliveryAddressSection');
    if (section) {
      section.style.display = show ? 'block' : 'none';
    }
  },

  renderFavorites: function(app) {
    var favs = Storage.getFavorites();
    if (favs.length === 0) {
      app.innerHTML = '<div class="container"><div class="empty-state"><div class="empty-state-icon">♥</div><h3>Sin favoritos</h3><p>Agrega productos a tus favoritos para encontrarlos rápido.</p></div></div>';
      return;
    }
    var products = favs.map(function(id) { return Products.getById(id); }).filter(function(p) { return p; });
    app.innerHTML = '<div class="container">' +
      '<h2 style="margin-bottom:1rem;">♥ Favoritos</h2>' +
      '<div class="fav-grid">' + products.map(function(p) { return Products.renderCard(p); }).join('') + '</div></div>';
  },

  renderProfile: function(app) {
    var profile = Storage.getProfile();
    var routine = Storage.getRoutine();
    var user = Storage.getCurrentUser();

    if (!profile) {
      app.innerHTML = '<div class="container">' +
        '<div class="empty-state"><div class="empty-state-icon">👤</div><h3>Completa tu diagnóstico</h3><p>Primero necesitas realizar el test de piel para ver tu perfil.</p>' +
        '<button class="btn btn-primary" onclick="App.navigate(\'test\')">Ir al Test</button></div></div>';
      return;
    }

    var concernsHtml = (profile.concerns || []).map(function(c) {
      return '<span class="concern-tag">' + c + '</span>';
    }).join('');

    var morning = [];
    var night = [];
    for (var i = 0; i < routine.length; i++) {
      if (routine[i].timeOfDay === 'morning') morning.push(routine[i]);
      else night.push(routine[i]);
    }

    var routineHtml = routine.length === 0
      ? '<div class="empty-state" style="padding:1.5rem 0;"><div class="empty-state-icon">🧴</div><p>Aún no tienes productos en tu rutina.</p></div>'
      : '<div class="routine-section"><h3>☀️ Mañana</h3>' + (morning.length === 0 ? '<p style="color:var(--text-secondary);">Sin productos</p>' : morning.map(function(p) { return App.renderRoutineProduct(p); }).join('')) + '</div>' +
        '<div class="routine-section"><h3>🌙 Noche</h3>' + (night.length === 0 ? '<p style="color:var(--text-secondary);">Sin productos</p>' : night.map(function(p) { return App.renderRoutineProduct(p); }).join('')) + '</div>';

    app.innerHTML = '<div class="container">' +
      '<div class="profile-header">' +
      '<div class="profile-avatar">🧴</div>' +
      '<h2 class="profile-title">' + (user ? user.name : 'Mi Perfil') + '</h2>' +
      '<div class="skin-type-badge">' + profile.typeName + '</div>' +
      '<div class="concerns-list">' + concernsHtml + '</div>' +
      '<p class="profile-description">' + (profile.description || '') + '</p>' +
      '<div class="profile-actions">' +
      '<button class="btn btn-secondary btn-sm" onclick="Utils.confirmReset()">🔄 Reevaluar mi piel</button>' +
      '<button class="btn btn-primary btn-sm" onclick="App.navigate(\'productos\')">🧴 Explorar productos</button>' +
      '</div></div>' +
      '<h3 style="margin-bottom:1rem;">Mi Rutina</h3>' +
      routineHtml +
      '</div>';
  },

  renderRoutineProduct: function(p) {
    return '<div class="routine-product">' +
      '<img src="' + p.product.image + '" class="routine-product-img">' +
      '<div class="routine-product-info"><div class="routine-product-name">' + p.product.name + '</div>' +
      '<div class="routine-product-date">Guardado: ' + Utils.formatDate(p.savedDate) + '</div></div>' +
      '<button class="btn btn-secondary btn-sm" style="padding:0.375rem 0.5rem;font-size:0.75rem;" onclick="App.removeFromRoutine(' + p.productId + ')">✕</button></div>';
  },

  removeFromRoutine: function(productId) {
    Storage.removeFromRoutine(productId);
    App.navigate('profile');
    Utils.showModal({ type: 'info', title: 'Eliminado', message: 'Producto eliminado de tu rutina.' });
  },

  renderContacto: function(app) {
    app.innerHTML = '<div class="container">' +
      '<h2 style="margin-bottom:1rem;">✉ Contacto</h2>' +
      '<p style="color:var(--text-secondary);margin-bottom:1.5rem;">¿Tienes dudas o sugerencias? Escríbenos y te responderemos a la brevedad.</p>' +
      '<div class="consulta-form">' +
      '<label>Nombre</label><input type="text" id="contactName">' +
      '<label>Email</label><input type="email" id="contactEmail">' +
      '<label>Mensaje</label><textarea id="contactMessage" placeholder="Escribe tu mensaje..."></textarea>' +
      '<button class="btn btn-primary btn-full" onclick="App.sendContact()">Enviar mensaje</button>' +
      '</div></div>';
  },

  renderPrivacidad: function(app) {
    app.innerHTML = '<div class="container legal-page">' +
      '<h2>🔒 Política de Privacidad</h2>' +
      '<p class="legal-update">Última actualización: junio 2026</p>' +
      '<div class="legal-content">' +
      '<h3>1. Datos que recopilamos</h3>' +
      '<p>En DermaMatch recopilamos información que nos proporcionas directamente al registrarte, como nombre, correo electrónico, y los datos de diagnóstico de tu piel (tipo de piel, alergias, preocupaciones cutáneas). También recopilamos información automáticamente, como datos de navegación y uso del sitio.</p>' +
      '<h3>2. Uso de tu información</h3>' +
      '<p>Utilizamos tus datos para: personalizar tu experiencia y recomendaciones de productos, procesar tus pedidos y pagos, enviarte comunicaciones relacionadas con tu cuenta y pedidos, mejorar nuestro sitio y servicios, y cumplir con obligaciones legales.</p>' +
      '<h3>3. Protección de datos</h3>' +
      '<p>Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal contra acceso no autorizado, pérdida o divulgación. Tus datos de pago son procesados de forma segura a través de pasarelas de pago certificadas.</p>' +
      '<h3>4. Compartir información</h3>' +
      '<p>No vendemos tu información personal a terceros. Podemos compartir datos con proveedores de servicios de confianza (procesamiento de pagos, envíos) que actúan bajo nuestra instrucción y cumplen con estrictas políticas de privacidad.</p>' +
      '<h3>5. Tus derechos</h3>' +
      '<p>Tienes derecho a acceder, rectificar, cancelar u oponerte al tratamiento de tus datos personales. Puedes ejercer estos derechos contactándonos a través de nuestro formulario de contacto. También puedes solicitar la eliminación de tu cuenta y datos asociados.</p>' +
      '<h3>6. Cookies</h3>' +
      '<p>Utilizamos cookies esenciales para el funcionamiento del sitio y cookies analíticas para mejorar tu experiencia. Puedes configurar tu navegador para rechazar cookies, aunque algunas funciones podrían verse afectadas.</p>' +
      '<h3>7. Contacto</h3>' +
      '<p>Si tienes preguntas sobre esta política de privacidad, contáctanos a través de la sección de contacto o escribiendo a privacidad@dermamatch.pe</p>' +
      '</div>' +
      '<button class="btn btn-secondary" onclick="App.navigate(\'home\')">← Volver al inicio</button>' +
      '</div>';
  },

  renderTerminos: function(app) {
    app.innerHTML = '<div class="container legal-page">' +
      '<h2>📋 Términos y Condiciones</h2>' +
      '<p class="legal-update">Última actualización: junio 2026</p>' +
      '<div class="legal-content">' +
      '<h3>1. Aceptación de los términos</h3>' +
      '<p>Al acceder y usar este sitio web, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo con alguna parte, no debes usar nuestros servicios.</p>' +
      '<h3>2. Descripción del servicio</h3>' +
      '<p>DermaMatch es una plataforma de diagnóstico y recomendación de cuidado de la piel. Nuestras recomendaciones se basan en la información proporcionada por el usuario y no sustituyen el consejo médico profesional. Siempre recomendamos consultar con un dermatólogo certificado.</p>' +
      '<h3>3. Registro de cuenta</h3>' +
      '<p>Para acceder a ciertos servicios, debes crear una cuenta. Eres responsable de mantener la confidencialidad de tus credenciales y de todas las actividades realizadas con tu cuenta. Debes proporcionar información precisa y actualizada.</p>' +
      '<h3>4. Compras y pagos</h3>' +
      '<p>Los precios de los productos están expresados en soles peruanos (S/) e incluyen IGV. Nos reservamos el derecho de modificar precios en cualquier momento. El pago se procesa al confirmar la compra a través de los métodos de pago disponibles (tarjeta, efectivo, Yape, Plin, transferencia bancaria).</p>' +
      '<h3>5. Envíos y entregas</h3>' +
      '<p>Ofrecemos opciones de delivery a domicilio y recojo en tienda. Los plazos de entrega varían según la ubicación. No nos responsabilizamos por retrasos causados por terceros o fuerza mayor.</p>' +
      '<h3>6. Devoluciones y reembolsos</h3>' +
      '<p>Aceptamos devoluciones dentro de los 7 días calendario posteriores a la recepción del producto, siempre que esté sin usar y en su empaque original. Los gastos de devolución corren por cuenta del cliente, salvo productos defectuosos.</p>' +
      '<h3>7. Propiedad intelectual</h3>' +
      '<p>Todo el contenido del sitio (textos, imágenes, logotipos, diseño) es propiedad de DermaMatch o tiene licencia de uso. Queda prohibida la reproducción total o parcial sin autorización expresa.</p>' +
      '<h3>8. Limitación de responsabilidad</h3>' +
      '<p>DermaMatch no se responsabiliza por daños indirectos o derivados del uso del sitio. Las recomendaciones de productos son informativas y no garantizan resultados específicos para cada tipo de piel.</p>' +
      '<h3>9. Modificaciones</h3>' +
      '<p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados en el sitio y entrarán en vigencia inmediatamente después de su publicación.</p>' +
      '<h3>10. Contacto</h3>' +
      '<p>Para consultas sobre estos términos, contáctanos a través de la sección de contacto o al correo legal@dermamatch.pe</p>' +
      '</div>' +
      '<button class="btn btn-secondary" onclick="App.navigate(\'home\')">← Volver al inicio</button>' +
      '</div>';
  },

  sendContact: function() {
    var name = document.getElementById('contactName').value.trim();
    var email = document.getElementById('contactEmail').value.trim();
    var message = document.getElementById('contactMessage').value.trim();
    if (!name || !email || !message) {
      Utils.showModal({ type: 'error', title: 'Campos requeridos', message: 'Completa todos los campos.' });
      return;
    }
    Utils.showModal({ type: 'success', title: 'Mensaje enviado', message: 'Gracias ' + name + ', te responderemos pronto.' });
  },

  showLogin: function() {
    var existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.className = 'modal-overlay';
    div.innerHTML = '<div class="modal-content" id="loginModal">' +
      '<h3>🔑 Iniciar sesión</h3>' +
      '<div id="loginForm">' +
      '<label>Email</label><input type="email" id="loginEmail" placeholder="tu@email.com">' +
      '<label>Contraseña</label><input type="password" id="loginPassword" placeholder="••••••••">' +
      '<button class="btn btn-primary btn-full" data-action="login">Iniciar sesión</button>' +
      '<div class="form-footer">¿No tienes cuenta? <a data-action="showRegister">Regístrate aquí</a></div>' +
      '<div class="form-footer"><a data-action="closeModal">Cancelar</a></div></div></div>';
    document.body.appendChild(div);
    this.bindModalActions(div);
  },

  bindModalActions: function(modal) {
    var self = this;
    modal.querySelectorAll('[data-action]').forEach(function(el) {
      el.onclick = function(e) {
        var action = el.dataset.action;
        if (action === 'login') { self.doLogin(); }
        else if (action === 'showRegister') { self.showRegister(); }
        else if (action === 'closeModal') { modal.remove(); }
        else if (action === 'register') { self.doRegister(); }
        else if (action === 'selectPlan') { self.selectPlan(el.dataset.plan); }
        else if (action === 'closeModalPlans') { modal.remove(); }
      };
    });
  },

  doLogin: function() {
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value.trim();
    if (!email || !password) { Utils.showModal({ type: 'error', title: 'Campos requeridos', message: 'Completa todos los campos.' }); return; }
    var result = Storage.login(email, password);
    if (result.ok) {
      document.querySelector('.modal-overlay').remove();
      App.updateHeader();
      Utils.showModal({ type: 'success', title: '¡Bienvenida!', message: 'Has iniciado sesión como ' + result.user.name });
    } else {
      Utils.showModal({ type: 'error', title: 'Error', message: result.error });
    }
  },

  showRegister: function() {
    document.getElementById('loginModal').innerHTML = '<h3>📝 Registro</h3>' +
      '<div id="registerForm">' +
      '<label>Nombre</label><input type="text" id="regName" placeholder="Tu nombre">' +
      '<label>Email</label><input type="email" id="regEmail" placeholder="tu@email.com">' +
      '<label>Contraseña</label><input type="password" id="regPassword" placeholder="••••••••">' +
      '<button class="btn btn-primary btn-full" data-action="register">Crear cuenta</button>' +
      '<div class="form-footer">¿Ya tienes cuenta? <a data-action="showLogin">Inicia sesión</a></div></div>';
    var modal = document.querySelector('.modal-overlay');
    this.bindModalActions(modal);
  },

  doRegister: function() {
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value.trim();
    if (!name || !email || !password) { Utils.showModal({ type: 'error', title: 'Campos requeridos', message: 'Completa todos los campos.' }); return; }
    var result = Storage.register(name, email, password);
    if (result.ok) {
      document.querySelector('.modal-overlay').remove();
      App.updateHeader();
      Utils.showModal({ type: 'success', title: '¡Registrada!', message: 'Cuenta creada correctamente. Bienvenida ' + name });
    } else {
      Utils.showModal({ type: 'error', title: 'Error', message: result.error });
    }
  },

  showPlans: function() {
    var existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.className = 'modal-overlay';
    div.innerHTML = '<div class="modal-content" style="max-width:600px;overflow-y:auto;max-height:90vh;">' +
      '<h3>✨ Plan Best</h3>' +
      '<p style="text-align:center;color:var(--text-secondary);margin-bottom:1.5rem;">Elige el plan perfecto para tu piel</p>' +
      '<div class="plans-grid">' +
      '<div class="plan-card"><h3>Básico</h3><div class="plan-price">Gratis<span></span></div><ul><li>Diagnóstico de piel</li><li>Recomendaciones básicas</li><li>Skin-Diary</li></ul><button class="btn btn-secondary btn-full" data-action="closeModalPlans">Actual</button></div>' +
      '<div class="plan-card featured"><h3>Pro</h3><div class="plan-price">S/9.99<span>/mes</span></div><ul><li>Todo lo de Básico</li><li>Rutina personalizada</li><li>Consultas con expertos</li><li>Descuentos en productos</li></ul><button class="btn btn-primary btn-full" data-action="selectPlan" data-plan="Pro">Elegir plan</button></div>' +
      '<div class="plan-card"><h3>Premium</h3><div class="plan-price">S/19.99<span>/mes</span></div><ul><li>Todo lo de Pro</li><li>1 asesoría virtual al mes</li><li>Envío gratis en pedidos</li><li>Acceso a lanzamientos exclusivos</li></ul><button class="btn btn-primary btn-full" data-action="selectPlan" data-plan="Premium">Elegir plan</button></div>' +
      '</div>' +
      '<button class="btn btn-secondary btn-full" style="margin-top:1rem;" data-action="closeModalPlans">Cerrar</button></div>';
    document.body.appendChild(div);
    this.bindModalActions(div);
  },

  selectPlan: function(plan) {
    document.querySelector('.modal-overlay').remove();
    Utils.showModal({ type: 'success', title: '¡Plan seleccionado!', message: 'Has elegido el plan ' + plan + '. Pronto recibirás instrucciones de pago.' });
  },

  showPremiumPayment: function() {
    var existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.className = 'modal-overlay';
    div.innerHTML = '<div class="modal-content" style="max-width:480px;">' +
      '<h3>✨ Plan Premium</h3>' +
      '<p style="text-align:center;color:var(--text-secondary);margin-bottom:1.5rem;">Ingresa al control total de tu cuidado de piel</p>' +
      '<div class="cart-section">' +
      '<h3>Tipo de tarjeta</h3>' +
      '<label class="cart-radio"><input type="radio" name="cardType" value="visa" checked> 💳 Visa</label>' +
      '<label class="cart-radio"><input type="radio" name="cardType" value="mastercard"> 💳 Mastercard</label>' +
      '<label class="cart-radio"><input type="radio" name="cardType" value="amex"> 💳 American Express</label>' +
      '</div>' +
      '<div class="cart-section">' +
      '<h3>Datos de pago</h3>' +
      '<input type="text" class="cart-input" placeholder="Número de tarjeta" id="pmCardNumber">' +
      '<div style="display:flex;gap:0.75rem;">' +
      '<input type="text" class="cart-input" placeholder="MM/AA" id="pmCardExpiry" style="flex:1;">' +
      '<input type="text" class="cart-input" placeholder="CVC" id="pmCardCvc" style="flex:1;">' +
      '</div>' +
      '<input type="text" class="cart-input" placeholder="Nombre del titular" id="pmCardName">' +
      '</div>' +
      '<button class="btn btn-primary btn-full" onclick="App.processPremiumPayment()">Activar Plan Premium — S/19.99/mes</button>' +
      '<button class="btn btn-secondary btn-full" style="margin-top:0.5rem;" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button>' +
      '</div>';
    document.body.appendChild(div);
  },

  processPremiumPayment: function() {
    var cardNumber = document.getElementById('pmCardNumber').value.trim();
    var cardExpiry = document.getElementById('pmCardExpiry').value.trim();
    var cardCvc = document.getElementById('pmCardCvc').value.trim();
    var cardName = document.getElementById('pmCardName').value.trim();
    if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
      Utils.showModal({ type: 'error', title: 'Campos requeridos', message: 'Completa todos los datos de pago.' });
      return;
    }
    document.querySelector('.modal-overlay').remove();
    Utils.showModal({ type: 'success', title: '¡Plan Premium activado!', message: 'Bienvenida al control total. Disfruta de todos los beneficios exclusivos.' });
  },

  showWelcomeModal: function() {
    var savedName = localStorage.getItem('dmUserName');
    if (savedName) return;
    var existing = document.querySelector('.modal-overlay');
    if (existing) return;

    var div = document.createElement('div');
    div.className = 'modal-overlay';
    div.id = 'welcomeModal';
    div.innerHTML = '<div class="modal-content" style="text-align:center;">' +
      '<div style="font-size:3rem;margin-bottom:0.75rem;">🧴</div>' +
      '<h3>¡Bienvenida a DermaMatch!</h3>' +
      '<p style="color:var(--text-secondary);margin-bottom:1.25rem;font-size:0.9rem;">Queremos conocerte. ¿Cómo te llamas?</p>' +
      '<input type="text" id="welcomeNameInput" class="cart-input" placeholder="Tu nombre" style="text-align:center;font-size:1.05rem;" maxlength="30">' +
      '<button class="btn btn-primary btn-full" onclick="App.saveWelcomeName()">Guardar</button>' +
      '</div>';
    document.body.appendChild(div);
    setTimeout(function() {
      var input = document.getElementById('welcomeNameInput');
      if (input) input.focus();
    }, 300);
  },

  saveWelcomeName: function() {
    var name = document.getElementById('welcomeNameInput').value.trim();
    if (!name) {
      Utils.showModal({ type: 'error', title: 'Nombre requerido', message: 'Por favor ingresa tu nombre para continuar.' });
      return;
    }
    localStorage.setItem('dmUserName', name);
    var modal = document.getElementById('welcomeModal');
    if (modal) modal.remove();
    this.updateUserName();
    Utils.showModal({ type: 'success', title: '¡Guardado!', message: 'Bienvenida, ' + name + '. Tu nombre ha sido guardado.' });
  },

  updateUserName: function() {
    var name = localStorage.getItem('dmUserName') || 'Beauty Lover';
    var els = document.querySelectorAll('.usuario-nombre');
    for (var i = 0; i < els.length; i++) {
      els[i].textContent = name;
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
