// Parse et valide la réponse JSON stricte de Gemini en un objet de métadonnées
// compatible avec le reste de l'app (classes en tableau, classe en chaîne CSV).
function _parserReponseGemini(texteReponse) {
  const match = (texteReponse || "").match(/\{[\s\S]*\}/);
  if (!match) return null;
  let parsed;
  try { parsed = JSON.parse(match[0]); } catch(e) { return null; }

  const matieresValides = Object.keys(NOMS_MATIERES || {});

  // "classe" peut arriver en chaîne CSV ("Tle_C,Tle_D") ou, par tolérance, en
  // tableau si un ancien prompt/une variante renvoie "classes" au pluriel.
  let classesBrutes = [];
  if (typeof parsed.classe === "string" && parsed.classe.trim()) {
    classesBrutes = parsed.classe.split(",").map(c => c.trim());
  } else if (Array.isArray(parsed.classes)) {
    classesBrutes = parsed.classes;
  } else if (Array.isArray(parsed.classe)) {
    classesBrutes = parsed.classe;
  }

  // Normalisation tolérante des classes : Gemini respecte rarement l'underscore
  // (retourne "Tle C", "TleC", "terminale_c", "1ère C", "1ere_C", etc. au lieu
  // de "Tle_C"). On tente de faire correspondre chaque valeur brute à une classe
  // valide en normalisant : suppression des accents, passage en minuscules,
  // remplacement espace/tiret par underscore, puis match insensible à la casse.
  function _normaliserClasseGemini(brut) {
    if (!brut) return null;
    // 1) Correspondance directe (cas idéal où Gemini respecte le format)
    if (GEMINI_CLASSES_VALIDES.includes(brut)) return brut;
    // 2) Normalisation : accents → ASCII, espaces/tirets → underscore, minuscules
    const norm = brut.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s\-]+/g, "_").toLowerCase();
    // 3) Chercher parmi les classes valides normalisées de la même façon
    const found = GEMINI_CLASSES_VALIDES.find(cv => {
      const cvNorm = cv.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\-]+/g, "_").toLowerCase();
      return cvNorm === norm;
    });
    if (found) return found;
    // 4) Alias courants que Gemini produit malgré la consigne (ex: "Terminale C" → "Tle_C")
    const ALIAS_CLASSE = {
      "terminale_a":"Tle_A","term_a":"Tle_A","ta":"Tle_A",
      "terminale_c":"Tle_C","term_c":"Tle_C","tc":"Tle_C","tlec":"Tle_C",
      "terminale_d":"Tle_D","term_d":"Tle_D","td":"Tle_D","tled":"Tle_D",
      "terminale_ti":"Tle_TI","term_ti":"Tle_TI","tti":"Tle_TI","tleti":"Tle_TI",
      "premiere_a":"1ère_A","1ere_a":"1ère_A","1a":"1ère_A",
      "premiere_c":"1ère_C","1ere_c":"1ère_C","1c":"1ère_C",
      "premiere_d":"1ère_D","1ere_d":"1ère_D","1d":"1ère_D",
      "premiere_ti":"1ère_TI","1ere_ti":"1ère_TI","1ti":"1ère_TI",
      "seconde_a":"2nde_A","2nde_a":"2nde_A","2a":"2nde_A","2nd_a":"2nde_A",
      "seconde_c":"2nde_C","2nde_c":"2nde_C","2c":"2nde_C","2nd_c":"2nde_C",
      "troisieme":"3ème","3eme":"3ème","3e":"3ème",
      "quatrieme":"4ème","4eme":"4ème","4e":"4ème",
      "cinquieme":"5ème","5eme":"5ème","5e":"5ème",
      "sixieme":"6ème","6eme":"6ème","6e":"6ème",
    };
    return ALIAS_CLASSE[norm] || null;
  }
  const classes = [...new Set(
    classesBrutes.map(_normaliserClasseGemini).filter(Boolean)
  )];

  // Normalisation tolérante de la matière : Gemini peut retourner "Mathématiques",
  // "mathematiques", "math.", "Histoire-Géographie", etc. au lieu de la clé exacte
  // ("math", "histoire_geo"). On tente d'abord une correspondance directe, puis on
  // cherche parmi les noms complets (valeurs de NOMS_MATIERES) normalisés.
  function _normaliserMatiereGemini(brut) {
    if (!brut) return "";
    if (matieresValides.includes(brut)) return brut; // clé exacte (cas idéal)
    const norm = brut.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[\s\-\/]+/g, "_").toLowerCase();
    // Chercher par clé normalisée
    const byKey = matieresValides.find(k => {
      const kn = k.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\-\/]+/g, "_").toLowerCase();
      return kn === norm;
    });
    if (byKey) return byKey;
    // Chercher par valeur (nom complet) normalisée — ex: "Mathématiques" → "math"
    if (typeof NOMS_MATIERES === "object") {
      const byVal = Object.entries(NOMS_MATIERES).find(([, label]) => {
        const ln = (label || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .replace(/[\s\-\/]+/g, "_").toLowerCase();
        return ln === norm || ln.startsWith(norm);
      });
      if (byVal) return byVal[0];
    }
    // Alias courants
    const ALIAS_MAT = {
      "mathematiques":"math","maths":"math","mth":"math",
      "francais":"francais","franc":"francais","fr":"francais",
      "anglais":"anglais","english":"anglais","ang":"anglais",
      "physique":"physique","phys":"physique",
      "chimie":"chimie","chim":"chimie",
      "svt":"svt","biologie":"svt","bio":"svt","sciences_de_la_vie":"svt",
      "histoire_geo":"histoire_geo","histoire_geographie":"histoire_geo","hg":"histoire_geo","histgeo":"histoire_geo",
      "informatique":"informatique","info":"informatique",
      "ecm":"ecm","citoyennete":"ecm","education_a_la_citoyennete":"ecm",
      "philosophie":"Philosophie","philo":"Philosophie",
      "espagnol":"espagnol","esp":"espagnol",
      "allemand":"allemand","all":"allemand",
      "arabe":"arabe","ar":"arabe",
      "chinois":"chinois","chi":"chinois",
      "litterature":"litterature","litt":"litterature",
      "lcn":"LCN","langue_et_culture":"LCN",
      "dictee":"Dictee",
      "etude_de_textes":"Etude","etude":"Etude",
    };
    return ALIAS_MAT[norm] || "";
  }
  const matiere = _normaliserMatiereGemini(parsed.matiere || "");
  const type = GEMINI_TYPES_VALIDES.includes(parsed.type) ? parsed.type : "cours";
  const titre = typeof parsed.titre === "string" ? parsed.titre.trim().slice(0, 80) : "";
  // "lycee" — tolérant aux écarts de format de Gemini. Le prompt demande
  // strictement "principal" ou "autres", mais Gemini répond parfois le NOM
  // RÉEL de l'établissement détecté (ex: "COLLEGE POLYVALENT GEORGES SCHWAB"
  // ou même "Lycée du Manengouba") au lieu du mot-clé attendu — comportement
  // observé en test réel (2026). Règle tolérante : si la réponse contient une
  // variante de "Manengouba" (même sous forme de nom complet d'établissement)
  // ou est vide/le mot "principal", on classe en "principal" ; toute AUTRE
  // valeur non vide (mot-clé "autres" littéral, ou nom réel d'un autre
  // établissement) est traitée comme "autres".
  const lyceeBrut = (typeof parsed.lycee === "string") ? parsed.lycee.trim() : "";
  const lyceeBrutNorm = lyceeBrut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lycee = (lyceeBrut === "" || lyceeBrutNorm === "principal" || lyceeBrutNorm.includes("manengouba")) ? "principal" : "autres";
  const annee = (typeof parsed.annee === "string" && /^(19[9]\d|20\d\d)$/.test(parsed.annee.trim())) ? parsed.annee.trim() : "";

  return { classes, classe: classes.join(","), matiere, type, titre, lycee, annee };
}

// (GEMINI_MIME_SUPPORTES déclarée tout en haut du script, avec les autres
// constantes globales — un .docx n'est pas analysable en multimodal par Gemini)

async function _iaAnalyserAvecGemini(blob, mimeType) {
  const apiKey = getGeminiKey("zip");
  if (!apiKey) return null; // pas de clé configurée pour cet usage → on n'appelle pas l'API
  if (!GEMINI_MIME_SUPPORTES.includes(mimeType)) return null; // ex: .docx — non analysable visuellement par Gemini
  try {
    const base64 = await _blobEnBase64(blob);
    const prompt = _construirePromptAnalyseDocument();
    const parts = [
      { text: prompt },
      { inline_data: { mime_type: mimeType, data: base64 } }
    ];

    let texteReponse;
    try {
      texteReponse = await _appelGeminiBrut(apiKey, parts);
    } catch(e) {
      // En cas de quota dépassé (429) et si une autre clé "zip" est disponible,
      // on retente une fois avec la clé suivante de la rotation avant d'abandonner.
      if (e.status === 429 && GEMINI_KEYS_ZIP.length > 1) {
        const autreCle = getGeminiKey("zip");
        if (autreCle && autreCle !== apiKey) texteReponse = await _appelGeminiBrut(autreCle, parts);
        else throw e;
      } else throw e;
    }

    const resultat = _parserReponseGemini(texteReponse);
    if (!resultat) return null;
    return { ...resultat, _source: "gemini" };
  } catch(e) {
    console.warn("Gemini analyse:", e.message);
    return null;
  }
}

