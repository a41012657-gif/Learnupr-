// ========== openDB corrigé (version consolidée ci-dessus) ==========

// ========== QUIZ MAXA-LIKE ==========
const QUIZ_QUESTIONS = {
  math: [
    {q:"Quelle est la valeur de π (pi) arrondie à 2 décimales ?",c:["3.14","3.12","3.16","3.18"],r:0},
    {q:"Combien font 7 × 8 ?",c:["54","56","58","52"],r:1},
    {q:"Quelle est la racine carrée de 144 ?",c:["11","12","13","14"],r:1},
    {q:"Résoudre : 2x + 6 = 14, x = ?",c:["3","4","5","6"],r:1},
    {q:"Quel est le résultat de 15² ?",c:["200","215","225","235"],r:2},
    {q:"Combien vaut sin(90°) ?",c:["0","0.5","1","√2/2"],r:2},
    {q:"L'aire d'un carré de côté 5 cm est :",c:["10 cm²","20 cm²","25 cm²","30 cm²"],r:2},
    {q:"Combien font 3! (factorielle 3) ?",c:["3","6","9","12"],r:1},
    {q:"Quel est le PGCD de 12 et 18 ?",c:["3","4","6","9"],r:2},
    {q:"Périmètre d'un cercle de rayon 7 cm (π≈3.14) :",c:["43.96 cm","44.96 cm","45.96 cm","46.96 cm"],r:0},
  ],
  francais: [
    {q:"Quel est l'antonyme de 'courageux' ?",c:["Brave","Peureux","Fort","Vaillant"],r:1},
    {q:"Quel est le synonyme de 'rapide' ?",c:["Lent","Paresseux","Vite","Nonchalant"],r:2},
    {q:"Que signifie le préfixe 'anti-' ?",c:["Pour","Contre","Avec","Sans"],r:1},
    {q:"Le passé composé de 'aller' (je) est :",c:["J'allais","Je suis allé","J'irai","J'allai"],r:1},
    {q:"Quel est le pluriel de 'oeil' ?",c:["Oeils","Oeuils","Yeux","Oeilles"],r:2},
    {q:"Un oxymore est :",c:["Une figure de répétition","Une association de mots contradictoires","Une comparaison avec 'comme'","Un récit imaginaire"],r:1},
    {q:"Le sujet de 'Les enfants jouent' est :",c:["jouent","Les","Les enfants","enfants"],r:2},
    {q:"Quel est le féminin de 'acteur' ?",c:["Acteure","Actrice","Acteuse","Actrisse"],r:1},
    {q:"La métaphore est une figure de style :",c:["de répétition","de comparaison sans outil","de substitution","de rythme"],r:1},
    {q:"Conjuguer 'finir' au futur simple, 1re pers. sing. :",c:["Je finis","Je finissais","Je finirai","Je finirais"],r:2},
  ],
  svt: [
    {q:"Quel organe filtre le sang dans le corps humain ?",c:["Poumon","Foie","Rein","Rate"],r:2},
    {q:"La photosynthèse se déroule dans :",c:["La mitochondrie","Le chloroplaste","Le noyau","Le ribosome"],r:1},
    {q:"Combien de chromosomes possède la cellule humaine normale ?",c:["23","44","46","48"],r:2},
    {q:"Quel gaz est produit lors de la photosynthèse ?",c:["CO₂","H₂","O₂","N₂"],r:2},
    {q:"L'ADN est localisé principalement dans :",c:["Le cytoplasme","Les ribosomes","Le noyau","Le réticulum"],r:2},
    {q:"Quel est le rôle des globules rouges ?",c:["Défense immunitaire","Transport de l'oxygène","Coagulation","Digestion"],r:1},
    {q:"La cellule végétale possède en plus (vs animale) :",c:["Des mitochondries","Une membrane plasmique","Une paroi cellulosique","Des ribosomes"],r:2},
    {q:"L'ATP est la molécule énergétique produite par :",c:["Le noyau","La membrane","Les mitochondries","L'appareil de Golgi"],r:2},
    {q:"Quel organe produit l'insuline ?",c:["Foie","Pancréas","Rein","Thyroïde"],r:1},
    {q:"Les êtres procaryotes sont caractérisés par :",c:["Présence d'un noyau","Absence de noyau","Présence de chloroplastes","Présence de mitochondries"],r:1},
  ],
  histoire_geo: [
    {q:"En quelle année l'Afrique a-t-elle connu les indépendances en masse ?",c:["1945","1955","1960","1962"],r:2},
    {q:"Quelle est la capitale du Cameroun ?",c:["Douala","Bafoussam","Garoua","Yaoundé"],r:3},
    {q:"Quel fleuve traverse le Cameroun et se jette dans l'Atlantique ?",c:["Niger","Congo","Sanaga","Benoué"],r:2},
    {q:"La Première Guerre Mondiale a commencé en :",c:["1912","1914","1916","1918"],r:1},
    {q:"Quelle organisation regroupe les pays africains ?",c:["UE","ONU","UA","OTAN"],r:2},
    {q:"Le mont Cameroun culmine à environ :",c:["3000 m","3500 m","4100 m","4700 m"],r:2},
    {q:"Quel pays a colonisé le Cameroun en dernier ?",c:["Portugal","Allemagne","France & Angleterre","Belgique"],r:2},
    {q:"L'ONU a été fondée en :",c:["1939","1945","1950","1955"],r:1},
    {q:"Quelle mer borde le nord de l'Afrique ?",c:["Mer Rouge","Mer Noire","Mer Méditerranée","Mer Arabique"],r:2},
    {q:"Le désert de Sahara est principalement de quel type ?",c:["Désert froid","Désert chaud","Désert côtier","Désert arctique"],r:1},
  ],
  physique: [
    {q:"Quelle est l'unité de la force dans le Système International ?",c:["Joule","Pascal","Newton","Watt"],r:2},
    {q:"Que mesure un voltmètre ?",c:["L'intensité","La résistance","La tension","La puissance"],r:2},
    {q:"La vitesse de la lumière dans le vide est d'environ :",c:["150 000 km/s","200 000 km/s","300 000 km/s","400 000 km/s"],r:2},
    {q:"La loi d'Ohm est : U = ?",c:["R/I","I/R","R+I","R×I"],r:3},
    {q:"Quel est l'état de la matière où les molécules sont les plus agitées ?",c:["Solide","Liquide","Gaz","Plasma"],r:2},
    {q:"L'unité de la puissance électrique est :",c:["Volt","Ampère","Ohm","Watt"],r:3},
    {q:"Quelle formule donne l'énergie cinétique ?",c:["E=mc²","Ec=½mv²","F=ma","P=mv"],r:1},
    {q:"Un son de fréquence 20 Hz est :",c:["Ultrason","Infrason","Audiofréquence","Micro-onde"],r:1},
    {q:"La pression atmosphérique normale est de :",c:["1 atm","2 atm","0.5 atm","10 atm"],r:0},
    {q:"La résistance R d'un conducteur s'exprime en :",c:["Volts","Ampères","Ohms","Watts"],r:2},
  ],
};
// Questions génériques (quand aucune matière spécifique sélectionnée)
QUIZ_QUESTIONS[""] = [
  ...QUIZ_QUESTIONS.math.slice(0,3),
  ...QUIZ_QUESTIONS.svt.slice(0,3),
  ...QUIZ_QUESTIONS.francais.slice(0,3),
  ...QUIZ_QUESTIONS.histoire_geo.slice(0,1),
];

let quizState = {
  questions: [], current: 0, score: 0,
  nbQuestions: 5, timerVal: 30, timerInterval: null,
  matiere: "", answered: false
};
let quizHistory = JSON.parse(localStorage.getItem("quizHistory") || "[]");
let planningData = JSON.parse(localStorage.getItem("planningData") || "[]");
let planDaysSelected = [];
let progData = JSON.parse(localStorage.getItem("progData") || "{}");

function switchQuizSubTab(tab, btn) {
  document.querySelectorAll(".quiz-subtab").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  ["quiz","prog","plan","sim"].forEach(t => {
    const el = document.getElementById("qsec-"+t);
    if (el) el.style.display = t === tab ? "block" : "none";
  });
  if (tab === "prog") renderProgression();
  if (tab === "plan") renderPlanning();
  if (tab === "sim") initSimulateur();
  if (tab === "quiz") renderQuizHistory();
}

