/**
 * ApiClient - Módulo de comunicación con el backend de DermaMatch
 *
 * Maneja todas las llamadas HTTP a la API del backend, incluyendo:
 * - Autenticación JWT (tokens)
 * - Manejo de errores estandarizado
 * - Intercepción de 401 (Unauthorized)
 */

(function(window) {
  'use strict';

  // Configuración base - Leer de variable de entorno si está disponible
  // En desarrollo: localhost:3000
  // En producción: se puede configurar via window.API_BASE_URL
  var API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000/api';

  /**
   * ApiClient - Clase principal para comunicación con el backend
   */
  function ApiClient() {
    this.baseURL = API_BASE_URL;
    this.loadToken();
  }

  /**
   * Carga el token JWT desde localStorage
   */
  ApiClient.prototype.loadToken = function() {
    this.token = localStorage.getItem('auth_token');
  };

  /**
   * Guarda el token JWT en localStorage
   */
  ApiClient.prototype.setToken = function(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  };

  /**
   * Limpia el token JWT
   */
  ApiClient.prototype.clearToken = function() {
    this.token = null;
    localStorage.removeItem('auth_token');
  };

  /**
   * Construye la URL completa para un endpoint
   */
  ApiClient.prototype.buildUrl = function(endpoint, params) {
    var url = this.baseURL + endpoint;

    if (params && Object.keys(params).length > 0) {
      var queryString = [];
      for (var key in params) {
        if (params[key] !== null && params[key] !== undefined) {
          queryString.push(encodeURIComponent(key) + '=' + encodeURIComponent(params[key]));
        }
      }
      if (queryString.length > 0) {
        url += '?' + queryString.join('&');
      }
    }

    return url;
  };

  /**
   * Construye los headers para una request
   */
  ApiClient.prototype.buildHeaders = function(headers) {
    var h = headers || {};
    h['Content-Type'] = 'application/json';

    if (this.token) {
      h['Authorization'] = 'Bearer ' + this.token;
    }

    return h;
  };

  /**
   * Maneja errores de respuesta
   */
  ApiClient.prototype.handleError = function(status, data) {
    if (status === 401) {
      // Token expirado o inválido - limpiar y redirigir
      this.clearToken();
      sessionStorage.clear();
      window.location.hash = '#home';

      if (window.Utils && window.Utils.showModal) {
        window.Utils.showModal({
          type: 'error',
          title: 'Sesión expirada',
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        });
      }
      return { error: 'Sesión expirada' };
    }

    if (status === 403) {
      return { error: 'No tienes permisos para esta acción' };
    }

    if (status === 404) {
      return { error: 'Recurso no encontrado' };
    }

    if (status === 409) {
      return { error: data.error || 'Conflicto: el recurso ya existe' };
    }

    if (status >= 500) {
      return { error: 'Error del servidor. Intenta nuevamente.' };
    }

    // Para otros errores, intentar retornar el error del servidor
    if (data && data.error) {
      return { error: data.error };
    }

    return { error: 'Error desconocido' };
  };

  /**
   * GET request
   * @param {string} endpoint - Ej: '/products'
   * @param {object} params - Query parameters
   * @returns {Promise} Response data
   */
  ApiClient.prototype.get = function(endpoint, params) {
    var self = this;
    var url = this.buildUrl(endpoint, params);

    return fetch(url, {
      method: 'GET',
      headers: this.buildHeaders()
    })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          throw self.handleError(response.status, data);
        }
        return data;
      });
    })
    .catch(function(error) {
      console.error('GET error:', endpoint, error);
      throw error;
    });
  };

  /**
   * POST request
   * @param {string} endpoint - Ej: '/auth/login'
   * @param {object} body - Request body
   * @returns {Promise} Response data
   */
  ApiClient.prototype.post = function(endpoint, body) {
    var self = this;
    var url = this.buildUrl(endpoint);

    return fetch(url, {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify(body || {})
    })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          throw self.handleError(response.status, data);
        }
        return data;
      });
    })
    .catch(function(error) {
      console.error('POST error:', endpoint, error);
      throw error;
    });
  };

  /**
   * PUT request
   * @param {string} endpoint - Ej: '/profiles/1'
   * @param {object} body - Request body
   * @returns {Promise} Response data
   */
  ApiClient.prototype.put = function(endpoint, body) {
    var self = this;
    var url = this.buildUrl(endpoint);

    return fetch(url, {
      method: 'PUT',
      headers: this.buildHeaders(),
      body: JSON.stringify(body || {})
    })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          throw self.handleError(response.status, data);
        }
        return data;
      });
    })
    .catch(function(error) {
      console.error('PUT error:', endpoint, error);
      throw error;
    });
  };

  /**
   * DELETE request
   * @param {string} endpoint - Ej: '/cart/1'
   * @returns {Promise} Response data
   */
  ApiClient.prototype.delete = function(endpoint) {
    var self = this;
    var url = this.buildUrl(endpoint);

    return fetch(url, {
      method: 'DELETE',
      headers: this.buildHeaders()
    })
    .then(function(response) {
      return response.json().then(function(data) {
        if (!response.ok) {
          throw self.handleError(response.status, data);
        }
        return data;
      });
    })
    .catch(function(error) {
      console.error('DELETE error:', endpoint, error);
      throw error;
    });
  };

  /**
   * Verifica si el usuario está autenticado
   */
  ApiClient.prototype.isAuthenticated = function() {
    return !!this.token;
  };

  // Exportar al scope global
  window.ApiClient = ApiClient;

  // Crear instancia singleton
  window.api = new ApiClient();

})(typeof window !== 'undefined' ? window : global);