// Détermine le type MIME à envoyer à Gemini selon l'extension du fichier ZIP
function _mimeTypePourFichier(ext) {
  const map = { pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  return map[(ext || "").toLowerCase()] || "application/pdf";
}

// Masque une clé API pour affichage (garde les 6 premiers + 4 derniers caractères)
function _masquerCle(cle) {
  if (!cle) return "—";
  if (cle.length <= 12) return cle.slice(0, 3) + "•••";
  return cle.slice(0, 6) + "•".repeat(Math.max(4, cle.length - 10)) + cle.slice(-4);
}

// ========== BOUTON ADMIN "TESTER CONNEXION GEMINI" ==========
// Envoie un prompt minimal à chacune des 3 clés configurées (lit directement
// les champs du formulaire, pas besoin d'avoir sauvegardé au préalable) et
// affiche un retour visuel ✅/❌ par usage, plus la clé utilisée (masquée).
async function testerConnexionGemini() {
  const btn = document.getElementById("btn-test-gemini");
  const result = document.getElementById("gemini-test-result");
  if (!result) return;

  const usages = [
    { id: "zip",     label: "1️⃣ Analyse ZIP",     champKey: "cfg-geminiKeyZip" },
    { id: "doublon", label: "2️⃣ Détection doublons", champKey: "cfg-geminiKeyDoublon" },
    { id: "contrib", label: "3️⃣ Analyse contributions", champKey: "cfg-geminiKeyContrib" },
  ];

  if (btn) { btn.disabled = true; btn.textContent = "⏳ Test en cours..."; }
  result.style.display = "block";
  result.style.background = "var(--bg)"; result.style.color = "var(--t2)";
  result.innerHTML = "⏳ Test des clés en cours…";

  const lignes = [];
  for (const u of usages) {
    const cle = _parseGeminiKeys(document.getElementById(u.champKey)?.value || "")[0] || "";
    if (!cle) {
      lignes.push(`⚪ ${u.label} — aucune clé renseignée`);
      continue;
    }
    try {
      const texte = await _appelGeminiBrut(cle, [{ text: "Réponds uniquement par le mot OK." }], { maxOutputTokens: 10 });
      if (texte && /ok/i.test(texte)) {
        lignes.push(`✅ ${u.label} — clé valide (${_masquerCle(cle)})`);
      } else {
        lignes.push(`⚠️ ${u.label} — réponse inattendue, clé probablement valide (${_masquerCle(cle)})`);
      }
    } catch(e) {
      lignes.push(`❌ ${u.label} — échec (${_masquerCle(cle)}) : ${(e.message||"").slice(0,80)}`);
    }
  }

  const tousOk = lignes.every(l => l.startsWith("✅") || l.startsWith("⚪"));
  result.style.background = tousOk ? "#E8F5E9" : "#FFF3E0";
  result.style.color = tousOk ? "#2D6A4F" : "#92400E";
  result.innerHTML = lignes.join("<br>");

  if (btn) { btn.disabled = false; btn.textContent = "🔌 Tester connexion Gemini"; }
}

// Applique le résultat IA sur une carte ZIP (remplissage des champs)
function _iaAppliquerResultat(i, resultat, f) {
  if (!resultat) return false;
  let nbChamps = 0;

  // Classes — ne remplir que si manquantes
  const classesActuelles = (() => {
    const box = document.getElementById("zip-classes-" + i);
    return box ? [...box.querySelectorAll("input:checked")].map(cb => cb.value) : [];
  })();
  if (!classesActuelles.length && resultat.classes.length) {
    const box = document.getElementById("zip-classes-" + i);
    if (box) {
      box.querySelectorAll("input[type=checkbox]").forEach(cb => {
        const isDetecte = resultat.classes.includes(cb.value);
        cb.checked = isDetecte;
        const lbl = cb.parentElement;
        if (lbl) { lbl.style.background = isDetecte ? "var(--p)" : "var(--card)"; lbl.style.color = isDetecte ? "white" : "var(--t2)"; }
      });
      nbChamps++;
    }
  }

  // Matière — ne remplir que si manquante. On vérifie la valeur ACTUELLE du
  // menu déroulant (pas seulement f.matiere, qui ne reflète que l'état initial
  // détecté par le nom de fichier) : depuis le correctif de l'option vide
  // "— Choisir la matière —", un select resté sur "" signifie vraiment "rien
  // sélectionné", donc Gemini peut proposer sa détection sans risque d'écraser
  // un choix déjà fait par l'utilisateur ou une vraie détection précédente.
  const selMat = document.getElementById("zip-mat-" + i);
  if (selMat && !selMat.value && resultat.matiere) {
    selMat.value = resultat.matiere;
    nbChamps++;
  }

  // Type
  const selType = document.getElementById("zip-type-" + i);
  if (selType && resultat.type) selType.value = resultat.type;

  // Lycée — ne remplir que si pas déjà VRAIMENT détecté par analyserNomFichier
  // (Gemini complète seulement les cas où le nom de fichier n'a rien donné).
  // Important : f.lycee vaut TOUJOURS "principal" ou "autres" (jamais vide,
  // "principal" étant la valeur par défaut), donc on doit utiliser le flag
  // f.lyceeDetecteParNom — pas juste tester si f.lycee est vide, ce qui ne
  // serait jamais le cas et empêcherait systématiquement Gemini de corriger
  // ce champ même quand le contenu réel du document indique un autre lycée.
  const selLycee = document.getElementById("zip-lycee-" + i);
  if (selLycee && !f.lyceeDetecteParNom && resultat.lycee) {
    selLycee.value = resultat.lycee;
    nbChamps++;
  }

  // Année — champ libre, ne remplir que si vide
  const inpAnnee = document.getElementById("zip-annee-" + i);
  if (inpAnnee && !inpAnnee.value && resultat.annee) {
    inpAnnee.value = resultat.annee;
    nbChamps++;
  }

  // Titre — ne remplacer que si vide ou générique
  const inp = document.getElementById("zip-titre-" + i);
  if (inp && resultat.titre) {
    const nomFichier = (f.relativePath || "").split("/").pop().replace(/\.[^.]+$/, "");
    if (!inp.value || inp.value === nomFichier || inp.value.length < 5) {
      inp.value = resultat.titre;
      nbChamps++;
    }
  }

  // Mettre la carte en vert si tout est complété
  const card = document.getElementById("zip-card-" + i);
  if (card && nbChamps > 0) card.style.border = "2px solid #059669";

  return nbChamps > 0;
}

// Scanner un seul fichier (bouton sur la carte)
async function iaScannerFichier(i) {
  const f = zipFilesData[i];
  if (!f || !f.blob) { showToast("❌ Fichier introuvable", "error"); return; }

  const btn = document.getElementById("ia-btn-" + i);
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Analyse..."; }

  // Nouvel ordre de priorité (2026) : nom de fichier déjà tenté en amont par
  // analyserNomFichier lors du chargement du ZIP → ici on tente d'abord
  // GEMINI (analyse visuelle, détecte aussi multi-classes/lycée/année), et
  // seulement si Gemini n'est pas configuré ou n'a rien donné, on retombe sur
  // pdf.js + mots-clés (dernier recours, texte brut uniquement).
  let resultat = null;
  let ok = false;

  if (getGeminiKey && GEMINI_KEYS_ZIP.length) {
    if (btn) btn.textContent = "⏳ Analyse IA (Gemini)...";
    resultat = await _iaAnalyserAvecGemini(f.blob, _mimeTypePourFichier(f.ext));
    ok = resultat ? _iaAppliquerResultat(i, resultat, f) : false;
  }

  if (!ok) {
    if (btn) btn.textContent = "⏳ Analyse PDF...";
    const texte = await _iaExtraireTextePDF(f.blob);
    const resultatTexte = (texte && texte.length >= 20) ? _iaAnalyserTexte(texte) : null;
    if (resultatTexte) {
      resultat = resultatTexte;
      ok = _iaAppliquerResultat(i, resultat, f);
    }
  }

  // Synchroniser zipFilesData (pas seulement le DOM) — important pour que
  // publierTousZip() et le compteur global voient bien ce changement, et pour
  // que les futurs scans (ex: iaToutAnalyser) ne considèrent plus ce fichier
  // comme "incomplet" si l'IA vient justement de le compléter ici.
  if (resultat) {
    if (resultat.classes && resultat.classes.length && !(f.classes && f.classes.length)) {
      f.classes = resultat.classes;
      f.classe = resultat.classes.join(",");
    }
    if (resultat.matiere && !f.matiere) f.matiere = resultat.matiere;
    if (resultat.lycee && !f.lycee) f.lycee = resultat.lycee;
    if (resultat.annee && !f.annee) f.annee = resultat.annee;
    if (resultat._source === "gemini") f.detecteParGemini = true;
  }

  // Mettre à jour le bandeau d'avertissement "Rien détecté" de la carte —
  // sinon il reste affiché à tort même quand l'IA vient de compléter classe et
  // matière juste en dessous, ce qui est trompeur pour le modérateur.
  _rafraichirBandeauZip(i);
  _majCompteurZip();

  if (!resultat) {
    showToast("⚠️ PDF scanné ou vide — texte illisible. Remplis manuellement.", "info");
    if (btn) { btn.disabled = false; btn.textContent = "🤖 Analyser avec l'IA"; }
    return;
  }

  if (ok) {
    const resume = [
      resultat.classes.length ? "Classe : " + resultat.classes.join(", ") : null,
      resultat.matiere ? "Matière : " + (NOMS_MATIERES[resultat.matiere] || resultat.matiere) : null,
    ].filter(Boolean).join(" · ");
    showToast((resultat._source === "gemini" ? "🤖 Gemini a détecté : " : "🤖 IA a détecté : ") + resume, "success");
    if (btn) { btn.textContent = "✅ Complété — vérifie et publie"; btn.style.background = "#059669"; }
  } else {
    showToast("🤖 IA n'a rien détecté dans ce PDF — remplis manuellement", "info");
    if (btn) { btn.disabled = false; btn.textContent = "🤖 Réessayer"; }
  }
}

// Retire (ou affiche) le bandeau rouge "⚠️ Rien détecté dans le nom/dossier"
// d'une carte ZIP en fonction de l'état RÉEL et ACTUEL des champs classe(s) +
// matière — appelée après toute analyse IA, puisque ce bandeau était calculé
// une seule fois à l'affichage initial et ne se mettait jamais à jour après,
// même quand l'IA complétait les champs juste en dessous (confusion pour le
// modérateur : le message disait "rien détecté" alors que si).
function _rafraichirBandeauZip(i) {
  const card = document.getElementById("zip-card-" + i);
  if (!card) return;
  const f = zipFilesData[i];
  const classesBox = document.getElementById("zip-classes-" + i);
  const classesOk = classesBox ? classesBox.querySelectorAll('input[type="checkbox"]:checked').length > 0 : false;
  const matOk = (document.getElementById("zip-mat-" + i)?.value || "") !== "";
  const aCompleter = !classesOk || !matOk;

  // Bandeau rouge "incomplet"
  const bandeau = card.querySelector(":scope > div[data-role='bandeau-incomplet']");
  if (aCompleter && !bandeau) {
    const div = document.createElement("div");
    div.dataset.role = "bandeau-incomplet";
    div.style.cssText = "background:rgba(229,57,53,0.12);color:var(--red);font-weight:800;font-size:10px;padding:5px 8px;border-radius:8px;margin-bottom:8px";
    div.textContent = "⚠️ Rien détecté — complète manuellement ci-dessous";
    card.insertBefore(div, card.firstChild);
  } else if (!aCompleter && bandeau) {
    bandeau.remove();
  }

  // Badge bleu "détecté par Gemini" — ajouté dynamiquement après un scan en
  // différé (iaToutAnalyser / _iaAutoCompletionZip), puisqu'il n'apparaissait
  // jusqu'ici qu'au tout premier rendu de la carte (afficherResultatZip).
  const badgeGemini = card.querySelector(":scope > div[data-role='badge-gemini']");
  if (f && f.detecteParGemini && !badgeGemini) {
    const div = document.createElement("div");
    div.dataset.role = "badge-gemini";
    div.style.cssText = "background:rgba(33,150,243,0.1);color:#2196F3;font-weight:700;font-size:9px;padding:4px 8px;border-radius:8px;margin-bottom:8px";
    div.textContent = "🤖 Classe/matière détectée par Gemini (analyse du contenu) — vérifie que c'est correct";
    // Insérer après le bandeau rouge s'il existe encore, sinon en premier
    const bandeauActuel = card.querySelector(":scope > div[data-role='bandeau-incomplet']");
    card.insertBefore(div, bandeauActuel ? bandeauActuel.nextSibling : card.firstChild);
  }

  card.style.border = aCompleter ? "2px solid var(--red)" : "2px solid #059669";

  // Badge "X classe(s)" / "❌ classe?" en coin de carte — lui aussi figé au
  // rendu initial avant ce correctif, ce qui pouvait afficher "❌ classe?" même
  // après qu'une classe ait été cochée (manuellement ou par l'IA).
  const badgeClasse = document.getElementById("zip-badge-classe-" + i);
  if (badgeClasse) {
    if (classesOk) {
      const classesCochees = classesBox ? [...classesBox.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value) : [];
      badgeClasse.textContent = classesCochees.join(" + ");
      badgeClasse.style.background = "var(--p)";
    } else {
      badgeClasse.textContent = "❌ classe?";
      badgeClasse.style.background = "var(--red)";
    }
  }
}

// Scanner automatiquement tous les fichiers incomplets
// Détermine si un fichier ZIP est encore "incomplet" (nécessite une analyse
// IA ou une saisie manuelle) — centralisé ici pour que iaScannerFichier,
// iaToutAnalyser, _iaAutoCompletionZip et les compteurs utilisent TOUS
// exactement le même critère. Un fichier est incomplet s'il manque la classe
// OU la matière (le lycée et l'année ont des valeurs par défaut acceptables
// — "principal" et vide respectivement — donc on ne les force pas comme
// condition de blocage, sinon Gemini serait re-appelé indéfiniment sur des
// fichiers déjà publiables juste parce que l'année n'a pas pu être trouvée).
function _ficheEstIncomplete(f) {
  return !(f.classes && f.classes.length) || !f.matiere;
}

async function iaToutAnalyser() {
  const incomplets = zipFilesData.map((f, i) => ({ f, i }))
    .filter(({ f }) => _ficheEstIncomplete(f));

  if (!incomplets.length) { showToast("✅ Tous les fichiers sont déjà complets !", "success"); return; }

  const btn = document.getElementById("zipIaBtn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Analyse en cours..."; }

  showToast("🤖 Analyse de " + incomplets.length + " fichier(s) incomplet(s)...", "info");

  let nb = 0;
  for (const { f, i } of incomplets) {
    const cardBtn = document.getElementById("ia-btn-" + i);
    if (cardBtn) { cardBtn.disabled = true; cardBtn.textContent = "⏳..."; }

    // Ordre : nom de fichier (déjà fait) → Gemini → pdf.js (dernier recours)
    let resultat = null;
    let appliqueOk = false;

    if (GEMINI_KEYS_ZIP.length) {
      resultat = await _iaAnalyserAvecGemini(f.blob, _mimeTypePourFichier(f.ext));
      appliqueOk = resultat ? _iaAppliquerResultat(i, resultat, f) : false;
    }

    if (!appliqueOk) {
      const texte = await _iaExtraireTextePDF(f.blob);
      const resultatTexte = (texte && texte.length >= 20) ? _iaAnalyserTexte(texte) : null;
      if (resultatTexte) appliqueOk = _iaAppliquerResultat(i, resultatTexte, f);
      if (resultatTexte) resultat = resultatTexte;
    }

    // Synchroniser zipFilesData (pas seulement le DOM) — voir explication dans iaScannerFichier
    if (resultat) {
      if (resultat.classes && resultat.classes.length && !(f.classes && f.classes.length)) {
        f.classes = resultat.classes;
        f.classe = resultat.classes.join(",");
      }
      if (resultat.matiere && !f.matiere) f.matiere = resultat.matiere;
      if (resultat.lycee && !f.lycee) f.lycee = resultat.lycee;
      if (resultat.annee && !f.annee) f.annee = resultat.annee;
      if (resultat._source === "gemini") f.detecteParGemini = true;
    }

    _rafraichirBandeauZip(i);
    if (appliqueOk) nb++;
    await new Promise(r => setTimeout(r, 100)); // respirer entre chaque
  }

  _majCompteurZip();
  if (btn) { btn.disabled = false; btn.textContent = "🤖 Tout analyser"; }
  showToast("🤖 IA terminée — " + nb + "/" + incomplets.length + " fichier(s) complété(s)", nb > 0 ? "success" : "info");
}

// Analyse automatique après chargement du ZIP — complète les partiels aussi
async function _iaAutoCompletionZip() {
  // Fichiers où il manque la classe OU la matière (pas seulement les deux)
  const aCompleter = zipFilesData.filter(_ficheEstIncomplete);
  if (!aCompleter.length) return;

  // Afficher le bouton "Tout analyser" dans la toolbar
  const iaBtn = document.getElementById("zipIaBtn");
  if (iaBtn) iaBtn.style.display = "inline-block";

  // Scan silencieux en arrière-plan — pas de toast pour chaque fichier
  for (const f of aCompleter) {
    const i = zipFilesData.indexOf(f);

    // Ordre : nom de fichier (déjà fait par analyserNomFichier) → Gemini → pdf.js
    let resultat = null;
    if (GEMINI_KEYS_ZIP.length) {
      resultat = await _iaAnalyserAvecGemini(f.blob, _mimeTypePourFichier(f.ext));
    }
    const resultatVide = !resultat || (!resultat.classes.length && !resultat.matiere);
    if (resultatVide) {
      const texte = await _iaExtraireTextePDF(f.blob);
      const resultatTexte = (texte && texte.length >= 20) ? _iaAnalyserTexte(texte) : null;
      if (resultatTexte && (resultatTexte.classes.length || resultatTexte.matiere)) resultat = resultatTexte;
    }
    if (!resultat) continue;

    _iaAppliquerResultat(i, resultat, f);
    // Mettre à jour zipFilesData aussi pour que publierTousZip ait les bonnes valeurs
    if (resultat.classes.length && !(f.classes && f.classes.length)) {
      f.classes = resultat.classes;
      f.classe = resultat.classes.join(",");
    }
    if (resultat.matiere && !f.matiere) f.matiere = resultat.matiere;
    if (resultat.lycee && !f.lycee) f.lycee = resultat.lycee;
    if (resultat.annee && !f.annee) f.annee = resultat.annee;
    if (resultat._source === "gemini") f.detecteParGemini = true;
    _rafraichirBandeauZip(i);
    await new Promise(r => setTimeout(r, 80));
  }

  // Mettre à jour le compteur en haut
  const nbRestants = _majCompteurZip();
  if (nbRestants === 0) {
    const goBtn = document.getElementById("zipGoIncompletBtn");
    if (goBtn) goBtn.style.display = "none";
  }
  if (nbRestants < aCompleter.length) {
    showToast("🤖 IA a complété " + (aCompleter.length - nbRestants) + " fichier(s) automatiquement", "success");
  }
}

// Recalcule et affiche le compteur "X fichier(s) détecté(s) — Y à compléter"
// en haut de la liste ZIP, en se basant sur l'état RÉEL et ACTUEL des champs
// (pas seulement les valeurs initiales détectées au chargement du ZIP).
// Retourne le nombre de fichiers encore incomplets — utile pour les appelants
// qui veulent savoir s'il reste du travail manuel ou afficher un toast.
function _majCompteurZip() {
  const nbRestants = zipFilesData.filter(_ficheEstIncomplete).length;
  const title = document.getElementById("zipResultTitle");
  if (title) {
    title.innerHTML = "📂 " + zipFilesData.length + " fichier(s) détecté(s)"
      + (nbRestants
        ? " <span style='color:var(--red);font-size:12px;font-weight:800'>— ⚠️ " + nbRestants + " à compléter manuellement</span>"
        : " <span style='color:#059669;font-size:12px;font-weight:800'>— ✅ tout détecté</span>");
  }
  return nbRestants;
}

// ========== FIN IA SCANNER ==========

function afficherResultatZip() {
  const section = document.getElementById("zipResultSection");
  const list = document.getElementById("zipFilesList");
  const title = document.getElementById("zipResultTitle");
  if (!section || !list) return;

  section.style.display = "block";
  // ── Filtrer les doublons dès l'affichage ZIP ──
  if (typeof _filtrerDoublons === "function") {
    const { nouveaux, ignores } = _filtrerDoublons(zipFilesData);
    if (ignores.length > 0) {
      zipFilesData = nouveaux;
      const msg = ignores.length === 1
        ? `⚠️ 1 fichier ignoré (déjà publié) : "${(ignores[0].titre||ignores[0].relativePath||"?").slice(0,40)}"`
        : `⚠️ ${ignores.length} fichiers ignorés car déjà présents dans l'app.`;
      if (typeof showToast === "function") showToast(msg, "info");
    }
  }

  // Compteur des fichiers où l'app n'a rien pu deviner (ni classe ni matière) —
  // affiché en haut pour les repérer en un coup d'œil sans scroller toute la liste.
  const nbACompleter = zipFilesData.filter(_ficheEstIncomplete).length;
  title.innerHTML = `📂 ${zipFilesData.length} fichier(s) détecté(s)`
    + (nbACompleter ? ` <span style="color:var(--red);font-size:12px;font-weight:800">— ⚠️ ${nbACompleter} à compléter</span>` : ` <span style="color:#059669;font-size:12px;font-weight:800">— ✅ tout détecté</span>`);
  const goBtn = document.getElementById("zipGoIncompletBtn");
  if (goBtn) goBtn.style.display = nbACompleter ? "inline-block" : "none";

  list.innerHTML = zipFilesData.map((f, i) => {
    const classesDetectees = f.classes && f.classes.length ? f.classes : [];
    const lyceeDetecte = f.lycee || "principal";
    const aCompleter = !classesDetectees.length || !f.matiere;
    return `
    <div id="zip-card-${i}" style="background:var(--bg);border-radius:12px;padding:12px;border:${aCompleter ? '2px solid var(--red)' : '1px solid var(--border)'}">
      ${aCompleter ? '<div data-role="bandeau-incomplet" style="background:rgba(229,57,53,0.12);color:var(--red);font-weight:800;font-size:10px;padding:5px 8px;border-radius:8px;margin-bottom:8px">⚠️ Rien détecté — complète manuellement ci-dessous</div>' : ''}
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
        <div style="font-size:10px;color:var(--t3);word-break:break-all;flex:1">${f.relativePath}</div>
        <span id="zip-badge-classe-${i}" style="font-size:9px;background:${classesDetectees.length?'var(--p)':'var(--red)'};color:white;padding:2px 6px;border-radius:6px;margin-left:6px;flex-shrink:0">${classesDetectees.length?classesDetectees.join(' + '):'❌ classe?'}</span>
      </div>
      ${f.detecteParGemini ? '<div data-role="badge-gemini" style="background:rgba(33,150,243,0.1);color:#2196F3;font-weight:700;font-size:9px;padding:4px 8px;border-radius:8px;margin-bottom:8px">🤖 Classe/matière détectée par Gemini (analyse du contenu) — vérifie que c\'est correct</div>' : ''}

      <!-- Sélection multi-classes -->
      <div style="font-size:9px;color:var(--t2);font-weight:700;margin-bottom:4px">🎯 Classe(s) — coche toutes celles concernées</div>
      <div id="zip-classes-${i}" style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px">
        ${CLASSES.map(c => `
          <label style="display:flex;align-items:center;gap:3px;background:${classesDetectees.includes(c)?'var(--p)':'var(--card)'};color:${classesDetectees.includes(c)?'white':'var(--t2)'};border:1px solid var(--border);border-radius:8px;padding:4px 7px;font-size:10px;font-weight:700;cursor:pointer" onclick="this.style.background=this.querySelector('input').checked?'var(--p)':'var(--card)';this.style.color=this.querySelector('input').checked?'white':'var(--t2)'">
            <input type="checkbox" value="${c}" ${classesDetectees.includes(c)?'checked':''} style="margin:0;width:12px;height:12px">${c}
          </label>`).join("")}
      </div>

      <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">
        <select id="zip-mat-${i}" style="flex:1;min-width:80px;padding:6px;border-radius:8px;border:1px solid var(--border);background:var(--bg);font-size:16px;color:var(--text)">
          <option value="" ${!f.matiere?'selected':''}>— Choisir la matière —</option>
          ${MATIERES.map(m=>`<option value="${m}" ${m===f.matiere?'selected':''}>${NOMS_MATIERES[m]||m}</option>`).join("")}
        </select>
        <select id="zip-type-${i}" style="flex:1;min-width:80px;padding:6px;border-radius:8px;border:1px solid var(--border);background:var(--bg);font-size:16px;color:var(--text)">
          <option value="cours" ${f.type==='cours'?'selected':''}>📚 Cours</option>
          <option value="sequencielle" ${f.type==='sequencielle'?'selected':''}>📋 Séq.</option>
          <option value="examen_officiel" ${f.type==='examen_officiel'?'selected':''}>🏆 Officiel</option>
          <option value="la_zone" ${f.type==='la_zone'?'selected':''}>🔥 La Zone</option>
          <option value="competences" ${f.type==='competences'?'selected':''}>🎯 Compét.</option>
        </select>
      </div>

      <!-- Lycée (principal vs autres établissements) -->
      <div style="font-size:9px;color:var(--t2);font-weight:700;margin-bottom:4px">🏫 Provenance ${lyceeDetecte==='autres'?'<span style="color:#2196F3">— détecté: autre établissement</span>':''}</div>
      <select id="zip-lycee-${i}" style="width:100%;padding:6px;border-radius:8px;border:1px solid var(--border);background:var(--bg);font-size:16px;color:var(--text);margin-bottom:8px">
        <option value="principal" ${lyceeDetecte==='principal'?'selected':''}>🏠 Lycée du Manengouba (principal)</option>
        <option value="autres" ${lyceeDetecte==='autres'?'selected':''}>🏫 Autre établissement</option>
      </select>

      <div style="display:flex;gap:5px;margin-bottom:8px">
        <input id="zip-annee-${i}" value="${esc(f.annee||'')}" placeholder="📅 Année (ex: 2024)" maxlength="4" inputmode="numeric"
          style="width:100%;padding:7px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);font-size:16px;color:var(--text)">
      </div>

      <input id="zip-titre-${i}" value="${esc(f.titre)}" placeholder="Titre"
        style="width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);font-size:16px;font-weight:700;color:var(--text);margin-bottom:6px">

      <!-- Premium ou gratuit -->
      <label style="display:flex;align-items:center;gap:6px;margin-bottom:8px;cursor:pointer;font-size:11px;font-weight:700;color:var(--t2)">
        <input type="checkbox" id="zip-premium-${i}" style="width:16px;height:16px;margin:0">
        🔒 Contenu Premium (sinon gratuit pour tous)
      </label>

      ${aCompleter ? `<button onclick="iaScannerFichier(${i})" id="ia-btn-${i}"
        style="width:100%;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;border:none;border-radius:10px;padding:9px;font-weight:800;font-size:12px;cursor:pointer;margin-bottom:6px">
        🤖 Analyser avec l'IA
      </button>` : ''}
      <button onclick="publierFichierZip(${i})"
        style="width:100%;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:10px;padding:9px;font-weight:800;font-size:12px;cursor:pointer">
        🚀 Publier ce fichier
      </button>
    </div>`;
  }).join("");
}

async function publierFichierZip(i) {
  const f = zipFilesData[i];
  if (!f) return;

  // Lire toutes les classes cochées
  const classesBox = document.getElementById(`zip-classes-${i}`);
  const classesChoisies = classesBox
    ? [...classesBox.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value)
    : [];
  const mat   = document.getElementById(`zip-mat-${i}`)?.value;
  const type  = document.getElementById(`zip-type-${i}`)?.value;
  const lycee = document.getElementById(`zip-lycee-${i}`)?.value || "principal";
  const annee = document.getElementById(`zip-annee-${i}`)?.value?.trim() || "";
  const premium = document.getElementById(`zip-premium-${i}`)?.checked || false;
  const titre = document.getElementById(`zip-titre-${i}`)?.value?.trim();

  if (!classesChoisies.length || !mat || !titre) { showToast("❌ Choisis au moins une classe et remplis tous les champs", "error"); return; }

  const classe = classesChoisies.join(","); // ex: "1ère_C,1ère_D" — comme pour le contenu normal

  // ── Anti-doublons (correspondance EXACTE de titre) ──
  if (_estDoublon(titre, mat, classe)) {
    showToast(`⚠️ Doublon détecté — "${titre}" existe déjà pour cette classe/matière`, "error");
    return;
  }

  // ── Anti-doublons par similarité de titre (Clé 2 Gemini) — même logique
  // stricte que pour les élèves et le panel modérateur classique : rejet
  // automatique ≥80%, file d'attente "à vérifier" entre 55-80%. ──
  const verifDoublonZip = await verifierDoublonAvantPublicationRapide(titre, mat, classe);
  if (verifDoublonZip.niveau === "doublon") {
    showToast(`⚠️ Doublon détecté (${Math.round(verifDoublonZip.score*100)}% similaire à "${(verifDoublonZip.contenuSimilaire?.titre||"").slice(0,40)}")`, "error");
    return;
  }
  if (verifDoublonZip.niveau === "zone_grise") {
    _ajouterAFileVerificationDoublons({
      titreCandidat: verifDoublonZip.titre, score: verifDoublonZip.score,
      titreSimilaire: verifDoublonZip.contenuSimilaire?.titre || "",
      idContenuSimilaire: verifDoublonZip.contenuSimilaire?.id || null,
      mat, classe,
      contexte: { type: "publication_zip", titre, indexZip: i },
    });
    showToast(`⏳ Mis en file de vérification — ${Math.round(verifDoublonZip.score*100)}% similaire à un contenu existant. Vérifie dans "Doublons à vérifier".`, "info");
    return;
  }

  showToast("⏳ Upload en cours...", "info");
  try {
    // Un SEUL upload Cloudinary, même si plusieurs classes sont concernées
    // (le fichier n'est pas dupliqué — il est juste rattaché à plusieurs classes)
    const formData = new FormData();
    const ZIP_EXT_VERS_MIME_UPLOAD = {
      pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
    // Nom de fichier PROPRE généré à partir des métadonnées détectées (demande
    // Jean 2026), au lieu du nom brut du ZIP ("cc.pdf", "vhhh.pdf"...) qui
    // n'apporte aucune information une fois le fichier publié. Le nom
    // original reste conservé séparément (newEntry.nomOriginal ci-dessous)
    // pour ne pas perturber la détection de doublons par nom de fichier, qui
        // s'appuie sur le nom ORIGINAL du fichier soumis, pas sur ce nom généré
    // qui peut légitimement se répéter entre deux fichiers différents
    // partageant la même matière/classe/type/année (ex: deux devoirs
    // différents de la même séquence).
    const nomFichierPropre = _genererNomFichierPropre(mat, classe, type, annee, f.ext);
    const blobFile = new File([f.blob], nomFichierPropre, { type: f.blob.type || ZIP_EXT_VERS_MIME_UPLOAD[f.ext] || "application/pdf" });
    formData.append("file", blobFile);
    formData.append("upload_preset", _getCfg("cloudinaryPreset") || "learnupr_uploads");
    formData.append("folder", `learnup/${mat}`);
    // Extraire le cloudName depuis CLOUDINARY_URL ou depuis la config
    let cloudName = _getCfg("cloudinaryCloud") || "";
    if (!cloudName && CLOUDINARY_URL) {
      const m = CLOUDINARY_URL.match(/v1_1\/([^/]+)/);
      if (m) cloudName = m[1];
    }
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method:"POST", body: formData });
    const uploadData = await uploadRes.json();
    if (!uploadData.secure_url) throw new Error(uploadData.error?.message || "Upload échoué");

    // Publier dans l'app — une seule entrée, "classe" contient la liste de toutes les classes
    // IMPORTANT : l'app affiche le contenu en filtrant sur le champ "type" COURT
    // ("examen", "cours", "sequencielle", "la_zone", "competences"), alors que
    // "type" interne au ZIP est la valeur détaillée ("examen_officiel" etc.).
    // Sans cette conversion, un examen importé par ZIP reste invisible dans
    // l'onglet "Épreuves officielles" — il faut donc bien les distinguer.
    const ZIP_TYPE_VERS_TYPE_APP = {
      cours: "cours", sequencielle: "sequencielle", examen_officiel: "examen",
      la_zone: "la_zone", competences: "competences"
    };
    const typeApp = ZIP_TYPE_VERS_TYPE_APP[type] || "examen";

    const publies = JSON.parse(localStorage.getItem("contenu_publie")||"[]");
    const ZIP_EXT_VERS_MIME = {
      pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
    const newEntry = {
      id: Date.now()+i, type: typeApp, typeFichier: type, mat, classe, titre, lycee, annee,
      numero: publies.filter(p=>p.type===typeApp&&p.mat===mat&&_classeMatch(p.classe,classesChoisies[0])).length+1,
      contenu: "", fichierUrl: uploadData.secure_url,
      fichierType: ZIP_EXT_VERS_MIME[f.ext] || "application/pdf",
      nom: f.relativePath.split("/").pop(), // nom de fichier ORIGINAL — utilisé pour l'anti-doublon, ne pas remplacer par le nom généré
      nomOriginal: f.relativePath.split("/").pop(),
      premium, auteur: localStorage.getItem("userPhone")||"modo", date: Date.now()
    };
    publies.push(newEntry);
    localStorage.setItem("contenu_publie", JSON.stringify(publies));
    if (turso) {
      try {
        await turso.execute({
          sql:"INSERT INTO contenu (id,type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,lycee,annee,premium,auteur,date,nom) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          args:[newEntry.id,typeApp,type,mat,classe,titre,newEntry.numero,"",uploadData.secure_url,lycee,annee,premium?1:0,newEntry.auteur,newEntry.date,newEntry.nom||""]
        });
      } catch(eTurso) {
        // Repli si la colonne "annee" n'existe pas encore sur cette base Turso
        // (anciens déploiements n'ayant jamais lancé l'outil "Classement par année")
        try {
          await turso.execute({
            sql:"INSERT INTO contenu (id,type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,lycee,premium,auteur,date,nom) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            args:[newEntry.id,typeApp,type,mat,classe,titre,newEntry.numero,"",uploadData.secure_url,lycee,premium?1:0,newEntry.auteur,newEntry.date,newEntry.nom||""]
          });
        } catch(eTurso2) { console.warn("ZIP Turso insert:", eTurso2.message); }
      }
    }
    // Griser la carte une fois publiée
    const btn = document.querySelector(`#zipFilesList > div:nth-child(${i+1}) button:last-child`);
    if (btn) { btn.textContent = "✅ Publié"; btn.style.background="#ccc"; btn.disabled = true; }
    showToast(`✅ "${titre}" publié pour ${classesChoisies.length} classe(s) !`, "success");
    renderContent();
  } catch(e) {
    showToast("❌ Erreur: " + e.message, "error");
  }
}

// Bascule en un clic le statut Premium de TOUS les fichiers du ZIP affichés,
// pour éviter de devoir cocher chaque case une par une. Comportement bascule :
// si moins de la moitié sont déjà cochées, on coche tout (passe en Premium) ;
// sinon on décoche tout (repasse en gratuit). Met aussi à jour visuellement
// chaque case (et son fond coloré) pour rester cohérent avec le clic manuel.
function toggleTousPremiumZip() {
  const checkboxes = zipFilesData.map((_, i) => document.getElementById(`zip-premium-${i}`)).filter(Boolean);
  if (!checkboxes.length) return;
  const nbCochees = checkboxes.filter(cb => cb.checked).length;
  const toutCocher = nbCochees < checkboxes.length / 2;
  checkboxes.forEach(cb => { cb.checked = toutCocher; });
  const btn = document.getElementById("zipTogglePremiumBtn");
  if (btn) btn.textContent = toutCocher ? "🆓 Tout en Gratuit" : "🔒 Tout en Premium";
  showToast(toutCocher ? `🔒 ${checkboxes.length} fichier(s) passé(s) en Premium` : `🆓 ${checkboxes.length} fichier(s) passé(s) en Gratuit`, "success");
}

async function publierTousZip() {
  if (!zipFilesData.length) return;
  // Pré-vérification doublons
  let nbDoublons = 0;
  zipFilesData.forEach((f, i) => {
    const classesChoisies = (() => {
      const box = document.getElementById(`zip-classes-${i}`);
      return box ? [...box.querySelectorAll('input:checked')].map(cb=>cb.value) : (f.classes||[]);
    })();
    const mat = document.getElementById(`zip-mat-${i}`)?.value || f.matiere;
    const titre = document.getElementById(`zip-titre-${i}`)?.value?.trim() || f.titre;
    if (_estDoublon(titre, mat, classesChoisies.join(","))) nbDoublons++;
  });
  if (nbDoublons > 0) {
    showToast(`⚠️ ${nbDoublons} doublon(s) détecté(s) — ils seront ignorés automatiquement`, "info");
  }
  showToast(`⏳ Publication de ${zipFilesData.length} fichiers...`, "info");
  for (let i = 0; i < zipFilesData.length; i++) {
    await publierFichierZip(i);
    await new Promise(r => setTimeout(r, 500)); // éviter rate limit
  }
  showToast("✅ Tous les fichiers publiés !", "success");
}

// ========== CORRECTION EN MASSE DES CLASSES (MODO/ADMIN) ==========
function ouvrirCorrectionClasses() {
  // Vérification rôle modo/admin
  const role = localStorage.getItem("userRole") || "";
  if (role !== "admin" && role !== "moderator") {
    showToast("❌ Réservé aux modérateurs et administrateurs", "error");
    return;
  }
  if (!zipFilesData.length) { showToast("❌ Aucun fichier ZIP chargé", "error"); return; }

  // Construire le modal
  const overlay = document.createElement("div");
  overlay.id = "correctionClassesModal";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:flex-end;justify-content:center";
  overlay.innerHTML = `
    <div style="background:var(--card);border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:600px;max-height:85vh;overflow-y:auto">
      <div style="font-weight:900;font-size:16px;color:var(--p);margin-bottom:6px">✏️ Correction en masse des classes</div>
      <div style="font-size:11px;color:var(--t3);margin-bottom:14px">Remplace la classe détectée par une ou plusieurs classes pour TOUS les fichiers du ZIP en un clic.</div>

      <div style="font-size:10px;font-weight:800;color:var(--t3);margin-bottom:6px">🔄 REMPLACER cette classe détectée...</div>
      <select id="corrFromClasse" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--bg);font-size:15px;color:var(--text);margin-bottom:12px">
        <option value="__TOUS__">— Tous les fichiers (peu importe la classe) —</option>
        ${CLASSES.map(c => `<option value="${c}">${c.replace(/_/g," ")}</option>`).join("")}
      </select>

      <div style="font-size:10px;font-weight:800;color:var(--t3);margin-bottom:6px">✅ ...PAR ces classe(s) :</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px" id="corrToClasses">
        ${CLASSES.map(c => `
          <label style="display:flex;align-items:center;gap:4px;background:var(--bg);border:1px solid var(--border);border-radius:8px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer" id="corr-lbl-${c.replace(/[^a-zA-Z0-9]/g,'_')}">
            <input type="checkbox" value="${c}" style="width:13px;height:13px;margin:0" onchange="
              const lbl=document.getElementById('corr-lbl-${c.replace(/[^a-zA-Z0-9]/g,'_')}');
              lbl.style.background=this.checked?'var(--p)':'var(--bg)';
              lbl.style.color=this.checked?'white':'var(--text)';
              lbl.style.borderColor=this.checked?'var(--p)':'var(--border)'">
            ${c.replace(/_/g," ")}
          </label>`).join("")}
      </div>

      <div style="display:flex;gap:8px">
        <button onclick="appliquerCorrectionClasses()" style="flex:1;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:12px;padding:12px;font-weight:800;font-size:13px;cursor:pointer">✅ Appliquer à tous</button>
        <button onclick="document.getElementById('correctionClassesModal').remove()" style="background:var(--card);border:1px solid var(--border);color:var(--text);border:none;border-radius:12px;padding:12px 16px;font-weight:700;font-size:13px;cursor:pointer">✕</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

function appliquerCorrectionClasses() {
  const role = localStorage.getItem("userRole") || "";
  if (role !== "admin" && role !== "moderator") return;

  const fromClasse = document.getElementById("corrFromClasse")?.value;
  const toClasses = [...document.querySelectorAll("#corrToClasses input:checked")].map(cb => cb.value);

  if (!toClasses.length) { showToast("❌ Coche au moins une classe de remplacement", "error"); return; }

  let nbModifies = 0;
  zipFilesData.forEach(f => {
    const concerne = fromClasse === "__TOUS__" || (f.classes && f.classes.includes(fromClasse)) || !f.classes?.length;
    if (!concerne) return;
    f.classes = [...toClasses];
    f.classe = toClasses.join(",");
    nbModifies++;
  });

  document.getElementById("correctionClassesModal")?.remove();
  afficherResultatZip(); // Rafraîchir l'affichage
  showToast(`✅ ${nbModifies} fichier(s) corrigé(s) → ${toClasses.map(c=>c.replace(/_/g," ")).join(", ")}`, "success");
}

// ========== ANTI-DOUBLONS ==========
function _estDoublon(titre, mat, classe) {
  // Normalise pour comparaison : minuscules, sans espaces doubles, sans accents
  const norm = s => (s||"").toLowerCase().replace(/\s+/g," ").trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const titreCible = norm(titre);
  const matCible = norm(mat);
  // Compare avec tout le contenu déjà publié
  const publies = getContenuPublie();
  return publies.some(p => {
    if (norm(p.mat) !== matCible) return false;
    if (norm(p.titre) !== titreCible) return false;
    // Vérifie intersection de classes
    const classesP = (p.classe||"").split(",").map(c=>c.trim());
    const classesCibles = (classe||"").split(",").map(c=>c.trim());
    return classesCibles.some(c => classesP.includes(c));
  });
}

// ========== DÉTECTION DE DOUBLONS PAR SIMILARITÉ DE TITRE (usage Clé 2 "doublon") ==========
// Demande Jean (2026) : pour chaque nouvelle soumission/publication, Gemini
// (clé "doublon") génère/confirme un titre, puis on compare ce titre — par un
// calcul de similarité LOCAL (rapide, gratuit, fiable — pas d'appel API pour
// le calcul lui-même) — à tous les titres déjà publiés dans la même
// matière/classe. Trois issues possibles :
//   • similarité ≥ SEUIL_DOUBLON_AUTO (80%) → rejet automatique (doublon certain)
//   • similarité ≥ SEUIL_ZONE_GRISE (55%) et < 80% → file d'attente "à vérifier"
//     pour le panel modérateur (ambigu, décision humaine)
//   • sinon                               → nouveau contenu, publication normale
// (constantes déclarées tout en haut du script, avec ADMIN_PHONES etc.)

// Découpe un titre en un ensemble de mots significatifs (longueur ≥ 2, pour
// ignorer les lettres isolées type "C"/"D" qui faussent le score de classe).
// IMPORTANT : utilise sa propre normalisation (accents/casse retirés, mais
// espaces CONSERVÉS comme séparateurs de mots) plutôt que _normaliserTitre,
// qui sert à la comparaison exacte de doublons et retire tous les espaces —
// ce qui collerait tous les mots du titre en une seule chaîne et empêcherait
// toute comparaison par mots.
function _motsSignificatifs(titre) {
  const normaliseAvecEspaces = String(titre ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
  return new Set(
    normaliseAvecEspaces.split(/\s+/).filter(w => w.length >= 2)
  );
}

// Indice de Jaccard (taille de l'intersection / taille de l'union) entre les
// ensembles de mots de deux titres — robuste à l'ordre des mots, aux accents,
// à la casse et à la ponctuation (déjà nettoyés par _normaliserTitre). Rapide
// (pas d'appel réseau) et largement utilisé pour ce type de comparaison.
function _similariteTitres(titreA, titreB) {
  const a = _motsSignificatifs(titreA);
  const b = _motsSignificatifs(titreB);
  if (!a.size && !b.size) return 1;
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const mot of a) if (b.has(mot)) intersection++;
  const union = a.size + b.size - intersection;
  return union > 0 ? intersection / union : 0;
}

// Cherche, parmi le contenu déjà publié pour la même matière (et idéalement la
// même classe), le titre le plus similaire au titre candidat. Retourne
// { niveau: "doublon"|"zone_grise"|"nouveau", score, contenuSimilaire }.
function _chercherDoublonParSimilarite(titreCandidat, mat, classe) {
  if (!titreCandidat) return { niveau: "nouveau", score: 0, contenuSimilaire: null };
  const publies = getContenuPublie();
  const normMat = (s) => (s||"").toLowerCase().trim();
  const classesCibles = (classe||"").split(",").map(c=>c.trim()).filter(Boolean);

  let meilleurScore = 0, meilleurContenu = null;
  for (const p of publies) {
    if (normMat(p.mat) !== normMat(mat)) continue; // matière différente → jamais comparé
    const score = _similariteTitres(titreCandidat, p.titre || "");
    if (score > meilleurScore) { meilleurScore = score; meilleurContenu = p; }
  }

  if (meilleurScore >= SEUIL_DOUBLON_AUTO) return { niveau: "doublon", score: meilleurScore, contenuSimilaire: meilleurContenu };
  if (meilleurScore >= SEUIL_ZONE_GRISE)   return { niveau: "zone_grise", score: meilleurScore, contenuSimilaire: meilleurContenu };
  return { niveau: "nouveau", score: meilleurScore, contenuSimilaire: meilleurContenu };
}

// ── File d'attente "à vérifier" (zone grise) — visible dans le panel modérateur ──
// Stockée dans localStorage pour persister entre sessions ; chaque entrée
// contient les 2 titres à comparer côte à côte + les données nécessaires pour
// publier ou rejeter après décision du modérateur.
// (CLE_FILE_VERIF_DOUBLONS déclarée tout en haut du script)

function _ajouterAFileVerificationDoublons(entree) {
  const file = JSON.parse(localStorage.getItem(CLE_FILE_VERIF_DOUBLONS) || "[]");
  file.push({ id: Date.now() + Math.random(), date: Date.now(), ...entree });
  localStorage.setItem(CLE_FILE_VERIF_DOUBLONS, JSON.stringify(file));
}

function getFileVerificationDoublons() {
  try { return JSON.parse(localStorage.getItem(CLE_FILE_VERIF_DOUBLONS) || "[]"); }
  catch(e) { return []; }
}

function _retirerDeFileVerificationDoublons(id) {
  const file = getFileVerificationDoublons().filter(e => String(e.id) !== String(id));
  localStorage.setItem(CLE_FILE_VERIF_DOUBLONS, JSON.stringify(file));
}

// Construit un prompt minimal pour que Gemini (clé "doublon") confirme/génère
// un titre propre à partir du nom de fichier et/ou du titre saisi — utilisé
// juste avant la comparaison de similarité, pour normaliser la formulation
// même quand l'élève a saisi un titre informel (ex: "exo 3 maths tle c").
async function _genererTitrePourComparaisonDoublon(titreBrut, mat, classe) {
  const apiKey = getGeminiKey("doublon");
  if (!apiKey) return titreBrut; // pas de clé configurée → on compare le titre brut tel quel
  try {
    const matiereNom = (NOMS_MATIERES && NOMS_MATIERES[mat]) ? NOMS_MATIERES[mat] : mat;
    const prompt = `Voici un titre de document scolaire camerounais (matière : ${matiereNom||"?"}, classe : ${(classe||"?").replace(/_/g," ")}) : "${titreBrut}". Reformule-le en un titre court, clair et standardisé (max 80 caractères), sans changer son sens. Réponds UNIQUEMENT avec le titre reformulé, sans guillemets, sans markdown, sans aucun texte autour.`;
    const texte = await _appelGeminiBrut(apiKey, [{ text: prompt }], { maxOutputTokens: 60 });
    const titrePropre = (texte || "").trim().replace(/^["']|["']$/g, "").slice(0, 80);
    return titrePropre || titreBrut;
  } catch(e) {
    console.warn("Gemini titre doublon:", e.message);
    return titreBrut; // en cas d'échec, on retombe sur le titre brut (jamais bloquant)
  }
}

// ── Vérification RAPIDE (sans effet de bord) — utilisée avant l'upload pour
// décider d'un rejet automatique. Ne touche jamais la file d'attente "à
// vérifier" : ça se fait après upload, une fois le contenu réellement
// disponible (voir signalerSiZoneGriseDoublon ci-dessous), pour que la fiche
// de vérification pointe vers un fichier qui existe vraiment.
async function verifierDoublonAvantPublicationRapide(titreBrut, mat, classe) {
  const titre = await _genererTitrePourComparaisonDoublon(titreBrut, mat, classe);
  const { niveau, score, contenuSimilaire } = _chercherDoublonParSimilarite(titre, mat, classe);
  return { niveau, score, contenuSimilaire, titre };
}


// ── Signalement post-upload (contributions élèves) — appelée APRÈS que le
// fichier a été réellement uploadé, donc avec une URL/contenu valide à
// montrer au modérateur dans la file d'attente "à vérifier". Ne bloque
// jamais la soumission elle-même : la contribution suit son flux normal
// (en_attente / publication directe si modérateur), seule une entrée
// supplémentaire est ajoutée à la file de vérification pour signalement.
function signalerSiZoneGriseDoublon(verifRapide, contexte) {
  if (!verifRapide || verifRapide.niveau !== "zone_grise") return;
  _ajouterAFileVerificationDoublons({
    titreCandidat: verifRapide.titre, score: verifRapide.score,
    titreSimilaire: verifRapide.contenuSimilaire?.titre || "",
    idContenuSimilaire: verifRapide.contenuSimilaire?.id || null,
    mat: contexte?.mat || "", classe: contexte?.classe || "",
    contexte: contexte || {},
  });
}

// ========== ONGLET MODÉRATEUR "🔍 DOUBLONS" — FILE D'ATTENTE ZONE GRISE ==========
// Affiche côte à côte le titre candidat et le titre existant similaire, pour
// que le modérateur tranche manuellement (décision Jean, 2026). Comportement
// selon l'origine du signalement :
//   • contribution_eleve : la contribution existe déjà dans la file "Valider"
//     (statut en_attente, avec un badge ⚠️) — "Approuver"/"Rejeter" agissent
//     directement sur cette contribution.
//   • publication_modo / publication_zip : le fichier n'a PAS encore été
//     uploadé à ce stade (décision Jean) — un seul bouton "Marquer comme vu"
//     qui retire juste l'entrée ; le modérateur republie manuellement depuis
//     l'écran d'origine (Ajouter / ZIP) s'il juge que ce n'est pas un doublon.
function chargerDoublonsAVerifier() {
  const el = document.getElementById("modoDoublonsList");
  if (!el) return;
  const file = getFileVerificationDoublons();
  _majBadgeDoublonsTab(file.length);

  if (!file.length) { el.innerHTML = `<div class="empty-state">✅ Aucun doublon à vérifier</div>`; return; }

  el.innerHTML = file.slice().sort((a,b)=>b.date-a.date).map(entree => {
    const pct = Math.round((entree.score||0) * 100);
    const estContribEleve = entree.contexte?.type === "contribution_eleve";
    const boutons = estContribEleve
      ? `<button onclick="_doublonApprouverContribEleve('${entree.id}', ${entree.contexte?.contribId})" style="flex:1;background:var(--p);color:white;border:none;border-radius:10px;padding:10px;font-weight:700;font-size:12px;cursor:pointer">✅ Approuver quand même</button>
         <button onclick="_doublonRejeterContribEleve('${entree.id}', ${entree.contexte?.contribId})" style="background:var(--red);color:white;border:none;border-radius:10px;padding:10px;font-weight:700;font-size:12px;cursor:pointer">❌ Rejeter</button>`
      : `<button onclick="_retirerDeFileVerificationDoublons('${entree.id}');chargerDoublonsAVerifier();showToast('👁️ Marqué comme vu — republie manuellement si besoin','info')" style="flex:1;background:var(--bg);border:1.5px solid var(--border);color:var(--t2);border-radius:10px;padding:10px;font-weight:700;font-size:12px;cursor:pointer">👁️ Marquer comme vu</button>`;

    return `
    <div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:10px;border:1.5px solid #f59e0b">
      <div style="background:#FEF3C7;color:#92400E;font-size:10px;font-weight:800;padding:5px 8px;border-radius:8px;margin-bottom:10px;display:inline-block">⚠️ ${pct}% similaire — ${entree.mat||"?"} ${entree.classe ? "· "+entree.classe.replace(/_/g," ") : ""}</div>
      <div style="display:flex;gap:8px;margin-bottom:10px">
        <div style="flex:1;background:var(--bg);border-radius:10px;padding:10px">
          <div style="font-size:9px;color:var(--t3);font-weight:800;margin-bottom:4px">🆕 NOUVEAU (candidat)</div>
          <div style="font-size:12px;font-weight:700;color:var(--text)">${entree.titreCandidat || "—"}</div>
        </div>
        <div style="flex:1;background:var(--bg);border-radius:10px;padding:10px">
          <div style="font-size:9px;color:var(--t3);font-weight:800;margin-bottom:4px">📚 DÉJÀ PUBLIÉ</div>
          <div style="font-size:12px;font-weight:700;color:var(--text)">${entree.titreSimilaire || "—"}</div>
        </div>
      </div>
      <div style="font-size:10px;color:var(--t3);margin-bottom:10px">${entree.date ? new Date(entree.date).toLocaleString("fr-FR") : ""}</div>
      <div style="display:flex;gap:8px">${boutons}</div>
    </div>`;
  }).join("");
}

// Met à jour le badge numérique sur le bouton d'onglet "🔍 Doublons"
function _majBadgeDoublonsTab(nb) {
  const btn = document.getElementById("modoTabDoublonsBtn");
  if (!btn) return;
  btn.innerHTML = nb > 0 ? `🔍 Doublons <span style="background:#DC2626;color:white;border-radius:10px;padding:1px 6px;font-size:10px;margin-left:3px">${nb}</span>` : "🔍 Doublons";
}

async function _doublonApprouverContribEleve(idFile, contribId) {
  if (contribId) await validerContribModo(contribId);
  _retirerDeFileVerificationDoublons(idFile);
  chargerDoublonsAVerifier();
}

async function _doublonRejeterContribEleve(idFile, contribId) {
  if (contribId) await rejeterContribModo(contribId);
  _retirerDeFileVerificationDoublons(idFile);
  chargerDoublonsAVerifier();
}

// ========== ONGLET MODÉRATEUR "💰 PAIEMENTS" — PREUVES DE PAIEMENT PREMIUM ==========
// Liste les captures d'écran envoyées via le bouton flottant "📸 Envoyer ma
// preuve de paiement" (upload direct, voir envoyerPreuvePaiementUpload) —
// les preuves envoyées par WhatsApp n'apparaissent PAS ici puisqu'elles
// partent directement dans une conversation WhatsApp, hors de l'app.
function getPreuvesPaiement() {
  try { return JSON.parse(localStorage.getItem("preuves_paiement") || "[]"); }
  catch(e) { return []; }
}

function _majBadgePaiementsTab(nb) {
  const btn = document.getElementById("modoTabPaiementsBtn");
  if (!btn) return;
  btn.innerHTML = nb > 0 ? `💰 Paiements <span style="background:#DC2626;color:white;border-radius:10px;padding:1px 6px;font-size:10px;margin-left:3px">${nb}</span>` : "💰 Paiements";
}

async function chargerPreuvesPaiement() {
  const el = document.getElementById("modoPaiementsList");
  if (!el) return;
  el.innerHTML = `<div class="empty-state" style="opacity:0.6">⏳ Chargement…</div>`;

  // Charger depuis Turso en priorité (toutes les preuves de tous les appareils)
  if (typeof turso !== "undefined" && turso) {
    try {
      await turso.execute({ sql: "CREATE TABLE IF NOT EXISTS preuves_paiement (id INTEGER PRIMARY KEY, pseudo TEXT, telephone TEXT, classe TEXT, image_url TEXT, statut TEXT, date INTEGER)", args: [] });
      const res = await turso.execute({ sql: "SELECT * FROM preuves_paiement ORDER BY date DESC", args: [] });
      if (res.rows && res.rows.length > 0) {
        const listeTurso = res.rows.map(r => ({
          id: r.id, pseudo: r.pseudo, telephone: r.telephone,
          classe: r.classe, imageUrl: r.image_url, statut: r.statut, date: r.date
        }));
        localStorage.setItem("preuves_paiement", JSON.stringify(listeTurso));
        _afficherListePreuves(el, listeTurso);
        return;
      }
    } catch(e) { console.warn("[chargerPreuvesPaiement] Turso:", e.message); }
  }

  // Fallback : localStorage local
  const liste = getPreuvesPaiement();
  _afficherListePreuves(el, liste);
}

function _afficherListePreuves(el, liste) {
  const enAttente = liste.filter(p => p.statut === "en_attente");
  _majBadgePaiementsTab(enAttente.length);

  if (!liste.length) { el.innerHTML = `<div class="empty-state">💰 Aucune preuve de paiement reçue</div>`; return; }

  // En attente d'abord (plus récentes en haut), puis déjà traitées en dessous
  const tries = [...liste].sort((a,b) => {
    if (a.statut === "en_attente" && b.statut !== "en_attente") return -1;
    if (a.statut !== "en_attente" && b.statut === "en_attente") return 1;
    return b.date - a.date;
  });

  el.innerHTML = tries.map(p => {
    const enAttenteCe = p.statut === "en_attente";
    const badgeStatut = enAttenteCe
      ? `<span style="background:#FEF3C7;color:#92400E;font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px">⏳ En attente</span>`
      : p.statut === "validee"
        ? `<span style="background:#D1FAE5;color:#065F46;font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px">✅ Validée</span>`
        : `<span style="background:#FEE2E2;color:#991B1B;font-size:10px;font-weight:800;padding:3px 8px;border-radius:8px">❌ Rejetée</span>`;
    return `
    <div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:10px;border:1.5px solid ${enAttenteCe ? '#FF8C00' : 'var(--border)'}">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:10px">
        <div>
          ${p.pseudo ? `<div style="font-weight:800;font-size:13px;color:var(--text)">${esc(p.pseudo)}</div>` : ""}
          <!-- Numéro LearnUpr (userPhone) — toujours affiché en évidence, peu
               importe qu'un pseudo existe, pour que le modérateur sache
               immédiatement à quel compte activer le Premium (demande Jean,
               2026 : retrouver facilement le numéro de la personne). -->
          <div style="font-weight:800;font-size:14px;color:#D2691E">${p.telephone ? "📞 "+esc(p.telephone) : "⚠️ Numéro inconnu"}</div>
          ${p.classe ? `<div style="font-size:10px;color:var(--t3)">🏫 ${esc(p.classe.replace(/_/g," "))}</div>` : ""}
          <div style="font-size:10px;color:var(--t3)">${p.date ? new Date(p.date).toLocaleString("fr-FR") : ""}</div>
        </div>
        ${badgeStatut}
      </div>
      <img src="${p.imageUrl}" loading="lazy" style="width:100%;max-height:280px;object-fit:contain;border-radius:10px;background:var(--bg);margin-bottom:10px;cursor:pointer" onclick="window.open('${p.imageUrl}','_blank')">
      ${enAttenteCe ? `
      <div style="display:flex;gap:8px">
        <button onclick="validerPreuvePaiement(${p.id})" style="flex:1;background:#059669;color:white;border:none;border-radius:10px;padding:10px;font-weight:700;font-size:12px;cursor:pointer">✅ Valider Premium</button>
        <button onclick="rejeterPreuvePaiement(${p.id})" style="background:var(--red);color:white;border:none;border-radius:10px;padding:10px;font-weight:700;font-size:12px;cursor:pointer">❌ Rejeter</button>
      </div>` : ''}
    </div>`;
  }).join("");
}

// Valide une preuve de paiement : accorde le Premium (30 jours, durée
// standard de l'abonnement affiché aux élèves) au numéro de téléphone
// associé, puis marque l'entrée comme "validee". Si le téléphone n'est pas
// connu (élève qui a envoyé sans être connecté, cas limite), prévient le
// modérateur plutôt que d'échouer silencieusement.
async function validerPreuvePaiement(id) {
  const liste = getPreuvesPaiement();
  const entree = liste.find(p => p.id === id);
  if (!entree) return;

  if (!entree.telephone) {
    showToast("⚠️ Aucun numéro associé à cette preuve — active le Premium manuellement pour cet élève", "info");
  } else {
    const resultat = await _accorderPremiumParTelephone(entree.telephone, 30);
    if (!resultat.ok) {
      showToast("❌ " + resultat.message, "error");
      return;
    }
  }

  entree.statut = "validee";
  const _urlValider = entree.imageUrl || "";
  localStorage.setItem("preuves_paiement", JSON.stringify(liste));
  if (typeof turso !== "undefined" && turso) {
    try { await turso.execute({ sql: "UPDATE preuves_paiement SET statut='validee' WHERE id=?", args: [id] }); } catch(e) {}
  }
  // Supprimer l'image de Cloudinary immédiatement (elle n'a plus d'utilité)
  if (_urlValider) supprimerFichierCloudinary(_urlValider).catch(() => {});
  showToast("✅ Premium activé et preuve validée", "success");
  chargerPreuvesPaiement();
}

async function rejeterPreuvePaiement(id) {
  const liste = getPreuvesPaiement();
  const entree = liste.find(p => p.id === id);
  if (!entree) return;
  const _urlRejeter = entree.imageUrl || "";
  entree.statut = "rejetee";
  localStorage.setItem("preuves_paiement", JSON.stringify(liste));
  if (typeof turso !== "undefined" && turso) {
    try { await turso.execute({ sql: "UPDATE preuves_paiement SET statut='rejetee' WHERE id=?", args: [id] }); } catch(e) {}
  }
  // Supprimer l'image de Cloudinary immédiatement
  if (_urlRejeter) supprimerFichierCloudinary(_urlRejeter).catch(() => {});
  showToast("❌ Preuve rejetée et image supprimée", "info");
  chargerPreuvesPaiement();
}

// ========== VIDÉO — FONCTIONS ==========
// ========== IMPORT CSV VIDÉOS (MODO/ADMIN) ==========

function ouvrirImportCSVVideo() {
  const role = localStorage.getItem("userRole") || "";
  if (role !== "admin" && role !== "moderator") {
    showToast("❌ Réservé aux modérateurs", "error"); return;
  }

  const classesOptions = CLASSES.map(c =>
    `<option value="${c}">${c.replace(/_/g," ")}</option>`).join("");
  const matOptions = MATIERES.map(m =>
    `<option value="${m}">${NOMS_MATIERES[m]||m}</option>`).join("");

  // Supprimer modal existant
  const old = document.getElementById("csvVideoModal");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "csvVideoModal";
  overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9999;display:flex;align-items:flex-end;justify-content:center";
  overlay.innerHTML = `
    <div style="background:var(--card);border-radius:20px 20px 0 0;width:100%;max-width:600px;max-height:92vh;display:flex;flex-direction:column;overflow:hidden">

      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0891b2,#0e7490);padding:14px 16px;flex-shrink:0">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="font-weight:900;font-size:14px;color:white">📋 Import CSV — Vidéos en masse</div>
          <button onclick="document.getElementById('csvVideoModal').remove()" style="background:rgba(255,255,255,0.2);border:none;border-radius:8px;padding:5px 10px;color:white;font-weight:700;font-size:12px;cursor:pointer">✕</button>
        </div>
      </div>

      <div style="overflow-y:auto;flex:1;padding:14px;-webkit-overflow-scrolling:touch">

        <!-- Format du CSV -->
        <div style="background:rgba(8,145,178,0.08);border:1px solid rgba(8,145,178,0.25);border-radius:12px;padding:12px;margin-bottom:14px">
          <div style="font-size:10px;font-weight:800;color:#0891b2;margin-bottom:6px">📄 FORMAT DU FICHIER CSV</div>
          <div style="font-size:10px;color:var(--t2);line-height:1.8;font-family:monospace">
            titre,url,classe,matiere,premium<br>
            <span style="color:var(--t3)">Cours de dérivation,https://youtu.be/abc123,Tle_C,math,non</span><br>
            <span style="color:var(--t3)">SVT Génétique,https://youtu.be/xyz789,1ère_D,svt,oui</span><br>
            <span style="color:var(--t3)">Physique Ondes,https://youtube.com/watch?v=def456,Tle_D,physique,non</span>
          </div>
          <div style="font-size:9px;color:var(--t3);margin-top:6px">
            ℹ️ Séparateur : virgule ou point-virgule · Première ligne = en-têtes (ignorée) · premium : oui/non ou 1/0
          </div>
        </div>

        <!-- Valeurs par défaut -->
        <div style="background:var(--bg);border-radius:12px;padding:12px;border:1px solid var(--border);margin-bottom:14px">
          <div style="font-size:10px;font-weight:800;color:var(--t3);margin-bottom:8px">⚙️ VALEURS PAR DÉFAUT (si colonne absente du CSV)</div>
          <div style="display:flex;gap:6px;margin-bottom:8px;flex-wrap:wrap">
            <select id="csv-default-classe" style="flex:1;min-width:100px;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--card);font-size:14px;color:var(--text)">
              <option value="">— Classe par défaut —</option>
              ${classesOptions}
            </select>
            <select id="csv-default-mat" style="flex:1;min-width:100px;padding:8px;border-radius:8px;border:1px solid var(--border);background:var(--card);font-size:14px;color:var(--text)">
              <option value="">— Matière par défaut —</option>
              ${matOptions}
            </select>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <input type="checkbox" id="csv-default-premium" style="width:18px;height:18px;accent-color:var(--p);cursor:pointer">
            <label for="csv-default-premium" style="font-size:11px;font-weight:700;color:var(--text);cursor:pointer">Premium par défaut</label>
          </div>
        </div>

        <!-- Zone de collage ou upload -->
        <div style="margin-bottom:12px">
          <div style="font-size:10px;font-weight:800;color:var(--t3);margin-bottom:6px">📁 FICHIER CSV ou COLLER LE CONTENU</div>
          <input type="file" id="csv-file-input" accept=".csv,.txt" onchange="csvVideoLireFichier(this)" style="display:none">
          <button onclick="document.getElementById('csv-file-input').click()" style="width:100%;background:var(--bg);border:2px dashed var(--border);border-radius:12px;padding:14px;font-weight:700;font-size:12px;cursor:pointer;color:var(--p);margin-bottom:8px">
            📂 Choisir un fichier CSV
          </button>
          <div style="font-size:10px;color:var(--t3);text-align:center;margin-bottom:6px">— ou coller directement —</div>
          <textarea id="csv-video-texte" rows="6" placeholder="titre,url,classe,matiere,premium&#10;Mon cours de maths,https://youtu.be/abc,Tle_C,math,non&#10;..." style="width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:12px;padding:10px;font-size:12px;font-family:monospace;color:var(--text);box-sizing:border-box;resize:vertical" oninput="csvVideoApercu()"></textarea>
        </div>

        <!-- Aperçu des lignes détectées -->
        <div id="csv-video-apercu" style="display:none;margin-bottom:12px">
          <div style="font-size:10px;font-weight:800;color:var(--t3);margin-bottom:6px">👁️ APERÇU (<span id="csv-count">0</span> vidéos détectées)</div>
          <button onclick="csvVideoTogglePremiumTous()" id="csvVideoTogglePremiumBtn" style="display:none;width:100%;margin-bottom:8px;background:var(--bg);border:1.5px solid var(--border);color:var(--text);border-radius:10px;padding:10px;font-weight:800;font-size:12px;cursor:pointer">🔒 Tout en Premium</button>
          <div id="csv-apercu-liste" style="max-height:200px;overflow-y:auto;background:var(--bg);border-radius:10px;border:1px solid var(--border);padding:8px"></div>
        </div>

        <!-- Bouton publier -->
        <button onclick="csvVideoPublierTous()" id="csv-publier-btn" style="display:none;width:100%;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:14px;padding:14px;font-weight:900;font-size:14px;cursor:pointer;min-height:52px">
          🚀 Publier toutes les vidéos
        </button>

        <!-- Résultat -->
        <div id="csv-video-result" style="display:none;margin-top:10px;background:var(--bg);border-radius:12px;padding:12px;border:1px solid var(--border);font-size:11px;line-height:1.8;color:var(--t2)"></div>

      </div>
    </div>`;

  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

// Lire le fichier CSV uploadé
function csvVideoLireFichier(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById("csv-video-texte").value = e.target.result;
    csvVideoApercu();
  };
  reader.readAsText(file, "UTF-8");
}

// Parser une ligne CSV (gère virgule et point-virgule, et les guillemets)
function _csvParseLigne(ligne, sep) {
  const result = [];
  let current = "";
  let inQuote = false;
  for (let i = 0; i < ligne.length; i++) {
    const c = ligne[i];
    if (c === '"') { inQuote = !inQuote; continue; }
    if (c === sep && !inQuote) { result.push(current.trim()); current = ""; continue; }
    current += c;
  }
  result.push(current.trim());
  return result;
}

// Parser tout le CSV et retourner un tableau d'objets vidéo
function _csvVideoParseTout(texte) {
  const defClasse = document.getElementById("csv-default-classe")?.value || "";
  const defMat = document.getElementById("csv-default-mat")?.value || "";
  const defPremium = document.getElementById("csv-default-premium")?.checked || false;

  const lignes = texte.split(/\r?\n/).map(l => l.trim()).filter(l => l);
  if (lignes.length < 2) return [];

  // Détecter le séparateur (virgule ou point-virgule)
  const firstLine = lignes[0];
  const sep = (firstLine.split(";").length > firstLine.split(",").length) ? ";" : ",";

  // Lire les en-têtes
  const headers = _csvParseLigne(lignes[0].toLowerCase(), sep);
  const idxTitre = headers.findIndex(h => h.includes("titre") || h.includes("title") || h.includes("nom"));
  const idxUrl = headers.findIndex(h => h.includes("url") || h.includes("lien") || h.includes("link") || h.includes("video"));
  const idxClasse = headers.findIndex(h => h.includes("classe") || h.includes("class"));
  const idxMat = headers.findIndex(h => h.includes("mat") || h.includes("mati") || h.includes("subject"));
  const idxPremium = headers.findIndex(h => h.includes("premium") || h.includes("prem") || h.includes("payant"));

  if (idxUrl < 0) return []; // URL obligatoire

  const videos = [];
  for (let i = 1; i < lignes.length; i++) {
    const cols = _csvParseLigne(lignes[i], sep);
    if (!cols.length || !cols[idxUrl]) continue;

    const url = cols[idxUrl] || "";
    if (!url.startsWith("http")) continue; // ignorer lignes sans URL valide

    const titre = (idxTitre >= 0 ? cols[idxTitre] : "") || "Vidéo " + i;
    const classeRaw = (idxClasse >= 0 ? cols[idxClasse] : "") || defClasse;
    const matRaw = (idxMat >= 0 ? cols[idxMat] : "") || defMat;
    const premiumRaw = (idxPremium >= 0 ? cols[idxPremium] : "");
    const premium = premiumRaw ? ["oui","1","true","yes","premium"].includes(premiumRaw.toLowerCase()) : defPremium;

    // Normaliser classe — supporte plusieurs classes séparées par | ou + ou /
    // ex: "1ère_C|1ère_D" → stocké comme "1ère_C,1ère_D" (format interne de l'app)
    const classesMultiples = classeRaw.split(/[|+\/]/).map(c => c.trim()).filter(Boolean);
    const classeNorm = classesMultiples.map(c =>
      (typeof normaliserClasseCSV === "function" ? normaliserClasseCSV(c) : c) || c
    ).join(",");
    const classe = classeNorm || classeRaw;
    const mat = (typeof normaliserMatiereCSV === "function" ? normaliserMatiereCSV(matRaw) : matRaw) || matRaw;

    // Convertir l'URL en embed
    const embedUrl = typeof convertirLienVideo === "function" ? convertirLienVideo(url) : url;

    if (!embedUrl) continue; // URL non reconnue

    // Anti-doublon
    const dejaPublie = typeof _estDejaPublie === "function"
      ? _estDejaPublie({ titre, classe, mat })
      : false;

    videos.push({ titre, url, embedUrl, classe, mat, premium, doublon: dejaPublie, ligne: i + 1 });
  }
  return videos;
}

// Afficher l'aperçu des vidéos détectées
function csvVideoApercu() {
  const texte = document.getElementById("csv-video-texte")?.value || "";
  const videos = _csvVideoParseTout(texte);
  csvVideoData = videos; // mémorisé pour que csvVideoPublierTous() lise l'état réel des checkboxes

  const apercuDiv = document.getElementById("csv-video-apercu");
  const liste = document.getElementById("csv-apercu-liste");
  const countEl = document.getElementById("csv-count");
  const publierBtn = document.getElementById("csv-publier-btn");
  const toggleBtn = document.getElementById("csvVideoTogglePremiumBtn");

  if (!apercuDiv || !liste) return;

  if (!videos.length) {
    apercuDiv.style.display = "none";
    if (publierBtn) publierBtn.style.display = "none";
    if (toggleBtn) toggleBtn.style.display = "none";
    return;
  }

  apercuDiv.style.display = "block";
  if (countEl) countEl.textContent = videos.filter(v => !v.doublon).length + "/" + videos.length;
  if (toggleBtn) toggleBtn.style.display = videos.some(v => !v.doublon) ? "block" : "none";

  liste.innerHTML = videos.map((v, i) => `
    <div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:16px;flex-shrink:0">${v.doublon ? "⚠️" : "🎬"}</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:11px;color:${v.doublon ? "var(--t3)" : "var(--text)"};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${v.titre}${v.doublon ? " <span style='color:var(--red);font-size:9px'>(doublon ignoré)</span>" : ""}
        </div>
        <div style="font-size:9px;color:var(--t3);margin-top:2px">
          ${(v.classe||"?").replace(/_/g," ")} · ${NOMS_MATIERES[v.mat]||v.mat||"?"}
        </div>
        <div style="font-size:9px;color:#0891b2;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.url}</div>
        ${!v.doublon ? `
        <label style="display:flex;align-items:center;gap:5px;margin-top:5px;cursor:pointer;font-size:10px;font-weight:700;color:var(--t2)">
          <input type="checkbox" id="csv-video-premium-${i}" ${v.premium ? "checked" : ""} onchange="csvVideoData[${i}].premium=this.checked" style="width:14px;height:14px;margin:0;accent-color:var(--p)">
          🔒 Premium (sinon gratuit)
        </label>` : ""}
      </div>
    </div>`).join("");

  const nouveaux = videos.filter(v => !v.doublon).length;
  if (publierBtn) {
    publierBtn.style.display = nouveaux > 0 ? "block" : "none";
    publierBtn.textContent = `🚀 Publier ${nouveaux} vidéo(s)`;
  }
}

// Bascule en un clic le statut Premium de TOUTES les vidéos détectées dans l'aperçu CSV,
// même logique que toggleTousPremiumZip() pour l'import ZIP : si moins de la moitié
// des vidéos (hors doublons) sont déjà en Premium, on coche tout ; sinon on décoche tout.
function csvVideoTogglePremiumTous() {
  if (!csvVideoData || !csvVideoData.length) return;
  const indices = csvVideoData.map((v, i) => v.doublon ? null : i).filter(i => i !== null);
  if (!indices.length) return;
  const nbPremium = indices.filter(i => csvVideoData[i].premium).length;
  const toutCocher = nbPremium < indices.length / 2;
  indices.forEach(i => {
    csvVideoData[i].premium = toutCocher;
    const cb = document.getElementById(`csv-video-premium-${i}`);
    if (cb) cb.checked = toutCocher;
  });
  const btn = document.getElementById("csvVideoTogglePremiumBtn");
  if (btn) btn.textContent = toutCocher ? "🆓 Tout en Gratuit" : "🔒 Tout en Premium";
  showToast(toutCocher ? `🔒 ${indices.length} vidéo(s) passée(s) en Premium` : `🆓 ${indices.length} vidéo(s) passée(s) en Gratuit`, "success");
}

// Publier toutes les vidéos du CSV
async function csvVideoPublierTous() {
  // On utilise csvVideoData (rempli par csvVideoApercu) et non un re-parsing du texte,
  // car csvVideoData reflète les éventuelles cases "Premium" cochées/décochées à la main
  // ou via le bouton "Tout en Premium" — un re-parsing perdrait ces changements.
  const videos = (csvVideoData && csvVideoData.length
    ? csvVideoData
    : _csvVideoParseTout(document.getElementById("csv-video-texte")?.value || "")
  ).filter(v => !v.doublon);

  if (!videos.length) { showToast("❌ Aucune vidéo à publier", "error"); return; }

  const btn = document.getElementById("csv-publier-btn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Publication en cours..."; }

  const resultDiv = document.getElementById("csv-video-result");
  let publiees = 0;
  let erreurs = 0;
  const log = [];

  const publies = getContenuPublie();
  let _idCounter = 0; // garantit des id uniques même si Date.now() se répète entre deux itérations rapprochées

  for (const v of videos) {
    try {
      const _nowId = Date.now() + (_idCounter++);

      // ── Numéro unique : on évite de redémarrer à 1 à chaque import, ce qui provoquait
      // des collisions avec du contenu vidéo déjà publié (même mat/numero/type/titre). ──
      const numerosExistants = publies
        .filter(p => p.mat === v.mat && p.type === "video")
        .map(p => p.numero || 0);
      const numero = (numerosExistants.length ? Math.max(...numerosExistants) : 0) + 1;

      // ── Mêmes champs que l'ajout manuel (publierContenu) : c'est le préfixe "[VIDEO:"
      // dans `contenu` (et/ou le champ videoUrl) que _buildContenuHtml utilise pour
      // reconnaître et afficher une vidéo. Sans ça, l'entrée est bien enregistrée
      // mais n'apparaît jamais dans l'onglet vidéo. ──
      const contenuVideo = `[VIDEO:${v.embedUrl}]`;

      const newEntry = {
        id: _nowId,
        type: "video",
        typeFichier: "video",
        mat: v.mat,
        classe: v.classe,
        titre: v.titre,
        numero: numero,
        contenu: contenuVideo,
        fichierData: null,
        fichierUrl: null,
        fichierType: "video",
        fichierNom: null,
        videoUrl: v.embedUrl,
        premium: v.premium,
        description: "",
        lycee: (typeof modoLyceeActuel !== "undefined" ? modoLyceeActuel : "principal"),
        auteur: localStorage.getItem("userPhone") || "modo",
        date: _nowId
      };

      publies.push(newEntry);

      // Sync Turso si dispo
      let tursoOk = true;
      let tursoErr = "";
      if (typeof turso !== "undefined" && turso) {
        try {
          await turso.execute({
            sql: "INSERT INTO contenu (id,type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,fichier_type,fichier_nom,lycee,premium,description,auteur,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            args: [newEntry.id, "video","video", v.mat, v.classe, v.titre, numero, contenuVideo, v.embedUrl, "video", "", newEntry.lycee, v.premium?1:0, "", newEntry.auteur, newEntry.date]
          });
        } catch(e) {
          // Si l'insert avec id échoue (ex: conflit ou colonne manquante), on retente sans id
          try {
            const r2 = await turso.execute({
              sql: "INSERT INTO contenu (type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,fichier_type,fichier_nom,lycee,premium,description,auteur,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              args: ["video","video", v.mat, v.classe, v.titre, numero, contenuVideo, v.embedUrl, "video", "", newEntry.lycee, v.premium?1:0, "", newEntry.auteur, newEntry.date]
            });
            const tursoId = r2?.lastInsertRowid ?? r2?.last_insert_rowid ?? null;
            if (tursoId && String(tursoId) !== String(newEntry.id)) {
              newEntry.id = tursoId;
              publies[publies.length - 1].id = tursoId;
            }
          } catch(e2) {
            tursoOk = false;
            tursoErr = e2.message || e.message || "erreur inconnue";
            console.warn("CSV vidéo Turso:", tursoErr);
          }
        }
      }

      log.push(tursoOk ? `✅ ${v.titre}` : `⚠️ ${v.titre} — sauvegardé en local seulement (Turso: ${tursoErr})`);
      publiees++;
      await new Promise(r => setTimeout(r, 100)); // petit délai
    } catch(e) {
      log.push(`❌ ${v.titre} — ${e.message}`);
      erreurs++;
    }
  }

  localStorage.setItem("contenu_publie", JSON.stringify(publies));

  if (resultDiv) {
    resultDiv.style.display = "block";
    resultDiv.innerHTML = `<b style="color:${erreurs?'var(--red)':'#059669'}">${publiees} vidéo(s) publiée(s)${erreurs ? `, ${erreurs} erreur(s)` : " avec succès !"}</b><br><br>` +
      log.map(l => `${l}`).join("<br>");
  }

  if (btn) { btn.disabled = false; btn.textContent = `✅ ${publiees} vidéo(s) publiée(s)`; btn.style.background = "#059669"; }

  showToast(`✅ ${publiees} vidéo(s) importée(s) !`, "success");

  // Basculer automatiquement sur l'onglet Vidéos + la classe ciblée par le CSV,
  // sinon renderContent() redessine l'écran précédent (ex: Cours / autre classe)
  // et on a l'impression que rien n'a été publié alors que tout est bien enregistré.
  // IMPORTANT : on met à jour les variables + l'UI des onglets nous-mêmes, puis on
  // appelle renderContent() UNE SEULE fois à la fin — setClasse()/setType() appellent
  // chacun leur propre renderContent() async, et les lancer l'un après l'autre crée
  // deux rendus concurrents qui peuvent se chevaucher et laisser l'écran sur le mauvais onglet.
  const premiereClasse = (videos[0]?.classe || "").split(",")[0]?.trim();
  if (premiereClasse && typeof CLASSES !== "undefined" && CLASSES.includes(premiereClasse)) {
    activeClasse = premiereClasse;
    if (typeof renderClasses === "function") renderClasses();
  }
  activeType = "video";
  document.querySelectorAll(".ttab").forEach(b => b.className = "ttab");
  const videoTabBtn = Array.from(document.querySelectorAll(".ttab")).find(b => b.getAttribute("onclick")?.includes("setType('video'"));
  if (videoTabBtn) videoTabBtn.className = "ttab on";
  const icons = {cours:"📚",sequencielle:"📋",examen:"🏆",autres_lycees:"🏫",la_zone:"🔥",competences:"🎯",video:"🎬"};
  const helpIcon = document.getElementById("typeHelpIcon");
  const helpText = document.getElementById("typeHelpText");
  if (helpIcon) helpIcon.textContent = icons.video;
  if (helpText && typeof DESC_TYPES !== "undefined") helpText.textContent = DESC_TYPES.video || "";

  if (typeof renderContent === "function") await renderContent();

  // Fermer automatiquement le modal après un court délai : sinon il reste affiché
  // PAR-DESSUS l'écran principal et masque les vidéos qu'on vient pourtant de bien afficher.
  setTimeout(() => {
    const modal = document.getElementById("csvVideoModal");
    if (modal) modal.remove();
  }, 1800);
}

// ========== FIN IMPORT CSV VIDÉOS ==========

function convertirLienVideo(url) {
  if (!url) return null;
  // YouTube standard
  let m = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // YouTube court
  m = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // YouTube embed déjà
  if (url.includes("youtube.com/embed/")) return url;
  // Lien direct (mp4, etc.)
  if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) return url;
  // Google Drive
  m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;
  // Autre lien — tenter quand même
  if (url.startsWith("http")) return url;
  return null;
}

// (ancienne fonction previewVideo() en double supprimée — celle avec la description automatique
//  de la vidéo, définie plus haut dans le fichier, est désormais la seule version active)

function handleModoFileDrop(e) {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) previewModoFichier({ files: [file] });
}

// ========== ANDROID COMPAT — Correctifs mobiles ==========

// ── 1. Remplacement de confirm() par une modale native (compatible WebView Android) ──
function _confirmAndroid(msg, onOk) {
  const d = document.createElement("div");
  d.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:999999;display:flex;align-items:center;justify-content:center;padding:24px";
  d.innerHTML = `
    <div style="background:var(--card,#2E1065);border-radius:20px;padding:24px;max-width:320px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.5)">
      <div style="font-size:32px;text-align:center;margin-bottom:12px">⚠️</div>
      <div style="font-weight:800;font-size:15px;text-align:center;color:var(--text,#fff);margin-bottom:20px;line-height:1.5">${msg}</div>
      <div style="display:flex;gap:10px">
        <button onclick="this.closest('[style*=fixed]').remove()"
          style="flex:1;background:var(--bg,#0d1f0d);color:var(--text,#fff);border:1.5px solid var(--border,rgba(255,255,255,0.12));border-radius:14px;padding:14px;font-weight:800;font-size:14px;cursor:pointer;min-height:48px">
          ✕ Annuler
        </button>
        <button id="_confirm_ok"
          style="flex:1;background:linear-gradient(135deg,#E53935,#B71C1C);color:white;border:none;border-radius:14px;padding:14px;font-weight:800;font-size:14px;cursor:pointer;min-height:48px">
          🗑️ Supprimer
        </button>
      </div>
    </div>`;
  document.body.appendChild(d);
  d.querySelector("#_confirm_ok").onclick = function() { d.remove(); onOk(); };
  d.onclick = function(e) { if (e.target === d) d.remove(); };
}

// ── 2. Passive event listeners pour performance scroll Android ──
(function() {
  try {
    const opts = Object.defineProperty({}, "passive", { get: function() { return true; } });
    window.addEventListener("test", null, opts);
    // Re-bind scroll et touch avec passive
    document.addEventListener("touchstart", function(){}, { passive: true });
    document.addEventListener("touchmove", function(){}, { passive: true });
  } catch(e) {}
})();

// ── 3. Correction hauteur 100vh sur Android (barre d'adresse du navigateur) ──
function _fixVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", vh + "px");
}
_fixVh();
window.addEventListener("resize", _fixVh);

// ── 4. Fix iframe PDF sur Android — fallback lien direct si iframe vide ──
document.addEventListener("DOMContentLoaded", function() {
  // Observer les nouvelles iframes PDF ajoutées dynamiquement
  const obs = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType !== 1) return;
        const iframes = node.tagName === "IFRAME" ? [node] : node.querySelectorAll("iframe");
        iframes.forEach(function(iframe) {
          const src = iframe.src || "";
          if (!src.includes("cloudinary.com") && !src.includes("youtube") && !src.includes("youtu.be") && !src.includes("jit.si")) return;
          // Timeout : si après 8s l'iframe n'a pas chargé → afficher lien de secours
          const timer = setTimeout(function() {
            if (!iframe.contentDocument && !iframe.contentWindow?.document?.body?.childElementCount) {
              const fallback = document.createElement("div");
              fallback.style.cssText = "text-align:center;padding:16px";
              fallback.innerHTML = `<a href="${src}" target="_blank" rel="noopener noreferrer"
                style="background:linear-gradient(135deg,var(--p,#0d9488),var(--p2,#0f766e));color:white;text-decoration:none;border-radius:14px;padding:14px 20px;font-weight:900;font-size:14px;display:inline-block">
                📖 Ouvrir dans le navigateur
              </a>`;
              if (iframe.parentNode) iframe.parentNode.insertBefore(fallback, iframe.nextSibling);
            }
          }, 8000);
          iframe.addEventListener("load", function() { clearTimeout(timer); });
        });
      });
    });
  });
  obs.observe(document.body, { childList: true, subtree: true });
});
initDarkMode();
updateProfilStatus();
updateNotifBadge();
resetSessionTimer(); // Fix 12 : démarrer le timer de session
initConsent(); // Fix 19 : bannière RGPD
openDB()
  .then(() => { updateStorageUI(); renderSavedList(); })
  .catch(() => showToast("⚠️ Stockage hors ligne non disponible"));
renderClasses();
renderContent();

// ── Indicateur hors ligne ────────────────────────────────────────────────
(function() {
  // Créer le bandeau "hors ligne"
  const banner = document.createElement("div");
  banner.id = "offlineBanner";
  banner.style.cssText = [
    "display:none",
    "position:fixed",
    "top:0",
    "left:0",
    "right:0",
    "z-index:99999",
    "background:#1e293b",
    "color:#f8fafc",
    "font-size:12px",
    "font-weight:700",
    "text-align:center",
    "padding:7px 12px",
    "letter-spacing:.3px",
    "box-shadow:0 2px 8px rgba(0,0,0,.35)"
  ].join(";");
  banner.innerHTML = "📵 Mode hors ligne — les cours déjà consultés restent accessibles";
  document.body.appendChild(banner);

  function setOffline() {
    banner.style.display = "block";
    showToast("📵 Connexion perdue — mode hors ligne activé", "info");
  }
  function setOnline() {
    banner.style.display = "none";
    showToast("✅ Connexion rétablie", "success");
    // Demander au SW de rafraîchir le cache shell
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage("CACHE_SHELL");
    }
  }

  window.addEventListener("offline", setOffline);
  window.addEventListener("online",  setOnline);
  if (!navigator.onLine) setOffline();
})();

// Restaurer mode examen si actif
if (localStorage.getItem("modeExamen") === "1") {
  document.body.classList.add("mode-examen");
  document.getElementById("modeExamenOverlay").style.display = "block";
}

// Charger quiz hors ligne au démarrage
chargerQuizInitial().catch(e => console.warn("Quiz offline:", e));

// ========== AUTO-SYNC SESSION AU LANCEMENT ==========
(async () => {
  const phone = localStorage.getItem("userPhone") || "";
  if (!phone) return;
  let tentatives = 0;
  const waitTurso = setInterval(async () => {
    tentatives++;
    if (turso || tentatives > 20) {
      clearInterval(waitTurso);
      if (!turso) {
        const cachedRole = localStorage.getItem("userRole") || "";
        if (cachedRole === "admin") setTimeout(() => verifierAdmin(), 800);
        return;
      }
      try {
        const syncedRole = await syncSessionDepuisTurso(phone);
        if (syncedRole) {
          updateProfilStatus();
          verifierAdmin();
          if (syncedRole !== "user") {
            showToast(`🔄 Session synchronisée — ${syncedRole === "admin" ? "⭐ Admin" : "🛡️ Modérateur"}`, "success");
          }
        }
      } catch(e) {}
    }
  }, 300);
})();

if (!localStorage.getItem("welcomed")) {
  addNotification("🎉 Bienvenue sur LearnUpr !", "Commence par choisir ta classe et tes matières", "success");
  localStorage.setItem("welcomed", "true");
}


// ========== CLASSEMENT PAR CLASSE - INJECTION ==========
// ========== CLASSEMENT PAR CLASSE ==========
var cltMode = "quiz";
var CLT_CLASSES = ["6eme","5eme","4eme","3eme","2nde","1A","1C","1D","TleA","TleC","TleD","TleF"];

function cltInitSel() {
  var sel = document.getElementById("cltSel");
  if (!sel || sel.options.length > 1) return;
  var mc = localStorage.getItem("userClasse") || "";
  var cls = CLT_CLASSES;
  try { if (typeof CLASSES !== "undefined") cls = CLASSES; } catch(e) {}
  sel.innerHTML = "<option value=''>Toutes les classes</option>";
  for (var i = 0; i < cls.length; i++) {
    var o = document.createElement("option");
    o.value = cls[i];
    o.textContent = cls[i];
    if (mc && cls[i] === mc) o.selected = true;
    sel.appendChild(o);
  }
}

function cltSwitch(mode, btn) {
  cltMode = mode;
  var tabs = document.querySelectorAll(".clt-tab");
  for (var i = 0; i < tabs.length; i++) tabs[i].classList.remove("on");
  if (btn) btn.classList.add("on");
  cltLoad();
}

function cltScoreVal(u) {
  if (cltMode === "quiz")     return u.quizPct * 1000 + u.quizN;
  if (cltMode === "activite") return u.activite;
  if (cltMode === "contrib")  return u.contribs;
  return u.quizPct * 5 + u.contribs * 10 + u.activite;
}

function cltMakeItem(u, rank, myPhone) {
  var isMe = (u.phone === myPhone);
  var medals = ["", "\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];
  var medal = (rank <= 3) ? medals[rank] : String(rank);
  var cls = "clt-item";
  if (rank === 1) cls += " r1";
  else if (rank === 2) cls += " r2";
  else if (rank === 3) cls += " r3";
  if (isMe) cls += " me";

  var pseudo = u.pseudo || (isMe ? "Toi" : u.phone.slice(0,3) + "***" + u.phone.slice(-2));

  var mainScore = "";
  var subScore = "";
  if (cltMode === "quiz")     { mainScore = u.quizPct + "%";      subScore = u.quizN + " quiz joues"; }
  if (cltMode === "activite") { mainScore = u.activite + " pts";  subScore = "activite totale"; }
  if (cltMode === "contrib")  { mainScore = u.contribs + "";      subScore = "contributions"; }
  if (cltMode === "global") {
    var g = Math.round(u.quizPct * 0.5 + u.contribs * 10 + u.activite * 0.1);
    mainScore = g + " pts"; subScore = "score global";
  }

  var meBadge = isMe ? " <span style='background:var(--p);color:#fff;font-size:8px;padding:1px 5px;border-radius:6px'>Toi</span>" : "";

  var div = document.createElement("div");
  div.className = cls;
  div.innerHTML =
    "<div class='clt-medal'>" + medal + "</div>" +
    "<div class='clt-info'>" +
      "<div class='clt-name'>" + pseudo + meBadge + "</div>" +
      "<div class='clt-sub'>" + (u.classe || "") + "</div>" +
    "</div>" +
    "<div class='clt-score'>" + mainScore + "<small>" + subScore + "</small></div>";
  return div;
}

function cltRenderGroup(container, label, arr, myPhone, limit) {
  if (!arr.length) return;
  limit = limit || 5;
  var head = document.createElement("div");
  head.className = "clt-grp-head";
  head.innerHTML = "<span>\uD83C\uDFEB " + label + "</span>" +
    "<span style='font-size:10px;opacity:.85'>" + arr.length + (arr.length > 1 ? " eleves" : " eleve") + "</span>";
  container.appendChild(head);

  var myIdx = -1;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].phone === myPhone) { myIdx = i; break; }
  }
  var shown = Math.min(limit, arr.length);
  for (var j = 0; j < shown; j++) {
    container.appendChild(cltMakeItem(arr[j], j + 1, myPhone));
  }
  if (myIdx >= limit) {
    var note = document.createElement("div");
    note.style.cssText = "font-size:10px;color:var(--t3);text-align:center;padding:4px 0 6px";
    note.textContent = "Ta position : " + (myIdx + 1) + "e sur " + arr.length;
    container.appendChild(note);
  }
}

function cltSortArr(arr) {
  return arr.slice().sort(function(a, b) { return cltScoreVal(b) - cltScoreVal(a); });
}

function cltGetOrCreate(users, ph) {
  if (!users[ph]) users[ph] = { phone: ph, pseudo: "", classe: "", quizScore: 0, quizN: 0, quizPct: 0, contribs: 0, activite: 0 };
  return users[ph];
}

async function cltLoad() {
  cltInitSel();
  var container = document.getElementById("cltList");
  if (!container) return;
  container.innerHTML = "<div style='text-align:center;color:var(--t3);font-size:12px;padding:16px'>Chargement...</div>";

  var myPhone  = localStorage.getItem("userPhone") || "";
  var myClasse = localStorage.getItem("userClasse") || "";
  var sel = document.getElementById("cltSel");
  var filtreClasse = sel ? (sel.value || "") : "";
  var users = {};

  // ── Turso ──
  if (typeof turso !== "undefined" && turso) {
    try {
      var r1 = await turso.execute({ sql: "SELECT phone,pseudo,classe FROM users WHERE phone IS NOT NULL AND phone!='' LIMIT 300", args: [] });
      var rows1 = r1.rows || [];
      for (var i = 0; i < rows1.length; i++) {
        var row = rows1[i];
        var ph = row.phone || row[0] || "";
        if (!ph) continue;
        var u = cltGetOrCreate(users, ph);
        u.pseudo = row.pseudo || row[1] || "";
        u.classe = row.classe || row[2] || "";
      }
    } catch(e) {}

    try {
      var r2 = await turso.execute({ sql: "SELECT auteur,COUNT(*) as n FROM contributions WHERE statut='approuve' AND auteur IS NOT NULL GROUP BY auteur", args: [] });
      var rows2 = r2.rows || [];
      for (var j = 0; j < rows2.length; j++) {
        var ph2 = rows2[j].auteur || rows2[j][0] || "";
        var n2 = Number(rows2[j].n || rows2[j][1] || 0);
        if (!ph2) continue;
        var u2 = cltGetOrCreate(users, ph2);
        u2.contribs = n2;
        u2.activite += n2 * 10;
      }
    } catch(e) {}

    try {
      var r3 = await turso.execute({ sql: "SELECT phone,progression FROM users WHERE progression IS NOT NULL AND progression!='' LIMIT 300", args: [] });
      var rows3 = r3.rows || [];
      for (var k = 0; k < rows3.length; k++) {
        var ph3 = rows3[k].phone || rows3[k][0] || "";
        var raw = rows3[k].progression || rows3[k][1] || "{}";
        if (!ph3) continue;
        try {
          var prog = JSON.parse(raw);
          var tQ = 0, tS = 0, tP = 0;
          var pk = Object.keys(prog);
          for (var ki = 0; ki < pk.length; ki++) {
            tQ += prog[pk[ki]].totalQ || 0;
            tS += prog[pk[ki]].totalScore || 0;
            tP += prog[pk[ki]].played || 0;
          }
          var pct = tQ > 0 ? Math.round((tS / tQ) * 100) : 0;
          var u3 = cltGetOrCreate(users, ph3);
          u3.quizScore = tS; u3.quizN = tP; u3.quizPct = pct;
          u3.activite += tP * 2 + Math.floor(tQ / 5);
        } catch(pe) {}
      }
    } catch(e) {}
  }

  // ── Données locales ──
  if (myPhone) {
    var me = cltGetOrCreate(users, myPhone);
    if (!me.pseudo) me.pseudo = localStorage.getItem("userPseudo") || "";
    if (!me.classe) me.classe = myClasse;

    var pd = {};
    try { pd = JSON.parse(localStorage.getItem("progData") || "{}"); } catch(e) {}
    var lQ = 0, lS = 0, lP = 0;
    var pk2 = Object.keys(pd);
    for (var pi = 0; pi < pk2.length; pi++) {
      lQ += pd[pk2[pi]].totalQ || 0;
      lS += pd[pk2[pi]].totalScore || 0;
      lP += pd[pk2[pi]].played || 0;
    }
    var lPct = lQ > 0 ? Math.round((lS / lQ) * 100) : 0;
    if (lP >= me.quizN) { me.quizScore = lS; me.quizN = lP; me.quizPct = lPct; }

    var lc = [];
    try { lc = JSON.parse(localStorage.getItem("contributions_locales") || "[]"); } catch(e) {}
    var lca = 0;
    for (var ci = 0; ci < lc.length; ci++) {
      if (lc[ci].auteur === myPhone && lc[ci].statut === "approuve") lca++;
    }
    if (lca > me.contribs) me.contribs = lca;
    var lAct = me.contribs * 10 + me.quizN * 2 + Math.floor(lQ / 5);
    if (lAct > me.activite) me.activite = lAct;
  }

  var allUsers = Object.values(users).filter(function(u) { return u.phone; });
  var cls2 = CLT_CLASSES;
  try { if (typeof CLASSES !== "undefined") cls2 = CLASSES; } catch(e) {}

  container.innerHTML = "";

  if (filtreClasse) {
    var arr = allUsers.filter(function(u) { return u.classe === filtreClasse || !u.classe; });
    arr = cltSortArr(arr);
    if (!arr.length) {
      container.innerHTML = "<div style='text-align:center;color:var(--t3);font-size:12px;padding:20px'>Aucun eleve dans cette classe.</div>";
      return;
    }
    cltRenderGroup(container, filtreClasse, arr, myPhone, 15);
  } else {
    var grouped = {};
    for (var gi = 0; gi < cls2.length; gi++) grouped[cls2[gi]] = [];
    grouped["Autre"] = [];
    for (var ui = 0; ui < allUsers.length; ui++) {
      var uu = allUsers[ui];
      if (uu.classe && typeof grouped[uu.classe] !== "undefined") grouped[uu.classe].push(uu);
      else grouped["Autre"].push(uu);
    }
    var rendered = 0;
    var gkeys = Object.keys(grouped);
    for (var gki = 0; gki < gkeys.length; gki++) {
      var gk = gkeys[gki];
      if (!grouped[gk].length) continue;
      cltRenderGroup(container, gk, cltSortArr(grouped[gk]), myPhone, 5);
      rendered++;
    }
    if (!rendered) {
      container.innerHTML = "<div style='text-align:center;color:var(--t3);font-size:12px;padding:20px'>Aucune donnee. Les eleves doivent renseigner leur classe dans le profil.</div>";
    }
  }

  var leg = document.createElement("div");
  leg.style.cssText = "font-size:10px;color:var(--t3);text-align:center;padding:8px 0;margin-top:4px;border-top:1px solid var(--border)";
  var legTxt = { quiz:"Classes par taux de reussite quiz", activite:"Classes par activite totale", contrib:"Classes par contributions approuvees", global:"Score global = quiz + contrib + activite" };
  leg.textContent = legTxt[cltMode] || "";
  container.appendChild(leg);
}

async function cltSaveClasse(classe) {
  if (!classe) return;
  localStorage.setItem("userClasse", classe);
  var ph = localStorage.getItem("userPhone") || "";
  if (ph && typeof turso !== "undefined" && turso) {
    try { await turso.execute({ sql: "UPDATE users SET classe=? WHERE phone=?", args: [classe, ph] }); } catch(e) {}
  }
  if (typeof showToast === "function") showToast("Classe enregistree !", "success");
  cltLoad();
}

function cltAddClasseField() {
  if (document.getElementById("cltClasseField")) return;
  var pseudo = document.getElementById("pseudoSection");
  if (!pseudo) return;
  var mc = localStorage.getItem("userClasse") || "";
  var cls3 = CLT_CLASSES;
  try { if (typeof CLASSES !== "undefined") cls3 = CLASSES; } catch(e) {}

  var opts = "<option value=''>Choisir ma classe...</option>";
  for (var i = 0; i < cls3.length; i++) {
    opts += "<option value='" + cls3[i] + "'" + (cls3[i] === mc ? " selected" : "") + ">" + cls3[i] + "</option>";
  }

  var div = document.createElement("div");
  div.id = "cltClasseField";
  div.style.cssText = "background:var(--card);border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid var(--border)";
  div.innerHTML =
    "<div style='font-weight:800;font-size:13px;margin-bottom:6px;color:var(--p)'>\uD83C\uDFEB Ma classe</div>" +
    "<div style='font-size:11px;color:var(--t2);margin-bottom:8px'>Choisis ta classe pour le classement.</div>" +
    "<select id='cltClasseSel' style='width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:10px;font-size:14px;font-weight:700;color:var(--text);margin-bottom:10px'>" + opts + "</select>" +
    "<button id='cltSaveBtn' style='width:100%;background:linear-gradient(135deg,var(--p),#9333ea);color:#fff;border:none;border-radius:12px;padding:11px;font-weight:800;font-size:13px;cursor:pointer'>Enregistrer ma classe</button>";

  pseudo.parentNode.insertBefore(div, pseudo);

  document.getElementById("cltSaveBtn").addEventListener("click", function() {
    var sel = document.getElementById("cltClasseSel");
    if (sel) cltSaveClasse(sel.value);
  });
}

(function() {
  var _orig = typeof showTab !== "undefined" ? showTab : null;
  if (!_orig) return;
  window.showTab = function(tab) {
    _orig.apply(this, arguments);
    if (tab === "profil") {
      setTimeout(function() {
        cltInitSel();
        cltLoad();
        cltAddClasseField();
      }, 400);
    }
  };
})();

// ═══════════════════════════════════════════════════════════════
// OUTIL IA ZIP — Analyse Gemini + génération nom + publication
// ═══════════════════════════════════════════════════════════════
let _iazipData = []; // tableau des fichiers analysés

function iazipToggleKey() {
  const inp = document.getElementById("iazip-apikey");
  if (!inp) return;
  inp.type = inp.type === "password" ? "text" : "password";
}

function iazipToggleLock() {
  const inp   = document.getElementById("iazip-apikey");
  const btn   = document.getElementById("iazip-lock-btn");
  const lbl   = document.getElementById("iazip-lock-status");
  if (!inp) return;
  const estVerrouille = inp.disabled;
  if (estVerrouille) {
    // Déverrouiller — demander mot de passe admin
    const mdp = prompt("🔒 Mot de passe admin pour déverrouiller la clé :");
    if (!mdp) return;
    const hash = btoa(unescape(encodeURIComponent(mdp)));
    const stocke = localStorage.getItem("iazip_lock_hash");
    if (!stocke) {
      // Pas encore de mot de passe défini — on accepte et on enregistre
      localStorage.setItem("iazip_lock_hash", hash);
    } else if (stocke !== hash) {
      showToast("❌ Mot de passe incorrect", "error"); return;
    }
    inp.disabled = false;
    if (btn) { btn.textContent = "🔓"; btn.style.borderColor = "var(--border)"; }
    if (lbl) { lbl.textContent = "🔓 Clé modifiable — appuie sur 🔒 pour verrouiller"; lbl.style.color = "var(--t3)"; }
    localStorage.removeItem("iazip_locked");
    iazipCheckReady();
  } else {
    // Verrouiller — définir mot de passe si pas encore fait
    const stocke = localStorage.getItem("iazip_lock_hash");
    if (!stocke) {
      const mdp = prompt("🔐 Définis un mot de passe admin pour le cadenas :");
      if (!mdp || !mdp.trim()) return;
      const conf = prompt("🔐 Confirme le mot de passe :");
      if (mdp !== conf) { showToast("❌ Les mots de passe ne correspondent pas", "error"); return; }
      localStorage.setItem("iazip_lock_hash", btoa(unescape(encodeURIComponent(mdp))));
    }
    inp.disabled = true;
    if (btn) { btn.textContent = "🔒"; btn.style.borderColor = "#dc2626"; }
    if (lbl) { lbl.textContent = "🔒 Clé verrouillée — seul l'admin peut la modifier"; lbl.style.color = "#f87171"; }
    localStorage.setItem("iazip_locked", "1");
    // Sauvegarder la clé dans Turso pour qu'elle persiste entre sessions/appareils
    // (avant, le verrouillage cachait juste le champ sans jamais conserver la valeur)
    const _cleSaisie = inp.value.trim();
    if (_cleSaisie && typeof turso !== "undefined" && turso) {
      turso.execute({ sql: "CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT DEFAULT '')", args: [] })
        .then(() => turso.execute({ sql: "INSERT OR REPLACE INTO app_settings (key, value) VALUES ('gemini_zip', ?)", args: [_cleSaisie] }))
        .then(() => { GEMINI_KEYS_ZIP = _parseGeminiKeys(_cleSaisie); showToast("✅ Clé ZIP sauvegardée durablement", "success"); })
        .catch(e => console.warn("[iazip] sauvegarde Turso:", e.message));
    }
    iazipCheckReady();
  }
}

function _iazipRestoreLock() {
  // Restaurer l'état du cadenas au chargement de l'onglet
  if (localStorage.getItem("iazip_locked") === "1") {
    const inp = document.getElementById("iazip-apikey");
    const btn = document.getElementById("iazip-lock-btn");
    const lbl = document.getElementById("iazip-lock-status");
    if (inp) inp.disabled = true;
    if (btn) { btn.textContent = "🔒"; btn.style.borderColor = "#dc2626"; }
    if (lbl) { lbl.textContent = "🔒 Clé verrouillée — seul l'admin peut la modifier"; lbl.style.color = "#f87171"; }
  }
}

function iazipCheckReady() {
  const keys = _parseGeminiKeys(document.getElementById("iazip-apikey")?.value);
  const btn = document.getElementById("iazip-runbtn");
  if (!btn) return;
  const hasFile = _iazipData._zipFile;
  btn.disabled = !(keys.length && hasFile);
  btn.style.opacity = btn.disabled ? "0.4" : "1";
}

function iazipSetFile(f) {
  if (!f || !f.name.endsWith(".zip")) { showToast("❌ Fichier ZIP requis", "error"); return; }
  _iazipData._zipFile = f;
  const lbl = document.getElementById("iazip-droplabel");
  if (lbl) lbl.textContent = "📦 " + f.name + " (" + (f.size/1024).toFixed(0) + " Ko)";
  iazipCheckReady();
}

function _iazipSetProgress(pct) {
  const bar = document.getElementById("iazip-progbar");
  const wrap = document.getElementById("iazip-progress");
  if (wrap) wrap.style.display = "block";
  if (bar) bar.style.width = pct + "%";
}

function _iazipSetStatus(msg) {
  const el = document.getElementById("iazip-status");
  if (el) el.textContent = msg;
  const pillTxt = document.getElementById("iazipFloatingPillTxt");
  if (pillTxt && msg) pillTxt.textContent = msg;
}

// Affiche/masque la pastille flottante globale (visible même en dehors du panel
// modérateur) qui reflète l'avancement de l'analyse IA ZIP en tâche de fond.
function _iazipAfficherPastille(afficher) {
  const pill = document.getElementById("iazipFloatingPill");
  if (pill) pill.style.display = afficher ? "flex" : "none";
}

// Callback de la pastille flottante : rouvre le panel modérateur directement
// sur l'onglet IA ZIP, pour que l'utilisateur retrouve l'état d'avancement
// (les éléments du panel n'ont jamais été détruits pendant qu'il naviguait
// ailleurs, donc tout est déjà à jour).
function _iazipReouvrirDepuisPastille() {
  const modal = document.getElementById("modoPanelModal");
  if (modal) modal.classList.add("show");
  const btn = document.querySelector('.modo-tab-btn[onclick*="\'iazip\'"]') ||
              Array.from(document.querySelectorAll(".modo-tab-btn")).find(b => /IA ZIP/i.test(b.textContent));
  switchModoTab("iazip", btn || null);
}

// Maintient l'écran allumé pendant l'analyse (best-effort — l'API n'est pas
// supportée partout) pour éviter que le navigateur mette le JS en pause si le
// téléphone verrouille son écran pendant un traitement de plusieurs minutes.
let _iazipWakeLock = null;
let _iazipEnCours = false;
async function _iazipDemanderWakeLock() {
  try {
    if ("wakeLock" in navigator) {
      _iazipWakeLock = await navigator.wakeLock.request("screen");
    }
  } catch (e) {
    console.warn("[iazip] wakeLock indisponible:", e.message);
  }
}
function _iazipLibererWakeLock() {
  try { _iazipWakeLock && _iazipWakeLock.release(); } catch(e) {}
  _iazipWakeLock = null;
}
// Le Wake Lock est automatiquement relâché par le navigateur dès que l'onglet
// devient invisible (écran verrouillé, changement d'appli) — on le redemande
// dès que l'onglet redevient visible, tant que l'analyse tourne encore.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && _iazipEnCours) _iazipDemanderWakeLock();
});
// Avertit avant de quitter/recharger la page si une analyse est en cours, pour
// éviter de perdre la progression par accident (fermeture du navigateur, etc.).
window.addEventListener("beforeunload", (e) => {
  if (_iazipEnCours) { e.preventDefault(); e.returnValue = ""; }
});

// Normalisation tolérante des classes (identique au debugger standalone)
function _iazipNormaliserClasse(brut) {
  if (!brut) return null;
  if (GEMINI_CLASSES_VALIDES.includes(brut)) return brut;
  const norm = brut.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s\-]+/g,"_").toLowerCase();
  const found = GEMINI_CLASSES_VALIDES.find(cv => {
    const cvn = cv.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s\-]+/g,"_").toLowerCase();
    return cvn === norm;
  });
  if (found) return found;
  const ALIAS = {
    "terminale_a":"Tle_A","term_a":"Tle_A","ta":"Tle_A","tle_a":"Tle_A",
    "terminale_c":"Tle_C","term_c":"Tle_C","tc":"Tle_C","tlec":"Tle_C","tle_c":"Tle_C",
    "terminale_d":"Tle_D","term_d":"Tle_D","td":"Tle_D","tled":"Tle_D","tle_d":"Tle_D",
    "terminale_ti":"Tle_TI","tti":"Tle_TI","tleti":"Tle_TI","tle_ti":"Tle_TI",
    "premiere_a":"1ère_A","1ere_a":"1ère_A","1a":"1ère_A",
    "premiere_c":"1ère_C","1ere_c":"1ère_C","1c":"1ère_C","probatoire_c":"1ère_C","proba_c":"1ère_C",
    "premiere_d":"1ère_D","1ere_d":"1ère_D","1d":"1ère_D","probatoire_d":"1ère_D","proba_d":"1ère_D",
    "premiere_ti":"1ère_TI","1ere_ti":"1ère_TI","1ti":"1ère_TI",
    "seconde_a":"2nde_A","2nde_a":"2nde_A","2a":"2nde_A",
    "seconde_c":"2nde_C","2nde_c":"2nde_C","2c":"2nde_C",
    "troisieme":"3ème","3eme":"3ème","3e":"3ème",
    "quatrieme":"4ème","4eme":"4ème","4e":"4ème",
    "cinquieme":"5ème","5eme":"5ème","5e":"5ème",
    "sixieme":"6ème","6eme":"6ème","6e":"6ème",
  };
  return ALIAS[norm] || null;
}

// Normalisation tolérante de la matière
function _iazipNormaliserMatiere(brut) {
  if (!brut) return "";
  const keys = Object.keys(NOMS_MATIERES);
  if (keys.includes(brut)) return brut;
  const norm = brut.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s\-\/]+/g,"_").toLowerCase();
  const byKey = keys.find(k => k.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s\-\/]+/g,"_").toLowerCase() === norm);
  if (byKey) return byKey;
  const byVal = Object.entries(NOMS_MATIERES).find(([,label]) => {
    const ln = label.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[\s\-\/]+/g,"_").toLowerCase();
    return ln === norm || ln.startsWith(norm) || norm.startsWith(ln.slice(0,5));
  });
  if (byVal) return byVal[0];
  const ALIAS_MAT = {
    "mathematiques":"math","maths":"math","mth":"math",
    "francais":"francais","fran":"francais","fr":"francais",
    "anglais":"anglais","english":"anglais","ang":"anglais",
    "physique":"physique","phys":"physique",
    "chimie":"chimie","chim":"chimie",
    "svt":"svt","biologie":"svt","bio":"svt",
    "histoire_geo":"histoire_geo","hg":"histoire_geo","histgeo":"histoire_geo",
    "informatique":"informatique","info":"informatique",
    "ecm":"ecm","citoyennete":"ecm",
    "philosophie":"Philosophie","philo":"Philosophie",
    "espagnol":"espagnol","esp":"espagnol",
    "allemand":"allemand",
    "arabe":"arabe",
    "chinois":"chinois",
    "litterature":"litterature","litt":"litterature",
    "lcn":"LCN","langue_culture":"LCN",
    "dictee":"Dictee",
    "etude":"Etude","etude_de_textes":"Etude",
  };
  return ALIAS_MAT[norm] || "";
}

// Normalisation tolérante du type — Gemini répond parfois un mot proche mais
// différent du mot-clé strict attendu (ex: "Epreuve", "Examen", "DS" au lieu
// de "examen_officiel"/"sequencielle"), comme observé en test réel (2026).
// Sans cette tolérance, GEMINI_TYPES_VALIDES.includes(...) échouait
// silencieusement et retombait sur "cours" par défaut — un examen officiel
// pouvait ainsi être classé comme simple cours, invisible dans l'onglet
// "Épreuves officielles" de l'app.
function _iazipNormaliserType(brut) {
  if (!brut) return "cours";
  if (GEMINI_TYPES_VALIDES.includes(brut)) return brut;
  const norm = String(brut).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();
  const ALIAS_TYPE = {
    "epreuve":"examen_officiel", "examen":"examen_officiel", "examenofficiel":"examen_officiel",
    "officiel":"examen_officiel", "probatoire":"examen_officiel", "bac":"examen_officiel",
    "baccalaureat":"examen_officiel", "bepc":"examen_officiel", "cep":"examen_officiel",
    "concours":"examen_officiel", "blanc":"examen_officiel",
    "sequence":"sequencielle", "sequentielle":"sequencielle", "seq":"sequencielle",
    "ds":"sequencielle", "devoirsurveille":"sequencielle", "devoir":"sequencielle",
    "zone":"la_zone", "lazone":"la_zone", "exercice":"la_zone", "exercices":"la_zone",
    "competence":"competences", "competences":"competences",
    "cours":"cours", "lecon":"cours", "chapitre":"cours",
  };
  return ALIAS_TYPE[norm] || "cours";
}

// Parser la réponse Gemini
function _iazipParserReponse(texte) {
  const cleaned = (texte||"").replace(/```json|```/g,"").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let parsed;
  try { parsed = JSON.parse(match[0]); } catch(e) { return null; }

  let classesBrutes = [];
  if (typeof parsed.classe === "string" && parsed.classe.trim())
    classesBrutes = parsed.classe.split(",").map(c=>c.trim()).filter(Boolean);
  else if (Array.isArray(parsed.classes))
    classesBrutes = parsed.classes.map(c=>String(c).trim()).filter(Boolean);
  else if (Array.isArray(parsed.classe))
    classesBrutes = parsed.classe.map(c=>String(c).trim()).filter(Boolean);

  const classes = [...new Set(classesBrutes.map(_iazipNormaliserClasse).filter(Boolean))];
  const matiere = _iazipNormaliserMatiere(parsed.matiere || "");
  const type    = _iazipNormaliserType(parsed.type);
  const titre   = typeof parsed.titre === "string" ? parsed.titre.trim().slice(0,80) : "";
  const lyceeBrut = (typeof parsed.lycee === "string") ? parsed.lycee.trim() : "";
  const lyceNorm  = lyceeBrut.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const lycee  = (lyceNorm.includes("manengouba") || lyceNorm === "principal") ? "principal" : "autres";
  const annee  = (typeof parsed.annee === "string" && /^(19[9]\d|20\d\d)$/.test(parsed.annee.trim())) ? parsed.annee.trim() : "";

  return { classes, classe: classes.join(","), matiere, type, titre, lycee, annee };
}

// Générer le nom de fichier complet et strict
// ── Construit le TITRE COMPLET vu par l'élève (demande Jean, 2026) ──
// Format imposé : "Matière — Classe — Type/Séquence — Année", ex:
// "Mathématiques — Tle C — Séquence 2 — 2026". Contrairement au nom de
// fichier (_iazipGenererNom, qui sert uniquement à l'upload Cloudinary), ce
// titre est le champ "titre" RÉELLEMENT stocké en base et affiché partout
// dans l'app (liste d'examens, recherche, partage) — avant ce correctif, ce
// champ ne contenait QUE le titre brut généré par Gemini (ex: juste "Devoir
// Surveillé N°2"), sans aucun repère de matière/classe/année quand on le
// voit isolément (ex: dans une notification ou un lien partagé qui n'affiche
// pas le sous-titre matière/classe visible ailleurs dans l'app).
// Le numéro de séquence/compétence, s'il est présent dans le titre brut de
// Gemini (ex: "Séquence 2", "Devoir N°3", "DS2"), est conservé tel quel et
// utilisé comme 3ᵉ segment — Gemini a déjà reçu instruction de l'inclure
// dans son "titre" (voir _construirePromptAnalyseDocument).
function _iazipConstruireTitreComplet(meta) {
  const matiereAffichee = (NOMS_MATIERES && NOMS_MATIERES[meta.matiere]) ? NOMS_MATIERES[meta.matiere] : (meta.matiere || "");
  const classesTriees = (meta.classes && meta.classes.length)
    ? [...meta.classes].sort((a, b) => GEMINI_CLASSES_VALIDES.indexOf(a) - GEMINI_CLASSES_VALIDES.indexOf(b))
    : (meta.classe ? meta.classe.split(",").map(c => c.trim()).filter(Boolean) : []);
  const classeAffichee = classesTriees.length ? classesTriees.map(c => c.replace(/_/g, " ")).join(", ") : "";
  // "Type/Séquence" — le titre brut de Gemini contient déjà le numéro de
  // séquence/devoir s'il existe dans le document (instruction du prompt) ;
  // pour un examen officiel, on préfère un libellé standard plus parlant
  // ("Probatoire", "BAC", "BEPC"...) déduit du titre brut si possible, sinon
  // un libellé générique selon le type détecté.
  const LIBELLES_TYPE = { cours: "Cours", sequencielle: "Séquentielle", examen_officiel: "Épreuve", la_zone: "Exercices difficiles", competences: "Compétences" };
  const NOMS_EPREUVE_DETECTABLES = [
    { motif: /probatoire|proba\b/i, label: "Probatoire" },
    { motif: /\bbac\b|baccalaur[ée]at/i, label: "BAC" },
    { motif: /\bbepc\b/i, label: "BEPC" },
    { motif: /\bcep\b/i, label: "CEP" },
    { motif: /concours/i, label: "Concours" },
  ];
  let segmentTypeOuSequence = (meta.titre || "").trim();

  // ── Déduplication : retirer le nom de la matière du segment titre s'il y
  // apparaît déjà ── Gemini inclut parfois la matière dans son titre brut
  // (ex: "BEPC — Espagnol", "Sujet d'Espagnol", "Épreuve de Physique"), ce
  // qui produirait sinon une répétition une fois la matière déjà ajoutée
  // comme 1ᵉʳ segment (ex: "Espagnol — 3ème — BEPC — Espagnol — 2024" au
  // lieu de "Espagnol — 3ème — BEPC — 2024"). On retire toute occurrence du
  // nom de matière (affiché OU code interne, insensible à la casse/accents/
  // tiret de jonction "d'"/"de") du segment, puis on nettoie la ponctuation
  // résiduelle qu'un retrait laisserait (tirets ou espaces en trop).
  if (matiereAffichee || meta.matiere) {
    const variantesMatiere = [matiereAffichee, meta.matiere].filter(Boolean);
    for (const variante of variantesMatiere) {
      const motifMatiere = new RegExp(`(^|[\\s—-])(d['’]|de\\s+|du\\s+)?${variante.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\s|$|[—-])`, "gi");
      segmentTypeOuSequence = segmentTypeOuSequence.replace(motifMatiere, " ").trim();
    }
    // Nettoyer les doubles tirets/espaces laissés par le retrait
    segmentTypeOuSequence = segmentTypeOuSequence.replace(/\s*—\s*—\s*/g, " — ").replace(/^[—\s]+|[—\s]+$/g, "").trim();
  }

  if (meta.type === "examen_officiel") {
    const epreuveTrouvee = NOMS_EPREUVE_DETECTABLES.find(e => e.motif.test(segmentTypeOuSequence));
    // Termes déjà génériques que Gemini peut avoir mis dans son titre (ex:
    // "Sujet d'Espagnol", "Épreuve de Physique") — s'ils sont déjà présents,
    // préfixer encore "Épreuve" serait redondant ("Épreuve — Sujet
    // d'Espagnol"). On ne préfixe donc que si le titre ne contient NI un nom
    // d'épreuve officielle reconnu (Probatoire/BAC/BEPC...) NI un mot
    // générique équivalent ("sujet", "épreuve").
    const dejaGenerique = epreuveTrouvee || /(^|\s)[ée]preuve\b|(^|\s)sujet\b/i.test(segmentTypeOuSequence);
    if (!dejaGenerique) {
      segmentTypeOuSequence = segmentTypeOuSequence
        ? `${LIBELLES_TYPE.examen_officiel} — ${segmentTypeOuSequence}`
        : LIBELLES_TYPE.examen_officiel;
    }
  } else if (!segmentTypeOuSequence) {
    // Aucun titre fourni par Gemini (cas rare, champ vide) : retombe sur le
    // libellé générique du type plutôt que de laisser un segment vide.
    segmentTypeOuSequence = LIBELLES_TYPE[meta.type] || "Document";
  }

  const segments = [matiereAffichee, classeAffichee, segmentTypeOuSequence, meta.annee || ""].filter(Boolean);
  return segments.join(" — ");
}

function _iazipGenererNom(meta, ext) {
  function slug(s) {
    return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
      .toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,40);
  }
  const lycee   = meta.lycee || "autres";
  const classe  = slug((meta.classes||[])[0] || meta.classe || "");
  const mat     = slug(meta.matiere || "");
  const type    = slug(meta.type || "cours");
  const annee   = meta.annee || "";
  const titre   = slug(meta.titre || "");
  const parts   = [lycee, classe, mat, type];
  if (annee) parts.push(annee);
  if (titre) parts.push(titre);
  return parts.join("_").replace(/_+/g,"_") + "." + (ext||"pdf");
}

