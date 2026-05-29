// ===== PERFIL Y GESTIÓN DE RUTINAS =====

var Profile = {
  // Configuración disponible
  budgetOptions: [
    { id: 'low', name: 'Económico', maxPrice: 15, icon: '💰' },
    { id: 'medium', name: 'Medio', maxPrice: 25, icon: '⚖️' },
    { id: 'high', name: 'Premium', maxPrice: 50, icon: '✨' },
    { id: 'any', name: 'Cualquiera', maxPrice: null, icon: '🎯' }
  ],

  availableBrands: [
    'CeraVE', 'La Roche-Posay', 'Neutrogena', 'The Ordinary',
    'Bioderma', 'Aveeno', 'Paula\'s Choice', 'Caudalie',
    'EltaMD', 'Supergoop', 'The Inkey List', 'Vanicream'
  ],

  optimizationModes: [
    { id: 'cost', name: 'Precio más bajo', description: 'Maximiza el ahorro sin sacrificar efectividad' },
    { id: 'quality', name: 'Mejor calidad', description: 'Prioriza productos premium con mejores ingredientes' },
    { id: 'balanced', name: 'Balanceado', description: 'Mejor relación calidad-precio' }
  ],

  // Inicializar página
  init: function() {
    var skinProfile = Storage.getProfile();
    if (!skinProfile) {
      App.navigate('test');
      return;
    }

    this.renderProfilePage(skinProfile);
    this.loadSavedConfig();
  },

  renderProfilePage: function(skinProfile) {
    var main = document.getElementById('app');
    main.innerHTML = `
      <div class="container">
        <!-- Header con perfil -->
        ${this.renderProfileHeader(skinProfile)}

        <!-- Sección de configuración -->
        ${this.renderConfigSection(skinProfile)}

        <!-- Rutina guardada si existe -->
        <div id="savedRoutineSection"></div>
      </div>
    `;

    this.setupConfigListeners();
    // NO cargar rutina automáticamente - solo mostrar cuando el usuario hace clic en "Mi Rutina Personalizada"
  },

  // Renderizar header del perfil
  renderProfileHeader: function(skinProfile) {
    var concerns = skinProfile.concerns || [];
    var concernsHtml = concerns.map(function(c) {
      return '<span class="concern-tag">' + c + '</span>';
    }).join('');

    return `
      <div class="profile-header">
        <div class="profile-avatar">🧴</div>
        <h2 class="profile-title">Mi Perfil de Piel</h2>
        <div class="skin-type-badge">${skinProfile.typeName}</div>
        <div class="concerns-list">${concernsHtml}</div>
        <p class="profile-description">${skinProfile.description || ''}</p>
        <p class="profile-date">Actualizado: ${Utils.formatDate(skinProfile.date)}</p>

        <div class="profile-actions">
          <button class="btn btn-secondary btn-sm" onclick="Utils.confirmReset()">
            🔄 Reevaluar mi piel
          </button>
          <button class="btn btn-routine-highlight btn-sm" onclick="Profile.showMyRoutine()">
            📋 Mi Rutina Personalizada
          </button>
        </div>
      </div>
    `;
  },

  // Renderizar sección de configuración
  renderConfigSection: function(skinProfile) {
    var budgetButtons = this.budgetOptions.map(function(opt) {
      return `
        <button class="budget-btn" data-budget="${opt.id}" data-max-price="${opt.maxPrice}">
          <span class="budget-icon">${opt.icon}</span>
          <span class="budget-name">${opt.name}</span>
          <span class="budget-price">${opt.maxPrice ? '< S/.' + opt.maxPrice : 'Sin límite'}</span>
        </button>
      `;
    }).join('');

    var brandCheckboxes = this.availableBrands.map(function(brand) {
      return `
        <label class="brand-checkbox">
          <input type="checkbox" value="${brand}">
          <span>${brand}</span>
        </label>
      `;
    }).join('');

    var optimizationOptions = this.optimizationModes.map(function(mode) {
      return `
        <option value="${mode.id}">${mode.name}</option>
      `;
    }).join('');

    return `
      <!-- SECCIÓN DE CONFIGURACIÓN DE RUTINA -->
      <div class="config-container">
        <div class="section-header">
          <h2>⚙️ Configuración de Tu Rutina</h2>
          <p class="section-description">Personaliza los filtros para generar tu rutina perfecta</p>
        </div>

        <div class="routine-config">
          <!-- Presupuesto -->
          <div class="config-section">
            <label class="config-label">💰 Presupuesto por producto</label>
            <div class="budget-options">
              ${budgetButtons}
            </div>
          </div>

          <!-- Optimización -->
          <div class="config-section">
            <label class="config-label">🎯 Prioridad de optimización</label>
            <select id="optimizationMode" class="config-select">
              ${optimizationOptions}
            </select>
          </div>

          <!-- Marcas preferidas -->
          <div class="config-section">
            <label class="config-label">🏷️ Marcas preferidas (opcional)</label>
            <p class="config-hint">Selecciona las marcas que prefieres. Deja vacío para considerar todas.</p>
            <div class="brand-selector">
              ${brandCheckboxes}
            </div>
          </div>

          <!-- Alergias confirmadas -->
          <div class="config-section">
            <label class="config-label">⚠️ Restricciones alérgicas confirmadas</label>
            <div id="allergySummary" class="allergy-summary">
              <!-- Se llena dinámicamente -->
            </div>
          </div>

          <!-- Alergias adicionales -->
          <div class="config-section">
            <label class="config-label">🚫 Alergias adicionales (opcional)</label>
            <p class="config-hint">Selecciona ingredientes adicionales que deseas evitar en tus productos.</p>
            <div id="additionalAllergiesContainer" class="additional-allergies-container">
              <div class="allergy-chip-scroll">
                <label class="allergy-chip">
                  <input type="checkbox" value="parabenos">
                  <span class="chip-icon">🧪</span>
                  <span class="chip-text">Parabenos</span>
                </label>
                <label class="allergy-chip">
                  <input type="checkbox" value="metilisotiazolinona">
                  <span class="chip-icon">⚗️</span>
                  <span class="chip-text">Metilisotiazolinona</span>
                </label>
                <label class="allergy-chip">
                  <input type="checkbox" value="aceites_esenciales">
                  <span class="chip-icon">🌿</span>
                  <span class="chip-text">Aceites esenciales</span>
                </label>
                <label class="allergy-chip">
                  <input type="checkbox" value="alcohol">
                  <span class="chip-icon">🍶</span>
                  <span class="chip-text">Alcohol</span>
                </label>
                <label class="allergy-chip">
                  <input type="checkbox" value="sulfatos">
                  <span class="chip-icon">🧼</span>
                  <span class="chip-text">Sulfatos</span>
                </label>
                <label class="allergy-chip">
                  <input type="checkbox" value="silicona">
                  <span class="chip-icon">💎</span>
                  <span class="chip-text">Silicona</span>
                </label>
              </div>
            </div>
            <div id="selectedAllergiesSummary" class="selected-allergies-summary"></div>
          </div>
        </div>
      </div>
    `;
  },

  // Configurar listeners de la configuración
  setupConfigListeners: function() {
    var self = this;

    // Botones de presupuesto
    var budgetBtns = document.querySelectorAll('.budget-btn');
    budgetBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        budgetBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');
        self.saveConfig();
      });
    });

    // Checkboxes de marcas
    var brandCheckboxes = document.querySelectorAll('.brand-checkbox input');
    brandCheckboxes.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        self.saveConfig();
      });
    });

    // Select de optimización
    var optimizationSelect = document.getElementById('optimizationMode');
    if (optimizationSelect) {
      optimizationSelect.addEventListener('change', function() {
        self.saveConfig();
      });
    }

    // Checkboxes de alergias adicionales
    var allergyChips = document.querySelectorAll('.allergy-chip input');
    allergyChips.forEach(function(checkbox) {
      checkbox.addEventListener('change', function() {
        self.saveConfig();
        self.updateSelectedAllergiesSummary();
      });
    });

    // Mostrar resumen de alergias
    this.renderAllergySummary();
    this.loadAdditionalAllergies();
    this.updateSelectedAllergiesSummary();
  },

  // Renderizar resumen de alergias
  renderAllergySummary: function() {
    var skinProfile = Storage.getProfile();
    var allergies = skinProfile.allergies || [];

    var summaryDiv = document.getElementById('allergySummary');
    if (allergies.length === 0) {
      summaryDiv.innerHTML = '<p class="no-allergies">✅ Sin restricciones alérgicas conocidas</p>';
    } else {
      var allergyTags = allergies.map(function(a) {
        return '<span class="allergy-tag">🚫 ' + a + '</span>';
      }).join('');
      summaryDiv.innerHTML = '<div class="allergy-tags">' + allergyTags + '</div>';
    }
  },

  // Guardar configuración
  saveConfig: function() {
    var activeBudgetBtn = document.querySelector('.budget-btn.active');
    var selectedBrands = Array.from(document.querySelectorAll('.brand-checkbox input:checked'))
      .map(function(cb) { return cb.value; });
    var optimizationMode = document.getElementById('optimizationMode')?.value || 'balanced';
    var additionalAllergies = Array.from(document.querySelectorAll('.allergy-chip input:checked'))
      .map(function(cb) { return cb.value; });

    var config = {
      budget: activeBudgetBtn?.dataset.budget || 'any',
      brands: selectedBrands,
      optimization: optimizationMode,
      additionalAllergies: additionalAllergies,
      updatedAt: new Date().toISOString()
    };

    Storage.saveRoutineConfig(config);
  },

  // Cargar alergias adicionales
  loadAdditionalAllergies: function() {
    var config = Storage.getRoutineConfig();

    if (config && config.additionalAllergies && config.additionalAllergies.length > 0) {
      config.additionalAllergies.forEach(function(allergy) {
        var checkbox = document.querySelector('.allergy-chip input[value="' + allergy + '"]');
        if (checkbox) checkbox.checked = true;
      });
    }
  },

  // Actualizar resumen de alergias seleccionadas
  updateSelectedAllergiesSummary: function() {
    var selectedAllergies = Array.from(document.querySelectorAll('.allergy-chip input:checked'))
      .map(function(cb) {
        return {
          value: cb.value,
          label: cb.nextElementSibling.nextElementSibling.textContent
        };
      });

    var summaryDiv = document.getElementById('selectedAllergiesSummary');
    if (selectedAllergies.length === 0) {
      summaryDiv.innerHTML = '';
    } else {
      var allergyTags = selectedAllergies.map(function(a) {
        return '<span class="allergy-tag">🚫 ' + a.label + '</span>';
      }).join('');
      summaryDiv.innerHTML = '<div class="allergy-tags">' + allergyTags + '</div>';
    }
  },

  // Cargar configuración guardada
  loadSavedConfig: function() {
    var config = Storage.getRoutineConfig();

    if (config) {
      // Restaurar presupuesto
      if (config.budget) {
        var budgetBtns = document.querySelectorAll('.budget-btn');
        budgetBtns.forEach(function(btn) {
          btn.classList.remove('active');
          if (btn.dataset.budget === config.budget) {
            btn.classList.add('active');
          }
        });
      }

      // Restaurar marcas
      if (config.brands && config.brands.length > 0) {
        config.brands.forEach(function(brand) {
          var checkbox = document.querySelector('.brand-checkbox input[value="' + brand + '"]');
          if (checkbox) checkbox.checked = true;
        });
      }

      // Restaurar modo de optimización
      if (config.optimization) {
        var select = document.getElementById('optimizationMode');
        if (select) select.value = config.optimization;
      }

      // Restaurar alergias adicionales
      if (config.additionalAllergies && config.additionalAllergies.length > 0) {
        config.additionalAllergies.forEach(function(allergy) {
          var checkbox = document.querySelector('.allergy-chip input[value="' + allergy + '"]');
          if (checkbox) checkbox.checked = true;
        });
      }
    } else {
      // Configuración por defecto
      var defaultBtn = document.querySelector('.budget-btn[data-budget="any"]');
      if (defaultBtn) defaultBtn.classList.add('active');

      var select = document.getElementById('optimizationMode');
      if (select) select.value = 'balanced';
    }
  },

  // Generar rutina
  generateRoutine: function() {
    var skinProfile = Storage.getProfile();
    var config = Storage.getRoutineConfig();

    if (!skinProfile) {
      Utils.showModal({
        type: 'error',
        title: 'Error',
        message: 'No hay perfil de piel disponible. Por favor, completa el diagnóstico primero.'
      });
      return;
    }

    // Determinar presupuesto basado en modo de optimización
    var budget = config?.budget || 'any';
    if (!config || !config.budget) {
      // Si no hay presupuesto guardado, usar el modo de optimización
      var optimizationMode = config?.optimization || 'balanced';
      if (optimizationMode === 'cost') budget = 'low';
      else if (optimizationMode === 'quality') budget = 'high';
      else budget = 'medium';
    }

    var brands = config?.brands || [];

    // Fusionar alergias del perfil con alergias adicionales de configuración
    var profileAllergies = skinProfile.allergies || [];
    var additionalAllergies = config?.additionalAllergies || [];

    // Crear mapping de alergias adicionales a etiquetas que entiende el motor
    var allergyMapping = {
      'parabenos': 'paraben-free',
      'metilisotiazolinona': 'mi-free',
      'aceites_esenciales': 'fragrance-free',
      'alcohol': 'alcohol-free',
      'sulfatos': 'sulfate-free',
      'silicona': 'silicone-free'
    };

    var mergedAllergies = profileAllergies.slice(); // Copiar alergias del perfil
    additionalAllergies.forEach(function(allergy) {
      var mappedAllergy = allergyMapping[allergy];
      if (mappedAllergy && mergedAllergies.indexOf(mappedAllergy) === -1) {
        mergedAllergies.push(mappedAllergy);
      }
    });

    // Crear perfil temporal con alergias fusionadas
    var tempProfile = Object.assign({}, skinProfile);
    tempProfile.allergies = mergedAllergies;

    // Generar rutina
    var routine = RoutineEngine.generateRoutine(tempProfile, budget, brands);

    // Validar rutina
    var validation = RoutineEngine.validateRoutine(routine);
    if (!validation.valid) {
      console.warn('Advertencias de validación:', validation.errors);
    }

    // Guardar rutina
    Storage.saveGeneratedRoutine(routine);

    // Mostrar rutina
    this.renderGeneratedRoutine(routine);

    // Scroll a la rutina
    setTimeout(function() {
      document.getElementById('generatedRoutine')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  },

  // Renderizar rutina generada
  renderGeneratedRoutine: function(routine, showConfigSection = true) {
    // Ocultar botón de generar rutina
    var generateBtn = document.getElementById('generateRoutineBtn');
    if (generateBtn) {
      generateBtn.style.display = 'none';
    }

    // Ocultar el divisor si se muestra directamente sin configuración
    var divider = document.querySelector('.section-divider');
    if (divider) {
      divider.style.display = showConfigSection ? 'none' : 'flex';
    }

    // Ocultar configuración aplicada si no se solicita mostrarla
    var configSection = document.querySelector('.applied-config-section');
    if (configSection && !showConfigSection) {
      configSection.style.display = 'none';
    }

    var display = RoutineEngine.formatRoutineForDisplay(routine);
    var validation = RoutineEngine.validateRoutine(routine);
    var validation = RoutineEngine.validateRoutine(routine);

    var routineHtml = `
      <div id="generatedRoutine" class="generated-routine">
        <!-- SECCIÓN DE CONFIGURACIÓN APLICADA -->
        <div class="applied-config-section">
          <div class="config-display-header">
            <h2>⚙️ Configuración Aplicada</h2>
            <button class="btn btn-secondary btn-sm" onclick="Profile.editConfig()">
              🔄 Modificar configuración
            </button>
          </div>
          <div class="config-display-grid">
            <div class="config-display-item">
              <span class="config-display-label">Tipo de piel</span>
              <span class="config-display-value">${routine.config.skinType}</span>
            </div>
            <div class="config-display-item">
              <span class="config-display-label">Presupuesto</span>
              <span class="config-display-value">${this.getBudgetLabel(routine.config.budget)}</span>
            </div>
            ${routine.config.brands && routine.config.brands.length > 0 ? `
              <div class="config-display-item">
                <span class="config-display-label">Marcas</span>
                <span class="config-display-value">${routine.config.brands.join(', ')}</span>
              </div>
            ` : ''}
            <div class="config-display-item">
              <span class="config-display-label">Fecha de generación</span>
              <span class="config-display-value">${new Date(routine.config.generatedAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>

        <!-- DIVISOR SEPARADOR -->
        <div class="results-divider">
          <div class="results-divider-line"></div>
          <div class="results-divider-icon">📋</div>
          <div class="results-divider-line"></div>
        </div>

        <!-- SECCIÓN DE RESULTADOS -->
        <div class="routine-results-section">
          <div class="routine-header">
            <h2>📅 Tu Rutina Personalizada</h2>
            <div class="routine-meta">
              <div class="skin-profile-badge">
                <span id="skinTypeDisplay">${routine.config.skinType}</span>
                <span id="budgetDisplay">Presupuesto: ${this.getBudgetLabel(routine.config.budget)}</span>
              </div>
              ${routine.config.brands && routine.config.brands.length > 0 ?
                '<div class="brands-display">🏷️ Marcas: ' + routine.config.brands.join(', ') + '</div>' : ''}
            </div>
          </div>

          ${validation.valid ?
            '<div class="validation-success">✅ Rutina validada: 3+ productos día y noche, sin duplicados</div>' :
            '<div class="validation-warning">⚠️ ' + validation.errors.join(', ') + '</div>'}

          <!-- Tabs -->
          <div class="routine-tabs">
            <button class="tab-btn active" onclick="Profile.switchTab('morning')" data-tab="morning">
              ☀️ Rutina Diurna
            </button>
            <button class="tab-btn" onclick="Profile.switchTab('night')" data-tab="night">
              🌙 Rutina Nocturna
            </button>
          </div>

          <!-- Contenido mañana -->
          <div id="morningContent" class="routine-content active">
            ${this.renderRoutineSteps(display.morning, 'morning')}
          </div>

          <!-- Contenido noche -->
          <div id="nightContent" class="routine-content">
            ${this.renderRoutineSteps(display.night, 'night')}
          </div>

          <!-- Resumen -->
          <div class="routine-summary">
            <h3>💰 Resumen de Inversión</h3>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Productos únicos</span>
                <span class="summary-value">${display.summary.totalProducts}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Inversión inicial</span>
                <span class="summary-value">S/.${display.summary.totalInvestment.toFixed(2)}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Costo mensual</span>
                <span class="summary-value">S/.${display.summary.monthlyEstimate.toFixed(2)}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Duración aprox.</span>
                <span class="summary-value">${Math.floor(display.summary.duration / 30)} meses</span>
              </div>
            </div>
            <p class="no-duplicates">✅ <strong>${display.summary.totalProducts}</strong> productos únicos (sin repetición entre día y noche)</p>
          </div>

          <!-- Botones de acción -->
          <div class="routine-actions">
            <button class="btn btn-secondary" onclick="Profile.regenerateRoutine()">
              🔄 Regenerar con diferente configuración
            </button>
            <button class="btn btn-secondary" onclick="Profile.exportRoutine()">
              📋 Exportar rutina
            </button>
          </div>
        </div>
      </div>
    `;

    var savedSection = document.getElementById('savedRoutineSection');
    if (savedSection) {
      savedSection.innerHTML = routineHtml;
    }

    // Ocultar botón de generar
    var generateBtn = document.getElementById('generateRoutineBtn');
    if (generateBtn) {
      generateBtn.style.display = 'none';
    }
  },

  // Renderizar pasos de rutina
  renderRoutineSteps: function(timeRoutine, timeOfDay) {
    var stepsHtml = timeRoutine.steps.map(function(step, index) {
      var product = step.product;
      var essentialBadge = step.essential ? '<span class="essential-badge">⭐ Esencial</span>' : '';
      var matchScore = Profile.calculateMatchScore(product, step.category);

      return `
        <div class="product-step" data-step="${index}">
          <div class="step-number">${step.step}</div>
          <div class="product-card">
            <div class="product-header">
              <span class="category-badge">${Profile.getCategoryLabel(step.category)}</span>
              ${essentialBadge}
              <span class="match-score">${matchScore}% compatible</span>
            </div>
            <h4 class="product-name">${product.name}</h4>
            <p class="product-brand">${product.brand}</p>
            <p class="product-reason">${product.howHelps || 'Producto recomendado para tu tipo de piel'}</p>
            <div class="product-meta">
              <span class="price">S/.${product.price.toFixed(2)}</span>
              <span class="rating">⭐ ${product.rating}</span>
              ${product.allergy && product.allergy.length > 0 ?
                '<span class="allergy-safe">✅ ' + product.allergy.join(', ') + '</span>' : ''}
            </div>
            <button class="swap-btn" onclick="Profile.showSwapModal('${timeOfDay}', ${index})">
              🔄 Cambiar producto
            </button>
            ${Profile.renderApplicationGuide(product, step.category)}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="routine-price">
        Subtotal: S/.${timeRoutine.totalPrice.toFixed(2)}
      </div>
      ${stepsHtml}
    `;
  },

  // Calcular score de compatibilidad (para mostrar)
  calculateMatchScore: function(product, category) {
    var skinProfile = Storage.getProfile();
    var baseScore = 85; // Base

    // +10 si coincide tipo de piel
    if (RoutineEngine.skinTypeMatch(product, skinProfile)) baseScore += 10;

    // +5 si es seguro para alergias
    if (RoutineEngine.isAllergySafe(product, skinProfile)) baseScore += 5;

    return Math.min(baseScore, 99);
  },

  // Obtener etiqueta de categoría
  getCategoryLabel: function(category) {
    var labels = {
      'cleanser': 'LIMPIADOR',
      'moisturizer': 'HIDRATANTE',
      'treatment': 'TRATAMIENTO',
      'spf': 'PROTECTOR SOLAR',
      'toner': 'TÓNICO',
      'serum': 'SÉRUM',
      'eye_care': 'CONTORNO OJOS',
      'mask': 'MASCARILLA',
      'exfoliant': 'EXFOLIANTE'
    };
    return labels[category] || category.toUpperCase();
  },

  // Obtener etiqueta de presupuesto
  getBudgetLabel: function(budget) {
    var labels = {
      'low': 'Económico (<S/.15)',
      'medium': 'Medio (<S/.25)',
      'high': 'Premium (<S/.50)',
      'any': 'Sin límite'
    };
    return labels[budget] || 'Cualquiera';
  },

  // Renderizar guía de aplicación del producto
  renderApplicationGuide: function(product, category) {
    var guides = {
      'cleanser': {
        title: '📋 Guía de aplicación - Limpiador',
        steps: [
          '1️⃣ Humedece tu rostro con agua tibia',
          '2️⃣ Aplica una pequeña cantidad (tamaño del guisante) en tus manos',
          '3️⃣ Masajea suavemente en movimientos circulares por 30-60 segundos',
          '4️⃣ Enjuaga completamente con agua tibia',
          '5️⃣ Seca dando toques con una toalla limpia (no frotar)'
        ],
        tips: '💡 Usa agua tibia, no caliente para no resecar tu piel. Masajear ayuda a estimular la circulación.',
        frequency: '📅 Uso: Matutino y nocturno'
      },
      'moisturizer': {
        title: '📋 Guía de aplicación - Hidratante',
        steps: [
          '1️⃣ Aplica sobre la piel ligeramente húmeda (después del limpiador)',
          '2️⃣ Usa una cantidad del tamaño de una moneda pequeña',
          '3️⃣ Aplica con movimientos ascendentes y suaves',
          '4️⃣ No olvides el cuello y el escote',
          '5️⃣ Deja absorbir completamente antes del siguiente producto'
        ],
        tips: '💡 La piel húmeda absorbe mejor los productos. Aplica dentro de los 3 minutos posteriores al lavado.',
        frequency: '📅 Uso: Matutino y nocturno'
      },
      'treatment': {
        title: '📋 Guía de aplicación - Tratamiento',
        steps: [
          '1️⃣ Aplica sobre piel limpia y seca',
          '2️⃣ Usa 2-3 gotas o cantidad del tamaño de un guisante',
          '3️⃣ Aplica con las yemas de los dedos dando toques suaves',
          '4️⃣ Evita el área de los ojos a menos que sea específico para esa zona',
          '5️⃣ Espera 2-3 minutos antes del siguiente producto'
        ],
        tips: '💡 Menos es más. Los tratamientos son concentrados. Comienza con aplicaciones cada 2 días si tu piel es sensible.',
        frequency: '📅 Uso: Principalmente nocturno (ver indicaciones específicas)'
      },
      'spf': {
        title: '📋 Guía de aplicación - Protector Solar',
        steps: [
          '1️⃣ Aplica como último paso de la rutina matutina',
          '2️⃣ Usa cantidad generosa (2 dedos índice para rostro completo)',
          '3️⃣ Aplica 15 minutos antes de exponerte al sol',
          '4️⃣ No olvides orejas, cuello y parte superior del pecho',
          '5️⃣ Reaplica cada 2 horas si estás al aire libre'
        ],
        tips: '💡 El protector solar es el producto anti-edad más importante. Úsalo todos los días, incluso si está nublado.',
        frequency: '📅 Uso: Diariamente (matutino)'
      },
      'toner': {
        title: '📋 Guía de aplicación - Tónico',
        steps: [
          '1️⃣ Aplica después del limpiador con un disco de algodón',
          '2️⃣ Desliza suavemente sobre rostro y cuello',
          '3️⃣ Evita el área de los ojos',
          '4️⃣ Deja secar al aire 1-2 minutos',
          '5️⃣ Continúa con el resto de tu rutina'
        ],
        tips: '💡 No enjuagues. El tónico prepara tu piel para absorber mejor los productos siguientes.',
        frequency: '📅 Uso: Matutino y nocturno'
      },
      'serum': {
        title: '📋 Guía de aplicación - Sérum',
        steps: [
          '1️⃣ Aplica después del tónico o limpieza',
          '2️⃣ Usa 3-4 gotas para cubrir rostro y cuello',
          '3️⃣ Aplica con movimientos ascendentes suaves',
          '4️⃣ Presiona suavemente con las palmas para ayudar a la absorción',
          '5️⃣ Espera 1-2 minutos antes del hidratante'
        ],
        tips: '💡 Los sérums tienen ingredientes concentrados. Un poco rinde mucho. Usa antes del hidratante.',
        frequency: '📅 Uso: Principalmente nocturno'
      },
      'eye_care': {
        title: '📋 Guía de aplicación - Contorno de Ojos',
        steps: [
          '1️⃣ Aplica usando el dedo anular (el que tiene menos presión)',
          '2️⃣ Usa una cantidad del tamaño de un grano de arroz',
          '3️⃣ Da pequeños toques suaves alrededor del hueso del ojo',
          '4️⃣ Evita aplicar directamente sobre los párpados móviles',
          '5️⃣ No frotes ni deslices, solo da toques'
        ],
        tips: '💡 La piel alrededor de los ojos es muy delicada. Aplica con el dedo anular para usar la presión correcta.',
        frequency: '📅 Uso: Matutino y nocturno'
      },
      'mask': {
        title: '📋 Guía de aplicación - Mascarilla',
        steps: [
          '1️⃣ Aplica sobre piel limpia 1-2 veces por semana',
          '2️⃣ Usa una capa generosa y uniforme',
          '3️⃣ Deja actuar según indicaciones (10-20 minutos)',
          '4️⃣ Enjuaga completamente con agua tibia',
          '5️⃣ Continúa con el resto de tu rutina'
        ],
        tips: '💡 Las mascarillas son tratamientos intensivos. No uses más de lo recomendado.',
        frequency: '📅 Uso: 1-2 veces por semana'
      },
      'exfoliant': {
        title: '📋 Guía de aplicación - Exfoliante',
        steps: [
          '1️⃣ Usa 1-2 veces por semana máximo',
          '2️⃣ Aplica sobre piel húmeda con movimientos circulares',
          '3️⃣ Evita el área de los ojos y labios',
          '4️⃣ Enjuaga con agua tibia completamente',
          '5️⃣ Hidrata bien después'
        ],
        tips: '💡 La exfoliación excesiva puede dañar tu piel. Comienza con una vez por semana.',
        frequency: '📅 Uso: 1-2 veces por semana'
      }
    };

    var guide = guides[category] || {
      title: '📋 Guía de aplicación',
      steps: [
        '1️⃣ Aplica sobre piel limpia',
        '2️⃣ Sigue las indicaciones del producto',
        '3️⃣ Masajea suavemente hasta absorción'
      ],
      tips: '💡 Consulta las indicaciones específicas del producto',
      frequency: '📅 Uso según recomendación'
    };

    var stepsHtml = guide.steps.map(function(step) {
      return '<li>' + step + '</li>';
    }).join('');

    return `
      <div class="application-guide">
        <button class="guide-toggle" onclick="this.parentElement.classList.toggle('expanded')">
          <span>📖 Ver guía de aplicación completa</span>
          <span class="toggle-icon">▼</span>
        </button>
        <div class="guide-content">
          <h5>${guide.title}</h5>
          <ul class="guide-steps">
            ${stepsHtml}
          </ul>
          <p class="guide-tips">${guide.tips}</p>
          <p class="guide-frequency">${guide.frequency}</p>
        </div>
      </div>
    `;
  },

  // Cambiar tab (día/noche)
  switchTab: function(tab) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
      btn.classList.remove('active');
      if (btn.dataset.tab === tab) {
        btn.classList.add('active');
      }
    });

    // Actualizar contenido
    document.querySelectorAll('.routine-content').forEach(function(content) {
      content.classList.remove('active');
    });

    var activeContent = document.getElementById(tab + 'Content');
    if (activeContent) {
      activeContent.classList.add('active');
    }
  },

  // Editar configuración
  editConfig: function() {
    // Eliminar header de rutina si existe
    var routineHeader = document.querySelector('.routine-view-header');
    if (routineHeader) {
      routineHeader.remove();
    }

    // Eliminar la rutina generada para volver a mostrar la configuración
    sessionStorage.removeItem('generatedRoutine');

    // Volver a renderizar la página para mostrar la configuración
    var skinProfile = Storage.getProfile();
    this.renderProfilePage(skinProfile);
    this.loadSavedConfig();

    // Scroll a la sección de configuración
    setTimeout(function() {
      document.querySelector('.config-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  },

  // Regenerar rutina
  regenerateRoutine: function() {
    if (confirm('¿Quieres regenerar la rutina con la configuración actual? Esto reemplazará la rutina actual.')) {
      this.generateRoutine();
    }
  },

  // Exportar rutina
  exportRoutine: function() {
    var routine = Storage.getGeneratedRoutine();
    if (!routine) {
      Utils.showModal({
        type: 'error',
        title: 'Error',
        message: 'No hay rutina para exportar'
      });
      return;
    }

    var text = RoutineEngine.exportRoutine(routine);

    // Copiar al portapapeles
    navigator.clipboard.writeText(text).then(function() {
      Utils.showModal({
        type: 'success',
        title: '¡Éxito!',
        message: 'Rutina copiada al portapapeles. Pégala donde quieras compartirla.'
      });
    }).catch(function() {
      // Fallback: descargar archivo
      var blob = new Blob([text], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'mi-rutina-dermamatch.txt';
      a.click();
      URL.revokeObjectURL(url);
    });
  },

  // Mostrar modal de swap
  showSwapModal: function(timeOfDay, stepIndex) {
    var routine = Storage.getGeneratedRoutine();
    if (!routine) return;

    var currentItem = routine[timeOfDay][stepIndex];
    var currentProduct = currentItem.product;

    var alternatives = this.getAlternatives(currentProduct, routine);

    var modalHtml = `
      <div id="swapModal" class="swap-modal-overlay" onclick="if(event.target === this) this.remove()">
        <div class="swap-modal-content">
          <div class="swap-modal-header">
            <h3>🔄 Cambiar ${this.getCategoryLabel(currentItem.category)}</h3>
            <button class="close-btn" onclick="document.getElementById('swapModal').remove()">×</button>
          </div>

          <div class="swap-current">
            <h4>Producto actual:</h4>
            <div class="current-product-card">
              <span class="product-name">${currentProduct.name}</span>
              <span class="product-price">S/.${currentProduct.price.toFixed(2)}</span>
              <span class="product-brand">${currentProduct.brand}</span>
            </div>
          </div>

          <div class="swap-filters">
            <h4>Filtrar alternativas:</h4>
            <select id="swapBudget" onchange="Profile.filterAlternatives()">
              <option value="same">Mismo presupuesto</option>
              <option value="cheaper">Más económico</option>
              <option value="expensive">Mejor calidad</option>
              <option value="any">Cualquiera</option>
            </select>
          </div>

          <div class="alternatives-list">
            ${this.renderAlternatives(alternatives, timeOfDay, stepIndex)}
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  },

  // Obtener alternativas
  getAlternatives: function(currentProduct, routine) {
    var skinProfile = Storage.getProfile();
    var config = routine.config;
    var allProducts = Products.getAll();

    return allProducts.filter(function(p) {
      // Mismo categoría
      if (p.category !== currentProduct.category) return false;

      // No el mismo producto
      if (p.id === currentProduct.id) return false;

      // Compatible con piel
      if (!RoutineEngine.skinTypeMatch(p, skinProfile)) return false;

      // Seguro para alergias
      if (!RoutineEngine.isAllergySafe(p, skinProfile)) return false;

      return true;
    }).sort(function(a, b) {
      return b.rating - a.rating; // Ordenar por rating
    }).slice(0, 6); // Máximo 6 alternativas
  },

  // Filtrar alternativas
  filterAlternatives: function() {
    var budgetFilter = document.getElementById('swapBudget').value;
    var currentProductPrice = parseFloat(document.querySelector('.current-product-card .product-price').textContent.replace('$', ''));

    var alternatives = document.querySelectorAll('.alternative-card');
    alternatives.forEach(function(card) {
      var price = parseFloat(card.dataset.price);

      var show = false;
      if (budgetFilter === 'same') {
        show = Math.abs(price - currentProductPrice) <= 5;
      } else if (budgetFilter === 'cheaper') {
        show = price < currentProductPrice;
      } else if (budgetFilter === 'expensive') {
        show = price > currentProductPrice;
      } else {
        show = true;
      }

      card.style.display = show ? 'flex' : 'none';
    });
  },

  // Renderizar alternativas
  renderAlternatives: function(alternatives, timeOfDay, stepIndex) {
    if (alternatives.length === 0) {
      return '<p class="no-alternatives">No hay alternativas disponibles con los filtros actuales.</p>';
    }

    return alternatives.map(function(alt) {
      var matchScore = Profile.calculateMatchScore(alt, alt.category);

      return `
        <div class="alternative-card" data-price="${alt.price}">
          <div class="alt-info">
            <span class="alt-name">${alt.name}</span>
            <span class="alt-brand">${alt.brand}</span>
            <span class="alt-price">S/.${alt.price.toFixed(2)}</span>
            <span class="alt-match">${matchScore}% compatible</span>
          </div>
          <button class="select-alt-btn" onclick="Profile.selectAlternative('${timeOfDay}', ${stepIndex}, ${alt.id})">
            Seleccionar
          </button>
        </div>
      `;
    }).join('');
  },

  // Seleccionar alternativa
  selectAlternative: function(timeOfDay, stepIndex, productId) {
    var routine = Storage.getGeneratedRoutine();
    if (!routine) return;

    var newRoutine = RoutineEngine.swapProduct(routine, timeOfDay, stepIndex, productId);

    if (newRoutine !== routine) {
      Storage.saveGeneratedRoutine(newRoutine);
      this.renderGeneratedRoutine(newRoutine);
      document.getElementById('swapModal').remove();

      Utils.showModal({
        type: 'success',
        title: '¡Producto actualizado!',
        message: 'El producto ha sido cambiado exitosamente en tu rutina.'
      });
    } else {
      Utils.showModal({
        type: 'error',
        title: 'Error',
        message: 'No se pudo cambiar el producto. Puede que no sea compatible con tu configuración.'
      });
    }
  },

  // Mostrar rutina personalizada directamente
  showMyRoutine: function() {
    var savedRoutine = Storage.getGeneratedRoutine();

    if (!savedRoutine) {
      Utils.showModal({
        type: 'info',
        title: 'Sin rutina generada',
        message: 'Aún no has generado tu rutina personalizada. ¿Quieres generarla ahora con la última configuración?',
        onConfirm: function() {
          Profile.generateRoutine();
        }
      });
      return;
    }

    // Guardar el estado actual antes de ocultar elementos
    var profileHeader = document.querySelector('.profile-header');
    var configContainer = document.querySelector('.config-container');
    var savedHeader = profileHeader ? profileHeader.innerHTML : '';

    // Ocultar header y configuración temporalmente
    if (profileHeader) {
      profileHeader.style.display = 'none';
    }
    if (configContainer) {
      configContainer.style.display = 'none';
    }

    // Ocultar divisor
    var divider = document.querySelector('.section-divider');
    if (divider) {
      divider.style.display = 'none';
    }

    // Crear header simplificado para la rutina
    var main = document.getElementById('app');
    var routineHeader = document.createElement('div');
    routineHeader.className = 'routine-view-header';
    routineHeader.innerHTML = `
      <div class="container">
        <div class="routine-nav">
          <button class="btn btn-secondary btn-sm" onclick="Profile.backToProfile()">
            ⬅️ Volver
          </button>
          <h3 class="routine-view-title">📋 Mi Rutina</h3>
        </div>
      </div>
    `;

    // Insertar header al inicio
    main.insertBefore(routineHeader, main.firstChild);

    // Mostrar rutina directamente sin configuración aplicada
    this.renderGeneratedRoutine(savedRoutine, false);

    // Scroll suave al inicio de la rutina
    setTimeout(function() {
      routineHeader.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  },

  // Agregar botón para volver a configuración
  addBackToConfigButton: function() {
    var routineSection = document.querySelector('#generatedRoutine');
    if (!routineSection) return;

    // Verificar si ya existe el botón
    if (document.getElementById('backToConfigBtn')) return;

    var backBtn = document.createElement('button');
    backBtn.id = 'backToConfigBtn';
    backBtn.className = 'btn btn-secondary btn-full';
    backBtn.innerHTML = '⬅️ Volver a configuración';
    backBtn.onclick = function() {
      Profile.backToConfig();
    };

    // Insertar al inicio de la sección de rutina
    routineSection.insertBefore(backBtn, routineSection.firstChild);
  },

  // Volver a la vista de perfil
  backToProfile: function() {
    // Eliminar header de rutina
    var routineHeader = document.querySelector('.routine-view-header');
    if (routineHeader) {
      routineHeader.remove();
    }

    // Mostrar header del perfil nuevamente
    var profileHeader = document.querySelector('.profile-header');
    if (profileHeader) {
      profileHeader.style.display = 'block';
    }

    // Mostrar configuración
    var configContainer = document.querySelector('.config-container');
    if (configContainer) {
      configContainer.style.display = 'block';
    }

    // Mostrar divisor
    var divider = document.querySelector('.section-divider');
    if (divider) {
      divider.style.display = 'flex';
    }

    // Eliminar rutina generada temporal si existe
    var tempRoutine = document.getElementById('generatedRoutine');
    if (tempRoutine) {
      tempRoutine.remove();
    }

    // NO recargar rutina automáticamente - volver al estado inicial solo con configuración
    // Mostrar botón de generar rutina si está oculto
    var generateBtn = document.getElementById('generateRoutineBtn');
    if (generateBtn) {
      generateBtn.style.display = 'block';
    }

    // Mostrar divisor si está oculto
    var divider = document.querySelector('.section-divider');
    if (divider) {
      divider.style.display = 'flex';
    }

    // Scroll al header del perfil
    setTimeout(function() {
      document.querySelector('.profile-header')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  },

  // Volver a la vista de configuración
  backToConfig: function() {
    // Eliminar header de rutina
    var routineHeader = document.querySelector('.routine-view-header');
    if (routineHeader) {
      routineHeader.remove();
    }

    // Eliminar botón de volver si existe
    var backBtn = document.getElementById('backToConfigBtn');
    if (backBtn) {
      backBtn.remove();
    }

    // Mostrar header del perfil nuevamente
    var profileHeader = document.querySelector('.profile-header');
    if (profileHeader) {
      profileHeader.style.display = 'block';
    }

    // Mostrar configuración
    var configContainer = document.querySelector('.config-container');
    if (configContainer) {
      configContainer.style.display = 'block';
    }

    // Mostrar divisor
    var divider = document.querySelector('.section-divider');
    if (divider) {
      divider.style.display = 'flex';
    }

    // Mostrar rutina generada si existe
    var routineSection = document.getElementById('generatedRoutine');
    if (routineSection) {
      routineSection.style.display = 'block';
    }

    // Scroll al header del perfil
    setTimeout(function() {
      document.querySelector('.profile-header')?.scrollIntoView({ behavior: 'smooth' });
    }, 300);
  },

  // Cargar rutina guardada
  loadSavedRoutine: function() {
    var savedRoutine = Storage.getGeneratedRoutine();
    if (savedRoutine) {
      this.renderGeneratedRoutine(savedRoutine);
    }
  }
};
