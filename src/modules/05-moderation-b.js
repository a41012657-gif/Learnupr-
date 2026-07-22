// ========== GUIDE DE FONCTIONNEMENT ==========
const GUIDE_SECTIONS = {
  debut: `
    <h3 style="color:var(--p);margin-bottom:10px">🚀 Comment démarrer</h3>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:10px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">1️⃣ Se connecter</div>
      <p>Va dans l'onglet <strong>Profil</strong> et entre ton numéro WhatsApp à 9 chiffres. Tu recevras une notification sur WhatsApp confirmant ta connexion.</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:10px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">2️⃣ Choisir sa classe</div>
      <p>Sur l'accueil, sélectionne ta classe (6ème, 5ème, ... Tle C, Tle D, etc.) via les onglets horizontaux.</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:10px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">3️⃣ Naviguer</div>
      <p><strong>🏠 Accueil</strong> — Cours et examens<br>
         <strong>🧠 Quiz</strong> — Questions de révision<br>
         <strong>🔔 Notifs</strong> — Tes notifications<br>
         <strong>👤 Profil</strong> — Compte et paramètres</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">4️⃣ Mode hors ligne</div>
      <p>Appuie sur <strong>📥 Sauvegarder</strong> dans un cours pour y accéder sans internet. Va dans l'onglet <strong>📥 Sauvegardés</strong> pour les retrouver.</p>
    </div>
  `,
  contenu: `
    <h3 style="color:var(--p);margin-bottom:10px">📚 Les types de contenu</h3>
    <div style="display:flex;flex-direction:column;gap:8px">
      <div style="background:var(--bg);border-radius:12px;padding:12px;border-left:3px solid var(--p)">
        <div style="font-weight:800;font-size:12px">📚 Cours</div>
        <p style="margin-top:4px">Fiches de révision structurées par matière et chapitre. Certains sont gratuits, d'autres nécessitent le Premium.</p>
      </div>
      <div style="background:var(--bg);border-radius:12px;padding:12px;border-left:3px solid var(--gold)">
        <div style="font-weight:800;font-size:12px">📋 Séquentielles</div>
        <p style="margin-top:4px">Épreuves de contrôle séquentiel passées au lycée. Utile pour s'entraîner.</p>
      </div>
      <div style="background:var(--bg);border-radius:12px;padding:12px;border-left:3px solid var(--red)">
        <div style="font-weight:800;font-size:12px">🏆 Examens officiels</div>
        <p style="margin-top:4px">Sujets du BAC et examens officiels. Archive complète par année et matière.</p>
      </div>
      <div style="background:var(--bg);border-radius:12px;padding:12px;border-left:3px solid var(--p2)">
        <div style="font-weight:800;font-size:12px">🔥 La Zone / Compétences</div>
        <p style="margin-top:4px">Exercices d'application et fiches de compétences ciblées.</p>
      </div>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-top:10px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">📤 Contribuer</div>
      <p>Tu peux partager tes cours via <strong>Profil → Contribuer</strong>. Après validation par un modérateur, ton document sera visible par tous. 10 contributions approuvées = 1 semaine Premium offerte !</p>
    </div>
  `,
  quiz: `
    <h3 style="color:var(--p);margin-bottom:10px">🧠 Fonctionnement des Quiz</h3>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">Lancer un quiz</div>
      <p>1. Choisis ta <strong>classe</strong><br>2. Choisis la <strong>matière</strong><br>3. Choisis le <strong>chapitre</strong> (optionnel)<br>4. Règle le nombre de questions et le chrono<br>5. Lance !</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;color:var(--gold2);margin-bottom:6px">⚡ Révision Express</div>
      <p>Lance 10 questions aléatoires de toutes les matières en un clic. Idéal pour une révision rapide !</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">📊 Progression</div>
      <p>Tes scores sont sauvegardés par matière et synchronisés sur tous tes appareils autorisés. Des badges sont débloqués selon tes performances.</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">💡 Conseils automatiques</div>
      <p>Si tu as moins de 60% à un quiz, l'app te propose automatiquement un conseil de révision et un cours lié.</p>
    </div>
  `,
  premium: `
    <h3 style="color:var(--gold2);margin-bottom:10px">⭐ Accès Premium</h3>
    <div style="background:linear-gradient(135deg,var(--gold),var(--gold2));border-radius:14px;padding:16px;color:white;margin-bottom:12px">
      <div style="font-weight:900;font-size:18px">500 FCFA / mois</div>
      <div style="font-size:11px;opacity:0.85;margin-top:4px">Accès illimité à tout le contenu</div>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">✅ Ce que tu obtiens</div>
      <p>• Tous les cours sans restriction<br>• Toutes les séquentielles<br>• Tous les examens officiels<br>• Quiz illimités avec statistiques<br>• Sauvegarde hors ligne illimitée</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">💳 Comment s'abonner</div>
      <p>1. Va dans <strong>Profil → S'abonner</strong><br>2. Envoie <strong>500 FCFA</strong> via Mobile Money<br>3. Envoie le reçu à l'admin WhatsApp<br>4. Reçois ton code Premium et entre-le dans l'app</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">🎁 Premium gratuit</div>
      <p>Contribute 10 cours validés par les modérateurs et reçois 1 semaine de Premium offerte automatiquement !</p>
    </div>
  `,
  securite: `
    <h3 style="color:var(--p);margin-bottom:10px">🔒 Sécurité et confidentialité</h3>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">📱 Liaison appareil</div>
      <p>Ton compte est lié à <strong>cet appareil uniquement</strong>. Si tu changes de téléphone, contacte l'admin pour transférer ton compte.</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">🔔 Notifications de connexion</div>
      <p>À chaque connexion, tu reçois une notification WhatsApp. Si ce n'est pas toi, contacte immédiatement l'admin.</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">🗑️ Supprimer mon compte</div>
      <p>Va dans <strong>Profil → Supprimer mon compte</strong>. Toutes tes données seront effacées dans les 30 jours.</p>
    </div>
    <div style="background:var(--bg);border-radius:12px;padding:12px">
      <div style="font-weight:800;font-size:12px;color:var(--p);margin-bottom:6px">🛡️ Protection du contenu</div>
      <p>Les cours et examens sont protégés contre la copie et la capture d'écran. Le contenu éducatif est la propriété de ses auteurs.</p>
    </div>
    <div style="background:rgba(229,57,53,0.08);border-radius:12px;padding:12px;border:1px solid var(--red);margin-top:10px">
      <div style="font-weight:800;font-size:12px;color:var(--red);margin-bottom:6px">⚠️ En cas de problème</div>
      <p>Contacte l'admin via WhatsApp au <strong>+237 674 106 410</strong></p>
    </div>
  `
};

function ouvrirGuide(section = "debut") {
  const modal = document.getElementById("guideModal");
  if (!modal) return;
  modal.style.display = "flex";
  switchGuideTab(section, modal.querySelector(".guide-tab"));
}

function fermerGuide() {
  const modal = document.getElementById("guideModal");
  if (modal) modal.style.display = "none";
}

function switchGuideTab(section, btn) {
  document.getElementById("guideContent").innerHTML = GUIDE_SECTIONS[section] || "";
  document.querySelectorAll(".guide-tab").forEach(b => {
    b.style.color = "var(--t2)";
    b.style.borderBottomColor = "transparent";
    b.style.fontWeight = "600";
  });
  if (btn) {
    btn.style.color = "var(--p)";
    btn.style.borderBottomColor = "var(--p)";
    btn.style.fontWeight = "700";
  }
}

// ========== GESTION APPAREILS (Admin) ==========
function ouvrirDeviceMgr() {
  const role = localStorage.getItem("userRole");
  if (role !== "admin") { showToast("❌ Accès admin uniquement", "error"); return; }
  document.getElementById("deviceMgrModal").style.display = "flex";
  document.getElementById("deviceMgrResult").innerHTML = '<div style="text-align:center;color:var(--t3);font-size:12px;padding:20px">Entre un numéro pour voir ses appareils</div>';
}

function fermerDeviceMgr() {
  document.getElementById("deviceMgrModal").style.display = "none";
}

async function rechercherAppareilUser() {
  const phone = document.getElementById("deviceMgrPhone").value.trim();
  if (!phone || !/^[0-9]{9}$/.test(phone)) { showToast("❌ Numéro invalide", "error"); return; }
  const el = document.getElementById("deviceMgrResult");
  el.innerHTML = '<div style="text-align:center;color:var(--t3);padding:20px">⏳ Recherche...</div>';

  if (!turso) { el.innerHTML = '<div style="color:var(--red);padding:14px">❌ Turso non connecté</div>'; return; }

  try {
    const res = await turso.execute({
      sql: "SELECT * FROM device_sessions WHERE phone=? ORDER BY last_seen DESC",
      args: [phone]
    });
    const userRes = await turso.execute({
      sql: "SELECT device_id, role, is_premium FROM users WHERE phone=?",
      args: [phone]
    });

    if (!res.rows.length) {
      el.innerHTML = `<div style="text-align:center;color:var(--t3);padding:20px">Aucun appareil enregistré pour ${phone}</div>`;
      return;
    }

    const primaryDevice = userRes.rows[0]?.device_id || "";
    el.innerHTML = res.rows.map(row => `
      <div style="background:var(--bg);border-radius:12px;padding:12px;margin-bottom:8px;border:1px solid ${row.device_id === primaryDevice ? 'var(--p)' : 'var(--border)'}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
          <div>
            <div style="font-weight:800;font-size:12px">${row.device_label || "Appareil inconnu"}</div>
            <div style="font-size:10px;color:var(--t3);margin-top:2px">Dernière activité: ${row.last_seen ? new Date(row.last_seen).toLocaleDateString("fr-FR") : "—"}</div>
            <div style="font-size:9px;color:var(--t3);word-break:break-all">${String(row.device_id).slice(0,16)}...</div>
          </div>
          <span style="background:${row.device_id === primaryDevice ? 'var(--p)' : 'var(--border)'};color:${row.device_id === primaryDevice ? 'white' : 'var(--t2)'};font-size:9px;font-weight:800;padding:3px 8px;border-radius:8px">${row.device_id === primaryDevice ? '✅ Principal' : '🔗 Autorisé'}</span>
        </div>
        <div style="display:flex;gap:6px">
          <button onclick="revoquerAppareil('${phone}','${row.device_id}')"
            style="flex:1;background:var(--red);color:white;border:none;border-radius:10px;padding:8px;font-weight:800;font-size:11px;cursor:pointer">🗑️ Révoquer</button>
          ${row.device_id !== primaryDevice ? `<button onclick="definirAppareilPrincipal('${phone}','${row.device_id}')"
            style="flex:1;background:var(--p);color:white;border:none;border-radius:10px;padding:8px;font-weight:800;font-size:11px;cursor:pointer">⭐ Définir principal</button>` : ""}
        </div>
      </div>`).join("") +
      `<button onclick="reinitialiserAppareils('${phone}')"
        style="width:100%;margin-top:8px;background:rgba(229,57,53,0.1);border:1px solid var(--red);border-radius:12px;padding:12px;font-weight:800;font-size:12px;cursor:pointer;color:var(--red)">
        🔄 Réinitialiser tous les appareils
      </button>`;
  } catch(e) {
    el.innerHTML = `<div style="color:var(--red);padding:14px">❌ Erreur: ${e.message}</div>`;
  }
}

async function revoquerAppareil(phone, deviceId) {
  if (!confirm(`Révoquer cet appareil pour ${phone} ?`)) return;
  if (!turso) return;
  try {
    await turso.execute({ sql: "DELETE FROM device_sessions WHERE phone=? AND device_id=?", args: [phone, deviceId] });
    showToast("✅ Appareil révoqué", "success");
    rechercherAppareilUser();
  } catch(e) { showToast("❌ Erreur", "error"); }
}

async function definirAppareilPrincipal(phone, deviceId) {
  if (!turso) return;
  try {
    await turso.execute({ sql: "UPDATE users SET device_id=? WHERE phone=?", args: [deviceId, phone] });
    showToast("✅ Appareil principal mis à jour", "success");
    rechercherAppareilUser();
  } catch(e) { showToast("❌ Erreur", "error"); }
}

async function reinitialiserAppareils(phone) {
  if (!confirm(`⚠️ Réinitialiser TOUS les appareils de ${phone} ?\n\nL'utilisateur devra se reconnecter.`)) return;
  if (!turso) return;
  try {
    await turso.execute({ sql: "DELETE FROM device_sessions WHERE phone=?", args: [phone] });
    await turso.execute({ sql: "UPDATE users SET device_id='', sms_sent=0 WHERE phone=?", args: [phone] });
    showToast("✅ Appareils réinitialisés — l'utilisateur peut se reconnecter", "success");
    fermerDeviceMgr();
  } catch(e) { showToast("❌ Erreur", "error"); }
}

// ========== SYSTÈME PREMIUM CENTRALISÉ ==========

// Limites gratuites
const FREE_LIMITS = {
  QUIZ_MAX_QUESTIONS: 5,       // Max 5 questions/session (conservé, cumulable avec QUIZ_FREE_COMBOS_MAX)
  QUIZ_FREE_COMBOS_MAX: 5,     // 5 combinaisons classe+matière+chapitre distinctes débloquées à vie (gratuit)
  COURS_MAX_CHAPITRES: 2,      // 2 premiers chapitres/matière
  EXAMENS_MAX: 2,              // 2 premiers examens/classe
  PLANNING_MAX_SESSIONS: 3,    // ancien seuil, non utilisé (Planning est désormais 100% Premium)
};

// Combinaisons quiz (classe|matiere|chapitre) déjà débloquées par cet utilisateur gratuit —
// persistantes à vie (contrairement à quizHistory qui ne garde que les 10 dernières parties).
let quizUnlockedCombos = JSON.parse(localStorage.getItem("quizUnlockedCombos") || "[]");

function _quizComboKey(classe, mat, chapitre) {
  return `${classe || ""}|${mat || ""}|${chapitre || ""}`;
}

// Vérifie si une combinaison est autorisée pour un utilisateur gratuit, et l'enregistre
// comme débloquée si elle est nouvelle et que le quota n'est pas dépassé.
function _quizComboAutorisee(classe, mat, chapitre) {
  if (checkPremium()) return true;
  const key = _quizComboKey(classe, mat, chapitre);
  if (quizUnlockedCombos.includes(key)) return true;
  if (quizUnlockedCombos.length >= FREE_LIMITS.QUIZ_FREE_COMBOS_MAX) return false;
  quizUnlockedCombos.push(key);
  localStorage.setItem("quizUnlockedCombos", JSON.stringify(quizUnlockedCombos));
  return true;
}

// Vérifier si premium (multi-source)
function checkPremium() {
  return isPremium
    || localStorage.getItem("isPremium") === "true"
    || localStorage.getItem("userRole") === "admin"
    || localStorage.getItem("userRole") === "moderator";
}

// Afficher le modal premium avec message personnalisé
function openPremiumGate(feature = "") {
  const msgs = {
    quiz:          "Les quiz de 10 ou 20 questions sont réservés aux membres Premium.",
    revision:      "La Révision Express est une fonctionnalité Premium.",
    conseils:      "Les conseils personnalisés après quiz sont réservés aux membres Premium.",
    export:        "L'export du relevé de notes est réservé aux membres Premium.",
    mat_perso:     "Les matières personnalisées sont réservées aux membres Premium.",
    offline:       "La sauvegarde hors ligne de PDF et images nécessite le Premium.",
    planning:      "Tu as atteint la limite de 3 sessions de planning. Passe au Premium pour des sessions illimitées.",
    examens:       "Accède à tous les examens avec le Premium.",
    cours:         "Accède à tous les chapitres avec le Premium.",
    badges:        "Les badges avancés et statistiques détaillées sont réservés aux membres Premium.",
    classement:    "Apparais dans le classement avec le Premium.",
    pdf:           "Le téléchargement des PDF est réservé aux membres Premium.",
    assistance:    "L'assistance prioritaire est réservée aux membres Premium.",
  };
  const msg = msgs[feature] || "Cette fonctionnalité est réservée aux membres Premium.";
  const modal = document.getElementById("lockModal");
  if (!modal) { openModal(); return; }
  // Mettre à jour le message si possible
  const msgEl = modal.querySelector(".lock-msg");
  if (msgEl) msgEl.textContent = msg;
  modal.classList.add("show");
}

// ========== ASSISTANCE PRIORITAIRE (Premium feat 15) ==========
function contacterAssistance() {
  const premium = checkPremium();
  const phone = localStorage.getItem("userPhone") || "inconnu";
  const pseudo = localStorage.getItem("userPseudo") || phone;
  const adminNum = ADMIN_PHONES[0] || "674106410";
  const waNum = adminNum.startsWith("237") ? adminNum : "237" + adminNum;
  const msg = premium
    ? `🌟 *Assistance Prioritaire LearnUpr*\n\nBonjour, je suis *${pseudo}* (membre Premium).\n\nJ'ai besoin d'aide avec : `
    : `👋 *Contact LearnUpr*\n\nBonjour, je suis *${pseudo}*.\n\nMon numéro : ${phone}\n\nMa question : `;
  window.open(`https://wa.me/${waNum}?text=${encodeURIComponent(msg)}`, "_blank");
}

// ========== QUIZ UI — SÉLECTEUR BONNE RÉPONSE ==========
let qfCorrectIndex = -1;

function selectCorrectAnswer(idx) {
  qfCorrectIndex = idx;
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`qf-correct-btn-${i}`);
    if (!btn) continue;
    if (i === idx) {
      btn.style.background = "var(--p)";
      btn.style.color = "white";
      btn.style.borderColor = "var(--p)";
      btn.style.transform = "scale(1.1)";
    } else {
      btn.style.background = "var(--bg)";
      btn.style.color = "var(--t2)";
      btn.style.borderColor = "var(--border)";
      btn.style.transform = "scale(1)";
    }
  }
  const hint = document.getElementById("qf-correct-hint");
  if (hint) hint.textContent = `✅ Réponse correcte : ${["A","B","C","D"][idx]}`;
}

// Override ajouterQuizQuestion pour utiliser le nouveau sélecteur
const _origAjouterQuiz = ajouterQuizQuestion;
async function ajouterQuizQuestion() {
  const classe   = document.getElementById("qf-classe")?.value;
  const mat      = document.getElementById("qf-matiere")?.value;
  const chapitre = document.getElementById("qf-chapitre")?.value?.trim();
  const question = document.getElementById("qf-question")?.value?.trim();
  const inputs   = document.querySelectorAll(".qf-choice-input");
  const choices  = [...inputs].map(i => i.value.trim());

  if (!classe)    { showToast("❌ Choisis la classe",   "error"); return; }
  if (!mat)       { showToast("❌ Choisis la matière",  "error"); return; }
  if (!chapitre)  { showToast("❌ Indique le chapitre", "error"); return; }
  if (!question)  { showToast("❌ Écris la question",   "error"); return; }
  if (choices.some(c => !c)) { showToast("❌ Remplis les 4 choix", "error"); return; }
  if (qfCorrectIndex === -1) { showToast("❌ Sélectionne la bonne réponse (A/B/C/D)", "error"); return; }

  const newQ = { id: Date.now(), classe, matiere: mat, chapitre, q: question, c: choices, r: qfCorrectIndex };
  showToast("⏳ Enregistrement...", "info");

  const tursoId = await sauvegarderQuizDansTurso(newQ);
  if (tursoId) newQ.id = tursoId;
  customQuizQuestions.push(newQ);
  localStorage.setItem("customQuizQuestionsV2", JSON.stringify(customQuizQuestions));

  // Reset formulaire
  document.getElementById("qf-question").value = "";
  document.getElementById("qf-chapitre").value = "";
  [...inputs].forEach(i => i.value = "");
  qfCorrectIndex = -1;
  for (let i = 0; i < 4; i++) {
    const btn = document.getElementById(`qf-correct-btn-${i}`);
    if (btn) { btn.style.background="var(--bg)"; btn.style.color="var(--t2)"; btn.style.borderColor="var(--border)"; btn.style.transform="scale(1)"; }
  }
  const hint = document.getElementById("qf-correct-hint");
  if (hint) hint.textContent = "Appuie sur la lettre (A/B/C/D) pour marquer la bonne réponse";

  showToast(tursoId ? "✅ Question synchronisée !" : "✅ Question sauvegardée", "success");
  renderQuizAdminList();
}


// ========== IMPORT CSV QUIZ — forcer classe/matière pour tout le fichier ==========
function csvForceUpdateMatieres() {
  const classe = document.getElementById("csv-force-classe")?.value || "";
  const sel = document.getElementById("csv-force-mat");
  if (!sel) return;
  sel.innerHTML = '<option value="">— Matière du CSV —</option>';
  const mats = classe ? (MATIERES_PAR_CLASSE[classe] || []) : MATIERES;
  mats.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m; opt.textContent = NOMS_MATIERES[m] || m;
    sel.appendChild(opt);
  });
}

// ── Importer le même CSV pour plusieurs classes en une seule fois ──
function toggleCsvMultiClasse() {
  const box = document.getElementById("csv-multiclasse-box");
  if (!box) return;
  const visible = box.style.display !== "none";
  box.style.display = visible ? "none" : "block";
  if (!visible) renderCsvMultiClasseList();
}

function renderCsvMultiClasseList() {
  const list = document.getElementById("csv-multiclasse-list");
  if (!list) return;
  const dejaCochees = new Set(
    [...list.querySelectorAll("input[type=checkbox]:checked")].map(cb => cb.value)
  );
  list.innerHTML = CLASSES.map(c => `
    <label style="display:flex;align-items:center;gap:5px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer">
      <input type="checkbox" class="csv-multiclasse-cb" value="${c}" ${dejaCochees.has(c) ? "checked" : ""} style="width:16px;height:16px;cursor:pointer;accent-color:var(--p)">
      ${c}
    </label>`).join("");
}

function getCsvClassesSupplementaires() {
  return [...document.querySelectorAll(".csv-multiclasse-cb:checked")].map(cb => cb.value);
}