// Appel Gemini avec retry 429 — accepte un tableau de clés (rotation) au lieu
// d'une seule : sur un 429, on essaie d'abord la clé suivante avant de faire
// une pause, ce qui répartit la charge entre plusieurs clés API si l'admin en
// a fourni plusieurs (séparées par des virgules dans le champ).
async function _iazipAppelGemini(apiKeys, base64, mimeType) {
  const cles = Array.isArray(apiKeys) ? apiKeys : [apiKeys];
  const prompt = _construirePromptAnalyseDocument();
  let idxCle = 0;
  let tentativesSansNouvelleCle = 0;
  const maxTentatives = Math.max(3, cles.length + 2);

  for (let tentative = 0; tentative < maxTentatives; tentative++) {
    const cle = cles[idxCle % cles.length];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${cle}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: prompt },
              { inline_data: { mime_type: mimeType, data: base64 } }
            ]}],
            // maxOutputTokens=350 était trop bas : Gemini 2.5 Flash réfléchit par
            // défaut avant de répondre (utile ici pour bien appliquer les règles
            // Probatoire/lycée/classe), et ces tokens de réflexion sont prélevés sur
            // maxOutputTokens. Avec 350, la réflexion pouvait tout consommer et ne
            // rien laisser pour le JSON final → réponse vide ("non parseable"). On
            // garde le thinking actif (il aide la précision) et on élargit la marge.
            generationConfig: { temperature: 0.1, maxOutputTokens: 2000 }
          })
        }
      );
      if (!res.ok) {
        const errTxt = await res.text().catch(()=>"");
        const err = new Error(`HTTP ${res.status}: ${errTxt.slice(0,150)}`);
        err.status = res.status;
        throw err;
      }
      const data = await res.json();
      return (data?.candidates?.[0]?.content?.parts?.[0]?.text || "").replace(/```json|```/g,"").trim();
    } catch(e) {
      if (e.status === 429) {
        if (idxCle + 1 < cles.length) {
          // Encore une clé non essayée pour ce fichier — on tourne dessus
          // immédiatement, sans pause.
          idxCle++;
          continue;
        }
        // Toutes les clés ont été essayées et sont en quota — on patiente puis
        // on recommence la rotation depuis le début.
        tentativesSansNouvelleCle++;
        if (tentativesSansNouvelleCle >= 3) throw e;
        const attente = tentativesSansNouvelleCle * 15;
        _iazipSetStatus(`⏳ Quota Gemini (${cles.length > 1 ? "toutes clés" : "clé"}) — pause ${attente}s...`);
        await new Promise(r=>setTimeout(r, attente*1000));
        idxCle = 0;
      } else if (e.status === 503) {
        // 503 = modèle Gemini surchargé côté Google ("high demand"), erreur
        // temporaire indépendante du quota — changer de clé ne sert à rien,
        // il suffit d'attendre un peu et de réessayer avec la même clé.
        tentativesSansNouvelleCle++;
        if (tentativesSansNouvelleCle >= 3) throw e;
        const attente = tentativesSansNouvelleCle * 10;
        _iazipSetStatus(`⏳ Modèle Gemini surchargé — pause ${attente}s puis nouvel essai...`);
        await new Promise(r=>setTimeout(r, attente*1000));
      } else throw e;
    }
  }
}

