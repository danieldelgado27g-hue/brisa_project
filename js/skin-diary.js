var SkinDiary = {
  render: function() {
    var entries = Storage.getDiaryEntries();
    var app = document.getElementById('app');

    var entriesHtml = entries.length === 0
      ? '<div class="empty-state"><div class="empty-state-icon">📓</div><p>Aún no tienes entradas en tu diario.</p></div>'
      : entries.map(function(e) {
          var statusClass = e.status === 'good' ? 'good' : e.status === 'okay' ? 'okay' : 'bad';
          var statusLabel = e.status === 'good' ? 'Buena' : e.status === 'okay' ? 'Regular' : 'Mala';
          return '<div class="diary-entry">' +
            '<div class="diary-entry-header">' +
            '<span class="diary-entry-date">' + Utils.formatDate(e.date) + '</span>' +
            '<span class="diary-entry-status ' + statusClass + '">' + statusLabel + '</span>' +
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
  },

  saveEntry: function() {
    var status = document.getElementById('diaryStatus').value;
    var notes = document.getElementById('diaryNotes').value.trim();
    Storage.addDiaryEntry({ status: status, notes: notes });
    SkinDiary.render();
    Utils.showModal({ type: 'success', title: '¡Registrado!', message: 'Tu entrada del día ha sido guardada.' });
  }
};
