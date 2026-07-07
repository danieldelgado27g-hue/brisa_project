var quizData = {
  questions: [
    { id: 1, question: "¿Cómo se siente tu piel al despertar por la mañana?", options: [
      { value: "dry", label: "Tirante y áspera", icon: "💧", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4e4' width='120' height='80' rx='8'/%3E%3Cpath d='M30 40 Q60 20 90 40' stroke='%23e57373' stroke-width='1.5' fill='none'/%3E%3Cpath d='M30 50 Q60 30 90 50' stroke='%23e57373' stroke-width='1' fill='none' opacity='0.5'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%23c62828' font-size='9'%3EPiel seca%3C/text%3E%3C/svg%3E" },
      { value: "normal", label: "Cómoda y equilibrada", icon: "✨", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.6'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPiel equilibrada%3C/text%3E%3C/svg%3E" },
      { value: "oily", label: "Brillante o grasosa", icon: "💫", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fff8e1' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23ffd54f' opacity='0.5'/%3E%3Ccircle cx='50' cy='30' r='2' fill='%23f57f17'/%3E%3Ccircle cx='70' cy='32' r='2' fill='%23f57f17'/%3E%3Ccircle cx='60' cy='42' r='2' fill='%23f57f17'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPiel grasa%3C/text%3E%3C/svg%3E" },
      { value: "mixed", label: "Grasa en frente, seca en mejillas", icon: "🌓", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Crect x='45' y='15' width='30' height='30' fill='%23ffd54f' opacity='0.5' rx='4'/%3E%3Crect x='20' y='40' width='35' height='20' fill='%23fce4e4' opacity='0.6' rx='4'/%3E%3Crect x='65' y='40' width='35' height='20' fill='%23fce4e4' opacity='0.6' rx='4'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPiel mixta%3C/text%3E%3C/svg%3E" }
    ]},
    { id: 2, question: "¿Con qué frecuencia experimentas sensibilidad o irritación?", options: [
      { value: "sensitive_high", label: "Muy frecuente — reacciono a casi todo", icon: "⚠️", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23ef9a9a' opacity='0.6'/%3E%3Ccircle cx='52' cy='30' r='4' fill='%23e53935' opacity='0.5'/%3E%3Ccircle cx='68' cy='30' r='4' fill='%23e53935' opacity='0.5'/%3E%3Ccircle cx='60' cy='42' r='3' fill='%23e53935' opacity='0.4'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EAlta sensibilidad%3C/text%3E%3C/svg%3E" },
      { value: "sensitive_medium", label: "A veces — con productos nuevos", icon: "🔶", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Ccircle cx='55' cy='32' r='2' fill='%23e57373' opacity='0.4'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3ESensibilidad moderada%3C/text%3E%3C/svg%3E" },
      { value: "not_sensitive", label: "Casi nunca — mi piel es resistente", icon: "✅", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23c8e6c9' opacity='0.5'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPiel resistente%3C/text%3E%3C/svg%3E" }
    ]},
    { id: 3, question: "¿Cómo son tus poros?", options: [
      { value: "large_pores", label: "Visibles y dilatados", icon: "⭕", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fff8e1' width='120' height='80' rx='8'/%3E%3Ccircle cx='40' cy='30' r='5' fill='%23bf360c' opacity='0.4'/%3E%3Ccircle cx='60' cy='35' r='6' fill='%23bf360c' opacity='0.4'/%3E%3Ccircle cx='80' cy='28' r='5' fill='%23bf360c' opacity='0.4'/%3E%3Ccircle cx='50' cy='45' r='4' fill='%23bf360c' opacity='0.3'/%3E%3Ccircle cx='70' cy='48' r='5' fill='%23bf360c' opacity='0.3'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPoros dilatados%3C/text%3E%3C/svg%3E" },
      { value: "small_pores", label: "Pequeños, casi invisibles", icon: "•", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Ccircle cx='52' cy='32' r='1.5' fill='%23ad1457' opacity='0.3'/%3E%3Ccircle cx='68' cy='35' r='1.5' fill='%23ad1457' opacity='0.3'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPoros pequeños%3C/text%3E%3C/svg%3E" },
      { value: "medium_pores", label: "Normales, solo visibles de cerca", icon: "◦", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Ccircle cx='50' cy='33' r='2.5' fill='%23ad1457' opacity='0.3'/%3E%3Ccircle cx='68' cy='36' r='2.5' fill='%23ad1457' opacity='0.3'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPoros normales%3C/text%3E%3C/svg%3E" }
    ]},
    { id: 4, question: "¿Tienes tendencia a brotes de acné?", options: [
      { value: "acne_high", label: "Sí, frecuente y constante", icon: "🔴", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23ef9a9a' opacity='0.5'/%3E%3Ccircle cx='50' cy='30' r='3' fill='%23c62828'/%3E%3Ccircle cx='60' cy='28' r='4' fill='%23c62828'/%3E%3Ccircle cx='70' cy='32' r='3' fill='%23c62828'/%3E%3Ccircle cx='55' cy='42' r='2.5' fill='%23c62828'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EAcné frecuente%3C/text%3E%3C/svg%3E" },
      { value: "acne_occasional", label: "Ocasional — antes del período o estrés", icon: "🟡", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Ccircle cx='60' cy='32' r='2.5' fill='%23e53935' opacity='0.6'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EAcné ocasional%3C/text%3E%3C/svg%3E" },
      { value: "no_acne", label: "No, mi piel está libre de acné", icon: "🟢", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23c8e6c9' opacity='0.5'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPiel libre de acné%3C/text%3E%3C/svg%3E" }
    ]},
    { id: 5, question: "¿Cómo reacciona tu piel al sol?", options: [
      { value: "sun_sensitive", label: "Me quemo fácilmente, rara vez me bronceo", icon: "☀️", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23ffcdd2' opacity='0.6'/%3E%3Ctext x='60' y='20' font-size='14' text-anchor='middle' fill='%23ff8f00'%3E☀%3C/text%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EFotosensible%3C/text%3E%3C/svg%3E" },
      { value: "sun_normal", label: "Me bronceo gradualmente", icon: "🌤️", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Ctext x='60' y='20' font-size='14' text-anchor='middle' fill='%23fb8c00'%3E⛅%3C/text%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPiel normal al sol%3C/text%3E%3C/svg%3E" },
      { value: "sun_resistant", label: "Me bronceo rápido, rara vez me quemo", icon: "🏖️", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23ffe0b2' opacity='0.6'/%3E%3Ctext x='60' y='20' font-size='14' text-anchor='middle' fill='%23e65100'%3E🏖%3C/text%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPiel resistente al sol%3C/text%3E%3C/svg%3E" }
    ]},
    { id: 6, question: "¿Notas líneas de expresión o flacidez?", options: [
      { value: "aging_visible", label: "Sí, visibles incluso sin gesticular", icon: "📅", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Cpath d='M45 30 Q60 22 75 30' stroke='%23ad1457' stroke-width='1.5' fill='none'/%3E%3Cpath d='M45 40 Q60 48 75 40' stroke='%23ad1457' stroke-width='1.2' fill='none' opacity='0.7'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3ELíneas visibles%3C/text%3E%3C/svg%3E" },
      { value: "aging_mild", label: "Solo al sonreír o gesticular", icon: "🙂", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Cpath d='M48 35 Q60 28 72 35' stroke='%23ad1457' stroke-width='1' fill='none' opacity='0.5'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3ELíneas de expresión%3C/text%3E%3C/svg%3E" },
      { value: "no_aging", label: "Mi piel luce firme y lisa", icon: "👶", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23c8e6c9' opacity='0.5'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EPiel firme%3C/text%3E%3C/svg%3E" }
    ]},
    { id: 7, question: "¿Tienes manchas o hiperpigmentación?", options: [
      { value: "hyperpig_high", label: "Sí, varias manchas oscuras", icon: "🟤", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Ccircle cx='50' cy='30' r='4' fill='%236d4c41' opacity='0.6'/%3E%3Ccircle cx='68' cy='38' r='3.5' fill='%236d4c41' opacity='0.5'/%3E%3Ccircle cx='58' cy='44' r='2.5' fill='%236d4c41' opacity='0.4'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EManchas visibles%3C/text%3E%3C/svg%3E" },
      { value: "hyperpig_mild", label: "Algunas pecas o marcas leves", icon: "🟡", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23f8bbd0' opacity='0.5'/%3E%3Ccircle cx='55' cy='32' r='2' fill='%238d6e63' opacity='0.5'/%3E%3Ccircle cx='66' cy='36' r='1.5' fill='%238d6e63' opacity='0.4'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3EManchas leves%3C/text%3E%3C/svg%3E" },
      { value: "no_hyperpig", label: "Mi tono es uniforme", icon: "⚪", image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Crect fill='%23fce4ec' width='120' height='80' rx='8'/%3E%3Ccircle cx='60' cy='35' r='18' fill='%23c8e6c9' opacity='0.5'/%3E%3Ctext x='60' y='70' text-anchor='middle' fill='%236A4C93' font-size='9'%3ETono uniforme%3C/text%3E%3C/svg%3E" }
    ]}
  ]
};

var skinTypeMapping = {
  calculateType: function(answers) {
    var q1 = answers[1], q2 = answers[2], q3 = answers[3], q4 = answers[4], q5 = answers[5], q6 = answers[6], q7 = answers[7];
    var type = "";
    var concerns = [];
    if (q1 === 'dry') { type = "Seca"; concerns.push("deshidratación"); }
    else if (q1 === 'oily') { type = "Grasa"; concerns.push("exceso de sebo"); }
    else if (q1 === 'mixed') { type = "Mixta"; concerns.push("desequilibrio zonas"); }
    else { type = "Normal"; }
    if (q2 === 'sensitive_high') { type += " Sensible"; concerns.push("sensibilidad alta"); }
    else if (q2 === 'sensitive_medium') { concerns.push("sensibilidad moderada"); }
    if (q4 === 'acne_high') { type += " con Acné"; concerns.push("acné activo"); }
    else if (q4 === 'acne_occasional' && type === "Normal") { type = "Normal con Tendencia Acnéica"; concerns.push("acné ocasional"); }
    if (q6 === 'aging_visible') { type += " Madura"; concerns.push("signos de edad"); }
    if (q7 === 'hyperpig_high') { concerns.push("hiperpigmentación"); if (type.indexOf("con") === -1) type += " con Manchas"; }
    if (q1 === 'dry' && q2 === 'sensitive_high') { concerns.push("posible dermatitis atópica"); if (type.indexOf("Atópica") === -1) type = type.replace("Seca", "Seca/Atópica"); }
    if (q5 === 'sun_sensitive' && (q2 === 'sensitive_high' || q2 === 'sensitive_medium')) { if (type.indexOf("Rosácea") === -1) { type = "Rosácea " + (type.indexOf("Sensible") > -1 ? "" : "Sensible ") + type; } concerns.push("fotosensibilidad", "rosácea"); }
    return { typeName: type, concerns: concerns, description: skinTypeMapping.getDescription(type) };
  },
  getDescription: function(type) {
    var descs = {
      "Normal": "Tu piel está equilibrada, sin excesos de grasa ni sequedad. ¡Mantenla así!",
      "Seca": "Tu piel produce menos sebo del necesario, lo que causa tirantez y descamación.",
      "Grasa": "Tu piel produce exceso de sebo, causando brillo y poros visibles.",
      "Mixta": "Tienes zona T grasa (frente, nariz, mentón) y mejillas secas o normales.",
      "Seca Sensible": "Tu piel es delicada, se irrita fácilmente y necesita hidratación intensa.",
      "Grasa Sensible": "Tu piel es grasa pero reacciona con rojeces a ciertos productos.",
      "Normal con Tendencia Acnéica": "Piel equilibrada que ocasionalmente presenta brotes.",
      "Madura": "Tu piel muestra signos de envejecimiento como líneas y pérdida de firmeza."
    };
    for (var key in descs) { if (type.indexOf(key) > -1) return descs[key]; }
    return "Tipo de piel personalizado que requiere cuidados específicos.";
  }
};

function QuizApp() {
  this.currentQuestion = 0;
  this.answers = {};
  this.state = 'welcome';
  this.listenersAttached = false;
}
QuizApp.prototype.init = function() {
  var profile = Storage.getProfile();
  if (profile) {
    var days = Utils.daysBetween(new Date().toISOString(), profile.date);
    if (days < 90) { App.navigate('home'); return; }
  }
  this.render();
};
QuizApp.prototype.render = function() {
  var app = document.getElementById('app');
  if (!app) return;
  if (this.state === 'welcome') app.innerHTML = this.renderWelcome();
  else if (this.state === 'experts') app.innerHTML = this.renderExperts();
  else if (this.state === 'question') app.innerHTML = this.renderQuestion();
  else if (this.state === 'loading') { app.innerHTML = this.renderLoading(); var self = this; setTimeout(function(){ self.finishQuiz(); }, 1500); }
  else if (this.state === 'result') app.innerHTML = this.renderResult();
  this.attachListeners();
};
QuizApp.prototype.attachListeners = function() {
  var app = document.getElementById('app');
  if (!app) return;
  var self = this;

  app.querySelectorAll('[data-quiz-action]').forEach(function(el) {
    el.onclick = function(e) {
      var action = el.dataset.quizAction;
      if (action === 'showExperts') { self.showExperts(); }
      else if (action === 'startQuiz') { self.startQuiz(); }
      else if (action === 'goWelcome') { self.state = 'welcome'; self.render(); }
      else if (action === 'selectOption') { self.selectOption(parseInt(el.dataset.quizQ), el.dataset.quizValue); }
      else if (action === 'goBack') { self.goBack(); }
      else if (action === 'navigate') { App.navigate(el.dataset.quizRoute); }
    };
  });
};
QuizApp.prototype.renderWelcome = function() {
  return '<div class="quiz-wrap">' +
    '<div class="quiz-card">' +
    '<div class="quiz-card-icon">🧪</div>' +
    '<h1 class="quiz-card-title">Test de Piel</h1>' +
    '<p class="quiz-card-desc">Descubre tu tipo de piel con nuestro diagnóstico dermatológico. Son solo 7 preguntas rápidas.</p>' +
    '<button class="btn btn-primary btn-full" data-quiz-action="showExperts">Comenzar</button>' +
    '</div></div>';
};
QuizApp.prototype.renderExperts = function() {
  return '<div class="quiz-wrap">' +
    '<div class="quiz-card">' +
    '<div class="quiz-card-icon">🎓</div>' +
    '<h2 class="quiz-card-title">Diagnóstico Dermatológico</h2>' +
    '<p class="quiz-card-desc">Nuestro análisis está respaldado por expertos en cuidado de la piel.</p>' +
    '<ul class="quiz-list">' +
    '<li>✓ Validado por más de 50 dermatólogos certificados</li>' +
    '<li>✓ Basado en evidencia científica actualizada</li>' +
    '<li>✓ Algoritmo probado en miles de pacientes</li>' +
    '<li>✓ Recomendaciones personalizadas y seguras</li>' +
    '</ul>' +
    '<button class="btn btn-primary btn-full" data-quiz-action="startQuiz">Comenzar mi diagnóstico</button>' +
    '<button class="btn btn-secondary btn-full" style="margin-top:0.5rem;" data-quiz-action="goWelcome">Volver</button>' +
    '</div></div>';
};
QuizApp.prototype.renderQuestion = function() {
  var q = quizData.questions[this.currentQuestion];
  var total = quizData.questions.length;
  var dots = '';
  for (var i = 0; i < total; i++) {
    dots += '<div class="quiz-progress-dot ' +
      (i < this.currentQuestion ? 'completed' : '') + ' ' +
      (i === this.currentQuestion ? 'active' : '') + '"></div>';
  }
  var opts = '';
  for (var i = 0; i < q.options.length; i++) {
    var opt = q.options[i];
    opts += '<div class="quiz-option" data-quiz-action="selectOption" data-quiz-q="' + q.id + '" data-quiz-value="' + opt.value + '">' +
      (opt.image ? '<img class="quiz-option-img" src="' + opt.image + '" alt="' + opt.label + '">' : '<div class="quiz-option-icon">' + opt.icon + '</div>') +
      '<span class="quiz-option-label">' + opt.label + '</span></div>';
  }
  var backBtn = this.currentQuestion > 0
    ? '<button class="btn btn-secondary btn-sm" style="margin-bottom:0.75rem;" data-quiz-action="goBack">← Atrás</button>'
    : '';

  return '<div class="quiz-wrap">' +
    '<div class="quiz-progress">' + dots + '</div>' +
    '<div class="quiz-count">Pregunta ' + (this.currentQuestion + 1) + ' de ' + total + '</div>' +
    '<div class="quiz-question-card">' +
    backBtn +
    '<div class="quiz-question-label">' + q.question + '</div>' +
    '<div class="quiz-options">' + opts + '</div>' +
    '</div></div>';
};
QuizApp.prototype.renderLoading = function() {
  return '<div class="quiz-wrap"><div class="quiz-card" style="text-align:center;">' +
    '<div class="loading"><div class="spinner"></div></div>' +
    '<p style="color:var(--text-secondary);margin-top:1rem;">Analizando tu piel...</p></div></div>';
};
QuizApp.prototype.renderResult = function() {
  var profile = Storage.getProfile();
  var skinImage = this.getSkinImage(profile.typeName);
  return '<div class="quiz-wrap">' +
    '<div class="quiz-card" style="text-align:center;">' +
    '<img src="' + skinImage + '" class="skin-type-image" alt="' + profile.typeName + '">' +
    '<div class="skin-type-badge">' + profile.typeName + '</div>' +
    '<h2 class="quiz-card-title" style="margin-top:0.75rem;">Tu diagnóstico está listo</h2>' +
    '<p class="quiz-card-desc">' + profile.description + '</p>' +
    (profile.concerns.length > 0
      ? '<div class="quiz-concerns"><strong>Preocupaciones detectadas:</strong> ' + profile.concerns.join(', ') + '</div>'
      : '<p style="color:var(--success);font-weight:700;margin-bottom:1rem;">✅ ¡Tu piel está sana! Mantenla así.</p>') +
    '<button class="btn btn-primary btn-full" data-quiz-action="navigate" data-quiz-route="productos">Ver mis productos</button>' +
    '<button class="btn btn-secondary btn-full" style="margin-top:0.5rem;" data-quiz-action="navigate" data-quiz-route="profile">Ir a mi perfil</button>' +
    '</div></div>';
};
QuizApp.prototype.getSkinImage = function(typeName) {
  var images = {
    'Normal': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f4d9d0" width="200" height="200"/%3E%3Ccircle cx="100" cy="80" r="30" fill="%23fcd5ce"/%3E%3Cellipse cx="100" cy="150" rx="40" ry="50" fill="%23fcd5ce"/%3E%3Ctext x="100" y="190" text-anchor="middle" fill="%236A4C93" font-size="12"%3EEquilibrada%3C/text%3E%3C/svg%3E',
    'Seca': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f4d9d0" width="200" height="200"/%3E%3Ccircle cx="100" cy="80" r="30" fill="%23fecaca"/%3E%3Cellipse cx="100" cy="150" rx="40" ry="50" fill="%23fecaca"/%3E%3Cpath d="M70 140 Q100 120 130 140" stroke="%236A4C93" stroke-width="2" fill="none"/%3E%3Ctext x="100" y="190" text-anchor="middle" fill="%236A4C93" font-size="12"%3ESeca%3C/text%3E%3C/svg%3E',
    'Grasa': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f4d9d0" width="200" height="200"/%3E%3Ccircle cx="100" cy="80" r="30" fill="%23fde68a"/%3E%3Cellipse cx="100" cy="150" rx="40" ry="50" fill="%23fde68a"/%3E%3Ccircle cx="90" cy="75" r="3" fill="%236A4C93"/%3E%3Ccircle cx="110" cy="75" r="3" fill="%236A4C93"/%3E%3Ccircle cx="100" cy="90" r="3" fill="%236A4C93"/%3E%3Ctext x="100" y="190" text-anchor="middle" fill="%236A4C93" font-size="12"%3EGrasa%3C/text%3E%3C/svg%3E',
    'Mixta': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f4d9d0" width="200" height="200"/%3E%3Ccircle cx="100" cy="80" r="30" fill="%23fef3c7"/%3E%3Cellipse cx="100" cy="150" rx="40" ry="50" fill="%23fef3c7"/%3E%3Crect x="85" y="70" width="30" height="20" fill="%23fde68a"/%3E%3Crect x="85" y="130" width="30" height="20" fill="%23fecaca"/%3E%3Ctext x="100" y="190" text-anchor="middle" fill="%236A4C93" font-size="12"%3EMixta%3C/text%3E%3C/svg%3E',
    'Sensible': 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f4d9d0" width="200" height="200"/%3E%3Ccircle cx="100" cy="80" r="30" fill="%23fecaca"/%3E%3Cellipse cx="100" cy="150" rx="40" ry="50" fill="%23fecaca"/%3E%3Ccircle cx="90" cy="75" r="5" fill="%236A4C93"/%3E%3Ccircle cx="110" cy="75" r="5" fill="%236A4C93"/%3E%3Ccircle cx="100" cy="85" r="5" fill="%236A4C93"/%3E%3Ctext x="100" y="190" text-anchor="middle" fill="%236A4C93" font-size="12"%3ESensible%3C/text%3E%3C/svg%3E'
  };
  if (typeName.indexOf('Seca') > -1) return images['Seca'];
  if (typeName.indexOf('Grasa') > -1) return images['Grasa'];
  if (typeName.indexOf('Mixta') > -1) return images['Mixta'];
  if (typeName.indexOf('Sensible') > -1 || typeName.indexOf('Atópica') > -1 || typeName.indexOf('Rosácea') > -1) return images['Sensible'];
  return images['Normal'];
};
QuizApp.prototype.showExperts = function() {
  this.state = 'experts';
  this.render();
};
QuizApp.prototype.startQuiz = function() {
  this.state = 'question';
  this.currentQuestion = 0;
  this.answers = {};
  this.render();
};
QuizApp.prototype.selectOption = function(questionId, value) {
  this.answers[questionId] = value;
  if (this.currentQuestion < quizData.questions.length - 1) { this.currentQuestion++; this.render(); }
  else { this.state = 'loading'; this.render(); }
};
QuizApp.prototype.goBack = function() {
  if (this.currentQuestion <= 0) return;
  var prevQ = quizData.questions[this.currentQuestion];
  delete this.answers[prevQ.id];
  this.currentQuestion--;
  this.render();
};
QuizApp.prototype.finishQuiz = function() {
  var result = skinTypeMapping.calculateType(this.answers);
  var profile = { typeName: result.typeName, concerns: result.concerns, description: result.description, date: new Date().toISOString() };
  Storage.setProfile(profile);
  this.state = 'result';
  this.render();
};