async function iazipLancer() {
  const apiKeys = _parseGeminiKeys(document.getElementById("iazip-apikey")?.value);
  const zipFile = _iazipData._zipFile;
  if (!apiKeys.length || !zipFile) return;

  _iazipData = [];
  _iazipData._zipFile = zipFile;
  document.getElementById("iazip-results").style.display = "none";
  document.getElementById("iazip-filelist").innerHTML = "";
  document.getElementById("iazip-runbtn").disabled = true;
  document.getElementById("iazip-runbtn").style.opacity = "0.4";
  _iazipSetProgress(5);
  _iazipSetStatus("Chargement du ZIP...");
  _iazipAfficherPastille(true);
  await _iazipDemanderWakeLock();
  _iazipEnCours = true;

  const EXT_MIME = { pdf:"application/pdf", jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png" };

  try {
    if (typeof JSZip === "undefined") throw new Error("JSZip non chargé — recharge la page");
    const zip = await JSZip.loadAsync(zipFile);
    const fichiers = [];
    zip.forEach((path, entry) => {
      if (entry.dir) return;
      const ext = path.split(".").pop().toLowerCase();
      if (EXT_MIME[ext]) fichiers.push({ path, entry, ext, mime: EXT_MIME[ext] });
    });

    if (!fichiers.length) {
      _iazipSetStatus("❌ Aucun PDF/JPG/PNG dans ce ZIP.");
      document.getElementById("iazip-runbtn").disabled = false;
      document.getElementById("iazip-runbtn").style.opacity = "1";
      return;
    }

    let ok=0, partial=0, fail=0;

    for (let i=0; i<fichiers.length; i++) {
      const { path, entry, ext, mime } = fichiers[i];
      _iazipSetProgress(5 + Math.round(88*(i/fichiers.length)));
      _iazipSetStatus(`Analyse ${i+1}/${fichiers.length} — ${path.split("/").pop()}`);

      let meta = null, nomGenere = "", errMsg = "";
      try {
        const blob = await entry.async("blob");
        const base64 = await new Promise((res,rej)=>{
          const r = new FileReader();
          r.onload = ()=>res(r.result.split(",")[1]);
          r.onerror = ()=>rej(new Error("Lecture échouée"));
          r.readAsDataURL(blob);
        });
        const texte = await _iazipAppelGemini(apiKeys, base64, mime);
        meta = _iazipParserReponse(texte);
        if (meta) {
          nomGenere = _iazipGenererNom(meta, ext);
          // "Complet" = publiable directement sans aucune retouche manuelle —
          // classe ET matière ET titre, puisque _iazipPublierUn exige les
          // trois (voir plus bas). Avant ce correctif, un fichier avec classe
          // et matière mais SANS titre était compté "ok" alors qu'il restait
          // bloqué à la publication tant que le modérateur ne remplissait pas
          // le titre manuellement — comptage trompeur.
          if (meta.classes.length && meta.matiere && meta.titre) ok++;
          else if (meta.classes.length || meta.matiere || meta.titre) partial++;
          else fail++;
        } else { fail++; errMsg = "Réponse Gemini non parseable"; }
        _iazipData.push({ path, blob, ext, mime, meta, nomGenere, errMsg, premium: false });
      } catch(e) {
        errMsg = e.message;
        fail++;
        _iazipData.push({ path, blob: null, ext, mime, meta: null, nomGenere: "", errMsg, premium: false });
      }

      if (i < fichiers.length-1) {
        _iazipSetStatus(`⏳ Pause 5s avant le fichier suivant... (${i+1}/${fichiers.length} traités)`);
        await new Promise(r=>setTimeout(r,5000));
      }
    }

    _iazipSetProgress(100);
    _iazipSetStatus(`✅ Analyse terminée — ${ok} complets, ${partial} partiels, ${fail} échecs`);

    document.getElementById("iazip-s-total").textContent = fichiers.length;
    document.getElementById("iazip-s-ok").textContent = ok;
    document.getElementById("iazip-s-partial").textContent = partial;
    document.getElementById("iazip-s-fail").textContent = fail;

    _iazipRenderListe();
    document.getElementById("iazip-results").style.display = "block";

  } catch(e) {
    _iazipSetStatus("❌ Erreur : " + e.message);
    showToast("❌ " + e.message, "error");
  }

  _iazipEnCours = false;
  _iazipLibererWakeLock();
  _iazipAfficherPastille(false);
  document.getElementById("iazip-runbtn").disabled = false;
  document.getElementById("iazip-runbtn").style.opacity = "1";
  iazipCheckReady();
}

function _iazipRenderListe() {
  const list = document.getElementById("iazip-filelist");
  if (!list) return;
  list.innerHTML = "";

  _iazipData.forEach((f, i) => {
    if (!f.path) return; // skip sentinel
    const complet = f.meta && f.meta.classes.length && f.meta.matiere;
    const vide    = !f.meta || (!f.meta.classes.length && !f.meta.matiere);
    const borderColor = complet ? "#059669" : vide ? "#dc2626" : "#d97706";

    const card = document.createElement("div");
    card.style.cssText = `background:var(--card);border:1.5px solid ${borderColor};border-radius:14px;padding:14px;margin-bottom:10px`;

    const mat    = f.meta?.matiere  || "";
    const classe = f.meta?.classe   || "";
    const type   = f.meta?.type     || "cours";
    const lycee  = f.meta?.lycee    || "autres";
    const annee  = f.meta?.annee    || "";
    // ── Titre COMPLET affiché et modifiable dès le rendu (demande Jean 2026)
    // ── Avant ce correctif, ce champ affichait le titre BRUT de Gemini (ex:
    // "BEPC — Espagnol"), et la transformation en titre complet ne se
    // faisait qu'au moment de cliquer "Publier" — donc le modérateur voyait
    // et éditait un texte différent de ce qui serait réellement enregistré,
    // ce qui est trompeur. Le titre brut original est conservé séparément
    // (f.meta.titreBrut) uniquement pour la génération du nom de fichier
    // (_iazipGenererNom), qui ne doit pas répéter matière/classe/année déjà
    // présentes par ailleurs dans le nom.
    if (f.meta && f.meta.titreBrut === undefined) {
      f.meta.titreBrut = f.meta.titre || "";
      f.meta.titre = _iazipConstruireTitreComplet(f.meta);
    }
    const titre  = f.meta?.titre    || "";

    // Sélecteurs matière et classe éditables
    const matOptions = Object.entries(NOMS_MATIERES).map(([k,v])=>`<option value="${k}" ${k===mat?"selected":""}>${v}</option>`).join("");
    const clsOptions = GEMINI_CLASSES_VALIDES.map(c=>`<option value="${c}" ${c===classe?"selected":""}>${c}</option>`).join("");
    const typeOptions = [
      ["cours","📖 Cours"],["sequencielle","📝 Séquentielle"],
      ["examen_officiel","🎓 Examen officiel"],["la_zone","🔥 La Zone"],["competences","⭐ Compétences"]
    ].map(([v,l])=>`<option value="${v}" ${v===type?"selected":""}>${l}</option>`).join("");
    const lyceeOptions = `<option value="principal" ${lycee==="principal"?"selected":""}>🏫 Principal</option><option value="autres" ${lycee==="autres"?"selected":""}>🏫 Autres</option>`;

    card.innerHTML = `
      <div style="font-size:10px;color:var(--t3);word-break:break-all;margin-bottom:8px">📄 ${f.path}</div>
      ${f.nomGenere ? `<div id="iazip-nomgenere-${i}" style="font-size:10px;font-weight:700;color:var(--p);margin-bottom:8px;word-break:break-all">🏷️ ${f.nomGenere}</div>` : ""}
      ${!f.meta ? `<div style="color:#f87171;font-size:11px;font-weight:700">❌ ${f.errMsg||"Échec Gemini"}</div>` : `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">
        <div>
          <div style="font-size:9px;color:var(--t3);font-weight:700;margin-bottom:2px">MATIÈRE</div>
          <select id="iazip-mat-${i}" style="width:100%;font-size:11px;padding:5px 6px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)" onchange="_iazipUpdateNom(${i});_iazipRecalculerTitreComplet(${i})">${matOptions}</select>
        </div>
        <div style="grid-column:1/-1">
          <div style="font-size:9px;color:var(--t3);font-weight:700;margin-bottom:4px">CLASSE(S)</div>
          <div id="iazip-cls-box-${i}" style="display:flex;flex-wrap:wrap;gap:5px">
            ${GEMINI_CLASSES_VALIDES.map(c => `<label style="display:flex;align-items:center;gap:3px;font-size:10px;font-weight:700;padding:3px 7px;border-radius:6px;border:1px solid var(--border);cursor:pointer;background:${(f.meta?.classes||[]).includes(c)?'var(--p)':'var(--bg)'};color:${(f.meta?.classes||[]).includes(c)?'white':'var(--t2)'}"><input type="checkbox" value="${c}" ${(f.meta?.classes||[]).includes(c)?'checked':''} style="display:none" onchange="_iazipUpdateNom(${i});_iazipUpdateClsStyle(${i},this);_iazipRecalculerTitreComplet(${i})">${c}</label>`).join('')}
          </div>
        </div>
        <div>
          <div style="font-size:9px;color:var(--t3);font-weight:700;margin-bottom:2px">TYPE</div>
          <select id="iazip-type-${i}" style="width:100%;font-size:11px;padding:5px 6px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)" onchange="_iazipUpdateNom(${i});_iazipRecalculerTitreComplet(${i})">${typeOptions}</select>
        </div>
        <div>
          <div style="font-size:9px;color:var(--t3);font-weight:700;margin-bottom:2px">LYCÉE</div>
          <select id="iazip-lycee-${i}" style="width:100%;font-size:11px;padding:5px 6px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)" onchange="_iazipUpdateNom(${i})">${lyceeOptions}</select>
        </div>
      </div>
      <div style="margin-bottom:8px">
        <div style="font-size:9px;color:var(--t3);font-weight:700;margin-bottom:2px">TITRE</div>
        <input id="iazip-titre-${i}" type="text" value="${titre.replace(/"/g,'&quot;')}" placeholder="Titre du document..." style="width:100%;font-size:11px;padding:6px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)" oninput="_iazipUpdateNom(${i})">
      </div>
      <div style="margin-bottom:10px">
        <div style="font-size:9px;color:var(--t3);font-weight:700;margin-bottom:2px">ANNÉE</div>
        <input id="iazip-annee-${i}" type="text" value="${annee}" placeholder="2024" maxlength="4" style="width:100%;font-size:11px;padding:6px 8px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text)" oninput="_iazipUpdateNom(${i});_iazipRecalculerTitreComplet(${i})">
      </div>
      <!-- Toggle Premium -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;background:var(--bg);border-radius:10px;padding:8px 10px;border:1px solid var(--border)">
        <span style="font-size:13px">${f.premium ? "⭐" : "🆓"}</span>
        <span id="iazip-premium-lbl-${i}" style="font-size:11px;font-weight:700;flex:1;color:${f.premium?"#f59e0b":"var(--t2)"}">${f.premium?"Premium ⭐":"Gratuit 🆓"}</span>
        <button onclick="_iazipTogglePremium(${i})" id="iazip-premium-btn-${i}" style="background:${f.premium?"#f59e0b":"var(--border)"};color:${f.premium?"#000":"var(--t2)"};border:none;border-radius:8px;padding:5px 12px;font-size:10px;font-weight:800;cursor:pointer">${f.premium?"Retirer premium":"Mettre premium"}</button>
      </div>
      `}
      <button onclick="_iazipPublierUn(${i})" ${!f.meta||!f.meta.classes.length||!f.meta.matiere?"disabled style='opacity:0.4;cursor:default'":""} style="width:100%;background:var(--p);color:white;border:none;border-radius:10px;padding:9px;font-weight:800;font-size:12px;cursor:pointer">🚀 Publier</button>
    `;
    list.appendChild(card);
  });
}

