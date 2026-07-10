/**
 * Panel de Administración - DermaMatch
 * Módulo frontend para gestión administrativa
 * Requiere: api-client.js, storage.js
 */

var Admin = {
  // Cache local para evitar requests repetidas
  _dashboard: null,
  _products: null,
  _users: null,
  _orders: null,
  _consultas: null,
  _reviews: null,

  /**
   * Verifica si el usuario actual es admin
   */
  isAdmin: function() {
    var user = Storage.getCurrentUser();
    return user && user.role === 'admin';
  },

  /**
   * Obtiene métricas del dashboard
   * GET /api/admin/dashboard
   */
  getDashboard: function() {
    var self = this;
    return window.api.get('/admin/dashboard')
      .then(function(response) {
        self._dashboard = response.dashboard;
        return response.dashboard;
      })
      .catch(function(error) {
        console.error('Error cargando dashboard:', error);
        throw error;
      });
  },

  /**
   * Obtiene lista de productos (para admin)
   * Usa el endpoint público GET /api/products
   */
  getProducts: function(params) {
    return window.api.get('/products', params || {})
      .then(function(response) {
        return response.products || [];
      })
      .catch(function(error) {
        console.error('Error cargando productos:', error);
        throw error;
      });
  },

  /**
   * Crea un nuevo producto
   * POST /api/admin/products
   */
  createProduct: function(productData) {
    return window.api.post('/admin/products', productData)
      .then(function(response) {
        if (response.success && response.product) {
          return response.product;
        }
        throw new Error('No se pudo crear el producto');
      })
      .catch(function(error) {
        console.error('Error creando producto:', error);
        throw error;
      });
  },

  /**
   * Actualiza un producto existente
   * PUT /api/admin/products/:id
   */
  updateProduct: function(productId, productData) {
    return window.api.put('/admin/products/' + productId, productData)
      .then(function(response) {
        if (response.success && response.product) {
          return response.product;
        }
        throw new Error('No se pudo actualizar el producto');
      })
      .catch(function(error) {
        console.error('Error actualizando producto:', error);
        throw error;
      });
  },

  /**
   * Desactiva (soft delete) un producto
   * DELETE /api/admin/products/:id
   */
  deleteProduct: function(productId) {
    return window.api.delete('/admin/products/' + productId)
      .then(function(response) {
        if (response.success) {
          return { success: true, message: response.message };
        }
        throw new Error('No se pudo desactivar el producto');
      })
      .catch(function(error) {
        console.error('Error desactivando producto:', error);
        throw error;
      });
  },

  /**
   * Obtiene lista de usuarios (paginado)
   * GET /api/admin/users
   */
  getUsers: function(params) {
    var self = this;
    params = params || {};

    return window.api.get('/admin/users', {
      page: params.page || 1,
      limit: params.limit || 20,
      role: params.role || null
    })
      .then(function(response) {
        self._users = response.users || [];
        return {
          users: response.users || [],
          pagination: response.pagination || {}
        };
      })
      .catch(function(error) {
        console.error('Error cargando usuarios:', error);
        throw error;
      });
  },

  /**
   * Actualiza el rol de un usuario
   * PUT /api/admin/users/:id
   */
  updateUserRole: function(userId, newRole) {
    return window.api.put('/admin/users/' + userId, { role: newRole })
      .then(function(response) {
        if (response.success && response.user) {
          return response.user;
        }
        throw new Error('No se pudo actualizar el rol del usuario');
      })
      .catch(function(error) {
        console.error('Error actualizando usuario:', error);
        throw error;
      });
  },

  /**
   * Obtiene lista de órdenes (paginado)
   * GET /api/admin/orders
   */
  getOrders: function(params) {
    var self = this;
    params = params || {};

    return window.api.get('/admin/orders', {
      page: params.page || 1,
      limit: params.limit || 20,
      status: params.status || null
    })
      .then(function(response) {
        self._orders = response.orders || [];
        return {
          orders: response.orders || [],
          pagination: response.pagination || {}
        };
      })
      .catch(function(error) {
        console.error('Error cargando órdenes:', error);
        throw error;
      });
  },

  /**
   * Actualiza el estado de una orden
   * PUT /api/admin/orders/:id
   */
  updateOrderStatus: function(orderId, newStatus) {
    return window.api.put('/admin/orders/' + orderId, { status: newStatus })
      .then(function(response) {
        if (response.success && response.order) {
          return response.order;
        }
        throw new Error('No se pudo actualizar la orden');
      })
      .catch(function(error) {
        console.error('Error actualizando orden:', error);
        throw error;
      });
  },

  /**
   * Obtiene lista de consultas
   * GET /api/admin/consultas
   */
  getConsultas: function(params) {
    var self = this;
    params = params || {};

    return window.api.get('/admin/consultas', {
      status: params.status || null
    })
      .then(function(response) {
        self._consultas = response.consultas || [];
        return response.consultas || [];
      })
      .catch(function(error) {
        console.error('Error cargando consultas:', error);
        throw error;
      });
  },

  /**
   * Responde una consulta
   * PUT /api/admin/consultas/:id
   */
  answerConsulta: function(consultaId, answer) {
    return window.api.put('/admin/consultas/' + consultaId, { answer: answer })
      .then(function(response) {
        if (response.success && response.consulta) {
          return response.consulta;
        }
        throw new Error('No se pudo responder la consulta');
      })
      .catch(function(error) {
        console.error('Error respondiendo consulta:', error);
        throw error;
      });
  },

  /**
   * Obtiene reseñas reportadas
   * GET /api/admin/reviews/reported
   */
  getReportedReviews: function() {
    var self = this;
    return window.api.get('/admin/reviews/reported')
      .then(function(response) {
        self._reviews = response.reviews || [];
        return response.reviews || [];
      })
      .catch(function(error) {
        console.error('Error cargando reseñas reportadas:', error);
        throw error;
      });
  },

  /**
   * Modera una reseña
   * PUT /api/admin/reviews/:id
   */
  moderateReview: function(reviewId, moderationData) {
    moderationData = moderationData || {};

    return window.api.put('/admin/reviews/' + reviewId, moderationData)
      .then(function(response) {
        if (response.success && response.review) {
          return response.review;
        }
        throw new Error('No se pudo moderar la reseña');
      })
      .catch(function(error) {
        console.error('Error moderando reseña:', error);
        throw error;
      });
  },

  /**
   * Renderiza el dashboard principal
   */
  renderDashboard: function() {
    var app = document.getElementById('app');
    var self = this;

    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div></p>Cargando dashboard...</p></div></div>';

    this.getDashboard()
      .then(function(dashboard) {
        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Panel de Administración</h2>' +
          '<p style="color:var(--text-secondary);margin-bottom:1.5rem;">Métricas y gestión del sistema</p>' +

          '<div class="admin-nav">' +
          '<button class="btn btn-secondary" onclick="Admin.renderDashboard()">📊 Dashboard</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderProducts()">📦 Productos</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderUsers()">👥 Usuarios</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderOrders()">🛒 Órdenes</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderConsultas()">💬 Consultas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderReviews()">⭐ Reseñas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderQuizRecommendations()">🧪 Reglas Test</button>' +
          '</div>' +

          '<h3 style="margin:2rem 0 1rem;">Métricas del Sistema</h3>' +
          '<div class="dashboard-metrics">' +
          '<div class="metric-card">' +
          '<div class="metric-value">' + dashboard.total_users + '</div>' +
          '<div class="metric-label">Usuarios Totales</div>' +
          '</div>' +
          '<div class="metric-card">' +
          '<div class="metric-value">' + dashboard.active_products + '</div>' +
          '<div class="metric-label">Productos Activos</div>' +
          '</div>' +
          '<div class="metric-card">' +
          '<div class="metric-value">' + dashboard.total_orders + '</div>' +
          '<div class="metric-label">Órdenes Totales</div>' +
          '</div>' +
          '<div class="metric-card">' +
          '<div class="metric-value">' + dashboard.pending_consultas + '</div>' +
          '<div class="metric-label">Consultas Pendientes</div>' +
          '</div>' +
          '<div class="metric-card">' +
          '<div class="metric-value">' + dashboard.reported_reviews + '</div>' +
          '<div class="metric-label">Reseñas Reportadas</div>' +
          '</div>' +
          '<div class="metric-card">' +
          '<div class="metric-value">S/' + dashboard.total_revenue.toFixed(0) + '</div>' +
          '<div class="metric-label">Ingresos Totales</div>' +
          '</div>' +
          '<div class="metric-card">' +
          '<div class="metric-value">' + dashboard.total_premium + '</div>' +
          '<div class="metric-label">Usuarios Premium</div>' +
          '</div>' +
          '</div>' +
          '</div>';
      })
      .catch(function(error) {
        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Panel de Administración</h2>' +
          '<p style="color:var(--error);">Error al cargar dashboard: ' + (error.error || 'Intenta nuevamente') + '</p>' +
          '</div>';
      });
  },

  /**
   * Renderiza gestión de productos
   */
  renderProducts: function() {
    var app = document.getElementById('app');
    var self = this;

    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div></p>Cargando productos...</p></div></div>';

    this.getProducts()
      .then(function(products) {
        var productsHtml = products.length === 0
          ? '<div class="empty-state"><div class="empty-state-icon">📦</div><p>No hay productos registrados.</p></div>'
          : products.map(function(p) {
              return '<div class="admin-item-card">' +
                '<div class="admin-item-header">' +
                '<strong>' + p.name + '</strong>' +
                '<span>S/ ' + parseFloat(p.price).toFixed(2) + '</span>' +
                '</div>' +
                '<div style="font-size:0.85rem;color:var(--text-secondary);margin:0.25rem 0;">' +
                'Marca: ' + p.brand + ' | Categoría: ' + p.category +
                (p.is_active === false ? ' | <span style="color:var(--error);">INACTIVO</span>' : ' | <span style="color:var(--success);">Activo</span>') +
                '</div>' +
                '<div class="admin-item-actions">' +
                '<button class="btn btn-sm btn-secondary" onclick="Admin.editProduct(' + p.id + ')">✏️ Editar</button>' +
                '<button class="btn btn-sm ' + (p.is_active ? 'btn-error' : 'btn-success') + '" onclick="Admin.toggleProductActive(' + p.id + ', ' + (p.is_active ? 'false' : 'true') + ')">' +
                (p.is_active ? '🚫 Desactivar' : '✅ Activar') +
                '</button>' +
                '</div>' +
                '</div>';
            }).join('');

        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Gestión de Productos</h2>' +

          '<div class="admin-nav">' +
          '<button class="btn btn-secondary" onclick="Admin.renderDashboard()">📊 Dashboard</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderProducts()">📦 Productos</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderUsers()">👥 Usuarios</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderOrders()">🛒 Órdenes</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderConsultas()">💬 Consultas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderReviews()">⭐ Reseñas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderQuizRecommendations()">🧪 Reglas Test</button>' +
          '</div>' +

          '<div style="margin:1.5rem 0;">' +
          '<button class="btn btn-primary" onclick="Admin.showCreateProductModal()">➕ Nuevo Producto</button>' +
          '</div>' +

          '<div class="admin-items-list">' + productsHtml + '</div>' +
          '</div>';
      })
      .catch(function(error) {
        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Gestión de Productos</h2>' +
          '<p style="color:var(--error);">Error al cargar productos: ' + (error.error || 'Intenta nuevamente') + '</p>' +
          '</div>';
      });
  },

  /**
   * Renderiza gestión de usuarios
   */
  renderUsers: function() {
    var app = document.getElementById('app');
    var self = this;

    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div></p>Cargando usuarios...</p></div></div>';

    this.getUsers()
      .then(function(result) {
        var users = result.users || [];
        var pagination = result.pagination || {};

        var usersHtml = users.length === 0
          ? '<div class="empty-state"><div class="empty-state-icon">👥</div><p>No hay usuarios registrados.</p></div>'
          : users.map(function(u) {
              var roleLabels = { user: 'Usuario', premium: 'Premium', dermatologist: 'Dermatólogo', admin: 'Admin' };
              var roleBadge = u.role === 'admin' ? 'admin-badge' : u.role === 'premium' ? 'premium-badge' : 'user-badge';
              return '<div class="admin-item-card">' +
                '<div class="admin-item-header">' +
                '<strong>' + u.name + '</strong>' +
                '<span class="' + roleBadge + '">' + (roleLabels[u.role] || u.role) + '</span>' +
                '</div>' +
                '<div style="font-size:0.85rem;color:var(--text-secondary);margin:0.25rem 0;">' +
                'Email: ' + u.email +
                (u.subscription_plan ? ' | Plan: ' + u.subscription_plan : '') +
                '</div>' +
                '<div class="admin-item-actions">' +
                '<button class="btn btn-sm btn-secondary" onclick="Admin.changeUserRole(' + u.id + ', \'' + u.role + '\')">🔄 Cambiar Rol</button>' +
                '</div>' +
                '</div>';
            }).join('');

        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Gestión de Usuarios</h2>' +

          '<div class="admin-nav">' +
          '<button class="btn btn-secondary" onclick="Admin.renderDashboard()">📊 Dashboard</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderProducts()">📦 Productos</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderUsers()">👥 Usuarios</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderOrders()">🛒 Órdenes</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderConsultas()">💬 Consultas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderReviews()">⭐ Reseñas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderQuizRecommendations()">🧪 Reglas Test</button>' +
          '</div>' +

          '<div style="margin:1rem 0;font-size:0.85rem;color:var(--text-secondary);">' +
          'Total: ' + (pagination.total || 0) + ' usuarios' +
          '</div>' +

          '<div class="admin-items-list">' + usersHtml + '</div>' +
          '</div>';
      })
      .catch(function(error) {
        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Gestión de Usuarios</h2>' +
          '<p style="color:var(--error);">Error al cargar usuarios: ' + (error.error || 'Intenta nuevamente') + '</p>' +
          '</div>';
      });
  },

  /**
   * Renderiza gestión de órdenes
   */
  renderOrders: function() {
    var app = document.getElementById('app');
    var self = this;

    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div></p>Cargando órdenes...</p></div></div>';

    this.getOrders()
      .then(function(result) {
        var orders = result.orders || [];
        var pagination = result.pagination || {};

        var statusLabels = {
          pending: 'Pendiente',
          confirmed: 'Confirmada',
          processing: 'Procesando',
          shipped: 'Enviada',
          delivered: 'Entregada',
          cancelled: 'Cancelada'
        };
        var statusClasses = {
          pending: 'pending',
          confirmed: 'confirmed',
          processing: 'processing',
          shipped: 'shipped',
          delivered: 'delivered',
          cancelled: 'cancelled'
        };

        var ordersHtml = orders.length === 0
          ? '<div class="empty-state"><div class="empty-state-icon">🛒</div><p>No hay órdenes registradas.</p></div>'
          : orders.map(function(o) {
              return '<div class="admin-item-card">' +
                '<div class="admin-item-header">' +
                '<strong>Orden #' + o.id + '</strong>' +
                '<span>S/ ' + o.total.toFixed(2) + '</span>' +
                '</div>' +
                '<div style="font-size:0.85rem;color:var(--text-secondary);margin:0.25rem 0;">' +
                'Cliente: ' + (o.user ? o.user.name : 'N/A') + ' | Email: ' + (o.user ? o.user.email : 'N/A') +
                '</div>' +
                '<div style="margin:0.5rem 0;">' +
                '<span class="order-status ' + statusClasses[o.status] + '">' + statusLabels[o.status] + '</span>' +
                '</div>' +
                '<div class="admin-item-actions">' +
                '<button class="btn btn-sm btn-secondary" onclick="Admin.changeOrderStatus(' + o.id + ', \'' + o.status + '\')">🔄 Cambiar Estado</button>' +
                '</div>' +
                '</div>';
            }).join('');

        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Gestión de Órdenes</h2>' +

          '<div class="admin-nav">' +
          '<button class="btn btn-secondary" onclick="Admin.renderDashboard()">📊 Dashboard</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderProducts()">📦 Productos</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderUsers()">👥 Usuarios</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderOrders()">🛒 Órdenes</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderConsultas()">💬 Consultas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderReviews()">⭐ Reseñas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderQuizRecommendations()">🧪 Reglas Test</button>' +
          '</div>' +

          '<div style="margin:1rem 0;font-size:0.85rem;color:var(--text-secondary);">' +
          'Total: ' + (pagination.total || 0) + ' órdenes' +
          '</div>' +

          '<div class="admin-items-list">' + ordersHtml + '</div>' +
          '</div>';
      })
      .catch(function(error) {
        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Gestión de Órdenes</h2>' +
          '<p style="color:var(--error);">Error al cargar órdenes: ' + (error.error || 'Intenta nuevamente') + '</p>' +
          '</div>';
      });
  },

  /**
   * Renderiza gestión de consultas
   */
  renderConsultas: function() {
    var app = document.getElementById('app');
    var self = this;

    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div></p>Cargando consultas...</p></div></div>';

    this.getConsultas()
      .then(function(consultas) {
        var statusLabels = { pending: 'Pendiente', answered: 'Respondida', closed: 'Cerrada' };
        var statusClasses = { pending: 'pending', answered: 'answered', closed: 'closed' };

        var consultasHtml = consultas.length === 0
          ? '<div class="empty-state"><div class="empty-state-icon">💬</div><p>No hay consultas registradas.</p></div>'
          : consultas.map(function(c) {
              return '<div class="admin-item-card">' +
                '<div class="admin-item-header">' +
                '<strong>' + c.subject + '</strong>' +
                '<span class="consulta-status ' + statusClasses[c.status] + '">' + statusLabels[c.status] + '</span>' +
                '</div>' +
                '<div style="font-size:0.85rem;color:var(--text-secondary);margin:0.25rem 0;">' +
                'De: ' + (c.user ? c.user.name : 'N/A') + ' (' + (c.user ? c.user.email : 'N/A') + ')' +
                '</div>' +
                '<div style="margin:0.5rem 0;padding:0.5rem;background:var(--bg-tertiary);border-radius:4px;">' +
                '<p style="margin:0;font-size:0.9rem;">' + c.message + '</p>' +
                (c.answer ? '<p style="margin:0.5rem 0 0;color:var(--success);"><strong>Respuesta:</strong> ' + c.answer + '</p>' : '') +
                '</div>' +
                '<div class="admin-item-actions">' +
                (c.status === 'pending' ? '<button class="btn btn-sm btn-primary" onclick="Admin.answerConsultaModal(' + c.id + ')">✏️ Responder</button>' : '') +
                '</div>' +
                '</div>';
            }).join('');

        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Gestión de Consultas</h2>' +

          '<div class="admin-nav">' +
          '<button class="btn btn-secondary" onclick="Admin.renderDashboard()">📊 Dashboard</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderProducts()">📦 Productos</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderUsers()">👥 Usuarios</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderOrders()">🛒 Órdenes</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderConsultas()">💬 Consultas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderReviews()">⭐ Reseñas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderQuizRecommendations()">🧪 Reglas Test</button>' +
          '</div>' +

          '<div style="margin:1rem 0;font-size:0.85rem;color:var(--text-secondary);">' +
          'Total: ' + consultas.length + ' consultas' +
          '</div>' +

          '<div class="admin-items-list">' + consultasHtml + '</div>' +
          '</div>';
      })
      .catch(function(error) {
        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Gestión de Consultas</h2>' +
          '<p style="color:var(--error);">Error al cargar consultas: ' + (error.error || 'Intenta nuevamente') + '</p>' +
          '</div>';
      });
  },

  /**
   * Renderiza moderación de reseñas
   */
  renderReviews: function() {
    var app = document.getElementById('app');
    var self = this;

    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div></p>Cargando reseñas reportadas...</p></div></div>';

    this.getReportedReviews()
      .then(function(reviews) {
        var reviewsHtml = reviews.length === 0
          ? '<div class="empty-state"><div class="empty-state-icon">⭐</div><p>No hay reseñas reportadas.</p></div>'
          : reviews.map(function(r) {
              return '<div class="admin-item-card">' +
                '<div class="admin-item-header">' +
                '<strong>' + (r.product ? r.product.name : 'Producto desconocido') + '</strong>' +
                '<span>' + '⭐'.repeat(r.stars) + '</span>' +
                '</div>' +
                '<div style="font-size:0.85rem;color:var(--text-secondary);margin:0.25rem 0;">' +
                'Por: ' + (r.user ? r.user.name : 'N/A') + ' | ' + Utils.formatDate(r.created_at) +
                '</div>' +
                '<div style="margin:0.5rem 0;padding:0.5rem;background:var(--bg-tertiary);border-radius:4px;">' +
                '<p style="margin:0;font-size:0.9rem;">' + r.comment + '</p>' +
                '</div>' +
                '<div class="admin-item-actions">' +
                '<button class="btn btn-sm btn-success" onclick="Admin.approveReview(' + r.id + ')">✅ Aprobar</button>' +
                '<button class="btn btn-sm btn-error" onclick="Admin.deleteReview(' + r.id + ')">🗑️ Eliminar</button>' +
                '</div>' +
                '</div>';
            }).join('');

        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Moderación de Reseñas</h2>' +

          '<div class="admin-nav">' +
          '<button class="btn btn-secondary" onclick="Admin.renderDashboard()">📊 Dashboard</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderProducts()">📦 Productos</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderUsers()">👥 Usuarios</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderOrders()">🛒 Órdenes</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderConsultas()">💬 Consultas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderReviews()">⭐ Reseñas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderQuizRecommendations()">🧪 Reglas Test</button>' +
          '</div>' +

          '<div style="margin:1rem 0;font-size:0.85rem;color:var(--text-secondary);">' +
          'Total: ' + reviews.length + ' reseñas reportadas' +
          '</div>' +

          '<div class="admin-items-list">' + reviewsHtml + '</div>' +
          '</div>';
      })
      .catch(function(error) {
        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Moderación de Reseñas</h2>' +
          '<p style="color:var(--error);">Error al cargar reseñas: ' + (error.error || 'Intenta nuevamente') + '</p>' +
          '</div>';
      });
  },

  /**
   * Acciones de producto (placeholder para implementación completa)
   */
  showCreateProductModal: function() {
    Utils.showModal({
      type: 'info',
      title: 'Crear Producto',
      message: 'Función en desarrollo. Próximamente podrás crear productos desde el panel admin.'
    });
  },

  editProduct: function(productId) {
    Utils.showModal({
      type: 'info',
      title: 'Editar Producto',
      message: 'Función en desarrollo. Próximamente podrás editar productos desde el panel admin.'
    });
  },

  toggleProductActive: function(productId, newState) {
    var self = this;
    var action = newState ? 'activar' : 'desactivar';

    Utils.showModal({
      type: 'info',
      title: (newState ? 'Activar' : 'Desactivar') + ' Producto',
      message: '¿Estás seguro de que quieres ' + action + ' este producto?',
      onConfirm: function() {
        self.deleteProduct(productId)
          .then(function() {
            Utils.showModal({
              type: 'success',
              title: 'Producto ' + (newState ? 'activado' : 'desactivado'),
              message: 'El producto ha sido ' + (newState ? 'activado' : 'desactivado') + ' correctamente.'
            });
            self.renderProducts();
          })
          .catch(function(error) {
            Utils.showModal({
              type: 'error',
              title: 'Error',
              message: 'No se pudo ' + action + ' el producto: ' + (error.error || 'Intenta nuevamente')
            });
          });
      }
    });
  },

  /**
   * Acciones de usuario
   */
  changeUserRole: function(userId, currentRole) {
    var self = this;
    var roles = ['user', 'premium', 'dermatologist', 'admin'];
    var roleLabels = { user: 'Usuario', premium: 'Premium', dermatologist: 'Dermatólogo', admin: 'Admin' };

    Utils.showModal({
      type: 'info',
      title: 'Cambiar Rol',
      message: 'Rol actual: ' + roleLabels[currentRole] + '. Selecciona el nuevo rol:',
      onConfirm: function() {
        // Por ahora, mostrar mensaje de desarrollo
        Utils.showModal({
          type: 'info',
          title: 'En Desarrollo',
          message: 'Función en desarrollo. Próximamente podrás cambiar roles desde el panel admin.'
        });
      }
    });
  },

  /**
   * Acciones de orden
   */
  changeOrderStatus: function(orderId, currentStatus) {
    var self = this;
    var transitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: []
    };

    var allowed = transitions[currentStatus] || [];
    var statusLabels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      processing: 'Procesando',
      shipped: 'Enviada',
      delivered: 'Entregada',
      cancelled: 'Cancelada'
    };

    Utils.showModal({
      type: 'info',
      title: 'Cambiar Estado de Orden',
      message: 'Estado actual: ' + statusLabels[currentStatus] + '. Próximamente podrás seleccionar el nuevo estado.',
      onConfirm: function() {
        Utils.showModal({
          type: 'info',
          title: 'En Desarrollo',
          message: 'Función en desarrollo. Próximamente podrás cambiar estados de orden desde el panel admin.'
        });
      }
    });
  },

  /**
   * Acciones de consulta
   */
  answerConsultaModal: function(consultaId) {
    var self = this;

    Utils.showModal({
      type: 'info',
      title: 'Responder Consulta',
      message: 'Función en desarrollo. Próximamente podrás responder consultas desde el panel admin.'
    });
  },

  /**
   * Acciones de reseña
   */
  approveReview: function(reviewId) {
    var self = this;

    Utils.showModal({
      type: 'info',
      title: 'Aprobar Reseña',
      message: '¿Estás seguro de que quieres aprobar esta reseña?',
      onConfirm: function() {
        self.moderateReview(reviewId, { is_reported: false })
          .then(function() {
            Utils.showModal({
              type: 'success',
              title: 'Reseña Aprobada',
              message: 'La reseña ha sido aprobada y ya no aparecerá como reportada.'
            });
            self.renderReviews();
          })
          .catch(function(error) {
            Utils.showModal({
              type: 'error',
              title: 'Error',
              message: 'No se pudo aprobar la reseña: ' + (error.error || 'Intenta nuevamente')
            });
          });
      }
    });
  },

  deleteReview: function(reviewId) {
    var self = this;

    Utils.showModal({
      type: 'info',
      title: 'Eliminar Reseña',
      message: '¿Estás seguro de que quieres eliminar esta reseña?',
      onConfirm: function() {
        self.moderateReview(reviewId, { deleted: true })
          .then(function() {
            Utils.showModal({
              type: 'success',
              title: 'Reseña Eliminada',
              message: 'La reseña ha sido eliminada correctamente.'
            });
            self.renderReviews();
          })
          .catch(function(error) {
            Utils.showModal({
              type: 'error',
              title: 'Error',
              message: 'No se pudo eliminar la reseña: ' + (error.error || 'Intenta nuevamente')
            });
          });
      }
    });
  },

  // === Quiz Recommendations ===

  getQuizRecommendations: function() {
    return window.api.get('/admin/quiz-recommendations')
      .then(function(response) { return response.rules || []; });
  },

  createQuizRecommendation: function(data) {
    return window.api.post('/admin/quiz-recommendations', data)
      .then(function(response) {
        if (response.success) return response.rule;
        throw new Error('No se pudo crear la regla');
      });
  },

  updateQuizRecommendation: function(id, data) {
    return window.api.put('/admin/quiz-recommendations/' + id, data)
      .then(function(response) {
        if (response.success) return response.rule;
        throw new Error('No se pudo actualizar la regla');
      });
  },

  deleteQuizRecommendation: function(id) {
    return window.api.delete('/admin/quiz-recommendations/' + id)
      .then(function(response) {
        if (response.success) return true;
        throw new Error('No se pudo eliminar la regla');
      });
  },

  renderQuizRecommendations: function() {
    var app = document.getElementById('app');
    var self = this;

    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div><p>Cargando reglas...</p></div></div>';

    this.getQuizRecommendations()
      .then(function(rules) {
        var quizAnswerLabels = {
          q1: { dry: 'Seca', normal: 'Normal', oily: 'Grasa', mixed: 'Mixta' },
          q2: { sensitive_high: 'Muy sensible', sensitive_medium: 'Moderadamente sensible', not_sensitive: 'No sensible' },
          q3: { large_pores: 'Poros grandes', small_pores: 'Poros pequeños', medium_pores: 'Poros normales' },
          q4: { acne_high: 'Acné frecuente', acne_occasional: 'Acné ocasional', no_acne: 'Sin acné' },
          q5: { sun_sensitive: 'Fotosensible', sun_normal: 'Normal al sol', sun_resistant: 'Resistente al sol' },
          q6: { aging_visible: 'Líneas visibles', aging_mild: 'Líneas leves', no_aging: 'Sin líneas' },
          q7: { hyperpig_high: 'Manchas visibles', hyperpig_mild: 'Manchas leves', no_hyperpig: 'Tono uniforme' }
        };

        function conditionsLabel(cond) {
          if (!cond || Object.keys(cond).length === 0) return '<em>Sin condiciones (catch-all)</em>';
          return Object.keys(cond).map(function(k) {
            var val = (quizAnswerLabels[k] && quizAnswerLabels[k][cond[k]]) ? quizAnswerLabels[k][cond[k]] : cond[k];
            return '<span class="ingredient-tag">' + k + ': ' + val + '</span>';
          }).join(' ');
        }

        var rulesHtml = rules.length === 0
          ? '<div class="empty-state"><div class="empty-state-icon">🧪</div><p>No hay reglas configuradas. Crea una nueva regla para empezar.</p></div>'
          : rules.map(function(r) {
              return '<div class="admin-item-card">' +
                '<div class="admin-item-header">' +
                '<strong>' + r.label + '</strong>' +
                '<span style="font-size:0.8rem;color:var(--text-secondary);">Prioridad: ' + r.priority + ' · ' + (r.is_active ? '<span style="color:var(--success);">Activa</span>' : '<span style="color:var(--error);">Inactiva</span>') + '</span>' +
                '</div>' +
                '<div style="margin:0.35rem 0;font-size:0.85rem;">' + conditionsLabel(r.conditions) + '</div>' +
                '<div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:0.5rem;">' +
                (r.product_ids && r.product_ids.length > 0
                  ? r.product_ids.length + ' producto(s): [' + r.product_ids.slice(0, 5).join(', ') + (r.product_ids.length > 5 ? '...' : '') + ']'
                  : 'Sin productos configurados') +
                '</div>' +
                '<div class="admin-item-actions">' +
                '<button class="btn btn-sm btn-secondary" onclick="Admin.showQuizRecommendationForm(' + r.id + ')">✏️ Editar</button>' +
                '<button class="btn btn-sm btn-error" onclick="Admin.confirmDeleteQuizRule(' + r.id + ')">🗑️ Eliminar</button>' +
                '</div>' +
                '</div>';
            }).join('');

        app.innerHTML = '<div class="container">' +
          '<h2 style="margin-bottom:0.5rem;">👩‍💻 Reglas de Recomendación del Test</h2>' +
          '<p style="color:var(--text-secondary);margin-bottom:1rem;">Configura qué productos se recomiendan según las respuestas del test de piel.</p>' +

          '<div class="admin-nav">' +
          '<button class="btn btn-secondary" onclick="Admin.renderDashboard()">📊 Dashboard</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderProducts()">📦 Productos</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderUsers()">👥 Usuarios</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderOrders()">🛒 Órdenes</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderConsultas()">💬 Consultas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderReviews()">⭐ Reseñas</button>' +
          '<button class="btn btn-secondary" onclick="Admin.renderQuizRecommendations()">🧪 Reglas Test</button>' +
          '</div>' +

          '<div style="margin:1.5rem 0;">' +
          '<button class="btn btn-primary" onclick="Admin.showQuizRecommendationForm(null)">➕ Nueva Regla</button>' +
          '</div>' +

          '<div class="admin-items-list">' + rulesHtml + '</div>' +
          '</div>';
      })
      .catch(function(error) {
        app.innerHTML = '<div class="container"><p style="color:var(--error);">Error: ' + (error.error || 'Intenta nuevamente') + '</p></div>';
      });
  },

  showQuizRecommendationForm: function(ruleId) {
    var self = this;
    var isEdit = !!ruleId;

    var quizOptions = {
      q1: [['dry','Seca'],['normal','Normal'],['oily','Grasa'],['mixed','Mixta']],
      q2: [['sensitive_high','Muy sensible'],['sensitive_medium','Moderada'],['not_sensitive','No sensible']],
      q3: [['large_pores','Poros grandes'],['small_pores','Poros pequeños'],['medium_pores','Poros normales']],
      q4: [['acne_high','Acné frecuente'],['acne_occasional','Ocasional'],['no_acne','Sin acné']],
      q5: [['sun_sensitive','Fotosensible'],['sun_normal','Normal'],['sun_resistant','Resistente']],
      q6: [['aging_visible','Líneas visibles'],['aging_mild','Líneas leves'],['no_aging','Sin líneas']],
      q7: [['hyperpig_high','Manchas visibles'],['hyperpig_mild','Manchas leves'],['no_hyperpig','Uniforme']]
    };

    function buildForm(rule) {
      rule = rule || {};
      var cond = rule.conditions || {};
      var condRows = Object.keys(quizOptions).map(function(q) {
        var opts = '<option value="">— cualquiera —</option>' +
          quizOptions[q].map(function(o) {
            return '<option value="' + o[0] + '"' + (cond[q] === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
          }).join('');
        return '<div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.4rem;">' +
          '<label style="width:2rem;font-weight:600;">' + q + '</label>' +
          '<select id="cond_' + q + '" style="flex:1;padding:0.4rem;border:1px solid var(--gray-200);border-radius:4px;">' + opts + '</select>' +
          '</div>';
      }).join('');

      var productIdsVal = (rule.product_ids || []).join(', ');

      var existing = document.querySelector('.modal-overlay');
      if (existing) existing.remove();

      var div = document.createElement('div');
      div.className = 'modal-overlay';
      div.innerHTML = '<div class="modal-content" style="max-width:480px;max-height:90vh;overflow-y:auto;">' +
        '<h3>' + (isEdit ? '✏️ Editar Regla' : '➕ Nueva Regla') + '</h3>' +
        '<label>Nombre de la regla</label>' +
        '<input type="text" id="ruleLabel" class="cart-input" value="' + (rule.label || '') + '" placeholder="Ej: Piel seca + alta sensibilidad">' +
        '<label style="margin-top:0.75rem;">Prioridad (número mayor = se aplica primero)</label>' +
        '<input type="number" id="rulePriority" class="cart-input" value="' + (rule.priority || 0) + '" min="0">' +
        '<label style="margin-top:0.75rem;">Condiciones (dejar en blanco = catch-all)</label>' +
        condRows +
        '<label style="margin-top:0.75rem;">IDs de productos recomendados (separados por coma)</label>' +
        '<input type="text" id="ruleProductIds" class="cart-input" value="' + productIdsVal + '" placeholder="1, 4, 7, 13">' +
        '<p style="font-size:0.75rem;color:var(--text-secondary);margin-top:0.25rem;">Puedes ver los IDs en la sección Productos del panel admin.</p>' +
        '<button class="btn btn-primary btn-full" style="margin-top:1rem;" onclick="Admin._saveQuizRule(' + (ruleId || 'null') + ')">Guardar</button>' +
        '<button class="btn btn-secondary btn-full" style="margin-top:0.5rem;" onclick="this.closest(\'.modal-overlay\').remove()">Cancelar</button>' +
        '</div>';
      document.body.appendChild(div);
    }

    if (isEdit) {
      window.api.get('/admin/quiz-recommendations')
        .then(function(res) {
          var rule = (res.rules || []).find(function(r) { return r.id === ruleId; });
          buildForm(rule);
        })
        .catch(function() { buildForm(null); });
    } else {
      buildForm(null);
    }
  },

  _saveQuizRule: function(ruleId) {
    var self = this;
    var label = document.getElementById('ruleLabel').value.trim();
    if (!label) {
      Utils.showModal({ type: 'error', title: 'Campo requerido', message: 'El nombre de la regla es obligatorio.' });
      return;
    }

    var conditions = {};
    ['q1','q2','q3','q4','q5','q6','q7'].forEach(function(q) {
      var el = document.getElementById('cond_' + q);
      if (el && el.value) conditions[q] = el.value;
    });

    var rawIds = document.getElementById('ruleProductIds').value;
    var product_ids = rawIds.split(',').map(function(s) { return parseInt(s.trim(), 10); }).filter(function(n) { return !isNaN(n); });
    var priority = parseInt(document.getElementById('rulePriority').value, 10) || 0;

    var data = { label: label, conditions: conditions, product_ids: product_ids, priority: priority };
    var action = ruleId ? self.updateQuizRecommendation(ruleId, data) : self.createQuizRecommendation(data);

    action.then(function() {
      document.querySelector('.modal-overlay').remove();
      Utils.showModal({ type: 'success', title: 'Guardado', message: 'Regla guardada correctamente.' });
      self.renderQuizRecommendations();
    }).catch(function(err) {
      Utils.showModal({ type: 'error', title: 'Error', message: err.error || 'No se pudo guardar la regla.' });
    });
  },

  confirmDeleteQuizRule: function(ruleId) {
    var self = this;
    Utils.showModal({
      type: 'info',
      title: 'Eliminar Regla',
      message: '¿Estás seguro de que quieres desactivar esta regla?',
      onConfirm: function() {
        self.deleteQuizRecommendation(ruleId)
          .then(function() {
            Utils.showModal({ type: 'success', title: 'Eliminada', message: 'Regla desactivada correctamente.' });
            self.renderQuizRecommendations();
          })
          .catch(function(err) {
            Utils.showModal({ type: 'error', title: 'Error', message: err.error || 'No se pudo eliminar la regla.' });
          });
      }
    });
  }
};