// ========== IMPORT CSV QUIZ ==========
async function importerCSVQuiz(input) {
  // Classe/matière forcées pour tout le fichier (si sélectionnées par l'admin)
  const forcedClasse = document.getElementById("csv-force-classe")?.value || "";
  const forcedMat     = document.getElementById("csv-force-mat")?.value || "";
  const forcedChapitre = document.getElementById("csv-force-chapitre")?.value?.trim() || "";
  const classesSuppCsv = getCsvClassesSupplementaires();
  const file = input.files[0];
  if (!file) return;
  const resultEl = document.getElementById("csvImportResult");
  resultEl.style.display = "block";
  resultEl.innerHTML = '<div style="color:var(--t2);font-size:12px;padding:8px">⏳ Analyse du fichier...</div>';

  try {
    let text = await file.text();
    // Retirer le BOM (présent si le CSV a été exporté depuis Excel) qui casserait l'entête
    text = text.replace(/^\uFEFF/, "");
    // Détecter le séparateur (virgule ou point-virgule)
    const lines = text.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      resultEl.innerHTML = '<div style="color:var(--red);font-weight:700;font-size:12px">❌ Fichier vide ou invalide</div>';
      return;
    }

    // Détecter séparateur
    const firstLine = lines[0];
    const sep = (firstLine.split(";").length > firstLine.split(",").length) ? ";" : ",";

    // ── Détection de l'en-tête + mapping des colonnes (tolère ordre différent, synonymes, accents) ──
    const HEADER_SYNONYMS = {
      classe: "classe", class: "classe",
      matiere: "matiere", matière: "matiere", mat: "matiere", sujet: "matiere", subject: "matiere",
      chapitre: "chapitre", chapter: "chapitre", theme: "chapitre", thème: "chapitre", lecon: "chapitre", leçon: "chapitre",
      question: "question", q: "question",
      choix1: "choix1", choixa: "choix1", optiona: "choix1", reponsea: "choix1", a: "choix1",
      choix2: "choix2", choixb: "choix2", optionb: "choix2", reponseb: "choix2", b: "choix2",
      choix3: "choix3", choixc: "choix3", optionc: "choix3", reponsec: "choix3", c: "choix3",
      choix4: "choix4", choixd: "choix4", optiond: "choix4", reponsed: "choix4", d: "choix4",
      reponse: "reponse", correcte: "reponse", correct: "reponse", answer: "reponse",
      bonnereponse: "reponse", bonneréponse: "reponse",
      explication: "explication", explanation: "explication", justification: "explication",
    };
    const headersRaw = lines[0].split(sep).map(h => h.trim());
    const headersKey = headersRaw.map(h => _normKeyCSV(h));
    const headerFieldSet = new Set(headersKey.map(k => HEADER_SYNONYMS[k]).filter(Boolean));
    const hasHeader = headerFieldSet.has("classe") || headerFieldSet.has("question");
    let startLine = 0;
    let colMap = null; // { champ: index }
    if (hasHeader) {
      startLine = 1;
      colMap = {};
      headersKey.forEach((k, idx) => {
        const champ = HEADER_SYNONYMS[k];
        if (champ && !(champ in colMap)) colMap[champ] = idx;
      });
    }

    let imported = 0, errors = [];
    const batchSource = (file.name || "import").replace(/\.csv$/i, "");
    const newlyAdded = [];

    // Si un en-tête a été détecté, vérifier que tous les champs obligatoires sont présents (une seule fois, pas par ligne)
    if (colMap) {
      const champsObligatoires = ["classe","matiere","question","choix1","choix2","choix3","choix4","reponse"];
      const manquants = champsObligatoires.filter(c => !(c in colMap));
      if (manquants.length) {
        resultEl.innerHTML = `<div style="color:var(--red);font-weight:700;font-size:12px">❌ Colonnes manquantes dans l'en-tête : ${manquants.join(", ")}</div>`;
        return;
      }
    }

    // ── ÉTAPE A : Parsing + sauvegarde LOCALE instantanée (pas d'attente réseau) ──
    for (let i = startLine; i < lines.length; i++) {
      const parts = lines[i].split(sep).map(p => p.trim().replace(/^["']|["']$/g, ""));

      let classe, matiere, chapitre, question, choix1, choix2, choix3, choix4, reponseRaw, explicationRaw;

      if (colMap) {
        // Extraction par nom de colonne — tolère un ordre de colonnes libre et une colonne "chapitre"/"explication" absente
        const get = (champ) => (champ in colMap && parts[colMap[champ]] !== undefined) ? parts[colMap[champ]] : "";
        classe = get("classe"); matiere = get("matiere"); chapitre = get("chapitre");
        question = get("question");
        choix1 = get("choix1"); choix2 = get("choix2"); choix3 = get("choix3"); choix4 = get("choix4");
        reponseRaw = get("reponse"); explicationRaw = get("explication");
      } else {
        // Pas d'en-tête détecté → ordre positionnel fixe (rétro-compatibilité avec les anciens CSV)
        if (parts.length < 9) {
          errors.push(`Ligne ${i+1}: seulement ${parts.length} colonnes (9 requises sans en-tête)`);
          continue;
        }
        [classe, matiere, chapitre, question, choix1, choix2, choix3, choix4, reponseRaw] = parts;
        explicationRaw = parts[9] || "";
      }

      // Si une classe/matière a été forcée par l'admin, elle remplace celle du CSV
      if (forcedClasse) {
        classe = forcedClasse;
      } else if (classe) {
        // Normaliser : tolère casse, accents, espaces/tirets/underscores, abréviations (ex: "tle c", "TLE-C", "Tle_C" → "Tle_C")
        const classeNorm = normaliserClasseCSV(classe);
        if (classeNorm) classe = classeNorm;
      }
      if (forcedMat) {
        matiere = forcedMat;
      } else if (matiere) {
        const matiereNorm = normaliserMatiereCSV(matiere);
        if (matiereNorm) matiere = matiereNorm;
      }
      if (forcedChapitre) chapitre = forcedChapitre;
      // Accepte 0-3 OU les lettres A/B/C/D (majuscule ou minuscule)
      const reponse = normaliserReponseCSV(reponseRaw);

      if (!classe || !matiere || !question) { errors.push(`Ligne ${i+1}: classe/matière/question vide ou non reconnue (classe="${parts[0]}", matière="${parts[1]}")`); continue; }
      if (isNaN(reponse) || reponse < 0 || reponse > 3) { errors.push(`Ligne ${i+1}: réponse "${reponseRaw}" invalide (doit être 0-3 ou A-D)`); continue; }
      if (!choix1 || !choix2 || !choix3 || !choix4) { errors.push(`Ligne ${i+1}: un ou plusieurs choix vides`); continue; }

      const explication = explicationRaw ? explicationRaw.trim() : "";

      // ── Classes ciblées : classe de la ligne (ou forcée) + classes supplémentaires cochées ──
      // Stockées TOUTES dans le même champ "classe" (liste séparée par virgules) : 1 SEULE ligne en base,
      // partagée entre toutes les classes — pas de duplication, pas de copie multiple.
      const classesCibles = [classe, ...classesSuppCsv.filter(c => c !== classe)];

      const newQ = {
        id: Date.now() + i + Math.floor(Math.random()*100000),
        classe: classesCibles.map(c => c.trim()).join(","),
        matiere: matiere.trim(),
        chapitre: chapitre.trim() || "Général",
        q: question.trim(),
        c: [choix1.trim(), choix2.trim(), choix3.trim(), choix4.trim()],
        r: reponse,
        source: batchSource,
        ...(explication ? { explication } : {})
      };
      customQuizQuestions.push(newQ);
      newlyAdded.push(newQ);
      imported++;
    }

    // Sauvegarde locale immédiate — l'utilisateur peut jouer aux quiz tout de suite
    localStorage.setItem("customQuizQuestionsV2", JSON.stringify(customQuizQuestions));

    // ── ÉTAPE B : Résultat affiché IMMÉDIATEMENT (pas d'attente Turso) ──
    const color = errors.length ? "var(--gold2)" : "var(--p)";
    const multiClasseInfo = classesSuppCsv.length > 0
      ? `<div style="font-size:10px;color:var(--t2);margin-top:4px">📚 Partagé entre ${classesSuppCsv.length + 1} classe(s) — ${imported} ligne(s) seulement (aucune copie créée)</div>`
      : "";
    resultEl.innerHTML = `
      <div style="background:var(--bg);border-radius:12px;padding:12px;border:2px solid ${color}">
        <div style="font-weight:900;font-size:13px;color:${color};margin-bottom:6px">
          ${imported > 0 ? "✅" : "❌"} ${imported} question(s) lue(s) dans le fichier (disponibles hors-ligne immédiatement)
        </div>
        ${multiClasseInfo}
        ${turso && imported > 0 ? `<div id="csvSyncStatus" style="font-size:11px;color:var(--t2);margin-top:6px">🔄 Synchronisation avec le serveur en cours...</div>` : ""}
        ${imported > 0 ? `<button onclick="supprimerImportCSV('${batchSource.replace(/'/g,"\\'")}')" style="margin-top:8px;background:var(--red);color:white;border:none;border-radius:8px;padding:7px 12px;font-size:11px;font-weight:700;cursor:pointer">🗑️ Annuler / supprimer ce lot importé</button>` : ""}
        ${errors.length > 0 ? `<div style="font-size:10px;color:var(--red);margin-top:8px">
          ⚠️ ${errors.length} ligne(s) ignorée(s) :<br>
          ${errors.slice(0,5).map(e => `• ${e}`).join("<br>")}
          ${errors.length > 5 ? `<br>... et ${errors.length-5} autres erreurs` : ""}
        </div>` : ""}
      </div>`;

    if (imported > 0) {
      const msg = classesSuppCsv.length > 0
        ? `✅ ${imported} question(s) importée(s) pour ${classesSuppCsv.length + 1} classes !`
        : `✅ ${imported} question(s) importée(s) et disponibles hors-ligne !`;
      showToast(msg, "success");
      renderQuizAdminList();
      // Décocher les classes supplémentaires après import réussi
      document.querySelectorAll(".csv-multiclasse-cb").forEach(cb => cb.checked = false);
    }

    // ── ÉTAPE C : Synchronisation Turso EN ARRIÈRE-PLAN par lots de 5 (non bloquant) ──
    if (turso && newlyAdded.length > 0) {
      (async () => {
        let synced = 0;
        for (let i = 0; i < newlyAdded.length; i += 5) {
          const batch = newlyAdded.slice(i, i+5);
          await Promise.allSettled(batch.map(async q => {
            const tursoId = await sauvegarderQuizDansTurso(q);
            if (tursoId) {
              q.id = tursoId;
              synced++;
            }
          }));
          // Sauvegarder localement au fur et à mesure (IDs Turso mis à jour)
          localStorage.setItem("customQuizQuestionsV2", JSON.stringify(customQuizQuestions));
          const statusEl = document.getElementById("csvSyncStatus");
          if (statusEl) statusEl.textContent = `🔄 Synchronisation : ${synced}/${newlyAdded.length}...`;
        }
        const statusElFinal = document.getElementById("csvSyncStatus");
        if (statusElFinal) statusElFinal.textContent = `✅ Synchronisé avec le serveur (${synced}/${newlyAdded.length})`;
        showToast(`✅ "${batchSource}" synchronisé avec le serveur`, "success");
      })();
    }
  } catch(e) {
    resultEl.innerHTML = `<div style="color:var(--red);font-weight:700;font-size:12px">❌ Erreur lecture : ${e.message}</div>`;
  }
  // Reset input pour permettre une deuxième importation
  input.value = "";
}

function telechargerExempleCSV() {
  const exemple = `classe;matiere;chapitre;question;choix1;choix2;choix3;choix4;reponse;explication
3ème;math;Chapitre 5 — Arithmétique;Combien font 7 × 8 ?;54;56;58;52;1;7 × 8 = 56 car 7 × 8 = 7 × (4+4) = 28+28 = 56
3ème;math;Chapitre 5 — Arithmétique;Quel est le PGCD de 12 et 18 ?;2;4;6;9;2;PGCD(12,18) = 6 car 12=2×6 et 18=3×6
3ème;français;Chapitre 3 — Grammaire;Nature de "rapidement" dans "il court rapidement" ?;Adjectif;Adverbe;Verbe;Nom;1;Un mot en -ment qui modifie un verbe est un adverbe
Tle C;physique;Chapitre 1 — Mécanique;Quelle est la formule de la force ?;F=ma;F=mv;F=Pa;F=mc²;0;2ème loi de Newton : Force = masse × accélération`;
  const blob = new Blob([exemple], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "exemple_quiz_learnup.csv";
  document.body.appendChild(a); a.click();
  document.body.removeChild(a);
  showToast("📋 Exemple téléchargé !", "success");
}


// ========== SKELETON LOADING ==========
function showSkeleton(containerId, count = 3) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = Array(count).fill(0).map(() => `
    <div class="skeleton-card">
      <div class="skeleton skeleton-line skeleton-title"></div>
      <div class="skeleton skeleton-line w-3q"></div>
      <div class="skeleton skeleton-line w-half"></div>
    </div>`).join("");
}


// ========== PULL TO REFRESH ==========
(function() {
  let startY = 0, pulling = false, threshold = 70;
  const app = document.getElementById("app") || document.querySelector(".app-shell") || document.body;

  document.addEventListener("touchstart", e => {
    if (window.scrollY === 0) { startY = e.touches[0].clientY; pulling = true; }
  }, { passive: true });

  document.addEventListener("touchend", async e => {
    if (!pulling) return;
    const dist = (e.changedTouches[0].clientY - startY);
    pulling = false;
    if (dist > threshold) {
      const ind = document.getElementById("ptr-indicator");
      const txt = document.getElementById("ptr-text");
      if (ind) ind.classList.add("visible");
      if (txt) txt.textContent = "Synchronisation...";
      try {
        if (typeof syncContenuDepuisTurso === "function") await syncContenuDepuisTurso();
        if (typeof syncQuizDepuisTurso === "function") await syncQuizDepuisTurso();
        if (typeof renderContent === "function") renderContent();
        if (txt) txt.textContent = "✅ À jour !";
      } catch(e) {
        if (txt) txt.textContent = "❌ Erreur réseau";
      }
      setTimeout(() => { if (ind) ind.classList.remove("visible"); }, 1800);
    }
  }, { passive: true });
})();


// ========== GRAPHIQUE SCORES (Canvas natif) ==========
function drawScoresChart() {
  const canvas = document.getElementById("scores-chart");
  const emptyEl = document.getElementById("scores-chart-empty");
  if (!canvas) return;

  // Récupérer l'historique
  const hist = JSON.parse(localStorage.getItem("quizHistory") || "[]");
  // Gratuit : 5 dernières entrées max · Premium : 15 dernières
  const premium = checkPremium();
  const maxEntries = premium ? 15 : 5;
  const data = hist.slice(0, maxEntries).reverse();

  // Bannière "plus d'historique en Premium" si des entrées sont masquées
  const noteEl = document.getElementById("scores-chart-premium-note");
  if (noteEl) {
    if (!premium && hist.length > maxEntries) {
      noteEl.style.display = "block";
      noteEl.textContent = `⭐ ${hist.length - maxEntries} entrée(s) supplémentaire(s) visibles en Premium`;
    } else {
      noteEl.style.display = "none";
    }
  }

  if (data.length < 2) {
    canvas.style.display = "none";
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }
  canvas.style.display = "block";
  if (emptyEl) emptyEl.style.display = "none";

  const ctx = canvas.getContext("2d");
  const W = canvas.offsetWidth || 300;
  const H = 140;
  canvas.width = W;
  canvas.height = H;
  ctx.clearRect(0, 0, W, H);

  const isDark = document.body.classList.contains("dark");
  const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "#94A3B8" : "#64748B";
  const lineColor = "#6D28D9";
  const fillColor = isDark ? "rgba(109,40,217,0.15)" : "rgba(109,40,217,0.1)";
  const dotColor = "#6D28D9";

  const pad = { top: 16, right: 12, bottom: 28, left: 32 };
  const gW = W - pad.left - pad.right;
  const gH = H - pad.top - pad.bottom;

  // Grilles horizontales (0, 25, 50, 75, 100%)
  ctx.font = "9px Inter, sans-serif";
  ctx.fillStyle = textColor;
  [0, 25, 50, 75, 100].forEach(v => {
    const y = pad.top + gH - (v / 100) * gH;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + gW, y); ctx.stroke();
    ctx.fillText(v + "%", 0, y + 3);
  });

  const pts = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * gW,
    y: pad.top + gH - ((d.pct || 0) / 100) * gH
  }));

  // Zone de remplissage
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pad.top + gH);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, pad.top + gH);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();

  // Ligne
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const mx = (pts[i-1].x + pts[i].x) / 2;
    ctx.bezierCurveTo(mx, pts[i-1].y, mx, pts[i].y, pts[i].x, pts[i].y);
  }
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.stroke();

  // Points
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = dotColor;
    ctx.fill();
    ctx.strokeStyle = isDark ? "#1E293B" : "white";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Label date court
    if (data[i] && data[i].date) {
      const d = new Date(data[i].date);
      const lbl = `${d.getDate()}/${d.getMonth()+1}`;
      ctx.font = "8px Inter";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(lbl, p.x, H - 4);
    }
  });
}

// ========== STREAK DE RÉVISION ==========
function calculerStreak() {
  const hist = JSON.parse(localStorage.getItem("quizHistory") || "[]");
  if (!hist.length) return { current: 0, best: 0 };

  // Extraire les jours uniques
  const days = [...new Set(hist
    .filter(h => h.date)
    .map(h => new Date(h.date).toDateString())
  )].sort((a, b) => new Date(b) - new Date(a));

  if (!days.length) return { current: 0, best: 0 };

  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Streak actuel
  let current = 0;
  let checkDate = (days[0] === today || days[0] === yesterday) ? new Date(days[0]) : null;
  if (checkDate) {
    for (const day of days) {
      const d = new Date(day).toDateString();
      if (d === checkDate.toDateString()) {
        current++;
        checkDate = new Date(checkDate.getTime() - 86400000);
      } else break;
    }
  }

  // Meilleur streak
  let best = 1, tmp = 1;
  for (let i = 1; i < days.length; i++) {
    const diff = (new Date(days[i-1]) - new Date(days[i])) / 86400000;
    if (Math.round(diff) === 1) { tmp++; best = Math.max(best, tmp); }
    else tmp = 1;
  }
  best = Math.max(best, current);

  return { current, best };
}

function renderStreak() {
  const { current, best } = calculerStreak();
  const countEl = document.getElementById("streak-count");
  const labelEl = document.getElementById("streak-label");
  const bestEl = document.getElementById("streak-best");
  if (countEl) countEl.textContent = current;
  if (bestEl) bestEl.textContent = best;
  if (labelEl) {
    labelEl.textContent = current === 0
      ? "Fais un quiz aujourd'hui pour démarrer !"
      : current === 1
      ? "jour de révision — continue !"
      : `jours consécutifs — bravo ! 🎉`;
  }
}


// ========== MODE RÉVISION (questions ratées) ==========
function getMissedQuestions() {
  const missed = JSON.parse(localStorage.getItem("missedQuestions") || "[]");
  return missed;
}

function lancerModeRevision() {
  const missed = getMissedQuestions();
  if (!missed.length) {
    showToast("🎉 Aucune question ratée — tu es au top !", "success");
    return;
  }
  // Mélanger et limiter à 20
  const shuffled = missed.sort(() => Math.random() - 0.5).slice(0, 20);
  showToast(`📚 Mode révision — ${shuffled.length} question(s) ratée(s)`, "info");
  // Lancer directement avec ces questions
  quizState.questions = shuffled;
  quizState.currentIndex = 0;
  quizState.score = 0;
  quizState._answersLog = [];
  quizState.mode = "revision";
  const settings = JSON.parse(localStorage.getItem("quizSettings") || "{}");
  quizState.tempsLimite = settings.tempsLimite || 30;
  quizState.matiere = "révision";
  // Afficher zone quiz
  ["quiz-select","quiz-history","quiz-result"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  document.getElementById("quiz-game").style.display = "block";
  afficherQuestion(0);
}

// Sauvegarder les questions ratées à chaque quiz
function _sauvegarderQuestionsRatees(questionsRatees) {
  const existing = JSON.parse(localStorage.getItem("missedQuestions") || "[]");
  const existingIds = new Set(existing.map(q => q.id));
  questionsRatees.forEach(q => {
    if (!existingIds.has(q.id)) existing.push(q);
  });
  // Garder max 100 questions ratées
  const trimmed = existing.slice(-100);
  localStorage.setItem("missedQuestions", JSON.stringify(trimmed));
}

// Retirer une question des ratées quand elle est réussie
function _retirerQuestionReussie(qId) {
  const existing = JSON.parse(localStorage.getItem("missedQuestions") || "[]");
  const filtered = existing.filter(q => q.id !== qId);
  localStorage.setItem("missedQuestions", JSON.stringify(filtered));
}

// Afficher/masquer le bouton révision selon s'il y a des questions ratées
function updateRevisionBtnVisibility() {
  const missed = getMissedQuestions();
  ["btn-revision", "btn-revision-sel"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = missed.length > 0 ? "flex" : "none";
  });
}


// ========== RAPPELS / NOTIFICATIONS PUSH ==========
async function activerNotifications() {
  const btn = document.getElementById("btn-notif");
  const status = document.getElementById("notif-status");

  if (!("Notification" in window)) {
    showToast("❌ Notifications non supportées sur cet appareil", "error");
    return;
  }

  if (Notification.permission === "granted") {
    showToast("✅ Notifications déjà activées !", "success");
    _updateNotifBanner();
    return;
  }

  if (btn) btn.textContent = "...";
  const perm = await Notification.requestPermission();

  if (perm === "granted") {
    localStorage.setItem("notifsActives", "1");
    _updateNotifBanner();
    showToast("🔔 Rappels activés ! Tu seras notifié avant tes sessions.", "success");
    // Planifier les rappels existants
    _planifierTousRappels();
  } else {
    if (status) status.textContent = "Notifications refusées — active-les dans les réglages";
    if (btn) btn.textContent = "Réessayer";
    showToast("❌ Permission refusée", "error");
  }
}

function _updateNotifBanner() {
  const btn = document.getElementById("btn-notif");
  const status = document.getElementById("notif-status");
  const banner = document.getElementById("notif-banner");
  if (Notification.permission === "granted") {
    if (btn) { btn.textContent = "✅ Activé"; btn.style.opacity = "0.7"; btn.onclick = null; }
    if (status) status.textContent = "Tu recevras un rappel 15 min avant chaque session planifiée avec une heure";
    if (banner) banner.style.background = "linear-gradient(135deg,#059669,#047857)";
  }
}

// Garde la trace des setTimeout déjà programmés pour pouvoir les annuler
// avant de re-planifier (évite les doublons de notifications).
let _rappelsTimeouts = [];

function _planifierTousRappels() {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;

  // Annuler les rappels déjà programmés avant d'en reprogrammer de nouveaux
  _rappelsTimeouts.forEach(t => clearTimeout(t));
  _rappelsTimeouts = [];

  // Le planning réel (planningData) stocke des jours de la semaine récurrents
  // ("Lu","Ma",...) + une heure optionnelle, pas une date précise. On calcule
  // donc la prochaine occurrence de chaque jour sélectionné dans les 7 jours
  // à venir, puis on programme un rappel 15 min avant (uniquement si une
  // heure a été renseignée — sans heure, impossible de savoir quand notifier).
  const JOURS_MAP = { "Di":0, "Lu":1, "Ma":2, "Me":3, "Je":4, "Ve":5, "Sa":6 };
  const sessions = JSON.parse(localStorage.getItem("planningData") || "[]");
  const now = new Date();

  sessions.forEach(s => {
    if (!s.heure || !Array.isArray(s.jours) || !s.jours.length) return;
    const [h, m] = s.heure.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return;

    s.jours.forEach(jourCode => {
      const cible = JOURS_MAP[jourCode];
      if (cible === undefined) return;

      // Chercher la prochaine occurrence de ce jour (aujourd'hui inclus si l'heure n'est pas encore passée)
      for (let offset = 0; offset <= 7; offset++) {
        const d = new Date(now);
        d.setDate(d.getDate() + offset);
        if (d.getDay() !== cible) continue;
        d.setHours(h, m, 0, 0);
        const reminderTime = new Date(d.getTime() - 15 * 60000);
        const delay = reminderTime.getTime() - now.getTime();
        // Re-planification courante : seulement les 7 prochains jours, comme avant
        if (delay > 0 && delay < 7 * 24 * 3600000) {
          const t = setTimeout(() => {
            new Notification("📚 LearnUpr — Rappel révision", {
              body: `Dans 15 min : ${s.matiere || "révision"} — ${s.heure}`,
              icon: "/favicon.ico",
              badge: "/favicon.ico"
            });
          }, delay);
          _rappelsTimeouts.push(t);
        }
        break; // un seul rappel par jour sélectionné, pas la peine de continuer la boucle offset
      }
    });
  });
}

// Les rappels programmés via setTimeout ne survivent pas à la fermeture de
// l'app/onglet : on les re-planifie systématiquement chaque fois que l'app
// redevient visible (en plus du DOMContentLoaded), pour limiter ce trou.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && localStorage.getItem("notifsActives") === "1" && typeof Notification !== "undefined" && Notification.permission === "granted") {
    _planifierTousRappels();
  }
});

// Vérifier l'état des notifs au démarrage
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("notifsActives") === "1" && Notification.permission === "granted") {
    _updateNotifBanner();
    _planifierTousRappels();
  }
  // Visibilité bouton révision
  updateRevisionBtnVisibility();
});


// ══════════════════════════════════════════════════════════
// ═══════ OUTIL NETTOYAGE — Panel Modérateur ═══════════════
// ══════════════════════════════════════════════════════════

// ── Utilitaire : normaliser un titre pour comparaison de doublons ──
// (fonction unique — voir correctif ci-dessous : avant correction, ce fichier
// contenait DEUX définitions de _normaliserTitre. En JavaScript, une
// "function" déclarée plus bas dans le fichier écrase silencieusement celle
// déclarée plus haut (hoisting), donc c'était la SECONDE version — supprimée
// ici — qui était réellement utilisée partout, y compris avant sa propre
// position dans le fichier. Cette seconde version retirait TOUS les
// caractères non-alphanumériques (/[^a-z0-9]/g), espaces compris, ce qui
// collait les mots les uns aux autres. Conséquence concrète : "Devoir 1
// maths" et "Devoir1 maths" devenaient tous deux "devoir1maths" — donc
// considérés comme un SEUL ET MÊME titre par _estDoublon, validerContribModo,
// publierFichierZip, etc., alors qu'il s'agit de deux documents distincts.
// Risque : rejet à tort de contenus légitimes comme "doublons". La version
// conservée ici garde les espaces comme séparateurs de mots (juste réduits à
// un seul espace), ce qui élimine ce faux positif tout en gardant la
// comparaison insensible à la casse/accents/ponctuation comme avant.

// ── Mots-clés par matière pour détection dans le nom de fichier ──
// Uniquement des mots complets — les alias courts (ang, fr, en, geo…)
// causent des faux positifs par sous-chaîne (ex: "l-ang-ue" → anglais).
// La détection compare MOT PAR MOT après découpe sur séparateurs.
const _MOTS_MATIERES = {
  math:         ["math","maths","mathematique","mathematiques"],
  francais:     ["francais"],
  anglais:      ["anglais","english"],
  histoire_geo: ["histgeo","histoiregeo","histoiregeo"],
  histoire:     ["histoire"],
  geographie:   ["geographie"],
  physique:     ["physique"],
  chimie:       ["chimie"],
  svt:          ["svt","biologie"],
  philosophie:  ["philosophie","philo"],
  informatique: ["informatique"],
  espagnol:     ["espagnol"],
  economie:     ["economie"],
  langue:       ["langue","langues","languesnationales","langnat"],
  LCN:          ["lcn","langueculture","langcult"],
  litterature:  ["litterature"],
};

// ── Détecter la matière depuis un nom de fichier ou un titre ──
// Compare MOT PAR MOT (après découpe) pour éviter les faux positifs
// sur des sous-chaînes (ex : "langue" ne doit pas matcher "anglais").
function _detecterMatiereDansNom(nom) {
  const mots = (nom || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  for (const [mat, cles] of Object.entries(_MOTS_MATIERES)) {
    for (const mot of mots) {
      if (cles.includes(mot)) return mat;
    }
  }
  return null;
}

// ── Détecter une année (2000–2035) dans un texte ──
function _detecterAnnee(texte) {
  const m = (texte || "").match(/\b(20[0-2][0-9]|2030|2031|2032|2033|2034|2035)\b/);
  return m ? m[1] : null;
}

// ── Wrapper sécurisé pour esc ──
function _nEsc(str) {
  return (typeof esc === "function") ? esc(str) : String(str).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// ══════════════════════════════════════════════════════════
// BLOC 1 — Correction des noms & classes
// ══════════════════════════════════════════════════════════
function nettoyageCorrigerNoms() {
  const btn = event.currentTarget || event.target;
  const origText = btn.textContent;
  btn.textContent = "⏳ Analyse en cours...";
  btn.disabled = true;

  setTimeout(() => {
    const publies = getContenuPublie();
    let corrections = 0;
    const log = [];

    const updated = publies.map(item => {
      const nom = item.titre || item.nom || "";
      const matDetectee = _detecterMatiereDansNom(nom);
      let modifie = false;

      // 1. Si matière détectée dans le titre ≠ matière déclarée → corriger
      if (matDetectee && item.mat && matDetectee !== item.mat) {
        const mots = _MOTS_MATIERES[item.mat] || [];
        const nomNorm = (nom || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
        const declarePresent = mots.some(m => nomNorm.includes(m));
        if (!declarePresent) {
          const avant = item.mat;
          item.mat = matDetectee;
          modifie = true;
          log.push("✅ <b>" + _nEsc(nom.slice(0,40)) + "</b> → mat: <b>" + avant + "</b> ➜ <b>" + matDetectee + "</b>");
        }
      }

      // 2. Nettoyer les noms avec caractères parasites
      const titrePropre = (item.titre || "")
        .replace(/_{2,}/g, " ").replace(/-{2,}/g, "-").replace(/\s{2,}/g, " ").trim();
      if (titrePropre !== item.titre) {
        item.titre = titrePropre;
        modifie = true;
      }

      if (modifie) corrections++;
      return item;
    });

    localStorage.setItem("contenu_publie", JSON.stringify(updated));

    if (corrections > 0 && typeof turso !== "undefined" && turso) {
      (async () => {
        for (const item of updated) {
          try {
            await turso.execute({ sql: "UPDATE contenu SET mat=?, titre=? WHERE id=?", args: [item.mat || "", item.titre || "", String(item.id)] });
          } catch(e) {}
        }
      })();
    }

    const resultEl = document.getElementById("nettoyage-noms-result");
    resultEl.style.display = "block";
    resultEl.innerHTML = corrections === 0
      ? "<span style='color:var(--t3)'>✅ Aucune correction nécessaire.</span>"
      : "<div style='font-weight:800;margin-bottom:6px;color:var(--text)'>" + corrections + " correction(s) appliquée(s)</div>" + log.join("<br>");

    btn.textContent = origText;
    btn.disabled = false;
    if (typeof renderContent === "function") renderContent();
  }, 50);
}

// ══════════════════════════════════════════════════════════
// BLOC 2 — Classement par année
// ══════════════════════════════════════════════════════════
function nettoyageClasserParAnnee() {
  const btn = event.currentTarget || event.target;
  const origText = btn.textContent;
  btn.textContent = "⏳ Détection en cours...";
  btn.disabled = true;

  setTimeout(() => {
    const publies = getContenuPublie();
    let assigned = 0;
    const log = [];

    const updated = publies.map(item => {
      if (item.annee) return item;
      const source = (item.titre || "") + " " + (item.nom || "") + " " + (item.fichierUrl || "");
      const annee = _detecterAnnee(source);
      if (annee) {
        item.annee = annee;
        assigned++;
        log.push("📅 <b>" + _nEsc((item.titre||"?").slice(0,40)) + "</b> → <b>" + annee + "</b>");
      }
      return item;
    });

    localStorage.setItem("contenu_publie", JSON.stringify(updated));

    if (assigned > 0 && typeof turso !== "undefined" && turso) {
      (async () => {
        try { await turso.execute({ sql: "ALTER TABLE contenu ADD COLUMN annee TEXT DEFAULT ''", args: [] }); } catch(_) {}
        for (const item of updated) {
          if (!item.annee) continue;
          try { await turso.execute({ sql: "UPDATE contenu SET annee=? WHERE id=?", args: [item.annee, String(item.id)] }); } catch(e) {}
        }
      })();
    }

    const resultEl = document.getElementById("nettoyage-annee-result");
    resultEl.style.display = "block";
    resultEl.innerHTML = assigned === 0
      ? "<span style='color:var(--t3)'>✅ Aucune année détectée ou tous déjà renseignés.</span>"
      : "<div style='font-weight:800;margin-bottom:6px;color:var(--text)'>" + assigned + " année(s) attribuée(s)</div>" + log.join("<br>");

    btn.textContent = origText;
    btn.disabled = false;
  }, 50);
}

// ══════════════════════════════════════════════════════════
// BLOC 5 — Renommage rétroactif des fichiers (nom propre)
// ══════════════════════════════════════════════════════════
// Régénère le champ "nom" (affiché/stocké) de tout le contenu déjà publié
// avec la même convention que les nouveaux fichiers importés par ZIP
// (_genererNomFichierPropre, demande Jean 2026) : MATIERE_CLASSE_TYPE_ANNEE.
// Ne touche QUE le champ "nom" en base — le fichier physique sur Cloudinary
// garde son URL et son nom d'origine (décision Jean : éviter de re-uploader,
// ce qui casserait les liens déjà partagés et coûterait des requêtes inutiles
// pour un simple problème d'étiquette).
function nettoyageRenommerFichiers() {
  const btn = event.currentTarget || event.target;
  const origText = btn.textContent;
  btn.textContent = "⏳ Renommage en cours...";
  btn.disabled = true;

  setTimeout(() => {
    const publies = getContenuPublie();
    let renomme = 0;
    const log = [];

    // Convertit le type "court" utilisé par le contenu publié (cours,
    // sequencielle, examen, la_zone, competences) vers les mêmes codes courts
    // que _genererNomFichierPropre attend (qui connaît "examen_officiel", pas
    // "examen") — sans cette table, tous les examens publiés perdraient leur
    // code "EXAM" et retomberaient sur le générique "FICHIER".
    const TYPE_PUBLIE_VERS_TYPE_ZIP = {
      cours: "cours", sequencielle: "sequencielle", examen: "examen_officiel",
      la_zone: "la_zone", competences: "competences"
    };

    const updated = publies.map(item => {
      const ext = (() => {
        const m = (item.fichierUrl || "").match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
        if (m) return m[1].toLowerCase();
        const mimeToExt = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx" };
        return mimeToExt[item.fichierType] || "pdf";
      })();
      const typeZip = TYPE_PUBLIE_VERS_TYPE_ZIP[item.type] || "cours";
      const nouveauNom = _genererNomFichierPropre(item.mat, item.classe, typeZip, item.annee, ext);
      if (item.nom === nouveauNom) return item; // déjà à jour, rien à faire
      const ancienNom = item.nom || "(sans nom)";
      // On ne perd pas le nom original — il est conservé dans nomOriginal s'il
      // n'existe pas déjà, pour garder une trace même si "nom" change.
      if (!item.nomOriginal) item.nomOriginal = item.nom || "";
      item.nom = nouveauNom;
      renomme++;
      log.push("📝 <b>" + _nEsc((item.titre||"?").slice(0,35)) + "</b><br><span style='color:var(--t3);font-size:10px'>" + _nEsc(ancienNom) + " → " + _nEsc(nouveauNom) + "</span>");
      return item;
    });

    localStorage.setItem("contenu_publie", JSON.stringify(updated));

    if (renomme > 0 && typeof turso !== "undefined" && turso) {
      (async () => {
        try { await turso.execute({ sql: "ALTER TABLE contenu ADD COLUMN nom_original TEXT DEFAULT ''", args: [] }); } catch(_) {}
        for (const item of updated) {
          if (!item.nom) continue;
          try {
            await turso.execute({ sql: "UPDATE contenu SET nom=?, nom_original=? WHERE id=?", args: [item.nom, item.nomOriginal || "", String(item.id)] });
          } catch(e) {
            // Repli si la colonne nom_original n'a pas pu être ajoutée (très ancien schéma)
            try { await turso.execute({ sql: "UPDATE contenu SET nom=? WHERE id=?", args: [item.nom, String(item.id)] }); } catch(e2) {}
          }
        }
      })();
    }

    const resultEl = document.getElementById("nettoyage-renommage-result");
    resultEl.style.display = "block";
    resultEl.innerHTML = renomme === 0
      ? "<span style='color:var(--t3)'>✅ Tous les fichiers ont déjà un nom à jour.</span>"
      : "<div style='font-weight:800;margin-bottom:8px;color:var(--text)'>" + renomme + " fichier(s) renommé(s)</div>" + log.join("<br><br>");

    btn.textContent = origText;
    btn.disabled = false;
  }, 50);
}

// ══════════════════════════════════════════════════════════
// BLOC 3 — Détection & suppression des doublons
// ══════════════════════════════════════════════════════════
var _doublonsASupprimer = [];

function nettoyageDetecterDoublons() {
  const btn = event.currentTarget || event.target;
  const origText = btn.textContent;
  btn.textContent = "⏳ Analyse...";
  btn.disabled = true;
  _doublonsASupprimer = [];

  setTimeout(() => {
    const publies = getContenuPublie();
    const vus = new Map();
    const doublons = [];

    const tries = [...publies].sort((a, b) => Number(b.datePublication||b.date||0) - Number(a.datePublication||a.date||0));

    for (const item of tries) {
      const cle = _normaliserTitre(item.titre) + "|" + (item.classe||"") + "|" + (item.mat||"");
      const urlNorm = (item.fichierUrl || "").trim().split("?")[0];
      const cle2 = urlNorm ? "url|" + urlNorm : null;

      const dbl = (cle.length > 3 && vus.has(cle)) || (cle2 && vus.has(cle2));
      if (dbl) {
        const motif = (cle.length > 3 && vus.has(cle)) ? "titre+classe+matière identiques" : "URL de fichier identique";
        doublons.push({ id: item.id, titre: item.titre, motif, mat: item.mat, classe: item.classe });
        _doublonsASupprimer.push(String(item.id));
      } else {
        if (cle.length > 3) vus.set(cle, 1);
        if (cle2) vus.set(cle2, 1);
      }
    }

    const resultEl = document.getElementById("nettoyage-doublons-result");
    const suppBtn = document.getElementById("nettoyage-doublons-suppr-btn");
    resultEl.style.display = "block";

    if (doublons.length === 0) {
      resultEl.innerHTML = "<span style='color:var(--t3)'>✅ Aucun doublon détecté.</span>";
      if (suppBtn) suppBtn.style.display = "none";
    } else {
      resultEl.innerHTML = "<div style='font-weight:800;margin-bottom:8px;color:#DC2626'>" + doublons.length + " doublon(s) — le plus récent sera conservé :</div>" +
        doublons.map(d => "🔴 <b>" + _nEsc((d.titre||"?").slice(0,45)) + "</b><br><span style='color:var(--t3);font-size:10px'>🏷 " + (d.classe||"?") + " · " + (d.mat||"?") + " · " + d.motif + "</span>").join("<br><br>");
      if (suppBtn) suppBtn.style.display = "block";
    }

    btn.textContent = origText;
    btn.disabled = false;
  }, 50);
}

function nettoyageSupprimerDoublons() {
  if (!_doublonsASupprimer.length) {
    if (typeof showToast === "function") showToast("✅ Aucun doublon à supprimer", "info");
    return;
  }
  const nb = _doublonsASupprimer.length;
  if (typeof _confirmAndroid === "function") {
    _confirmAndroid("Supprimer définitivement " + nb + " doublon(s) ? Action irréversible.", function() {
      _executerSuppressionDoublons(nb);
    });
  } else {
    if (confirm("Supprimer définitivement " + nb + " doublon(s) ?")) _executerSuppressionDoublons(nb);
  }
}

function _executerSuppressionDoublons(nb) {
  const publies = getContenuPublie();
  const ids = new Set(_doublonsASupprimer.map(String));
  const nettoyes = publies.filter(p => !ids.has(String(p.id)));
  localStorage.setItem("contenu_publie", JSON.stringify(nettoyes));

  if (typeof turso !== "undefined" && turso) {
    (async () => {
      for (const id of ids) {
        try { await turso.execute({ sql: "DELETE FROM contenu WHERE id=?", args: [id] }); } catch(e) {}
      }
    })();
  }

  if (typeof showToast === "function") showToast("🗑️ " + nb + " doublon(s) supprimé(s)", "success");
  _doublonsASupprimer = [];

  const suppBtn = document.getElementById("nettoyage-doublons-suppr-btn");
  if (suppBtn) suppBtn.style.display = "none";
  const resultEl = document.getElementById("nettoyage-doublons-result");
  if (resultEl) resultEl.innerHTML = "<span style='color:var(--t3)'>✅ " + nb + " doublon(s) supprimé(s).</span>";

  if (typeof renderContent === "function") renderContent();
  if (typeof chargerContenuPublieModo === "function") chargerContenuPublieModo();
}

// ══════════════════════════════════════════════════════════
// BLOC 4 — Statistiques
// ══════════════════════════════════════════════════════════
function nettoyageAfficherStats() {
  const publies = getContenuPublie();
  const parType = {}, parClasse = {};
  let avecAnnee = 0, sansUrl = 0;

  for (const item of publies) {
    const t = item.typeFichier || item.type || "inconnu";
    parType[t] = (parType[t] || 0) + 1;
    const c = item.classe || "?";
    parClasse[c] = (parClasse[c] || 0) + 1;
    if (item.annee) avecAnnee++;
    if (!item.fichierUrl && !item.contenu) sansUrl++;
  }

  const lignesType = Object.entries(parType).sort((a,b)=>b[1]-a[1]).map(([k,v]) => "  • " + k + " : <b>" + v + "</b>").join("<br>");
  const lignesClasse = Object.entries(parClasse).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v]) => "  • " + k + " : <b>" + v + "</b>").join("<br>");

  const resultEl = document.getElementById("nettoyage-stats-result");
  resultEl.style.display = "block";
  resultEl.innerHTML = "<div style='background:var(--bg);border-radius:12px;padding:12px;border:1px solid var(--border)'>" +
    "<div style='font-weight:800;color:var(--p);margin-bottom:8px'>📊 " + publies.length + " fichiers publiés au total</div>" +
    "<div style='margin-bottom:8px'><b>Par type :</b><br>" + (lignesType||"—") + "</div>" +
    "<div style='margin-bottom:8px'><b>Top classes :</b><br>" + (lignesClasse||"—") + "</div>" +
    "<div style='margin-bottom:4px'><b>Avec année :</b> " + avecAnnee + " / " + publies.length + "</div>" +
    "<div><b>Sans fichier/contenu :</b> <span style='color:" + (sansUrl>0?"#DC2626":"var(--t3)") + "'>" + sansUrl + "</span></div>" +
    "</div>";
}

// ══════════════════════════════════════════════════════════
// GARDE ANTI-DOUBLON GLOBALE
// Utilisée à l'import ZIP et à la publication manuelle
// ══════════════════════════════════════════════════════════

function _estDejaPublie(candidat) {
  const publies = getContenuPublie();
  const mat    = candidat.mat    || candidat.matiere || "";
  const classe = candidat.classe || (Array.isArray(candidat.classes) ? candidat.classes[0] : "") || "";
  const cle       = _normaliserTitre(candidat.titre) + "|" + classe + "|" + mat;
  const cleTitre  = _normaliserTitre(candidat.titre);
  const urlCand   = (candidat.fichierUrl||"").trim().split("?")[0];
  const nomFichier = _normaliserTitre((candidat.relativePath||"").split("/").pop().replace(/\.[^.]+$/,""));
  for (const p of publies) {
    if (cle.length > 3 && _normaliserTitre(p.titre) + "|" + (p.classe||"") + "|" + (p.mat||"") === cle) return true;
    if (cleTitre.length > 5 && _normaliserTitre(p.titre) === cleTitre) return true;
    if (nomFichier.length > 5 && _normaliserTitre(p.nom || p.fichierNom || "") === nomFichier) return true;
    if (urlCand && (p.fichierUrl||"").trim().split("?")[0] === urlCand) return true;
  }
  return false;
}

function _filtrerDoublons(candidats) {
  const publies = getContenuPublie();
  const vus = new Set();

  // Index du contenu deja publie - plusieurs cles par item pour maximiser la detection
  for (const p of publies) {
    const cle = _normaliserTitre(p.titre) + "|" + (p.classe||"") + "|" + (p.mat||"");
    if (cle.length > 3) vus.add(cle);
    const cleTitre = _normaliserTitre(p.titre);
    if (cleTitre.length > 5) vus.add("t|" + cleTitre);
    const u = (p.fichierUrl||"").trim().split("?")[0];
    if (u) vus.add("url|" + u);
    const nomF = _normaliserTitre(p.nom || p.fichierNom || "");
    if (nomF.length > 5) vus.add("f|" + nomF);
  }

  const nouveaux = [], ignores = [];
  for (const c of candidats) {
    // Support ZIP (matiere/classes) ET publication normale (mat/classe)
    const mat    = c.mat    || c.matiere || "";
    const classe = c.classe || (Array.isArray(c.classes) ? c.classes[0] : "") || "";

    const cle       = _normaliserTitre(c.titre) + "|" + classe + "|" + mat;
    const cleTitre  = _normaliserTitre(c.titre);
    // Nom de fichier brut (sans extension) pour detecter les reimports du meme fichier
    const nomFichier = _normaliserTitre((c.relativePath||"").split("/").pop().replace(/\.[^.]+$/,""));
    const urlC  = (c.fichierUrl||"").trim().split("?")[0];
    const cleUrl = urlC ? "url|" + urlC : null;

    const estDoublon =
      (cle.length > 3        && vus.has(cle))                  ||
      (cleTitre.length > 5   && vus.has("t|" + cleTitre))      ||
      (nomFichier.length > 5 && vus.has("f|" + nomFichier))    ||
      (cleUrl                && vus.has(cleUrl));

    if (estDoublon) {
      ignores.push(c);
    } else {
      nouveaux.push(c);
      if (cle.length > 3)        vus.add(cle);
      if (cleTitre.length > 5)   vus.add("t|" + cleTitre);
      if (nomFichier.length > 5) vus.add("f|" + nomFichier);
      if (cleUrl)                 vus.add(cleUrl);
    }
  }
  return { nouveaux, ignores };
}

// ── Patch publierContenu : bloquer les doublons à la publication manuelle ──
(function() {
  if (typeof publierContenu !== "function") return;
  const _origPublier = publierContenu;
  window.publierContenu = async function() {
    const titre  = (document.getElementById("modo-titre")?.value || "").trim();
    const classe = (document.getElementById("modo-classe")?.value || "").trim();
    const mat    = (document.getElementById("modo-mat")?.value || "").trim();
    if (titre && _estDejaPublie({ titre, classe, mat })) {
      if (typeof showToast === "function") showToast("⚠️ Ce fichier est déjà publié (même titre + classe + matière). Publication annulée.", "error");
      return;
    }
    return _origPublier.apply(this, arguments);
  };
})();

// ── Patch syncContenuDepuisTurso : dédupliquer après chaque synchronisation ──
(function() {
  if (typeof syncContenuDepuisTurso !== "function") return;
  const _origSync = syncContenuDepuisTurso;
  window.syncContenuDepuisTurso = async function() {
    await _origSync.apply(this, arguments);
    const publies = getContenuPublie();
    const vus = new Map();
    const dedup = [];
    const tries = [...publies].sort((a,b) => Number(b.datePublication||b.date||0) - Number(a.datePublication||a.date||0));
    for (const item of tries) {
      const cle = _normaliserTitre(item.titre) + "|" + (item.classe||"") + "|" + (item.mat||"");
      const urlP = (item.fichierUrl||"").trim().split("?")[0];
      const cleUrl = urlP ? "url|" + urlP : null;
      if ((cle.length > 3 && vus.has(cle)) || (cleUrl && vus.has(cleUrl))) continue;
      dedup.push(item);
      if (cle.length > 3) vus.set(cle, 1);
      if (cleUrl) vus.set(cleUrl, 1);
    }
    if (dedup.length < publies.length) localStorage.setItem("contenu_publie", JSON.stringify(dedup));
  };
})();

// ═══════════════════════════════════════════════════════════
// ═══════════════ FORUM LEARNUP ════════════════════════════
// ══════════════════════════════════════════════════════════

const FORUM_QUOTA_KEY = "forum_quota_"; // + date YYYY-MM-DD
const FORUM_MAX_GRATUIT = 10;
let forumClasseActive = "tous";
let forumQuestionOuverte = null; // ID question ouverte

// ── Quota journalier ──
function getForumQuotaAujourdhui() {
  const today = new Date().toISOString().slice(0, 10);
  return parseInt(localStorage.getItem(FORUM_QUOTA_KEY + today) || "0");
}
function incrementerForumQuota() {
  const today = new Date().toISOString().slice(0, 10);
  const n = getForumQuotaAujourdhui() + 1;
  localStorage.setItem(FORUM_QUOTA_KEY + today, n);
  return n;
}
function forumQuotaAtteint() {
  if (isPremium) return false;
  return getForumQuotaAujourdhui() >= FORUM_MAX_GRATUIT;
}

// ── Initialiser les matières dans la modal ──
function initForumMatieres() {
  const sel = document.getElementById("fq-matiere");
  if (!sel) return;
  sel.innerHTML = '<option value="">— Choisir la matière —</option>';
  const mats = MATIERES_PAR_CLASSE[activeClasse] || MATIERES;
  mats.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m;
    opt.textContent = NOMS_MATIERES[m] || m.replace(/_/g, " ");
    sel.appendChild(opt);
  });
}

// ── Initialiser les tabs de classe ──
function initForumClasseTabs() {
  const container = document.getElementById("forum-classe-tabs");
  if (!container) return;
  container.innerHTML = `<button class="forum-ctab ${forumClasseActive === "tous" ? "active" : ""}" data-classe="tous" onclick="setForumClasse('tous',this)">Toutes</button>`;
  classesVisibles().forEach(c => {
    const btn = document.createElement("button");
    btn.className = "forum-ctab" + (forumClasseActive === c ? " active" : "");
    btn.dataset.classe = c;
    btn.textContent = c;
    btn.onclick = () => setForumClasse(c, btn);
    container.appendChild(btn);
  });
}

function setForumClasse(classe, btn) {
  forumClasseActive = classe;
  document.querySelectorAll(".forum-ctab").forEach(b => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderForum();
}

// ── Charger questions depuis Turso ──
async function chargerQuestionsForum() {
  // Questions locales + Turso
  let questions = JSON.parse(localStorage.getItem("forum_questions") || "[]");
  if (turso) {
    try {
      const res = await turso.execute({
        sql: "SELECT * FROM forum_questions ORDER BY date DESC LIMIT 100",
        args: []
      });
      if (res.rows && res.rows.length) {
        const tursoQs = res.rows.map(r => ({
          id: r.id, texte: r.texte, matiere: r.matiere,
          classe: r.classe, auteur: r.auteur, pseudo: r.pseudo,
          tags: r.tags ? r.tags.split(",") : [],
          date: r.date, likes: r.likes || 0,
          nbReponses: r.nb_reponses || 0, resolu: r.resolu === 1
        }));
        // Merger local + Turso (Turso prioritaire)
        const tursoIds = new Set(tursoQs.map(q => String(q.id)));
        const locales = questions.filter(q => !tursoIds.has(String(q.id)));
        questions = [...tursoQs, ...locales].sort((a, b) => b.date - a.date);
        localStorage.setItem("forum_questions", JSON.stringify(questions));
      }
    } catch(e) {}
  }
  return questions;
}

// ── Rendre le forum ──
async function renderForum() {
  const list = document.getElementById("forum-list");
  const subtitle = document.getElementById("forum-subtitle");
  const quotaBar = document.getElementById("forum-quota-bar");
  const quotaCount = document.getElementById("forum-quota-count");
  if (!list) return;

  // Quota bar
  if (!isPremium) {
    const q = getForumQuotaAujourdhui();
    if (quotaBar) quotaBar.style.display = "flex";
    if (quotaCount) quotaCount.textContent = q;
  } else {
    if (quotaBar) quotaBar.style.display = "none";
  }

  // Subtitle
  if (subtitle) subtitle.textContent = isPremium ? "⭐ Premium — questions illimitées" : `${FORUM_MAX_GRATUIT - getForumQuotaAujourdhui()} question(s) restante(s) aujourd'hui`;

  // Skeleton
  list.innerHTML = `
    <div class="skeleton-card"><div class="skeleton skeleton-line w-full"></div><div class="skeleton skeleton-line w-3q"></div></div>
    <div class="skeleton-card"><div class="skeleton skeleton-line w-full"></div><div class="skeleton skeleton-line w-half"></div></div>`;

  initForumClasseTabs();

  const questions = await chargerQuestionsForum();
  const search = (document.getElementById("forum-search")?.value || "").toLowerCase();

  let filtered = questions;
  if (forumClasseActive !== "tous") filtered = filtered.filter(q => q.classe === forumClasseActive);
  if (search) filtered = filtered.filter(q =>
    q.texte.toLowerCase().includes(search) ||
    (q.matiere || "").toLowerCase().includes(search) ||
    (q.tags || []).some(t => t.toLowerCase().includes(search))
  );

  if (!filtered.length) {
    list.innerHTML = `<div style="text-align:center;padding:40px 20px;color:var(--t3)">
      <div style="font-size:36px;margin-bottom:10px">💬</div>
      <div style="font-weight:700;font-size:14px;margin-bottom:6px">Aucune question pour l'instant</div>
      <div style="font-size:12px">Sois le premier à poser une question !</div>
    </div>`;
    return;
  }

  list.innerHTML = filtered.map(q => {
    const dateStr = new Date(q.date).toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
    const tags = (q.tags || []).map(t => `<span class="forum-tag">${esc(t.trim())}</span>`).join("");
    const matNom = NOMS_MATIERES[q.matiere] || (q.matiere || "").replace(/_/g, " ");
    const isVisio = !!q.estVisio;
    const visioLinkMatch = isVisio ? q.texte.match(/https?:\/\/[^\s]+/) : null;
    const visioUrl = visioLinkMatch ? visioLinkMatch[0] : null;
    const cardClass = `forum-question-card ${q.resolu ? "resolu" : ""} ${isVisio ? "estVisio" : ""}`;
    const cardClick = isVisio && visioUrl
      ? `window.open('${visioUrl}','_blank','noopener,noreferrer');showToast('📹 Ouverture de la visio...','info')`
      : `ouvrirDetailQuestion(${q.id})`;
    return `
    <div class="${cardClass}" onclick="${cardClick}">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:8px">
        <div style="flex:1">
          ${isVisio ? `<div style="background:linear-gradient(135deg,#1565C0,#0D47A1);color:white;border-radius:8px;padding:4px 10px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;gap:5px;margin-bottom:6px">📹 VISIO EN DIRECT <span style="background:rgba(255,255,255,0.3);border-radius:4px;padding:1px 5px;font-size:9px;animation:pulse 1.5s infinite">● LIVE</span></div>` : ""}
          <div style="font-weight:800;font-size:13px;color:var(--text);line-height:1.4;margin-bottom:4px">${esc(q.texte.split("\n")[0])}</div>
          <div style="font-size:10px;color:var(--t2);display:flex;align-items:center;gap:6px;flex-wrap:wrap">
            <span style="background:rgba(109,40,217,0.1);color:var(--p);border-radius:6px;padding:2px 6px;font-weight:700">${matNom}</span>
            <span style="background:rgba(245,158,11,0.1);color:var(--gold2);border-radius:6px;padding:2px 6px;font-weight:700">${esc(q.classe || "")}</span>
            ${q.resolu ? `<span style="background:#d1fae5;color:#065F46;border-radius:6px;padding:2px 6px;font-weight:700">✅ Résolu</span>` : ""}
            ${isVisio ? `<span style="background:rgba(21,101,192,0.15);color:#1565C0;border-radius:6px;padding:2px 6px;font-weight:700">📹 Visio · Clique pour rejoindre</span>` : ""}
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:10px;color:var(--t3)">${dateStr}</div>
          <div style="font-size:11px;font-weight:700;color:var(--t2);margin-top:2px">💬 ${q.nbReponses || 0}</div>
        </div>
      </div>
      ${tags ? `<div style="margin-bottom:6px">${tags}</div>` : ""}
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:10px;color:var(--t3);display:flex;align-items:center;gap:4px">
          <span>👤</span>
          <span>${esc(q.pseudo || "Élève")}</span>
          ${q.classe ? `<span>· ${esc(q.classe)}</span>` : ""}
        </div>
        <div style="font-size:10px;color:var(--t3)">👍 ${q.likes || 0}</div>
      </div>
    </div>`;
  }).join("");
}

// ── Ouvrir modal nouvelle question ──
function ouvrirNouvelleQuestion() {
  if (forumQuotaAtteint()) {
    document.getElementById("fq-quota-warning").style.display = "block";
    document.getElementById("btn-soumettre-question").disabled = true;
    document.getElementById("btn-soumettre-question").style.opacity = "0.5";
  } else {
    document.getElementById("fq-quota-warning").style.display = "none";
    document.getElementById("btn-soumettre-question").disabled = false;
    document.getElementById("btn-soumettre-question").style.opacity = "1";
  }
  initForumMatieres();
  document.getElementById("fq-texte").value = "";
  document.getElementById("fq-tags").value = "";
  document.getElementById("fq-count").textContent = "0";
  document.getElementById("forumQuestionModal").classList.add("show");
}

// ── Soumettre une question ──
async function soumettreQuestion() {
  if (forumQuotaAtteint()) { showToast("❌ Limite de 10 questions/jour atteinte", "error"); return; }
  const texte = document.getElementById("fq-texte").value.trim();
  const matiere = document.getElementById("fq-matiere").value;
  const tags = document.getElementById("fq-tags").value.split(",").map(t => t.trim()).filter(Boolean);

  if (!texte) { showToast("❌ Écris ta question d'abord", "error"); return; }
  if (texte.length < 10) { showToast("❌ Question trop courte (min 10 caractères)", "error"); return; }

  const phone = localStorage.getItem("userPhone") || "";
  const pseudo = localStorage.getItem("userPseudo") || phone || "Élève anonyme";
  const now = Date.now();

  // Fix forum : on utilise la classe de l'onglet forum actuellement sélectionné
  // (forumClasseActive) si elle est précise, sinon la classe réelle de l'élève
  // (userClasse), plutôt que "activeClasse" qui reflète la navigation générale
  // (dernière matière/classe parcourue) et peut différer de l'onglet forum affiché —
  // ce qui faisait "disparaître" les nouvelles questions postées.
  const classeForum = (forumClasseActive && forumClasseActive !== "tous")
    ? forumClasseActive
    : (localStorage.getItem("userClasse") || activeClasse);

  const question = {
    id: now,
    texte, matiere, tags,
    classe: classeForum,
    auteur: phone,
    pseudo,
    date: now,
    likes: 0,
    nbReponses: 0,
    resolu: false
  };

  // Sauvegarder local
  const qs = JSON.parse(localStorage.getItem("forum_questions") || "[]");
  qs.unshift(question);
  localStorage.setItem("forum_questions", JSON.stringify(qs));

  // Sauvegarder Turso
  if (turso) {
    try {
      await turso.execute({
        sql: `INSERT OR IGNORE INTO forum_questions (id, texte, matiere, classe, auteur, pseudo, tags, date, likes, nb_reponses, resolu)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)`,
        args: [now, texte, matiere, classeForum, phone, pseudo, tags.join(","), now]
      });
    } catch(e) {}
  }

  incrementerForumQuota();
  document.getElementById("forumQuestionModal").classList.remove("show");
  showToast("✅ Question postée !", "success");
  renderForum();

  // Badge notif forum
  const dot = document.getElementById("navForumDot");
  if (dot) dot.classList.add("show");
}

// ── Ouvrir détail d'une question ──
async function ouvrirDetailQuestion(questionId) {
  forumQuestionOuverte = questionId;
  const body = document.getElementById("forum-detail-body");
  if (!body) return;

  body.innerHTML = `<div style="text-align:center;padding:30px;color:var(--t3)"><span class="pulse">⏳</span> Chargement...</div>`;
  document.getElementById("forumDetailModal").classList.add("show");

  // Charger la question
  const questions = JSON.parse(localStorage.getItem("forum_questions") || "[]");
  const q = questions.find(x => String(x.id) === String(questionId));
  if (!q) { body.innerHTML = `<div style="padding:20px;color:var(--red)">Question introuvable.</div>`; return; }

  // Charger les réponses
  let reponses = JSON.parse(localStorage.getItem("forum_reponses_" + questionId) || "[]");
  if (turso) {
    try {
      const res = await turso.execute({
        sql: "SELECT * FROM forum_reponses WHERE question_id=? ORDER BY date ASC",
        args: [questionId]
      });
      if (res.rows && res.rows.length) {
        reponses = res.rows.map(r => ({
          id: r.id, texte: r.texte, auteur: r.auteur,
          pseudo: r.pseudo, date: r.date, likes: r.likes || 0, best: r.best === 1
        }));
        localStorage.setItem("forum_reponses_" + questionId, JSON.stringify(reponses));
      }
    } catch(e) {}
  }

  const dateStr = new Date(q.date).toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"long" });
  const phone = localStorage.getItem("userPhone") || "";
  const isAuteur = q.auteur === phone;
  const matNom = NOMS_MATIERES[q.matiere] || (q.matiere || "").replace(/_/g, " ");
  const tags = (q.tags || []).map(t => `<span class="forum-tag">${esc(t)}</span>`).join("");

  body.innerHTML = `
    <!-- Question principale -->
    <div style="background:var(--card);border-radius:16px;padding:16px;margin-bottom:14px;border:1px solid var(--border)">
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">
        <span style="background:rgba(109,40,217,0.1);color:var(--p);border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700">${matNom}</span>
        <span style="background:rgba(245,158,11,0.1);color:var(--gold2);border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700">${esc(q.classe || "")}</span>
        ${q.resolu ? `<span style="background:#d1fae5;color:#065F46;border-radius:6px;padding:3px 8px;font-size:10px;font-weight:700">✅ Résolu</span>` : ""}
      </div>
      <div style="font-weight:800;font-size:15px;color:var(--text);line-height:1.5;margin-bottom:10px">${esc(q.texte)}</div>
      ${tags ? `<div style="margin-bottom:10px">${tags}</div>` : ""}
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:10px;color:var(--t3)">👤 ${esc(q.pseudo || "Élève")} · ${dateStr}</div>
        <div style="display:flex;gap:6px">
          <button class="forum-like-btn" onclick="likerQuestion(${q.id},this)">👍 ${q.likes || 0}</button>
          ${isAuteur && !q.resolu ? `<button onclick="marquerResolu(${q.id})" style="background:rgba(16,185,129,0.1);color:#065F46;border:1.5px solid #10B981;border-radius:20px;padding:4px 10px;font-size:10px;font-weight:700;cursor:pointer">✅ Résolu</button>` : ""}
        </div>
      </div>
    </div>

    <!-- Réponses -->
    <div style="font-weight:800;font-size:12px;color:var(--t2);margin-bottom:10px">💬 ${reponses.length} réponse(s)</div>
    <div id="forum-reponses-list">
      ${reponses.length === 0
        ? `<div style="text-align:center;padding:20px;color:var(--t3);font-size:12px">Aucune réponse — sois le premier !</div>`
        : reponses.map(r => {
          const rDate = new Date(r.date).toLocaleDateString("fr-FR", { day:"numeric", month:"short" });
          return `<div class="forum-reponse-card ${r.best ? "best" : ""}">
            ${r.best ? `<div style="font-size:10px;font-weight:800;color:#065F46;margin-bottom:6px">⭐ Meilleure réponse</div>` : ""}
            <div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:8px">${esc(r.texte)}</div>
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div style="font-size:10px;color:var(--t3)">👤 ${esc(r.pseudo || "Élève")} · ${rDate}</div>
              <div style="display:flex;gap:6px;align-items:center">
                <button class="forum-like-btn ${(JSON.parse(localStorage.getItem('liked_r_'+r.id)||'false')) ? 'liked' : ''}"
                  onclick="likerReponse(${r.id},${q.id},this)">👍 ${r.likes || 0}</button>
                ${isAuteur && !q.resolu ? `<button onclick="marquerMeilleureReponse(${q.id},${r.id})" style="background:rgba(245,158,11,0.1);color:var(--gold2);border:1.5px solid var(--gold);border-radius:20px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer">⭐</button>` : ""}
              </div>
            </div>
          </div>`;
        }).join("")
      }
    </div>`;
}