function _iazipUpdateClsStyle(i, cb) {
  // Met à jour la couleur du label quand on coche/décoche
  const label = cb.closest('label');
  if (!label) return;
  if (cb.checked) {
    label.style.background = 'var(--p)';
    label.style.color = 'white';
    label.style.borderColor = 'var(--p)';
  } else {
    label.style.background = 'var(--bg)';
    label.style.color = 'var(--t2)';
    label.style.borderColor = 'var(--border)';
  }
}

function _iazipTogglePremium(i) {
  const f = _iazipData[i];
  if (!f) return;
  f.premium = !f.premium;
  // Mettre à jour l'UI sans re-rendre toute la liste
  const btn = document.getElementById(`iazip-premium-btn-${i}`);
  const lbl = document.getElementById(`iazip-premium-lbl-${i}`);
  if (btn) {
    btn.textContent = f.premium ? "Retirer premium" : "Mettre premium";
    btn.style.background = f.premium ? "#f59e0b" : "var(--border)";
    btn.style.color = f.premium ? "#000" : "var(--t2)";
  }
  if (lbl) {
    lbl.textContent = f.premium ? "Premium ⭐" : "Gratuit 🆓";
    lbl.style.color = f.premium ? "#f59e0b" : "var(--t2)";
  }
}

// Appelée quand matière/classe/type/lycée/année changent (onchange des
// selects/checkboxes) — reconstruit le titre COMPLET à partir du titre brut
// conservé (f.meta.titreBrut), pour que le titre affiché reste cohérent avec
// les nouveaux choix (ex: si le modérateur corrige la classe détectée à
// tort, le titre doit refléter la bonne classe).
function _iazipRecalculerTitreComplet(i) {
  const f = _iazipData[i];
  if (!f || !f.meta) return;
  const titreInput = document.getElementById(`iazip-titre-${i}`);
  const nouveauTitre = _iazipConstruireTitreComplet({ ...f.meta, titre: f.meta.titreBrut || "" });
  f.meta.titre = nouveauTitre;
  if (titreInput) titreInput.value = nouveauTitre;
}

