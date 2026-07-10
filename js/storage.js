window.Utils = {
  navigate: function(page, params) {
    params = params || {};
    var url = page;
    var qs = [];
    for (var key in params) { if (params[key]) qs.push(key + '=' + encodeURIComponent(params[key])); }
    if (qs.length > 0) url = url + '?' + qs.join('&');
    window.location.href = url;
  },
  getParams: function() {
    var p = {};
    var s = window.location.search.substring(1);
    if (s) {
      var parts = s.split('&');
      for (var i = 0; i < parts.length; i++) {
        var kv = parts[i].split('=');
        if (kv[0]) p[decodeURIComponent(kv[0])] = kv[1] ? decodeURIComponent(kv[1]) : '';
      }
    }
    return p;
  },
  showModal: function(opts) {
    opts = opts || {};
    var type = opts.type || 'info';
    var title = opts.title || '';
    var message = opts.message || '';
    var icons = { success: '✓', error: '✗', info: 'i' };
    var bg = type === 'success' ? '#D1FAE5' : type === 'error' ? '#FEE2E2' : '#F4D9D0';
    var div = document.createElement('div');
    div.className = 'modal-overlay';
    div.innerHTML = '<div class="modal-content" style="text-align:center;">' +
      '<div style="width:48px;height:48px;line-height:48px;border-radius:50%;margin:0 auto 1rem;font-size:1.5rem;background:' + bg + '">' + icons[type] + '</div>' +
      '<h3 style="margin:0 0 0.5rem;">' + title + '</h3>' +
      '<p style="color:var(--text-secondary);margin-bottom:1rem;font-size:0.9rem;">' + message + '</p>' +
      (opts.onConfirm
        ? '<div style="display:flex;gap:0.5rem;margin-top:1rem;"><button class="btn btn-secondary" style="flex:1;" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button><button class="btn btn-primary" style="flex:1;" id="modalConfirmBtn">Confirmar</button></div>'
        : '<button class="btn btn-primary btn-full" onclick="this.closest(\'.modal-overlay\').remove()">Aceptar</button>') +
      '</div>';
    document.body.appendChild(div);
    if (opts.onConfirm) {
      setTimeout(function() {
        var btn = document.getElementById('modalConfirmBtn');
        if (btn) btn.onclick = function() { div.remove(); opts.onConfirm(); };
      }, 100);
    }
  },
  confirmReset: function() {
    Utils.showModal({
      type: 'info', title: 'Repetir diagnóstico',
      message: 'Se borrará tu perfil actual y tendrás que responder las preguntas de nuevo.',
      onConfirm: function() {
        sessionStorage.removeItem('skinProfile');
        sessionStorage.removeItem('myRoutine');
        App.navigate('test');
      }
    });
  },
  formatDate: function(d) { return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }); },
  daysBetween: function(d1, d2) { return Math.ceil(Math.abs(new Date(d1) - new Date(d2)) / 86400000); },
  getGreeting: function() { var h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'; }
};

