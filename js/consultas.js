var Consultas = {
  // Cache local de dermatólogos y consultas
  _derms: null,
  _consultas: null,

  render: function() {
    var app = document.getElementById('app');

    // Mostrar loading
    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div></p>Cargando...</p></div></div>';

    var self = this;

    // Cargar dermatólogos del backend
    this.loadDermatologists().then(function(derms) {
      // Cargar consultas del backend
      return self.loadConsultas();
    }).then(function() {
      self.renderContent();
    }).catch(function(error) {
      app.innerHTML = '<div class="container">' +
        '<h2 style="margin-bottom:0.5rem;">👩‍⚕️ Consultas</h2>' +
        '<p style="color:var(--error);">Error al cargar: ' + (error.error || 'Intenta nuevamente') + '</p>' +
        '</div>';
    });
  },

  renderContent: function() {
    var consultas = this._consultas || [];
    var derms = this._derms || [];
    var app = document.getElementById('app');

    var consultasHtml = consultas.length === 0
      ? '<div class="empty-state"><div class="empty-state-icon">👩‍⚕️</div><p>Aún no has realizado ninguna consulta.</p></div>'
      : consultas.map(function(c) {
          var statusLabel = c.status === 'pending' ? 'Pendiente' : c.status === 'answered' ? 'Respondida' : 'Cerrada';
          var statusClass = c.status === 'pending' ? 'pending' : c.status === 'answered' ? 'resolved' : 'closed';
          return '<div class="consulta-card">' +
            '<h4>' + c.subject + '</h4>' +
            '<p>' + c.message + '</p>' +
            (c.answer ? '<div class="consulta-answer"><strong>Respuesta:</strong> ' + c.answer + '</div>' : '') +
            '<span class="consulta-status ' + statusClass + '">' + statusLabel + '</span>' +
            '<span style="font-size:0.75rem;color:var(--text-secondary);margin-left:0.5rem;">' + Utils.formatDate(c.created_at) + '</span>' +
            '</div>';
        }).join('');

    var dermsHtml = derms.map(function(d) {
      return '<div class="derm-card">' +
        '<div class="derm-header">' +
        '<div><div class="derm-name">' + d.name + '</div><div class="derm-specialty">' + d.specialty + '</div></div>' +
        '<div class="derm-rating">⭐ ' + (d.rating || 4.5) + '</div></div>' +
        '<div class="derm-clinic">' + d.clinic + (d.distance_km ? ' · ' + d.distance_km.toFixed(1) + ' km' : '') + '</div>' +
        '<div class="derm-actions">' +
        '<button class="btn btn-secondary btn-sm" onclick="Consultas.callDerm(' + d.id + ')">📞 Llamar</button>' +
        '<button class="btn btn-primary btn-sm" onclick="Consultas.scheduleDerm(' + d.id + ')">📅 Agendar</button></div></div>';
    }).join('');

    app.innerHTML = '<div class="container">' +
      '<h2 style="margin-bottom:0.5rem;">👩‍⚕️ Consultas</h2>' +
      '<p style="color:var(--text-secondary);margin-bottom:1.5rem;">Habla con nuestros expertos o agenda una cita con un dermatólogo.</p>' +

      '<div class="consulta-form">' +
      '<h3 style="margin-bottom:0.75rem;">Enviar consulta</h3>' +
      '<label>Asunto</label>' +
      '<input type="text" id="consultaSubject" placeholder="Ej: ¿Qué producto recomiendas para mi tipo de piel?">' +
      '<label>Mensaje</label>' +
      '<textarea id="consultaMessage" placeholder="Describe tu consulta en detalle..."></textarea>' +
      '<button class="btn btn-primary btn-full" onclick="Consultas.sendConsulta()">Enviar consulta</button>' +
      '</div>' +

      '<h3 style="margin-bottom:1rem;">Mis consultas</h3>' +
      consultasHtml +

      '<h3 style="margin:2rem 0 1rem;">Dermatólogos recomendados</h3>' +
      dermsHtml +
      '</div>';
  },

  /**
   * Carga dermatólogos desde el backend
   */
  loadDermatologists: function() {
    return window.api.get('/dermatologists')
      .then(function(response) {
        var derms = response.dermatologists || [];
        this._derms = derms;
        return derms;
      }.bind(this))
      .catch(function(error) {
        console.error('Error cargando dermatólogos:', error);
        // Fallback a datos vacíos
        this._derms = [];
        return [];
      }.bind(this));
  },

  /**
   * Carga consultas desde el backend
   */
  loadConsultas: function() {
    return window.api.get('/consultas')
      .then(function(response) {
        var consultas = response.consultas || [];
        this._consultas = consultas;
        // Actualizar sessionStorage como backup
        Storage.setConsultas(consultas);
        return consultas;
      }.bind(this))
      .catch(function(error) {
        console.error('Error cargando consultas:', error);
        // Fallback a sessionStorage
        var localConsultas = Storage.getConsultas();
        this._consultas = localConsultas;
        return localConsultas;
      }.bind(this));
  },

  sendConsulta: function() {
    var subject = document.getElementById('consultaSubject').value.trim();
    var message = document.getElementById('consultaMessage').value.trim();
    if (!subject || !message) {
      Utils.showModal({ type: 'error', title: 'Campos requeridos', message: 'Completa el asunto y el mensaje.' });
      return;
    }

    var self = this;

    // Backend integration - POST /api/consultas
    window.api.post('/consultas', { subject: subject, message: message })
      .then(function(response) {
        if (response.success || response.consulta) {
          // Recargar consultas
          return self.loadConsultas();
        }
        throw new Error('No se pudo enviar la consulta');
      })
      .then(function() {
        // Limpiar formulario
        document.getElementById('consultaSubject').value = '';
        document.getElementById('consultaMessage').value = '';

        self.renderContent();
        Utils.showModal({ type: 'success', title: 'Consulta enviada', message: 'Recibirás respuesta pronto en tu perfil.' });
      })
      .catch(function(error) {
        // Fallback a sessionStorage
        Storage.addConsulta({ subject: subject, message: message });
        self.renderContent();
        Utils.showModal({ type: 'success', title: 'Consulta enviada', message: 'Recibirás respuesta pronto en tu perfil (local).' });
      });
  },

  callDerm: function(id) {
    var d = this._derms.find(function(x) { return x.id === id; });
    if (d) {
      Utils.showModal({ type: 'info', title: 'Llamar', message: 'Llama al ' + (d.phone || 'consultorio') });
    }
  },

  scheduleDerm: function(id) {
    var d = this._derms.find(function(x) { return x.id === id; });
    if (d) {
      Utils.showModal({ type: 'success', title: 'Cita solicitada', message: 'Te contactaremos desde ' + (d.clinic || 'la clínica') + ' para confirmar.' });
    }
  }
};