function _iazipUpdateNom(i) {
  const f = _iazipData[i];
  if (!f || !f.meta) return;
  f.meta.matiere  = document.getElementById(`iazip-mat-${i}`)?.value  || f.meta.matiere;
  f.meta.type     = document.getElementById(`iazip-type-${i}`)?.value || f.meta.type;
  f.meta.lycee    = document.getElementById(`iazip-lycee-${i}`)?.value|| f.meta.lycee;
  f.meta.annee    = document.getElementById(`iazip-annee-${i}`)?.value|| f.meta.annee;
  // Lire toutes les checkboxes cochées
  const clsCbs = document.querySelectorAll(`#iazip-cls-box-${i} input[type=checkbox]:checked`);
  const clsChoisies = [...clsCbs].map(cb => cb.value);
  if (clsChoisies.length) { f.meta.classes = clsChoisies; f.meta.classe = clsChoisies.join(","); }
  // Recalculer le titre complet à partir des nouveaux champs (matière,
  // classe, type, année) — sauf si l'appel vient d'une frappe DANS le champ
  // titre lui-même, qui doit rester un champ libre éditable directement (voir
  // oninput="_iazipUpdateNom(${i})" du champ titre, qui passe par cette même
  // fonction mais ne doit PAS s'auto-écraser à chaque caractère tapé).
  f.meta.titre = document.getElementById(`iazip-titre-${i}`)?.value ?? f.meta.titre;
  f.nomGenere = _iazipGenererNom(f.meta, f.ext);
  // Mettre à jour l'affichage du nom généré — via un id explicite plutôt
  // qu'un sélecteur basé sur le style inline (fragile : matchait le premier
  // élément ayant "color:var(--p)" dans son style, qui pourrait ne plus être
  // le bon élément si la mise en page de la carte change).
  const nomEl = document.getElementById(`iazip-nomgenere-${i}`);
  if (nomEl) nomEl.textContent = "🏷️ " + f.nomGenere;
}

async function _iazipPublierUn(i) {
  const f = _iazipData[i];
  if (!f || !f.meta || !f.blob) { showToast("❌ Fichier invalide", "error"); return; }

  const mat    = document.getElementById(`iazip-mat-${i}`)?.value   || f.meta.matiere;
  const clsCbs = document.querySelectorAll(`#iazip-cls-box-${i} input[type=checkbox]:checked`);
  const clsVal = [...clsCbs].map(cb=>cb.value).join(",") || f.meta.classe;
  const type   = document.getElementById(`iazip-type-${i}`)?.value  || f.meta.type;
  const lycee  = document.getElementById(`iazip-lycee-${i}`)?.value || f.meta.lycee;
  const annee  = document.getElementById(`iazip-annee-${i}`)?.value || f.meta.annee;
  // ── Titre COMPLET vu par l'élève (demande Jean, 2026) ──
  // Le champ "titre" affiché et modifiable dans le formulaire contient DÉJÀ
  // le titre complet (matière + classe + type/séquence + année), construit
  // au rendu de la carte (_iazipRenderListe) et recalculé à chaque
  // changement de matière/classe/type/année (_iazipRecalculerTitreComplet).
  // On le lit donc ICI tel quel, SANS le reconstruire — sinon une édition
  // manuelle du modérateur dans ce champ serait écrasée juste avant
  // publication, ce qui serait incohérent avec ce qu'il voit à l'écran.
  const titre = document.getElementById(`iazip-titre-${i}`)?.value || f.meta.titre;
  // Titre BRUT (sans matière/classe/année) — utilisé uniquement pour le nom
  // de fichier (éviter la répétition) et la comparaison anti-doublon par
  // similarité (comparer des titres bruts entre eux, pas des titres déjà
  // enrichis différemment selon la classe choisie à chaque import).
  const titreBrut = f.meta.titreBrut || titre;

  if (!clsVal || !mat || !titre) { showToast("❌ Classe, matière et titre requis", "error"); return; }

  // ── Anti-doublons : même logique stricte que partout ailleurs dans l'app
  // (panel modérateur classique, ancien import ZIP, contributions élèves) —
  // correspondance EXACTE (_estDoublon) PUIS similarité de titre (Clé 2
  // Gemini) avec rejet automatique ≥80% et file d'attente modérateur entre
  // 55-80%. La comparaison se fait sur le TITRE BRUT (titreBrut), pas sur le
  // titre complet enrichi de matière/classe/année : deux occurrences du même
  // document compareraient sinon des titres déjà différents (ex: si la
  // classe a été corrigée différemment entre 2 imports), faussant le score.
  if (_estDoublon(titre, mat, clsVal)) { showToast(`⚠️ Doublon détecté — "${titre}" existe déjà`, "error"); return; }
  const verifDoublonIazip = await verifierDoublonAvantPublicationRapide(titreBrut, mat, clsVal);
  if (verifDoublonIazip.niveau === "doublon") {
    showToast(`⚠️ Doublon détecté (${Math.round(verifDoublonIazip.score*100)}% similaire à "${(verifDoublonIazip.contenuSimilaire?.titre||"").slice(0,40)}")`, "error");
    return;
  }
  if (verifDoublonIazip.niveau === "zone_grise") {
    _ajouterAFileVerificationDoublons({
      titreCandidat: verifDoublonIazip.titre, score: verifDoublonIazip.score,
      titreSimilaire: verifDoublonIazip.contenuSimilaire?.titre || "",
      idContenuSimilaire: verifDoublonIazip.contenuSimilaire?.id || null,
      mat, classe: clsVal,
      contexte: { type: "publication_iazip", titre, path: f.path },
    });
    showToast(`⏳ Mis en file de vérification — ${Math.round(verifDoublonIazip.score*100)}% similaire à un contenu existant. Vérifie dans "🔍 Doublons".`, "info");
    return;
  }

  showToast("⏳ Publication en cours...", "info");
  try {
    // Upload Cloudinary — le nom de FICHIER utilise le titre BRUT (titreBrut),
    // pas le titre complet affiché à l'élève (titre), pour éviter de
    // dupliquer matière/classe deux fois dans le nom (_iazipGenererNom les
    // ajoute déjà séparément à partir de ses propres paramètres).
    const nomFichier = f.nomGenere || _iazipGenererNom({...f.meta, matiere:mat, classe:clsVal, type, lycee, annee, titre: titreBrut, classes:[clsVal]}, f.ext);
    const ZIP_MIME = { pdf:"application/pdf", jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png" };
    const blobFile = new File([f.blob], nomFichier, { type: f.blob.type || ZIP_MIME[f.ext] || "application/pdf" });
    const formData = new FormData();
    formData.append("file", blobFile);
    formData.append("upload_preset", _getCfg("cloudinaryPreset") || "learnupr_uploads");
    formData.append("folder", `learnup/${mat}`);
    let cloudName = _getCfg("cloudinaryCloud") || "";
    if (!cloudName && CLOUDINARY_URL) { const m = CLOUDINARY_URL.match(/v1_1\/([^/]+)/); if (m) cloudName = m[1]; }
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method:"POST", body:formData });
    const uploadData = await uploadRes.json();
    if (!uploadData.secure_url) throw new Error(uploadData.error?.message || "Upload Cloudinary échoué");

    const ZIP_TYPE_APP = { cours:"cours", sequencielle:"sequencielle", examen_officiel:"examen", la_zone:"la_zone", competences:"competences" };
    const typeApp = ZIP_TYPE_APP[type] || "examen";
    const publies = JSON.parse(localStorage.getItem("contenu_publie")||"[]");
    const entry = {
      id: Date.now()+i, type: typeApp, typeFichier: type, mat, classe: clsVal,
      titre, lycee, annee, premium: f.premium ? 1 : 0,
      numero: publies.filter(p=>p.type===typeApp&&p.mat===mat).length+1,
      contenu: "", fichierUrl: uploadData.secure_url,
      fichierType: ZIP_MIME[f.ext] || "application/pdf",
      nom: nomFichier, nomOriginal: f.path.split("/").pop(),
      auteur: localStorage.getItem("userPhone")||"modo", date: Date.now()
    };
    publies.push(entry);
    localStorage.setItem("contenu_publie", JSON.stringify(publies));

    // Turso — IMPORTANT : noms de colonnes en snake_case (type_fichier,
    // fichier_url, fichier_type, nom_original), pas camelCase, pour
    // correspondre exactement au schéma réel utilisé PARTOUT ailleurs dans
    // l'app (publierContenu, soumettreContribution, publierFichierZip...).
    // La version précédente de cette requête utilisait typeFichier/
    // fichierUrl/fichierType en camelCase, qui ne correspondent à AUCUNE
    // colonne existante — la publication via cet outil pouvait donc échouer
    // silencieusement sur Turso (ou pire, créer de nouvelles colonnes
    // jamais lues ailleurs si le driver les auto-créait), même si l'entrée
    // restait visible localement via localStorage.
    if (turso) {
      try {
        await turso.execute({
          sql: `INSERT INTO contenu (id,type,type_fichier,mat,classe,titre,lycee,annee,premium,numero,contenu,fichier_url,fichier_type,nom,nom_original,auteur,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          args: [entry.id,entry.type,entry.typeFichier,entry.mat,entry.classe,entry.titre,entry.lycee,entry.annee,entry.premium,entry.numero,entry.contenu,entry.fichierUrl,entry.fichierType,entry.nom,entry.nomOriginal,entry.auteur,entry.date]
        });
      } catch(eTurso) {
        // Repli si la colonne "annee" ou "nom_original" n'existe pas encore
        // sur cette base (anciens déploiements n'ayant jamais lancé les
        // outils qui les ajoutent) — voir le même pattern défensif utilisé
        // par publierFichierZip pour cette même raison.
        try {
          await turso.execute({
            sql: `INSERT INTO contenu (id,type,type_fichier,mat,classe,titre,lycee,premium,numero,contenu,fichier_url,fichier_type,nom,auteur,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            args: [entry.id,entry.type,entry.typeFichier,entry.mat,entry.classe,entry.titre,entry.lycee,entry.premium,entry.numero,entry.contenu,entry.fichierUrl,entry.fichierType,entry.nom,entry.auteur,entry.date]
          });
        } catch(eTurso2) { console.warn("[IA ZIP] Turso insert:", eTurso2.message); }
      }
    }

    showToast(`✅ "${titre}" publié !`, "success");
    // Griser le bouton du fichier publié
    const pubBtn = document.getElementById("iazip-filelist")?.children[i]?.querySelector("button:last-child");
    if (pubBtn) { pubBtn.textContent = "✅ Publié"; pubBtn.disabled = true; pubBtn.style.opacity = "0.5"; }
    f._publie = true;

  } catch(e) {
    showToast("❌ Erreur : " + e.message, "error");
    console.error("[IA ZIP] publication error:", e);
  }
}

function iazipTousPremium(etat) {
  _iazipData.forEach((f, i) => {
    if (!f.path || !f.meta) return;
    f.premium = etat;
    const btn = document.getElementById(`iazip-premium-btn-${i}`);
    const lbl = document.getElementById(`iazip-premium-lbl-${i}`);
    if (btn) {
      btn.textContent = etat ? "Retirer premium" : "Mettre premium";
      btn.style.background = etat ? "#f59e0b" : "var(--border)";
      btn.style.color = etat ? "#000" : "var(--t2)";
    }
    if (lbl) {
      lbl.textContent = etat ? "Premium ⭐" : "Gratuit 🆓";
      lbl.style.color = etat ? "#f59e0b" : "var(--t2)";
    }
  });
  showToast(etat ? "⭐ Tous les fichiers passés en premium" : "🆓 Tous les fichiers passés en gratuit", "info");
}