// ── Soumettre une réponse ──
async function soumettreReponse() {
  const input = document.getElementById("fq-reponse-input");
  const texte = input?.value.trim();
  if (!texte) { showToast("❌ Écris ta réponse", "error"); return; }
  if (texte.length < 5) { showToast("❌ Réponse trop courte", "error"); return; }
  if (!forumQuestionOuverte) return;

  const phone = localStorage.getItem("userPhone") || "";
  const pseudo = localStorage.getItem("userPseudo") || phone || "Élève";
  const now = Date.now();

  const reponse = { id: now, texte, auteur: phone, pseudo, date: now, likes: 0, best: false };

  // Sauvegarder local
  const reps = JSON.parse(localStorage.getItem("forum_reponses_" + forumQuestionOuverte) || "[]");
  reps.push(reponse);
  localStorage.setItem("forum_reponses_" + forumQuestionOuverte, JSON.stringify(reps));

  // Mettre à jour nb_reponses sur la question
  const qs = JSON.parse(localStorage.getItem("forum_questions") || "[]");
  const q = qs.find(x => String(x.id) === String(forumQuestionOuverte));
  if (q) { q.nbReponses = (q.nbReponses || 0) + 1; localStorage.setItem("forum_questions", JSON.stringify(qs)); }

  // Sauvegarder Turso
  if (turso) {
    try {
      await turso.execute({
        sql: "INSERT OR IGNORE INTO forum_reponses (id, question_id, texte, auteur, pseudo, date, likes, best) VALUES (?,?,?,?,?,?,0,0)",
        args: [now, forumQuestionOuverte, texte, phone, pseudo, now]
      });
      await turso.execute({
        sql: "UPDATE forum_questions SET nb_reponses = nb_reponses + 1 WHERE id=?",
        args: [forumQuestionOuverte]
      });
    } catch(e) {}
  }

  if (input) input.value = "";
  showToast("✅ Réponse envoyée !", "success");
  ouvrirDetailQuestion(forumQuestionOuverte);
}

