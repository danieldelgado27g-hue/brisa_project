var Consultas = {
  dermsData: [
    { id: 1, name: "Dra. María García", specialty: "Dermatóloga clínica", clinic: "Clínica Dermatológica Madrid", distance: 2.3, rating: 4.9, phone: "+34 612 345 678" },
    { id: 2, name: "Dr. Carlos López", specialty: "Especialista en acné", clinic: "Hospital Universitario", distance: 4.1, rating: 4.7, phone: "+34 612 345 679" },
    { id: 3, name: "Dra. Ana Martínez", specialty: "Dermatóloga estética", clinic: "Centro Belleza Integral", distance: 5.8, rating: 4.8, phone: "+34 612 345 680" },
    { id: 4, name: "Dr. Pablo Sánchez", specialty: "Especialista en piel sensible", clinic: "Clínica de la Piel", distance: 7.2, rating: 4.6, phone: "+34 612 345 681" },
    { id: 5, name: "Dra. Laura Rodríguez", specialty: "Dermatóloga pediátrica", clinic: "Hospital Infantil", distance: 8.5, rating: 4.9, phone: "+34 612 345 682" }
  ],

  render: function() {
    var consultas = Storage.getConsultas();
    var app = document.getElementById('app');

    var consultasHtml = consultas.length === 0
      ? '<div class="empty-state"><div class="empty-state-icon">👩‍⚕️</div><p>Aún no has realizado ninguna consulta.</p></div>'
      : consultas.map(function(c) {
          var statusLabel = c.status === 'pending' ? 'Pendiente' : 'Resuelta';
          var statusClass = c.status === 'pending' ? 'pending' : 'resolved';
          return '<div class="consulta-card">' +
            '<h4>' + c.subject + '</h4>' +
            '<p>' + c.message + '</p>' +
            '<span class="consulta-status ' + statusClass + '">' + statusLabel + '</span>' +
            '<span style="font-size:0.75rem;color:var(--text-secondary);margin-left:0.5rem;">' + Utils.formatDate(c.date) + '</span>' +
            '</div>';
        }).join('');

    var dermsHtml = this.dermsData.map(function(d) {
      return '<div class="derm-card">' +
        '<div class="derm-header">' +
        '<div><div class="derm-name">' + d.name + '</div><div class="derm-specialty">' + d.specialty + '</div></div>' +
        '<div class="derm-rating">⭐ ' + d.rating + '</div></div>' +
        '<div class="derm-clinic">' + d.clinic + ' · ' + d.distance.toFixed(1) + ' km</div>' +
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

  sendConsulta: function() {
    var subject = document.getElementById('consultaSubject').value.trim();
    var message = document.getElementById('consultaMessage').value.trim();
    if (!subject || !message) {
      Utils.showModal({ type: 'error', title: 'Campos requeridos', message: 'Completa el asunto y el mensaje.' });
      return;
    }
    Storage.addConsulta({ subject: subject, message: message });
    Consultas.render();
    Utils.showModal({ type: 'success', title: 'Consulta enviada', message: 'Recibirás respuesta pronto en tu perfil.' });
  },

  callDerm: function(id) {
    var d = this.dermsData.find(function(x) { return x.id === id; });
    Utils.showModal({ type: 'info', title: 'Llamar', message: 'Llama al ' + d.phone });
  },

  scheduleDerm: function(id) {
    var d = this.dermsData.find(function(x) { return x.id === id; });
    Utils.showModal({ type: 'success', title: 'Cita solicitada', message: 'Te contactaremos desde ' + d.clinic + ' para confirmar.' });
  }
};