async function iazipPublierTous() {
  const btn = document.getElementById("iazip-publiertous-btn");
  if (btn) { btn.disabled = true; btn.textContent = "⏳ Publication en cours..."; }
  let nb = 0, skipped = 0;
  for (let i=0; i<_iazipData.length; i++) {
    const f = _iazipData[i];
    // Même critère que _iazipPublierUn (classe + matière + titre requis) —
    // sinon un fichier "partiel" (ex: classe+matière trouvées mais titre
    // vide) serait silencieusement ignoré ici sans que le modérateur sache
    // pourquoi il n'a pas été publié.
    if (!f.path || f._publie) continue;
    if (!f.meta || !f.meta.classes.length || !f.meta.matiere || !f.meta.titre) { skipped++; continue; }
    await _iazipPublierUn(i);
    nb++;
    await new Promise(r=>setTimeout(r,500));
  }
  if (btn) { btn.disabled = false; btn.textContent = `🚀 Tout publier (complets uniquement)`; }
  if (skipped > 0) showToast(`⚠️ ${skipped} fichier(s) ignoré(s) — classe/matière/titre incomplet, à corriger manuellement`, "info");
  showToast(`✅ ${nb} fichier(s) publié(s)`, "success");
  if (typeof renderContent === "function") renderContent();
}


// ========== EXPOSITION GLOBALE POUR LES HANDLERS INLINE (onclick/onchange/oninput) ==========
// Généré automatiquement : ces fonctions sont appelées depuis des attributs HTML inline
// (onclick="..." etc.), qui ne peuvent résoudre que des noms globaux (window.X).
// NOTE : syncContenuDepuisTurso, showTab et publierContenu sont volontairement ABSENTS :
// ils ont déjà leur propre window.X = ... plus loin dans ce fichier (pattern de patch).
window._cfDragText = _cfDragText;
window._copierTexte = _copierTexte;
window._doublonApprouverContribEleve = _doublonApprouverContribEleve;
window._doublonRejeterContribEleve = _doublonRejeterContribEleve;
window._forceSyncContenu = _forceSyncContenu;
window._iazipPublierUn = _iazipPublierUn;
window._iazipRecalculerTitreComplet = _iazipRecalculerTitreComplet;
window._iazipTogglePremium = _iazipTogglePremium;
window._iazipUpdateClsStyle = _iazipUpdateClsStyle;
window._iazipUpdateNom = _iazipUpdateNom;
window._openContenu = _openContenu;
window._ouvrirPdfNatif = _ouvrirPdfNatif;
window._pmSelectDuree = _pmSelectDuree;
window._retirerDeFileVerificationDoublons = _retirerDeFileVerificationDoublons;
window._reuploadFichier = _reuploadFichier;
window.accepterConsent = accepterConsent;
window.activerNotifications = activerNotifications;
window.activerPremiumPourTous = activerPremiumPourTous;
window.ajouterMatPersonnalisee = ajouterMatPersonnalisee;
window.ajouterModerateur = ajouterModerateur;
window.ajouterPlanItem = ajouterPlanItem;
window.ajouterQuizQuestion = ajouterQuizQuestion;
window.ajouterSimRow = ajouterSimRow;
window.allerProchainACompleter = allerProchainACompleter;
window.analyserReparationLycee = analyserReparationLycee;
window.annulerFichier = annulerFichier;
window.appliquerCorrectionClasses = appliquerCorrectionClasses;
window.appliquerReparationLycee = appliquerReparationLycee;
window.appliquerUrlFix = appliquerUrlFix;
window.basculerLyceeContenuModo = basculerLyceeContenuModo;
window.basculerPremiumContenuModo = basculerPremiumContenuModo;
window._iazipReouvrirDepuisPastille = _iazipReouvrirDepuisPastille;
window.calculerMoyenne = calculerMoyenne;
window.cfGoStep = cfGoStep;
window.cfRafraichirRecap = cfRafraichirRecap;
window.cfSyncNumInput = cfSyncNumInput;
window.cfValidateStep2 = cfValidateStep2;
window.changerPseudo = changerPseudo;
window.chargerDoublonsAVerifier = chargerDoublonsAVerifier;
window.clearAllOffline = clearAllOffline;
window.clearSearch = clearSearch;
window.closeModal = closeModal;
window.cltLoad = cltLoad;
window.cltSwitch = cltSwitch;
window.contacterAdminTransfert = contacterAdminTransfert;
window.contacterAssistance = contacterAssistance;
window.corrigerUrlsCloudinary = corrigerUrlsCloudinary;
window.csvForceUpdateMatieres = csvForceUpdateMatieres;
window.csvVideoApercu = csvVideoApercu;
window.csvVideoLireFichier = csvVideoLireFichier;
window.csvVideoPublierTous = csvVideoPublierTous;
window.csvVideoTogglePremiumTous = csvVideoTogglePremiumTous;
window.definirAppareilPrincipal = definirAppareilPrincipal;
window.deleteChapterOffline = deleteChapterOffline;
window.desactiverModeExamen = desactiverModeExamen;
window.diagnostiquerExamensAutres = diagnostiquerExamensAutres;
window.effacerConfigSecurisee = effacerConfigSecurisee;
window.envoyerPreuvePaiementUpload = envoyerPreuvePaiementUpload;
window.envoyerPreuvePaiementWhatsApp = envoyerPreuvePaiementWhatsApp;
window.esc = esc;
window.exporterReleve = exporterReleve;
window.fermerDeviceMgr = fermerDeviceMgr;
window.fermerEnvoiPreuvePaiement = fermerEnvoiPreuvePaiement;
window.fermerGuide = fermerGuide;
window.fermerLegal = fermerLegal;
window.fermerPlusPanel = fermerPlusPanel;
window.fermerSignalement = fermerSignalement;
window.fermerVisio = fermerVisio;
window.genererCodePremium = genererCodePremium;
window.genererNomFichierContrib = genererNomFichierContrib;
window.handleFileDrop = handleFileDrop;
window.handleModoFileDrop = handleModoFileDrop;
window.handleZipDrop = handleZipDrop;
window.iaScannerFichier = iaScannerFichier;
window.iaToutAnalyser = iaToutAnalyser;
window.iazipCheckReady = iazipCheckReady;
window.iazipLancer = iazipLancer;
window.iazipPublierTous = iazipPublierTous;
window.iazipSetFile = iazipSetFile;
window.iazipToggleKey = iazipToggleKey;
window.iazipToggleLock = iazipToggleLock;
window.iazipTousPremium = iazipTousPremium;
window.importerCSVQuiz = importerCSVQuiz;
window.lancerModeExamen = lancerModeExamen;
window.lancerModeRevision = lancerModeRevision;
window.lancerQuiz = lancerQuiz;
window.lancerRevisionExpress = lancerRevisionExpress;
window.lancerVisio = lancerVisio;
window.likerQuestion = likerQuestion;
window.likerReponse = likerReponse;
window.loginUser = loginUser;
window.markAllRead = markAllRead;
window.markRead = markRead;
window.marquerMeilleureReponse = marquerMeilleureReponse;
window.marquerResolu = marquerResolu;
window.nettoyageAfficherStats = nettoyageAfficherStats;
window.nettoyageClasserParAnnee = nettoyageClasserParAnnee;
window.nettoyageCorrigerNoms = nettoyageCorrigerNoms;
window.nettoyageDetecterDoublons = nettoyageDetecterDoublons;
window.nettoyageRenommerFichiers = nettoyageRenommerFichiers;
window.nettoyageSupprimerDoublons = nettoyageSupprimerDoublons;
window.openAbo = openAbo;
window.openPremiumGate = openPremiumGate;
window.ouvrirActivationPremiumManuelle = ouvrirActivationPremiumManuelle;
window.ouvrirConfigSecurisee = ouvrirConfigSecurisee;
window.ouvrirContribModal = ouvrirContribModal;
window.ouvrirCorrectionClasses = ouvrirCorrectionClasses;
window.ouvrirDepuisPlus = ouvrirDepuisPlus;
window.ouvrirDeviceMgr = ouvrirDeviceMgr;
window.ouvrirEnvoiPreuvePaiement = ouvrirEnvoiPreuvePaiement;
window.ouvrirGuide = ouvrirGuide;
window.ouvrirImportCSVVideo = ouvrirImportCSVVideo;
window.ouvrirLegal = ouvrirLegal;
window.ouvrirNouvelleQuestion = ouvrirNouvelleQuestion;
window.ouvrirPlusPanel = ouvrirPlusPanel;
window.ouvrirSignalement = ouvrirSignalement;
window.ouvrirVideoConference = ouvrirVideoConference;
window.previewFichier = previewFichier;
window.previewModoFichier = previewModoFichier;
window.previewVideo = previewVideo;
window.publierFichierZip = publierFichierZip;
window.publierTousZip = publierTousZip;
window.qfFilterUpdateMatieres = qfFilterUpdateMatieres;
window.qfUpdateMatieres = qfUpdateMatieres;
window.quizNextQuestion = quizNextQuestion;
window.quizUpdateChapitres = quizUpdateChapitres;
window.quizUpdateMatieres = quizUpdateMatieres;
window.rechercherAppareilUser = rechercherAppareilUser;
window.refuserConsent = refuserConsent;
window.reinitialiserAppareils = reinitialiserAppareils;
window.rejeterContribModo = rejeterContribModo;
window.rejeterContribution = rejeterContribution;
window.rejeterPreuvePaiement = rejeterPreuvePaiement;
window.rejoindreVisio = rejoindreVisio;
window.rejouerQuiz = rejouerQuiz;
window.remplacerLienVideo = remplacerLienVideo;
window.renderContent = renderContent;
window.renderForum = renderForum;
window.renderQuizAdminList = renderQuizAdminList;
window.resetApp = resetApp;
window.resetCoefsDefaut = resetCoefsDefaut;
window.retirerModerateur = retirerModerateur;
window.retourQuizHome = retourQuizHome;
window.revoquerAppareil = revoquerAppareil;
window.sauvegarderConfigSecurisee = sauvegarderConfigSecurisee;
window.saveSimRows = saveSimRows;
window.scanFichiersManquants = scanFichiersManquants;
window.selectCorrectAnswer = selectCorrectAnswer;
window.selectSignalType = selectSignalType;
window.selectionnerTout = selectionnerTout;
window.setCFType = setCFType;
window.setClasse = setClasse;
window.setExamenFiltre = setExamenFiltre;
window.setForumClasse = setForumClasse;
window.setModoDocType = setModoDocType;
window.setModoLycee = setModoLycee;
window.setQuizNb = setQuizNb;
window.setSearchFilter = setSearchFilter;
window.setSearchFiltreClasse = setSearchFiltreClasse;
window.setSearchFiltreDate = setSearchFiltreDate;
window.setType = setType;
window.shareApp = shareApp;
window.shareResource = shareResource;
window.showModeratorPanel = showModeratorPanel;
window.showPage = showPage;
window.showToast = showToast;
window.soumettreContribution = soumettreContribution;
window.soumettreQuestion = soumettreQuestion;
window.soumettreReponse = soumettreReponse;
window.soumettreSignalement = soumettreSignalement;
window.subscribe = subscribe;
window.supprimerContenuPublie = supprimerContenuPublie;
window.supprimerImportCSV = supprimerImportCSV;
window.supprimerLotSelectionne = supprimerLotSelectionne;
window.supprimerMonCompte = supprimerMonCompte;
window.supprimerPlanItem = supprimerPlanItem;
window.supprimerQuizQuestion = supprimerQuizQuestion;
window.supprimerSelection = supprimerSelection;
window.supprimerSelectionContenuModo = supprimerSelectionContenuModo;
window.supprimerSimRow = supprimerSimRow;
window.supprimerToutesNotifs = supprimerToutesNotifs;
window.switchGuideTab = switchGuideTab;
window.switchModoMedia = switchModoMedia;
window.switchModoTab = switchModoTab;
window.switchQuizSubTab = switchQuizSubTab;
window.telechargerExempleCSV = telechargerExempleCSV;
window.testerConnexionGemini = testerConnexionGemini;
window.testerConnexions = testerConnexions;
window.toggleCfgVisibility = toggleCfgVisibility;
window.toggleCsvMultiClasse = toggleCsvMultiClasse;
window.toggleDarkMode = toggleDarkMode;
window.toggleModoMultiClasse = toggleModoMultiClasse;
window.togglePlanDay = togglePlanDay;
window.toggleQuizSelection = toggleQuizSelection;
window.toggleQuizSelectionMode = toggleQuizSelectionMode;
window.toggleSelectionContenuModo = toggleSelectionContenuModo;
window.toggleSelectionMultipleModo = toggleSelectionMultipleModo;
window.toggleSupprLotBtn = toggleSupprLotBtn;
window.toggleTousPremiumZip = toggleTousPremiumZip;
window.traiterZip = traiterZip;
window.updateCfMatSelectLive = updateCfMatSelectLive;
window.updateModoMatSelect = updateModoMatSelect;
window.validateCode = validateCode;
window.validerContribModo = validerContribModo;
window.validerContribution = validerContribution;
window.validerPreuvePaiement = validerPreuvePaiement;
window.verifierMotDePasseAdmin = verifierMotDePasseAdmin;
window.verrouillerAdmin = verrouillerAdmin;
window.viewChapter = viewChapter;
window.viewContenuPublie = viewContenuPublie;
window.viewOfflineChapter = viewOfflineChapter;
window.visioUpdateRoomPreview = visioUpdateRoomPreview;
window.voirCodesPremium = voirCodesPremium;
window.voirUrlsFichiers = voirUrlsFichiers;


