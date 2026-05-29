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
    return [
      { user: "Ana S.", skinType: "Seca Sensible", allergies: ["fragrance-free"], products: [1, 4, 11], likes: 45, avatar: "🌸" },
      { user: "Carla R.", skinType: "Grasa con Acné", allergies: ["oil-free"], products: [2, 6, 7, 5], likes: 32, avatar: "✨" },
      { user: "Lucía M.", skinType: "Mixta", allergies: ["non-comedogenic"], products: [3, 8, 12], likes: 28, avatar: "🦋" },
      { user: "Sofía P.", skinType: "Normal", allergies: [], products: [1, 3, 5, 9], likes: 56, avatar: "💫" }
    ];
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
    var cart = Storage.getCart();
    var existing = null;
    for (var i = 0; i < cart.length; i++) { if (cart[i].id === product.id) { existing = cart[i]; break; } }
    if (existing) { existing.qty = (existing.qty || 1) + 1; }
    else { cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, brand: product.brand, qty: 1 }); }
    Storage.setCart(cart);
    App.updateBadges();
  },
  removeFromCart: function(productId) {
    var cart = Storage.getCart();
    var newCart = [];
    for (var i = 0; i < cart.length; i++) { if (cart[i].id !== productId) newCart.push(cart[i]); }
    Storage.setCart(newCart);
    App.updateBadges();
  },
  clearCart: function() {
    Storage.setCart([]);
    App.updateBadges();
  },

  // === NEW: Favorites ===
  getFavorites: function() {
    try { var d = sessionStorage.getItem('dmFavs'); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  },
  setFavorites: function(favs) {
    try { sessionStorage.setItem('dmFavs', JSON.stringify(favs)); } catch(e) {}
  },
  toggleFavorite: function(productId) {
    var favs = Storage.getFavorites();
    var idx = favs.indexOf(productId);
    if (idx > -1) { favs.splice(idx, 1); }
    else { favs.push(productId); }
    Storage.setFavorites(favs);
    App.updateBadges();
    return idx === -1;
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
    var users = Storage.getUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email && users[i].password === password) {
        Storage.setCurrentUser(users[i]);
        return { ok: true, user: users[i] };
      }
    }
    return { ok: false, error: 'Email o contraseña incorrectos' };
  },
  register: function(name, email, password) {
    var users = Storage.getUsers();
    for (var i = 0; i < users.length; i++) { if (users[i].email === email) return { ok: false, error: 'Este email ya está registrado' }; }
    var user = { name: name, email: email, password: password };
    users.push(user);
    Storage.setUsers(users);
    Storage.setCurrentUser(user);
    return { ok: true, user: user };
  },
  logout: function() {
    Storage.setCurrentUser(null);
    App.updateHeader();
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
