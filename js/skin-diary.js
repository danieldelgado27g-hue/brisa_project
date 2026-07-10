var SkinDiary = {
  // Cache local de entradas para evitar requests repetidas
  _entries: null,

  render: function() {
    var app = document.getElementById('app');

    // Mostrar loading mientras carga
    app.innerHTML = '<div class="container"><div class="loading"><div class="spinner"></div></p>Cargando diario...</p></div></div>';

    var self = this;

    // Cargar entradas del backend
    this.loadEntriesFromBackend().then(function(entries) {
      var entriesHtml = entries.length === 0
        ? '<div class="empty-state"><div class="empty-state-icon">📓</div><p>Aún no tienes entradas en tu diario.</p></div>'
        : entries.map(function(e) {
            var statusClass = e.mood === 'good' ? 'good' : e.mood === 'okay' ? 'okay' : 'bad';
            var statusLabel = e.mood === 'good' ? 'Buena' : e.mood === 'okay' ? 'Regular' : 'Mala';
            return '<div class="diary-entry">' +
              '<div class="diary-entry-header">' +
              '<span class="diary-entry-date">' + (e.entry_date || Utils.formatDate(e.created_at)) + '</span>' +
              '<span class="diary-entry-status ' + statusClass + '">' + statusLabel + '</span>' +
              '<button class="diary-entry-delete" onclick="SkinDiary.deleteEntry(\'' + (e.entry_date || e.id) + '\')">✕</button>' +
              '</div>' +
              (e.notes ? '<div class="diary-entry-text">' + e.notes + '</div>' : '') +
              '</div>';
          }).join('');

      app.innerHTML = '<div class="container">' +
        '<h2 style="margin-bottom:1rem;">📓 Skin-Diary</h2>' +
        '<p style="color:var(--text-secondary);margin-bottom:1.5rem;">Registra cómo está tu piel cada día y haz seguimiento de tu evolución.</p>' +
        '<div class="diary-form">' +
        '<label>¿Cómo está tu piel hoy?</label>' +
        '<select id="diaryStatus">' +
        '<option value="good">🌟 Buena — radiante y tranquila</option>' +
        '<option value="okay">🙂 Regular — algunos brotes o sequedad</option>' +
        '<option value="bad">😞 Mala — irritada, brotes o sensible</option>' +
        '</select>' +
        '<label>Notas (opcional)</label>' +
        '<textarea id="diaryNotes" placeholder="¿Algo que destacar? ¿Usaste algún producto nuevo?"></textarea>' +
        '<button class="btn btn-primary btn-full" onclick="SkinDiary.saveEntry()">Guardar entrada</button>' +
        '</div>' +
        '<h3 style="margin-bottom:1rem;">Historial</h3>' +
        entriesHtml +
        '</div>';
    }).catch(function(error) {
      app.innerHTML = '<div class="container">' +
        '<h2 style="margin-bottom:1rem;">📓 Skin-Diary</h2>' +
        '<p style="color:var(--error);margin-bottom:1.5rem;">Error al cargar el diario: ' + (error.error || 'Intenta nuevamente') + '</p>' +
        '</div>';
    });
  },

  /**
   * Carga las entradas del diario desde el backend
   */
  loadEntriesFromBackend: function() {
    return window.api.get('/diary')
      .then(function(response) {
        var entries = response.entries || [];
        this._entries = entries;
        // Actualizar sessionStorage como backup
        Storage.setDiaryEntries(entries);
        return entries;
      }.bind(this))
      .catch(function(error) {
        // Fallback a sessionStorage
        var localEntries = Storage.getDiaryEntries();
        this._entries = localEntries;
        return localEntries;
      }.bind(this));
  },

  saveEntry: function() {
    var status = document.getElementById('diaryStatus').value;
    var notes = document.getElementById('diaryNotes').value.trim();

    // Obtener fecha de hoy en formato YYYY-MM-DD
    var today = new Date().toISOString().split('T')[0];

    var self = this;

    // Backend integration - POST /api/diary
    window.api.post('/diary', {
      entry_date: today,
      mood: status,
      notes: notes,
      photos: []
    })
    .then(function(response) {
      if (response.success || response.entry) {
        // Recargar entradas
        return self.loadEntriesFromBackend();
      }
      throw new Error('No se pudo guardar la entrada');
    })
    .then(function() {
      self.render();
      Utils.showModal({ type: 'success', title: '¡Registrado!', message: 'Tu entrada del día ha sido guardada.' });
    })
    .catch(function(error) {
      // Fallback a sessionStorage
      Storage.addDiaryEntry({ status: status, notes: notes });
      self.render();
      Utils.showModal({ type: 'success', title: '¡Registrado!', message: 'Tu entrada del día ha sido guardada (local).' });
    });
  },

  deleteEntry: function(date) {
    var self = this;

    if (!confirm('¿Eliminar esta entrada del diario?')) {
      return;
    }

    // Backend integration - DELETE /api/diary/:date
    window.api.delete('/diary/' + date)
      .then(function(response) {
        if (response.success) {
          // Recargar entradas
          return self.loadEntriesFromBackend();
        }
        throw new Error('No se pudo eliminar la entrada');
      })
      .then(function() {
        self.render();
        Utils.showModal({ type: 'success', title: '¡Eliminado!', message: 'La entrada ha sido eliminada.' });
      })
      .catch(function(error) {
        // Fallback a sessionStorage
        var entries = Storage.getDiaryEntries();
        var newEntries = entries.filter(function(e) {
          return (e.entry_date || e.date) !== date;
        });
        Storage.setDiaryEntries(newEntries);
        self.render();
        Utils.showModal({ type: 'success', title: '¡Eliminado!', message: 'La entrada ha sido eliminada (local).' });
      });
  }
};
