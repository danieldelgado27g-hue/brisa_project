// ===== MOTOR DE RUTINAS INTELIGENTES =====

var RoutineEngine = {
  // Configuración de rutinas por tipo de piel
  routineTemplates: {
    "Normal": {
      morning: ["cleanser", "treatment", "moisturizer", "spf"],
      night: ["cleanser", "treatment", "moisturizer"],
      priorities: { cleanser: 1, treatment: 2, moisturizer: 3, spf: 4 },
      minProducts: 3
    },
    "Seca": {
      morning: ["cleanser", "treatment", "moisturizer", "spf"],
      night: ["cleanser", "treatment", "moisturizer", "treatment"],
      priorities: { cleanser: 1, moisturizer: 2, treatment: 3, spf: 4 },
      minProducts: 3
    },
    "Grasa": {
      morning: ["cleanser", "treatment", "moisturizer", "spf"],
      night: ["cleanser", "treatment", "moisturizer"],
      priorities: { cleanser: 1, treatment: 2, spf: 3, moisturizer: 4 },
      minProducts: 3
    },
    "Mixta": {
      morning: ["cleanser", "treatment", "moisturizer", "spf"],
      night: ["cleanser", "treatment", "moisturizer"],
      priorities: { cleanser: 1, treatment: 2, moisturizer: 3, spf: 4 },
      minProducts: 3
    },
    "Sensible": {
      morning: ["cleanser", "moisturizer", "spf"],
      night: ["cleanser", "moisturizer", "treatment"],
      priorities: { cleanser: 1, moisturizer: 2, spf: 3, treatment: 4 },
      minProducts: 3
    },
    "default": {
      morning: ["cleanser", "treatment", "moisturizer", "spf"],
      night: ["cleanser", "treatment", "moisturizer"],
      priorities: { cleanser: 1, moisturizer: 2, treatment: 3, spf: 4 },
      minProducts: 3
    }
  },

  // Genera rutina personalizada completa
  generateRoutine: function(skinProfile, budget, brands) {
    var skinType = this.extractBaseSkinType(skinProfile.typeName);
    var template = this.routineTemplates[skinType] || this.routineTemplates["default"];

    var routine = {
      morning: this.generateTimeOfDayRoutine("morning", template.morning, skinProfile, budget, brands),
      night: this.generateTimeOfDayRoutine("night", template.night, skinProfile, budget, brands),
      config: {
        skinType: skinProfile.typeName,
        budget: budget,
        brands: brands,
        generatedAt: new Date().toISOString()
      },
      totalPrice: 0,
      monthlyEstimate: 0
    };

    // Calcular precios
    routine.totalPrice = this.calculateRoutinePrice(routine);
    routine.monthlyEstimate = this.estimateMonthlyCost(routine);

    return routine;
  },

  // Extrae el tipo base de piel (ej: "Seca" de "Seca Sensible")
  extractBaseSkinType: function(fullTypeName) {
    var types = ["Normal", "Seca", "Grasa", "Mixta", "Sensible"];
    for (var i = 0; i < types.length; i++) {
      if (fullTypeName.indexOf(types[i]) > -1) return types[i];
    }
    return "Normal";
  },

  // Genera rutina para un turno específico
  generateTimeOfDayRoutine: function(timeOfDay, categories, skinProfile, budget, brands) {
    var routine = [];
    var usedProducts = [];
    var minProducts = 3;

    // Primero intentamos con las categorías principales
    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      var product = this.selectBestProduct(category, skinProfile, budget, brands, usedProducts, timeOfDay);
      if (product) {
        routine.push({
          product: product,
          category: category,
          timeOfDay: timeOfDay,
          step: routine.length + 1,
          essential: this.isEssential(category, timeOfDay)
        });
        usedProducts.push(product.id);
      }
    }

    // Asegurar mínimo 3 productos - intentar agregar más si hace falta
    while (routine.length < minProducts) {
      var extraProduct = this.addExtraProduct(categories, skinProfile, budget, brands, usedProducts, timeOfDay, routine);
      if (extraProduct) {
        routine.push(extraProduct);
        usedProducts.push(extraProduct.product.id);
      } else {
        // Si no podemos agregar productos únicos, intentar con segunda opción de categorías existentes
        var addedAlternative = this.addAlternativeProduct(categories, skinProfile, budget, brands, usedProducts, timeOfDay, routine);
        if (addedAlternative) {
          routine.push(addedAlternative);
          usedProducts.push(addedAlternative.product.id);
        } else {
          break; // No hay más productos disponibles
        }
      }
    }

    return routine;
  },

  // Selecciona el mejor producto para una categoría
  selectBestProduct: function(category, skinProfile, budget, brands, usedProducts, timeOfDay) {
    var products = Products.getAll();
    var candidates = [];

    for (var i = 0; i < products.length; i++) {
      var product = products[i];

      // Filtrar por categoría
      if (product.category !== category) continue;

      // Filtrar por presupuesto
      if (!this.fitsBudget(product, budget)) continue;

      // Filtrar por marcas
      if (brands && brands.length > 0 && brands.indexOf(product.brand) === -1) continue;

      // Filtrar por alergias
      if (!this.isAllergySafe(product, skinProfile)) continue;

      // Evitar duplicados
      if (usedProducts.indexOf(product.id) > -1) continue;

      // Calcular score
      var score = this.scoreProduct(product, skinProfile, timeOfDay);
      candidates.push({ product: product, score: score });
    }

    // Ordenar por score y retornar el mejor
    candidates.sort(function(a, b) { return b.score - a.score; });
    return candidates.length > 0 ? candidates[0].product : null;
  },

  // Agrega producto extra si no hay suficientes
  addExtraProduct: function(categories, skinProfile, budget, brands, usedProducts, timeOfDay, currentRoutine) {
    var existingCategories = currentRoutine.map(function(item) { return item.category; });
    var availableCategories = categories.filter(function(cat) { return existingCategories.indexOf(cat) === -1; });

    for (var i = 0; i < availableCategories.length; i++) {
      var product = this.selectBestProduct(availableCategories[i], skinProfile, budget, brands, usedProducts, timeOfDay);
      if (product) {
        return {
          product: product,
          category: availableCategories[i],
          timeOfDay: timeOfDay,
          step: currentRoutine.length + 1,
          essential: false
        };
      }
    }
    return null;
  },

  // Agrega producto alternativo de una categoría existente (segunda opción)
  addAlternativeProduct: function(categories, skinProfile, budget, brands, usedProducts, timeOfDay, currentRoutine) {
    var allProducts = Products.getAll();

    for (var i = 0; i < categories.length; i++) {
      var category = categories[i];
      var productsInCategory = allProducts.filter(function(p) {
        return p.category === category &&
          RoutineEngine.fitsBudget(p, budget) &&
          RoutineEngine.isAllergySafe(p, skinProfile) &&
          usedProducts.indexOf(p.id) === -1;
      });

      // Ordenar por score y tomar el segundo mejor (si hay al menos 2)
      var scoredProducts = productsInCategory.map(function(p) {
        return {
          product: p,
          score: RoutineEngine.scoreProduct(p, skinProfile, timeOfDay)
        };
      }).sort(function(a, b) { return b.score - a.score; });

      if (scoredProducts.length > 0) {
        var selected = scoredProducts[0].product;
        return {
          product: selected,
          category: category,
          timeOfDay: timeOfDay,
          step: currentRoutine.length + 1,
          essential: false
        };
      }
    }

    return null;
  },

  // Calcula score de compatibilidad del producto
  scoreProduct: function(product, skinProfile, timeOfDay) {
    var score = 50; // Base score

    // +30 si coincide el tipo de piel
    if (this.skinTypeMatch(product, skinProfile)) {
      score += 30;
    }

    // +20 si es seguro para alergias
    if (this.isAllergySafe(product, skinProfile)) {
      score += 20;
    }

    // +15 si el precio es adecuado al presupuesto
    if (this.priceScore(product, skinProfile)) {
      score += 15;
    }

    // +10 si tiene buen rating
    if (product.rating >= 4.5) {
      score += 10;
    }

    // Bonus por categoría específica según turno
    if (timeOfDay === "morning" && product.category === "spf") {
      score += 5; // SPF es esencial en mañana
    } else if (timeOfDay === "night" && product.category === "treatment") {
      score += 5; // Tratamientos son mejores en noche
    }

    return score;
  },

  // Verifica si el producto es compatible con el tipo de piel
  skinTypeMatch: function(product, skinProfile) {
    if (!product.type || product.type.length === 0) return true;

    var profileTypes = this.parseProfileTypes(skinProfile.typeName);
    for (var i = 0; i < profileTypes.length; i++) {
      if (product.type.indexOf(profileTypes[i]) > -1) return true;
    }
    return false;
  },

  // Parsea los tipos de piel del perfil
  parseProfileTypes: function(typeName) {
    var types = [];
    if (typeName.indexOf("Normal") > -1) types.push("normal");
    if (typeName.indexOf("Seca") > -1) types.push("dry");
    if (typeName.indexOf("Grasa") > -1) types.push("oily");
    if (typeName.indexOf("Mixta") > -1) types.push("mixed");
    if (typeName.indexOf("Sensible") > -1) types.push("sensitive");
    if (typeName.indexOf("Acné") > -1) types.push("acne");
    if (types.length === 0) types.push("normal");
    return types;
  },

  // Verifica si es seguro para alergias del usuario
  isAllergySafe: function(product, skinProfile) {
    if (!skinProfile.allergies || skinProfile.allergies.length === 0) return true;

    var productAllergens = product.allergy || [];
    for (var i = 0; i < skinProfile.allergies.length; i++) {
      if (productAllergens.indexOf(skinProfile.allergies[i]) > -1) return false;
    }
    return true;
  },

  // Verifica si cabe en el presupuesto
  fitsBudget: function(product, budget) {
    if (!budget || budget === "any") return true;

    var budgets = {
      "low": 15,
      "medium": 25,
      "high": 50
    };

    var maxPrice = budgets[budget] || 50;
    return product.price <= maxPrice;
  },

  // Score adicional por precio
  priceScore: function(product, skinProfile) {
    if (!skinProfile.budget || skinProfile.budget === "any") return true;

    var budgets = {
      "low": 15,
      "medium": 25,
      "high": 50
    };

    var idealPrice = budgets[skinProfile.budget] || 25;
    var priceDiff = Math.abs(product.price - idealPrice);

    if (priceDiff <= 5) return 15; // Precio perfecto
    if (priceDiff <= 10) return 10; // Precio aceptable
    if (priceDiff <= 15) return 5;  // Precio alto pero ok
    return 0; // Precio muy fuera de rango
  },

  // Verifica si un producto es esencial
  isEssential: function(category, timeOfDay) {
    var essentials = {
      morning: ["cleanser", "moisturizer", "spf"],
      night: ["cleanser", "moisturizer"]
    };
    return essentials[timeOfDay].indexOf(category) > -1;
  },

  // Calcula precio total de la rutina
  calculateRoutinePrice: function(routine) {
    var morningProducts = routine.morning.map(function(item) { return item.product; });
    var nightProducts = routine.night.map(function(item) { return item.product; });
    var allProducts = morningProducts.concat(nightProducts);

    var uniqueProducts = [];
    var usedIds = [];
    for (var i = 0; i < allProducts.length; i++) {
      if (usedIds.indexOf(allProducts[i].id) === -1) {
        uniqueProducts.push(allProducts[i]);
        usedIds.push(allProducts[i].id);
      }
    }

    var total = 0;
    for (var j = 0; j < uniqueProducts.length; j++) {
      total += uniqueProducts[j].price;
    }
    return total;
  },

  // Estima costo mensual considerando duración de productos
  estimateMonthlyCost: function(routine) {
    // Estimación: cada producto dura 2 meses en promedio
    return routine.totalPrice / 2;
  },

  // Regenera rutina con nuevos parámetros
  regenerateRoutine: function(currentRoutine, newBudget, newBrands) {
    var skinProfile = Storage.getProfile();
    if (!skinProfile) return null;

    return this.generateRoutine(skinProfile, newBudget, newBrands);
  },

  // Intercambia un producto en la rutina
  swapProduct: function(routine, timeOfDay, stepIndex, newProductId) {
    var timeRoutine = routine[timeOfDay];
    if (!timeRoutine || !timeRoutine[stepIndex]) return routine;

    var newProduct = Products.getById(newProductId);
    if (!newProduct) return routine;

    // Validar que el nuevo producto sea compatible
    var oldProduct = timeRoutine[stepIndex].product;
    var skinProfile = Storage.getProfile();
    var routineConfig = routine.config;

    if (!this.fitsBudget(newProduct, routineConfig.budget)) return routine;
    if (routineConfig.brands && routineConfig.brands.length > 0 && routineConfig.brands.indexOf(newProduct.brand) === -1) return routine;

    // Reemplazar producto
    timeRoutine[stepIndex].product = newProduct;
    timeRoutine[stepIndex].category = newProduct.category;

    // Recalcular precios
    routine.totalPrice = this.calculateRoutinePrice(routine);
    routine.monthlyEstimate = this.estimateMonthlyCost(routine);

    return routine;
  },

  // Optimiza rutina por preferencia
  optimizeRoutine: function(routine, preference) {
    if (preference === "cost") {
      return this.regenerateRoutine(routine, "low", routine.config.brands);
    } else if (preference === "quality") {
      return this.regenerateRoutine(routine, "high", routine.config.brands);
    } else if (preference === "balance") {
      return this.regenerateRoutine(routine, "medium", routine.config.brands);
    }
    return routine;
  },

  // Formatea rutina para visualización
  formatRoutineForDisplay: function(routine) {
    var self = this; // Guardar referencia para usar dentro de callbacks
    var display = {
      morning: {
        products: routine.morning.map(function(item) { return item.product; }),
        totalPrice: 0,
        steps: routine.morning.map(function(item, index) {
          return {
            step: index + 1,
            product: item.product,
            category: item.category,
            essential: item.essential,
            instruction: self.getInstruction(item.category, item.timeOfDay)
          };
        })
      },
      night: {
        products: routine.night.map(function(item) { return item.product; }),
        totalPrice: 0,
        steps: routine.night.map(function(item, index) {
          return {
            step: index + 1,
            product: item.product,
            category: item.category,
            essential: item.essential,
            instruction: self.getInstruction(item.category, item.timeOfDay)
          };
        })
      },
      summary: {
        totalProducts: 0,
        totalInvestment: routine.totalPrice,
        monthlyEstimate: routine.monthlyEstimate,
        duration: this.estimateRoutineDuration(routine)
      }
    };

    // Calcular totales
    var morningPrice = 0;
    var nightPrice = 0;
    var uniqueProducts = [];

    routine.morning.forEach(function(item) {
      morningPrice += item.product.price;
      if (uniqueProducts.indexOf(item.product.id) === -1) uniqueProducts.push(item.product.id);
    });

    routine.night.forEach(function(item) {
      nightPrice += item.product.price;
      if (uniqueProducts.indexOf(item.product.id) === -1) uniqueProducts.push(item.product.id);
    });

    display.morning.totalPrice = morningPrice;
    display.night.totalPrice = nightPrice;
    display.summary.totalProducts = uniqueProducts.length;

    return display;
  },

  // Obtiene instrucciones de uso
  getInstruction: function(category, timeOfDay) {
    var instructions = {
      "cleanser": "Aplicar sobre piel húmeda, masajear 30 segundos y enjuagar",
      "treatment": "Aplicar 2-3 gotas sobre piel limpia y seca, esperar absorción",
      "moisturizer": "Aplicar sobre piel ligeramente húmeda con movimientos ascendentes",
      "spf": "Aplicar generosamente 15 minutos antes de la exposición solar"
    };
    return instructions[category] || "Aplicar según indicaciones del producto";
  },

  // Estima duración de la rutina en días
  estimateRoutineDuration: function(routine) {
    // Cada producto dura aprox 60 días con uso diario
    var uniqueProducts = [];
    var usedIds = [];

    routine.morning.forEach(function(item) {
      if (usedIds.indexOf(item.product.id) === -1) {
        uniqueProducts.push(item.product);
        usedIds.push(item.product.id);
      }
    });

    routine.night.forEach(function(item) {
      if (usedIds.indexOf(item.product.id) === -1) {
        uniqueProducts.push(item.product);
        usedIds.push(item.product.id);
      }
    });

    return uniqueProducts.length * 60; // Días aprox
  },

  // Valida que la rutina cumpla con los requisitos mínimos
  validateRoutine: function(routine) {
    var errors = [];
    var warnings = [];

    // Validar mínimo 3 productos por turno
    if (routine.morning.length < 3) {
      errors.push("La rutina de mañana debe tener mínimo 3 productos (actual: " + routine.morning.length + ")");
    }

    if (routine.night.length < 3) {
      errors.push("La rutina de noche debe tener mínimo 3 productos (actual: " + routine.night.length + ")");
    }

    // Verificar que no haya productos duplicados
    var morningIds = routine.morning.map(function(item) { return item.product.id; });
    var nightIds = routine.night.map(function(item) { return item.product.id; });
    var allIds = morningIds.concat(nightIds);

    var uniqueIds = [];
    var duplicates = [];

    for (var i = 0; i < allIds.length; i++) {
      if (uniqueIds.indexOf(allIds[i]) === -1) {
        uniqueIds.push(allIds[i]);
      } else {
        duplicates.push(allIds[i]);
      }
    }

    if (duplicates.length > 0) {
      warnings.push("Hay " + duplicates.length + " producto(s) repetido(s) entre día y noche");
    }

    // Validar que tenga productos esenciales
    var morningCategories = routine.morning.map(function(item) { return item.category; });
    var nightCategories = routine.night.map(function(item) { return item.category; });

    if (morningCategories.indexOf("cleanser") === -1) {
      warnings.push("Falta limpiador en la rutina de mañana");
    }
    if (morningCategories.indexOf("moisturizer") === -1) {
      warnings.push("Falta hidratante en la rutina de mañana");
    }
    if (morningCategories.indexOf("spf") === -1) {
      warnings.push("Falta protector solar en la rutina de mañana");
    }

    if (nightCategories.indexOf("cleanser") === -1) {
      warnings.push("Falta limpiador en la rutina de noche");
    }
    if (nightCategories.indexOf("moisturizer") === -1) {
      warnings.push("Falta hidratante en la rutina de noche");
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      warnings: warnings,
      uniqueProducts: uniqueIds.length,
      totalProducts: allIds.length
    };
  },

  // Obtiene rutinas predefinidas por presupuesto
  getPresetRoutines: function(skinProfile) {
    var skinType = this.extractBaseSkinType(skinProfile.typeName);

    return {
      economic: {
        name: "Rutina Económica",
        budget: "low",
        description: "Productos accesibles sin sacrificar calidad",
        icon: "💰"
      },
      balanced: {
        name: "Rutina Equilibrada",
        budget: "medium",
        description: "Mejor relación calidad-precio",
        icon: "⚖️"
      },
      premium: {
        name: "Rutina Premium",
        budget: "high",
        description: "Productos de alta gama",
        icon: "✨"
      }
    };
  },

  // Exporta rutina a formato imprimible
  exportRoutine: function(routine) {
    var display = this.formatRoutineForDisplay(routine);
    var text = "🌸 MI RUTINA DE PIEL - DermaMatch\n\n";
    text += "Tipo de piel: " + routine.config.skinType + "\n";
    text += "Presupuesto: " + routine.config.budget + "\n";
    text += "Generado: " + new Date(routine.config.generatedAt).toLocaleDateString() + "\n\n";

    text += "☀️ RUTINA MAÑANA\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    display.morning.steps.forEach(function(step) {
      text += step.step + ". " + step.product.name + " (S/." + step.product.price.toFixed(2) + ")\n";
      text += "   " + step.instruction + "\n\n";
    });
    text += "Subtotal mañana: S/." + display.morning.totalPrice.toFixed(2) + "\n\n";

    text += "🌙 RUTINA NOCHE\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    display.night.steps.forEach(function(step) {
      text += step.step + ". " + step.product.name + " (S/." + step.product.price.toFixed(2) + ")\n";
      text += "   " + step.instruction + "\n\n";
    });
    text += "Subtotal noche: S/." + display.night.totalPrice.toFixed(2) + "\n\n";

    text += "💰 INVERSIÓN TOTAL\n";
    text += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    text += "Productos únicos: " + display.summary.totalProducts + "\n";
    text += "Inversión inicial: S/." + display.summary.totalInvestment.toFixed(2) + "\n";
    text += "Costo mensual estimado: S/." + display.summary.monthlyEstimate.toFixed(2) + "\n";
    text += "Duración aproximada: " + Math.floor(display.summary.duration / 30) + " meses\n";

    return text;
  }
};