// ── Liker une question ──
async function likerQuestion(questionId, btn) {
  const key = "liked_q_" + questionId;
  if (localStorage.getItem(key)) { showToast("👍 Déjà liké !", "info"); return; }
  localStorage.setItem(key, "1");
  const qs = JSON.parse(localStorage.getItem("forum_questions") || "[]");
  const q = qs.find(x => String(x.id) === String(questionId));
  if (q) { q.likes = (q.likes || 0) + 1; localStorage.setItem("forum_questions", JSON.stringify(qs)); }
  if (btn) { btn.classList.add("liked"); btn.textContent = "👍 " + (q ? q.likes : 1); }
  if (turso) {
    try { await turso.execute({ sql: "UPDATE forum_questions SET likes = likes + 1 WHERE id=?", args: [questionId] }); } catch(e) {}
  }
}

// ── Liker une réponse ──
async function likerReponse(reponseId, questionId, btn) {
  const key = "liked_r_" + reponseId;
  if (localStorage.getItem(key)) { showToast("👍 Déjà liké !", "info"); return; }
  localStorage.setItem(key, "1");
  const reps = JSON.parse(localStorage.getItem("forum_reponses_" + questionId) || "[]");
  const r = reps.find(x => String(x.id) === String(reponseId));
  if (r) { r.likes = (r.likes || 0) + 1; localStorage.setItem("forum_reponses_" + questionId, JSON.stringify(reps)); }
  if (btn) { btn.classList.add("liked"); btn.innerHTML = "👍 " + (r ? r.likes : 1); }
  if (turso) {
    try { await turso.execute({ sql: "UPDATE forum_reponses SET likes = likes + 1 WHERE id=?", args: [reponseId] }); } catch(e) {}
  }
}

// ── Marquer résolu ──
async function marquerResolu(questionId) {
  const qs = JSON.parse(localStorage.getItem("forum_questions") || "[]");
  const q = qs.find(x => String(x.id) === String(questionId));
  if (q) { q.resolu = true; localStorage.setItem("forum_questions", JSON.stringify(qs)); }
  if (turso) {
    try { await turso.execute({ sql: "UPDATE forum_questions SET resolu=1 WHERE id=?", args: [questionId] }); } catch(e) {}
  }
  showToast("✅ Question marquée comme résolue !", "success");
  ouvrirDetailQuestion(questionId);
  renderForum();
}

// ── Marquer meilleure réponse ──
async function marquerMeilleureReponse(questionId, reponseId) {
  const reps = JSON.parse(localStorage.getItem("forum_reponses_" + questionId) || "[]");
  reps.forEach(r => { r.best = String(r.id) === String(reponseId); });
  localStorage.setItem("forum_reponses_" + questionId, JSON.stringify(reps));
  if (turso) {
    try {
      await turso.execute({ sql: "UPDATE forum_reponses SET best=0 WHERE question_id=?", args: [questionId] });
      await turso.execute({ sql: "UPDATE forum_reponses SET best=1 WHERE id=?", args: [reponseId] });
      await turso.execute({ sql: "UPDATE forum_questions SET resolu=1 WHERE id=?", args: [questionId] });
    } catch(e) {}
  }
  showToast("⭐ Meilleure réponse sélectionnée !", "success");
  ouvrirDetailQuestion(questionId);
}

