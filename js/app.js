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
    else if (route === 'test') {
      if (Storage.isAuthenticated()) { this.renderTest(app); }
      else { this.renderHome(app); this.showLogin(); }
    }
    else if (route === 'recomendados') {
      if (Storage.isAuthenticated()) { this.renderRecomendados(app); }
      else { this.renderHome(app); this.showLogin(); }
    }
    else if (route === 'productos') { this.renderProductos(app); }
    else if (route === 'producto') { this.renderProducto(app, params); }
    else if (route === 'diary') {
      if (Storage.isAuthenticated()) { SkinDiary.render(); }
      else { this.renderHome(app); this.showLogin(); }
    }
    else if (route === 'consultas') {
      if (Storage.isAuthenticated()) { Consultas.render(); }
      else { this.renderHome(app); this.showLogin(); }
    }
    else if (route === 'profile') {
      if (!Storage.isAuthenticated()) { this.renderHome(app); this.showLogin(); return; }
      if (typeof Profile !== 'undefined' && Profile.init) {
        app.innerHTML = '';
        Profile.init();
      } else {
        this.renderProfile(app);
      }
    }
    else if (route === 'cart') {
      if (Storage.isAuthenticated()) { this.renderCart(app); }
      else { this.renderHome(app); this.showLogin(); }
    }
    else if (route === 'favorites') {
      if (Storage.isAuthenticated()) { this.renderFavorites(app); }
      else { this.renderHome(app); this.showLogin(); }
    }
    else if (route === 'contacto') { this.renderContacto(app); }
    else if (route === 'privacidad') { this.renderPrivacidad(app); }
    else if (route === 'terminos') { this.renderTerminos(app); }
    // Panel admin - requiere autenticación y rol admin
    else if (route === 'admin') {
      if (typeof Admin !== 'undefined' && Admin.isAdmin()) {
        Admin.renderDashboard();
      } else {
        this.renderHome(app);
        Utils.showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para acceder al panel admin.' });
      }
    }
    else if (route === 'admin-products') {
      if (typeof Admin !== 'undefined' && Admin.isAdmin()) {
        Admin.renderProducts();
      } else {
        this.renderHome(app);
        Utils.showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para acceder al panel admin.' });
      }
    }
    else if (route === 'admin-users') {
      if (typeof Admin !== 'undefined' && Admin.isAdmin()) {
        Admin.renderUsers();
      } else {
        this.renderHome(app);
        Utils.showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para acceder al panel admin.' });
      }
    }
    else if (route === 'admin-orders') {
      if (typeof Admin !== 'undefined' && Admin.isAdmin()) {
        Admin.renderOrders();
      } else {
        this.renderHome(app);
        Utils.showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para acceder al panel admin.' });
      }
    }
    else if (route === 'admin-consultas') {
      if (typeof Admin !== 'undefined' && Admin.isAdmin()) {
        Admin.renderConsultas();
      } else {
        this.renderHome(app);
        Utils.showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para acceder al panel admin.' });
      }
    }
    else if (route === 'admin-reviews') {
      if (typeof Admin !== 'undefined' && Admin.isAdmin()) {
        Admin.renderReviews();
      } else {
        this.renderHome(app);
        Utils.showModal({ type: 'error', title: 'Acceso denegado', message: 'No tienes permisos para acceder al panel admin.' });
      }
    }
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
    var adminLink = document.getElementById('adminPanelLink');
    var isAuth = !!user;

    var authItems = document.querySelectorAll('[data-auth="required"]');
    authItems.forEach(function(el) {
      el.style.display = isAuth ? '' : 'none';
    });

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

      // Mostrar enlace del panel admin solo si el usuario es admin
      if (adminLink) {
        if (user.role === 'admin') {
          adminLink.style.display = 'block';
        } else {
          adminLink.style.display = 'none';
        }
      }
    } else {
      btn.textContent = '🔑';
      btn.title = 'Login/Registro';
      btn.onclick = function() { App.showLogin(); };
      nameEl.textContent = 'Iniciar sesión';

      // Ocultar enlace del panel admin si no hay usuario
      if (adminLink) {
        adminLink.style.display = 'none';
      }
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
        '<a class="btn btn-outline-light btn-lg hero-cta" onclick="App.showPlans()" style="border-color:var(--wine);color:var(--wine);">Plan Premium ✨<span class="hero-cta-sub">Planes de suscripción con beneficios exclusivos</span></a></div>';

    app.innerHTML = this.renderCarousel() +
      '<div class="hero">' +
      '<div class="hero-bg"></div>' +
      '<div class="hero-content">' +
      '<h1>Fórmulas <em>reales</em>.<br>Resultados <em>reales</em>.<br>Tu piel en manos <em>expertas</em>.</h1>' +
      '<p>Descubre tu tipo de piel con nuestro diagnóstico dermatológico y recibe una rutina personalizada con los mejores productos para ti.</p>' +
      ctaSection +
      '</div>' +
      '<div class="hero-image"><div class="hero-image-placeholder">🧴</div></div>' +
      '</div>' +
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
    var self = this;
    var profile = Storage.getProfile();
    Products.clearCache();
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
      '<p style="color:var(--text-secondary);padding:1rem;">Cargando productos...</p>' +
      '</div></div>';
    var load = profile ? Products.getBySkinType(profile.typeName) : Products.getAll();
    load.then(function(products) {
      var html = products.map(function(p) { return Products.renderCard(p); }).join('');
      if (!html) html = '<p style="color:var(--text-secondary);padding:1rem;">No se encontraron productos para tu tipo de piel. Explora todas las categorías usando los filtros.</p>';
      document.getElementById('productGrid').innerHTML = html;
    }).catch(function() {
      document.getElementById('productGrid').innerHTML = '<p style="color:var(--wine);padding:1rem;">Error al cargar productos. Intenta de nuevo.</p>';
    });
  },

  filterProducts: function(type, el) {
    document.querySelectorAll('.chip').forEach(function(c) { c.classList.remove('active'); });
    if (el) el.classList.add('active');
    document.getElementById('productGrid').innerHTML = '<p style="color:var(--text-secondary);padding:1rem;">Filtrando...</p>';
    var load = type === 'all' ? Products.getAll() : Products.filter({ type: type });
    load.then(function(products) {
      var html = products.map(function(p) { return Products.renderCard(p); }).join('');
      document.getElementById('productGrid').innerHTML = html || '<p style="color:var(--text-secondary);padding:1rem;">No se encontraron productos.</p>';
    }).catch(function() {
      document.getElementById('productGrid').innerHTML = '<p style="color:var(--wine);padding:1rem;">Error al cargar productos.</p>';
    });
  },

  searchProducts: function() {
    var search = document.getElementById('searchInput').value.trim();
    document.getElementById('productGrid').innerHTML = '<p style="color:var(--text-secondary);padding:1rem;">Buscando...</p>';
    var load = search ? Products.filter({ search: search }) : Products.getAll();
    load.then(function(products) {
      var html = products.map(function(p) { return Products.renderCard(p); }).join('');
      document.getElementById('productGrid').innerHTML = html || '<p style="color:var(--text-secondary);padding:1rem;">No se encontraron productos.</p>';
    }).catch(function() {
      document.getElementById('productGrid').innerHTML = '<p style="color:var(--wine);padding:1rem;">Error al buscar.</p>';
    });
  },

  renderProducto: function(app, params) {
    var id = params.id;
    if (!id) { App.navigate('productos'); return; }
    var self = this;

    Products.getById(id).then(function(p) {
      if (!p) { App.navigate('productos'); return; }

      var imgUrl = self.getProductImage(p.name, p.image_url || p.image);
      var badges = '';
      if (p.eco) badges += '<span class="badge badge-eco">🌿 Ecológico</span>';
      if (p.cruelty) badges += '<span class="badge badge-cruelty">🐰 Sin crueldad</span>';

      var isFav = Storage.isFavorite(p.id);

      app.innerHTML = '<div class="container" id="productoContainer">' +
        '<div class="goto-back" onclick="App.navigate(\'productos\')">← Volver a productos</div>' +
        '<div style="position:relative;">' +
        '<img src="' + imgUrl + '" alt="' + p.name + '" class="product-detail-img">' +
        '</div>' +
        '<div class="product-detail-header">' +
        '<div><div class="product-detail-name">' + p.name + '</div><div class="product-detail-brand">' + p.brand + '</div></div>' +
        '<div style="display:flex;align-items:center;gap:0.5rem;">' +
        '<div class="product-detail-price">S/.' + p.price.toFixed(2) + '</div>' +
        '<button class="product-card-fav ' + (isFav ? 'active' : '') + '" style="position:static;" onclick="App.toggleFav(' + p.id + ',this)">' + (isFav ? '♥' : '♡') + '</button>' +
        '</div></div>' +
        '<div class="product-detail-rating" id="ratingSection"><span>Cargando valoraciones...</span></div>' +
        '<div class="product-detail-section"><h4>Ingredientes</h4><p style="color:var(--text-secondary);font-size:0.875rem;margin-bottom:0.5rem;">' + (p.ingredients || 'Información no disponible') + '</p><div class="ingredients-list">' + (p.ingredients ? p.ingredients.split(', ').map(function(i) { return '<span class="ingredient-tag">' + i + '</span>'; }).join('') : '<span class="ingredient-tag">Sin datos</span>') + '</div></div>' +
        '<div class="product-detail-section"><h4>¿Cómo ayuda a mi piel?</h4><p style="color:var(--text-secondary);">' + (p.description || '') + '</p><p style="color:var(--text-secondary);margin-top:0.5rem;">' + (p.howHelps || '') + '</p></div>' +
        '<div class="product-detail-section" id="comentariosSection">' +
        '<h4>Comentarios</h4>' +
        '<div id="comentariosList" style="margin-bottom:1rem;"></div>' +
        '<div class="consulta-form" style="margin-top:1rem;">' +
        '<label>Deja tu comentario</label>' +
        '<div style="display:flex;gap:0.25rem;margin-bottom:0.75rem;" id="starSelector">' +
        '<span class="star-rating-btn" data-val="1" onclick="App.setReviewStar(1)" style="cursor:pointer;font-size:1.5rem;color:var(--gray-300);">★</span>' +
        '<span class="star-rating-btn" data-val="2" onclick="App.setReviewStar(2)" style="cursor:pointer;font-size:1.5rem;color:var(--gray-300);">★</span>' +
        '<span class="star-rating-btn" data-val="3" onclick="App.setReviewStar(3)" style="cursor:pointer;font-size:1.5rem;color:var(--gray-300);">★</span>' +
        '<span class="star-rating-btn" data-val="4" onclick="App.setReviewStar(4)" style="cursor:pointer;font-size:1.5rem;color:var(--gray-300);">★</span>' +
        '<span class="star-rating-btn" data-val="5" onclick="App.setReviewStar(5)" style="cursor:pointer;font-size:1.5rem;color:var(--gray-300);">★</span>' +
        '</div>' +
        '<textarea id="comentarioTexto" placeholder="Escribe tu comentario aquí..." style="width:100%;padding:0.75rem;border:1px solid var(--gray-200);border-radius:var(--radius-md);font-family:var(--font-sans);font-size:0.95rem;margin-bottom:0.75rem;min-height:80px;resize:vertical;"></textarea>' +
        '<button class="btn btn-primary btn-full" onclick="App.enviarComentario(' + p.id + ')">Enviar comentario</button>' +
        '</div>' +
        '</div>' +
        '<div style="display:flex;gap:0.75rem;flex-wrap:wrap;">' +
        '<button class="btn btn-primary" style="flex:1;" onclick="App.separarProducto(' + p.id + ')">📱 Separar productos</button>' +
        '</div>' +
        '</div>';

      self._currentProductId = p.id;
      self._reviewStars = 0;
      self.cargarComentarios(p.id);
      self.cargarRating(p.id);
    });
  },

  _currentProductId: null,
  _reviewStars: 0,

  setReviewStar: function(val) {
    App._reviewStars = val;
    var btns = document.querySelectorAll('.star-rating-btn');
    btns.forEach(function(b) {
      var v = parseInt(b.dataset.val);
      b.style.color = v <= val ? '#6A4C93' : '#D1D5DB';
    });
  },

  cargarRating: function(productId) {
    Products.getReviews(productId).then(function(reviews) {
      var ratingSection = document.getElementById('ratingSection');
      if (!ratingSection) return;
      if (!reviews || reviews.length === 0) {
        ratingSection.innerHTML = '<span style="color:var(--text-secondary);">No presenta calificación aún</span>';
        return;
      }
      var total = 0;
      for (var i = 0; i < reviews.length; i++) {
        total += reviews[i].stars;
      }
      var avg = total / reviews.length;
      var starsHtml = '';
      for (var i = 0; i < Math.round(avg); i++) starsHtml += '★';
      for (var i = Math.round(avg); i < 5; i++) starsHtml += '☆';
      ratingSection.innerHTML = '<span style="color:#F59E0B;font-size:1.25rem;">' + starsHtml + '</span><span style="margin-left:0.5rem;color:var(--text-secondary);">' + avg.toFixed(1) + ' (' + reviews.length + ' valoraciones)</span>';
    });
  },

  cargarComentarios: function(productId) {
    Products.getReviews(productId).then(function(reviews) {
      var list = document.getElementById('comentariosList');
      if (!list) return;
      if (!reviews || reviews.length === 0) {
        list.innerHTML = '<p style="color:var(--text-secondary);font-size:0.875rem;">No hay comentarios aún. ¡Sé la primera en comentar!</p>';
        return;
      }
      var html = reviews.map(function(r) {
        var s = '';
        for (var i = 0; i < r.stars; i++) s += '★';
        for (var i = r.stars; i < 5; i++) s += '☆';
        return '<div style="padding:0.75rem;border:1px solid var(--gray-200);border-radius:var(--radius-md);margin-bottom:0.5rem;">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">' +
          '<strong style="font-size:0.875rem;">' + (r.author || 'Anónimo') + '</strong>' +
          '<span style="color:#F59E0B;font-size:0.875rem;">' + s + '</span>' +
          '</div>' +
          (r.comment ? '<p style="font-size:0.875rem;color:var(--text-secondary);margin:0;">' + r.comment + '</p>' : '') +
          '<div style="font-size:0.75rem;color:var(--text-light);margin-top:0.25rem;">' + new Date(r.created_at).toLocaleDateString('es-ES') + '</div>' +
          '</div>';
      }).join('');
      list.innerHTML = html;
    });
  },

  enviarComentario: function(productId) {
    var stars = App._reviewStars;
    var comment = document.getElementById('comentarioTexto').value.trim();
    if (!stars) {
      Utils.showModal({ type: 'error', title: 'Valoración requerida', message: 'Por favor selecciona una valoración de 1 a 5 estrellas.' });
      return;
    }
    if (!comment) {
      Utils.showModal({ type: 'error', title: 'Comentario requerido', message: 'Por favor escribe un comentario.' });
      return;
    }
    Products.addReview(productId, { stars: stars, comment: comment }).then(function() {
      document.getElementById('comentarioTexto').value = '';
      App.setReviewStar(0);
      App.cargarComentarios(productId);
      App.cargarRating(productId);
      Utils.showModal({ type: 'success', title: 'Comentario enviado', message: 'Gracias por tu valoración.' });
    }).catch(function(err) {
      Utils.showModal({ type: 'error', title: 'Error', message: err.error || 'No se pudo enviar el comentario.' });
    });
  },

  getProductImage: function(productName, fallback) {
    var map = {
      'CeraVE Limpiador Hidratante': 'images/products/cerave-limpiador.png',
      'La Roche-Posay Effaclar': 'images/products/laroche-effaclar.jpg',
      'Neutrogena Hydro Boost': 'images/products/neutrogena-hydroboost.svg',
      'CeraVe PM': 'images/products/cerave-pm.jpg',
      'EltaMD UV Clear': 'images/products/eltamd-uvclear.jpg',
      'Paula\'s Choice BHA': 'images/products/paulaschoice-bha.webp',
      'The Ordinary Niacinamide': 'images/products/ordinary-niacinamide.webp',
      'Caudalie Vinoperfect': 'images/products/caudalie-vinoperfect.svg',
      'Retinol 0.5% - The Inkey List': 'images/products/retinol-inkeylist.jpg',
      'Aveeno Ultra-Calming': 'images/products/aveeno-ultracalming.jpg',
      'Bioderma Atoderm': 'images/products/bioderma-atoderm.jpg',
      'Supergoop Unseen Sunscreen': 'images/products/supergoop-unseen.jpg',
      'Cetaphil Gentle Cleanser': 'images/products/cetaphil-gentle.svg',
      'Vanicream Moisturizer': 'images/products/vanicream-moisturizer.jpg',
      'La Roche-Posay Anthelios': 'images/products/laroche-anthelios.jpg',
      'The Ordinary Hyaluronic Acid': 'images/products/ordinary-hyaluronic.png',
      'Simple Kind to Skin Moisturizer': 'images/products/simple-moisturizer.jpg',
      'CeraVe Hydrating Sunscreen': 'images/products/cerave-sunscreen.svg',
      'Good Molecules Discoloration Correcting': 'images/products/goodmolecules-discoloration.svg',
      'Neutrogena Rapid Wrinkle Repair': 'images/products/neutrogena-rapidwrinkle.svg',
      'Beauty of Joseon Dynasty Cream': 'images/products/beautyofjoseon-dynasty.svg',
      'Some By Mi AHA BHA PHA 30 Days Miracle Toner': 'images/products/somebymi-aha.svg',
      'Laneige Water Sleeping Mask': 'images/products/laneige-sleeping.svg',
      'Innisfree Green Tea Hyaluronic Acid Serum': 'images/products/innisfree-greentea.svg',
      'Missha Time Revolution The First Essence': 'images/products/missha-time.svg',
      'Anua Heartleaf 77% Soothing Toner': 'images/products/anua-heartleaf.svg',
      'Round Lab Birch Juice Moisturizing Sunscreen SPF50+': 'images/products/roundlab-birch.webp'
    };
    if (!productName) return fallback || 'images/products/placeholder.svg';
    var pn = productName.toLowerCase();
    for (var key in map) {
      var k = key.toLowerCase();
      if (pn.indexOf(k) !== -1 || k.indexOf(pn) !== -1) return map[key];
      var keyWords = k.split(' ');
      var matchCount = 0;
      for (var w = 0; w < keyWords.length; w++) {
        if (keyWords[w].length > 2 && pn.indexOf(keyWords[w]) !== -1) matchCount++;
      }
      if (matchCount >= 2) return map[key];
    }
    return fallback || 'images/products/placeholder.svg';
  },

  toggleFav: function(productId, btn) {
    Storage.toggleFavorite(productId).then(function(isNowFav) {
      btn.textContent = isNowFav ? '♥' : '♡';
      btn.classList.toggle('active', isNowFav);
    }).catch(function() {
      // Si falla, mantener estado actual
      console.error('Error al toggle favorito');
    });
  },

  separarProducto: function(productId) {
    Products.getById(productId).then(function(product) {
      if (product) {
        Storage.addToCart(product).then(function() {
          App.navigate('cart');
        });
      }
    }).catch(function() {
      Utils.showModal({
        type: 'error',
        title: 'Error',
        message: 'No se pudo agregar el producto al carrito.'
      });
    });
  },

  renderCart: function(app) {
    var cart = Storage.getCart();
    if (cart.length === 0) {
      app.innerHTML = '<div class="container"><div class="empty-state"><div class="empty-state-icon">🛒</div><h3>Tu carrito está vacío</h3><p>Explora nuestros productos y agrega los que más te gusten.</p><button class="btn btn-primary" onclick="App.navigate(\'productos\')">Ver productos</button></div></div>';
      return;
    }

    var self = this;
    App._cartShipping = App._cartShipping || 0;

    var subtotal = 0;
    var itemsHtml = cart.map(function(item) {
      var subtotalItem = item.price * item.qty;
      subtotal += subtotalItem;
      var imgUrl = self.getProductImage(item.name, item.image || item.image_url);
      return '<div class="cart-item">' +
        '<img src="' + imgUrl + '" alt="' + item.name + '">' +
        '<div class="cart-item-info">' +
        '<div class="cart-item-name">' + item.name + '</div>' +
        '<div style="font-size:0.8rem;color:var(--text-secondary);">Cantidad: ' + item.qty + '</div>' +
        '<div class="cart-item-price">S/.' + subtotalItem.toFixed(2) + '</div></div>' +
        '<button class="cart-item-remove" onclick="App.removeFromCart(' + item.id + ')">✕</button></div>';
    }).join('');

    var total = subtotal + App._cartShipping;

    app.innerHTML = '<div class="container" id="cartContainer">' +
      '<h2 style="margin-bottom:1rem;">🛒 Carrito</h2>' +
      itemsHtml +
      '<div class="cart-total"><span>Subtotal</span><span id="cartSubtotal">S/.' + subtotal.toFixed(2) + '</span></div>' +
      '<div class="cart-section" style="margin-top:0.75rem;">' +
      '<h3 style="margin-bottom:0.75rem;">Opción de Envío</h3>' +
      '<label class="cart-radio">' +
      '<input type="radio" name="cartShipping" value="0" ' + (App._cartShipping === 0 ? 'checked' : '') + ' onchange="App.setShipping(0)">' +
      ' 🏪 Recojo en tienda - S/0.00</label>' +
      '<label class="cart-radio">' +
      '<input type="radio" name="cartShipping" value="15" ' + (App._cartShipping === 15 ? 'checked' : '') + ' onchange="App.setShipping(15)">' +
      ' 🚚 Delivery - S/15.00</label>' +
      '</div>' +
      '<div class="cart-total" style="border-top:none;padding-top:0.5rem;">' +
      '<span>Total</span><span id="cartTotal" style="font-size:1.25rem;">S/.' + total.toFixed(2) + '</span></div>' +
      '<a class="btn btn-primary btn-full" style="margin-top:1.5rem;text-align:center;display:block;text-decoration:none;font-size:1.1rem;padding:1rem;" href="https://w.app/dermamatch" target="_blank">' +
      '💬 Contacta a un asesor de venta</a>' +
      '</div>';
  },

  setShipping: function(value) {
    App._cartShipping = value;
    App.renderCart(document.getElementById('app'));
  },

  removeFromCart: function(productId) {
    Storage.removeFromCart(productId).then(function() {
      App.renderCart(document.getElementById('app'));
      App.updateBadges();
    });
  },

  renderFavorites: function(app) {
    var favs = Storage.getFavorites();
    if (favs.length === 0) {
      app.innerHTML = '<div class="container"><div class="empty-state"><div class="empty-state-icon">♥</div><h3>Sin favoritos</h3><p>Agrega productos a tus favoritos para encontrarlos rápido.</p></div></div>';
      return;
    }
    var self = this;
    Promise.all(favs.map(function(id) { return Products.getById(id); })).then(function(products) {
      products = products.filter(function(p) { return p; });
      app.innerHTML = '<div class="container">' +
        '<h2 style="margin-bottom:1rem;">♥ Favoritos</h2>' +
        '<div class="fav-grid">' + products.map(function(p) { return Products.renderCard(p); }).join('') + '</div></div>';
    });
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
    var imgUrl = this.getProductImage(p.product.name, p.product.image_url || p.product.image);
    return '<div class="routine-product">' +
      '<img src="' + imgUrl + '" class="routine-product-img">' +
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

    // Show loading state
    var loginBtn = document.querySelector('#loginForm .btn-primary');
    if (loginBtn) {
      loginBtn.textContent = 'Iniciando sesión...';
      loginBtn.disabled = true;
    }

    Storage.login(email, password).then(function(result) {
      if (result.ok) {
        document.querySelector('.modal-overlay').remove();
        App.updateHeader();
        Utils.showModal({ type: 'success', title: '¡Bienvenida!', message: 'Has iniciado sesión como ' + result.user.name });
      } else {
        Utils.showModal({ type: 'error', title: 'Error', message: result.error });
        // Reset button state
        if (loginBtn) {
          loginBtn.textContent = 'Iniciar sesión';
          loginBtn.disabled = false;
        }
      }
    }).catch(function(error) {
      Utils.showModal({ type: 'error', title: 'Error', message: 'Error de conexión. Verifica tu internet.' });
      if (loginBtn) {
        loginBtn.textContent = 'Iniciar sesión';
        loginBtn.disabled = false;
      }
    });
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

    // Show loading state
    var regBtn = document.querySelector('#registerForm .btn-primary');
    if (regBtn) {
      regBtn.textContent = 'Registrando...';
      regBtn.disabled = true;
    }

    Storage.register(name, email, password).then(function(result) {
      if (result.ok) {
        document.querySelector('.modal-overlay').remove();
        App.updateHeader();
        Utils.showModal({ type: 'success', title: '¡Registrada!', message: 'Cuenta creada correctamente. Bienvenida ' + name });
      } else {
        Utils.showModal({ type: 'error', title: 'Error', message: result.error });
        if (regBtn) {
          regBtn.textContent = 'Registrarse';
          regBtn.disabled = false;
        }
      }
    }).catch(function(error) {
      Utils.showModal({ type: 'error', title: 'Error', message: 'Error de conexión. Verifica tu internet.' });
      if (regBtn) {
        regBtn.textContent = 'Registrarse';
        regBtn.disabled = false;
      }
    });
  },

  showPlans: function() {
    var existing = document.querySelector('.modal-overlay');
    if (existing) existing.remove();

    var div = document.createElement('div');
    div.className = 'modal-overlay';
    div.innerHTML = '<div class="modal-content" style="max-width:600px;overflow-y:auto;max-height:90vh;">' +
      '<h3>✨ Plan Premium</h3>' +
      '<p style="text-align:center;color:var(--text-secondary);margin-bottom:1.5rem;">Elige el plan perfecto para tu piel</p>' +
      '<div class="plans-grid">' +
      '<div class="plan-card"><h3>Básico</h3><div class="plan-price">Gratis<span></span></div><ul><li>Diagnóstico de piel</li><li>Recomendaciones básicas</li><li>Skin-Diary</li></ul><button class="btn btn-secondary btn-full" data-action="closeModalPlans">Actual</button></div>' +
      '<div class="plan-card featured"><h3>Plan Premium</h3><div class="plan-price">S/9.99<span>/mes</span></div><ul><li>Todo lo de Básico</li><li>Rutina personalizada</li><li>Consultas con expertos</li><li>Descuentos en productos</li></ul><button class="btn btn-primary btn-full" data-action="selectPlan" data-plan="Pro">Elegir plan</button></div>' +
      '<div class="plan-card"><h3>Premium Plus</h3><div class="plan-price">S/19.99<span>/mes</span></div><ul><li>Todo lo de Plan Premium</li><li>1 asesoría virtual al mes</li><li>Envío gratis en pedidos</li><li>Acceso a lanzamientos exclusivos</li></ul><button class="btn btn-primary btn-full" data-action="selectPlan" data-plan="Premium">Elegir plan</button></div>' +
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
  },

  renderRecomendados: function(app) {
    var self = this;
    var profile = Storage.getProfile();

    if (!profile) {
      app.innerHTML = '<div class="container"><div class="empty-state"><div class="empty-state-icon">🧪</div>' +
        '<h3>Sin diagnóstico</h3><p>Realiza el test de piel para ver tus productos recomendados.</p>' +
        '<button class="btn btn-primary" onclick="App.navigate(\'test\')">Ir al Test</button></div></div>';
      return;
    }

    var recommended = profile.recommendedProducts || [];

    if (recommended.length === 0) {
      app.innerHTML = '<div class="container"><div class="empty-state"><div class="empty-state-icon">🧴</div>' +
        '<h3>Sin recomendaciones</h3><p>No hay productos configurados para tu tipo de piel aún.</p>' +
        '<button class="btn btn-primary" onclick="App.navigate(\'productos\')">Ver todos los productos</button></div></div>';
      return;
    }

    var html = recommended.map(function(p) { return Products.renderCard(p); }).join('');

    app.innerHTML = '<div class="container">' +
      '<div class="goto-back" onclick="App.navigate(\'test\')" style="cursor:pointer;margin-bottom:1rem;">← Volver al diagnóstico</div>' +
      '<h2 style="margin-bottom:0.25rem;">Productos recomendados para ti</h2>' +
      '<p style="color:var(--text-secondary);margin-bottom:1rem;">Seleccionados según tu tipo de piel: <strong>' + profile.typeName + '</strong></p>' +
      '<div class="product-grid">' + html + '</div>' +
      '<div style="margin-top:1.5rem;">' +
      '<button class="btn btn-secondary" onclick="App.navigate(\'productos\')">Ver catálogo completo</button>' +
      '</div></div>';
  }
};

document.addEventListener('DOMContentLoaded', function() {
  App.init();
});