function setQuizNb(n, btn) {
  if (!checkPremium() && n > FREE_LIMITS.QUIZ_MAX_QUESTIONS) {
    openPremiumGate("quiz");
    return;
  }
  quizState.nbQuestions = n;
  document.querySelectorAll(".quiz-nb-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
}

// ========== PANNEAU "PLUS" (Quiz / Planning / Simulateur / Progression&Badges / Forum) ==========
// Correspondance section du panneau → sous-onglet interne de la page Quiz existante.
const PLUS_SUBTAB_MAP = { quiz: "quiz", planning: "plan", simulateur: "sim", badges: "prog" };

function ouvrirPlusPanel() {
  const premium = checkPremium();
  // Gratuit : Quiz (5 combos) + Forum (10 questions/jour) ont un accès partiel = 2/5.
  // Planning, Simulateur et Progression/Badges sont 100% Premium.
  const compteurEl = document.getElementById("plusPanelCompteur");
  if (compteurEl) {
    compteurEl.textContent = premium ? "⭐ Premium — 5/5 débloquées" : "🆓 Gratuit — 2/5 débloquées";
  }
  ["planning", "simulateur", "badges"].forEach(s => {
    const lock = document.getElementById("plus-lock-" + s);
    if (lock) {
      lock.innerHTML = premium
        ? `<span style="color:var(--t3);font-size:14px">›</span>`
        : `<span style="font-size:9px;font-weight:800;background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1A1530;padding:3px 7px;border-radius:8px;white-space:nowrap">⭐ Premium</span>`;
    }
  });
  const quizSub = document.getElementById("plus-quiz-sub");
  if (quizSub) {
    quizSub.textContent = premium
      ? "Illimité — membre Premium"
      : `${quizUnlockedCombos.length}/${FREE_LIMITS.QUIZ_FREE_COMBOS_MAX} combinaisons débloquées`;
  }
  document.getElementById("plusPanelModal")?.classList.add("show");
}

function fermerPlusPanel() {
  document.getElementById("plusPanelModal")?.classList.remove("show");
}

function ouvrirDepuisPlus(section) {
  fermerPlusPanel();
  if (typeof showPage === "function") showPage("main");
  if (section === "forum") {
    showTab("forum");
    return;
  }
  showTab("quiz");
  const subtab = PLUS_SUBTAB_MAP[section] || "quiz";
  const btn = document.getElementById("qst-" + subtab);
  if (btn) switchQuizSubTab(subtab, btn);
}


// ========== CHRONO GLOBAL QUIZ ==========
function _demarrerChronoGlobal() {
  // Arrêter un éventuel chrono précédent
  if (quizState.timerInterval) { clearTimeout(quizState.timerInterval); quizState.timerInterval = null; }
  if (!quizState.timerGen) quizState.timerGen = 0;
  quizState.timerGen++;
  const myGen = quizState.timerGen;

  const t0 = quizState.timerVal; // temps total en secondes
  const chronoEl = document.getElementById("quiz-chrono");
  const CIRC = 119.4;

  if (!t0) {
    // Pas de limite de temps
    if (chronoEl) { chronoEl.textContent = "∞"; chronoEl.style.color = "var(--p)"; }
    const ringI = document.getElementById("quiz-chrono-ring");
    if (ringI) { ringI.style.strokeDashoffset = "0"; ringI.style.stroke = "var(--border)"; }
    return;
  }

  if (chronoEl) { chronoEl.textContent = t0; chronoEl.style.color = "var(--p)"; }
  const ringEl = document.getElementById("quiz-chrono-ring");
  if (ringEl) { ringEl.style.strokeDashoffset = "0"; ringEl.style.stroke = "var(--p)"; }

  const startPerf = performance.now();
  let lastShown = t0;

  function _globalTick() {
    if (quizState.timerGen !== myGen) return; // quiz terminé ou relancé

    const elapsed = (performance.now() - startPerf) / 1000;
    const remaining = Math.max(0, t0 - elapsed);
    const remainingInt = Math.ceil(remaining);

    // Mise à jour affichage chaque seconde
    if (remainingInt !== lastShown) {
      lastShown = remainingInt;
      const col = remainingInt <= 10 ? "var(--red)" : remainingInt <= 20 ? "var(--gold)" : "var(--p)";
      if (chronoEl) { chronoEl.textContent = remainingInt; chronoEl.style.color = col; }
      const ring = document.getElementById("quiz-chrono-ring");
      if (ring) {
        ring.style.strokeDashoffset = String(CIRC * (1 - remaining / t0));
        ring.style.stroke = col;
      }
    }

    if (remaining <= 0) {
      // Temps écoulé — terminer le quiz automatiquement
      quizState.timerInterval = null;
      if (chronoEl) { chronoEl.textContent = "0"; chronoEl.style.color = "var(--red)"; }
      const ring = document.getElementById("quiz-chrono-ring");
      if (ring) { ring.style.strokeDashoffset = String(CIRC); ring.style.stroke = "var(--red)"; }
      // Si une question est en cours sans réponse, montrer la bonne réponse
      if (!quizState.answered) {
        quizState.answered = true;
        const q = quizState.questions[quizState.current];
        const choices = document.querySelectorAll(".quiz-choice");
        if (q && choices[q.r]) choices[q.r].classList.add("correct");
        choices.forEach(c => c.classList.add("disabled"));
        const fb = document.getElementById("quiz-feedback");
        if (fb) {
          fb.style.display = "block";
          fb.style.background = "#fdecea";
          fb.style.color = "#c62828";
          fb.textContent = "⏱ Temps écoulé !";
        }
      }
      setTimeout(() => terminerQuiz(), 1200);
      return;
    }

    const nextSecondAt = (t0 - (remainingInt - 1)) * 1000;
    const delay = Math.max(10, nextSecondAt - (performance.now() - startPerf));
    quizState.timerInterval = setTimeout(_globalTick, Math.min(delay, 250));
  }
  quizState.timerInterval = setTimeout(_globalTick, 0);
}

function lancerQuiz() {
  const classe   = document.getElementById("quiz-classe")?.value   || "";
  const mat      = document.getElementById("quiz-matiere")?.value  || "";
  const chapitre = document.getElementById("quiz-chapitre")?.value || "";
  const timerInput = parseInt(document.getElementById("quiz-timer").value);

  // Gratuit : 5 combinaisons classe+matière+chapitre distinctes à vie, au-delà → Premium
  if (!_quizComboAutorisee(classe, mat, chapitre)) {
    openPremiumGate("quiz");
    return;
  }

  quizState.matiere = mat;
  quizState.timerVal = timerInput;
  quizState.score = 0;
  quizState.current = 0;
  quizState.answered = false;

  // Questions custom filtrées par classe + matière + chapitre
  const custom = customQuizQuestions.filter(q =>
    _quizClasseMatch(q.classe, classe) &&
    (!mat      || q.matiere  === mat)      &&
    (!chapitre || q.chapitre === chapitre)
  );

  // Questions built-in (uniquement si pas de filtre classe/chapitre)
  const builtIn = (!classe && !chapitre) ? (QUIZ_QUESTIONS[mat] || (mat ? [] : QUIZ_QUESTIONS[""])) : [];

  const allQ = [...custom, ...builtIn].filter(q =>
    q && Array.isArray(q.c) && q.c.length === 4 &&
    Number.isInteger(Number(q.r)) && Number(q.r) >= 0 && Number(q.r) <= 3
  );
  if (!allQ.length) {
    const matLabel = mat ? (NOMS_MATIERES[mat]||mat) : "cette matière";
    const chapLabel = chapitre ? ` — ${chapitre}` : "";
    const classeLabel = classe ? ` en ${classe}` : "";
    showToast(`❌ Aucune question disponible pour ${matLabel}${chapLabel}${classeLabel}. Demande à un modérateur d'en ajouter.`, "error");
    return;
  }
  const shuffled = [...allQ].sort(() => Math.random() - 0.5);
  // Fix 85 : mélanger aussi l'ordre des choix de réponse
  quizState.questions = shuffled.slice(0, Math.min(quizState.nbQuestions, shuffled.length)).map(q => {
    const indices = [0,1,2,3].sort(() => Math.random() - 0.5);
    const newChoices = indices.map(i => q.c[i]);
    const newCorrect = indices.indexOf(Number(q.r));
    return { ...q, c: newChoices, r: newCorrect };
  });
  quizState.label = [classe, mat ? (NOMS_MATIERES[mat]||mat) : "", chapitre].filter(Boolean).join(" · ") || "Général";

  document.getElementById("quiz-home").style.display = "none";
  document.getElementById("quiz-result").style.display = "none";
  document.getElementById("quiz-game").style.display = "block";

  // ── Démarrer le chrono GLOBAL pour tout le quiz ──
  _demarrerChronoGlobal();
  afficherQuestion();
}

function afficherQuestion() {
  const q = quizState.questions[quizState.current];
  if (!q) { terminerQuiz(); return; }
  quizState.answered = false;
  const total = quizState.questions.length;
  const idx = quizState.current;

  document.getElementById("quiz-progress-txt").textContent = `Question ${idx+1}/${total}`;
  document.getElementById("quiz-prog-bar").style.width = `${((idx+1)/total)*100}%`;
  document.getElementById("quiz-question").textContent = q.q;
  document.getElementById("quiz-feedback").style.display = "none";
  document.getElementById("quiz-next-btn").style.display = "none";

  const choicesEl = document.getElementById("quiz-choices");
  choicesEl.innerHTML = "";
  q.c.forEach((ch, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-choice";
    btn.textContent = ch;
    btn.onclick = () => repondreQuiz(i, btn, q.r);
    choicesEl.appendChild(btn);
  });

  // Chrono géré globalement — rien à faire ici
}

function repondreQuiz(idx, btn, correct) {
  if (quizState.answered) return;
  quizState.answered = true;
  // Le chrono continue — il est global pour tout le quiz

  // Logger pour mode révision
  if (!quizState._answersLog) quizState._answersLog = [];
  const q = quizState.questions[quizState.current];
  quizState._answersLog.push({ q, correct: idx === correct });

  const choices = document.querySelectorAll(".quiz-choice");
  choices.forEach(c => c.classList.add("disabled"));

  const fb = document.getElementById("quiz-feedback");
  fb.style.display = "block";
  if (idx === correct) {
    quizState.score++;
    btn.classList.add("correct");
    fb.style.background = "linear-gradient(135deg,#d1fae5,#ecfdf5)";
    fb.style.color = "#065F46";
    // Afficher explication si disponible
    const expl = q && q.explication ? `<div style="margin-top:6px;font-weight:600;font-size:11px;opacity:0.85">💡 ${q.explication}</div>` : "";
    fb.innerHTML = `<span>✅ Bonne réponse !</span>${expl}`;
  } else {
    btn.classList.add("wrong");
    if (choices[correct]) choices[correct].classList.add("correct");
    fb.style.background = "linear-gradient(135deg,#fee2e2,#fff1f2)";
    fb.style.color = "#991B1B";
    const expl = q && q.explication ? `<div style="margin-top:6px;font-weight:600;font-size:11px;opacity:0.85">💡 ${q.explication}</div>` : "";
    fb.innerHTML = `<span>❌ La bonne réponse était : <b>${quizState.questions[quizState.current].c[correct]}</b></span>${expl}`;
  }
  document.getElementById("quiz-next-btn").style.display = "block";
}

function quizNextQuestion() {
  quizState.answered = false;
  quizState.current++;

  if (quizState.current >= quizState.questions.length) {
    terminerQuiz();
  } else {
    afficherQuestion();
  }
}

function terminerQuiz() {
  // Arrêter le chrono global
  if (quizState.timerGen) quizState.timerGen++;
  if (quizState.timerInterval) {
    clearTimeout(quizState.timerInterval);
    quizState.timerInterval = null;
  }
  const total = quizState.questions.length;
  const score = quizState.score;
  const pct = Math.round((score/total)*100);

  // Sauvegarder
  quizHistory.unshift({
    date: new Date().toLocaleDateString("fr-FR"),
    score, total, pct,
    matiere: quizState.label || quizState.matiere || "Général"
  });
  if (quizHistory.length > 10) quizHistory.pop();
  localStorage.setItem("quizHistory", JSON.stringify(quizHistory));

  const progKey = quizState.label || quizState.matiere || "generale";
  if (!progData[progKey]) progData[progKey] = { played: 0, totalScore: 0, totalQ: 0 };
  progData[progKey].played++;
  progData[progKey].totalScore += score;
  progData[progKey].totalQ += total;
  localStorage.setItem("progData", JSON.stringify(progData));
  sauvegarderProgressionTurso(progKey, score, total);

  // Fix Bug 2 : S'assurer que le conteneur parent quiz est bien visible
  const quizTab = document.getElementById("t-quiz");
  if (quizTab) quizTab.style.display = "flex";
  const quizSec = document.getElementById("qsec-quiz");
  if (quizSec) quizSec.style.display = "block";

  // Cacher le jeu, afficher le résultat
  const gameEl = document.getElementById("quiz-game");
  const resultEl = document.getElementById("quiz-result");
  const homeEl = document.getElementById("quiz-home");
  if (gameEl) gameEl.style.display = "none";
  if (homeEl) homeEl.style.display = "none";
  if (resultEl) {
    resultEl.style.display = "block";
    resultEl.style.visibility = "visible";
    resultEl.style.opacity = "1";
  }

  const scoreEl = document.getElementById("quiz-result-score");
  const emojiEl = document.getElementById("quiz-result-emoji");
  const msgEl   = document.getElementById("quiz-result-msg");

  if (scoreEl) scoreEl.textContent = `${score}/${total}`;
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : pct >= 40 ? "😐" : "📚";
  const msg   = pct >= 80 ? "Excellent travail !" : pct >= 60 ? "Bien joué !" : pct >= 40 ? "Continue les efforts !" : "Révise encore un peu !";
  if (emojiEl) emojiEl.textContent = emoji;
  if (msgEl)   msgEl.textContent   = `${pct}% de réussite — ${msg}`;

  // Conseils + streak + questions ratées
  setTimeout(() => afficherConseilApresQuiz(quizState.matiere || "generale", pct), 200);
  renderStreak();
  setTimeout(drawScoresChart, 100);
  if (quizState._answersLog) {
    const ratees = quizState._answersLog.filter(l => !l.correct).map(l => l.q);
    const reussies = quizState._answersLog.filter(l => l.correct).map(l => l.q.id);
    if (ratees.length) _sauvegarderQuestionsRatees(ratees);
    reussies.forEach(id => _retirerQuestionReussie(id));
  }
  setTimeout(updateRevisionBtnVisibility, 200);
  const btnRev = document.getElementById("btn-revision");
  if (btnRev && getMissedQuestions().length > 0) btnRev.style.display = "flex";
}

function rejouerQuiz() {
  if (quizState.timerGen) quizState.timerGen++;
  if (quizState.timerInterval) { clearTimeout(quizState.timerInterval); quizState.timerInterval = null; }
  document.getElementById("quiz-result").style.display = "none";
  lancerQuiz();
}

function retourQuizHome() {
  document.getElementById("quiz-result").style.display = "none";
  document.getElementById("quiz-game").style.display = "none";
  document.getElementById("quiz-home").style.display = "block";
  renderQuizHistory();
}

function renderQuizHistory() {
  // Refresh premium state on quiz buttons
  const premium = checkPremium();
  const lock10 = document.getElementById("quizLock10");
  const lock20 = document.getElementById("quizLock20");
  if (lock10) lock10.style.display = premium ? "none" : "inline";
  if (lock20) lock20.style.display = premium ? "none" : "inline";
  // Si l'utilisateur gratuit avait sélectionné 10 ou 20, reset à 5
  if (!premium && quizState.nbQuestions > FREE_LIMITS.QUIZ_MAX_QUESTIONS) {
    quizState.nbQuestions = FREE_LIMITS.QUIZ_MAX_QUESTIONS;
    document.querySelectorAll(".quiz-nb-btn").forEach(b => b.classList.remove("active"));
    document.querySelector(".quiz-nb-btn")?.classList.add("active");
  }
  // Afficher bannière premium dans quiz home si gratuit
  const banner = document.getElementById("quiz-premium-banner");
  if (banner) banner.style.display = premium ? "none" : "block";

  const el = document.getElementById("quiz-history-list");
  const statTotal = document.getElementById("quiz-stat-total");
  const statScore = document.getElementById("quiz-stat-score");
  if (statTotal) statTotal.textContent = quizHistory.length;
  if (statScore) {
    const best = quizHistory.length ? Math.max(...quizHistory.map(h => h.pct)) : 0;
    statScore.textContent = best + "%";
  }
  if (!el) return;
  if (!quizHistory.length) { el.innerHTML = '<div style="text-align:center;color:var(--t3);font-size:12px;padding:10px">Aucun quiz joué</div>'; return; }
  el.innerHTML = quizHistory.slice(0,5).map(h => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:700;font-size:12px">${h.matiere}</div>
        <div style="font-size:10px;color:var(--t3)">${h.date}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:800;font-size:13px;color:${h.pct>=60?'var(--p)':'var(--red)'}">${h.score}/${h.total}</div>
        <div style="font-size:10px;color:var(--t3)">${h.pct}%</div>
      </div>
    </div>`).join("");
}

// ===== PROGRESSION =====
// Gratuit : aperçu limité (graphe 5 dernières entrées, stats basiques, 2 badges simples).
// Premium : graphe 15 dernières entrées, stats détaillées, tous les badges.
// (Avant : verrou total qui empêchait même l'aperçu prévu — corrigé.)
function renderProgression() {
  const lockScreen = document.getElementById("prog-lock-screen");
  const contentWrap = document.getElementById("prog-content-wrap");
  if (lockScreen) lockScreen.style.display = "none";
  if (contentWrap) contentWrap.style.display = "block";

  const el = document.getElementById("prog-matieres-list");
  const badges = document.getElementById("prog-badges");
  // Graphique + Streak
  renderStreak();
  setTimeout(drawScoresChart, 50);
  if (!el) return;

  const mats = Object.keys(progData);
  if (!mats.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--t3);font-size:12px;padding:20px">📊 Joue des quiz pour voir ta progression !</div>';
    if (badges) badges.innerHTML = '<div style="color:var(--t3);font-size:12px">Aucun badge encore</div>';
    return;
  }

  const premium = checkPremium();

  // Stats de base (gratuites)
  el.innerHTML = mats.map(mat => {
    const d = progData[mat];
    const pct = Math.round((d.totalScore / d.totalQ) * 100);
    const label = mat === "generale" ? "Toutes matières" : (NOMS_MATIERES[mat] || mat);
    return `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px">
          <div style="font-weight:700;font-size:12px">${label}</div>
          <div style="font-weight:800;font-size:12px;color:${pct>=60?'var(--p)':'var(--red)'}">${pct}%</div>
        </div>
        <div class="prog-mat-bar"><div class="prog-mat-fill" style="width:${pct}%"></div></div>
        ${premium
          ? `<div style="font-size:10px;color:var(--t3);margin-top:3px">${d.played} quiz · ${d.totalScore}/${d.totalQ} bonnes réponses · Moy. ${pct}%</div>`
          : `<div style="font-size:10px;color:var(--t3);margin-top:3px">${d.played} quiz joués</div>`
        }
      </div>`;
  }).join("");

  if (!badges) return;

  if (!premium) {
    // Gratuit : badges basiques seulement
    const basicBadges = [];
    const totalQ = Object.values(progData).reduce((s,d) => s+d.totalQ, 0);
    if (totalQ >= 10) basicBadges.push({e:"🎯",t:"Débutant",s:"10 questions"});
    if (quizHistory.length >= 5) basicBadges.push({e:"🏅",t:"Joueur",s:"5 quiz"});

    badges.innerHTML = `
      <div style="width:100%;margin-bottom:10px">
        ${basicBadges.map(b => `<div style="display:inline-flex;align-items:center;gap:6px;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:8px 12px;margin:4px">
          <span style="font-size:20px">${b.e}</span><div><div style="font-weight:800;font-size:10px;color:var(--p)">${b.t}</div><div style="font-size:9px;color:var(--t3)">${b.s}</div></div></div>`).join("")}
        ${!basicBadges.length ? '<div style="color:var(--t3);font-size:12px">Joue pour débloquer des badges !</div>' : ''}
      </div>
      <div onclick="openPremiumGate('badges')" style="background:linear-gradient(135deg,var(--gold),var(--gold2));border-radius:14px;padding:12px;cursor:pointer;text-align:center;width:100%">
        <div style="color:white;font-weight:900;font-size:12px">🏆 Badges spéciaux disponibles en Premium</div>
        <div style="color:rgba(255,255,255,0.75);font-size:10px;margin-top:4px">Roi des Quiz · Prêt pour le BAC · Expert · Perfectionniste...</div>
      </div>`;
    return;
  }

  // Premium : tous les badges
  const allBadges = [];
  const totalQ = Object.values(progData).reduce((s,d) => s+d.totalQ, 0);
  const totalScore = Object.values(progData).reduce((s,d) => s+d.totalScore, 0);
  if (totalQ >= 10)  allBadges.push({e:"🎯",t:"Débutant",s:"10 questions"});
  if (totalQ >= 50)  allBadges.push({e:"🔥",t:"Assidu",s:"50 questions"});
  if (totalQ >= 100) allBadges.push({e:"⭐",t:"Expert",s:"100 questions"});
  if (quizHistory.length >= 5) allBadges.push({e:"🏅",t:"Joueur",s:"5 quiz"});
  if (quizHistory.some(h=>h.pct===100)) allBadges.push({e:"🏆",t:"Parfait",s:"Score 100%"});
  if (totalQ >= 10 && totalScore/totalQ >= 0.8) allBadges.push({e:"💡",t:"Brillant",s:"80%+ de moy."});
  // Badges spéciaux premium
  const earned = calculerBadges ? calculerBadges() : [];
  earned.forEach(b => { if (!allBadges.find(x=>x.t===b.titre)) allBadges.push({e:b.emoji,t:b.titre,s:"⭐ Premium"}); });

  badges.innerHTML = allBadges.length
    ? allBadges.map(b => `<div style="background:linear-gradient(135deg,var(--bg),var(--card));border:1px solid var(--border);border-radius:12px;padding:10px 12px;text-align:center;min-width:70px"><div style="font-size:24px">${b.e}</div><div style="font-weight:800;font-size:10px;color:var(--p);margin-top:2px">${b.t}</div><div style="font-size:9px;color:var(--t3)">${b.s}</div></div>`).join("")
    : '<div style="color:var(--t3);font-size:12px">Joue plus pour débloquer des badges !</div>';
}

// ===== PLANNING =====
function togglePlanDay(btn) {
  const day = btn.getAttribute("data-day");
  if (planDaysSelected.includes(day)) {
    planDaysSelected = planDaysSelected.filter(d => d !== day);
    btn.classList.remove("selected");
  } else {
    planDaysSelected.push(day);
    btn.classList.add("selected");
  }
}

function ajouterPlanItem() {
  const mat = document.getElementById("plan-matiere").value.trim();
  const dur = parseInt(document.getElementById("plan-duree").value) || 30;
  const heure = document.getElementById("plan-heure")?.value || "";
  if (!mat) { showToast("❌ Indique la matière", "error"); return; }
  if (!planDaysSelected.length) { showToast("❌ Sélectionne au moins un jour", "error"); return; }

  // Limite gratuit : 3 sessions max
  if (!checkPremium() && planningData.length >= FREE_LIMITS.PLANNING_MAX_SESSIONS) {
    openPremiumGate("planning");
    return;
  }
  const newItem = { id: Date.now(), matiere: mat, duree: dur, jours: [...planDaysSelected], heure, done: [] };
  planningData.push(newItem);
  localStorage.setItem("planningData", JSON.stringify(planningData));
  // Fix 15 : sync Turso
  sauvegarderPlanningTurso(newItem).then(tursoId => {
    if (tursoId) { newItem.id = tursoId; localStorage.setItem("planningData", JSON.stringify(planningData)); }
  });
  // Garder les jours sélectionnés, vider seulement matière et durée
  document.getElementById("plan-matiere").value = "";
  document.getElementById("plan-duree").value = "";
  renderPlanning();
  showToast("✅ Session ajoutée au planning !", "success");
  // Re-planifier immédiatement les rappels (sans attendre la prochaine ouverture de l'app)
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    _planifierTousRappels();
  }
  // Bug 5: Re-apply selected class on day buttons (keep selection)
  document.querySelectorAll(".plan-day-btn").forEach(b => {
    if (planDaysSelected.includes(b.getAttribute("data-day"))) {
      b.classList.add("selected");
    }
  });
}

function supprimerPlanItem(id) {
  if (!confirm("Supprimer cette session du planning ?")) return;
  planningData = planningData.filter(p => p.id !== id);
  localStorage.setItem("planningData", JSON.stringify(planningData));
  supprimerPlanningTurso(id);
  renderPlanning();
  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    _planifierTousRappels();
  }
}

function renderPlanning() {
  const lockScreen = document.getElementById("plan-lock-screen");
  const contentWrap = document.getElementById("plan-content-wrap");
  const premium = checkPremium();
  if (!premium) {
    if (lockScreen) lockScreen.style.display = "block";
    if (contentWrap) contentWrap.style.display = "none";
    return;
  }
  if (lockScreen) lockScreen.style.display = "none";
  if (contentWrap) contentWrap.style.display = "block";

  const el = document.getElementById("planning-list");
  if (!el) return;
  // NOTE : FREE_LIMITS.PLANNING_MAX_SESSIONS n'est plus utilisé pour bloquer l'accès
  // (Planning est désormais 100% Premium, verrouillé plus haut) — conservé pour compat
  // si une autre partie du code s'y référait encore.
  if (!planningData.length) {
    el.innerHTML = '<div style="text-align:center;color:var(--t3);font-size:12px;padding:20px">📭 Aucune session planifiée</div>';
    return;
  }
  const jours = ["Lu","Ma","Me","Je","Ve","Sa","Di"];
  el.innerHTML = planningData.map(p => `
    <div class="plan-item">
      <div class="plan-item-ico">📅</div>
      <div class="plan-item-info">
        <div class="plan-item-title">${esc(p.matiere)}</div>
        <div class="plan-item-sub">${p.jours.join(", ")} · ${p.duree} min${p.heure ? " · ⏰ " + esc(p.heure) : ""}</div>
      </div>
      <button class="plan-item-del" onclick="supprimerPlanItem(${p.id})">🗑️</button>
    </div>`).join("");
}

// ===== SIMULATEUR DE NOTES AMÉLIORÉ =====
let simRows = [];

const COEFS_DEFAUT = {
  "Mathématiques":5,"Français":4,"Anglais":3,"SVT":3,
  "Physique":3,"Chimie":2,"Histoire-Géo":2,"Philosophie":2,
  "Informatique":1,"ECM":1,"Espagnol":2,"Sport":1
};

function initSimulateur() {
  const lockScreen = document.getElementById("sim-lock-screen");
  const contentWrap = document.getElementById("sim-content-wrap");
  if (!checkPremium()) {
    if (lockScreen) lockScreen.style.display = "block";
    if (contentWrap) contentWrap.style.display = "none";
    return;
  }
  if (lockScreen) lockScreen.style.display = "none";
  if (contentWrap) contentWrap.style.display = "block";

  const saved = localStorage.getItem("simRows");
  if (saved) {
    try { simRows = JSON.parse(saved); } catch(e) { simRows = []; }
  }
  if (!simRows.length) {
    simRows = [
      {mat:"Mathématiques", note:"", coef:5},
      {mat:"Français",      note:"", coef:4},
      {mat:"Anglais",       note:"", coef:3},
      {mat:"SVT",           note:"", coef:3},
    ];
  }
  renderSimRows();
}

function renderSimRows() {
  const el = document.getElementById("sim-rows");
  if (!el) return;
  el.innerHTML = simRows.map((r, i) => `
    <div style="display:flex;gap:5px;align-items:center;margin-bottom:6px">
      <input placeholder="Matière" value="${esc(String(r.mat||''))}"
        oninput="simRows[${i}].mat=this.value;saveSimRows()"
        style="flex:2;padding:9px 10px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg);font-size:16px;font-weight:700;color:var(--text);outline:none">
      <input type="text" inputmode="decimal" placeholder="/20" value="${r.note}"
        oninput="
          let raw=this.value.replace(',','.');
          let v=parseFloat(raw);
          if(raw===''||isNaN(v)){simRows[${i}].note='';saveSimRows();return;}
          v=Math.min(20,Math.max(0,v));
          simRows[${i}].note=v;saveSimRows();calculerMoyenne();"
        style="width:50px;flex:none;padding:9px 6px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg);font-size:16px;font-weight:700;color:var(--text);outline:none;text-align:center">
      <select onchange="simRows[${i}].coef=parseInt(this.value);saveSimRows();calculerMoyenne()"
        style="width:52px;flex:none;padding:8px 4px;border-radius:10px;border:1.5px solid var(--p);background:var(--bg);font-size:16px;font-weight:800;color:var(--p);outline:none;cursor:pointer;text-align:center">
        ${[1,2,3,4,5,6,7,8,9,10].map(n=>`<option value="${n}"${parseInt(r.coef)===n?' selected':''}>${n}</option>`).join('')}
      </select>
      <button onclick="supprimerSimRow(${i})" aria-label="Supprimer"
        style="background:none;border:none;font-size:15px;cursor:pointer;padding:5px;color:var(--red);flex-shrink:0">✕</button>
    </div>`).join("");
}

function saveSimRows() {
  localStorage.setItem("simRows", JSON.stringify(simRows));
}

function ajouterSimRow() {
  simRows.push({mat:"", note:"", coef:1});
  renderSimRows();
}

// Feat 4 / 11 : Ajouter matière personnalisée
function ajouterMatPersonnalisee() {
  if (!checkPremium()) { openPremiumGate("mat_perso"); return; }
  const mat = prompt("📚 Nom de la matière (ex: Sport, Musique) :");
  if (!mat || !mat.trim()) return;
  const coefStr = prompt("Coefficient (1-10) :", "1");
  const coef = Math.min(10, Math.max(1, parseInt(coefStr)||1));
  simRows.push({mat: mat.trim(), note:"", coef});
  saveSimRows(); renderSimRows();
  showToast("✅ Matière ajoutée", "success");
}

// Feat 4 : Reset coefficients par défaut
function resetCoefsDefaut() {
  simRows = simRows.map(r => ({ ...r, coef: COEFS_DEFAUT[r.mat] || r.coef }));
  saveSimRows(); renderSimRows(); calculerMoyenne();
  showToast("✅ Coefficients réinitialisés", "success");
}

function supprimerSimRow(i) {
  simRows.splice(i, 1);
  renderSimRows();
  calculerMoyenne();
}

function calculerMoyenne() {
  let totalCoef = 0, totalPoints = 0, valid = 0;
  simRows.forEach(r => {
    // Bug 1 : accepter virgule ET point
    const noteStr = String(r.note || "").replace(",", ".");
    const note = parseFloat(noteStr);
    const coef = parseFloat(r.coef) || 1;
    if (!isNaN(note) && note >= 0 && note <= 20) {
      totalPoints += note * coef;
      totalCoef += coef;
      valid++;
    }
  });
  const resEl = document.getElementById("sim-result");
  const mentEl = document.getElementById("sim-mention");
  if (!resEl) return;
  if (!valid || !totalCoef) {
    resEl.textContent = "—";
    if (mentEl) mentEl.textContent = "Saisis tes notes";
    return;
  }
  const moy = totalPoints / totalCoef;
  resEl.textContent = moy.toFixed(2);
  let mention = "";
  if (moy >= 16) mention = "🏆 Mention Très Bien";
  else if (moy >= 14) mention = "🥈 Mention Bien";
  else if (moy >= 12) mention = "👍 Mention Assez Bien";
  else if (moy >= 10) mention = "✅ Admis";
  else mention = "❌ Insuffisant — courage !";
  if (mentEl) mentEl.textContent = mention;
}

// Feat 1 : Export relevé de notes
async function exporterReleve() {
  if (!checkPremium()) { openPremiumGate("export"); return; }
  const moy = document.getElementById("sim-result")?.textContent;
  if (!moy || moy === "—") { showToast("❌ Calcule d'abord ta moyenne", "error"); return; }
  const mention = document.getElementById("sim-mention")?.textContent || "";
  const pseudo = localStorage.getItem("userPseudo") || localStorage.getItem("userPhone") || "Élève";
  const date = new Date().toLocaleDateString("fr-FR");
  const rows = simRows.filter(r => r.note !== "" && !isNaN(parseFloat(String(r.note).replace(",","."))));
  const rowsHtml = rows.map(r => {
    const n = parseFloat(String(r.note).replace(",","."));
    const color = n >= 10 ? "#059669" : "#E53935";
    return `<tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e0ece0;font-weight:600">${esc(r.mat)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e0ece0;text-align:center;font-weight:800;color:${color}">${n}/20</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e0ece0;text-align:center;color:#888">×${r.coef}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e0ece0;text-align:center;font-weight:700;color:${color}">${(n*r.coef).toFixed(1)}</td>
    </tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
  <title>Relevé de notes — ${esc(pseudo)}</title>
  <style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a;max-width:600px;margin:0 auto}
  h1{color:#059669}table{width:100%;border-collapse:collapse;margin-top:20px}
  th{background:#059669;color:white;padding:10px 12px;text-align:left}
  .total td{background:#f0f9f4;font-weight:900;font-size:15px;padding:12px}
  .mention{font-size:22px;font-weight:900;text-align:center;margin-top:24px;color:#059669}
  .footer{text-align:center;color:#aaa;font-size:11px;margin-top:32px;border-top:1px solid #eee;padding-top:12px}
  </style></head><body>
  <h1>📊 Relevé de notes simulé</h1>
  <p>Élève : <strong>${esc(pseudo)}</strong> &nbsp;|&nbsp; Date : <strong>${date}</strong></p>
  <table>
    <tr><th>Matière</th><th>Note/20</th><th>Coef</th><th>Points</th></tr>
    ${rowsHtml}
    <tr class="total"><td colspan="3">MOYENNE GÉNÉRALE</td><td style="color:#059669;font-size:18px">${moy}/20</td></tr>
  </table>
  <div class="mention">${mention}</div>
  <div class="footer">Généré par LearnUpr · ${date}<br>
  ⚠️ Document de simulation — non officiel</div></body></html>`;
  const blob = new Blob([html], {type:"text/html"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `releve_${pseudo}_${date.replace(/\//g,"-")}.html`;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  showToast("✅ Relevé exporté !", "success");
}

// ========== QUIZ CUSTOM — PANEL MODO ==========
// Structure: customQuizQuestions = [ { id, classe, matiere, chapitre, q, c:[...], r } ]
let customQuizQuestions = JSON.parse(localStorage.getItem("customQuizQuestionsV2") || "[]");

// Initialiser les selects Classe dans le panel modo et chez l'élève
function initQuizSelects() {
  // BUG 2 FIX: Only run when DOM is ready and elements exist
  const testEl = document.getElementById("qf-classe") || document.getElementById("quiz-classe");
  if (!testEl) {
    // Retry after a short delay if elements don't exist yet
    setTimeout(initQuizSelects, 100);
    return;
  }
  // Selects à peupler avec les classes
  ["qf-classe", "quiz-classe", "qf-filter-classe", "csv-force-classe"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    const isFilter = id.includes("filter");
    const isPlayer = id === "quiz-classe";
    const isCsvForce = id === "csv-force-classe";
    el.innerHTML = `<option value="">— ${isCsvForce ? "Classe du CSV" : isFilter ? "Toutes les classes" : isPlayer ? "Toutes les classes" : "Choisir la classe"} —</option>`;
    (isCsvForce ? CLASSES : classesVisibles()).forEach(c => {
      const opt = document.createElement("option");
      opt.value = c; opt.textContent = c;
      if (c === cur) opt.selected = true;
      el.appendChild(opt);
    });
  });

  // Pré-remplir matières du formulaire modo (qf-matiere) selon classe actuelle
  qfUpdateMatieres();
  // Pré-remplir matières filtre
  qfFilterUpdateMatieres();
  // Pré-remplir matières player
  quizUpdateMatieres();
}

function qfUpdateMatieres() {
  // BUG 2 FIX: Guard against missing DOM elements
  const classeEl = document.getElementById("qf-classe");
  const sel = document.getElementById("qf-matiere");
  if (!classeEl || !sel) return;
  const classe = classeEl.value;
  sel.innerHTML = '<option value="">— Choisir la matière —</option>';
  const mats = classe ? (MATIERES_PAR_CLASSE[classe] || []) : MATIERES;
  mats.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m; opt.textContent = NOMS_MATIERES[m] || m;
    sel.appendChild(opt);
  });
}

function quizUpdateMatieres() {
  const classeEl = document.getElementById("quiz-classe");
  const sel = document.getElementById("quiz-matiere");
  if (!classeEl || !sel) return;
  const classe = classeEl.value;
  sel.innerHTML = '<option value="">— Toutes les matières —</option>';

  // Toutes les matières de la classe (ou toutes si pas de classe)
  const classMats = classe ? (MATIERES_PAR_CLASSE[classe] || MATIERES) : MATIERES;

  // Matières ayant des questions (custom ou built-in)
  const matsAvecQuestions = new Set();
  customQuizQuestions.forEach(q => {
    if (_quizClasseMatch(q.classe, classe)) matsAvecQuestions.add(q.matiere);
  });
  if (typeof QUIZ_QUESTIONS !== "undefined") {
    Object.keys(QUIZ_QUESTIONS).forEach(m => { if (m) matsAvecQuestions.add(m); });
  }

  // Afficher TOUTES les matières de la classe (pas seulement celles avec questions)
  classMats.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = (NOMS_MATIERES[m] || m.replace(/_/g," ")) + (matsAvecQuestions.has(m) ? "" : " (aucune question)");
    sel.appendChild(opt);
  });

  // Reset chapitre
  const chapEl = document.getElementById("quiz-chapitre");
  if (chapEl) chapEl.innerHTML = '<option value="">— Tous les chapitres —</option>';
}

function quizUpdateChapitres() {
  const classe = document.getElementById("quiz-classe").value;
  const mat = document.getElementById("quiz-matiere").value;
  const sel = document.getElementById("quiz-chapitre");
  sel.innerHTML = '<option value="">— Tous les chapitres —</option>';
  if (!mat) return;
  const chaps = new Set();
  customQuizQuestions.forEach(q => {
    if (_quizClasseMatch(q.classe, classe) && (!mat || q.matiere === mat) && q.chapitre)
      chaps.add(q.chapitre);
  });
  chaps.forEach(ch => {
    const opt = document.createElement("option");
    opt.value = ch; opt.textContent = ch;
    sel.appendChild(opt);
  });
}

function qfFilterUpdateMatieres() {
  // BUG 2 FIX: Guard against missing DOM elements
  const classeEl = document.getElementById("qf-filter-classe");
  if (!classeEl) return;
  const classe = classeEl.value;
  const sel = document.getElementById("qf-filter-mat");
  sel.innerHTML = '<option value="">Toutes les matières</option>';
  const mats = new Set();
  customQuizQuestions.forEach(q => { if (_quizClasseMatch(q.classe, classe)) mats.add(q.matiere); });
  mats.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m; opt.textContent = NOMS_MATIERES[m] || m;
    sel.appendChild(opt);
  });
  // Update chapitres aussi
  const selC = document.getElementById("qf-filter-chap");
  selC.innerHTML = '<option value="">Tous les chapitres</option>';
  const chaps = new Set();
  customQuizQuestions.forEach(q => { if (_quizClasseMatch(q.classe, classe)) chaps.add(q.chapitre); });
  chaps.forEach(ch => {
    if (!ch) return;
    const opt = document.createElement("option");
    opt.value = ch; opt.textContent = ch;
    selC.appendChild(opt);
  });
  // Update sources (lots CSV) aussi
  qfFilterUpdateSources();
}

// Peupler le filtre des lots/sources (imports CSV) dans le panel admin quiz
function qfFilterUpdateSources() {
  const sel = document.getElementById("qf-filter-source");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">📂 Tous les imports (manuel + CSV)</option>';
  const sources = new Set();
  customQuizQuestions.forEach(q => { if (q.source) sources.add(q.source); });
  [...sources].sort().forEach(s => {
    const count = customQuizQuestions.filter(q => q.source === s).length;
    const opt = document.createElement("option");
    opt.value = s; opt.textContent = `📄 ${s} (${count})`;
    sel.appendChild(opt);
  });
  if (sources.has(current)) sel.value = current;
  toggleSupprLotBtn();
}

function toggleSupprLotBtn() {
  const sel = document.getElementById("qf-filter-source");
  const btn = document.getElementById("btn-suppr-lot-csv");
  if (!sel || !btn) return;
  btn.style.display = sel.value ? "block" : "none";
}

function supprimerLotSelectionne() {
  const sel = document.getElementById("qf-filter-source");
  if (!sel || !sel.value) { showToast("❌ Sélectionne d'abord un lot CSV", "error"); return; }
  supprimerImportCSV(sel.value);
}


function supprimerQuizQuestion(id) {
  if (!confirm("Supprimer cette question définitivement ?")) return;
  customQuizQuestions = customQuizQuestions.filter(q => q.id !== id);
  localStorage.setItem("customQuizQuestionsV2", JSON.stringify(customQuizQuestions));
  supprimerQuizDeTurso(id);
  renderQuizAdminList();
  showToast("🗑️ Question supprimée");
}

let quizSelectionMode = false;
let quizSelectedIds = new Set();

function toggleQuizSelectionMode() {
  quizSelectionMode = !quizSelectionMode;
  quizSelectedIds.clear();
  renderQuizAdminList();
}

function toggleQuizSelection(id, cb) {
  if (cb.checked) quizSelectedIds.add(id);
  else quizSelectedIds.delete(id);
  const btn = document.getElementById("btn-suppr-selection");
  if (btn) btn.textContent = `🗑️ Supprimer (${quizSelectedIds.size})`;
}

function selectionnerTout() {
  const el = document.getElementById("quiz-admin-list");
  const fClasse = document.getElementById("qf-filter-classe")?.value || "";
  const fMat    = document.getElementById("qf-filter-mat")?.value   || "";
  const fChap   = document.getElementById("qf-filter-chap")?.value  || "";
  const filtered = customQuizQuestions.filter(q =>
    _quizClasseMatch(q.classe, fClasse) &&
    (!fMat    || q.matiere === fMat)   &&
    (!fChap   || q.chapitre === fChap)
  );
  filtered.forEach(q => quizSelectedIds.add(q.id));
  el.querySelectorAll("input[type=checkbox]").forEach(cb => cb.checked = true);
  const btn = document.getElementById("btn-suppr-selection");
  if (btn) btn.textContent = `🗑️ Supprimer (${quizSelectedIds.size})`;
}

async function supprimerSelection() {
  if (!quizSelectedIds.size) { showToast("❌ Aucune question sélectionnée", "error"); return; }
  if (!confirm(`Supprimer ${quizSelectedIds.size} question(s) ? Cette action est irréversible.`)) return;
  const ids = [...quizSelectedIds];
  customQuizQuestions = customQuizQuestions.filter(q => !quizSelectedIds.has(q.id));
  localStorage.setItem("customQuizQuestionsV2", JSON.stringify(customQuizQuestions));
  for (const id of ids) { await supprimerQuizDeTurso(id); }
  quizSelectedIds.clear();
  quizSelectionMode = false;
  showToast(`✅ ${ids.length} question(s) supprimée(s)`, "success");
  renderQuizAdminList();
}

function renderQuizAdminList() {
  const el = document.getElementById("quiz-admin-list");
  if (!el) return;
  qfFilterUpdateSources();
  const fClasse = document.getElementById("qf-filter-classe")?.value || "";
  const fMat    = document.getElementById("qf-filter-mat")?.value   || "";
  const fChap   = document.getElementById("qf-filter-chap")?.value  || "";
  const fSource = document.getElementById("qf-filter-source")?.value || "";

  const filtered = customQuizQuestions.filter(q =>
    _quizClasseMatch(q.classe, fClasse) &&
    (!fMat    || q.matiere === fMat)   &&
    (!fChap   || q.chapitre === fChap) &&
    (!fSource || q.source === fSource)
  );

  // Barre d'outils sélection
  const toolbar = `
    <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
      <div style="font-size:11px;color:var(--t2);font-weight:700;flex:1">${filtered.length} question(s)</div>
      ${quizSelectionMode ? `
        <button onclick="selectionnerTout()" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;color:var(--text)">☑️ Tout</button>
        <button id="btn-suppr-selection" onclick="supprimerSelection()" style="background:var(--red);color:white;border:none;border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer">🗑️ Supprimer (0)</button>
        <button onclick="toggleQuizSelectionMode()" style="background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer;color:var(--t2)">✕ Annuler</button>
      ` : `
        <button onclick="toggleQuizSelectionMode()" style="background:linear-gradient(135deg,var(--red),#C62828);color:white;border:none;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:800;cursor:pointer">☑️ Sélectionner</button>
      `}
    </div>`;

  if (!filtered.length) {
    el.innerHTML = toolbar + '<div class="empty-state">Aucune question pour ces filtres</div>';
    return;
  }

  el.innerHTML = toolbar + filtered.map(q => `
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px;border:1px solid var(--border);${quizSelectionMode && quizSelectedIds.has(q.id) ? 'border-color:var(--red);background:rgba(239,68,68,0.05)' : ''}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        ${quizSelectionMode ? `<input type="checkbox" ${quizSelectedIds.has(q.id) ? 'checked' : ''} onchange="toggleQuizSelection(${q.id},this)" style="margin-top:4px;width:18px;height:18px;flex-shrink:0;cursor:pointer;accent-color:var(--red)">` : ''}
        <div style="flex:1">
          <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:5px">
            <span style="background:var(--p);color:white;font-size:9px;font-weight:800;padding:2px 7px;border-radius:8px">${_quizClasseAffichage(q.classe)}</span>
            <span style="background:var(--a);color:white;font-size:9px;font-weight:800;padding:2px 7px;border-radius:8px">${NOMS_MATIERES[q.matiere]||q.matiere}</span>
            <span style="background:var(--gold2);color:white;font-size:9px;font-weight:800;padding:2px 7px;border-radius:8px">${q.chapitre}</span>
          </div>
          <div style="font-size:12px;font-weight:700;line-height:1.5;margin-bottom:6px">${q.q}</div>
          ${q.c.map((ch,i)=>`<div style="font-size:11px;color:${i===q.r?'var(--p)':'var(--t2)'};font-weight:${i===q.r?'800':'500'}">${i===q.r?'✅':'○'} ${ch}</div>`).join("")}
        </div>
        ${!quizSelectionMode ? `<button onclick="supprimerQuizQuestion(${q.id})" style="background:var(--red);color:white;border:none;border-radius:8px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer;flex-shrink:0">🗑️</button>` : ''}
      </div>
    </div>`).join("");
}

// ========== PSEUDONYME ==========
function afficherPseudoSection() {
  const phone = localStorage.getItem("userPhone");
  const section = document.getElementById("pseudoSection");
  if (!section) return;
  if (phone) {
    section.style.display = "block";
    const pseudo = localStorage.getItem("userPseudo") || "";
    document.getElementById("pseudoInput").value = pseudo;
  } else {
    section.style.display = "none";
  }
}

async function changerPseudo() {
  const input = document.getElementById("pseudoInput");
  const pseudo = input.value.trim().replace(/[<>]/g, "");
  if (!pseudo) { showToast("❌ Pseudonyme vide", "error"); return; }
  if (pseudo.length < 2) { showToast("❌ Minimum 2 caractères", "error"); return; }
  if (!/^[a-zA-Z0-9_\-\.éèêëàâùûüîïçœæ ]+$/.test(pseudo)) {
    showToast("❌ Caractères non autorisés", "error"); return;
  }
  const ok = await sauvegarderPseudo(pseudo);
  if (ok) {
    document.getElementById("profilNom").textContent = pseudo;
    showToast("✅ Pseudonyme enregistré !", "success");
  } else {
    showToast("❌ Erreur — réessaie", "error");
  }
}

// ========== SIGNALEMENT ==========
let signalContenuId = null;
let signalTypeActuel = "contenu_inapproprie";

function ouvrirSignalement(contenuId) {
  signalContenuId = contenuId;
  document.getElementById("signalMessage").value = "";
  document.querySelectorAll(".signal-type-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('.signal-type-btn[data-type="contenu_inapproprie"]')?.classList.add("active");
  signalTypeActuel = "contenu_inapproprie";
  const modal = document.getElementById("signalModal");
  modal.style.display = "flex";
}

function fermerSignalement() {
  document.getElementById("signalModal").style.display = "none";
}

function selectSignalType(btn) {
  document.querySelectorAll(".signal-type-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  signalTypeActuel = btn.getAttribute("data-type");
}

async function soumettreSignalement() {
  const message = document.getElementById("signalMessage").value.trim();
  // Anti-spam : max 3 signalements en 5 minutes
  const now = Date.now();
  const signalLog = JSON.parse(localStorage.getItem("signalLog") || "[]")
    .filter(t => now - t < 5 * 60 * 1000);
  if (signalLog.length >= 3) {
    showToast("⏳ Trop de signalements — attends 5 minutes", "error");
    return;
  }
  signalLog.push(now);
  localStorage.setItem("signalLog", JSON.stringify(signalLog));

  const ok = await envoyerSignalement(signalContenuId, signalTypeActuel, message);
  fermerSignalement();
  showToast(ok ? "✅ Signalement envoyé aux modérateurs" : "✅ Signalement enregistré localement", "success");
}

// Exposer currentContenuId pour le bouton signaler
let currentContenuId = null;

// ========== ANTI-SPAM CONTRIBUTIONS ==========
function verifierAntiSpam() {
  const phone = localStorage.getItem("userPhone");
  if (!phone) return true; // Pas connecté → géré ailleurs
  const now = Date.now();
  const key = "contribSpam_" + phone;
  const log = JSON.parse(localStorage.getItem(key) || "[]")
    .filter(t => now - t < 60 * 60 * 1000); // fenêtre 1h
  if (log.length >= 5) {
    showToast("⏳ Limite atteinte : 5 contributions/heure. Réessaie plus tard.", "error");
    return false;
  }
  log.push(now);
  localStorage.setItem(key, JSON.stringify(log));
  return true;
}

// ========== MODE EXAMEN ANTI-TRICHE ==========
const EXAM_CODE_KEY = "examCode";
const DEFAULT_EXAM_CODE = "1234";

function lancerModeExamen() {
  const storedCode = localStorage.getItem(EXAM_CODE_KEY) || DEFAULT_EXAM_CODE;
  const codeParent = prompt(`🏫 Mode Examen\n\nDéfinir un code parent (4 chiffres) pour déverrouiller :\n(Actuel : ${storedCode === DEFAULT_EXAM_CODE ? "par défaut" : "personnalisé"})\n\nAppuie sur OK pour confirmer le code actuel, ou entre un nouveau code :`);
  if (codeParent === null) return; // Annulé
  if (codeParent && /^[0-9]{4}$/.test(codeParent)) {
    localStorage.setItem(EXAM_CODE_KEY, codeParent);
  } else if (codeParent && codeParent !== "") {
    showToast("❌ Code invalide — doit être 4 chiffres", "error");
    return;
  }
  // Activer le mode examen
  window.modeExamen = true;
  document.body.classList.add("mode-examen");
  localStorage.setItem("modeExamen", "1");
  document.getElementById("modeExamenOverlay").style.display = "block";
  // Rester sur l'accueil pour accéder aux cours/examens normalement
  showTab("accueil");
  showToast("🏫 Mode Examen activé — Quiz et Forum désactivés", "info");
}

function desactiverModeExamen() {
  const input = document.getElementById("examCodeInput").value;
  const code = localStorage.getItem(EXAM_CODE_KEY) || DEFAULT_EXAM_CODE;
  const errEl = document.getElementById("examCodeError");
  if (input === code) {
    window.modeExamen = false;
    document.body.classList.remove("mode-examen");
    localStorage.removeItem("modeExamen");
    document.getElementById("modeExamenOverlay").style.display = "none";
    errEl.style.display = "none";
    showToast("✅ Mode Examen désactivé", "success");
  } else {
    errEl.style.display = "block";
    document.getElementById("examCodeInput").value = "";
    setTimeout(() => errEl.style.display = "none", 3000);
  }
}

// Restaurer mode examen au rechargement
if (localStorage.getItem("modeExamen") === "1") {
  window.modeExamen = true;
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("mode-examen");
    document.getElementById("modeExamenOverlay").style.display = "block";
  });
}

// BUG 9 FIX: Synchronisation automatique au retour en ligne
window.addEventListener("online", async () => {
  showToast("🌐 Connexion rétablie — synchronisation...", "info");
  if (typeof initTurso === "function") await initTurso();
  if (typeof syncContenuDepuisTurso === "function") await syncContenuDepuisTurso();
  if (typeof syncQuizDepuisTurso === "function") await syncQuizDepuisTurso();
  if (typeof renderContent === "function") renderContent();
  const offBanner = document.getElementById("offBanner");
  if (offBanner) offBanner.classList.remove("show");
});
window.addEventListener("offline", () => {
  const offBanner = document.getElementById("offBanner");
  if (offBanner) offBanner.classList.add("show");
});

// ========== QUIZ HORS LIGNE ==========
// Stocker les questions custom dans IndexedDB pour accès offline
const QUIZ_OFFLINE_STORE = "quiz_offline";

async function sauvegarderQuizHorsLigne() {
  return new Promise((resolve) => {
    const req = indexedDB.open("learnupr_quiz", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(QUIZ_OFFLINE_STORE)) {
        db.createObjectStore(QUIZ_OFFLINE_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(QUIZ_OFFLINE_STORE, "readwrite");
      const store = tx.objectStore(QUIZ_OFFLINE_STORE);
      // Vider et remettre toutes les questions
      store.clear();
      customQuizQuestions.forEach(q => store.put(q));
      tx.oncomplete = () => { db.close(); resolve(true); };
      tx.onerror = () => { db.close(); resolve(false); };
    };
    req.onerror = () => resolve(false);
  });
}

async function chargerQuizHorsLigne() {
  return new Promise((resolve) => {
    const req = indexedDB.open("learnupr_quiz", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(QUIZ_OFFLINE_STORE)) {
        db.createObjectStore(QUIZ_OFFLINE_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => {
      const db = e.target.result;
      const tx = db.transaction(QUIZ_OFFLINE_STORE, "readonly");
      const store = tx.objectStore(QUIZ_OFFLINE_STORE);
      const all = store.getAll();
      all.onsuccess = () => { db.close(); resolve(all.result || []); };
      all.onerror = () => { db.close(); resolve([]); };
    };
    req.onerror = () => resolve([]);
  });
}


// Si pas de connexion Turso, charger depuis IndexedDB
async function chargerQuizInitial() {
  if (turso) {
    await syncQuizDepuisTurso();
  } else {
    const offline = await chargerQuizHorsLigne();
    if (offline.length > 0) {
      customQuizQuestions = offline;
      localStorage.setItem("customQuizQuestionsV2", JSON.stringify(offline));
      showToast(`📱 ${offline.length} questions quiz chargées hors ligne`, "info");
    }
  }
  await sauvegarderQuizHorsLigne();
}

// ========== CONSENTEMENT RGPD (Fix 19) ==========
function initConsent() {
  if (!localStorage.getItem("consentAccepte")) {
    setTimeout(() => {
      const banner = document.getElementById("consentBanner");
      if (banner) banner.style.display = "block";
    }, 1500);
  }
}
function accepterConsent() {
  localStorage.setItem("consentAccepte", "1");
  localStorage.setItem("consentDate", new Date().toISOString());
  const banner = document.getElementById("consentBanner");
  if (banner) banner.style.display = "none";
  showToast("✅ Consentement enregistré", "success");
}
function refuserConsent() {
  const banner = document.getElementById("consentBanner");
  if (banner) banner.style.display = "none";
  showToast("ℹ️ Certaines fonctions nécessitent ton accord", "info");
}

// ========== MENTIONS LÉGALES / CGU (Fixes 29-34) ==========
const LEGAL_CONTENT = {
  cgu: {
    title: "📜 Conditions Générales d'Utilisation",
    content: `
      <h3 style="color:var(--p);margin-bottom:8px">1. Présentation</h3>
      <p>LearnUpr est une application éducative destinée aux élèves du secondaire au Cameroun. Elle est éditée à titre privé et non commercial dans un cadre d'entraide scolaire.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">2. Accès et utilisation</h3>
      <p>L'accès est réservé aux élèves et enseignants. L'utilisateur s'engage à ne pas publier de contenu illicite, diffamatoire ou contraire aux bonnes mœurs.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">3. Âge minimum (Fix 32)</h3>
      <p>LearnUpr est destiné aux utilisateurs de <strong>13 ans et plus</strong>. Les utilisateurs de moins de 13 ans doivent obtenir l'autorisation parentale avant utilisation.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">4. Contenus et droits d'auteur (Fix 33)</h3>
      <p>Les cours et examens partagés sur LearnUpr sont soumis aux droits d'auteur de leurs auteurs respectifs. LearnUpr ne revendique aucun droit sur ces contenus. Toute reproduction commerciale est interdite.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">5. Clause de non-responsabilité (Fix 34)</h3>
      <p>LearnUpr est un outil d'aide à la révision. <strong>Aucune garantie de résultats aux examens officiels</strong> ne peut être donnée. Les performances scolaires dépendent du travail personnel de l'élève.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">6. Modération (Fix 31)</h3>
      <p>Les contenus publiés sont modérés avant publication. LearnUpr se réserve le droit de supprimer tout contenu inapproprié. L'éditeur ne saurait être tenu responsable des contenus publiés par les utilisateurs avant modération.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">7. Abonnement et remboursement (Fix 30)</h3>
      <p>L'abonnement Premium est au prix de 500 FCFA/mois. <strong>Droit de rétractation :</strong> tout abonnement peut être annulé dans les 7 jours suivant l'activation. Contacte l'admin via WhatsApp pour un remboursement.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">8. Loi applicable</h3>
      <p>Les présentes CGU sont régies par le droit camerounais. Tout litige sera soumis à la compétence des tribunaux de Dschang, Cameroun.</p>
    `
  },
  confidentialite: {
    title: "🔒 Politique de Confidentialité",
    content: `
      <h3 style="color:var(--p);margin-bottom:8px">Données collectées</h3>
      <p>LearnUpr collecte uniquement : ton numéro WhatsApp (identifiant), ton pseudonyme (optionnel), tes contributions scolaires.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">Utilisation des données</h3>
      <p>Tes données servent exclusivement à gérer ton compte, synchroniser ta progression et afficher ton classement. Elles ne sont <strong>jamais vendues</strong> à des tiers.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">Stockage</h3>
      <p>Les données sont stockées dans une base sécurisée (Turso/LibSQL) hébergée aux États-Unis. Le stockage local (localStorage/IndexedDB) est utilisé pour le mode hors ligne.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">Droit à l'oubli</h3>
      <p>Tu peux supprimer ton compte à tout moment depuis Profil → Supprimer mon compte. Toutes tes données seront effacées dans un délai de 30 jours.</p>
      <h3 style="color:var(--p);margin:12px 0 8px">Contact</h3>
      <p>Pour toute question sur tes données, contacte l'administrateur via WhatsApp.</p>
    `
  },
  mentions: {
    title: "📋 Mentions Légales",
    content: `
      <p><strong>Éditeur :</strong> LearnUpr — Application éducative privée</p>
      <p><strong>Créateur / Fondateur :</strong> Djoumessi Kouanang Alex Albert</p>
      <p><strong>Établissement :</strong> Lycée du Manengouba, Cameroun</p>
      <p><strong>Contact :</strong> Via WhatsApp (numéro admin)</p>
      <p><strong>Hébergement :</strong> Cloudflare Pages (application) — Turso (base de données)</p>
      <p><strong>Nature :</strong> Application à but non lucratif d'entraide scolaire</p>
      <p style="margin-top:12px;color:var(--t3);font-size:11px">Conformément à la loi camerounaise n°2010/012 relative à la cybersécurité et à la cybercriminalité, et au Règlement Général sur la Protection des Données (RGPD) de l'Union Européenne appliqué à titre volontaire.</p>
    `
  }
};

function ouvrirLegal(type) {
  const data = LEGAL_CONTENT[type];
  if (!data) return;
  document.getElementById("legalTitle").textContent = data.title;
  document.getElementById("legalContent").innerHTML = data.content;
  document.getElementById("legalModal").style.display = "flex";
}
function fermerLegal() {
  document.getElementById("legalModal").style.display = "none";
}

// ========== SUPPRESSION COMPTE (Fix 20) ==========
async function supprimerMonCompte() {
  const phone = localStorage.getItem("userPhone");
  if (!phone) { showToast("❌ Tu n'es pas connecté", "error"); return; }
  if (!confirm(`⚠️ Supprimer définitivement ton compte ?\n\nNuméro : ${phone}\n\nToutes tes données seront effacées. Cette action est irréversible.`)) return;
  const confirme = prompt("Pour confirmer, tape SUPPRIMER :");
  if (confirme !== "SUPPRIMER") { showToast("❌ Suppression annulée", "info"); return; }

  // Supprimer de Turso
  if (turso) {
    try {
      await turso.execute({ sql: "DELETE FROM utilisateurs WHERE phone=?", args: [phone] });
      await turso.execute({ sql: "UPDATE users SET role='deleted', phone=? WHERE phone=?",
        args: ["deleted_" + Date.now(), phone] });
    } catch(e) {}
  }
  // Supprimer localStorage
  ["userPhone","userRole","userPseudo","isPremium","contribSpam_"+phone,"adminPwdHash"].forEach(k => localStorage.removeItem(k));
  showToast("✅ Compte supprimé — à bientôt !", "success");
  setTimeout(() => { updateProfilStatus(); showTab("accueil"); }, 1500);
}

// Fix 25 : _embeddedCfg null — fallback robuste
function getCfgSafe() {
  if (_embeddedCfg) return _embeddedCfg;
  // Tenter de relire depuis localStorage
  try {
    const raw = localStorage.getItem(_CFG_KEY);
    if (raw) return JSON.parse(_decodeFallback(raw));
  } catch(e) {}
  return null;
}

// Accéder à un champ de config (pour l'upload ZIP)
function _getCfg(key) {
  const cfg = getCfgSafe();
  return cfg ? (cfg[key] || null) : null;
}