// ── Créer les tables Turso si elles n'existent pas ──
async function initForumTurso() {
  if (!turso) return;
  try {
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS forum_questions (
      id INTEGER PRIMARY KEY, texte TEXT, matiere TEXT, classe TEXT,
      auteur TEXT, pseudo TEXT, tags TEXT, date INTEGER,
      likes INTEGER DEFAULT 0, nb_reponses INTEGER DEFAULT 0, resolu INTEGER DEFAULT 0
    )`, args: [] });
    await turso.execute({ sql: `CREATE TABLE IF NOT EXISTS forum_reponses (
      id INTEGER PRIMARY KEY, question_id INTEGER, texte TEXT,
      auteur TEXT, pseudo TEXT, date INTEGER,
      likes INTEGER DEFAULT 0, best INTEGER DEFAULT 0
    )`, args: [] });
  } catch(e) {}
}

// Initialiser le forum au démarrage
document.addEventListener("DOMContentLoaded", () => {
  initForumTurso();
});


// ========== RÉPARATION FICHIERS SANS URL ==========
async function scanFichiersManquants() {
  const resultsEl = document.getElementById("scan-results");
  if (!resultsEl) return;
  resultsEl.style.display = "block";
  resultsEl.innerHTML = `<div style="font-size:11px;color:#78350F;font-weight:700">⏳ Scan en cours (Turso + local)...</div>`;

  let sansFichier = [];

  // ── 1. Scanner Turso ──
  if (turso) {
    try {
      const res = await _tursoWithTimeout({
        sql: "SELECT id, titre, classe, mat FROM contenu WHERE (fichier_url IS NULL OR fichier_url='') AND (contenu NOT LIKE '[VIDEO:%') ORDER BY date DESC",
        args: []
      }, 6000);
      if (res.rows && res.rows.length > 0) {
        for (const r of res.rows) {
          sansFichier.push({ id: r.id||r[0], titre: r.titre||r[1]||"Sans titre", classe: r.classe||r[2]||"", mat: r.mat||r[3]||"", source: "turso" });
        }
      }
    } catch(e) {
      resultsEl.innerHTML += `<div style="font-size:10px;color:#92400E;margin-bottom:6px">⚠️ Turso inaccessible : ${e.message}</div>`;
    }
  }

  // ── 2. Scanner localStorage (dédupliqué) ──
  const publies = getContenuPublie();
  for (const c of publies) {
    if (!c.fichierUrl && !c.fichierData && c.contenu && !c.contenu.startsWith("[VIDEO:")) {
      if (!sansFichier.find(x => String(x.id) === String(c.id))) {
        sansFichier.push({ id: c.id, titre: c.titre||"Sans titre", classe: c.classe||"", mat: c.mat||"", source: "local" });
      }
    }
  }

  if (!sansFichier.length) {
    resultsEl.innerHTML = `<div style="font-size:11px;color:#065F46;font-weight:700;padding:8px;background:#d1fae5;border-radius:8px">✅ Tous les fichiers ont une URL valide !</div>`;
    return;
  }

  resultsEl.innerHTML = `
    <div style="font-size:11px;color:#92400E;font-weight:700;margin-bottom:8px">⚠️ ${sansFichier.length} fichier(s) sans URL :</div>
    ${sansFichier.map(c => `
      <div style="background:white;border-radius:10px;padding:10px;margin-bottom:8px;border:1px solid #FCD34D">
        <div style="font-weight:700;font-size:11px;color:#1a1a1a;margin-bottom:2px">📄 ${esc(c.titre)}</div>
        <div style="font-size:10px;color:#78350F;margin-bottom:6px">${esc(c.classe)} · ${esc((c.mat||"").replace(/_/g," "))} · ID:${c.id}</div>
        <div style="display:flex;gap:6px;align-items:center">
          <input type="text" id="url-fix-${c.id}" placeholder="Colle le lien Cloudinary ici..."
            style="flex:1;background:#f9f9f9;border:1px solid #e0e0e0;border-radius:8px;padding:7px 10px;font-size:16px;color:#333">
          <button onclick="appliquerUrlFix('${c.id}')"
            style="background:#6D28D9;color:white;border:none;border-radius:8px;padding:7px 12px;font-size:11px;font-weight:800;cursor:pointer;flex-shrink:0;min-height:36px">
            ✅ OK
          </button>
        </div>
        <div id="url-fix-status-${c.id}" style="font-size:10px;color:#059669;margin-top:4px;display:none">✅ URL mise à jour !</div>
      </div>`).join("")}`;
}

async function appliquerUrlFix(id) {
  const input = document.getElementById("url-fix-" + id);
  const statusEl = document.getElementById("url-fix-status-" + id);
  const url = input?.value.trim();

  if (!url || !url.startsWith("http")) {
    showToast("❌ URL invalide — doit commencer par http", "error");
    return;
  }

  // Mettre à jour dans localStorage
  const publies = getContenuPublie();
  const idx = publies.findIndex(p => String(p.id) === String(id));
  if (idx >= 0) {
    publies[idx].fichierUrl = url;
    publies[idx].fichierType = url.includes(".pdf") ? "application/pdf" : "application/octet-stream";
    localStorage.setItem("contenu_publie", JSON.stringify(publies));
  }

  // Mettre à jour dans Turso
  if (turso) {
    try {
      await turso.execute({
        sql: "UPDATE contenu SET fichier_url=?, fichier_type=? WHERE id=?",
        args: [url, url.includes(".pdf") ? "application/pdf" : "application/octet-stream", id]
      });
    } catch(e) {}
  }

  if (statusEl) statusEl.style.display = "block";
  if (input) { input.disabled = true; input.style.background = "#f0fdf4"; }
  showToast("✅ URL mise à jour pour ce fichier !", "success");
}


// ========== GUIDE D'UTILISATION TÉLÉCHARGEABLE (PDF) ==========
// PDF encodé en base64 et embarqué directement dans le code (même
// principe que les icônes du manifest PWA) pour que le téléchargement
// fonctionne même hors-ligne, sans dépendre de Cloudinary/Turso.
const GUIDE_LEARNUPR_PDF_B64 = "JVBERi0xLjQKJZOMi54gUmVwb3J0TGFiIEdlbmVyYXRlZCBQREYgZG9jdW1lbnQgKG9wZW5zb3VyY2UpCjEgMCBvYmoKPDwKL0YxIDIgMCBSIC9GMiAzIDAgUiAvRjMgNCAwIFIgL0Y0IDcgMCBSCj4+CmVuZG9iagoyIDAgb2JqCjw8Ci9CYXNlRm9udCAvSGVsdmV0aWNhIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMSAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjMgMCBvYmoKPDwKL0Jhc2VGb250IC9aYXBmRGluZ2JhdHMgL05hbWUgL0YyIC9TdWJ0eXBlIC9UeXBlMSAvVHlwZSAvRm9udAo+PgplbmRvYmoKNCAwIG9iago8PAovQmFzZUZvbnQgL0hlbHZldGljYS1Cb2xkIC9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nIC9OYW1lIC9GMyAvU3VidHlwZSAvVHlwZTEgL1R5cGUgL0ZvbnQKPj4KZW5kb2JqCjUgMCBvYmoKPDwKL0NvbnRlbnRzIDEzIDAgUiAvTWVkaWFCb3ggWyAwIDAgNDE5LjUyNzYgNTk1LjI3NTYgXSAvUGFyZW50IDEyIDAgUiAvUmVzb3VyY2VzIDw8Ci9Gb250IDEgMCBSIC9Qcm9jU2V0IFsgL1BERiAvVGV4dCAvSW1hZ2VCIC9JbWFnZUMgL0ltYWdlSSBdCj4+IC9Sb3RhdGUgMCAvVHJhbnMgPDwKCj4+IAogIC9UeXBlIC9QYWdlCj4+CmVuZG9iago2IDAgb2JqCjw8Ci9Db250ZW50cyAxNCAwIFIgL01lZGlhQm94IFsgMCAwIDQxOS41Mjc2IDU5NS4yNzU2IF0gL1BhcmVudCAxMiAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKNyAwIG9iago8PAovQmFzZUZvbnQgL1N5bWJvbCAvTmFtZSAvRjQgL1N1YnR5cGUgL1R5cGUxIC9UeXBlIC9Gb250Cj4+CmVuZG9iago4IDAgb2JqCjw8Ci9Db250ZW50cyAxNSAwIFIgL01lZGlhQm94IFsgMCAwIDQxOS41Mjc2IDU5NS4yNzU2IF0gL1BhcmVudCAxMiAwIFIgL1Jlc291cmNlcyA8PAovRm9udCAxIDAgUiAvUHJvY1NldCBbIC9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUkgXQo+PiAvUm90YXRlIDAgL1RyYW5zIDw8Cgo+PiAKICAvVHlwZSAvUGFnZQo+PgplbmRvYmoKOSAwIG9iago8PAovQ29udGVudHMgMTYgMCBSIC9NZWRpYUJveCBbIDAgMCA0MTkuNTI3NiA1OTUuMjc1NiBdIC9QYXJlbnQgMTIgMCBSIC9SZXNvdXJjZXMgPDwKL0ZvbnQgMSAwIFIgL1Byb2NTZXQgWyAvUERGIC9UZXh0IC9JbWFnZUIgL0ltYWdlQyAvSW1hZ2VJIF0KPj4gL1JvdGF0ZSAwIC9UcmFucyA8PAoKPj4gCiAgL1R5cGUgL1BhZ2UKPj4KZW5kb2JqCjEwIDAgb2JqCjw8Ci9QYWdlTW9kZSAvVXNlTm9uZSAvUGFnZXMgMTIgMCBSIC9UeXBlIC9DYXRhbG9nCj4+CmVuZG9iagoxMSAwIG9iago8PAovQXV0aG9yIChMZWFyblVwcikgL0NyZWF0aW9uRGF0ZSAoRDoyMDI2MDcwODIwMzcxMSswMCcwMCcpIC9DcmVhdG9yIChcKHVuc3BlY2lmaWVkXCkpIC9LZXl3b3JkcyAoKSAvTW9kRGF0ZSAoRDoyMDI2MDcwODIwMzcxMSswMCcwMCcpIC9Qcm9kdWNlciAoUmVwb3J0TGFiIFBERiBMaWJyYXJ5IC0gXChvcGVuc291cmNlXCkpIAogIC9TdWJqZWN0IChcKHVuc3BlY2lmaWVkXCkpIC9UaXRsZSAoR3VpZGUgZCd1dGlsaXNhdGlvbiBMZWFyblVwcikgL1RyYXBwZWQgL0ZhbHNlCj4+CmVuZG9iagoxMiAwIG9iago8PAovQ291bnQgNCAvS2lkcyBbIDUgMCBSIDYgMCBSIDggMCBSIDkgMCBSIF0gL1R5cGUgL1BhZ2VzCj4+CmVuZG9iagoxMyAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCA0NDkKPj4Kc3RyZWFtCkdhdCRyOTJFRGkmQUltP2JZOUFJXD9pTmZYLDIvPSIlZzFHV0RILUYnV0NaXl5OWG05T1YyLDQySklAM2MkWVFpIVlHcD1tckFnKj1NVmcxIUQrXWo1Uko1PzFPKENUNmUzSXRGYkcvQisnQk9xKG0oUnFUYU1UXjhJIW1DQ25SQWpYP2puRis8QGFDYiE8NGNhZkh1SGsmJyJtNjpxWF9FYDMicDZoKDJyMWZEWVBrV2tkdClRLzhqcClKImVsTmlncTIzQTdfQipcP3JVJUQqYSM6KmIvMjUjLE04T1tccENfSSQqMzdQMltPMD8hRG9lWz49b1RVSS02X24vM28tYWZDIi5pN1snTFEyXCg2R2tbNXBKbVk0RS1Bb0JVJykzYEA/Q1kiQVlDQksnVCFeUCdrY0cidUlFaWQ9N1ZMWFk9Xk9fZUhHRktcRyxuamByI2UnKFFXXjZTWVwwJW4vWDcldVpLNz5aLWUlOFNkLVReMyclSkslNC5OWD9aJFNubFlATD9oSTpcJT0ucmYzXzlhZUtET3FdXFI4Lko1UjRLKDtgMSVNcEtoMUVeVDlVPFImOiY+JW0hNGRfI34+ZW5kc3RyZWFtCmVuZG9iagoxNCAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAxNzc0Cj4+CnN0cmVhbQpHYXUwQzlsbyZJJkFAc0JtJj0jSCQ0TUlCXEt1LkFSPnNAT0BQdGpvIWBRPVQkcTg7XWwobjpOSS9saXFaNmAuXWdzSUJXJjwiTl5MWV1GaStIRSlgczYhJUxHO0Q7VytAbyVsaDMmJUg4QCZcTTU8SEQ7bCI6VkVcWilcMWNAUkg+aisoNVNaT2owPihoP09fQS9CLTdrZTJtIkFuYEBoT3NwZFUzL2hSW1VyZTxrW2V0MlhrdXU1XzxiZT0iXjdzOl5SZjJTWEomSjQ6Sy5wYlMpWSZuNVJCXDEjMHUuN2VhWGxPPjdTSlVcT1YraUglMEkyK2ZVWXQpcCxpLV8mPEhxKmo6OyxWMFJAQVJIKj5DbDtyKFVxISxbOz4lNz9wOShrVEtcaGVza25qMWw8QDk+UTxRTS5QVExUbWNlMVYiPl5vJ1MkMnIsblU9Yj8wdVxETUFZNT0uQ2RILjYmX11zTHFwRGhoJmhdUCR0OlFxNWYjRW1KTnEjbVNfKGk6Q2dBdSFTPnQsPjBZKHBsPFJQL2dXJltrJz83Zy4mVidhYUBgU15LNiYuKSkmUUA7bzMvZi5ON1VaZnJmYnA5SnI+PkloP2YvPlJ1YGgxUCpBVGBAJ0NSVW1cbXFTaUYuQk5xV1FEUnA2PmEnOldwU04sJ2xAczFBNTNDVUddKFMwRDxwLEleYi9VJkUiM1xdZC5fUEwvPE40WzFkZzlVVis2XG9ZLSUibDxmPGYzI0BWPztqVzRRaGYoTkgzTilTJ1k4Sy4yQEErJGY4U2VRaWxMZ2RXT1RGZl1GaSQ8KEdcbFNPVi5PLEoiJjU/JWBKZEo0OT5mOTxMR10kSWdaXlY2WURJXy9jaF5IKWNUYVM2JXBNcTgrNF4lQi1JLCovXihhUCk/UkYycm0sUSl0ZyZmMGMuVCo+KDUhS2VyMGdXWjBLcSU6Ki9OMiFvPFU5dE8hVGIxKSpeXCVWJDkpUT8vWmVbZD1oaClhUlQ4JEtRTkg8W1hDPy0qVzlOJ2xBck8tZFQsTVdVcT9PYVU2Py1rTjhyaT1pIzJFOnVSXWssV2w/W1ttT0RlWkM5SEsrM25LZEt1MWZVTTpLN2FEI05CZSooO2k4UzMhTWk1OzgmayJNR0U4M3NTI2NfXmBycyw2Jio7NkkiREhPNVRvSjEjcytPW2pNIlEpNEtKO1dfLjBfNmNqZSM8RDowXTFNRCE4KWp1PypQQz8xU0FASClHOzJqN11pKUJrZD5bV0xrNFtBQFlKWj1ZTiFnTVY7MScoY2FnZFJBLCxZSzM4RlAsT14lQkBPa3Q0PSZeYV0sciZLTV9sbVomWUFmO25kSmlOXzxMaV9xLUNAYHU+JSU/JG1OK2BwW1E6YitxaSFMR0RvTFYsUzI8X15fMiwmQyclXFNiWGolPzgxXWdKcCwuVVVRalA8VTEuL1ZQMVZBb1pgLnQtZzcyJClRc3BqVjc2XEReLDJbYylsam06KmtcJGByW1IjbjhmJVlXZC91NlY6SF1vYkYtKyY7Yy5CSCxbKWFVcC9xIU9jN29FQldpZVZiJ2BRUFk2ajpJQC1sR2NrVEIqWCwvb3VBPEhuR2Y2ZzhgVjJLK2VRRkEuLWVeaD5wRzspJj5Ib0VWYG9HPVhuKyJETS1Da0djUz11bywrQl9PNUpzRHIlNXJoLFoybS5cVXFpSGdtVWovOzpYYXFLajdsYXVfc2o8aHEvZFZVRCVPM0lfNiYySnBudHJPJT4mVkVrUHJIb1JhRTo9P08+WC1gLzp0bUZoZyJUVmovRShURXNuLypWWUpIXXU8b3NCNXM4UkVibVNcbydvZiZwbygoYGk5TUBYQWxbVUxZKSFJRmNCX0VVUFcxPHE/MkxAcnJPcFI9aDhSXiRROlBJZGxyTlQzLEdsYDYjMjhoTlE8aHM4RlFLc0RAZ0EqPmM5XE9WRkIvKFtgXUluLjFyZFgtJTA8b2cvQG9OZyFLUTRzITcuYVg4KDA/L2YwYDVVXippQik9LCRoQTBWS3BcJGdMSmtFQCIsWTxVXmZrPkhNP0JCIygjPm81MEVKPy4wWz4ySTdOLDZVM2ElUD5CUC41ZnU2NGJFW1JiMzhtb1hHMlZmb0opbTQ2Oj1KWSo7ayNyUW5nLD5UIz0qSDRGa09PTlZLP0M4RDtpK0plRDhyOC9vZ1NbYm5vZUduWmF0T09MZU0pcnBbI1ddVlomNHFOUy5XTE9FQ01pLFUlYkRXaDRIY3M4ajNaOFVdPFhWYjFNVDpMcSQ9LD4qOCdRWipgZDRiVGwqKTBmdDlMJzFbJyxWL2xFW3FcXVRGckk3KGo2YklLKXRYOHMuYmQtIU1wdSppcn4+ZW5kc3RyZWFtCmVuZG9iagoxNSAwIG9iago8PAovRmlsdGVyIFsgL0FTQ0lJODVEZWNvZGUgL0ZsYXRlRGVjb2RlIF0gL0xlbmd0aCAxNjUyCj4+CnN0cmVhbQpHYiEjWz8jU0lVJ1JlPDJcNTAvKFwxQzQuWklHM2FoM25AM1x1KEN0XiVkO2RCcFhPZlU1dVxbcEgsMCU8REsoJm02ImMxJmtGOWpGWysvM3BJWiI7OlxhdDVOOUtyKT9DaE47UDMtTm0rVWAiNTYjWW01Ml5kQE4pLGtFJ2ZyaFlINzwnIlEkWTBuMC4yRSxFJ0c0PWFwT0xuIihVSnE6SkkiZmQvLXIiKVUzVDRsJF9zZCM2V3FmJ2FyLUlqQGpqPTVxJ1ZVcUdHYTlYVjdjby9Ra0NTWVVjPkxpKmwyIW9tPSc6XU5gMEBXNW5sLG9LN21RJThYNiJCbytSRVhIa3FMVScnMjdSRnJWbicqOVs8VFNiRmJsYDkwRihVRSwlJjs4P0hPMEAvYlRjbTg+dGdqKyEuSWhbbEpmOyVRTGZnMF5iLkMkOT9SQEJYY0dNWHJwQHVKIXNgP1sraj5HS3ErWm4xZGZqREAmVkMoVmprQGJdQ2taLFBzVml0OThmaVQ9XU9YRFJmZVJyUlYmT2kqVGdDczgrXj5hTWo0PSUuPT0ybkVdQj0+UUBeWl1SN0xaSlkzSCQkRzJ1YllhXUQ8PXB0TiF1cT1HSixYVG1LUk5QP2lmblMuOiREdW02YjIiS0UmMj4laC90bjRqMkNyZ1c7OjAwR01SdWI4SmU+MzJyJjVBSGdjSUFPO1RNYGA8cTBMWW8iWEo4T05mWTlTZCgnJ2VwR1lKSShgNiFrcmZyI21kJWUqQDFCJSNUOmw7PTdNL09RZllaVUdETk5dSkptQD1gYjFxMDgrSmQ8JScxLlhWUkBxI2FGI3NXSG5gO0tLT1dBYCtkQ0gxTWJaTXMkWD5xakUwM1A/KGxyNyRURyZNbShXWlxRIkpdPHVnIk1uQ0I2cSspTkQ2PVhyKWhTaTk5I2YjNyJgPi5BPTtfbzI/UyZWRm4vVCw1KkNJYCs6PjxyIT8lLDNFSSQ0MF4hVmxdbDgoL1dOJzknVltDKV0tZSRaP08xK05JLz1haTFCcmQnQF1yQz9JK0AxSExAIVlNNlcnX2oqKltcZDlgKiJqOyc3aG4tVUdRRlJgbTREY0s4bHMhO2J0UiFALyReVlNjaCYuUEthOmBxZDVLIV9YYFd1aD8nYV9VZ1JlKyJSKU5SPXJ0Vl5PVUokQjhDNigyN29fTjUwcWtMSkkmRnAmSyhJU2NNalRVRilKMURXN04jbyMrLlQuTT9bJkcxaiEiKDNAa0QkYzNhLD9Caz0nNkY9LnBZbmgoYF8mJUQoO245P2trVVptPTZoV1hhVkswVUM1TnUnNV4/XTo/VEJeVD1ySWFpbCpASz5gWkhrJFdvWig1WUZYQmhuYzIibV1CNTo7azwpMGhtYytkWjw8W15gVzUlckVQK1M9ZzsiWEQiYWRnaTEoZCQycTUnaWpXUDhLblk3PmYsUGAvNFwsYmItL0dOPzpeRTAiYShZWF5kZCg+ZyY8biIzXVEnZzstY2R1KFItWGt1XTMpOSwwISwsRyJZSDQ7OyknRVBMO2dKM3NoPEJBMV1xNm5BaD0pYGBdMktQT24kRjlLTWhSKV81IS5WdEtKNTEsQ0hdNiIuOUFwMF5UbWAtXig9b3VCI0csQl1FODJGYj1BNW02L3MtIk9xVDFjTVJSWkhMKHFaP1gvLEsuPERYK1I2VW5aWmtzKmQ3YDNeazVmTm5kcHJSIlVpUnEoWyFvPEdVcycuaUlUV2xMYD9ZPGw2Y11LMSFEciQ4NS8+KFJiSD09JCphPjZMdE4yTDg3LVw1UzFIYW5yRTtSNj9cckRoQyUtN1A2YTg0Yk1AbUI1ZWFSIkI2RFpVJUQmUnQ/OTBUYGg9YjFaanBTJGxdLzk6JD07SS9QTXItZFFOU18yLyRxLlUsSSRBQ0hudFwxM1teY1c/VD4mJCgqJERMUS06YVBKLD1cazI/ISdjM2NhOEJqNTlLQkRRZTs+QC43XGheO0pNOEVwUlYmKi0yYm5gZHBoYWdJMG47KEpcXFFAWSNDLCdiYjE3cD0vLkZJaG1EajZQai8rQyJZSFdvaC80IitlIk0pKTU/JFIyW0FbPz5bLCMtU1NjZjVyMD42QWhlYWswIkM8Tm9dUmVxMSdGPGlLJidkL3EpciN1RVcrIi8uWz8lMGAzTW0vOGdJZlM3bS4lVTg8R1Zvcj1+PmVuZHN0cmVhbQplbmRvYmoKMTYgMCBvYmoKPDwKL0ZpbHRlciBbIC9BU0NJSTg1RGVjb2RlIC9GbGF0ZURlY29kZSBdIC9MZW5ndGggNDA2Cj4+CnN0cmVhbQpHYXNiVTBsT29fJjs+PVdgVG91RGVccTE3OF1LMkVWMCZac0RDYyJJI1F0V2oiTFw5REcqR0FyOzVwaktLQ0E3KEk8UVomMzR0Nk80WVNhXGJXKitfcSNWcDUwUVhtcWQ7ZFpJO1BtblFuKHNJMzNuIl44TU9bIUwsRkpxQjsmLT9lR05xPEAvPGE9KkE1Ji41JUM9KiJtVkx1TCVpI2pIVWNAI0RKYVFzVDBGcSVXLENKMlFPQ0M3TCNzZW1DIjspL1ZEXGw2UUw0XEhBT1tyJmAwXShJazIwakIsL2NlQypQRjpkSkZlZnNQOTk2WmlCPWxqNWVRQS1vNCZjVGVHXVBvX0MnVCovLmghLDlCWyc9YmlfbWQ/Y14zb1tqKSMoTS8uRTtDO2JAcjhOck5BJEpCPHFdNSIsI2QiQTpfTidbZ1RBXXAmOTwuY05MailuXURESHIyZHApZmUhWUYkIzUnX3MvX2FDcy1HWl9IY1MyMlYpKT5pK19BZzZXZ3EibWFxO1txLT5vW04uKGRmWGQ7UX4+ZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgMTcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDYxIDAwMDAwIG4gCjAwMDAwMDAxMjIgMDAwMDAgbiAKMDAwMDAwMDIyOSAwMDAwMCBuIAowMDAwMDAwMzEyIDAwMDAwIG4gCjAwMDAwMDA0MjQgMDAwMDAgbiAKMDAwMDAwMDYyOSAwMDAwMCBuIAowMDAwMDAwODM0IDAwMDAwIG4gCjAwMDAwMDA5MTEgMDAwMDAgbiAKMDAwMDAwMTExNiAwMDAwMCBuIAowMDAwMDAxMzIxIDAwMDAwIG4gCjAwMDAwMDEzOTEgMDAwMDAgbiAKMDAwMDAwMTY4MiAwMDAwMCBuIAowMDAwMDAxNzYwIDAwMDAwIG4gCjAwMDAwMDIzMDAgMDAwMDAgbiAKMDAwMDAwNDE2NiAwMDAwMCBuIAowMDAwMDA1OTEwIDAwMDAwIG4gCnRyYWlsZXIKPDwKL0lEIApbPGVjYzA4NjQ0ZmZmYzNhNDViNTY5OWVjNGZhMTkwYmRlPjxlY2MwODY0NGZmZmMzYTQ1YjU2OTllYzRmYTE5MGJkZT5dCiUgUmVwb3J0TGFiIGdlbmVyYXRlZCBQREYgZG9jdW1lbnQgLS0gZGlnZXN0IChvcGVuc291cmNlKQoKL0luZm8gMTEgMCBSCi9Sb290IDEwIDAgUgovU2l6ZSAxNwo+PgpzdGFydHhyZWYKNjQwNwolJUVPRgo=";

function telechargerGuideLearnUpr() {
  try {
    const byteChars = atob(GUIDE_LEARNUPR_PDF_B64);
    const byteNumbers = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Guide-LearnUpr.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    showToast("📘 Guide téléchargé !", "success");
  } catch(e) {
    console.warn("[Guide LearnUpr] Erreur téléchargement:", e);
    showToast("❌ Impossible de télécharger le guide", "error");
  }
}

// ========== ONBOARDING PREMIER LANCEMENT ==========
// Affiché une seule fois par appareil (flag localStorage), avant l'accès à
// la page principale — répond au retour terrain (2026) : les élèves,
// notamment en grandes classes, ne comprenaient ni comment entrer leur
// numéro ni comment naviguer entre les onglets faute d'explication au
// premier lancement.
const ONBOARDING_FLAG = "lu_onboarding_vu";
let _onbSlideActuel = 0;
const ONB_TOTAL_SLIDES = 4;

function onboardingDemarrerSiPremierLancement() {
  try {
    if (localStorage.getItem(ONBOARDING_FLAG)) return;
  } catch(e) { return; }
  const overlay = document.getElementById("onboardingOverlay");
  if (!overlay) return;
  _onbSlideActuel = 0;
  overlay.classList.add("show");
}

function _onbAfficherSlide(n) {
  document.querySelectorAll(".onb-slide").forEach(el => {
    el.style.display = (Number(el.dataset.slide) === n) ? "block" : "none";
  });
  document.querySelectorAll(".onb-dot").forEach(el => {
    const actif = Number(el.dataset.dot) === n;
    el.style.background = actif ? "var(--p)" : "var(--border)";
    el.style.width = actif ? "18px" : "8px";
    el.style.borderRadius = actif ? "4px" : "50%";
  });
  const nextBtn = document.getElementById("onbNextBtn");
  if (nextBtn) nextBtn.textContent = (n === ONB_TOTAL_SLIDES - 1) ? "Commencer 🚀" : "Suivant";
}

function onboardingSuivant() {
  _onbSlideActuel++;
  if (_onbSlideActuel >= ONB_TOTAL_SLIDES) { onboardingFermer(); return; }
  _onbAfficherSlide(_onbSlideActuel);
}

function onboardingFermer() {
  try { localStorage.setItem(ONBOARDING_FLAG, "1"); } catch(e) {}
  const overlay = document.getElementById("onboardingOverlay");
  if (overlay) overlay.classList.remove("show");
  _verifierEntreeNumero();
}

// ========== MODAL NUMÉRO À L'ENTRÉE ==========
function _verifierEntreeNumero() {
  let dejaConnu = false;
  try { dejaConnu = !!localStorage.getItem("userPhone"); } catch(e) { return; }
  if (dejaConnu) return;
  const m = document.getElementById("entryPhoneModal");
  if (m) m.classList.add("show");
}
async function entryPhoneSubmit() {
  const val = document.getElementById("entryPhoneInput").value.trim();
  if (!val || !/^[0-9]{9}$/.test(val)) {
    showToast("❌ Numéro invalide (9 chiffres)", "error");
    return;
  }
  const li = document.getElementById("loginPhone");
  if (li) li.value = val;
  await loginUser();
  if (localStorage.getItem("userPhone") === val) {
    const m = document.getElementById("entryPhoneModal");
    if (m) m.classList.remove("show");
    updateProfilStatus();
  }
}
function entryPhoneSkip() {
  const m = document.getElementById("entryPhoneModal");
  if (m) m.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", () => {
  _onbAfficherSlide(0);
  let onboardingDejaVu = false;
  try { onboardingDejaVu = !!localStorage.getItem(ONBOARDING_FLAG); } catch(e) {}
  if (!onboardingDejaVu) {
    onboardingDemarrerSiPremierLancement();
  } else {
    _verifierEntreeNumero();
  }
});

// Exposition sur window : requis car main.js est chargé en type="module",
// les fonctions ne sont pas globales par défaut — les onclick="..." du HTML
// (boutons Suivant/Passer de l'onboarding) en ont besoin pour fonctionner.
window.onboardingSuivant = onboardingSuivant;
window.onboardingFermer = onboardingFermer;
window.onboardingDemarrerSiPremierLancement = onboardingDemarrerSiPremierLancement;
window.dismissPremHint = dismissPremHint;
window.positionPremHint = positionPremHint;
window.updatePremHint = updatePremHint;
window.entryPhoneSubmit = entryPhoneSubmit;
window.entryPhoneSkip = entryPhoneSkip;

// ========== VIDÉO-CONFÉRENCE (Jitsi Meet) ==========
const VISIO_JITSI_BASE = "https://meet.jit.si/";
const VISIO_RECENT_KEY = "learnupr_visio_recentes";

function ouvrirVideoConference() {
  // Pré-remplir avec un nom de salle basé sur le numéro et la date
  const phone = localStorage.getItem("userPhone") || "";
  const today = new Date().toLocaleDateString("fr-FR").replace(/\//g, "-");
  const defaut = "LearnUpr-" + (phone ? phone.slice(-4) : "Eleve") + "-" + today;
  const input = document.getElementById("visio-room-name");
  if (input && !input.value) input.value = defaut;
  visioUpdateRoomPreview();
  _chargerSallesRecentes();
  document.getElementById("visioModal").classList.add("show");
}

function fermerVisio() {
  document.getElementById("visioModal").classList.remove("show");
}

function visioUpdateRoomPreview() {
  const input = document.getElementById("visio-room-name");
  const preview = document.getElementById("visio-room-preview");
  const linkSpan = document.getElementById("visio-room-link");
  if (!input || !preview || !linkSpan) return;
  const val = input.value.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_]/g, "");
  if (val.length > 2) {
    linkSpan.textContent = VISIO_JITSI_BASE + val;
    preview.style.display = "block";
  } else {
    preview.style.display = "none";
  }
}

function lancerVisio() {
  const input = document.getElementById("visio-room-name");
  const nom = (input?.value || "").trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_]/g, "");
  if (!nom || nom.length < 3) {
    showToast("❌ Donne un nom à ta salle (min. 3 caractères)", "error"); return;
  }
  const url = VISIO_JITSI_BASE + nom;
  _sauvegarderSalleRecente(nom, url);
  window.open(url, "_blank", "noopener,noreferrer");
  showToast("📹 Salle ouverte — partage le code : " + nom, "success");
  // Poster un message dans le forum pour informer les autres
  _publierVisioForum(nom, url);
}

function rejoindreVisio() {
  const code = (document.getElementById("visio-join-code")?.value || "").trim();
  if (!code) { showToast("❌ Entre le code ou lien de la salle", "error"); return; }
  let url;
  if (code.startsWith("http://") || code.startsWith("https://")) {
    url = code;
  } else {
    const clean = code.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9\-_]/g, "");
    url = VISIO_JITSI_BASE + clean;
  }
  window.open(url, "_blank", "noopener,noreferrer");
  showToast("📹 Connexion à la salle en cours...", "info");
}

function _sauvegarderSalleRecente(nom, url) {
  try {
    let recentes = JSON.parse(localStorage.getItem(VISIO_RECENT_KEY) || "[]");
    recentes = recentes.filter(r => r.nom !== nom);
    recentes.unshift({ nom, url, date: Date.now() });
    if (recentes.length > 5) recentes = recentes.slice(0, 5);
    localStorage.setItem(VISIO_RECENT_KEY, JSON.stringify(recentes));
    _chargerSallesRecentes();
  } catch(e) {}
}

function _chargerSallesRecentes() {
  try {
    const recentes = JSON.parse(localStorage.getItem(VISIO_RECENT_KEY) || "[]");
    const container = document.getElementById("visio-recent-rooms");
    const list = document.getElementById("visio-recent-list");
    if (!container || !list) return;
    if (recentes.length === 0) { container.style.display = "none"; return; }
    container.style.display = "block";
    list.innerHTML = recentes.map(r => {
      const d = new Date(r.date).toLocaleDateString("fr-FR");
      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-weight:700;font-size:12px">${esc(r.nom)}</div>
          <div style="font-size:10px;color:var(--t3)">${d}</div>
        </div>
        <button onclick="window.open('${r.url}','_blank','noopener,noreferrer');showToast('📹 Ouverture...','info')"
          style="background:var(--p);color:white;border:none;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer">
          ▶ Rejoindre
        </button>
      </div>`;
    }).join("");
  } catch(e) {}
}

