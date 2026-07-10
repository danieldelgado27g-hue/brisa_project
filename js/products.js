var Products = {
  // Cache de productos para evitar requests repetidas
  _cache: null,
  _cacheTime: null,
  _cacheDuration: 5 * 60 * 1000, // 5 minutos

  /**
   * Obtiene todos los productos (con filtros opcionales)
   * @param {object} params - Parámetros de filtro: search, type, category, budget, eco, cruelty, sortBy, order, page, limit
   * @returns {Promise} Array de productos
   */
  getAll: function(params) {
    var self = this;
    params = params || {};

    // Verificar cache
    if (this._cache && this._cacheTime && (Date.now() - this._cacheTime) < this._cacheDuration && Object.keys(params).length === 0) {
      return Promise.resolve(this._cache);
    }

    // Construir query params para el backend
    var queryParams = {};
    if (params.search) queryParams.search = params.search;
    if (params.type) queryParams.type = params.type;
    if (params.category) queryParams.category = params.category;
    if (params.budget) queryParams.budget = params.budget;
    if (params.eco === true || params.eco === 'true') queryParams.eco = 'true';
    if (params.cruelty === true || params.cruelty === 'true') queryParams.cruelty = 'true';
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.order) queryParams.order = params.order;
    if (params.page) queryParams.page = params.page;
    if (params.limit) queryParams.limit = params.limit;

    return window.api.get('/products', queryParams)
      .then(function(response) {
        var products = response.products || [];

        // Actualizar cache solo si no hay filtros
        if (Object.keys(params).length === 0) {
          self._cache = products;
          self._cacheTime = Date.now();
        }

        return products;
      })
      .catch(function(error) {
        console.error('Error fetching products:', error);
        return [];
      });
  },

  /**
   * Obtiene un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise} Producto encontrado o null
   */
  getById: function(id) {
    return window.api.get('/products/' + id)
      .then(function(response) {
        return response.product || null;
      })
      .catch(function(error) {
        console.error('Error fetching product:', error);
        return null;
      });
  },

  /**
   * Filtra productos localmente (para fallback o filtros complejos)
   * @param {object} params - Parámetros de filtro
   * @returns {Promise} Productos filtrados
   */
  filter: function(params) {
    // Usar la API del backend que ya tiene filtros implementados
    return this.getAll(params);
  },

  /**
   * Obtiene productos por tipo de piel
   * @param {string} skinType - Tipo de piel (ej: "Seca Sensible", "Grasa con Acné")
   * @returns {Promise} Array de productos compatibles
   */
  getBySkinType: function(skinType) {
    // Mapeo de nombres de piel a IDs del backend
    var typeMap = {
      'Normal': 'normal',
      'Seca': 'dry',
      'Grasa': 'oily',
      'Mixta': 'mixed',
      'Sensible': 'sensitive',
      'Acné': 'acne',
      'Atópica': 'atopic',
      'Rosácea': 'sensitive'
    };

    // Determinar el tipo basado en el nombre
    var types = [];
    for (var key in typeMap) {
      if (skinType.indexOf(key) !== -1) {
        types.push(typeMap[key]);
      }
    }

    // Si no hay match, usar empty para que no filtre
    if (types.length === 0) {
      return this.getAll();
    }

    // Usar el primer tipo que match (el backend solo soporta un type a la vez)
    return this.getAll({ type: types[0] });
  },

  /**
   * Obtiene reseñas de un producto
   * @param {number} productId - ID del producto
   * @returns {Promise} Array de reseñas
   */
  getReviews: function(productId) {
    return window.api.get('/products/' + productId + '/reviews')
      .then(function(response) {
        return response.reviews || [];
      })
      .catch(function(error) {
        console.error('Error fetching reviews:', error);
        return [];
      });
  },

  /**
   * Agrega una reseña a un producto
   * @param {number} productId - ID del producto
   * @param {object} review - Datos de la reseña {stars, comment}
   * @returns {Promise} Reseña creada
   */
  addReview: function(productId, review) {
    return window.api.post('/products/' + productId + '/reviews', review)
      .then(function(response) {
        return response.review || null;
      })
      .catch(function(error) {
        console.error('Error adding review:', error);
        throw error;
      });
  },

  /**
   * Actualiza una reseña existente
   * @param {number} productId - ID del producto
   * @param {object} review - Datos actualizados {stars, comment}
   * @returns {Promise} Reseña actualizada
   */
  updateReview: function(productId, review) {
    return window.api.put('/products/' + productId + '/reviews', review)
      .then(function(response) {
        return response.review || null;
      })
      .catch(function(error) {
        console.error('Error updating review:', error);
        throw error;
      });
  },

  /**
   * Elimina una reseña
   * @param {number} productId - ID del producto
   * @returns {Promise} Success response
   */
  deleteReview: function(productId) {
    return window.api.delete('/products/' + productId + '/reviews')
      .then(function(response) {
        return response;
      })
      .catch(function(error) {
        console.error('Error deleting review:', error);
        throw error;
      });
  },

  /**
   * Renderiza una tarjeta de producto HTML
   * @param {object} product - Objeto producto
   * @returns {string} HTML de la tarjeta
   */
  renderCard: function(product) {
    var eur = "S/.";
    var badges = '';
    if (product.eco) badges = badges + '<span class="badge badge-eco">🌿</span>';
    if (product.cruelty) badges = badges + '<span class="badge badge-cruelty">🐰</span>';
    var labels = '';
    if (product.eco) labels = labels + '<span class="badge-label">Ecológico</span> ';
    if (product.cruelty) labels = labels + '<span class="badge-label">Sin crueldad animal</span>';
    var isFav = Storage.isFavorite(product.id);
    var imgUrl = Products.getImageUrl(product.name, product.image_url || product.image);
    var html = '<div class="product-card" data-pid="' + product.id + '">';
    html = html + '<div style="position:relative;">';
    html = html + '<img src="' + imgUrl + '" alt="' + product.name + '">';
    html = html + '<button class="product-card-fav ' + (isFav ? 'active' : '') + '" onclick="event.stopPropagation();App.toggleFav(' + product.id + ',this)">' + (isFav ? '♥' : '♡') + '</button>';
    html = html + '</div>';
    html = html + '<div class="product-card-info">';
    html = html + '<div class="product-card-name">' + product.name + '</div>';
    html = html + '<div class="product-card-price">' + eur + (product.price != null ? parseFloat(product.price).toFixed(2) : '—') + '</div>';
    html = html + '<div class="product-card-badges">' + badges + '</div>';
    html = html + '</div></div>';
    return html;
  },

  /**
   * Limpia el cache de productos
   */
  clearCache: function() {
    this._cache = null;
    this._cacheTime = null;
  },

  /**
   * Obtiene la URL de imagen correcta para un producto según su nombre
   */
  getImageUrl: function(productName, fallback) {
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
  }
};