// ══════════════════════════════════════════════════════════════════════════
// ⚠️ OUTIL TEMPORAIRE DE DIAGNOSTIC — Contenu manquant (Séquentielles, Cours)
// À SUPPRIMER une fois le problème réglé : il suffit de retirer le bouton
// correspondant dans index.html (celui avec l'id/onclick "diagnosticContenuManquant")
// et cette fonction dans ce fichier. Ne touche à rien d'autre dans l'app.
//
// Ce qu'il fait : recherche dans Turso ET en local tout le contenu dont le
// champ "classe" contient "2nde"/"seconde"/"tle"/"terminale" (sans se limiter
// aux codes de classe exacts comme "2nde_A"), pour repérer deux causes
// fréquentes de disparition de contenu publié :
//   1) Un "classe" mal formaté (ex: "2nde C" au lieu de "2nde_C") qui ne
//      correspond à AUCUNE classe reconnue par l'app → contenu invisible
//      partout car _classeMatch() ne le trouve jamais.
//   2) Un contenu resté uniquement en local (jamais synchronisé sur Turso,
//      ex: upload réseau interrompu) → invisible sur tout autre appareil.
// ══════════════════════════════════════════════════════════════════════════
async function diagnosticContenuManquant() {
 try {
  // Vérif rapide locale d'abord (évite un appel réseau qui pourrait bloquer
  // silencieusement l'ouverture de l'outil) ; re-confirmée avec isAdminPhone.
  const roleLocal = localStorage.getItem("userRole") || "";
  const caller = localStorage.getItem("userPhone") || "";
  let isAdmin = roleLocal === "admin";
  if (!isAdmin) {
    try { isAdmin = await isAdminPhone(caller); } catch(e) { isAdmin = false; }
  }
  if (!isAdmin) { showToast("⛔ Réservé à l'administrateur", "error"); return; }

  // ⚠️ Si turso n'est pas encore connecté à ce moment précis (ex: page qui
  // vient de charger, coupure réseau temporaire), TOUT semblerait "jamais
  // envoyé au serveur" alors que ce n'est pas vrai — juste que la connexion
  // n'a pas encore été (re)établie. On force une tentative de reconnexion
  // ici avant de scanner quoi que ce soit.
  let tursoConnexionErreur = "";
  if (!turso) {
    showToast("🔌 Reconnexion à Turso...", "info");
    try { await initTurso(); } catch(e) { tursoConnexionErreur = e.message || String(e); }
  }
  let tursoDisponible = !!turso;
  if (turso) {
    // Vérifie que la connexion répond VRAIMENT (pas juste que l'objet existe)
    try { await turso.execute({ sql: "SELECT 1", args: [] }); }
    catch(e) { tursoConnexionErreur = e.message || String(e); tursoDisponible = false; }
  }

  showToast("🔍 Analyse en cours (toutes classes)...", "info");

  // ── 1. Tout ce qui est en LOCAL — toutes classes confondues ──
  const locaux = getContenuPublie();

  // ── 2. Tout ce qui est dans TURSO — toutes classes confondues (pas de
  //      filtre par nom, pour attraper aussi les classes mal orthographiées
  //      qui ne matchent aucun code officiel de l'app) ──
  let tursoRows = [];
  if (tursoDisponible) {
    try {
      const res = await turso.execute({
        sql: `SELECT id, type, type_fichier, mat, classe, titre, numero, lycee, premium, date, fichier_url, fichier_type, contenu
              FROM contenu
              ORDER BY date DESC LIMIT 1000`,
        args: []
      });
      // ⚠️ Certains clients Turso ne remontent pas toujours les lignes avec des
      // propriétés nommées utilisables directement (r.id) — on retombe sur
      // l'accès positionnel (r[0], r[1]...) comme le fait déjà
      // syncContenuDepuisTurso() ailleurs dans l'app, pour ne jamais se
      // retrouver avec un id vide qui casse toute la correspondance.
      tursoRows = (res.rows || []).map(r => ({
        id:          r.id           ?? r[0],
        type:        r.type         ?? r[1],
        typeFichier: r.type_fichier ?? r[2],
        mat:         r.mat          ?? r[3],
        classe:      r.classe       ?? r[4],
        titre:       r.titre        ?? r[5],
        numero:      r.numero       ?? r[6],
        lycee:       r.lycee        ?? r[7],
        premium:     Number(r.premium ?? r[8]) === 1,
        date:        r.date         ?? r[9],
        videoUrl:    (r.fichier_type ?? r[11]) === "video" ? (r.fichier_url ?? r[10]) : "",
        contenu:     r.contenu      ?? r[12]
      }));
    } catch(e) {
      tursoConnexionErreur = e.message || String(e);
      showToast("❌ Erreur Turso : " + e.message, "error");
    }
  } else if (!tursoConnexionErreur) {
    tursoConnexionErreur = "Aucune configuration Turso trouvée (URL/token manquants ou pas encore chargés)";
  }

  // ── 3. Fusionner (par id) et marquer la provenance ──
  const parId = {};
  tursoRows.forEach(r => { parId[String(r.id)] = { ...r, _turso: true, _local: false }; });
  locaux.forEach(r => {
    const key = String(r.id);
    if (parId[key]) parId[key]._local = true;
    else parId[key] = { ...r, _turso: false, _local: true };
  });
  const tousLesItems = Object.values(parId).sort((a,b) => (b.date||0) - (a.date||0));

  if (tousLesItems.length === 0) {
    const modalVide = document.createElement("div");
    modalVide.className = "ovl show";
    modalVide.style.cssText = "z-index:99999";
    modalVide.innerHTML = `<div class="modal" style="text-align:center">
      <div style="font-size:48px;margin-bottom:10px">🤷</div>
      <div style="font-weight:900;font-size:15px;margin-bottom:8px">Rien trouvé du tout</div>
      <div style="font-size:12px;color:var(--t2);line-height:1.8;margin-bottom:16px">
        Aucun contenu publié trouvé — ni en local, ni dans Turso.
      </div>
      <button onclick="this.closest('.ovl').remove()" style="width:100%;background:var(--p);color:white;border:none;border-radius:12px;padding:12px;font-weight:800;cursor:pointer">Fermer</button>
    </div>`;
    document.body.appendChild(modalVide);
    return;
  }

  // Classe reconnue par l'app = correspond exactement (après split virgule) à CLASSES
  function classeEstValide(champClasse) {
    const parts = String(champClasse || "").split(",").map(s => s.trim());
    return parts.some(p => CLASSES.includes(p));
  }

  // Pré-calculer le statut "problème" de chaque entrée, stocké globalement
  // pour être ré-utilisé par _diagAppliquerFiltre() sans tout re-scanner.
  const CATEGORIES_VALIDES = ["cours","sequencielle","examen_officiel","la_zone","competences","video"];

  // ── Détection de doublons : même titre (normalisé) + même matière + même
  //    catégorie = très probablement la même ressource publiée plusieurs fois. ──
  const cleDoublon = (it) => `${String(it.titre||"").trim().toLowerCase()}|${it.mat||""}|${it.typeFichier||""}`;
  const compteurs = {};
  tousLesItems.forEach(it => { const k = cleDoublon(it); compteurs[k] = (compteurs[k]||0) + 1; });

  // ── Cohérence niveau/type d'épreuve : Probatoire = 1ère uniquement,
  //    BEPC = 3ème uniquement, BAC/Baccalauréat = Terminale uniquement.
  //    On ne flague QUE si la classe stockée contient un niveau clairement
  //    incompatible avec le titre, pour éviter les faux positifs. ──
  function _niveauIncoherent(it) {
    const titreLC = String(it.titre||"").toLowerCase();
    const classes = String(it.classe||"").split(",").map(s => s.trim());
    const aNiveau = (prefixes) => classes.some(c => prefixes.some(p => c.startsWith(p)));
    if (titreLC.includes("probatoire") && aNiveau(["3ème","4ème","5ème","6ème","Tle"])) {
      return "🎓 Titre \"Probatoire\" (niveau 1ère) mais classe inclut un niveau 3ème/Tle incompatible";
    }
    if (titreLC.includes("bepc") && aNiveau(["1ère","Tle","2nde"])) {
      return "🎓 Titre \"BEPC\" (niveau 3ème) mais classe inclut un niveau 1ère/2nde/Tle incompatible";
    }
    if ((titreLC.includes("baccalauréat") || titreLC.includes("bac ") || titreLC.startsWith("bac")) && aNiveau(["3ème","4ème","5ème","6ème","2nde","1ère"])) {
      return "🎓 Titre \"BAC\" (niveau Terminale) mais classe inclut un niveau inférieur incompatible";
    }
    return null;
  }

  window._diagItemsCache = tousLesItems.map(it => {
    const classeOk = classeEstValide(it.classe);
    const bonType = (typeof _TYPEFICHIER_VERS_TYPE_APP !== "undefined" ? _TYPEFICHIER_VERS_TYPE_APP[it.typeFichier] : null) || it.type;
    const typeOk = !bonType || bonType === it.type;
    const categorieOk = CATEGORIES_VALIDES.includes(it.typeFichier);
    const estVideo = !!(it.videoUrl || (it.contenu && String(it.contenu).startsWith("[VIDEO:")));
    // NB : une vidéo classée en Séquentielle/Examen/etc. n'est PLUS un problème
    // d'affichage — elle est de toute façon exclue de ces onglets et ne
    // s'affiche que dans 🎬 Vidéos, peu importe sa catégorie. Donc pas besoin
    // de la signaler ni de forcer une recatégorisation.
    const nbDoublons = compteurs[cleDoublon(it)] || 1;
    const estDoublon = nbDoublons > 1;
    const niveauMsg = _niveauIncoherent(it);
    const probleme = !classeOk || !it._turso || !typeOk || !categorieOk || estDoublon || !!niveauMsg;
    return { ...it, _classeOk: classeOk, _typeOk: typeOk, _categorieOk: categorieOk, _estVideo: estVideo, _nbDoublons: nbDoublons, _niveauMsg: niveauMsg, _probleme: probleme };
  });

  const existing = document.getElementById("diagContenuModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "diagContenuModal";
  modal.className = "ovl show";
  modal.style.cssText = "z-index:99999";

  const nbProblemes = window._diagItemsCache.filter(it => it._probleme).length;
  const nbClasseNonReconnue = window._diagItemsCache.filter(it => !it._classeOk || (it._niveauMsg && !_niveauClasseCorrigee(it))).length;
  const nbAutoFixables = window._diagItemsCache.filter(it => !it._typeOk || !it._turso || it._niveauMsg).length;
  const nbDoublonsASupprimer = (() => {
    const cle = (it) => `${String(it.titre||"").trim().toLowerCase()}|${it.mat||""}|${it.typeFichier||""}`;
    const groupes = {};
    window._diagItemsCache.forEach(it => { const k = cle(it); (groupes[k]=groupes[k]||[]).push(it); });
    return Object.values(groupes).reduce((n, g) => n + Math.max(0, g.length - 1), 0);
  })();
  const nbAVerifierManuellement = window._diagItemsCache.filter(it => !it._categorieOk).length;
  const labelToutReparer = DEEPSEEK_API_KEY && nbClasseNonReconnue > 0
    ? `🔧 Tout réparer (${nbAutoFixables} réparation(s), ${nbDoublonsASupprimer} doublon(s), 🤖 ${nbClasseNonReconnue} classe(s) via IA)`
    : `🔧 Tout réparer + supprimer les doublons (${nbAutoFixables} réparation(s), ${nbDoublonsASupprimer} doublon(s))`;

  modal.innerHTML = `<div class="modal" style="max-height:88vh;overflow-y:auto;text-align:left">
    <button onclick="document.getElementById('diagContenuModal').remove()"
      style="position:sticky;top:0;float:right;background:var(--card);border:none;border-radius:50%;width:32px;height:32px;font-size:16px;cursor:pointer;z-index:1">✕</button>
    <div style="font-weight:900;font-size:15px;margin-bottom:4px">🚑 Diagnostic — Toutes les classes</div>
    ${tursoConnexionErreur ? `<div style="background:#FEE2E2;border:2px solid #DC2626;border-radius:10px;padding:10px;margin-bottom:10px">
      <div style="font-weight:900;font-size:12px;color:#991B1B">🔌 Turso injoignable en ce moment</div>
      <div style="font-size:10px;color:#7F1D1D;margin-top:2px">Détail : ${esc(tursoConnexionErreur)}</div>
      <div style="font-size:10px;color:#7F1D1D;margin-top:4px">⚠️ Tant que ça dure, TOUT semblera "jamais envoyé au serveur" et "Tout réparer" ne pourra rien écrire sur le serveur (seulement en local sur cet appareil). Vérifie ta connexion internet, ou réessaie dans un instant — ce n'est probablement pas un vrai problème de données.</div>
      <button onclick="document.getElementById('diagContenuModal').remove();diagnosticContenuManquant()" style="margin-top:8px;background:#DC2626;color:white;border:none;border-radius:8px;padding:8px 12px;font-size:11px;font-weight:800;cursor:pointer">🔄 Réessayer la connexion</button>
    </div>` : ""}
    <div style="font-size:11px;color:var(--t2);margin-bottom:10px">${tousLesItems.length} entrée(s) au total (dont ${tursoRows.length} vues sur le serveur Turso) · <b style="color:#DC2626">${nbProblemes} avec un problème détecté</b></div>
    ${(nbAutoFixables + nbDoublonsASupprimer + (DEEPSEEK_API_KEY ? nbClasseNonReconnue : 0)) > 0 ? `<button onclick="_diagToutReparer()" style="width:100%;background:linear-gradient(135deg,#16A34A,#15803D);color:white;border:none;border-radius:12px;padding:12px;font-weight:900;font-size:12px;cursor:pointer;margin-bottom:8px">${labelToutReparer}</button>` : ""}
    ${!DEEPSEEK_API_KEY && nbClasseNonReconnue > 0 ? `<button onclick="_diagCorrigerClassesAvecIA()" style="width:100%;background:linear-gradient(135deg,#4338CA,#6366F1);color:white;border:none;border-radius:12px;padding:12px;font-weight:900;font-size:12px;cursor:pointer;margin-bottom:8px">🤖 Configurer et corriger les classes avec l'IA (DeepSeek) (${nbClasseNonReconnue})</button>` : ""}
    ${nbAVerifierManuellement > 0 ? `<div style="font-size:10px;color:var(--t2);margin-bottom:10px">ℹ️ ${nbAVerifierManuellement} entrée(s) ont une catégorie totalement non reconnue — ça nécessite ton jugement (bouton violet sur chaque entrée ci-dessous).</div>` : ""}
    <div style="display:flex;gap:6px;margin-bottom:12px">
      <button id="diagFiltreProblemes" onclick="_diagAppliquerFiltre(true)" class="ttab on" style="font-size:11px;padding:6px 12px">⚠️ Problèmes seulement (${nbProblemes})</button>
      <button id="diagFiltreTout" onclick="_diagAppliquerFiltre(false)" class="ttab" style="font-size:11px;padding:6px 12px">📋 Tout afficher (${tousLesItems.length})</button>
    </div>
    <div id="diagListeContenu"></div>
  </div>`;
  document.body.appendChild(modal);
  _diagAppliquerFiltre(true);
  showToast(`🔍 ${tousLesItems.length} entrée(s) analysée(s) — ${nbProblemes} problème(s)`, "info");
 } catch(e) {
  console.error("diagnosticContenuManquant a échoué :", e);
  showToast("❌ Le diagnostic a échoué : " + (e && e.message ? e.message : e), "error");
 }
}

// Affiche la liste filtrée (problèmes seulement, ou tout) dans le modal de diagnostic
function _diagAppliquerFiltre(problemesUniquement) {
  const items = window._diagItemsCache || [];
  const liste = problemesUniquement ? items.filter(it => it._probleme) : items;

  const btnP = document.getElementById("diagFiltreProblemes");
  const btnT = document.getElementById("diagFiltreTout");
  if (btnP) btnP.className = "ttab" + (problemesUniquement ? " on" : "");
  if (btnT) btnT.className = "ttab" + (!problemesUniquement ? " on" : "");

  const container = document.getElementById("diagListeContenu");
  if (!container) return;

  if (liste.length === 0) {
    container.innerHTML = `<div style="text-align:center;color:var(--t2);padding:20px;font-size:12px">✅ Aucun problème détecté</div>`;
    return;
  }

  container.innerHTML = liste.map(it => {
    const provenance = it._turso && it._local ? "☁️ Turso + 📱 Local"
      : it._turso ? "☁️ Turso seulement"
      : "📱 Local seulement — <b style='color:#DC2626'>jamais envoyé au serveur !</b>";
    const resultatIA = (window._diagIAResultats || {})[it.id];
    return `<div style="background:${it._probleme ? '#fff3f3' : 'var(--card)'};border:1.5px solid ${it._probleme ? '#ffcdd2' : 'var(--border)'};border-radius:12px;padding:12px;margin-bottom:8px">
      <div style="font-weight:800;font-size:12px;margin-bottom:4px">${esc(it.titre||"Sans titre")}</div>
      <div style="font-size:10px;color:var(--t2);line-height:1.8">
        <b>ID :</b> ${esc(String(it.id))}<br>
        <b>Classe stockée :</b> <code style="background:#f0f0f0;padding:1px 5px;border-radius:4px">${esc(it.classe||"—")}</code> ${it._classeOk ? "✅ reconnue" : "❌ <b style='color:#DC2626'>NON reconnue par l'app !</b>"}<br>
        <b>Type / typeFichier :</b> ${esc(it.type||"—")} / ${esc(it.typeFichier||"—")} ${it._typeOk ? "" : "⚠️ incohérent"}<br>
        <b>Matière :</b> ${esc(it.mat||"—")} · <b>Lycée :</b> ${esc(it.lycee||"principal")}<br>
        <b>Où se trouve ce contenu :</b> ${provenance}
        ${it._nbDoublons > 1 ? `<br><b style="color:#DC2626">🔁 Doublon probable — ${it._nbDoublons} exemplaires</b> (même titre + matière + catégorie)` : ""}
        ${it._niveauMsg ? `<br><b style="color:#DC2626">${it._niveauMsg}</b>` : ""}
        ${resultatIA && resultatIA.status !== "corrige" && !it._classeOk ? `<br><b style="color:${resultatIA.status==='echec'?'#DC2626':'#B45309'}">🤖 IA (${resultatIA.status==='echec'?'échec':'non appliqué'}) :</b> ${esc(resultatIA.detail)}` : ""}
      </div>
      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap">
        ${!it._classeOk || it._niveauMsg ? `<button onclick="_diagCorrigerClasse('${esc(String(it.id))}')" style="background:#DC2626;color:white;border:none;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:800;cursor:pointer">🔧 Corriger la classe</button>` : ""}
        ${!it._turso ? `<button onclick="_diagRenvoyerVersTurso('${esc(String(it.id))}')" style="background:#1565C0;color:white;border:none;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:800;cursor:pointer">☁️ Envoyer vers le serveur</button>` : ""}
        <button onclick="_diagCorrigerCategorie('${esc(String(it.id))}')" style="background:#7C3AED;color:white;border:none;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:800;cursor:pointer">🔁 Changer catégorie (Cours/Séq./Examen/Zone/Compét.)</button>
        ${it._nbDoublons > 1 ? `<button onclick="_diagSupprimerContenu('${esc(String(it.id))}')" style="background:#111827;color:white;border:none;border-radius:8px;padding:6px 10px;font-size:10px;font-weight:800;cursor:pointer">🗑️ Supprimer ce doublon</button>` : ""}
      </div>
    </div>`;
  }).join("");
}

// Corrige le champ "classe" d'un contenu (local + Turso) via une saisie manuelle admin
async function _diagCorrigerClasse(id) {
  const nouvelleClasse = prompt("Classe correcte pour ce contenu (doit être exactement l'un de ces codes) :\n\n" + CLASSES.join(", ") + "\n\nPour partager entre plusieurs classes, sépare par des virgules (ex: Tle_C,Tle_D)");
  if (!nouvelleClasse) return;
  const parts = nouvelleClasse.split(",").map(s => s.trim()).filter(Boolean);
  const invalides = parts.filter(p => !CLASSES.includes(p));
  if (invalides.length) {
    showToast("❌ Classe(s) invalide(s) : " + invalides.join(", "), "error");
    return;
  }
  // Local
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  const idx = publies.findIndex(p => String(p.id) === String(id));
  if (idx >= 0) { publies[idx].classe = nouvelleClasse; localStorage.setItem("contenu_publie", JSON.stringify(publies)); }
  // Turso
  if (turso) {
    try { await turso.execute({ sql: "UPDATE contenu SET classe=? WHERE id=?", args: [nouvelleClasse, id] }); }
    catch(e) { showToast("⚠️ Corrigé en local mais erreur Turso : " + e.message, "info"); }
  }
  showToast("✅ Classe corrigée — rouvre le diagnostic pour vérifier", "success");
  const m = document.getElementById("diagContenuModal");
  if (m) m.remove();
  diagnosticContenuManquant();
}

// Détermine la classe corrigée pour une entrée au niveau incohérent avec son
// titre (ex: "Probatoire" avec classe="3ème,1ère_C" → on retire juste "3ème").
// Retourne null si on ne peut pas corriger sans risque (ex: plus aucune classe
// compatible restante — dans ce cas-là, ça reste pour révision manuelle).
function _niveauClasseCorrigee(it) {
  const titreLC = String(it.titre||"").toLowerCase();
  const classes = String(it.classe||"").split(",").map(s => s.trim()).filter(Boolean);
  let incompatibles = [];
  if (titreLC.includes("probatoire")) incompatibles = ["3ème","4ème","5ème","6ème","Tle"];
  else if (titreLC.includes("bepc")) incompatibles = ["1ère","Tle","2nde"];
  else if (titreLC.includes("baccalauréat") || titreLC.includes("bac ") || titreLC.startsWith("bac")) incompatibles = ["3ème","4ème","5ème","6ème","2nde","1ère"];
  else return null;
  const gardees = classes.filter(c => !incompatibles.some(p => c.startsWith(p)));
  if (gardees.length === 0 || gardees.length === classes.length) return null; // rien à retirer ou tout serait retiré → à vérifier manuellement
  return gardees.join(",");
}

// Répare automatiquement, en un clic, tout ce qui peut l'être SANS jugement
// humain risqué : type incohérent, contenu jamais synchronisé, niveau
// incohérent avec le titre (retire juste le niveau incompatible), doublons
// (garde 1 exemplaire — priorité à celui déjà sur le serveur puis au plus
// récent — supprime les autres), ET classes non reconnues via l'IA DeepSeek
// (si une clé est configurée — sinon cette étape est juste sautée, avec un
// message clair). Ne touche PAS aux catégories invalides qui n'ont pas de
// règle automatique sûre : ça reste manuel (bouton violet).
async function _diagToutReparer() {
  if (!turso) {
    if (!confirm("⚠️ Turso semble injoignable en ce moment.\n\nLes réparations pourront être appliquées en local sur cet appareil, mais RIEN ne sera écrit sur le serveur tant que la connexion n'est pas rétablie — donc les autres appareils ne verront pas les corrections.\n\nContinuer quand même ?")) return;
  }
  const tous = window._diagItemsCache || [];
  const aReparer = tous.filter(it => !it._typeOk || !it._turso || it._niveauMsg);
  const aCorrigerParIA = tous.filter(it => !it._classeOk || (it._niveauMsg && !_niveauClasseCorrigee(it)));
  // Regrouper les doublons pour décider quel exemplaire garder
  const cleDoublon = (it) => `${String(it.titre||"").trim().toLowerCase()}|${it.mat||""}|${it.typeFichier||""}`;
  const groupes = {};
  tous.forEach(it => { const k = cleDoublon(it); (groupes[k] = groupes[k]||[]).push(it); });
  const aSupprimer = [];
  Object.values(groupes).forEach(grp => {
    if (grp.length <= 1) return;
    const trie = [...grp].sort((a,b) => {
      const at = a._turso ? 1 : 0, bt = b._turso ? 1 : 0;
      if (at !== bt) return bt - at; // priorité à celui déjà sur Turso
      return (b.date||0) - (a.date||0); // puis le plus récent
    });
    aSupprimer.push(...trie.slice(1)); // on garde le premier, on supprime le reste
  });

  const utiliserIA = DEEPSEEK_API_KEY && aCorrigerParIA.length > 0;
  const totalActions = aReparer.length + aSupprimer.length + (utiliserIA ? aCorrigerParIA.length : 0);
  if (totalActions === 0) { showToast("Rien à réparer automatiquement", "info"); return; }
  let msgConfirm = `Réparer ${aReparer.length} entrée(s) et supprimer ${aSupprimer.length} doublon(s) ?`;
  if (utiliserIA) msgConfirm += `\n\nEt demander à l'IA DeepSeek de deviner la classe pour ${aCorrigerParIA.length} entrée(s) non reconnue(s) (chaque suggestion sera vérifiée avant application).`;
  else if (aCorrigerParIA.length > 0) msgConfirm += `\n\nℹ️ ${aCorrigerParIA.length} entrée(s) ont une classe non reconnue mais aucune clé DeepSeek n'est configurée — elles seront laissées de côté (Panel admin → 🔐 Configurer les clés → section DeepSeek).`;
  msgConfirm += `\n\nLes suppressions de doublons sont irréversibles.`;
  if (!confirm(msgConfirm)) return;

  showToast(`🔧 Réparation en cours...`, "info");
  let okType = 0, okSync = 0, okNiveau = 0, okSupprime = 0, echecs = 0;
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");

  for (const it of aReparer) {
    try {
      if (!it._typeOk) {
        const bonType = (typeof _TYPEFICHIER_VERS_TYPE_APP !== "undefined" ? _TYPEFICHIER_VERS_TYPE_APP[it.typeFichier] : null) || it.type;
        const idx = publies.findIndex(p => String(p.id) === String(it.id));
        if (idx >= 0) publies[idx].type = bonType;
        if (turso) { try { await turso.execute({ sql: "UPDATE contenu SET type=? WHERE id=?", args: [bonType, it.id] }); okType++; } catch(e) { echecs++; } }
        else okType++;
      }
      if (!it._turso && turso) {
        try {
          await turso.execute({
            sql: `INSERT INTO contenu (id,type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,fichier_type,fichier_nom,lycee,premium,auteur,date)
                  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            args: [it.id, it.type||"", it.typeFichier||"", it.mat||"", it.classe||"", it.titre||"",
                   it.numero||0, it.contenu||"", it.fichierUrl||it.videoUrl||"", it.fichierType||"", it.fichierNom||"",
                   it.lycee||"principal", it.premium?1:0, it.auteur||"admin", it.date||Date.now()]
          });
          okSync++;
        } catch(e) { echecs++; }
      }
      if (it._niveauMsg) {
        const nouvelleClasse = _niveauClasseCorrigee(it);
        if (nouvelleClasse) {
          const idx = publies.findIndex(p => String(p.id) === String(it.id));
          if (idx >= 0) publies[idx].classe = nouvelleClasse;
          if (turso) { try { await turso.execute({ sql: "UPDATE contenu SET classe=? WHERE id=?", args: [nouvelleClasse, it.id] }); okNiveau++; } catch(e) { echecs++; } }
          else okNiveau++;
        }
      }
    } catch(e) { echecs++; }
  }

  let publiesApresSuppression = publies;
  for (const it of aSupprimer) {
    try {
      publiesApresSuppression = publiesApresSuppression.filter(p => String(p.id) !== String(it.id));
      if (turso) { try { await turso.execute({ sql: "DELETE FROM contenu WHERE id=?", args: [it.id] }); okSupprime++; } catch(e) { echecs++; } }
      else okSupprime++;
    } catch(e) { echecs++; }
  }

  // ── Correction des classes non reconnues via l'IA (si clé configurée) ──
  let okIA = 0, iaNonResolu = 0;
  if (utiliserIA) {
    showToast(`🤖 L'IA analyse ${aCorrigerParIA.length} classe(s)...`, "info");
    const resIA = await _diagCorrigerClassesAvecIA_coeur(aCorrigerParIA, publiesApresSuppression);
    okIA = resIA.okCorrige; iaNonResolu = resIA.nonResolu; echecs += resIA.echecs;
  }

  localStorage.setItem("contenu_publie", JSON.stringify(publiesApresSuppression));
  showToast(`✅ ${okType} type(s), ${okSync} synchro(s), ${okNiveau} niveau(x), ${okSupprime} doublon(s) supprimé(s)${utiliserIA ? `, 🤖 ${okIA} classe(s) corrigée(s) par l'IA (${iaNonResolu} incertaine(s))` : ""}${echecs ? ` · ⚠️ ${echecs} échec(s)` : ""}`, echecs ? "info" : "success");
  const m = document.getElementById("diagContenuModal");
  if (m) m.remove();
  diagnosticContenuManquant();
}
window._diagToutReparer = _diagToutReparer;

// Supprime définitivement un contenu (local + Turso) — utilisé pour retirer
// un doublon. Demande confirmation car irréversible.
async function _diagSupprimerContenu(id) {
  const publies = getContenuPublie();
  const item = publies.find(p => String(p.id) === String(id));
  const nomPourConfirm = item ? item.titre : id;
  if (!confirm(`Supprimer définitivement "${nomPourConfirm}" ?\n\nCette action est IRRÉVERSIBLE. Vérifie bien qu'il reste au moins un exemplaire de ce contenu avant de continuer.`)) return;

  // Local
  const restants = JSON.parse(localStorage.getItem("contenu_publie") || "[]").filter(p => String(p.id) !== String(id));
  localStorage.setItem("contenu_publie", JSON.stringify(restants));
  // Turso
  if (turso) {
    try { await turso.execute({ sql: "DELETE FROM contenu WHERE id=?", args: [id] }); }
    catch(e) { showToast("⚠️ Supprimé en local mais erreur Turso : " + e.message, "info"); }
  }
  showToast("🗑️ Supprimé", "success");
  const m = document.getElementById("diagContenuModal");
  if (m) m.remove();
  diagnosticContenuManquant();
}
window._diagSupprimerContenu = _diagSupprimerContenu;

// Change la catégorie (typeFichier + type) d'un contenu — corrige par exemple
// un examen officiel publié par erreur comme "La Zone" (d'où le mélange avec
// Travaux Dirigés), ou toute autre confusion de catégorie.
async function _diagCorrigerCategorie(id) {
  const options = { "1": "cours", "2": "sequencielle", "3": "examen_officiel", "4": "la_zone", "5": "competences", "6": "video" };
  const choix = prompt(
    "Quelle est la VRAIE catégorie de ce contenu ?\n\n" +
    "1 = 📚 Cours\n2 = 📋 Séquentielle\n3 = 🏆 Examen officiel\n4 = 🔥 La Zone\n5 = 🎯 Compétences\n6 = 🎬 Vidéo\n\nTape le chiffre :"
  );
  const nouvelleCategorie = options[String(choix || "").trim()];
  if (!nouvelleCategorie) { showToast("❌ Choix invalide", "error"); return; }
  const nouveauType = (typeof _TYPEFICHIER_VERS_TYPE_APP !== "undefined" ? _TYPEFICHIER_VERS_TYPE_APP[nouvelleCategorie] : null) || nouvelleCategorie;

  // Local
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  const idx = publies.findIndex(p => String(p.id) === String(id));
  if (idx >= 0) {
    publies[idx].typeFichier = nouvelleCategorie;
    publies[idx].type = nouveauType;
    localStorage.setItem("contenu_publie", JSON.stringify(publies));
  }
  // Turso
  if (turso) {
    try { await turso.execute({ sql: "UPDATE contenu SET type_fichier=?, type=? WHERE id=?", args: [nouvelleCategorie, nouveauType, id] }); }
    catch(e) { showToast("⚠️ Corrigé en local mais erreur Turso : " + e.message, "info"); }
  }
  showToast("✅ Catégorie corrigée — rouvre le diagnostic pour vérifier", "success");
  const m = document.getElementById("diagContenuModal");
  if (m) m.remove();
  diagnosticContenuManquant();
}


async function _diagRenvoyerVersTurso(id) {
  if (!turso) { showToast("❌ Turso non connecté", "error"); return; }
  const publies = getContenuPublie();
  const item = publies.find(p => String(p.id) === String(id));
  if (!item) { showToast("❌ Introuvable en local", "error"); return; }
  try {
    await turso.execute({
      sql: `INSERT INTO contenu (id,type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,fichier_type,fichier_nom,lycee,premium,auteur,date)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [item.id, item.type||"", item.typeFichier||"", item.mat||"", item.classe||"", item.titre||"",
             item.numero||0, item.contenu||"", item.fichierUrl||"", item.fichierType||"", item.fichierNom||"",
             item.lycee||"principal", item.premium?1:0, item.auteur||"admin", item.date||Date.now()]
    });
    showToast("✅ Envoyé sur le serveur avec succès", "success");
    const m = document.getElementById("diagContenuModal");
    if (m) m.remove();
    diagnosticContenuManquant();
  } catch(e) {
    showToast("❌ Erreur d'envoi vers Turso : " + e.message, "error");
  }
}

// ══════════════════════════════════════════════════════════════════════════
// 🤖 RÉPARATION IA (DeepSeek) DES CLASSES NON RECONNUES
// Utilise la clé configurée par l'admin (panel → 🔐 Configurer les clés →
// section DeepSeek, visible admin uniquement). Pour chaque contenu dont la
// classe stockée ne correspond à aucun code officiel, on demande à l'IA de
// deviner la bonne classe parmi la liste officielle, à partir du titre / de
// la matière / de la classe mal orthographiée. On ne touche à rien
// automatiquement : la classe renvoyée par l'IA est TOUJOURS revérifiée par
// le code avant d'être appliquée (elle doit être un code exact de CLASSES).
// ══════════════════════════════════════════════════════════════════════════
// Cœur de la correction IA, réutilisable : ne demande pas confirmation et
// n'affiche pas de toast — appelé à la fois par le bouton IA seul et par
// "Tout réparer". Mute `publies` en place et retourne les compteurs.
async function _diagCorrigerClassesAvecIA_coeur(items, publies) {
  let okCorrige = 0, nonResolu = 0, echecs = 0;
  window._diagIAResultats = window._diagIAResultats || {};

  for (const it of items) {
    try {
      const estProblemeNiveau = it._classeOk && it._niveauMsg;
      const descriptionProbleme = estProblemeNiveau
        ? `Le champ "classe" est un code officiel VALIDE, mais il est incohérent avec le niveau scolaire suggéré par le titre (${it._niveauMsg || ""}). Il faut donc deviner la VRAIE classe visée à partir du titre, pas juste nettoyer le format.`
        : `Le champ "classe" ne correspond à AUCUN code officiel exact (mal orthographié).`;

      const prompt = `Tu aides à corriger des données scolaires camerounaises mal saisies.
Liste des codes de classe OFFICIELS et VALIDES (utilise EXACTEMENT ces chaînes, rien d'autre) :
${CLASSES.join(", ")}

Voici un contenu publié dont le champ "classe" pose problème : ${descriptionProbleme}
- Titre : "${it.titre || ""}"
- Matière : "${it.mat || ""}"
- Catégorie : "${it.typeFichier || ""}"
- Classe stockée : "${it.classe || ""}"

Déduis la ou les classes officielles correspondantes. Règles de niveau à respecter strictement : "Probatoire" = 1ère uniquement, "BEPC" = 3ème uniquement, "BAC"/"Baccalauréat" = Terminale (Tle_*) uniquement. Par exemple "2nde C" → "2nde_C", "Terminale D" → "Tle_D", "1ere A,C" → "1ère_A,1ère_C", un titre "Baccalauréat" avec classe stockée "1ère_TI" → corrige en "Tle_TI" (même série, bon niveau). Si plusieurs classes sont visées, sépare-les par une virgule SANS espace. Si tu ne peux vraiment pas déterminer la bonne classe avec confiance, réponds avec classe: null.

Réponds UNIQUEMENT avec un JSON strict de cette forme, rien d'autre :
{"classe": "2nde_A,2nde_C"}
ou
{"classe": null}`;

      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEEPSEEK_API_KEY}` },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0
        })
      });
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try { const errBody = await res.json(); detail += " — " + (errBody?.error?.message || JSON.stringify(errBody).slice(0,120)); } catch(e) {}
        window._diagIAResultats[it.id] = { status: "echec", detail };
        echecs++; continue;
      }
      const data = await res.json();
      const texte = data?.choices?.[0]?.message?.content || "{}";
      let parsed;
      try { parsed = JSON.parse(texte); }
      catch(e) { window._diagIAResultats[it.id] = { status: "echec", detail: "Réponse IA illisible : " + texte.slice(0,120) }; echecs++; continue; }

      const suggestion = parsed && parsed.classe ? String(parsed.classe).trim() : null;
      if (!suggestion) {
        window._diagIAResultats[it.id] = { status: "incertaine", detail: "L'IA n'a pas trouvé de correspondance fiable" };
        nonResolu++; continue;
      }

      // ── Vérification stricte AVANT toute application : chaque code proposé
      //    doit être un code officiel exact. Sinon on n'applique rien. ──
      const partsSuggeres = suggestion.split(",").map(s => s.trim()).filter(Boolean);
      const tousValides = partsSuggeres.length > 0 && partsSuggeres.every(p => CLASSES.includes(p));
      if (!tousValides) {
        window._diagIAResultats[it.id] = { status: "incertaine", detail: `L'IA a proposé "${suggestion}" mais ce n'est pas un code valide → rejeté par sécurité` };
        nonResolu++; continue;
      }

      const idx = publies.findIndex(p => String(p.id) === String(it.id));
      if (idx >= 0) publies[idx].classe = suggestion;
      if (turso) {
        try { await turso.execute({ sql: "UPDATE contenu SET classe=? WHERE id=?", args: [suggestion, it.id] }); }
        catch(e) { window._diagIAResultats[it.id] = { status: "echec", detail: "Trouvé mais échec Turso : " + e.message }; echecs++; continue; }
      }
      window._diagIAResultats[it.id] = { status: "corrige", detail: `Corrigé en "${suggestion}"` };
      okCorrige++;
    } catch(e) {
      window._diagIAResultats[it.id] = { status: "echec", detail: "Erreur réseau : " + e.message };
      echecs++;
    }
  }
  return { okCorrige, nonResolu, echecs };
}

async function _diagCorrigerClassesAvecIA() {
  const roleLocal = localStorage.getItem("userRole") || "";
  const caller = localStorage.getItem("userPhone") || "";
  let isAdmin = roleLocal === "admin";
  if (!isAdmin) { try { isAdmin = await isAdminPhone(caller); } catch(e) { isAdmin = false; } }
  if (!isAdmin) { showToast("⛔ Réservé à l'administrateur", "error"); return; }

  if (!DEEPSEEK_API_KEY) {
    if (confirm("Aucune clé DeepSeek configurée.\n\nVeux-tu ouvrir la config maintenant pour l'ajouter ? (Panel admin → 🔐 Configurer les clés → section DeepSeek)")) {
      const m = document.getElementById("diagContenuModal"); if (m) m.remove();
      ouvrirConfigSecurisee();
    }
    return;
  }

  const items = (window._diagItemsCache || []).filter(it => !it._classeOk || (it._niveauMsg && !_niveauClasseCorrigee(it)));
  if (items.length === 0) { showToast("Aucune classe non reconnue à corriger", "info"); return; }
  if (!confirm(`Demander à l'IA de deviner la bonne classe pour ${items.length} entrée(s) ?\n\nChaque suggestion sera vérifiée automatiquement avant d'être appliquée — rien d'invalide ne sera enregistré.`)) return;

  showToast(`🤖 Analyse de ${items.length} entrée(s) par l'IA...`, "info");
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  const { okCorrige, nonResolu, echecs } = await _diagCorrigerClassesAvecIA_coeur(items, publies);
  localStorage.setItem("contenu_publie", JSON.stringify(publies));

  showToast(`🤖 IA : ${okCorrige} corrigée(s), ${nonResolu} incertaine(s) (laissées telles quelles)${echecs ? ` · ⚠️ ${echecs} échec(s) réseau` : ""}`, "success");
  const m = document.getElementById("diagContenuModal");
  if (m) m.remove();
  diagnosticContenuManquant();
}
window._diagCorrigerClassesAvecIA = _diagCorrigerClassesAvecIA;

window.diagnosticContenuManquant = diagnosticContenuManquant;
window._diagCorrigerClasse = _diagCorrigerClasse;
window._diagCorrigerCategorie = _diagCorrigerCategorie;
window._diagRenvoyerVersTurso = _diagRenvoyerVersTurso;
window._diagAppliquerFiltre = _diagAppliquerFiltre;