function _publierVisioForum(nom, url) {
  // Poster un message automatique dans le forum local pour informer les autres élèves
  try {
    const phone = localStorage.getItem("userPhone") || "Anonyme";
    const questions = JSON.parse(localStorage.getItem("forum_questions") || "[]");
    questions.unshift({
      id: Date.now(),
      auteur: phone,
      classe: localStorage.getItem("userClasse") || "Toutes",
      matiere: "Général",
      texte: `📹 Vidéo-conférence en direct !\nSalle : ${nom}\nLien : ${url}\n\nRejoins-moi pour réviser ensemble !`,
      tags: ["visio","direct","cours-en-ligne"],
      date: Date.now(),
      reponses: [],
      likes: 0,
      resolu: false,
      estVisio: true
    });
    localStorage.setItem("forum_questions", JSON.stringify(questions));
    if (typeof renderForum === "function") setTimeout(renderForum, 300);
  } catch(e) {}
}

// ========== ZIP IMPORT ==========
let zipFilesData = []; // stocke les fichiers analysés
let csvVideoData = []; // stocke les vidéos détectées dans l'aperçu CSV (avec leur statut premium modifiable)
let _zipDernierIndexVu = -1; // index de la dernière carte "à compléter" visitée (navigation rapide)

function handleZipDrop(e) {
  e.preventDefault();
  document.getElementById("zipDropZone").classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) traiterZip(file);
}

async function traiterZip(file) {
  if (!file || !file.name.endsWith(".zip")) {
    showToast("❌ Fichier invalide — sélectionne un .zip", "error");
    return;
  }
  showToast("⏳ Analyse du ZIP en cours...", "info");

  // Lire le ZIP avec JSZip (CDN)
  if (!window.JSZip) {
    await chargerJSZip();
  }

  try {
    const zip = await JSZip.loadAsync(file);
    zipFilesData = [];
    _zipDernierIndexVu = -1;
    const promises = [];
    let ordreOrigine = 0;

    zip.forEach((relativePath, zipEntry) => {
      if (zipEntry.dir) return;
      const ext = relativePath.split(".").pop().toLowerCase();
      // Modérateurs/admin (seuls à avoir accès à l'import ZIP) : PDF, images
      // et désormais Word (.docx) — voir _mimeTypePourFichier et
      // publierFichierZip pour la gestion du type MIME selon l'extension.
      // NB : Gemini et pdf.js (analyse de CONTENU) ne savent traiter que
      // PDF/JPG/PNG ; pour un .docx, seule l'analyse du NOM de fichier
      // (analyserNomFichier) s'applique — voir _iaAnalyserAvecGemini et
      // _iaExtraireTextePDF, qui sautent silencieusement les .docx.
      if (!["pdf","jpg","jpeg","png","docx"].includes(ext)) return;
      const ordre = ordreOrigine++;
      promises.push(
        zipEntry.async("blob").then(blob => {
          const info = analyserNomFichier(relativePath);
          zipFilesData.push({ ...info, blob, relativePath, ext, size: blob.size, ordre });
        })
      );
    });

    await Promise.all(promises);

    if (!zipFilesData.length) {
      showToast("❌ Aucun fichier PDF/JPG/PNG trouvé dans le ZIP", "error");
      return;
    }

    // Remettre dans l'ordre d'origine du ZIP (Promise.all ne le garantit pas,
    // chaque fichier étant décompressé en parallèle).
    zipFilesData.sort((a, b) => a.ordre - b.ordre);

    // ⚠️ SUPPRIMÉ (2026, décision Jean) : il existait ici un système
    // d'"héritage par dossier" qui copiait classe/matière du fichier
    // PRÉCÉDENT du même dossier quand le nom d'un fichier ne donnait rien
    // (ex: "vhhh.pdf", "cc.pdf"). Problème réel observé : ce système remplit
    // f.classes/f.matiere AVANT que Gemini n'ait la moindre chance d'analyser
    // le contenu réel du fichier — et comme _iaAutoCompletionZip() ne lance
    // Gemini QUE sur les fichiers encore "incomplets" (!f.matiere), un
    // fichier ayant hérité à tort de la matière de son voisin (ex: "Espagnol"
    // hérité sur un fichier qui n'a rien à voir) était alors considéré comme
    // "déjà complet" et Gemini ne l'analysait JAMAIS, perpétuant l'erreur
    // silencieusement. Maintenant que les 3 clés Gemini sont opérationnelles,
    // chaque fichier sans détection par nom de fichier passe systématiquement
    // par une vraie analyse Gemini de son contenu (voir _iaAutoCompletionZip
    // et iaScannerFichier) plutôt que de recopier les valeurs d'un fichier
    // voisin qui peut être complètement différent.

    afficherResultatZip();
    const nbDetectesParNom = zipFilesData.filter(f => (f.classes && f.classes.length) && f.matiere).length;
    showToast(`✅ ${zipFilesData.length} fichier(s) détecté(s)` + (nbDetectesParNom < zipFilesData.length ? ` — analyse IA du contenu en cours pour les fichiers restants...` : ""), "success");
    // IA auto-complétion en arrière-plan pour les fichiers incomplets
    setTimeout(() => _iaAutoCompletionZip(), 500);
  } catch(e) {
    showToast("❌ Erreur lecture ZIP: " + e.message, "error");
  }
}

async function chargerJSZip() {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
    s.onload = resolve;
    s.onerror = () => reject(new Error("Impossible de charger JSZip"));
    document.head.appendChild(s);
  });
}

// ── Normalisation tolérante pour le nommage des fichiers ZIP ────────────────
// Même principe que _normKeyCSV : insensible aux accents, à la casse,
// et aux séparateurs (espace/-/_) à l'intérieur même d'un seul "mot".
function _normKeyZip(s) {
  return (s || "").toString()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Détection simplifiée du lycée ("principal" ou "autres") à partir d'un texte
// libre quelconque (titre déjà publié, nom de fichier...). Réutilise les mêmes
// signaux que analyserNomFichier (régions, mots-clés "blanc"/"simulation"/
// "régionale", noms d'établissements) mais sans la logique de nettoyage de
// titre — utile pour ré-analyser un contenu déjà publié (outil de réparation).
function _detecterLyceeDepuisTexte(texte) {
  const nomComplet = _normKeyZip(texte);
  if (nomComplet.includes("manengouba")) return "principal";
  const MOTS_CLES_AUTRE_LYCEE = ["blanc","simulation","regionale","regional"];
  const REGIONS_AUTRE_LYCEE = ["adamaoua","centre","est","extremenord","nord","nordouest","ouest","sud","sudouest"];
  const AUTRES_ETABLISSEMENTS = [
    "lyceedenkongsamba","lyceebilingue","lyceeclassique","lyceetechnique",
    "collegevogt","collegelibermann","saintejeanne","lyceegeneral",
    "lyceedenjombe","lyceedebafoussam","lyceedeyaounde","lyceededouala",
    "lyceedebuea","lyceedegaroua","lyceedemaroua","lyceedebafia",
    "lyceedebertoua","lyceedengaoundere","lyceedeebolowa","lyceedekribi",
  ];
  if (AUTRES_ETABLISSEMENTS.some(e => nomComplet.includes(e))) return "autres";
  const mots = texte.split(/[_\-\s,;+]+/).map(_normKeyZip).filter(Boolean);
  if (mots.some(m => MOTS_CLES_AUTRE_LYCEE.includes(m) || REGIONS_AUTRE_LYCEE.includes(m))) return "autres";
  return "principal";
}

// Classes : accepte une multitude d'abréviations (6e, sixieme, sixième…)
const ZIP_CLASSE_MAP = {
  // 6ème
  "6e":"6ème","6eme":"6ème","sixieme":"6ème","six":"6ème",
  // 5ème
  "5e":"5ème","5eme":"5ème","cinquieme":"5ème","cinq":"5ème",
  // 4ème
  "4e":"4ème","4eme":"4ème","quatrieme":"4ème","quatre":"4ème",
  // 3ème
  "3e":"3ème","3eme":"3ème","troisieme":"3ème","trois":"3ème",
  // 2nde
  "2nd":"2nde_A","2nde":"2nde_A","seconde":"2nde_A","sec":"2nde_A",
  "2nda":"2nde_A","2ndea":"2nde_A","secondea":"2nde_A","2a":"2nde_A",
  "2ndc":"2nde_C","2ndec":"2nde_C","secondec":"2nde_C","2c":"2nde_C",
  // 1ère
  // 1ère — seulement les formes AVEC série explicite dans le mot
  // (les formes sans série "1ere" seul sont gérées par ZIP_NIVEAU_PREFIX + lettre suivante)
  "1erea":"1ère_A","1rea":"1ère_A","1a":"1ère_A","premierea":"1ère_A",
  "1erec":"1ère_C","1rec":"1ère_C","premierec":"1ère_C","1c":"1ère_C",
  "1ered":"1ère_D","1red":"1ère_D","premiered":"1ère_D","1d":"1ère_D",
  "premiere":"1ère_A","1re":"1ère_A",
  // Terminale / Tle — "tle" seul et "term" seul retirés (causaient des défauts silencieux)
  // Les formes sans série sont gérées par ZIP_NIVEAU_PREFIX
  "tlea":"Tle_A","terma":"Tle_A","termea":"Tle_A","terminalea":"Tle_A","ta":"Tle_A",
  "tlec":"Tle_C","termc":"Tle_C","termec":"Tle_C","terminalec":"Tle_C","tc":"Tle_C",
  "tled":"Tle_D","termd":"Tle_D","termed":"Tle_D","terminaled":"Tle_D","td":"Tle_D",
  "tlef":"Tle_F","termf":"Tle_F","termef":"Tle_F","terminalef":"Tle_F","tf":"Tle_F",
};

// Préfixes de niveau (sans série) utilisés pour les combinaisons "niveau + série(s)"
// ex: "1ere" + "C" → 1ère_C, "Tle" + "ACD" → Tle_A + Tle_C + Tle_D
const ZIP_NIVEAU_PREFIX = {
  "2nd":"2nde","2nde":"2nde","seconde":"2nde","sec":"2nde",
  "1ere":"1ère","1re":"1ère","premiere":"1ère",
  "tle":"Tle","term":"Tle","terminale":"Tle",
};
// Une ou plusieurs lettres de série collées : "c", "d", "cd", "acd", "a-c-d"...
// "ti" est une série à PART (2 lettres, filière informatique) — traitée comme
// un bloc indivisible, pas comme deux lettres "t"+"i" séparées (qui n'existent
// pas individuellement comme séries).
const ZIP_SERIE_VALIDES = ["A","C","D","F"];
const ZIP_SERIE_DEUX_LETTRES = ["TI"];

// Découpe une chaîne de lettres en tokens de série, en reconnaissant d'abord
// les séries à deux lettres ("TI") avant de retomber sur des lettres seules
// (A/C/D/F). Ex: "CTI" → ["C","TI"], "ACDTI" → ["A","C","D","TI"].
function _decouperLettresSeries(s) {
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const deux = s.slice(i, i + 2);
    if (ZIP_SERIE_DEUX_LETTRES.includes(deux)) { tokens.push(deux); i += 2; continue; }
    tokens.push(s[i]); i += 1;
  }
  return tokens;
}

// À partir d'un préfixe de niveau ("2nde","1ère","Tle") et d'un suffixe contenant
// une ou plusieurs lettres de série ("c","cd","acd","cti"...), retourne la liste
// des classes. STRICT : le suffixe doit être composé EXCLUSIVEMENT de tokens de
// série reconnus (A/C/D/F ou "TI"), sinon un mot comme "anglais" (qui contient
// un "a") ou "math"/"bepc" (qui contiennent un "a"/"c") serait confondu à tort
// avec une série.
function _resoudreSeriesCombinees(niveau, suffixe) {
  const s = (suffixe || "").toUpperCase();
  if (!s || s.length > 5) return [];
  const tokens = _decouperLettresSeries(s);
  if (tokens.some(t => !ZIP_SERIE_VALIDES.includes(t) && !ZIP_SERIE_DEUX_LETTRES.includes(t))) return [];
  const valides = [...new Set(tokens)];
  if (!valides.length) return [];
  return valides
    .map(l => `${niveau}_${l}`)
    .filter(c => CLASSES.includes(c)); // ne garder que les classes qui existent réellement
}