window.Storage = {
  getProfile: function() {
    try { var data = sessionStorage.getItem('skinProfile'); return data ? JSON.parse(data) : null; } catch(e) { return null; }
  },
  setProfile: function(profile) {
    try { sessionStorage.setItem('skinProfile', JSON.stringify(profile)); } catch(e) {}
  },
  /**
   * Guarda el diagnóstico de piel en el backend (POST /api/diagnosis)
   * @param {object} profile - Datos del perfil {typeName, type_id, concerns, allergies, description, answers}
   * @returns {Promise} Resultado del backend
   */
  saveDiagnosisToBackend: function(profile) {
    var self = this;

    // Mapear nombres de tipos a IDs del backend
    var typeMap = {
      'Normal': 'normal',
      'Seca': 'dry',
      'Seca Sensible': 'dry',
      'Seca Atópica': 'atopic',
      'Grasa': 'oily',
      'Grasa con Acné': 'acne',
      'Mixta': 'mixed',
      'Sensible': 'sensitive',
      'Sensible con Rosácea': 'sensitive',
      'Atópica': 'atopic'
    };

    // Determinar type_id basado en typeName
    var type_id = 'normal'; // default
    for (var key in typeMap) {
      if (profile.typeName && profile.typeName.indexOf(key) !== -1) {
        type_id = typeMap[key];
        break;
      }
    }

    // Construir el payload para el backend
    var payload = {
      type_name: profile.typeName || 'Desconocido',
      type_id: type_id,
      concerns: profile.concerns || [],
      allergies: profile.allergies || [],
      description: profile.description || '',
      answers: profile.answers || {}
    };

    return window.api.post('/diagnosis', payload)
      .then(function(response) {
        if (response.success && response.profile) {
          var p = response.profile;
          self.setProfile({
            typeName: p.type_name || p.typeName,
            concerns: p.concerns || [],
            allergies: p.allergies || [],
            description: p.description || '',
            answers: p.answers || {},
            date: new Date().toISOString()
          });
          return { ok: true, profile: p };
        }
        return { ok: false, error: 'Respuesta inválida del servidor' };
      })
      .catch(function(error) {
        self.setProfile(profile);
        return { ok: false, error: error.error || 'Guardado local' };
      });
  },
  /**
   * Carga el diagnóstico desde el backend (GET /api/diagnosis)
   * @returns {Promise} Perfil de piel
   */
  loadDiagnosisFromBackend: function() {
    var self = this;
    var apiUrl = window.API_BASE_URL || 'http://localhost:3000/api';

    var loadToken = localStorage.getItem('auth_token');
    var loadHeaders = loadToken ? { 'Authorization': 'Bearer ' + loadToken } : {};
    return fetch(apiUrl + '/diagnosis', { headers: loadHeaders })
      .then(function(response) {
        if (!response.ok) throw new Error('No hay perfil');
        return response.json();
      })
      .then(function(response) {
        if (response.profile) {
          self.setProfile(response.profile);
          return { ok: true, profile: response.profile };
        }
        throw new Error('No hay perfil');
      })
      .catch(function() {
        var localProfile = self.getProfile();
        if (localProfile) {
          return { ok: true, profile: localProfile };
        }
        return { ok: false, error: 'No hay perfil disponible' };
      });
  },
  getRoutine: function() {
    try { var data = sessionStorage.getItem('myRoutine'); return data ? JSON.parse(data) : []; } catch(e) { return []; }
  },
  setRoutine: function(routine) {
    try { sessionStorage.setItem('myRoutine', JSON.stringify(routine)); } catch(e) {}
  },
  addToRoutine: function(product) {
    var routine = Storage.getRoutine();
    for (var i = 0; i < routine.length; i++) { if (routine[i].productId === product.id) return false; }
    routine.push({ productId: product.id, product: product, savedDate: new Date().toISOString(), timeOfDay: product.category === 'spf' ? 'morning' : 'night' });
    Storage.setRoutine(routine);
    return true;
  },
  removeFromRoutine: function(productId) {
    var routine = Storage.getRoutine();
    var newRoutine = [];
    for (var i = 0; i < routine.length; i++) { if (routine[i].productId !== productId) newRoutine.push(routine[i]); }
    Storage.setRoutine(newRoutine);
  },
  saveProductReviews: function(productId, reviews) {
    try { sessionStorage.setItem('productReviews_' + productId, JSON.stringify(reviews)); } catch(e) {}
  },
  getProductReviews: function(productId) {
    try { var data = sessionStorage.getItem('productReviews_' + productId); return data ? JSON.parse(data) : null; } catch(e) { return null; }
  },
  getCommunityRoutines: function() {
    // Backend integration - GET /api/community-routines
    return window.api.get('/community-routines')
      .then(function(response) {
        var routines = response.routines || [];
        return routines;
      })
      .catch(function(error) {
        console.error('Error cargando rutinas de comunidad:', error);
        // Fallback a datos mock
        return [
          { user: "Ana S.", skin_type: "Seca Sensible", allergies: ["fragrance-free"], products: [1, 4, 11], likes_count: 45, avatar_emoji: "🌸" },
          { user: "Carla R.", skin_type: "Grasa con Acné", allergies: ["oil-free"], products: [2, 6, 7, 5], likes_count: 32, avatar_emoji: "✨" },
          { user: "Lucía M.", skin_type: "Mixta", allergies: ["non-comedogenic"], products: [3, 8, 12], likes_count: 28, avatar_emoji: "🦋" },
          { user: "Sofía P.", skin_type: "Normal", allergies: [], products: [1, 3, 5, 9], likes_count: 56, avatar_emoji: "💫" }
        ];
      });
  },
  saveGeneratedRoutine: function(routine) {
    try { sessionStorage.setItem('generatedRoutine', JSON.stringify(routine)); } catch(e) {}
  },
  getGeneratedRoutine: function() {
    try { var data = sessionStorage.getItem('generatedRoutine'); return data ? JSON.parse(data) : null; } catch(e) { return null; }
  },
  saveRoutineConfig: function(config) {
    try { sessionStorage.setItem('routineConfig', JSON.stringify(config)); } catch(e) {}
  },
  getRoutineConfig: function() {
    try { var data = sessionStorage.getItem('routineConfig'); return data ? JSON.parse(data) : null; } catch(e) { return null; }
  },

  // === NEW: Cart ===
  getCart: function() {
    try { var d = sessionStorage.getItem('dmCart'); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  },
  setCart: function(cart) {
    try { sessionStorage.setItem('dmCart', JSON.stringify(cart)); } catch(e) {}
  },
  addToCart: function(product) {
    // Backend integration - POST /api/cart
    return window.api.post('/cart', { product_id: product.id, qty: 1 })
      .then(function(response) {
        if (response.success || response.item) {
          // Actualizar carrito local
          window.api.get('/cart').then(function(cartResponse) {
            var items = cartResponse.items || [];
            // Convertir formato del backend a formato local
            var localCart = items.map(function(item) {
              return {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image_url || item.product.image,
                brand: item.product.brand,
                qty: item.qty
              };
            });
            Storage.setCart(localCart);
            App.updateBadges();
            return { ok: true };
          });
          return { ok: true };
        }
        return { ok: false, error: 'Error al agregar al carrito' };
      })
      .catch(function(error) {
        // Fallback a sessionStorage si falla el API
        var cart = Storage.getCart();
        var existing = null;
        for (var i = 0; i < cart.length; i++) { if (cart[i].id === product.id) { existing = cart[i]; break; } }
        if (existing) { existing.qty = (existing.qty || 1) + 1; }
        else { cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand, qty: 1 }); }
        Storage.setCart(cart);
        App.updateBadges();
        return { ok: true, fallback: true };
      });
  },
  removeFromCart: function(productId) {
    // Backend integration - DELETE /api/cart/:productId
    return window.api.delete('/cart/' + productId)
      .then(function(response) {
        if (response.success) {
          // Actualizar carrito local
          return window.api.get('/cart').then(function(cartResponse) {
            var items = cartResponse.items || [];
            var localCart = items.map(function(item) {
              return {
                id: item.product.id,
                name: item.product.name,
                price: item.product.price,
                image: item.product.image_url || item.product.image,
                brand: item.product.brand,
                qty: item.qty
              };
            });
            Storage.setCart(localCart);
            App.updateBadges();
            return { ok: true };
          });
        }
        return { ok: false, error: 'Error al eliminar del carrito' };
      })
      .catch(function(error) {
        // Fallback a sessionStorage
        var cart = Storage.getCart();
        var newCart = [];
        for (var i = 0; i < cart.length; i++) { if (cart[i].id !== productId) newCart.push(cart[i]); }
        Storage.setCart(newCart);
        App.updateBadges();
        return { ok: true, fallback: true };
      });
  },
  clearCart: function() {
    // Limpiar localmente inmediatamente
    Storage.setCart([]);
    App.updateBadges();

    // El backend limpia el carrito cuando se crea una orden
    // No hay endpoint específico para limpiar el carrito
  },

  // === NEW: Favorites ===
  getFavorites: function() {
    try { var d = sessionStorage.getItem('dmFavs'); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  },
  setFavorites: function(favs) {
    try { sessionStorage.setItem('dmFavs', JSON.stringify(favs)); } catch(e) {}
  },
  toggleFavorite: function(productId) {
    // Backend integration - verificar si ya es favorito
    var isCurrentlyFav = this.isFavorite(productId);

    if (isCurrentlyFav) {
      // Eliminar favorito - DELETE /api/favorites/:productId
      return window.api.delete('/favorites/' + productId)
        .then(function(response) {
          if (response.success) {
            // Actualizar localmente
            var favs = Storage.getFavorites();
            var idx = favs.indexOf(productId);
            if (idx > -1) { favs.splice(idx, 1); }
            Storage.setFavorites(favs);
            App.updateBadges();
            return false; // Ahora no es favorito
          }
          return true; // Sigue siendo favorito
        })
        .catch(function(error) {
          // Fallback a sessionStorage
          var favs = Storage.getFavorites();
          var idx = favs.indexOf(productId);
          if (idx > -1) { favs.splice(idx, 1); }
          Storage.setFavorites(favs);
          App.updateBadges();
          return false;
        });
    } else {
      // Agregar favorito - POST /api/favorites
      return window.api.post('/favorites', { product_id: productId })
        .then(function(response) {
          if (response.success || response.favorite) {
            // Actualizar localmente
            var favs = Storage.getFavorites();
            favs.push(productId);
            Storage.setFavorites(favs);
            App.updateBadges();
            return true; // Ahora es favorito
          }
          return false;
        })
        .catch(function(error) {
          // Fallback a sessionStorage
          var favs = Storage.getFavorites();
          favs.push(productId);
          Storage.setFavorites(favs);
          App.updateBadges();
          return true;
        });
    }
  },
  isFavorite: function(productId) {
    return Storage.getFavorites().indexOf(productId) > -1;
  },

  // === NEW: Auth ===
  getUsers: function() {
    try { var d = localStorage.getItem('dmUsers'); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  },
  setUsers: function(users) {
    try { localStorage.setItem('dmUsers', JSON.stringify(users)); } catch(e) {}
  },
  getCurrentUser: function() {
    try { var d = sessionStorage.getItem('dmCurrentUser'); return d ? JSON.parse(d) : null; } catch(e) { return null; }
  },
  setCurrentUser: function(user) {
    try { if (user) sessionStorage.setItem('dmCurrentUser', JSON.stringify(user)); else sessionStorage.removeItem('dmCurrentUser'); } catch(e) {}
  },
  login: function(email, password) {
    // Backend integration - POST /api/auth/login
    return window.api.post('/auth/login', { email: email, password: password })
      .then(function(response) {
        if (response.success && response.user && response.token) {
          // Guardar token y usuario
          window.api.setToken(response.token);
          Storage.setCurrentUser(response.user);
          // Guardar nombre en localStorage para display
          localStorage.setItem('dmUserName', response.user.name);
          return { ok: true, user: response.user };
        }
        return { ok: false, error: 'Respuesta inválida del servidor' };
      })
      .catch(function(error) {
        return { ok: false, error: error.error || 'Error al iniciar sesión' };
      });
  },
  register: function(name, email, password) {
    // Backend integration - POST /api/auth/register
    return window.api.post('/auth/register', { name: name, email: email, password: password })
      .then(function(response) {
        if (response.success && response.user && response.token) {
          // Guardar token y usuario
          window.api.setToken(response.token);
          Storage.setCurrentUser(response.user);
          // Guardar nombre en localStorage para display
          localStorage.setItem('dmUserName', response.user.name);
          return { ok: true, user: response.user };
        }
        return { ok: false, error: 'Respuesta inválida del servidor' };
      })
      .catch(function(error) {
        return { ok: false, error: error.error || 'Error al registrarse' };
      });
  },
  logout: function() {
    // Backend integration - POST /api/auth/logout (opcional, limpia token local)
    var self = this;
    return window.api.post('/auth/logout', {})
      .then(function() {
        window.api.clearToken();
        Storage.setCurrentUser(null);
        localStorage.removeItem('dmUserName');
        App.updateHeader();
        return { ok: true };
      })
      .catch(function() {
        // Even if API call fails, clear local session
        window.api.clearToken();
        Storage.setCurrentUser(null);
        localStorage.removeItem('dmUserName');
        App.updateHeader();
        return { ok: true };
      });
  },
  // Verificar si hay token válido
  isAuthenticated: function() {
    return window.api.isAuthenticated();
  },

  // === NEW: Skin Diary ===
  getDiaryEntries: function() {
    try { var d = sessionStorage.getItem('dmDiary'); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  },
  setDiaryEntries: function(entries) {
    try { sessionStorage.setItem('dmDiary', JSON.stringify(entries)); } catch(e) {}
  },
  addDiaryEntry: function(entry) {
    var entries = Storage.getDiaryEntries();
    entry.id = Date.now();
    entry.date = new Date().toISOString();
    entries.unshift(entry);
    Storage.setDiaryEntries(entries);
  },

  // === NEW: Consultas ===
  getConsultas: function() {
    try { var d = sessionStorage.getItem('dmConsultas'); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  },
  setConsultas: function(consultas) {
    try { sessionStorage.setItem('dmConsultas', JSON.stringify(consultas)); } catch(e) {}
  },
  addConsulta: function(consulta) {
    var consultas = Storage.getConsultas();
    consulta.id = Date.now();
    consulta.date = new Date().toISOString();
    consulta.status = 'pending';
    consultas.unshift(consulta);
    Storage.setConsultas(consultas);
  }
};