// Type d'épreuve/contenu : couvre BAC, BEPC, Probatoire (pb/prob) et leurs variantes
const ZIP_TYPE_MAP = {
  "cours":"cours","cour":"cours","course":"cours","cr":"cours",
  "seq":"sequencielle","sequencielle":"sequencielle","sequentielle":"sequencielle","sq":"sequencielle",
  "exam":"examen_officiel","examen":"examen_officiel","examenofficiel":"examen_officiel",
  "bac":"examen_officiel","baccalaureat":"examen_officiel",
  "bep":"examen_officiel","bepc":"examen_officiel",
  "pb":"examen_officiel","prob":"examen_officiel","proba":"examen_officiel","probatoire":"examen_officiel",
  "cep":"examen_officiel","concours":"examen_officiel",
  "zone":"la_zone","lazone":"la_zone","lz":"la_zone",
  "entrainement":"la_zone","entrainements":"la_zone","difficile":"la_zone","defi":"la_zone","challenge":"la_zone",
  "comp":"competences","competence":"competences","competences":"competences",
  "cp":"competences","skill":"competences","skills":"competences","aptitude":"competences","apc":"competences",
};

// Niveau IMPLICITE associé à chaque mot-clé d'épreuve officielle, utilisé
// uniquement quand le nom du fichier ne précise aucun niveau explicite
// (pas de "1ere"/"2nde"/"tle"/"terminale"...). Au Cameroun : le Probatoire se
// passe en Première, le BAC en Terminale. Le BEPC/CEP n'ont pas de série
// (A/C/D...) donc on ne déduit aucune classe pour eux — laisser vide est
// préférable à un classement faux.
const ZIP_TYPE_NIVEAU_DEFAUT = {
  "pb":"1ère","prob":"1ère","proba":"1ère","probatoire":"1ère",
  "bac":"Tle","baccalaureat":"Tle",
  "bep":"","bepc":"","cep":"","concours":"",
  "exam":"Tle","examen":"Tle","examenofficiel":"Tle", // mot générique → Tle par défaut, prudent
};

// Matières : abréviations courantes en plus des noms complets
const ZIP_MAT_MAP = {
  "maths":"math","math":"math","mathematiques":"math","mth":"math","mat":"math",
  "francais":"francais","fr":"francais","fran":"francais","franc":"francais",
  // ⚠️ "en" retiré : trop ambigu dans les noms de fichiers (ex: "langue_en_classe", "en_attente")
  // On garde "ang", "angl", "anglais" qui sont sans équivoque
  "anglais":"anglais","ang":"anglais","angl":"anglais","gb":"anglais","english":"anglais",
  "physique":"physique","phys":"physique","phy":"physique","pc":"physique",
  "chimie":"chimie","chim":"chimie","chi":"chimie",
  "svt":"svt","biologie":"svt","bio":"svt","sn":"svt","scvie":"svt",
  "histoiregeo":"histoire_geo","histgeo":"histoire_geo","hg":"histoire_geo",
  "histoire":"histoire_geo","hist":"histoire_geo",
  "geographie":"histoire_geo","geo":"histoire_geo","geog":"histoire_geo",
  "philo":"Philosophie","philosophie":"Philosophie","phi":"Philosophie",
  "info":"informatique","informatique":"informatique","tic":"informatique","inf":"informatique",
  "ecm":"ecm","civique":"ecm","educationcivique":"ecm","eccm":"ecm",
  "espagnol":"espagnol","esp":"espagnol","es":"espagnol","sp":"espagnol",
  "allemand":"allemand","all":"allemand","de":"allemand",
  "arabe":"arabe","ar":"arabe",
  "chinois":"chinois","cn":"chinois","ch":"chinois",
  // Langues nationales — priorité sur les alias courts ambigus
  "langue":"langue","langues":"langue","languesnationales":"langue",
  "ln":"langue","langnat":"langue","lnat":"langue",
  "litterature":"litterature","litt":"litterature","lit":"litterature",
  "lcn":"LCN","langueculture":"LCN","langcult":"LCN",
  "dictee":"Dictee","dicte":"Dictee","dict":"Dictee",
  "etude":"Etude","etudedetextes":"Etude",
};

// Analyser le nom du fichier pour extraire classe(s)/matière/type/titre.
// Tolérant : casse, accents, séparateurs (_, -, espace), abréviations multiples,
// et détecte TOUTES les classes mentionnées (ex: "1ereC-1ereD_Maths_..." → 2 classes).
function analyserNomFichier(path) {
  // Nettoyer le chemin
  const filename = path.split("/").pop().replace(/\.[^.]+$/, ""); // sans extension
  // ── Utiliser aussi les dossiers du ZIP comme source d'indices ──
  // Si le fichier est rangé dans des sous-dossiers (ex: "1ère C/Maths/devoir1.pdf"),
  // les noms de dossiers sont eux aussi analysés pour deviner classe/matière/type —
  // ça permet de TRIER les fichiers dans des dossiers au lieu de renommer chaque
  // fichier individuellement. On les met EN PREMIER dans la liste de mots pour
  // qu'ils soient prioritaires (un dossier "1ère C" doit l'emporter même si le
  // nom du fichier lui-même ne contient aucun indice).
  const segments = path.split("/").filter(Boolean);
  const dossiers = segments.slice(0, -1); // tous les segments sauf le nom du fichier final
  const sourceComplete = dossiers.length ? (dossiers.join("_") + "_" + filename) : filename;
  // Découpe en "mots" sur séparateurs ET sur les frontières chiffre/lettre,
  // pour capter par ex. "1ereC1ereD" autant que "1ere-C_1ere-D"
  const rawParts = sourceComplete.split(/[_\-\s,;+]+/).filter(Boolean);
  // Index à partir duquel les mots proviennent du NOM DE FICHIER (pas des dossiers) —
  // utilisé plus bas pour ne garder QUE ces mots-là dans le "complément libre" du
  // titre final (sinon le nom des dossiers se retrouverait dans le titre affiché).
  const nbMotsDossiers = dossiers.length ? dossiers.join("_").split(/[_\-\s,;+]+/).filter(Boolean).length : 0;

  let classes = [], matiere = "", type = "examen_officiel";
  const usedIdx = new Set();

  // ── Chercher TOUTES les classes mentionnées ──
  for (let i = 0; i < rawParts.length; i++) {
    if (usedIdx.has(i)) continue;
    const key = _normKeyZip(rawParts[i]);
    if (!key) continue;

    // PRIORITÉ 1 : niveau + série(s) sur PLUSIEURS mots adjacents, dans n'importe quel ordre
    // (ex "Tle"+"A", "Tle"+"A"+"C"+"D" séparés par des espaces/tirets, "A"+"Tle",
    // "1ère"+"C"+"D"...). Vérifié AVANT le mapping direct, car "tle" seul
    // correspondrait sinon à Tle_C par défaut et empêcherait de lire la/les
    // série(s) données dans les mots voisins.
    if (ZIP_NIVEAU_PREFIX[key]) {
      // Ordre "niveau puis série(s)" : ex "1ère_C", "1ère C D", "Tle A C D"
      // Accumule autant de mots suivants que possible tant qu'ils sont chacun
      // une seule lettre de série valide (A/C/D/F) — gère "1ère C-D" comme
      // "1ère ACD" en un seul mot.
      let j = i + 1, lettresAcc = "";
      while (j < rawParts.length && !usedIdx.has(j)) {
        const k2 = _normKeyZip(rawParts[j]);
        if (k2 && k2.length === 1 && /^[acdf]$/.test(k2)) { lettresAcc += k2; j++; continue; }
        if (k2 === "ti") { lettresAcc += "TI"; j++; continue; }
        break;
      }
      if (lettresAcc) {
        const trouve = _resoudreSeriesCombinees(ZIP_NIVEAU_PREFIX[key], lettresAcc);
        if (trouve.length) {
          classes.push(...trouve);
          for (let k = i; k < j; k++) usedIdx.add(k);
          i = j - 1;
          continue;
        }
      }
    }
    // Ordre "série(s) puis niveau" : ex "C_Tle", "D_1ere", "C D 1ere"
    if (i + 1 < rawParts.length) {
      const nextKey = _normKeyZip(rawParts[i+1]);
      if (ZIP_NIVEAU_PREFIX[nextKey]) {
        const trouve = _resoudreSeriesCombinees(ZIP_NIVEAU_PREFIX[nextKey], key);
        if (trouve.length) {
          classes.push(...trouve);
          usedIdx.add(i); usedIdx.add(i+1);
          i++;
          continue;
        }
      }
    }

    // PRIORITÉ 2 : niveau + série(s) combinés en un seul mot (ex "TleACD", "1ereCD")
    let comboUnMot = false;
    for (const prefixKey in ZIP_NIVEAU_PREFIX) {
      if (key.startsWith(prefixKey) && key.length > prefixKey.length) {
        const suffixe = key.slice(prefixKey.length);
        const trouve = _resoudreSeriesCombinees(ZIP_NIVEAU_PREFIX[prefixKey], suffixe);
        if (trouve.length) { classes.push(...trouve); usedIdx.add(i); comboUnMot = true; break; }
      }
    }
    if (comboUnMot) continue;

    // PRIORITÉ 3 : mapping direct sur un seul mot (ex "TleC", "1ereD", "2ndeA", ou "tle" seul → Tle_C par défaut)
    if (ZIP_CLASSE_MAP[key]) {
      classes.push(ZIP_CLASSE_MAP[key]);
      usedIdx.add(i);
      continue;
    }

    // PRIORITÉ 4 : mapping combiné sur deux mots non couvert par niveau+série (sécurité/rétrocompatibilité)
    if (i + 1 < rawParts.length) {
      const nextKey = _normKeyZip(rawParts[i+1]);
      const comboKey = key + nextKey;
      if (ZIP_CLASSE_MAP[comboKey]) {
        classes.push(ZIP_CLASSE_MAP[comboKey]);
        usedIdx.add(i); usedIdx.add(i+1);
        i++;
        continue;
      }
    }
  }
  classes = [...new Set(classes)]; // dédoublonner si répété

  // ── Chercher le type ──
  // Même principe que pour la matière : priorité au nom de fichier sur le
  // dossier en cas de conflit (le type par défaut "examen_officiel" n'est
  // pas un signal de "trouvé", donc on suit un booléen explicite ici).
  let typeKeyTrouve = ""; // garde le mot-clé exact (ex: "pb", "bac") pour déduire le niveau implicite
  let typeTrouve = false;
  for (let i = nbMotsDossiers; i < rawParts.length; i++) {
    if (usedIdx.has(i)) continue;
    const key = _normKeyZip(rawParts[i]);
    if (ZIP_TYPE_MAP[key]) { type = ZIP_TYPE_MAP[key]; typeKeyTrouve = key; usedIdx.add(i); typeTrouve = true; break; }
  }
  if (!typeTrouve) {
    for (let i = 0; i < nbMotsDossiers; i++) {
      if (usedIdx.has(i)) continue;
      const key = _normKeyZip(rawParts[i]);
      if (ZIP_TYPE_MAP[key]) { type = ZIP_TYPE_MAP[key]; typeKeyTrouve = key; usedIdx.add(i); typeTrouve = true; break; }
    }
  }
  // Si un AUTRE mot du nom est aussi un synonyme du même type déjà trouvé
  // (ex: "lz" ET "difficile" désignent tous les deux "la_zone"), on le
  // consomme aussi — sinon il resterait collé tel quel dans le titre final.
  if (typeTrouve) {
    for (let i = 0; i < rawParts.length; i++) {
      if (usedIdx.has(i)) continue;
      const key = _normKeyZip(rawParts[i]);
      if (ZIP_TYPE_MAP[key] === type) usedIdx.add(i);
    }
  }

  // ⚠️ SUPPRIMÉ (2026, décision Jean) : il existait ici une déduction de
  // classe à partir de lettres de série ISOLÉES (ex: un mot "C", "D", "ACD")
  // quand le type détecté était un examen officiel et qu'aucune classe
  // n'avait encore été trouvée — avec une supposition de niveau par défaut
  // (Probatoire → Première, Bac → Terminale). Problème réel observé : un
  // simple nom de DOSSIER comme "c/" (juste pour ranger des fichiers dans le
  // ZIP, sans aucune signification de série) matchait cette règle et
  // produisait une fausse classe "Tle_C" pour des fichiers qui n'ont AUCUN
  // rapport avec la série C. Jean a demandé de retirer cette déduction :
  // mieux vaut laisser la classe vide (à vérifier manuellement ou détectée
  // par Gemini sur le vrai contenu) que de deviner à partir d'une lettre
  // isolée qui peut très bien être un nom de dossier arbitraire.
  classes = [...new Set(classes)];
  const classe = classes.join(","); // stocké comme liste séparée par virgules (calculé après toutes les passes)

  // ── Détecter si la ressource vient d'un AUTRE établissement ──
  // IMPORTANT : cette passe doit s'exécuter AVANT la recherche de matière,
  // car un mot de liaison comme "de" (dans "Lycee_de_Nkongsamba") est aussi
  // l'abréviation de la matière "allemand" — s'il n'est pas d'abord reconnu
  // comme faisant partie du nom d'établissement, il serait capté à tort
  // comme matière et empêcherait "maths"/"physique"/etc. d'être détecté.
  // Par défaut, tout contenu est rattaché au lycée principal (Manengouba).
  // On bascule vers "autres" (onglet "🏫 Autres lycées") dans deux cas :
  //  1. Le nom mentionne explicitement un autre établissement que Manengouba
  //     (ex: "Lycee_de_Nkongsamba", "College_Vogt"...).
  //  2. Le nom contient un mot-clé typique d'épreuve d'entraînement externe
  //     ("examen blanc", "concours blanc", "devoir blanc", "simulation"),
  //     SAUF si "Manengouba" est aussi mentionné (alors ça reste interne :
  //     un examen blanc organisé par le lycée lui-même).
  const nomComplet = _normKeyZip(sourceComplete);
  const mentionneManengouba = nomComplet.includes("manengouba");
  const MOTS_CLES_AUTRE_LYCEE = ["blanc","simulation","regionale","regional"];
  // Régions du Cameroun (hors Littoral, où se trouve le lycée du Manengouba à
  // Nkongsamba) : leur mention dans un nom de fichier signale presque toujours
  // une épreuve de coordination régionale, donc une ressource externe au
  // lycée principal. "Littoral" est volontairement exclu de cette liste.
  const REGIONS_AUTRE_LYCEE = [
    "adamaoua","centre","est","extremenord","nord","nordouest",
    "ouest","sud","sudouest",
  ];
  // Quelques noms d'établissements camerounais courants pour détecter une
  // mention explicite d'un AUTRE lycée que Manengouba (liste non-exhaustive,
  // complétée au fil des imports si besoin).
  const AUTRES_ETABLISSEMENTS = [
    "lyceedenkongsamba","lyceebilingue","lyceeclassique","lyceetechnique",
    "collegevogt","collegelibermann","saintejeanne","lyceegeneral",
    "lyceedenjombe","lyceedebafoussam","lyceedeyaounde","lyceededouala",
    "lyceedebuea","lyceedegaroua","lyceedemaroua","lyceedebafia",
    "lyceedebertoua","lyceedengaoundere","lyceedeebolowa","lyceedekribi",
  ];

  let lycee = "principal";
  let aTrouveSignalAutreLycee = false;

  // 1) Détection GLOBALE (sur la chaîne normalisée entière) : un établissement
  // peut être réparti sur plusieurs mots ("Lycee_de_Nkongsamba" → 3 mots), donc
  // on cherche d'abord sur tout le nom pour savoir SI un établissement est mentionné.
  const etablissementTrouve = AUTRES_ETABLISSEMENTS.find(e => nomComplet.includes(e));
  if (etablissementTrouve) {
    lycee = "autres";
    aTrouveSignalAutreLycee = true;
    // 2) Retire du titre seulement les mots qui appartiennent VRAIMENT au nom
    // de cet établissement (en reconstituant des combinaisons de mots adjacents),
    // pour ne pas effacer par erreur un mot sans rapport comme "maths" ou "exam".
    for (let i = 0; i < rawParts.length; i++) {
      if (usedIdx.has(i)) continue;
      // Tente d'étendre depuis i: accumule les mots suivants tant que la
      // concatenation reste un préfixe du nom d'établissement recherché.
      let acc = "";
      for (let j = i; j < rawParts.length && j < i + 5; j++) {
        if (usedIdx.has(j)) break;
        acc += _normKeyZip(rawParts[j]);
        if (etablissementTrouve.startsWith(acc)) {
          if (acc === etablissementTrouve) { for (let k = i; k <= j; k++) usedIdx.add(k); break; }
        } else break;
      }
    }
  }

  // Mots-clés "blanc"/"simulation" isolés : recherchés mot par mot et RETIRÉS
  // du titre (ils sont remplacés par le mot "Blanc" ajouté explicitement plus
  // bas, donc inutile de les garder tels quels).
  // La RÉGION (ex: "Ouest", "Sud") est elle aussi détectée ici mais N'EST PAS
  // retirée du nom : on veut la voir apparaître dans le titre final (ex:
  // "Probatoire Blanc de Maths — Ouest — Tle C").
  let regionDetectee = "";
  for (let i = 0; i < rawParts.length; i++) {
    if (usedIdx.has(i)) continue;
    const key = _normKeyZip(rawParts[i]);
    if (MOTS_CLES_AUTRE_LYCEE.includes(key)) {
      aTrouveSignalAutreLycee = true; usedIdx.add(i);
    } else if (REGIONS_AUTRE_LYCEE.includes(key)) {
      aTrouveSignalAutreLycee = true;
      if (!regionDetectee) regionDetectee = rawParts[i].charAt(0).toUpperCase() + rawParts[i].slice(1).toLowerCase();
      usedIdx.add(i);
    }
  }
  if (lycee === "principal" && aTrouveSignalAutreLycee && !mentionneManengouba) {
    lycee = "autres";
  }
  // Flag distinguant une vraie détection (Manengouba mentionné, OU un autre
  // établissement/mot-clé "blanc"/région trouvé) d'une simple valeur par
  // défaut ("principal" parce que le nom de fichier ne dit rien du tout).
  // Indispensable pour _iaAppliquerResultat : sans ce flag, "lycee" vaut
  // TOUJOURS une chaîne non-vide ("principal" par défaut), donc la condition
  // "!f.lycee" utilisée pour savoir si Gemini peut corriger ce champ était
  // TOUJOURS fausse — Gemini ne pouvait alors jamais signaler un autre
  // établissement détecté dans le contenu réel du document.
  const lyceeDetecteParNom = mentionneManengouba || aTrouveSignalAutreLycee;
  // Si "Manengouba" est mentionné, on le retire aussi du titre (inutile de
  // l'afficher dans le titre d'un cours/épreuve interne).
  if (mentionneManengouba) {
    for (let i = 0; i < rawParts.length; i++) {
      if (usedIdx.has(i)) continue;
      if (_normKeyZip(rawParts[i]) === "manengouba") { usedIdx.add(i); break; }
    }
  }

  // ── Chercher la matière ──
  // Priorité au NOM DE FICHIER sur le dossier en cas de conflit (ex: dossier
  // "Physique" mais fichier "Maths_devoir.pdf" → on garde "Maths", plus
  // spécifique et plus probablement correct si l'utilisateur l'a précisé).
  // On scanne donc d'abord les mots du fichier, puis seulement si rien n'y
  // est trouvé, on retombe sur les mots venant des dossiers.
  for (let i = nbMotsDossiers; i < rawParts.length; i++) {
    if (usedIdx.has(i)) continue;
    const key = _normKeyZip(rawParts[i]);
    if (ZIP_MAT_MAP[key]) { matiere = ZIP_MAT_MAP[key]; usedIdx.add(i); break; }
  }
  if (!matiere) {
    for (let i = 0; i < nbMotsDossiers; i++) {
      if (usedIdx.has(i)) continue;
      const key = _normKeyZip(rawParts[i]);
      if (ZIP_MAT_MAP[key]) { matiere = ZIP_MAT_MAP[key]; usedIdx.add(i); break; }
    }
  }

  // ── Chercher l'année (un nombre à 4 chiffres plausible : 1990-2099) ──
  let annee = "";
  for (let i = 0; i < rawParts.length; i++) {
    if (usedIdx.has(i)) continue;
    const key = _normKeyZip(rawParts[i]);
    if (/^(19[9]\d|20\d\d)$/.test(key)) { annee = key; usedIdx.add(i); break; }
  }

  // ── Chercher le numéro de séquence/compétence/exercice ("seq1", "sequence 2",
  // "competence2", "exercice3", "fiche1"...) ──
  // Utile pour reconstituer un titre propre ("Séquence 2", "Compétence 2") même
  // si le nom d'origine collait le préfixe et le chiffre ensemble, et pour éviter
  // que ce même mot ne traîne en double dans le complément libre du titre.
  // Le PRÉFIXE utilisé (seq/comp/exercice/fiche) sert aussi à déduire le TYPE de
  // contenu quand aucun mot-clé de type n'avait déjà été trouvé plus haut — utile
  // pour les noms minimalistes comme "seq3.pdf" qui ne contiennent que ça.
  let sequence = "";
  const PREFIXE_VERS_TYPE = {
    seq: "sequencielle", sequence: "sequencielle", s: "sequencielle",
    competence: "competences", competences: "competences", comp: "competences",
    exercice: "examen_officiel", exercices: "examen_officiel", ex: "examen_officiel",
    fiche: "la_zone", fiches: "la_zone",
  };
  const PREFIXES_NUMERO = /^(?:seq(?:uence)?|s|competences?|exercices?|ex|fiches?|comp)(\d{1,2})$/;
  for (let i = 0; i < rawParts.length; i++) {
    if (usedIdx.has(i)) continue;
    const key = _normKeyZip(rawParts[i]);
    let m = key.match(PREFIXES_NUMERO);
    if (m) {
      sequence = m[1]; usedIdx.add(i);
      const prefixeUtilise = key.slice(0, key.length - m[1].length);
      if (!typeKeyTrouve && PREFIXE_VERS_TYPE[prefixeUtilise]) { type = PREFIXE_VERS_TYPE[prefixeUtilise]; typeKeyTrouve = prefixeUtilise; }
      break;
    }
    // Cas où le préfixe et le chiffre sont deux mots séparés (ex: "Seq" "2")
    if (["seq","sequence","competence","competences","exercice","exercices","fiche","fiches","comp"].includes(key)
        && i + 1 < rawParts.length && !usedIdx.has(i+1)) {
      const next = _normKeyZip(rawParts[i+1]);
      if (/^\d{1,2}$/.test(next)) {
        sequence = next; usedIdx.add(i); usedIdx.add(i+1);
        if (!typeKeyTrouve && PREFIXE_VERS_TYPE[key]) { type = PREFIXE_VERS_TYPE[key]; typeKeyTrouve = key; }
        break;
      }
    }
  }

  // ── Le reste = complément libre du titre (ce qui n'a pas été identifié) ──
  // On exclut volontairement les mots venant des DOSSIERS (index < nbMotsDossiers) :
  // ils servent à deviner classe/matière/type, mais ne doivent jamais apparaître
  // dans le titre final (sinon "1ère C/Maths/devoir1.pdf" donnerait un titre du
  // genre "devoir1 1ère C Maths" au lieu du simple "devoir1").
  const complement = rawParts.filter((_, i) => i >= nbMotsDossiers && !usedIdx.has(i)).join(" ");

  // ── Construction du titre final, naturel et lisible pour l'élève ──
  // L'objectif : que n'importe qui reconnaisse en un coup d'œil de quoi il
  // s'agit (cours, épreuve, exercice, compétence), sans avoir à déchiffrer un
  // nom technique. Le format change selon le type de contenu :
  //   Cours        → "Maths — 1ère C — Chapitre 5"
  //   Séquentielle → "Français — 3ème — Séquence 2"
  //   Officiel     → "Probatoire de Chimie — 1ère C, 1ère D — 2024"
  //   La Zone      → "Maths — Tle C — Exercices difficiles"
  //   Compétences  → "Chimie — 1ère C — Compétence 2"
  // Pour tout contenu marqué "Autres lycées" (examen blanc, épreuve d'une
  // autre région, autre établissement...), le mot "Blanc" est ajouté
  // explicitement après le type, pour que l'élève distingue immédiatement
  // qu'il ne s'agit PAS d'une ressource officielle du lycée du Manengouba.
  // La région détectée (ex: "Ouest") est elle aussi affichée si présente.
  const classesTriees = [...classes].sort((a, b) => CLASSES.indexOf(a) - CLASSES.indexOf(b));
  // Affichage avec tiret au lieu d'underscore pour la lisibilité (Tle_C → Tle C)
  const classeAffichee = classesTriees.length ? classesTriees.map(c => c.replace(/_/g, " ")).join(", ") : "";
  const matiereAffichee = (NOMS_MATIERES && NOMS_MATIERES[matiere]) ? NOMS_MATIERES[matiere] : matiere;
  // Suffixe générique "Blanc" pour cours/séquentielle/zone/compétences (ex: "Maths Blanc")
  const suffixeBlanc = lycee === "autres" ? " Blanc" : "";
  // Libellé de l'épreuve officielle selon le mot-clé exact détecté (Probatoire/BAC/BEPC/CEP)
  const NOMS_EPREUVE = {
    pb:"Probatoire", prob:"Probatoire", proba:"Probatoire", probatoire:"Probatoire",
    bac:"BAC", baccalaureat:"BAC",
    bep:"BEPC", bepc:"BEPC", cep:"CEP", concours:"Concours",
    exam:"Épreuve", examen:"Épreuve", examenofficiel:"Épreuve",
  };
  const libelleEpreuveBrut = NOMS_EPREUVE[typeKeyTrouve] || "Épreuve";
  // "Épreuve" est féminin (Épreuve Blanche), les autres sont masculins (Probatoire/BAC/... Blanc)
  const suffixeBlancEpreuve = lycee === "autres" ? (libelleEpreuveBrut === "Épreuve" ? " Blanche" : " Blanc") : "";
  const nomEpreuve = libelleEpreuveBrut + suffixeBlancEpreuve;

  const morceaux = [];
  if (type === "examen_officiel") {
    // "Probatoire Blanc de Chimie" (ou juste "Probatoire Blanc" si la matière est inconnue)
    const preposition = /^[aeiouéèêàâ]/i.test(matiereAffichee) ? "d'" : "de ";
    morceaux.push(matiereAffichee ? `${nomEpreuve} ${preposition}${matiereAffichee}` : nomEpreuve);
    if (classeAffichee) morceaux.push(classeAffichee);
    if (regionDetectee) morceaux.push(regionDetectee);
    if (annee) morceaux.push(annee);
  } else if (type === "sequencielle") {
    if (matiereAffichee) morceaux.push(matiereAffichee + suffixeBlanc);
    if (classeAffichee) morceaux.push(classeAffichee);
    if (regionDetectee) morceaux.push(regionDetectee);
    morceaux.push(sequence ? `Séquence ${sequence}` : "Séquentielle");
  } else if (type === "la_zone") {
    if (matiereAffichee) morceaux.push(matiereAffichee + suffixeBlanc);
    if (classeAffichee) morceaux.push(classeAffichee);
    if (regionDetectee) morceaux.push(regionDetectee);
    morceaux.push("Exercices difficiles");
  } else if (type === "competences") {
    if (matiereAffichee) morceaux.push(matiereAffichee + suffixeBlanc);
    if (classeAffichee) morceaux.push(classeAffichee);
    if (regionDetectee) morceaux.push(regionDetectee);
    morceaux.push(sequence ? `Compétence ${sequence}` : "Compétence");
  } else {
    // Cours (par défaut) : "Maths Blanc — 1ère C — Chapitre 5"
    if (matiereAffichee) morceaux.push(matiereAffichee + suffixeBlanc);
    if (classeAffichee) morceaux.push(classeAffichee);
    if (regionDetectee) morceaux.push(regionDetectee);
    morceaux.push(complement || "Cours");
  }
  // Le complément libre (ce qui restait du nom d'origine, ex: "Chapitre5",
  // "Sujet2024") est ajouté à la fin s'il n'a pas déjà été utilisé ci-dessus.
  if (complement && type !== "cours") morceaux.push(complement);

  const titre = morceaux.filter(Boolean).join(" — ");

  return { classe, classes, matiere, type, titre, lycee, annee, lyceeDetecteParNom };
}

// Fait défiler jusqu'à la prochaine carte "à compléter" (bordure rouge) qui
// n'est pas déjà entièrement visible à l'écran — pratique pour les ZIP avec
// beaucoup de fichiers, sans avoir à les chercher un par un visuellement.
function allerProchainACompleter() {
  const cartes = [];
  zipFilesData.forEach((f, i) => {
    const aCompleter = !(f.classes && f.classes.length) || !f.matiere;
    if (aCompleter) cartes.push(i);
  });
  if (!cartes.length) { showToast("✅ Plus rien à compléter !", "success"); return; }
  // Reprendre après la dernière carte visitée, sinon revenir à la première
  let prochain = cartes.find(i => i > _zipDernierIndexVu);
  if (prochain === undefined) prochain = cartes[0];
  _zipDernierIndexVu = prochain;
  const el = document.getElementById(`zip-card-${prochain}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.style.transition = "box-shadow 0.3s";
    el.style.boxShadow = "0 0 0 4px rgba(229,57,53,0.35)";
    setTimeout(() => { el.style.boxShadow = "none"; }, 1200);
  }
}

// ========== IA SCANNER — ANALYSE PDF PAR CONTENU (PDF.js) ==========

// Extrait le texte des 2 premières pages d'un PDF blob
async function _iaExtraireTextePDF(blob) {
  if (typeof pdfjsLib === "undefined") return "";
  try {
    const arrayBuffer = await blob.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const nbPages = Math.min(pdf.numPages, 2);
    let texte = "";
    for (let p = 1; p <= nbPages; p++) {
      const page = await pdf.getPage(p);
      const tc = await page.getTextContent();
      texte += tc.items.map(item => item.str).join(" ") + "\n";
    }
    return texte.trim();
  } catch(e) {
    console.warn("IA PDF extraction:", e.message);
    return "";
  }
}

// Analyse le texte extrait et retourne { classes, matiere, type, titre }
function _iaAnalyserTexte(texte) {
  if (!texte) return null;
  const t = texte.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");

  const ALIASES_CLASSES = {
    "6ème":    ["6eme","sixieme","classe de 6"],
    "5ème":    ["5eme","cinquieme","classe de 5"],
    "4ème":    ["4eme","quatrieme","classe de 4"],
    "3ème":    ["3eme","troisieme","classe de 3","bepc"],
    "2nde_A":  ["2nde a","seconde a","2de a"],
    "2nde_C":  ["2nde c","seconde c","2de c"],
    "1ère_A":  ["1ere a","premiere a","1re a","classe de 1 a"],
    "1ère_C":  ["1ere c","premiere c","1re c","classe de 1 c"],
    "1ère_D":  ["1ere d","premiere d","1re d","classe de 1 d"],
    "1ère_TI": ["1ere ti","premiere ti","1re ti"],
    "Tle_A":   ["terminale a","tle a","tale a"],
    "Tle_C":   ["terminale c","tle c","tale c"],
    "Tle_D":   ["terminale d","tle d","tale d"],
    "Tle_TI":  ["terminale ti","tle ti","tale ti"],
  };

  // Abréviations courtes type "T C", "1 C", "2 A" — utilisées dans les en-têtes
  // d'établissements ("CLASSE DE : T C"). Ancrées sur le mot "classe" pour éviter
  // qu'un sigle de 1-2 lettres ne matche une numérotation de question/réponse
  // ("1. a) Déterminer...", "2- a) La plaque...") — testé et confirmé en simulation.
  const ALIASES_CLASSES_COURTES = {
    "3ème":    /classe\s*(?:de)?\s*:?\s*3\s*e\b/,
    "2nde_A":  /classe\s*(?:de)?\s*:?\s*2\s*a\b/,
    "2nde_C":  /classe\s*(?:de)?\s*:?\s*2\s*c\b/,
    "1ère_A":  /classe\s*(?:de)?\s*:?\s*1\s*a\b/,
    "1ère_C":  /classe\s*(?:de)?\s*:?\s*1\s*c\b/,
    "1ère_D":  /classe\s*(?:de)?\s*:?\s*1\s*d\b/,
    "1ère_TI": /classe\s*(?:de)?\s*:?\s*1\s*ti\b/,
    "Tle_A":   /classe\s*(?:de)?\s*:?\s*t\s*a\b/,
    "Tle_C":   /classe\s*(?:de)?\s*:?\s*t\s*c\b/,
    "Tle_D":   /classe\s*(?:de)?\s*:?\s*t\s*d\b/,
    "Tle_TI":  /classe\s*(?:de)?\s*:?\s*t\s*ti\b/,
  };

  const ALIASES_MAT = {
    "math":        ["mathematique","maths","algebre","geometrie","trigonometrie","derivation","integration","statistique"],
    // "physique" seul est volontairement exclu : c'est un adjectif courant en SVT/EPS
    // ("effort physique", "repos physique", "activité physique") qui causait des faux
    // positifs sur des copies de SVT. On utilise des termes spécifiques à la matière.
    "physique":    ["physique chimie","electricite","mecanique","optique","thermodynamique","circuit electrique","tension electrique","intensite du courant","loi d ohm","cours de physique"],
    "chimie":      ["chimie","reaction chimique","alcane","alcool","oxydoreduction","electrode","electrolyse","pile"],
    "svt":         ["svt","biologie","sciences naturelles","cellule","genetique","ecologie","reproduction","nutrition"],
    "info":        ["informatique","algorithmique","programmation","python","pascal","html","base de donnee"],
    "francais":    ["francais","litterature","grammaire","conjugaison","lecture","redaction","expression ecrite"],
    "anglais":     ["anglais","english","grammar","vocabulary","reading","writing","comprehension"],
    "espagnol":    ["espagnol","spanish","espanol"],
    "hg":          ["histoire","geographie","histoire geo","geopolitique","guerre","revolution","colonisation"],
    "ecm":         ["education civique","ecm","morale","citoyennete","droit","constitution"],
    "philosophie": ["philosophie","philo","kant","platon","descartes","ethique","epistemologie"],
    "economie":    ["economie","gestion","comptabilite","microeconomie","macroeconomie"],
    "eps":         ["education physique","eps","sport","athletisme","activite physique"],
  };

  // Détection classe
  let classeTrouvee = null;
  for (const [cls, aliases] of Object.entries(ALIASES_CLASSES)) {
    if (aliases.some(a => t.includes(a))) { classeTrouvee = cls; break; }
  }
  // Fallback : abréviations courtes "T C", "1 C", "2 A"... non couvertes par les
  // alias textuels ci-dessus (utilisées dans les en-têtes type "CLASSE DE : T C").
  if (!classeTrouvee) {
    for (const [cls, regex] of Object.entries(ALIASES_CLASSES_COURTES)) {
      if (regex.test(t)) { classeTrouvee = cls; break; }
    }
  }

  // Détection matière
  let matTrouvee = null;
  for (const [mat, aliases] of Object.entries(ALIASES_MAT)) {
    if (aliases.some(a => t.includes(a))) { matTrouvee = mat; break; }
  }
  // Anti faux-positif découvert en test : "gestion" est aussi une sous-chaîne de
  // "digestion", "suggestion"... (ex. cours de SVT parlant de digestion). On vérifie
  // la frontière de mot avant de valider "economie" sur la seule base de cet alias.
  if (matTrouvee === "economie" && !/\bgestion\b|\beconomie\b|\bmicroeconomie\b|\bmacroeconomie\b|\bcomptabilite\b/.test(t)) {
    matTrouvee = null;
  }

  // Détection type
  // NOTE : "examen_officiel" est testé EN PREMIER, réservé aux vraies épreuves nationales
  // (bac/bepc/probatoire). "Devoir harmonisé", "évaluation des ressources/compétences" sont
  // des devoirs de classe/séquence → type "sequencielle", même s'ils contiennent le mot
  // "compétences" (qui n'est ici qu'un nom de partie standard de l'épreuve, pas le type
  // du document). Le type "competences" est réservé à un signal plus spécifique
  // ("tâche complexe").
  let typeTrouve = "cours";
  if (/examen|bac |bepc|probatoire|epreuve officielle|session [0-9]/.test(t)) typeTrouve = "examen_officiel";
  else if (/sequence|seq |sequentielle|devoir harmonise|harmonise|devoir surveille|devoir de niveau/.test(t)) typeTrouve = "sequencielle";
  else if (/la zone|fiche de revision|astuce|synthese/.test(t)) typeTrouve = "la_zone";
  else if (/tache complexe/.test(t)) typeTrouve = "competences";

  // Extraction titre
  const debut = texte.slice(0, 500).replace(/\s+/g, " ").trim();
  const titreMatch = debut.match(/(?:chapitre|theme|lecon|partie|unite|chap\.?)\s*[\dIVXivx]+[^.!\n]{0,70}/i)
    || debut.match(/(?:cours?|fiche|revision|examen|sujet|tp\b|td\b)[^.!\n]{0,70}/i);
  let titreTrouve = titreMatch ? titreMatch[0].trim().slice(0, 80) : "";

  if (!titreTrouve) {
    const lignes = texte.split("\n").map(l => l.trim())
      .filter(l => l.length > 8 && l.length < 100
        && !/lycee|college|ecole|ministere|republique|cameroun|annee scolaire|[0-9]{4}[-\/][0-9]{4}/i.test(l));
    titreTrouve = lignes[0] || "";
  }

  return { classes: classeTrouvee ? [classeTrouvee] : [], matiere: matTrouvee || "", type: typeTrouve, titre: titreTrouve };
}

// ========== IA SCANNER — 2ᵉ RECOURS DANS L'ORDRE D'ANALYSE ZIP : GEMINI ==========
// Nouvel ordre de priorité pour l'import ZIP (demande Jean, 2026) :
//   1. Nom du fichier (analyserNomFichier) — rapide, souvent suffisant
//   2. Gemini (analyse visuelle du contenu PDF/image) — détecte aussi
//      multi-classes, lycée (principal/autres) et année
//   3. pdf.js (extraction de texte brut) — dernier recours
// Nécessite une clé API Gemini configurée par l'admin (Paramètres → Config
// sécurisée → usage "1️⃣ Analyse ZIP"). Si aucune clé n'est configurée pour cet
// usage, Gemini est simplement sauté et on retombe sur pdf.js (comportement
// inchangé pour les admins qui n'ont pas encore configuré cette clé).
// Retourne { classes, matiere, type, titre, lycee, annee, _source: "gemini" }
// — superset du format de _iaAnalyserTexte (classes/matiere/type/titre), donc
// reste compatible avec _iaAppliquerResultat sans rien casser côté UI.
// (GEMINI_CLASSES_VALIDES / GEMINI_TYPES_VALIDES sont déclarées tout en haut
// du script, avec les autres constantes globales — voir près de ADMIN_PHONES)

async function _blobEnBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Appel bas niveau à l'API Gemini avec une clé donnée — utilisé à la fois par
// _iaAnalyserAvecGemini (production) et testerConnexionGemini (diagnostic admin).
// ⚠️ MODÈLE À SURVEILLER : Google arrête régulièrement les anciens modèles
// Gemini (gemini-2.0-flash a été coupé le 1er juin 2026, remplacé ici par
// gemini-2.5-flash). gemini-2.5-flash est lui-même annoncé pour un arrêt
// autour du 16 octobre 2026, avec gemini-3.5-flash (ou plus récent) comme
// remplacement prévu. Si "Tester connexion Gemini" recommence à échouer après
// cette date avec une erreur indiquant un modèle introuvable/invalide, c'est
// très probablement la cause : il suffit de changer le nom du modèle ci-
// dessous (une seule ligne, ce code est centralisé pour tous les usages).
async function _appelGeminiBrut(apiKey, parts, opts) {
  // Modèle Gemini 2.5 Flash — gemini-2.0-flash a été définitivement arrêté par
  // Google le 1er juin 2026 (toute requête vers ce nom de modèle renvoie une
  // erreur), donc 2.5-flash est le remplacement direct recommandé par Google.
  // temperature=0.1 pour des réponses stables et déterministes.
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: (opts && opts.maxOutputTokens) || 2000
      }
    })
  });
  if (!res.ok) {
    const errTxt = await res.text().catch(() => "");
    const err = new Error(`Gemini HTTP ${res.status}: ${errTxt.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  const data = await res.json();
  let texte = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  // Gemini peut entourer le JSON de ```json ... ``` malgré la consigne — on nettoie
  texte = texte.replace(/```json|```/g, "").trim();
  return texte;
}

// Construit le prompt d'analyse de document scolaire camerounais — utilisé pour
// l'analyse ZIP (usage "zip") et l'analyse des contributions élèves (usage "contrib"),
// qui partagent exactement le même besoin de métadonnées.
function _construirePromptAnalyseDocument() {
  const matieresValides = Object.keys(NOMS_MATIERES || {});
  const clsList = GEMINI_CLASSES_VALIDES.join(", ");
  const typList = GEMINI_TYPES_VALIDES.join(", ");
  const matList = matieresValides.join(", ");
  return `CONTEXTE OBLIGATOIRE : Tu analyses des documents scolaires du CAMEROUN pour la plateforme LearnUpr. Le système éducatif camerounais a deux cycles : 1er cycle (6ème→3ème) et 2nd cycle (2nde→Terminale, séries A/C/D/TI). Les examens nationaux sont : BEPC (3ème), Probatoire (Première), Baccalauréat (Terminale).

INSTRUCTION PRINCIPALE : Lis UNIQUEMENT le contenu visible du document, en particulier l'EN-TÊTE (moitié supérieure de la première page). N'invente rien. Champ vide "" si tu n'es pas certain.

════════════════════════════════
RÈGLE PROBATOIRE = PREMIÈRE (CRITIQUE)
════════════════════════════════
Si tu vois "Probatoire", "Proba", "PB" dans le document :
→ C'est une classe de PREMIÈRE, jamais de Terminale.
"Probatoire C" / "Proba C" / "PB C" → classe = "1ère_C"
"Probatoire D" / "Proba D" / "PB D" → classe = "1ère_D"
"Probatoire A" / "Proba A" → classe = "1ère_A"
"Probatoire TI" → classe = "1ère_TI"

════════════════════════════════
RÈGLE LYCÉE (CRITIQUE)
════════════════════════════════
lycee = "principal" dans CES CAS :
  1. Le document mentionne "Lycée du Manengouba", "Manengouba", "Lyc. Manengouba"
  2. Aucun établissement n'est mentionné dans le document
  3. Le document contient seulement "BEPC", "Probatoire", "BAC" sans nom d'un autre lycée

lycee = "autres" SEULEMENT SI un autre établissement est EXPLICITEMENT nommé :
  Ex: "Lycée de Nkongsamba", "Lycée Bilingue", "Collège Vogt", "Lycée de Douala", etc.

EN RÉSUMÉ : doute → "principal". "autres" seulement si un AUTRE lycée est écrit noir sur blanc.
"Probatoire Blanc", "Examen Blanc", "BAC Blanc" SANS nom d'autre lycée → "principal".
"Simulation", "Régionale" SANS nom d'autre lycée → "principal".

════════════════════════════════
ABRÉVIATIONS DE CLASSES — RECONNAIS-LES TOUTES
════════════════════════════════
Tle_C : "Terminale C", "Tle C", "Tle.C", "TC", "T.C", "TleC", "T C", "TERM C"
Tle_D : "Terminale D", "Tle D", "Tle.D", "TD", "T.D", "TleD", "TERM D"
Tle_A : "Terminale A", "Tle A", "TA", "T.A", "TERM A"
Tle_TI : "Terminale TI", "Tle TI", "TTI", "TERM TI"
1ère_C : "Première C", "1ère C", "1re C", "1C", "1ere C", "Probatoire C", "Proba C", "PB C"
1ère_D : "Première D", "1ère D", "1re D", "1D", "1ere D", "Probatoire D", "Proba D", "PB D"
1ère_A : "Première A", "1ère A", "1A", "1ere A", "Probatoire A", "Proba A"
1ère_TI : "Première TI", "1ère TI", "1TI", "Probatoire TI"
2nde_C : "Seconde C", "2nde C", "2nd C", "2C"
2nde_A : "Seconde A", "2nde A", "2nd A", "2A"
3ème : "Troisième", "3e", "3ème", "3eme"
4ème : "Quatrième", "4e", "4ème"
5ème : "Cinquième", "5e", "5ème"
6ème : "Sixième", "6e", "6ème"

════════════════════════════════
TYPES DE DEVOIRS
════════════════════════════════
sequencielle → DS, Devoir Surveillé, Séquence, Séq., Devoir N°X, Composition, Devoir Harmonisé
examen_officiel → BEPC, BAC, Baccalauréat, Probatoire, Proba, Examen Blanc, Probatoire Blanc, Simulation
cours → Cours, Fiche de cours, Leçon, Support, Résumé
la_zone → Zone, La Zone, Entraînement, Défi, Challenge
competences → Compétences, APC, Aptitudes

ANNÉE : "2024-2025" → "2024" (première année). "Session Mai 2025" → "2025". Cherche PARTOUT sur la page.

NUMÉRO DE SÉQUENCE : Inclure dans le titre. "DS N°2 — Mathématiques" → titre = "Devoir Surveillé N°2 — Mathématiques"

════════════════════════════════
FORMAT DE RÉPONSE — JSON UNIQUEMENT
════════════════════════════════
Réponds EXCLUSIVEMENT avec cet objet JSON, sans rien d'autre autour :
{"titre":"...","matiere":"...","classe":"...","type":"...","lycee":"...","annee":""}

- titre : max 80 caractères, inclure numéro séquence/DS
- matiere : EXACTEMENT parmi : ${matList}
- classe : EXACTEMENT parmi : ${clsList} — plusieurs classes séparées par virgule SANS espace ex: "Tle_C,Tle_D"
- type : parmi : ${typList} — "cours" si incertain
- lycee : "principal" ou "autres" — voir règle ci-dessus — EN CAS DE DOUTE : "principal"
- annee : 4 chiffres ou ""

EXEMPLES :
Document "LYCÉE DU MANENGOUBA — Tle C — Mathématiques — DS N°2 — 2025-2026" :
{"titre":"Devoir Surveillé N°2 — Mathématiques","matiere":"math","classe":"Tle_C","type":"sequencielle","lycee":"principal","annee":"2025"}

Document "BEPC 2024 — Espagnol — 3ème" (sans nom de lycée) :
{"titre":"BEPC 2024 — Espagnol","matiere":"espagnol","classe":"3ème","type":"examen_officiel","lycee":"principal","annee":"2024"}

Document "Probatoire C 2023 — Physique — Lycée de Douala" :
{"titre":"Probatoire — Physique","matiere":"physique","classe":"1ère_C","type":"examen_officiel","lycee":"autres","annee":"2023"}

Réponds UNIQUEMENT avec le JSON, rien d'autre.`;
}
