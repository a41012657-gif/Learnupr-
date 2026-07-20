// Force resync d'un contenu spécifique depuis Turso
async function _forceSyncContenu(id) {
  const dcontenu = document.getElementById('dcontenu');
  if (dcontenu) dcontenu.innerHTML = `<div style="padding:40px 20px;text-align:center;color:var(--t2)"><div style="font-size:30px;margin-bottom:10px;animation:spin 0.8s linear infinite">🔄</div><div style="font-weight:700;font-size:13px">Synchronisation en cours...</div></div>`;
  try {
    if (!turso) throw new Error('Turso non disponible');
    const res = await turso.execute({ sql: 'SELECT * FROM contenu WHERE id=? LIMIT 1', args: [String(id)] });
    if (res.rows && res.rows[0]) {
      const r = res.rows[0];
      const c = {
        id: r.id||r[0], type: r.type||r[1]||'examen',
        mat: r.mat||r[3]||'', classe: r.classe||r[4]||'',
        titre: r.titre||r[5]||'Sans titre', contenu: r.contenu||r[7]||'',
        fichierUrl: r.fichier_url||r[8]||null,
        fichierType: r.fichier_type||r[9]||null,
        fichierNom: r.fichier_nom||r[10]||null,
        premium: r.premium===1||r[12]===1
      };
      const arr = JSON.parse(localStorage.getItem('contenu_publie')||'[]');
      const idx = arr.findIndex(p => String(p.id)===String(id));
      if (idx>=0) arr[idx]={...arr[idx],...c}; else arr.push(c);
      localStorage.setItem('contenu_publie', JSON.stringify(arr));
      showToast('✅ Synchronisé !', 'success');
      setTimeout(()=>_openContenu(String(id)), 300);
    } else {
      showToast('❌ Contenu introuvable dans la base', 'error');
      if (dcontenu) dcontenu.innerHTML = `<div style="padding:30px;text-align:center"><div style="font-size:36px">❌</div><div style="font-weight:800;margin-top:10px">Introuvable dans Turso</div><div style="font-size:11px;color:var(--t2);margin-top:6px">Ce fichier n'existe plus dans la base de données.</div></div>`;
    }
  } catch(e) {
    showToast('❌ Erreur : ' + e.message, 'error');
    if (dcontenu) dcontenu.innerHTML = `<div style="padding:30px;text-align:center"><div style="font-size:36px">⚠️</div><div style="font-weight:800;margin-top:10px">Erreur réseau</div><div style="font-size:11px;color:var(--t2);margin-top:6px">${e.message}</div><button onclick="_openContenu('${id}')" style="margin-top:14px;background:var(--p);color:white;border:none;border-radius:12px;padding:12px 20px;font-weight:800;cursor:pointer">Réessayer</button></div>`;
  }
}

// Helper : requête Turso avec timeout
function _tursoWithTimeout(query, ms=4000) {
  return Promise.race([
    turso.execute(query),
    new Promise((_, rej) => setTimeout(() => rej(new Error("Turso timeout")), ms))
  ]);
}

// Chercher un contenu par id (local puis Turso)
async function _getContenuById(id) {
  const sid = String(id).trim();
  let publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");

  // ── 1. Recherche exacte par id ──
  let c = publies.find(p => String(p.id).trim() === sid);

  // ── 2. Recherche souple (id partiel, cas timestamp tronqué) ──
  if (!c) {
    c = publies.find(p => String(p.id).includes(sid) || sid.includes(String(p.id)));
  }

  // ── 3. Si trouvé mais fichierUrl vide → compléter depuis Turso ──
  if (c && !c.fichierUrl && !c.fichierData && turso) {
    try {
      const res = await _tursoWithTimeout({ sql: "SELECT fichier_url, fichier_type, fichier_nom FROM contenu WHERE id=?", args: [sid] });
      if (res.rows && res.rows[0]) {
        c.fichierUrl  = res.rows[0].fichier_url  || null;
        c.fichierType = res.rows[0].fichier_type || null;
        c.fichierNom  = res.rows[0].fichier_nom  || null;
        const i = publies.findIndex(p => String(p.id).trim() === sid);
        if (i >= 0) { publies[i] = c; localStorage.setItem("contenu_publie", JSON.stringify(publies)); }
      }
    } catch(e) {}
  }

  // ── 4. Trouvé en local mais fichierUrl vide → compléter via Turso + sauvegarder ──
  if (c && !c.fichierUrl && !c.fichierData && turso) {
    try {
      const res = await _tursoWithTimeout({ sql: "SELECT fichier_url, fichier_type, fichier_nom FROM contenu WHERE id=?", args: [sid] });
      if (res.rows && res.rows[0]) {
        c.fichierUrl  = res.rows[0].fichier_url  || null;
        c.fichierType = res.rows[0].fichier_type || null;
        c.fichierNom  = res.rows[0].fichier_nom  || null;
        // Sauvegarder en local pour éviter de reconsulter Turso la prochaine fois
        const i = publies.findIndex(p => String(p.id).trim() === sid);
        if (i >= 0) { publies[i] = c; localStorage.setItem("contenu_publie", JSON.stringify(publies)); }
      }
    } catch(e) {}
  }

  // ── 5. Pas trouvé en local du tout → chercher dans Turso par id ou date ──
  if (!c && turso) {
    try {
      let res = await _tursoWithTimeout({ sql: "SELECT * FROM contenu WHERE id=? LIMIT 1", args: [sid] });
      if ((!res.rows || !res.rows[0]) && sid.length > 10) {
        res = await _tursoWithTimeout({ sql: "SELECT * FROM contenu WHERE date=? LIMIT 1", args: [sid] });
      }
      if (res.rows && res.rows[0]) {
        const r = res.rows[0];
        c = {
          id:          r.id           || r[0],
          type:        r.type         || r[1]  || "examen",
          typeFichier: r.type_fichier || r[2]  || "examen_officiel",
          mat:         r.mat          || r[3]  || "",
          classe:      r.classe       || r[4]  || "",
          titre:       r.titre        || r[5]  || "Sans titre",
          numero:      r.numero       || r[6]  || 0,
          contenu:     r.contenu      || r[7]  || "",
          fichierUrl:  r.fichier_url  || r[8]  || null,
          fichierType: r.fichier_type || r[9]  || null,
          fichierNom:  r.fichier_nom  || r[10] || null,
          premium:     Number(r.premium ?? r[12]) === 1,
          auteur:      r.auteur       || r[13] || "",
          date:        r.date         || r[14] || 0
        };
        // Sauvegarder en local pour la prochaine fois (évite Turso au prochain accès)
        const idxLocal = publies.findIndex(p => String(p.id) === sid);
        if (idxLocal >= 0) { publies[idxLocal] = { ...publies[idxLocal], ...c }; }
        else { publies.push(c); }
        localStorage.setItem("contenu_publie", JSON.stringify(publies));
      }
    } catch(e) {}
  }

  // ── Auto-extraction URL depuis contenu si fichierUrl toujours vide ──
  if (c && !c.fichierUrl && c.contenu) {
    const m = c.contenu.match(/\[CLOUD:\s*(https?:\/\/[^\]]+)\]/);
    if (m) {
      c.fichierUrl = m[1].trim();
      // Persister dans localStorage
      try {
        const arr = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
        const idx = arr.findIndex(p => String(p.id).trim() === sid);
        if (idx >= 0) { arr[idx].fichierUrl = c.fichierUrl; localStorage.setItem("contenu_publie", JSON.stringify(arr)); }
      } catch(e) {}
    }
  }

  return c || null;
}

// Remplir l'en-tête de la page détail
function _remplirEntete(c) {
  const col = (typeof COLORS !== "undefined" && COLORS[c.mat]) || "var(--p)";
  const emo = (typeof EMOJIS !== "undefined" && EMOJIS[c.mat]) || "📘";
  const typeLabels = {
    sequencielle: "📋 Séquentielle", examen_officiel: "🏆 Officiel",
    la_zone: "🔥 La Zone", competences: "🎯 Compétences",
    cours: "📚 Cours", examen: "🏆 Examen"
  };
  const typeLabel = typeLabels[c.typeFichier] || typeLabels[c.type] || "📄 Document";
  const matNom = (c.mat || "").replace(/_/g, " ");

  const dhdr = document.querySelector(".dhdr");
  if (dhdr) dhdr.style.background = `linear-gradient(135deg,var(--p3),${col})`;
  const dtags = document.querySelector(".dtags");
  if (dtags) dtags.innerHTML = `<span class="dtag">${esc(typeLabel)}</span><span class="dtag">${esc(_classeAffichage(c.classe))}</span><span class="dtag">${esc(matNom)}</span>`;
  const dtit = document.querySelector(".dtit");
  if (dtit) dtit.textContent = c.titre || "Sans titre";
  const dsub = document.querySelector(".dsub");
  if (dsub) dsub.textContent = `${_classeAffichage(c.classe)} · ${matNom}`;
  const dmic = document.querySelector(".dmic");
  if (dmic) { dmic.style.background = col + "30"; dmic.textContent = emo; }
  const dmn = document.querySelector(".dmn");
  if (dmn) dmn.textContent = matNom;
  const dmi = document.querySelector(".dmi");
  if (dmi) dmi.textContent = c.classe || "";
}

// Construire le HTML du contenu selon le type de fichier
function _buildContenuHtml(c) {
  // ── Auto-extraction de l'URL depuis le champ contenu si fichierUrl est vide ──
  // Patterns : [CLOUD: url], [CLOUD:url], url brute cloudinary
  if (!c.fichierUrl && c.contenu) {
    const m = c.contenu.match(/\[CLOUD:\s*(https?:\/\/[^\]\s]+)/i);
    if (m) c.fichierUrl = m[1].trim();
  }
  if (!c.fichierUrl && c.contenu) {
    const m2 = c.contenu.match(/https?:\/\/res\.cloudinary\.com\/[^\s\]"']+/);
    if (m2) c.fichierUrl = m2[0].trim();
  }
  // Aussi chercher dans fichier_url brut (venant de Turso direct)
  if (!c.fichierUrl && c.fichier_url) c.fichierUrl = c.fichier_url;

  const url = _fixCloudinaryUrl(c.fichierUrl || null);
  console.log("[LearnUpr] _buildContenuHtml url=", url, "fichierType=", ft, "contenu=", (c.contenu||"").substring(0,80));

  // ── Fonction utilitaire pour deviner le type via l'extension ──
  function getTypeFromUrl(u) {
    if (!u) return null;
    const ext = u.split('?')[0].split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    return null;
  }

  const typeByExt = getTypeFromUrl(url);
  const ft = c.fichierType || c.fichier_type || "";
  const isImage = ft.startsWith('image/') || typeByExt === 'image';
  // Par défaut traiter comme PDF si on a une URL sans type connu
  const isPdf = ft === 'application/pdf' || typeByExt === 'pdf' || (url && !isImage && !ft.startsWith('video'));

  // ── Vidéo ──
  if (c.contenu?.startsWith("[VIDEO:") || c.videoUrl) {
    const videoUrl = c.videoUrl || c.contenu.replace("[VIDEO:", "").replace("]", "");
    const embedUrl = typeof convertirLienVideo === "function" ? convertirLienVideo(videoUrl) : videoUrl;
    return embedUrl
      ? `<div style="background:#000;border-radius:14px;overflow:hidden;margin-bottom:12px">
           <div style="position:relative;padding-bottom:56.25%;height:0">
             <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:none"
               allowfullscreen allow="autoplay; encrypted-media"></iframe>
           </div>
         </div>`
      : `<p style="color:var(--red);text-align:center;padding:20px">❌ Lien vidéo invalide</p>`;
  }

  // ── Image ──
  if (url && isImage) {
    return `<img src="${url}" style="max-width:100%;border-radius:12px;display:block;margin:0 auto"
                onerror="this.onerror=null;this.outerHTML='<div style=text-align:center;padding:20px;color:var(--red)>🖼️ Image inaccessible</div>'">`;
  }

  // ── PDF — Téléchargement natif + ouverture lecteur du téléphone ──
  if (url && isPdf) {
    const nom = esc(c.titre || "document");
    const btnId = "pdf-btn-" + (c.id || Math.random().toString(36).slice(2));
    const _k = _regFichier(url);
    return `
      <div style="padding:4px 0">
        <!-- Aperçu info fichier -->
        <div style="background:var(--card);border-radius:16px;border:1.5px solid var(--border);padding:20px;margin-bottom:14px;text-align:center">
          <div style="font-size:52px;margin-bottom:10px">📄</div>
          <div style="font-weight:900;font-size:15px;color:var(--text);margin-bottom:4px">${nom}</div>
          <div style="font-size:11px;color:var(--t2);font-weight:600">Fichier PDF</div>
        </div>
        <!-- Bouton principal : télécharger et ouvrir avec le lecteur natif -->
        <button id="${btnId}" onclick="_ouvrirFichierProtege('${_k}','${nom}','${btnId}')"
          style="width:100%;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:16px;padding:18px;font-weight:900;font-size:15px;cursor:pointer;min-height:56px;margin-bottom:10px;display:flex;align-items:center;justify-content:center;gap:10px">
          📥 Ouvrir le fichier
        </button>
        <!-- Bouton secondaire : ouvrir dans le navigateur -->
        <button onclick="_ouvrirFichierProtege('${_k}','${nom}',null)"
          style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:var(--card);color:var(--text);border-radius:14px;padding:13px;font-weight:700;font-size:13px;border:1.5px solid var(--border);min-height:48px;cursor:pointer">
          🌐 Ouvrir dans le navigateur
        </button>
      </div>`;
  }

  // ── Autre fichier avec URL (téléchargement) ──
  if (url) {
    const _k2 = _regFichier(url);
    return `<div style="text-align:center;padding:20px">
              <button onclick="_ouvrirFichierProtege('${_k2}','${esc(c.titre||"fichier")}',null)" class="btn1"
                style="background:var(--p);color:white;padding:12px 24px;border-radius:30px;border:none;display:inline-block;cursor:pointer">
                ⬇️ Télécharger le fichier
              </button>
            </div>`;
  }

  // ── Base64 local ──
  if (c.fichierData) {
    return `<div style="text-align:center;padding:20px">
              <a href="${c.fichierData}" download="${esc(c.titre||"document")}.pdf"
                style="background:var(--p);color:white;padding:12px 24px;border-radius:30px;text-decoration:none;display:inline-block;font-weight:800">
                ⬇️ Télécharger le PDF
              </a>
            </div>`;
  }

  // ── Texte brut ──
  if (c.contenu && !c.contenu.startsWith("[")) {
    return `<div style="white-space:pre-wrap;font-size:13px;line-height:1.9;padding:4px 0">${esc(c.contenu)}</div>`;
  }

  // ── Rien trouvé — lien Cloudinary manquant ──
  return `
    <div style="background:var(--card);border-radius:20px;padding:28px 20px;text-align:center;border:2px solid rgba(239,68,68,0.35);margin:8px 0">
      <div style="font-size:52px;margin-bottom:14px">🔗</div>
      <div style="font-weight:900;font-size:15px;color:var(--red);margin-bottom:8px">Lien du fichier manquant</div>
      <div style="font-size:12px;color:var(--t2);line-height:1.8;margin-bottom:18px">
        L'upload vers Cloudinary a échoué lors de la publication.<br>
        <b style="color:var(--text)">Ce problème vient de l'administration</b>, pas de ton côté.
      </div>
      <button onclick="(function(){
        const d=document.createElement('div');
        d.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px';
        d.innerHTML='<div style=background:var(--card);border-radius:20px;padding:22px;max-width:340px;width:100%;max-height:85vh;overflow-y:auto>' +
          '<div style=font-weight:900;font-size:16px;margin-bottom:14px>ℹ️ Pourquoi ce message ?</div>' +
          '<div style=font-size:12px;color:var(--t2);line-height:1.9>' +
          'Causes : clés Cloudinary manquantes, preset invalide, erreur réseau ou quota dépassé.<br><br>' +
          'Contacte l administrateur pour reconfigurer Cloudinary et republier le fichier.' +
          '</div>' +
          '<button onclick=this.closest(\"[style*=fixed]\").remove() style=margin-top:16px;width:100%;background:var(--p);color:white;border:none;border-radius:12px;padding:12px;font-weight:800;cursor:pointer>✕ Fermer</button>' +
          '</div>';
        d.onclick=function(e){if(e.target===d)d.remove()};
        document.body.appendChild(d);
      })()"
        style="background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:12px;padding:11px 20px;font-weight:800;font-size:12px;cursor:pointer">
        ℹ️ En savoir plus
      </button>
    </div>`;
}


function updateStats(matsCount, chapitresCount) {
  // Utiliser les vrais chiffres si fournis, sinon lire contenu_publie
  if (matsCount === undefined || chapitresCount === undefined) {
    const publies = getContenuPublie();
    const cours = publies.filter(c => c.type === "cours" && c.lycee !== "autres" && _classeMatch(c.classe, activeClasse));
    const matsUniques = [...new Set(cours.map(c => c.mat))];
    matsCount = matsUniques.length;
    chapitresCount = cours.length;
  }
  const examens = getContenuPublie().filter(c => c.type === "examen").length;
  document.getElementById("stat-matieres").textContent = (MATIERES_PAR_CLASSE[activeClasse] || MATIERES).length;
  document.getElementById("stat-examens").textContent = examens || "0";
  document.getElementById("stat-chapitres").textContent = chapitresCount;
  document.getElementById("stat-debloques").textContent = isPremium ? chapitresCount : Math.max(0, chapitresCount - getContenuPublie().filter(c=>c.type==="cours"&&_classeMatch(c.classe,activeClasse)&&c.premium).length);
}

// ========== FORMULAIRE CONTRIBUTION ==========
// ── Descriptions contextuelles par type ─────────────────────────────────────
const CF_TYPE_INFO = {
  sequencielle:    "📋 <b>Séquentielle :</b> sélectionne le numéro de séquence à l\'étape suivante (Séq. 1, Séq. 2…)",
  cours:           "📚 <b>Cours :</b> indique le numéro du chapitre concerné (Chap. 1, Chap. 2…)",
  examen_officiel: "🏆 <b>Épreuve officielle :</b> BAC / BEPC / Probatoire — indique l\'année ou le numéro d\'épreuve",
  la_zone:         "🔥 <b>La Zone :</b> indique le numéro de la fiche de révision",
  competences:     "🎯 <b>Compétences :</b> indique le numéro de l\'exercice de compétence"
};

// Labels courts pour la grille de numéros
const CF_NUM_LABEL = {
  sequencielle:    "Séq.",
  cours:           "Chap.",
  examen_officiel: "Épr.",
  la_zone:         "Fiche",
  competences:     "Ex."
};

const CF_NUM_MAX = {
  sequencielle: 6, cours: 12, examen_officiel: 10, la_zone: 10, competences: 10
};

// ── Étapes de la modal contribution ─────────────────────────────────────────
function cfGoStep(n) {
  [1,3].forEach(i => {
    const s = document.getElementById("cfStep" + i);
    if (s) s.style.display = i === n ? "block" : "none";
    const dot = document.getElementById("cfdot" + i);
    if (dot) {
      dot.className = "cf-step-dot" + (i === n ? " active" : i < n ? " done" : "");
    }
  });
  const labels = {1:"Étape 1 sur 2 — Type, classe & matière", 3:"Étape 2 sur 2 — Numéro, titre & fichier"};
  const el = document.getElementById("cfStepLabel");
  if (el) el.textContent = labels[n] || "";
}

function setCFType(type, btn) {
  cfTypeActuel = type;
  // Style boutons grille
  document.querySelectorAll(".cf-type-btn").forEach(b => b.classList.remove("active-type"));
  if (btn) btn.classList.add("active-type");
  // Info contextuelle
  const info = document.getElementById("cfTypeInfo");
  if (info) info.innerHTML = CF_TYPE_INFO[type] || "";
  // Titre step 3
  const t3 = document.getElementById("cfStep3Title");
  if (t3) t3.textContent = "Quel numéro de " + (CF_NUM_LABEL[type]||"document") + " ?";
  genererNomFichierContrib();
}

function cfSyncNumInput(val) {
  // Synchroniser la grille visuelle avec la saisie manuelle
  document.querySelectorAll(".cf-num-btn").forEach(b => {
    b.classList.toggle("selected", b.dataset.num === String(val));
  });
  genererNomFichierContrib();
  cfRafraichirRecap();
}

function cfBuildNumGrid() {
  const grid = document.getElementById("cfNumGrid");
  if (!grid) return;
  const max = CF_NUM_MAX[cfTypeActuel] || 6;
  const lbl = CF_NUM_LABEL[cfTypeActuel] || "N°";
  const currentVal = document.getElementById("cf-numero")?.value || "";
  grid.innerHTML = "";
  for (let i = 1; i <= max; i++) {
    const btn = document.createElement("button");
    btn.className = "cf-num-btn" + (String(i) === currentVal ? " selected" : "");
    btn.dataset.num = i;
    btn.innerHTML = `<div class="cf-num-n">${i}</div><div class="cf-num-lbl">${lbl} ${i}</div>`;
    btn.onclick = () => {
      document.getElementById("cf-numero").value = i;
      document.querySelectorAll(".cf-num-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      // Auto-remplir le titre si vide
      const titreEl = document.getElementById("cf-titre-contrib");
      const mat = document.getElementById("cf-mat")?.value || "";
      const classe = document.getElementById("cf-classe")?.value || "";
      const matNom = NOMS_MATIERES[mat] || mat.replace(/_/g," ");
      if (titreEl && !titreEl.value) {
        titreEl.value = `${lbl} ${i} — ${matNom} — ${classe}`;
      }
      genererNomFichierContrib();
      cfRafraichirRecap();
    };
    grid.appendChild(btn);
  }
}

function cfValidateStep2() {
  const classe = document.getElementById("cf-classe")?.value || "";
  const mat = document.getElementById("cf-mat")?.value || "";
  if (!classe) { showToast("❌ Choisis d\'abord ta classe", "error"); return; }
  if (!mat) { showToast("❌ Choisis la matière", "error"); return; }
  cfBuildNumGrid();
  // ── NUMÉRO AUTO ──
  const prochainNum = _getProchainNumeroContrib(cfTypeActuel, classe, mat);
  if (prochainNum) {
    const numEl = document.getElementById("cf-numero");
    if (numEl) {
      numEl.value = prochainNum;
      document.querySelectorAll(".cf-num-btn").forEach(b => {
        b.classList.toggle("selected", b.dataset.num === String(prochainNum));
      });
      const titreEl = document.getElementById("cf-titre-contrib");
      if (titreEl && !titreEl.value) {
        const matNom = NOMS_MATIERES[mat] || mat.replace(/_/g," ");
        const lbl = CF_NUM_LABEL[cfTypeActuel] || "N°";
        titreEl.value = `${lbl} ${prochainNum} — ${matNom} — ${classe}`;
      }
      genererNomFichierContrib();
    }
    showToast(`💡 Numéro suggéré : ${CF_NUM_LABEL[cfTypeActuel]||"N°"} ${prochainNum}`, "info");
  }
  const t3 = document.getElementById("cfStep3Title");
  if (t3) t3.textContent = "Quel numéro de " + (CF_NUM_LABEL[cfTypeActuel] || "document") + " ?";
  const numLbl = document.getElementById("cfNumLabel");
  if (numLbl) numLbl.textContent = "Ou saisis le numéro manuellement :";
  cfRafraichirRecap();
  cfGoStep(3);
}

function _getProchainNumeroContrib(type, classe, mat) {
  try {
    const allContent = JSON.parse(localStorage.getItem("contenuData") || "{}");
    const key = `${classe}_${mat}`;
    const items = (allContent[key] || []).filter(c => c.type === type);
    if (!items.length) return 1;
    const nums = items.map(c => parseInt(c.numero)||0).filter(n => n > 0);
    if (!nums.length) return 1;
    for (let i = 1; i <= Math.max(...nums) + 1; i++) {
      if (!nums.includes(i)) return i;
    }
    return Math.max(...nums) + 1;
  } catch(e) { return 1; }
}

// Reconstruit le récapitulatif affiché en live (numéro/titre peuvent changer
// sans navigation puisque l'étape 2 regroupe numéro+titre+fichier).
function cfRafraichirRecap() {
  const num = document.getElementById("cf-numero")?.value || "";
  const titre = document.getElementById("cf-titre-contrib")?.value.trim() || "";
  const classe = document.getElementById("cf-classe")?.value || "";
  const mat = document.getElementById("cf-mat")?.value || "";
  const matNom = NOMS_MATIERES[mat] || mat.replace(/_/g," ");
  const typeNoms = {sequencielle:"📋 Séquentielle", cours:"📚 Cours", examen_officiel:"🏆 Épreuve officielle", la_zone:"🔥 Fiche La Zone", competences:"🎯 Exercice Compétences"};
  const lbl = CF_NUM_LABEL[cfTypeActuel] || "N°";
  const recap = document.getElementById("cfRecapContent");
  if (recap) recap.innerHTML = [
    `<div>📁 <b>Type :</b> ${typeNoms[cfTypeActuel] || cfTypeActuel}</div>`,
    `<div>🏫 <b>Classe :</b> ${esc(classe)}</div>`,
    `<div>📝 <b>Matière :</b> ${esc(matNom)}</div>`,
    `<div>🔢 <b>Numéro :</b> ${lbl} ${esc(num || "—")}</div>`,
    `<div>✏️ <b>Titre :</b> ${esc(titre || "—")}</div>`
  ].join("");
}

// Note : la validation du numéro/titre est faite directement dans
// soumettreContribution() avant l'envoi (cf plus bas).

function updateCfMatSelectLive(classe) {
  const matSel = document.getElementById("cf-mat");
  if (!matSel) return;
  const currentVal = matSel.value;
  matSel.innerHTML = '<option value="">— Sélectionne la matière —</option>';
  const mats = (classe && MATIERES_PAR_CLASSE[classe]) ? MATIERES_PAR_CLASSE[classe] : MATIERES;
  mats.forEach(m => {
    const o = document.createElement("option");
    o.value = m;
    o.textContent = NOMS_MATIERES[m] || m.replace(/_/g," ");
    matSel.appendChild(o);
  });
  if (currentVal && mats.includes(currentVal)) matSel.value = currentVal;
}

// ── Génère un nom de fichier propre à partir des métadonnées détectées ──
// Format demandé par Jean (2026) : MATIERE_CLASSE_TYPE_ANNEE.ext
// (ex: "MATHS_TleC_EXAM_2026.pdf"). Réutilisé à la fois pour les nouveaux
// fichiers publiés via le ZIP (publierFichierZip) et par l'outil de
// nettoyage rétroactif "Renommer les fichiers existants" du panel modérateur
// (nettoyageRenommerFichiers), pour que les deux chemins produisent
// exactement la même convention de nommage. mat est le code interne (ex:
// "maths"), pas le libellé affiché — on le met en MAJUSCULES dans le nom
// final pour rester lisible et cohérent avec les codes de type existants
// (genererNomFichierContrib utilise déjà SEQ/COURS/EXAM/ZONE/COMP).
const TYPE_LABELS_FICHIER = { sequencielle: "SEQ", cours: "COURS", examen_officiel: "EXAM", la_zone: "ZONE", competences: "COMP" };

function _genererNomFichierPropre(mat, classe, type, annee, ext) {
  // mat peut être multi-classes ("Tle_C,Tle_D") — on ne garde que la PREMIÈRE
  // classe pour le nom de fichier (le nom doit rester court et lisible ; la
  // liste complète des classes reste de toute façon stockée dans le champ
  // "classe" de la base, pas dans le nom du fichier).
  const premiereClasse = (classe || "").split(",")[0].trim();
  const matCode = (mat || "AUTRE").toUpperCase();
  const classeCode = premiereClasse || "CLASSE";
  const typeCode = TYPE_LABELS_FICHIER[type] || "FICHIER";
  const anneeCode = annee || "";
  const parts = [matCode, classeCode, typeCode];
  if (anneeCode) parts.push(anneeCode);
  const nomSansExt = parts.join("_").replace(/[^A-Za-z0-9_]/g, ""); // sécurité : pas d'espace/accent/caractère spécial dans un nom de fichier
  return nomSansExt + (ext ? "." + ext.replace(/^\./, "") : "");
}

function genererNomFichierContrib() {
  const mat = document.getElementById("cf-mat")?.value || "";
  const classe = document.getElementById("cf-classe")?.value || "";
  const num = document.getElementById("cf-numero")?.value || "";
  const typeLabels = { sequencielle: "SEQ", cours: "COURS", examen_officiel: "EXAM", la_zone: "ZONE", competences: "COMP" };
  const label = typeLabels[cfTypeActuel] || "FICHIER";
  const el = document.getElementById("cf-nomAuto");
  if (!mat || !classe) { if (el) el.textContent = "— Remplis les champs ci-dessus —"; return; }
  const ts = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const nomGenere = `${label}_${classe}_${mat}${num ? "_N"+num : ""}_${ts}`;
  if (el) el.textContent = nomGenere;
}

function ouvrirContribModal() {
  // Peupler les classes dans l\'étape 2
  const claSel = document.getElementById("cf-classe");
  if (claSel && claSel.children.length <= 1) {
    classesVisibles().forEach(c => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      claSel.appendChild(o);
    });
  }
  // Pré-sélectionner la classe active
  if (claSel) claSel.value = activeClasse;
  updateCfMatSelectLive(activeClasse);
  // Réinitialiser et ouvrir à l\'étape 1
  resetContribForm();
  document.getElementById("contribModal").classList.add("show");
}


// Fix 6 : Validation fichier par magic bytes (signature réelle du fichier)
// Étendu pour reconnaître .docx / .pptx (qui sont des archives ZIP en interne).
async function validerFichierParMagicBytes(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bytes = new Uint8Array(e.target.result);
      // PDF : commence par %PDF (25 50 44 46)
      if (bytes[0]===0x25 && bytes[1]===0x50 && bytes[2]===0x44 && bytes[3]===0x46) { resolve("pdf"); return; }
      // JPEG : FF D8 FF
      if (bytes[0]===0xFF && bytes[1]===0xD8 && bytes[2]===0xFF) { resolve("jpeg"); return; }
      // PNG : 89 50 4E 47
      if (bytes[0]===0x89 && bytes[1]===0x50 && bytes[2]===0x4E && bytes[3]===0x47) { resolve("png"); return; }
      // DOCX / PPTX : ce sont des archives ZIP (50 4B 03 04) — on distingue
      // ensuite par l'extension du nom de fichier, le contenu interne n'étant
      // pas lisible sans décompression complète.
      if (bytes[0]===0x50 && bytes[1]===0x4B && bytes[2]===0x03 && bytes[3]===0x04) {
        const nom = (file.name || "").toLowerCase();
        if (nom.endsWith(".docx")) { resolve("docx"); return; }
        if (nom.endsWith(".pptx")) { resolve("pptx"); return; }
        resolve(null); return;
      }
      resolve(null); // Type non reconnu
    };
    reader.readAsArrayBuffer(file.slice(0, 8));
  });
}


async function previewFichier(input) {
  let file = input.files[0];
  if (!file) return;
  // Fix 6 : Vérifier par magic bytes (signature réelle) + MIME
  const realType = await validerFichierParMagicBytes(file);
  // Restriction élèves (2026) : seuls PDF et Word (.docx) sont acceptés dans
  // le formulaire de contribution — JPG/PNG/PPTX sont réservés au panel
  // modérateur (publierContenu / traiterZip), qui appellent leurs propres
  // fonctions de prévisualisation (previewModoFichier).
  const TYPES_AUTORISES_ELEVES = ["pdf", "docx"];
  if (!realType || !TYPES_AUTORISES_ELEVES.includes(realType)) {
    showToast("❌ Fichier invalide — formats acceptés : PDF, Word (.docx)", "error");
    input.value = "";
    return;
  }
  if (file.size > 15 * 1024 * 1024) { showToast("❌ Fichier trop lourd (max 15 Mo)", "error"); input.value = ""; return; }

  const icones = { pdf: "📄", docx: "📘" };
  document.getElementById("previewName").textContent = file.name;
  document.getElementById("previewSize").textContent = (file.size / 1024).toFixed(0) + " KB";
  document.getElementById("previewIco").textContent = icones[realType] || "📄";
  document.getElementById("cf-preview").style.display = "flex";
  document.querySelector(".upload-zone-title").textContent = "✅ Fichier sélectionné";
  const fill = document.getElementById("uploadProgressFill");
  const pct = document.getElementById("uploadProgressPct");
  if (fill) fill.style.width = "0%";
  if (pct) pct.textContent = "Prêt à être envoyé";

  // ── Auto-complétion IA (Clé 3 — usage "contrib") ──
  // Best-effort, silencieux : si Gemini n'est pas configuré pour cet usage,
  // ou si le fichier est un .docx (non analysable visuellement par Gemini),
  // ou si l'appel échoue pour n'importe quelle raison, on ne bloque jamais
  // la soumission — l'élève remplit alors les champs manuellement comme avant.
  if (realType === "pdf") {
    _iaAutoCompleterContribution(file).catch(() => {});
  }
}

// Analyse le PDF soumis par l'élève via Gemini (clé "contrib") pour suggérer
// un titre si le champ "Titre du document" est encore vide — n'écrase jamais
// une saisie déjà faite par l'élève, et reste totalement silencieux en cas
// d'échec (pas de toast d'erreur, l'auto-complétion est un bonus, pas un
// pré-requis).
async function _iaAutoCompleterContribution(file) {
  const apiKey = getGeminiKey("contrib");
  if (!apiKey) return;
  const titreInput = document.getElementById("cf-titre-contrib");
  if (titreInput && titreInput.value.trim()) return; // ne jamais écraser une saisie existante

  try {
    const base64 = await _blobEnBase64(file);
    const prompt = _construirePromptAnalyseDocument();

    // Tentative avec la clé principale — retry avec une autre clé si 429
    let texteReponse;
    try {
      texteReponse = await _appelGeminiBrut(apiKey, [
        { text: prompt },
        { inline_data: { mime_type: "application/pdf", data: base64 } }
      ]);
    } catch(e) {
      if (e.status === 429 && GEMINI_KEYS_CONTRIB.length > 1) {
        const autreCle = getGeminiKey("contrib");
        if (autreCle && autreCle !== apiKey) {
          texteReponse = await _appelGeminiBrut(autreCle, [
            { text: prompt },
            { inline_data: { mime_type: "application/pdf", data: base64 } }
          ]);
        } else throw e;
      } else throw e;
    }

    const resultat = _parserReponseGemini(texteReponse);
    if (!resultat || !resultat.titre) return;

    // Re-vérifier juste avant d'écrire (l'élève a pu taper pendant l'appel réseau)
    if (titreInput && !titreInput.value.trim()) {
      titreInput.value = resultat.titre;
      if (typeof genererNomFichierContrib === "function") genererNomFichierContrib();
      if (typeof cfRafraichirRecap === "function") cfRafraichirRecap();
      showToast("✨ Titre suggéré automatiquement — modifie-le si besoin", "info");
    }
    // Pré-remplir aussi classe/matière si l'élève ne les a pas encore choisies,
    // pour gagner du temps (l'élève reste libre de les changer).
    const classeSel = document.getElementById("cf-classe");
    if (classeSel && !classeSel.value && resultat.classes && resultat.classes.length) {
      classeSel.value = resultat.classes[0];
      updateCfMatSelectLive(resultat.classes[0]);
    }
    const matSel = document.getElementById("cf-mat");
    if (matSel && !matSel.value && resultat.matiere) {
      matSel.value = resultat.matiere;
    }
  } catch(e) {
    // Échec silencieux — l'auto-complétion est un bonus, jamais bloquant
    console.warn("[IA contrib] Gemini indisponible :", e.message);
  }
}

function annulerFichier() {
  document.getElementById("cf-fichier").value = "";
  const photoEl = document.getElementById("cf-photo");
  if (photoEl) photoEl.value = "";
  document.getElementById("cf-preview").style.display = "none";
  document.querySelector(".upload-zone-title").textContent = "Appuie ou glisse un fichier";
  document.getElementById("uploadProgressFill").style.width = "0%";
  const pct = document.getElementById("uploadProgressPct");
  if (pct) pct.textContent = "—";
}

// Change le texte de la zone d'upload pendant le survol drag & drop pour un
// feedback plus clair (au lieu de rester figé sur "Glisse ton fichier ici").
function _cfDragText(isOver) {
  const titleEl = document.querySelector("#uploadZone .upload-zone-title");
  if (!titleEl) return;
  if (isOver) {
    titleEl.dataset.prev = titleEl.textContent;
    titleEl.textContent = "📥 Lâche le fichier ici !";
  } else if (titleEl.dataset.prev) {
    titleEl.textContent = titleEl.dataset.prev;
  }
}

function handleFileDrop(e) {
  e.preventDefault();
  const zone = document.getElementById("uploadZone");
  if (zone) zone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (!file) return;
  // Restriction élèves (2026) : PDF + Word (.docx) uniquement
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  const nomMin = file.name.toLowerCase();
  const extOk = nomMin.endsWith(".pdf") || nomMin.endsWith(".docx");
  if (!allowed.includes(file.type) && !extOk) {
    showToast("❌ Formats acceptés : PDF, Word (.docx)", "error"); return;
  }
  if (file.size > 15 * 1024 * 1024) {
    showToast("❌ Fichier trop lourd (max 15 Mo)", "error"); return;
  }
  const input = document.getElementById("cf-fichier");
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
  previewFichier(input);
}

function resetContribForm() {
  annulerFichier();
  cfTypeActuel = "sequencielle";
  setCFType("sequencielle", document.getElementById("cft-seq"));
  if (document.getElementById("cf-mat")) document.getElementById("cf-mat").value = "";
  if (document.getElementById("cf-classe")) document.getElementById("cf-classe").value = "";
  if (document.getElementById("cf-numero")) document.getElementById("cf-numero").value = "";
  if (document.getElementById("cf-titre-contrib")) document.getElementById("cf-titre-contrib").value = "";
  genererNomFichierContrib();
  cfGoStep(1);
}

// ========== ANTI-DOUBLON — Vérification par titre normalisé + numéro ==========
function _normaliserTitre(t) {
  // String(t) plutôt que (t || "") : un tableau ou objet est "truthy" et
  // passerait le || tel quel, sans .toLowerCase() — c'est exactement ce qui
  // causait le crash "Erreur lecture ZIP" quand un fichier sans nom
  // exploitable produisait un titre dont le type n'était pas une vraie string.
  //
  // Cette fonction n'existe plus qu'en UN seul exemplaire dans ce fichier
  // (correctif 2026) — voir le commentaire à l'emplacement de l'ancienne
  // seconde définition, près de "OUTIL NETTOYAGE", pour le détail du bug que
  // cette fusion corrige (faux doublons quand le titre contenait des espaces).
  return String(t ?? "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // supprimer accents
    .replace(/[^a-z0-9\s]/g, "")                       // garder lettres/chiffres/espaces
    .trim()
    .replace(/\s+/g, " ");                              // espaces multiples
}

async function verifierDoublonTurso(nomFichier, mat, classe) {
  const SEPT_JOURS = 86400000 * 7;
  const maintenant = Date.now();
  const titreNorm = _normaliserTitre(nomFichier);

  // Vérif locale : même titre normalisé + matière + classe + type (7 jours)
  const existantes = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
  const doublonLocal = existantes.find(c =>
    _normaliserTitre(c.nomFichier || c.titre) === titreNorm &&
    c.mat === mat &&
    _classeMatch(c.classe, classe) &&
    c.typeFichier === cfTypeActuel &&
    c.statut !== "rejete" &&
    (maintenant - (c.date || 0)) < SEPT_JOURS
  );
  if (doublonLocal) return true;

  // Vérif aussi dans contenu_publie : même titre + mat + classe (déjà publié)
  const publies = getContenuPublie();
  const dejaPublie = publies.find(p =>
    _normaliserTitre(p.titre) === titreNorm &&
    p.mat === mat &&
    _classeMatch(p.classe, classe)
  );
  if (dejaPublie) return true;

  // Vérif Turso : par titre + mat + classe
  if (!turso) return false;
  try {
    const sevenDaysAgo = maintenant - SEPT_JOURS;
    const res = await turso.execute({
      sql: "SELECT id FROM contributions WHERE LOWER(TRIM(nom_fichier))=LOWER(TRIM(?)) AND mat=? AND classe=? AND statut != 'rejete' AND date > ? LIMIT 1",
      args: [nomFichier, mat, classe, sevenDaysAgo]
    });
    return res.rows.length > 0;
  } catch(e) { return false; }
}

// ========== FIX #5 : ENVOI VERS GROUPE WHATSAPP — Message copiable ==========
function envoyerVersGroupeWhatsApp(contribution) {
  const typeLabels = { sequencielle: "Séquentielle", cours: "Cours", examen_officiel: "Épreuve officielle", la_zone: "La Zone", competences: "Compétences" };
  const type = typeLabels[contribution.typeFichier] || contribution.typeFichier;
  const msg = `🔔 *Nouvelle contribution LearnUpr*\n\n📁 Type : ${type}\n📚 Matière : ${contribution.mat.replace(/_/g," ")}\n🏫 Classe : ${contribution.classe}\n📛 Fichier : ${contribution.nomFichier}\n👤 Auteur : ${contribution.auteur}\n⏰ Date : ${new Date(contribution.date).toLocaleString("fr-FR")}\n\n✅ Ouvre le panel modérateur pour valider.`;

  // Créer un modal copiable au lieu d'ouvrir wa.me (qui ouvre un chat privé)
  const existing = document.getElementById("waMessageModal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "waMessageModal";
  modal.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";
  modal.innerHTML = `
    <div style="background:var(--card);border-radius:20px;padding:22px;width:100%;max-width:400px;max-height:90vh;overflow-y:auto">
      <div style="font-weight:800;font-size:14px;color:var(--p);margin-bottom:4px">📋 Message pour le groupe WhatsApp</div>
      <div style="font-size:11px;color:var(--t3);margin-bottom:12px">Copie ce message et colle-le dans ton groupe WhatsApp modérateur</div>
      <textarea id="waMsg" readonly style="width:100%;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:12px;font-size:16px;line-height:1.7;height:180px;color:var(--text);resize:none;font-family:'Inter',sans-serif">${msg}</textarea>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button onclick="
          const ta = document.getElementById('waMsg');
          ta.select(); ta.setSelectionRange(0,99999);
          navigator.clipboard?.writeText(ta.value).then(()=>showToast('✅ Message copié !','success')).catch(()=>{document.execCommand('copy');showToast('✅ Copié !','success')});
        " style="flex:1;background:linear-gradient(135deg,#25D366,#128C7E);color:white;border:none;border-radius:12px;padding:12px;font-weight:800;font-size:13px;cursor:pointer">📋 Copier</button>
        ${WHATSAPP_GROUP_LINK.includes("REMPLACE") ? "" : `<button onclick="window.open('${WHATSAPP_GROUP_LINK}','_blank')" style="flex:1;background:#128C7E;color:white;border:none;border-radius:12px;padding:12px;font-weight:700;font-size:12px;cursor:pointer">💬 Ouvrir groupe</button>`}
        <button onclick="document.getElementById('waMessageModal').remove()" style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:12px;font-weight:700;font-size:12px;cursor:pointer;color:var(--text)">✕</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

async function soumettreContribution() {
  // Anti-spam : max 5 contributions par heure
  if (!verifierAntiSpam()) return;

  const mat = document.getElementById("cf-mat").value;
  const classe = document.getElementById("cf-classe").value;
  const numero = document.getElementById("cf-numero")?.value || "";
  const titreManuel = document.getElementById("cf-titre-contrib")?.value.trim() || "";
  const fileInput = document.getElementById("cf-fichier");
  const file = fileInput.files[0];

  if (!mat) { showToast("❌ Choisis une matière", "error"); cfGoStep(1); return; }
  if (!classe) { showToast("❌ Choisis une classe", "error"); cfGoStep(1); return; }
  if (!numero) { showToast("❌ Indique le numéro", "error"); cfGoStep(3); return; }
  if (!file) { showToast("❌ Ajoute un fichier (PDF ou Word)", "error"); return; }

  // Vérifier type du fichier — restriction élèves (2026) : PDF + Word (.docx) uniquement
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  const nomMin = file.name.toLowerCase();
  const extOk = nomMin.endsWith(".pdf") || nomMin.endsWith(".docx");
  if (!allowed.includes(file.type) && !extOk) {
    showToast("❌ Formats acceptés : PDF, Word (.docx)", "error"); return;
  }
  if (file.size > 15 * 1024 * 1024) {
    showToast("❌ Fichier trop lourd (max 15 Mo)", "error"); return;
  }

  // Générer le nom automatique avec numéro
  const typeLabels = { sequencielle: "SEQ", cours: "COURS", examen_officiel: "EXAM", la_zone: "ZONE", competences: "COMP" };
  const label = typeLabels[cfTypeActuel] || "FICHIER";
  const ts = new Date().toISOString().slice(0,10).replace(/-/g,"");
  const nomFichier = `${label}_${classe}_${mat}_N${numero}_${ts}`;
  const titreContrib = titreManuel || `${CF_NUM_LABEL[cfTypeActuel]||"N°"} ${numero} — ${NOMS_MATIERES[mat]||mat} — ${classe}`;

  // Anti-doublon (vérification existante : nom de fichier + fenêtre temporelle)
  const estDoublon = await verifierDoublonTurso(nomFichier, mat, classe);
  if (estDoublon) {
    showToast("⚠️ Un fichier similaire a déjà été soumis récemment", "error");
    return;
  }

  // ── Anti-doublon par similarité de titre (Clé 2 Gemini, demande Jean 2026) ──
  // Compare le titre de la contribution à tout le contenu déjà publié dans la
  // même matière. Seul le rejet AUTOMATIQUE (≥80% similaire) bloque ici, avant
  // l'upload — la "zone grise" (55-80%) n'empêche pas la soumission normale,
  // mais signale la contribution pour vérification manuelle (voir plus bas,
  // une fois le fichier réellement uploadé et son id connu).
  showToast("🔍 Vérification anti-doublon...", "info");
  const verifDoublonTitre = await verifierDoublonAvantPublicationRapide(titreContrib, mat, classe);
  if (verifDoublonTitre.niveau === "doublon") {
    showToast(`⚠️ Doublon détecté — un contenu très similaire ("${(verifDoublonTitre.contenuSimilaire?.titre||"").slice(0,40)}") existe déjà`, "error");
    return;
  }

  // Upload Cloudinary — l'id provisoire est créé maintenant pour la propagation automatique
  const _contribIdTemp = Date.now();
  let fichierUrl = await uploadToCloudinary(file, _contribIdTemp);
  let fichierData = null;
  if (!fichierUrl) {
    // Upload Cloudinary échoué — stocker en base64 local (fallback)
    showToast("⚠️ Fichier stocké localement (non accessible par les autres élèves)", "info");
    fichierData = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  // Vérifier si l'utilisateur est modérateur ou admin → publication directe
  const currentPhone = localStorage.getItem("userPhone") || "";
  const cachedRole = localStorage.getItem("userRole") || "user";
  const estModo = cachedRole === "admin" || cachedRole === "moderator" || MODERATORS_PHONES.includes(currentPhone);

  // Signale la contribution si elle est en "zone grise" de similarité (55-80%)
  // — n'a aucun effet si verifDoublonTitre était "nouveau" (cas normal), et
  // ne bloque jamais la soumission. Le flag local "doublonPotentiel" permet
  // au panel modérateur d'afficher un badge ⚠️ sur cette contribution dans la
  // liste habituelle des contributions en attente.
  if (verifDoublonTitre.niveau === "zone_grise") {
    signalerSiZoneGriseDoublon(verifDoublonTitre, { mat, classe, type: "contribution_eleve", contribId: _contribIdTemp });
  }

  const contribution = {
    id: _contribIdTemp,
    mat, classe,
    titre: titreContrib,
    numero: parseInt(numero) || null,
    nomFichier,
    typeFichier: cfTypeActuel,
    contenu: fichierUrl ? `[CLOUD: ${fichierUrl}]` : `[FICHIER: ${file.name}]`,
    fichierData: fichierUrl ? null : fichierData,
    fichierUrl,
    fichierType: file.type,
    fichierNom: file.name,
    auteur: currentPhone || "Anonyme",
    date: Date.now(),
    statut: estModo ? "approuve" : "en_attente",
    doublonPotentiel: verifDoublonTitre.niveau === "zone_grise"
  };

  // Sauvegarder localement (IndexedDB)
  if (db) {
    await new Promise(resolve => {
      const tx = db.transaction(["contributions"], "readwrite");
      tx.objectStore("contributions").put(contribution);
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    }).catch(() => {});
  }

  // localStorage (sans binaire)
  const existantes = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
  existantes.push({ ...contribution, fichierData: null });
  localStorage.setItem("contributions_locales", JSON.stringify(existantes));

  // Turso (avec type_fichier)
  if (turso) {
    try {
      await turso.execute({
        sql: "INSERT INTO contributions (mat, classe, titre, nom_fichier, type_fichier, contenu, fichier_url, auteur, date, statut) VALUES (?,?,?,?,?,?,?,?,?,?)",
        args: [mat, classe, titreContrib, nomFichier, cfTypeActuel, contribution.contenu, fichierUrl || "", contribution.auteur, contribution.date, "en_attente"]
      });
    } catch(e) { console.warn("Turso contrib insert:", e); }
  }

  // Si modérateur/admin → publier directement sans validation
  if (estModo) {
    const typeMap = {
      cours: "cours", sequencielle: "sequencielle", examen_officiel: "examen",
      la_zone: "la_zone", competences: "competences", examen: "examen", video: "video"
    };
    const vraiType = typeMap[cfTypeActuel] || "examen";
    const typeLabels2 = { cours:"Cours", sequencielle:"Séquences", examen:"Examens", la_zone:"La Zone", competences:"Compétences" };
    const publies = getContenuPublie();
    const numeroType = publies.filter(p => p.type === vraiType && p.mat === mat && _classeMatch(p.classe, classe)).length + 1;
    const newEntry = {
      id: Date.now() + 1, type: vraiType, typeFichier: cfTypeActuel,
      mat, classe, titre: titreContrib, numero: numeroType,
      contenu: contribution.contenu, fichierUrl: fichierUrl || null,
      fichierData: fichierData || null, fichierType: file.type,
      premium: false, auteur: contribution.auteur, date: Date.now()
    };
    publies.push(newEntry);
    localStorage.setItem("contenu_publie", JSON.stringify(publies));
    if (turso) {
      try {
        await turso.execute({
          sql: "INSERT INTO contenu (type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,lycee,premium,auteur,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
          args: [vraiType, cfTypeActuel, mat, classe, titreContrib, numeroType, contribution.contenu, fichierUrl||"", "principal", 0, contribution.auteur, newEntry.date]
        });
      } catch(e) {}
    }
    showToast(`✅ Publié directement dans ${typeLabels2[vraiType]||"Contenu"} !`, "success");
    addNotification("✅ Contenu publié", `Classé dans ${typeLabels2[vraiType]||vraiType} > ${classe} > ${NOMS_MATIERES[mat]||mat}`, "success");
    document.getElementById("contribModal").classList.remove("show");
    renderContent();
    return;
  }

  // Envoyer vers groupe WhatsApp modérateurs
  setTimeout(() => envoyerVersGroupeWhatsApp(contribution), 500);

  // FIX #4 : Compter UNIQUEMENT les contributions avec statut "approuve"
  const nbContribsApprouves = existantes.filter(c => c.auteur === contribution.auteur && c.statut === "approuve").length;
  if (nbContribsApprouves > 0) {
    addNotification("📊 Progression", `${nbContribsApprouves}/10 contributions approuvées`, "info");
  }
  addNotification("📤 Contribution envoyée", `"${nomFichier}" est en attente de validation`, "success");
  showToast(`✅ Soumis ! Les modérateurs vont vérifier 📋`, "success");

  document.getElementById("contribModal").classList.remove("show");
  chargerContributionsEnAttente();
}

// ========== UPLOAD CLOUDINARY ==========
async function uploadToCloudinary(file, _contribId) {
  // Recharger depuis la config si variables vides
  // Recharger depuis toutes les sources disponibles
  if (!CLOUDINARY_URL || !CLOUDINARY_PRESET) {
    // Source 1 : _getCfg (localStorage / embedded)
    const cfg    = _getCfg ? _getCfg("cloudinaryUrl")    : null;
    const preset = _getCfg ? _getCfg("cloudinaryPreset") : null;
    if (cfg)    CLOUDINARY_URL    = cfg;
    if (preset) CLOUDINARY_PRESET = preset;
  }
  if (!CLOUDINARY_URL || !CLOUDINARY_PRESET) {
    // Source 2 : champs du modal config (si ouvert)
    const cfgInput    = document.getElementById("cfg-cloudinaryUrl");
    const presetInput = document.getElementById("cfg-cloudinaryPreset");
    if (cfgInput?.value)    CLOUDINARY_URL    = cfgInput.value.trim();
    if (presetInput?.value) CLOUDINARY_PRESET = presetInput.value.trim();
  }
  if (!CLOUDINARY_URL || !CLOUDINARY_PRESET) {
    // Source 3 : localStorage en clair (sauvegardé par sauvegarderConfigSecurisee)
    const cldUrl    = localStorage.getItem("_cld_url");
    const cldPreset = localStorage.getItem("_cld_preset");
    if (cldUrl)    CLOUDINARY_URL    = cldUrl;
    if (cldPreset) CLOUDINARY_PRESET = cldPreset;
  }
  if (!CLOUDINARY_URL || !CLOUDINARY_PRESET) {
    alert("⚠️ Cloudinary non configuré !\n\nVa dans : Profil → 🔐 Configurer les clés secrètes\nEt remplis :\n- URL Cloudinary : https://api.cloudinary.com/v1_1/TON_CLOUD/image/upload\n- Preset : learnupr");
    return null;
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_PRESET);
  formData.append("folder", "learnup");

  // ── Adapter l'URL selon le type de fichier ──
  // Les PDFs, fichiers Word (.docx) et PowerPoint (.pptx) doivent utiliser
  // /raw/upload/ (pas /image/upload/), car ce ne sont pas des images.
  let uploadUrl = CLOUDINARY_URL;
  const nomMin = (file.name || "").toLowerCase();
  const isRawFile = file.type === 'application/pdf' || nomMin.endsWith('.pdf')
    || nomMin.endsWith('.docx') || nomMin.endsWith('.pptx')
    || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (isRawFile && uploadUrl.includes('/image/upload')) {
    uploadUrl = uploadUrl.replace('/image/upload', '/raw/upload');
  } else if (isRawFile && !uploadUrl.includes('/raw/upload') && uploadUrl.includes('/upload')) {
    uploadUrl = uploadUrl.replace('/upload', '/raw/upload');
  }

  // ── Upload via XMLHttpRequest pour disposer d'une vraie progression ──
  // (fetch() ne permet pas de suivre l'avancement de l'envoi ; XHR le permet
  // via xhr.upload.onprogress, ce qui pilote la barre de progression réelle.)
  const fill = document.getElementById("uploadProgressFill");
  const pct = document.getElementById("uploadProgressPct");
  const setProgress = (p) => {
    if (fill) fill.style.width = p + "%";
    if (pct) pct.textContent = p < 100 ? `Envoi en cours… ${p}%` : "Vérification…";
  };
  setProgress(0);
  showToast("📤 Upload en cours...", "info");

  let data;
  try {
    data = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl, true);
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const p = Math.round((ev.loaded / ev.total) * 100);
          setProgress(p);
        }
      };
      xhr.onload = () => {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch(je) { reject(new Error("Réponse invalide (HTTP " + xhr.status + ")")); }
      };
      xhr.onerror = () => reject(new Error("Erreur réseau"));
      xhr.send(formData);
    });
  } catch(e) {
    const reason = e.message || "Erreur réseau";
    showToast("❌ Cloudinary réseau : " + reason, "error");
    alert("❌ Erreur réseau Cloudinary\n\n" + reason + "\n\nURL utilisée : " + CLOUDINARY_URL + "\nPreset : " + CLOUDINARY_PRESET);
    return null;
  }

  try {
    if (data.secure_url) {
      const url = data.secure_url;
      setProgress(100);

      // ── Vérification accessibilité du fichier uploadé ──
      showToast("🔍 Vérification du fichier...", "info");
      try {
        const check = await Promise.race([
          fetch(url, { method: "HEAD" }),
          new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 6000))
        ]);
        if (!check.ok) {
          showToast("⚠️ Fichier uploadé mais non accessible (HTTP " + check.status + ") — vérifie les paramètres Cloudinary", "error");
          return null;
        }
      } catch(checkErr) {
        // Si HEAD bloqué par CORS, on continue quand même
        console.warn("Vérification HEAD impossible:", checkErr.message);
      }

      const shortUrl = url.length > 50 ? url.substring(0, 50) + "…" : url;
      showToast("✅ Upload réussi et fichier accessible !", "success");
      if (pct) pct.textContent = "✅ Envoyé";

      // ── Propagation automatique dans tous les stores ──
      _propagateCloudinaryUrl(url, file.name, _contribId);

      return url;
    }
    const reason = data.error?.message || data.message || "réponse Cloudinary invalide";
    // Afficher détail complet pour diagnostic
    console.error("[Cloudinary] Réponse complète:", JSON.stringify(data));
    showToast("❌ Cloudinary : " + reason + " (URL: " + CLOUDINARY_URL.substring(0,50) + " | Preset: " + CLOUDINARY_PRESET + ")", "error");
    // Afficher dans un alert pour voir sur mobile
    alert("❌ Erreur Cloudinary\n\nRaison : " + reason + "\nURL : " + CLOUDINARY_URL + "\nPreset : " + CLOUDINARY_PRESET + "\n\nRéponse : " + JSON.stringify(data).substring(0,200));
    return null;
  } catch(e) {
    const reason = e.message || "Erreur inattendue";
    showToast("❌ Cloudinary : " + reason, "error");
    return null;
  }
}

/**
 * _propagateCloudinaryUrl — met à jour automatiquement l'URL Cloudinary
 * dans tous les stores (localStorage contenu_publie, contributions_locales, Turso)
 * dès que l'upload réussit, sans intervention manuelle.
 *
 * @param {string} url        - URL sécurisée renvoyée par Cloudinary
 * @param {string} fileName   - nom d'origine du fichier (pour matcher)
 * @param {number|null} id    - id de la contribution/contenu si déjà connu
 */
function _propagateCloudinaryUrl(url, fileName, id) {
  try {
    // ── 1. Mettre à jour contenu_publie ──
    const publies = getContenuPublie();
    let updatedPublies = false;
    for (const p of publies) {
      const match = (id && p.id == id) ||
                    (!p.fichierUrl && p.fichierNom === fileName) ||
                    (!p.fichierUrl && (p.contenu || "").includes(fileName));
      if (match) {
        p.fichierUrl  = url;
        p.fichierData = null;                    // libérer le base64 pour économiser de l'espace
        p.contenu     = `[CLOUD: ${url}]`;
        updatedPublies = true;
      }
    }
    if (updatedPublies) {
      localStorage.setItem("contenu_publie", JSON.stringify(publies));
    }

    // ── 2. Mettre à jour contributions_locales ──
    const contribs = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
    let updatedContribs = false;
    for (const c of contribs) {
      const match = (id && c.id == id) ||
                    (!c.fichierUrl && c.fichierNom === fileName) ||
                    (!c.fichierUrl && (c.contenu || "").includes(fileName));
      if (match) {
        c.fichierUrl  = url;
        c.fichierData = null;
        c.contenu     = `[CLOUD: ${url}]`;
        updatedContribs = true;
      }
    }
    if (updatedContribs) {
      localStorage.setItem("contributions_locales", JSON.stringify(contribs));
    }

    // ── 3. Mettre à jour Turso de façon asynchrone (sans bloquer) ──
    if (turso && url) {
      (async () => {
        try {
          // Mettre à jour la table contenu
          if (updatedPublies) {
            await turso.execute({
              sql: "UPDATE contenu SET fichier_url=?, contenu='[CLOUD: '||?||']' WHERE fichier_url='' OR fichier_url IS NULL AND (fichier_nom=? OR contenu LIKE ?)",
              args: [url, url, fileName, "%" + fileName + "%"]
            });
          }
          // Mettre à jour la table contributions
          await turso.execute({
            sql: "UPDATE contributions SET fichier_url=?, contenu='[CLOUD: '||?||']' WHERE (fichier_url='' OR fichier_url IS NULL) AND (nom_fichier=? OR contenu LIKE ?)",
            args: [url, url, fileName, "%" + fileName + "%"]
          });
        } catch(e) {
          console.warn("[LearnUpr] Propagation Turso partielle :", e.message);
        }
      })();
    }
  } catch(e) {
    console.warn("[LearnUpr] _propagateCloudinaryUrl :", e.message);
  }
}


// ========== CONTRIBUTIONS EN ATTENTE ==========
// BUG 4 FIX: Lire les contributions depuis IndexedDB
async function _lireContributionsIndexedDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open("learnupr_contributions", 1);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("pending_contribs")) {
          db.createObjectStore("pending_contribs", { keyPath: "id" });
        }
      };
      req.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("pending_contribs")) { db.close(); resolve([]); return; }
        const tx = db.transaction("pending_contribs", "readonly");
        const all = tx.objectStore("pending_contribs").getAll();
        all.onsuccess = () => { db.close(); resolve(all.result || []); };
        all.onerror = () => { db.close(); resolve([]); };
      };
      req.onerror = () => resolve([]);
    } catch(e) { resolve([]); }
  });
}


async function chargerContributionsEnAttente() {
  const container = document.getElementById("pendingContributionsList");
  if (!container) return;
  container.innerHTML = `<div class="empty-state pulse">⏳ Chargement...</div>`;

  // BUG 4 FIX: Restaurer d'abord les contributions depuis IndexedDB
  try {
    const idbContribs = await _lireContributionsIndexedDB();
    if (idbContribs.length > 0) {
      const existing = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
      const existingIds = new Set(existing.map(c => String(c.id)));
      const nouvelles = idbContribs.filter(c => !existingIds.has(String(c.id)));
      if (nouvelles.length > 0) {
        localStorage.setItem("contributions_locales", JSON.stringify([...existing, ...nouvelles]));
      }
    }
  } catch(e) {}

  const locales = JSON.parse(localStorage.getItem("contributions_locales") || "[]").filter(c => c.statut === "en_attente");
  const pendingCountEl = document.getElementById("pendingCount");
  const phone = localStorage.getItem("userPhone") || "";
  const cachedRole = localStorage.getItem("userRole") || "";
  const canModerate = cachedRole === "admin" || cachedRole === "moderator" || MODERATORS_PHONES.includes(phone);

  if (!turso) {
    if (locales.length === 0) {
      container.innerHTML = `<div class="empty-state">✅ Aucune contribution en attente</div>`;
      if (pendingCountEl) pendingCountEl.classList.add("hidden");
      return;
    }
    if (pendingCountEl) { pendingCountEl.textContent = locales.length; pendingCountEl.classList.remove("hidden"); }
    container.innerHTML = locales.map(row => `
      <div class="resource-item">
        <div style="flex:1">
          <div style="font-weight:700;font-size:12px">${esc(row.titre || row.nomFichier || "Sans titre")}</div>
          <div style="font-size:10px;color:var(--t3)">${esc(row.mat)} · ${esc(row.classe)} · ${esc(row.typeFichier || "")} · ${new Date(row.date).toLocaleDateString("fr-FR")}</div>
        </div>
        ${canModerate ? `<div style="display:flex;gap:6px">
          <button onclick="validerContribution(${Number(row.id)})" style="background:var(--p);color:white;border:none;border-radius:8px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer">✅</button>
          <button onclick="rejeterContribution(${Number(row.id)})" style="background:var(--red);color:white;border:none;border-radius:8px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer">❌</button>
        </div>` : `<span class="chip orange">En attente</span>`}
      </div>`).join("");
    return;
  }

  try {
    const res = await turso.execute({ sql: "SELECT * FROM contributions WHERE statut = 'en_attente' ORDER BY date DESC LIMIT 20", args: [] });
    const localIds = new Set(locales.map(c => String(c.id)));
    const tursoRows = (res.rows || []).filter(r => !localIds.has(String(r.id)));
    const rows = [...locales, ...tursoRows];

    if (pendingCountEl) {
      if (rows.length > 0) { pendingCountEl.textContent = rows.length; pendingCountEl.classList.remove("hidden"); }
      else pendingCountEl.classList.add("hidden");
    }

    if (rows.length === 0) { container.innerHTML = `<div class="empty-state">✅ Aucune contribution en attente</div>`; return; }
    container.innerHTML = rows.map(row => {
      // Fix 21: masquer le numéro pour les modérateurs — afficher pseudo ou anonyme
      const auteurAffiche = String(row.auteur || "").replace(/(\d{3})\d{3}(\d{3})/, "$1***$2");
      return `
      <div class="resource-item">
        <div style="flex:1">
          <div style="font-weight:700;font-size:12px">${esc(row.titre || row.nom_fichier || "Sans titre")}</div>
          <div style="font-size:10px;color:var(--t3)">${esc(auteurAffiche)} — ${esc(row.type_fichier || row.typeFichier || "")} — ${row.date ? new Date(row.date).toLocaleDateString("fr-FR") : ""}</div>
        </div>
        ${canModerate ? `<div style="display:flex;gap:6px">
          <button onclick="validerContribution('${Number(row.id)}')" style="background:var(--p);color:white;border:none;border-radius:8px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer">✅</button>
          <button onclick="rejeterContribution('${Number(row.id)}')" style="background:var(--red);color:white;border:none;border-radius:8px;padding:5px 10px;font-size:10px;font-weight:700;cursor:pointer">❌</button>
        </div>` : `<span class="chip orange">En attente</span>`}
      </div>`;
    }).join("");
  } catch(e) {
    container.innerHTML = `<div class="empty-state">✅ Aucune contribution en attente</div>`;
  }
}

async function validerContribution(id) {
  // Local
  const locales = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
  const idx = locales.findIndex(c => c.id == id);
  let auteurPhone = null;
  let contrib = null;
  if (idx !== -1) {
    auteurPhone = locales[idx].auteur;
    contrib = locales[idx];
    locales[idx].statut = "approuve";
    localStorage.setItem("contributions_locales", JSON.stringify(locales));
  }

  if (turso) {
    try {
      const row = await turso.execute({ sql: "SELECT * FROM contributions WHERE id=?", args: [id] });
      if (row.rows[0]) {
        if (!auteurPhone) auteurPhone = row.rows[0].auteur;
        if (!contrib) contrib = {
          mat: row.rows[0].mat, classe: row.rows[0].classe, titre: row.rows[0].titre,
          typeFichier: row.rows[0].type_fichier, contenu: row.rows[0].contenu,
          fichierUrl: row.rows[0].fichier_url, auteur: row.rows[0].auteur
        };
      }
      await turso.execute({ sql: "UPDATE contributions SET statut='approuve' WHERE id=?", args: [id] });
    } catch(e) {}
  }

  // Fix 24 : Vérification doublon renforcée avant publication
  if (contrib) {
    const publies = getContenuPublie();
    const dejaPublie = publies.find(p =>
      _normaliserTitre(p.titre) === _normaliserTitre(contrib.titre) &&
      p.mat === contrib.mat &&
      _classeMatch(p.classe, contrib.classe)
    );
    let dejaPublieTurso = false;
    if (turso && !dejaPublie) {
      try {
        const dupRes = await turso.execute({
          sql: "SELECT id FROM contenu WHERE LOWER(TRIM(titre))=LOWER(TRIM(?)) AND mat=? AND classe=? LIMIT 1",
          args: [(contrib.titre||"").trim(), contrib.mat, contrib.classe]
        });
        dejaPublieTurso = dupRes.rows.length > 0;
      } catch(e) {}
    }
    if (dejaPublie || dejaPublieTurso) {
      showToast("⚠️ Ce contenu est déjà publié (doublon détecté)", "error");
      return;
    }
    // FIX : Mapper le type correctement pour que le contenu se classe au bon endroit
    const typeMap = {
      cours: "cours",
      sequencielle: "sequencielle",
      examen_officiel: "examen",
      la_zone: "la_zone",
      competences: "competences",
      examen: "examen",
      video: "video"
    };
    const vraiType = typeMap[contrib.typeFichier] || typeMap[contrib.type] || "examen";

    // Calculer le bon numéro selon le type réel
    const numeroType = publies.filter(p =>
      p.type === vraiType && p.mat === contrib.mat && _classeMatch(p.classe, contrib.classe)
    ).length + 1;

    // Nom de la section pour la notification
    const typeLabels = {
      cours: "Cours", sequencielle: "Séquences", examen: "Examens",
      la_zone: "La Zone", competences: "Compétences"
    };
    const sectionLabel = typeLabels[vraiType] || "Contenu";

    const newEntry = {
      id: Date.now(),
      type: vraiType,
      typeFichier: contrib.typeFichier || contrib.type || "examen_officiel",
      mat: contrib.mat,
      classe: contrib.classe,
      titre: contrib.titre,
      numero: numeroType,
      contenu: contrib.contenu,
      fichierUrl: contrib.fichierUrl || null,
      fichierData: contrib.fichierData || null,
      fichierType: contrib.fichierType || null,
      premium: false,
      auteur: contrib.auteur,
      date: Date.now()
    };
    publies.push(newEntry);
    localStorage.setItem("contenu_publie", JSON.stringify(publies));

    // Si l'URL Cloudinary est présente, la propager dans tous les stores
    if (newEntry.fichierUrl) {
      _propagateCloudinaryUrl(newEntry.fichierUrl, contrib.fichierNom || "", newEntry.id);
    }

    // Insérer dans Turso avec le bon type
    if (turso) {
      try {
        await turso.execute({
          sql: "INSERT INTO contenu (type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,lycee,premium,auteur,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
          args: [vraiType, newEntry.typeFichier, newEntry.mat, newEntry.classe, newEntry.titre, newEntry.numero, newEntry.contenu || "", newEntry.fichierUrl || "", "principal", 0, newEntry.auteur, newEntry.date]
        });
      } catch(e) {}
    }

    showToast(`✅ Contribution approuvée — classée dans ${sectionLabel} !`, "success");
    addNotification("✅ Contribution validée", `La contribution #${id} a été approuvée et classée dans ${sectionLabel} > ${contrib.classe} > ${NOMS_MATIERES[contrib.mat]||contrib.mat}`, "success");

    // FIX #4 : Vérifier si l'auteur atteint 10 contributions approuvées → Premium offert
    if (auteurPhone) {
      let approuveesCount = locales.filter(c => c.auteur === auteurPhone && c.statut === "approuve").length;
      if (turso) {
        try {
          const r = await turso.execute({ sql: "SELECT COUNT(*) as n FROM contributions WHERE auteur=? AND statut='approuve'", args: [auteurPhone] });
          approuveesCount = Number(r.rows[0]?.n) || approuveesCount;
        } catch(e) {}
      }
      if (approuveesCount > 0 && approuveesCount % 10 === 0) {
        if (turso) {
          try { await turso.execute({ sql: "UPDATE users SET is_premium=1 WHERE phone=?", args: [auteurPhone] }); } catch(e) {}
        }
        const currentPhone = localStorage.getItem("userPhone") || "";
        if (currentPhone === auteurPhone) {
          isPremium = true; localStorage.setItem("isPremium", "true");
          showToast("🎁 10 contributions approuvées ! 1 semaine Premium offerte !", "success");
          addNotification("🎁 Premium offert !", "10 contributions approuvées — 1 semaine Premium gratuite !", "success");
          updateProfilStatus(); renderContent();
        }
      }
    }
  } // fin if (contrib)

  chargerContributionsEnAttente();
  renderContent();
}

async function rejeterContribution(id) {
  // Local
  const locales = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
  const filtered = locales.filter(c => c.id != id);
  localStorage.setItem("contributions_locales", JSON.stringify(filtered));

  if (turso) {
    try { await turso.execute({ sql: "UPDATE contributions SET statut='rejete' WHERE id=?", args: [id] }); } catch(e) {}
  }
  showToast("🗑️ Contribution rejetée", "error");
  chargerContributionsEnAttente();
}

// ========== NOTIFICATIONS ==========
function addNotification(title, text, type = "info") {
  const n = { id: Date.now(), title, text, type, time: Date.now(), read: false };
  notifications.unshift(n);
  if (notifications.length > 50) notifications = notifications.slice(0, 50);
  localStorage.setItem("notifications", JSON.stringify(notifications));
  updateNotifBadge();
}

function updateNotifBadge() {
  const unread = notifications.filter(n => !n.read).length;
  const badge = document.getElementById("notifBadge");
  const dot = document.getElementById("navNotifDot");
  if (unread > 0) {
    badge.textContent = unread > 9 ? "9+" : unread;
    badge.classList.remove("hidden");
    if (dot) dot.classList.add("show");
  } else {
    badge.classList.add("hidden");
    if (dot) dot.classList.remove("show");
  }
}

function renderNotifications() {
  const container = document.getElementById("notifsList");
  if (!container) return;
  if (notifications.length === 0) {
    container.innerHTML = `<div class="empty">🔔 Aucune notification</div>`;
    return;
  }
  const icons = { success: "✅", error: "❌", info: "ℹ️", default: "🔔" };
  container.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.read ? "" : "unread"}" onclick="markRead(${n.id})">
      <div class="notif-ico">${icons[n.type] || "🔔"}</div>
      <div class="notif-content">
        <div class="notif-title">${n.title}</div>
        <div class="notif-text">${n.text}</div>
        <div class="notif-time">${formatRelativeTime(n.time)}</div>
      </div>
      ${!n.read ? '<div class="notif-dot"></div>' : ''}
    </div>`).join("");
}

function markRead(id) {
  const n = notifications.find(n => n.id == id);
  if (n) { n.read = true; localStorage.setItem("notifications", JSON.stringify(notifications)); }
  renderNotifications();
  updateNotifBadge();
}

function supprimerToutesNotifs() {
  if (!notifications.length) { showToast("Aucune notification à supprimer", "info"); return; }
  notifications = [];
  localStorage.setItem("notifications", JSON.stringify(notifications));
  updateNotifBadge();
  renderNotifications();
  showToast("🗑️ Toutes les notifications supprimées", "success");
}

function markAllRead() {
  notifications.forEach(n => n.read = true);
  localStorage.setItem("notifications", JSON.stringify(notifications));
  renderNotifications();
  updateNotifBadge();
  showToast("✅ Tout marqué comme lu", "success");
}

function formatRelativeTime(ts) {
  const now = Date.now(); // Bug 4: always use Date.now() for consistent timezone
  const diff = now - Number(ts);
  if (diff < 0 || diff < 60000) return "À l'instant";
  if (diff < 3600000) return `Il y a ${Math.floor(diff/60000)} min`;
  if (diff < 86400000) return `Il y a ${Math.floor(diff/3600000)} h`;
  if (diff < 604800000) return `Il y a ${Math.floor(diff/86400000)} j`;
  return new Date(Number(ts)).toLocaleDateString("fr-FR");
}

// ========== CHAPITRE DETAIL ==========
function viewChapter(id, mat, lock) {
  if (lock) { openModal(); return; }
  currentChapterId = id + "_" + mat;
  const matLabel = mat.replace(/_/g, " ");
  const bg = COLORS[mat] || "var(--p)";
  const emo = EMOJIS[mat] || "📘";
  document.querySelector(".dhdr").style.background = `linear-gradient(135deg,var(--p3),${bg})`;
  document.querySelector(".dtags").innerHTML = `<span class="dtag">Chapitre ${id}</span><span class="dtag">${activeClasse}</span><span class="dtag">${matLabel}</span>`;
  document.querySelector(".dtit").textContent = `Chapitre ${id} : ${matLabel}`;
  document.querySelector(".dsub").textContent = `${activeClasse} · ${matLabel}`;
  document.querySelector(".dmic").style.background = bg + "30";
  document.querySelector(".dmic").textContent = emo;
  document.querySelector(".dmn").textContent = matLabel.charAt(0).toUpperCase() + matLabel.slice(1);
  document.querySelector(".dmi").textContent = activeClasse;
  document.getElementById("dcontenu").innerHTML = `
    <p style="color:var(--t3);text-align:center;padding:20px 0;line-height:2">
      📝 <strong>Chapitre ${id}</strong> — ${matLabel}<br>
      <span style="font-size:11px">Connecte Turso pour afficher le vrai contenu</span>
    </p>`;
  setTimeout(() => {
    const phone = localStorage.getItem("userPhone") || "";
    if (window._applyWatermark) window._applyWatermark(phone);
  }, 80);
  const btn1 = document.getElementById("dbtn1");
  btn1.textContent = "📤 Partager ce chapitre";
  btn1.style.background = `linear-gradient(135deg,#25D366,#128C7E)`;
  btn1.onclick = () => shareResource(`Chapitre ${id} : ${matLabel}`, window.location.href);
  document.getElementById("dbtnSave").onclick = saveCurrentOffline;
  showPage("detail");
  addNotification("📖 Chapitre ouvert", `Chapitre ${id} · ${matLabel} · ${activeClasse}`, "info");
}

// ========== FONCTIONS GÉNÉRALES ==========
function openModal() { document.getElementById("lockModal").classList.add("show"); }
function closeModal() { document.getElementById("lockModal").classList.remove("show"); }
function openAbo() {
  showPage("abonnement");
  const el = document.getElementById("aboNumeroPaiement");
  if (el) {
    const num = WHATSAPP_PAIEMENT_NUM || "";
    // Affichage espacé "699 88 25 00" pour la lisibilité, comme l'ancien texte en dur
    el.textContent = num ? num.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4") : "Non configuré";
  }
}

// ========== ENVOI PREUVE DE PAIEMENT PREMIUM (bouton flottant) ==========
// Bouton visible partout dans l'app (pas seulement sur la page Abonnement)
// pour qu'un élève puisse transmettre sa capture d'écran de paiement Orange
// Money sans avoir à chercher où le faire. Deux options au choix (demande
// Jean, 2026) : WhatsApp (l'élève choisit lui-même la capture à joindre) ou
// upload direct dans l'app (transmis aux modérateurs via Cloudinary).
function ouvrirEnvoiPreuvePaiement() {
  const modal = document.getElementById("preuvePaiementModal");
  if (modal) modal.style.display = "flex";
  const statusEl = document.getElementById("preuvePaiementStatus");
  if (statusEl) statusEl.style.display = "none";
}

function fermerEnvoiPreuvePaiement() {
  const modal = document.getElementById("preuvePaiementModal");
  if (modal) modal.style.display = "none";
}

// Option 1 — Ouvre WhatsApp avec le numéro configuré par l'admin
// (WHATSAPP_PAIEMENT_NUM) et un message pré-rempli identifiant l'élève (son
// pseudo/numéro s'ils sont connus) ; l'élève choisit et joint lui-même sa
// capture d'écran dans WhatsApp, comme demandé.
function envoyerPreuvePaiementWhatsApp() {
  const num = (WHATSAPP_PAIEMENT_NUM || "").replace(/\D/g, "");
  if (!num) {
    showToast("⚠️ Numéro de paiement non configuré par l'admin", "error");
    return;
  }
  // Le numéro LearnUpr (userPhone) est TOUJOURS inclus explicitement dans le
  // message, même si l'élève a un pseudo — sinon, s'il écrit sur WhatsApp
  // depuis un numéro différent de celui enregistré dans l'app, le modérateur
  // n'a aucun moyen de relier le message au bon compte pour activer le
  // Premium (demande Jean, 2026 : "il faut le numéro de la personne").
  const pseudo = localStorage.getItem("userPseudo") || "";
  const telephone = localStorage.getItem("userPhone") || "";
  const classe = (typeof activeClasse !== "undefined" && activeClasse) ? activeClasse.replace(/_/g," ") : "";
  const identite = [
    pseudo ? `Pseudo : ${pseudo}` : null,
    telephone ? `Numéro LearnUpr : ${telephone}` : "⚠️ Numéro LearnUpr non renseigné",
    classe ? `Classe : ${classe}` : null,
  ].filter(Boolean).join(" — ");
  const msg = `Bonjour, je viens de payer 500 FCFA pour le Premium LearnUpr.\n${identite}\nVoici ma capture d'écran de paiement 👇`;
  // Préfixe 237 (Cameroun) — wa.me exige le numéro complet avec indicatif pays
  window.open(`https://wa.me/237${num}?text=${encodeURIComponent(msg)}`, "_blank");
  fermerEnvoiPreuvePaiement();
  showToast("💬 WhatsApp ouvert — n'oublie pas de joindre ta capture !", "info");
}

// Option 2 — Upload direct dans l'app : la capture est envoyée sur
// Cloudinary puis une entrée est créée dans une file d'attente dédiée
// ("preuves_paiement", localStorage + Turso si disponible), consultable par
// les modérateurs/admin depuis le panel — voir chargerPreuvesPaiement.
async function envoyerPreuvePaiementUpload(input) {
  const file = input.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("❌ Seules les images (capture d'écran) sont acceptées", "error");
    input.value = "";
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    showToast("❌ Image trop lourde (max 8 Mo)", "error");
    input.value = "";
    return;
  }

  const statusEl = document.getElementById("preuvePaiementStatus");
  const btn = document.getElementById("btnUploadPreuve");
  if (btn) { btn.disabled = true; btn.style.opacity = "0.6"; }
  if (statusEl) { statusEl.style.display = "block"; statusEl.style.color = "var(--t2)"; statusEl.textContent = "⏳ Envoi en cours..."; }

  try {
    const url = await uploadToCloudinary(file, Date.now());
    if (!url) throw new Error("Upload échoué");

    const entree = {
      id: Date.now(),
      pseudo: localStorage.getItem("userPseudo") || "",
      telephone: localStorage.getItem("userPhone") || "",
      classe: (typeof activeClasse !== "undefined" && activeClasse) ? activeClasse : "",
      imageUrl: url,
      statut: "en_attente", // en_attente | validee | rejetee — voir panel modérateur
      date: Date.now(),
    };
    const liste = JSON.parse(localStorage.getItem("preuves_paiement") || "[]");
    liste.push(entree);
    localStorage.setItem("preuves_paiement", JSON.stringify(liste));

    if (typeof turso !== "undefined" && turso) {
      try {
        await turso.execute({
          sql: "INSERT INTO preuves_paiement (id,pseudo,telephone,classe,image_url,statut,date) VALUES (?,?,?,?,?,?,?)",
          args: [entree.id, entree.pseudo, entree.telephone, entree.classe, entree.imageUrl, entree.statut, entree.date]
        });
      } catch(eTable) {
        // La table n'existe probablement pas encore sur cette base — la
        // créer puis réessayer une seule fois (même pattern défensif que les
        // autres tables créées à la volée ailleurs dans l'app).
        try {
          await turso.execute({ sql: "CREATE TABLE IF NOT EXISTS preuves_paiement (id INTEGER PRIMARY KEY, pseudo TEXT, telephone TEXT, classe TEXT, image_url TEXT, statut TEXT, date INTEGER)", args: [] });
          await turso.execute({
            sql: "INSERT INTO preuves_paiement (id,pseudo,telephone,classe,image_url,statut,date) VALUES (?,?,?,?,?,?,?)",
            args: [entree.id, entree.pseudo, entree.telephone, entree.classe, entree.imageUrl, entree.statut, entree.date]
          });
        } catch(eRetry) { console.warn("[Preuve paiement] Turso:", eRetry.message); }
      }
    }

    if (statusEl) { statusEl.style.color = "#059669"; statusEl.textContent = "✅ Envoyé ! Un modérateur va vérifier ton paiement."; }
    showToast("✅ Preuve envoyée — vérification en cours", "success");
    setTimeout(fermerEnvoiPreuvePaiement, 1800);
  } catch(e) {
    if (statusEl) { statusEl.style.color = "var(--red)"; statusEl.textContent = "❌ " + e.message; }
    showToast("❌ Erreur d'envoi : " + e.message, "error");
  } finally {
    if (btn) { btn.disabled = false; btn.style.opacity = "1"; }
    input.value = "";
  }
}

function subscribe() { showPage("codepage"); }
function shareApp() { window.open(`https://wa.me/?text=📚 LearnUpr - Réussis au Cameroun ! ${encodeURIComponent(window.location.href)}`, "_blank"); }
function shareResource(title, link) { window.open(`https://wa.me/?text=📚 ${encodeURIComponent(title)} – ${encodeURIComponent(link)}`, "_blank"); }
function resetApp() {
  if (confirm("Réinitialiser toutes les données ? Cette action est irréversible.")) {
    localStorage.clear();
    location.reload();
  }
}

// ========== OFFLINE DB — FIX #9 : store contenu_publie inclus ==========
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 5);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE_NAME)) d.createObjectStore(STORE_NAME, { keyPath: "id" });
      if (!d.objectStoreNames.contains("contributions")) d.createObjectStore("contributions", { keyPath: "id" });
      if (!d.objectStoreNames.contains("contenu_publie")) d.createObjectStore("contenu_publie", { keyPath: "id" });
    };
    req.onsuccess = (e) => { db = e.target.result; resolve(db); };
    req.onerror = () => { console.error("IndexedDB non disponible"); reject(); };
  });
}
async function getUsedSpace() {
  if (!db) return 0;
  return new Promise(resolve => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => { const total = req.result.reduce((s, i) => s + (i.taille || 0), 0); resolve(total); };
    req.onerror = () => resolve(0);
  });
}
async function listOfflineChapters() {
  if (!db) return [];
  return new Promise(resolve => {
    const tx = db.transaction([STORE_NAME], "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result.sort((a, b) => b.date - a.date));
    req.onerror = () => resolve([]);
  });
}
async function deleteChapterOffline(id) {
  return new Promise(resolve => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { showToast("🗑️ Supprimé"); resolve(true); };
    tx.onerror = () => resolve(false);
  });
}
async function saveChapterOffline(id, titre, contenu, fichierUrl = null, fichierType = null) {
  const used = await getUsedSpace();
  const taille = new Blob([contenu]).size;
  if (used + taille > MAX_STORAGE) { showToast("⚠️ Stockage plein (100 Mo)", "error"); return false; }
  return new Promise(resolve => {
    const tx = db.transaction([STORE_NAME], "readwrite");
    tx.objectStore(STORE_NAME).put({ id, titre, contenu, taille, date: Date.now(), fichierUrl, fichierType });
    tx.oncomplete = () => { showToast("✅ Sauvegardé hors ligne", "success"); resolve(true); };
    tx.onerror = () => resolve(false);
  });
}
async function saveCurrentOffline() {
  if (!currentChapterId) { showToast("⚠️ Aucun chapitre ouvert", "error"); return; }
  if (!db) { showToast("⚠️ Stockage hors ligne non disponible", "error"); return; }
  const titre = document.querySelector(".dtit")?.textContent || "Chapitre";

  const dcont = document.querySelector(".dcont");
  const embed = dcont?.querySelector("embed");
  const img = dcont?.querySelector("img");
  const fichierUrl = embed?.src || img?.src || null;
  const fichierType = embed ? "application/pdf" : (img ? "image/jpeg" : null);

  // Premium gate: PDF et images nécessitent Premium
  if ((embed || img) && !checkPremium()) {
    openPremiumGate("offline");
    return;
  }

  // Construire contenu sauvegardé : fichier réellement téléchargé en local
  // (blob) pour une vraie consultation hors ligne, OU HTML du contenu textuel
  // si le chapitre n'a pas de fichier distant.
  let contenuSave = "";
  if (fichierUrl && fichierUrl.startsWith("http")) {
    showToast("📥 Téléchargement du fichier pour le hors ligne…", "info");
    try {
      const resp = await fetch(fichierUrl);
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const blob = await resp.blob();
      // Vérifier le quota avant de convertir (évite de gaspiller du temps CPU si ça dépassera)
      const used = await getUsedSpace();
      if (used + blob.size > MAX_STORAGE) {
        showToast("⚠️ Stockage plein (100 Mo) — supprime d'anciens chapitres pour libérer de la place", "error");
        return;
      }
      const blobBase64 = await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result); // déjà en data: URL base64
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
      contenuSave = JSON.stringify({ type: "remote_cached", dataUrl: blobBase64, mime: fichierType, urlOrigine: fichierUrl });
    } catch(e) {
      console.warn("Téléchargement hors ligne échoué, fallback sur lien distant:", e);
      showToast("⚠️ Téléchargement impossible — seul le lien sera sauvegardé", "info");
      contenuSave = JSON.stringify({ type: "remote", url: fichierUrl, mime: fichierType });
    }
  } else {
    contenuSave = dcont?.innerHTML || "";
  }

  const saved = await saveChapterOffline(currentChapterId, titre, contenuSave, fichierUrl, fichierType);
  if (saved) updateStorageUI();
}
async function renderSavedList() {
  if (!db) {
    const c = document.getElementById("savedBody");
    if (c) c.innerHTML = "<div class='empty'>📭 Base de données non disponible</div>";
    return;
  }
  const chapters = await listOfflineChapters();
  const container = document.getElementById("savedBody");
  if (!container) return;
  if (chapters.length === 0) { container.innerHTML = "<div class='empty'>📭 Aucun chapitre sauvegardé</div>"; return; }
  let html = `<div style="font-weight:800;font-size:13px;margin-bottom:10px;color:var(--p)">📥 ${chapters.length} chapitre(s) sauvegardé(s)</div>`;
  for (const c of chapters) {
    const date = new Date(c.date).toLocaleDateString("fr-FR");
    html += `<div class="resource-item" onclick="viewOfflineChapter('${c.id}')">
      <div style="font-size:18px">📘</div>
      <div style="flex:1;padding:0 10px">
        <div style="font-weight:700;font-size:12px">${c.titre}</div>
        <div style="font-size:10px;color:var(--t3)">${(c.taille/1024).toFixed(1)} KB · ${date}</div>
      </div>
      <button onclick="event.stopPropagation();deleteChapterOffline('${c.id}').then(renderSavedList)" style="background:var(--red);color:white;border:none;border-radius:8px;padding:5px 8px;font-size:11px;cursor:pointer">🗑️</button>
    </div>`;
  }
  container.innerHTML = html;
}
async function viewOfflineChapter(id) {
  const chapters = await listOfflineChapters();
  const ch = chapters.find(c => c.id === id);
  if (!ch) return;

  document.querySelector(".dtags").innerHTML = '<span class="dtag">📴 Hors ligne</span>';
  document.querySelector(".dtit").textContent = ch.titre;

  // Fix 22 : Rendu intelligent selon le type sauvegardé
  let html = "";
  try {
    const parsed = JSON.parse(ch.contenu);
    if (parsed.type === "remote_cached" && parsed.dataUrl) {
      // Fichier réellement téléchargé en local (data: URL) → consultable sans internet
      if (parsed.mime === "application/pdf") {
        const oid = "pdfjs-offline-" + Date.now();
        setTimeout(function(){ renderPdfJs(parsed.dataUrl, oid, ch.titre||"document"); }, 80);
        html = `<div id="${oid}" style="border-radius:12px;border:1.5px solid var(--border);background:var(--bg);min-height:100px;margin-bottom:10px;overflow-y:auto;max-height:70vh;padding:8px">
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:20px;color:var(--t2);font-weight:700;font-size:12px">
            <div style="width:16px;height:16px;border:3px solid var(--p);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div>Chargement...
          </div></div>
          <a href="${parsed.dataUrl}" download="${esc(ch.titre||'document')}.pdf"
            style="display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,var(--p),var(--p2));color:white;text-decoration:none;border-radius:14px;padding:14px;font-weight:800;font-size:13px;min-height:48px">
            📴 PDF disponible hors ligne
          </a>
          <p style="text-align:center;font-size:11px;color:var(--t3);margin-top:8px">✅ Ce fichier a été téléchargé — consultable sans connexion</p>`;
      } else {
        html = `<img src="${parsed.dataUrl}" style="width:100%;border-radius:10px;display:block">
          <p style="text-align:center;font-size:11px;color:var(--t3);margin-top:8px">✅ Image disponible hors ligne</p>`;
      }
    } else if (parsed.type === "remote") {
      if (parsed.mime === "application/pdf") {
        const oid = "pdfjs-offline-" + Date.now();
        setTimeout(function(){ renderPdfJs(parsed.url, oid, ch.titre||"document"); }, 80);
        html = `<div id="${oid}" style="border-radius:12px;border:1.5px solid var(--border);background:var(--bg);min-height:100px;margin-bottom:10px;overflow-y:auto;max-height:70vh;padding:8px">
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:20px;color:var(--t2);font-weight:700;font-size:12px">
            <div style="width:16px;height:16px;border:3px solid var(--p);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite"></div>Chargement...
          </div></div>
          <button onclick="_ouvrirFichierProtege('${_regFichier(parsed.url)}','${esc(ch.titre||"document")}',null)"
            style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:14px;padding:14px;font-weight:800;font-size:13px;min-height:48px;cursor:pointer">
            🔗 Ouvrir le PDF
          </button>
          <p style="text-align:center;font-size:11px;color:var(--t3);margin-top:8px">📡 Ce PDF nécessite une connexion internet</p>`;
      } else {
        html = `<img src="${parsed.url}" style="width:100%;border-radius:10px;display:block" onerror="this.outerHTML='<p style=color:var(--t3);text-align:center;padding:20px>🖼️ Image non disponible hors ligne</p>'">`;
      }
    } else {
      html = ch.contenu;
    }
  } catch(e) {
    html = ch.contenu; // contenu HTML texte normal
  }
  document.querySelector(".dcont").innerHTML = html;
  document.getElementById("dbtnSave").innerHTML = "🗑️ Supprimer";
  document.getElementById("dbtnSave").onclick = () => deleteChapterOffline(id).then(() => { showPage("main"); showTab("saved"); });
  showPage("detail");
}
async function updateStorageUI() {
  const used = await getUsedSpace();
  const percent = Math.min((used / MAX_STORAGE) * 100, 100);
  const usedMo = (used / (1024 * 1024)).toFixed(1);
  const html = `<div class="storage-manager">
    <div class="storage-header">📦 Stockage hors ligne</div>
    <div class="storage-bar"><div class="storage-fill" style="width:${percent}%"></div></div>
    <div class="storage-stats">${usedMo} Mo utilisés / 100 Mo max</div>
    <div style="display:flex;gap:8px">
      <button onclick="clearAllOffline()" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:9px;font-size:11px;cursor:pointer;color:var(--red);font-weight:700">🗑️ Tout supprimer</button>
      <button onclick="showTab('saved')" style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:9px;font-size:11px;cursor:pointer;color:var(--p);font-weight:700">📋 Voir tout</button>
    </div>
  </div>`;
  const container = document.getElementById("storageManager");
  if (container) container.innerHTML = html;
}
async function clearAllOffline() {
  if (!confirm("Supprimer toutes les sauvegardes hors ligne ?")) return;
  const chapters = await listOfflineChapters();
  for (const c of chapters) await deleteChapterOffline(c.id);
  updateStorageUI(); renderSavedList();
  showToast("🗑️ Tout supprimé", "success");
}

// ========== CLASSEMENT — FIX #10 : Données réelles ==========
async function loadClassement() {
  const container = document.getElementById("classementContainer");
  if (!container) return;

  let scores = {};
  // Données locales
  const locales = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
  locales.filter(c => c.statut === "approuve" && c.auteur).forEach(c => {
    scores[c.auteur] = (scores[c.auteur] || 0) + 1;
  });

  // Données Turso
  if (turso) {
    try {
      const res = await turso.execute({
        sql: "SELECT auteur, COUNT(*) as n FROM contributions WHERE statut='approuve' AND auteur IS NOT NULL GROUP BY auteur ORDER BY n DESC LIMIT 10",
        args: []
      });
      (res.rows || []).forEach(r => {
        scores[r.auteur] = Math.max(scores[r.auteur] || 0, Number(r.n));
      });
    } catch(e) {}
  }

  const sorted = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (sorted.length === 0) {
    container.innerHTML = `<div class="classement-list">
      <div class="classement-header">🏆 Classement</div>
      <div style="text-align:center;font-size:12px;color:var(--t3);padding:16px">Aucune contribution validée pour l'instant.<br>Soumet du contenu pour apparaître ici !</div>
    </div>`;
    return;
  }

  const medals = ["gold","silver","bronze","","","","","","",""];
  const currentPhone = localStorage.getItem("userPhone") || "";
  const currentIsPremium = checkPremium();

  container.innerHTML = `<div class="classement-list">
    <div class="classement-header">🏆 Classement des contributeurs</div>
    ${!currentIsPremium && currentPhone ? `<div style="background:linear-gradient(135deg,var(--gold),var(--gold2));color:#1A1530;font-size:11px;font-weight:700;padding:10px 14px;border-radius:10px;margin-bottom:10px;cursor:pointer" onclick="openPremiumGate('classement')">
      ⭐ Passe Premium pour apparaître dans ce classement avec un badge
    </div>` : ""}
    ${sorted.map((u, i) => {
      const phone = u[0];
      const pts = u[1];
      const isMe = phone === currentPhone;
      const display = isMe ? (localStorage.getItem("userPseudo") || "👤 Toi") : phone.slice(0,3) + "***" + phone.slice(-2);
      // Vérifier si premium (simplifié: on affiche le badge si c'est nous et qu'on est premium)
      const premBadge = isMe && currentIsPremium ? ' <span style="font-size:9px;background:var(--gold2);color:white;padding:1px 5px;border-radius:6px">⭐</span>' : '';
      return `<div class="classement-item" ${isMe ? 'style="background:rgba(109,40,217,0.07)"' : ''}>
        <div class="rank-badge ${medals[i] || ""}">${i < 3 ? ["🥇","🥈","🥉"][i] : i+1}</div>
        <div class="classement-nom">${display}${premBadge}</div>
        <div class="classement-points">${pts} contrib.</div>
      </div>`;
    }).join("")}
    <div style="text-align:center;font-size:10px;color:var(--t3);padding:10px 0">Basé sur les contributions validées</div>
  </div>`;
}

// ========== CONNEXION ==========
window.addEventListener("online", () => {
  document.getElementById("offBanner").classList.remove("show");
  showToast("✅ Connexion rétablie", "success");
  addNotification("📶 Connexion rétablie", "Tu es de nouveau en ligne", "success");
});
window.addEventListener("offline", () => {
  document.getElementById("offBanner").classList.add("show");
  showToast("📵 Mode hors ligne activé", "error");
  addNotification("📵 Mode hors ligne", "Connexion perdue — contenu sauvegardé disponible", "error");
});
if (!navigator.onLine) document.getElementById("offBanner").classList.add("show");

// ========== INIT ==========
// ── 5. Override window.confirm pour Android WebView ──
(function() {
  try {
    const _native = window.confirm.bind(window);
    window.confirm = function(msg) {
      try { return _native(msg); } catch(e) { return true; }
    };
  } catch(e) {}
})();

document.getElementById("btnStart").onclick = () => {
  showPage("main");
  showTab("accueil");
  initQuizSelects();

  // (message de bienvenue supprimé)
};

// ========== ANTI-COPIE RENFORCÉ ==========

// Helper synchrone : vrai si l'utilisateur est admin ET a validé son mot de passe dans cette session.
// Utilisé dans l'IIFE ci-dessous pour bypasser toutes les protections côté admin.
function _isAdminSession() {
  return sessionStorage.getItem("adminAuth") === "true" &&
         localStorage.getItem("userRole") === "admin";
}

// ── VÉRIFICATION D'INTÉGRITÉ : détecter si des éléments critiques ont été supprimés/modifiés ──
(function() {
  const CRITICAL_IDS = ["app","loginPage","mainPage","modoPanelModal","devtools-warning","learnup-embedded-cfg"];
  // Surveiller les suppressions d'éléments critiques (protection contre manipulations en console)
  if (typeof MutationObserver !== "undefined") {
    const integrityObserver = new MutationObserver(function(mutations) {
      if (_isAdminSession()) return; // L'admin peut manipuler le DOM librement
      mutations.forEach(function(m) {
        m.removedNodes.forEach(function(node) {
          if (node.id && CRITICAL_IDS.includes(node.id)) {
            location.reload(); // Recharger si un élément critique est supprimé
          }
        });
      });
    });
    document.addEventListener("DOMContentLoaded", function() {
      integrityObserver.observe(document.body, { childList: true, subtree: false });
    });
  }
})();

(function() {

  // ── 1. CSS user-select déjà géré en CSS, renforcer via JS au cas où ──
  function freezeSelection(el) {
    if (!el) return;
    el.style.webkitUserSelect = "none";
    el.style.userSelect = "none";
  }
  // Observer les nouveaux éléments de contenu
  const selObserver = new MutationObserver(() => {
    document.querySelectorAll("#dcontenu, .dcont, .chapitre-list").forEach(freezeSelection);
  });
  selObserver.observe(document.body, { childList: true, subtree: true });

  // ── 2. Bloquer copy / cut / selectstart sur le contenu protégé ──
  function blockEvent(e) {
    if (!e.target || typeof e.target.closest !== "function") return;
    const inInput = e.target.closest("input, textarea, [contenteditable]");
    if (inInput) return;
    // Exception explicite : zones marquées admin-copyable (ex: codes premium
    // affichés à l'admin) restent copiables — uniquement quand l'admin est authentifié.
    const inAdminCopyable = e.target.closest(".admin-copyable");
    if (inAdminCopyable && sessionStorage.getItem("adminAuth") === "true") return;
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  ["copy","cut","selectstart","select"].forEach(ev => {
    document.addEventListener(ev, blockEvent, { capture: true });
  });

  // ── 3. Bloquer les raccourcis clavier de copie / capture ──
  document.addEventListener("keydown", function(e) {
    // L'admin garde accès à tous les raccourcis (F12, Ctrl+U, etc.)
    if (_isAdminSession()) return;
    const ctrl = e.ctrlKey || e.metaKey;
    const inInput = e.target && typeof e.target.closest === "function"
      ? e.target.closest("input, textarea, [contenteditable]") : null;

    if (e.key === "PrintScreen") { e.preventDefault(); showToast("⛔ Capture désactivée", "error"); return; }
    if (ctrl && e.key === "p") { e.preventDefault(); showToast("⛔ Impression désactivée", "error"); return; }
    if (ctrl && e.shiftKey && ["i","j","c"].includes(e.key.toLowerCase())) { e.preventDefault(); return; }
    if (e.key === "F12") { e.preventDefault(); return; }

    if (!inInput) {
      if (ctrl && ["c","x","a","s","u"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        if (e.key.toLowerCase() === "c" || e.key.toLowerCase() === "x") {
          showToast("⛔ Copie désactivée sur ce contenu", "error");
        }
        return;
      }
    }
  }, { capture: true });

  // ── 4. Bloquer clic droit et menu contextuel ──
  document.addEventListener("contextmenu", function(e) {
    if (_isAdminSession()) return; // Admin : clic droit libre
    if (!e.target || typeof e.target.closest !== "function") { e.preventDefault(); return false; }
    const inInput = e.target.closest("input, textarea");
    if (inInput) return;
    const inAdminCopyable = e.target.closest(".admin-copyable");
    if (inAdminCopyable && sessionStorage.getItem("adminAuth") === "true") return;
    e.preventDefault();
    return false;
  }, { capture: true });

  // ── 5. Bloquer drag & drop du contenu ──
  document.addEventListener("dragstart", e => {
    if (!e.target || typeof e.target.closest !== "function") { e.preventDefault(); return; }
    const inInput = e.target.closest("input, textarea");
    if (!inInput) e.preventDefault();
  });
  document.addEventListener("drop", e => e.preventDefault());

  // ── 6. Bloquer le téléchargement de fichiers via <a> ──
  document.addEventListener("click", function(e) {
    if (!e.target || typeof e.target.closest !== "function") return;
    const a = e.target.closest("a");
    if (a && (a.hasAttribute("download") || a.href?.startsWith("blob:") || a.href?.startsWith("data:"))) {
      if (a.getAttribute("download") === "index.html") return;
      e.preventDefault();
      showToast("⛔ Téléchargement désactivé", "error");
    }
  });

  // ── 7. Bloquer le long-press sur mobile (images / canvas / PDF embed) ──
  document.addEventListener("touchstart", function(e) {
    const t = e.target;
    if (t && ["IMG","CANVAS","VIDEO","EMBED","OBJECT"].includes(t.tagName)) {
      e.preventDefault();
    }
  }, { passive: false });
  let _longPressTimer = null;
  document.addEventListener("touchstart", function(e) {
    if (!e.target || typeof e.target.closest !== "function") return;
    const inInput = e.target.closest("input, textarea, [contenteditable]");
    if (inInput) return;
    _longPressTimer = setTimeout(() => {
      window.getSelection()?.removeAllRanges();
    }, 300);
  }, { passive: true });
  document.addEventListener("touchend", () => clearTimeout(_longPressTimer));
  document.addEventListener("touchcancel", () => clearTimeout(_longPressTimer));

  // ── 8. Interception clipboard API ──
  const _origWriteText = navigator.clipboard?.writeText?.bind(navigator.clipboard);
  if (navigator.clipboard && _origWriteText) {
    Object.defineProperty(navigator.clipboard, "writeText", {
      value: function(text) {
        // Autoriser les copies depuis les messages WhatsApp (modérateurs)
        // ainsi que les codes premium / outils admin, uniquement si l'admin
        // ou modérateur est authentifié dans cette session.
        const allowed = document.getElementById("waMsg");
        if (allowed && text === allowed.value) return _origWriteText(text);
        if (sessionStorage.getItem("adminAuth") === "true" && window._adminClipboardAllowed) {
          return _origWriteText(text);
        }
        showToast("⛔ Copie désactivée", "error");
        return Promise.reject(new Error("Copie désactivée"));
      },
      writable: false, configurable: false
    });
  }

  // ── 9. Watermark dynamique sur le contenu affiché ──
  // Injecté dans viewContenuPublie et viewEpreuve via applyWatermark()
  window._applyWatermark = function(phone) {
    const el = document.getElementById("dcontenu");
    if (!el) return;
    const wm = phone ? `LearnUpr • ${phone.slice(0,3)}***${phone.slice(-2)} • ${new Date().toLocaleDateString("fr-FR")}` : "LearnUpr — Contenu protégé";
    el.setAttribute("data-wm", wm);
    // Watermark canvas superposé (invisible mais présent dans DOM)
    let cv = el.querySelector(".wm-canvas");
    if (!cv) {
      cv = document.createElement("canvas");
      cv.className = "wm-canvas";
      cv.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;opacity:0.045;";
      el.style.position = "relative";
      el.appendChild(cv);
    }
    const ctx = cv.getContext("2d");
    cv.width = el.offsetWidth || 320;
    cv.height = el.offsetHeight || 400;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save();
    ctx.translate(cv.width/2, cv.height/2);
    ctx.rotate(-35 * Math.PI / 180);
    ctx.font = "bold 13px 'Inter', sans-serif";
    ctx.fillStyle = "rgba(109,40,217,1)";
    ctx.textAlign = "center";
    const lines = wm.split(" • ");
    lines.forEach((line, i) => ctx.fillText(line, 0, (i - lines.length/2 + 0.5) * 22));
    ctx.restore();
  };

  // ── 10. Blur sur changement d'onglet (anti-screenshot) ──
  document.addEventListener("visibilitychange", function() {
    if (_isAdminSession()) return; // Admin : pas de blur
    const app = document.getElementById("app");
    if (!app) return;
    if (document.hidden) {
      app.style.filter = "blur(12px)";
    } else {
      setTimeout(() => { app.style.filter = "none"; }, 150);
    }
  });
  // Desktop : blur quand la fenêtre perd le focus
  if (!/Mobi|Android/i.test(navigator.userAgent)) {
    window.addEventListener("blur", () => {
      if (_isAdminSession()) return;
      const app = document.getElementById("app");
      if (app) app.style.filter = "blur(12px)";
    });
    window.addEventListener("focus", () => {
      const app = document.getElementById("app");
      if (app) setTimeout(() => { app.style.filter = "none"; }, 150);
    });
  }

  // ── 11. Détection DevTools (taille fenêtre / debugger) ──
  let _devtoolsOpen = false;
  // Seuil plus élevé pour éviter les faux positifs sur mobile (barre d'adresse ~80px)
  const _threshold = 250;
  function detectDevTools() {
    // Ne pas déclencher sur mobile/tablette (touch device)
    if (navigator.maxTouchPoints > 0) return;
    // Ne pas bloquer l'admin
    if (_isAdminSession()) {
      if (_devtoolsOpen) {
        _devtoolsOpen = false;
        document.getElementById("devtools-warning")?.classList.remove("show");
        const app = document.getElementById("app");
        if (app) app.style.filter = "none";
      }
      return;
    }
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    const isOpen = widthDiff > _threshold || heightDiff > _threshold;
    if (isOpen && !_devtoolsOpen) {
      _devtoolsOpen = true;
      document.getElementById("devtools-warning")?.classList.add("show");
      const app = document.getElementById("app");
      if (app) app.style.filter = "blur(20px)";
    } else if (!isOpen && _devtoolsOpen) {
      _devtoolsOpen = false;
      document.getElementById("devtools-warning")?.classList.remove("show");
      const app = document.getElementById("app");
      if (app) app.style.filter = "none";
    }
  }
  setInterval(detectDevTools, 1000);
  // Méthode debugger trick (Firefox/Chrome)
  const _dt = new Image();
  Object.defineProperty(_dt, "id", {
    get: function() {
      _devtoolsOpen = true;
      document.getElementById("devtools-warning")?.classList.add("show");
    }
  });
  // console.log trick désactivé car trop intrusif

  // ── 12. Vider le presse-papiers après copie détournée ──
  document.addEventListener("copy", function(e) {
    if (_isAdminSession()) return; // Admin : copie libre
    if (!e.target || typeof e.target.closest !== "function") return;
    const inInput = e.target.closest("input, textarea, [contenteditable]");
    if (inInput) return;
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", "⛔ Contenu protégé — LearnUpr © " + new Date().getFullYear());
      e.clipboardData.setData("text/html", "<p>⛔ Contenu protégé — LearnUpr</p>");
    }
    e.preventDefault();
    showToast("⛔ Copie protégée", "error");
  }, { capture: true });

  // ── 13. Désactiver l'impression via CSS dynamique ──
  const noPrint = document.createElement("style");
  noPrint.textContent = "@media print { body { display: none !important; } }";
  document.head.appendChild(noPrint);

  // ── 14. Empêcher l'accès à la source via Ctrl+U / Ctrl+S ──
  // Déjà géré dans le keydown ci-dessus (key === "u" et "s")

})(); // fin IIFE anti-copie

// ========== PANEL MODÉRATEUR ==========
let modoTypeActuel = "cours";
let modoMediaActuel = "texte";
let modoDocTypeActuel = "cours"; // ⚠️ Était "sequencielle" par défaut — un modérateur qui oubliait de
// cliquer sur "Cours" avant de publier (ex: une vidéo) la voyait atterrir par erreur dans Séquentielle.
// "Cours" est un choix par défaut plus sûr : les vraies séquentielles/examens nécessitent un clic explicite.
let modoLyceeActuel = "principal"; // "principal" ou "autres"

function setModoLycee(lycee, btn) {
  modoLyceeActuel = lycee;
  ["principal","autres"].forEach(k => {
    const b = document.getElementById("modoLycee-" + k);
    if (b) { b.classList.remove("active"); }
  });
  if (btn) btn.classList.add("active");
}

function setModoDocType(type, btn) {
  modoDocTypeActuel = type;
  ["seq","cours","exam","zone","comp"].forEach(k => {
    const b = document.getElementById("modoDoc-" + k);
    if (b) { b.style.background = "var(--bg)"; b.style.color = "var(--t2)"; b.style.borderColor = "var(--border)"; }
  });
  if (btn) { btn.style.background = "var(--p)"; btn.style.color = "white"; btn.style.borderColor = "var(--p)"; }
}

function initModoSelects() {
  const mat = document.getElementById("modo-mat");
  const cls = document.getElementById("modo-classe");
  if (!mat || !cls) return;
  // Peupler les classes
  if (cls.children.length <= 1) {
    CLASSES.forEach(c => { const o = document.createElement("option"); o.value = c; o.textContent = c; cls.appendChild(o); });
    // Quand la classe change, mettre à jour les matières
    cls.addEventListener("change", function() { updateModoMatSelect(this.value); renderModoMultiClasseList(); });
  }
  // Matières initiales : toutes (ou celles de la classe active)
  updateModoMatSelect(cls.value || activeClasse);
  renderModoMultiClasseList();
}

// ── Publication d'une même épreuve vers plusieurs classes ──
function toggleModoMultiClasse() {
  const box = document.getElementById("modo-multiclasse-box");
  if (!box) return;
  const visible = box.style.display !== "none";
  box.style.display = visible ? "none" : "block";
  if (!visible) renderModoMultiClasseList();
}

function renderModoMultiClasseList() {
  const list = document.getElementById("modo-multiclasse-list");
  if (!list) return;
  const principale = document.getElementById("modo-classe")?.value || "";
  // On garde les cases déjà cochées pour ne pas perdre la sélection en re-render
  const dejaCochees = new Set(
    [...list.querySelectorAll("input[type=checkbox]:checked")].map(cb => cb.value)
  );
  list.innerHTML = CLASSES.filter(c => c !== principale).map(c => `
    <label style="display:flex;align-items:center;gap:5px;background:var(--card);border:1px solid var(--border);border-radius:8px;padding:6px 10px;font-size:11px;font-weight:700;cursor:pointer">
      <input type="checkbox" class="modo-multiclasse-cb" value="${c}" ${dejaCochees.has(c) ? "checked" : ""} style="width:16px;height:16px;cursor:pointer;accent-color:var(--p)">
      ${c}
    </label>`).join("");
}

function getModoClassesSupplementaires() {
  return [...document.querySelectorAll(".modo-multiclasse-cb:checked")].map(cb => cb.value);
}

function updateModoMatSelect(classe) {
  const mat = document.getElementById("modo-mat");
  if (!mat) return;
  const currentVal = mat.value;
  mat.innerHTML = '<option value="">— Matière —</option>';
  const mats = (classe && MATIERES_PAR_CLASSE[classe]) ? MATIERES_PAR_CLASSE[classe] : MATIERES;
  mats.forEach(m => {
    const o = document.createElement("option");
    o.value = m;
    o.textContent = m.replace(/_/g," ");
    mat.appendChild(o);
  });
  if (currentVal && mats.includes(currentVal)) mat.value = currentVal;
}

function switchModoTab(tab, btn) {
  document.querySelectorAll(".modo-section").forEach(s => s.classList.remove("active"));
  document.querySelectorAll("#modoPanelModal .modo-tab-btn").forEach(b => b.classList.remove("active"));
  const sec = document.getElementById("modoS-" + tab);
  if (sec) sec.classList.add("active");
  if (btn) btn.classList.add("active");
  if (tab === "valider") chargerContribsModo();
  if (tab === "doublons") chargerDoublonsAVerifier();
  if (tab === "paiements") {
    const _role = localStorage.getItem("userRole") || "";
    if (_role !== "admin") { showToast("⛔ Accès réservé à l'administrateur", "error"); return; }
    chargerPreuvesPaiement();
  }
  if (tab === "contenu") chargerContenuPublieModo();
  if (tab === "ajouter") initModoSelects();
  if (tab === "quiz") { renderQuizAdminList(); initQuizSelects(); }
  if (tab === "zip") {
    // Charger JSZip à l'ouverture si pas encore chargé
    if (!window.JSZip) chargerJSZip().catch(() => {});
  }
  if (tab === "iazip") {
    if (!window.JSZip) chargerJSZip().catch(() => {});
    // Pré-remplir la clé depuis la config admin si disponible
    const keyInp = document.getElementById("iazip-apikey");
    if (keyInp && !keyInp.value) {
      const cfgKey = (GEMINI_KEYS_ZIP && GEMINI_KEYS_ZIP[0]) || _getCfg("geminiKeyZip") || "";
      if (cfgKey) keyInp.value = cfgKey;
    }
    _iazipRestoreLock();
    iazipCheckReady();
  }
}


function switchModoMedia(media) {
  modoMediaActuel = media;
  ["texte","fichier","video"].forEach(t => {
    const zone = document.getElementById("modoZone-" + t);
    const btn  = document.getElementById("modoMedia-" + t);
    if (zone) zone.style.display = t === media ? "block" : "none";
    if (btn)  btn.className = "modo-tab-btn" + (t === media ? " active" : "");
  });
}

function previewModoFichier(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast("❌ Fichier trop lourd (max 10 Mo)", "error"); input.value = ""; return; }
  document.getElementById("modoFichierLabel").textContent = "✅ " + file.name;
  document.getElementById("modoPreviewName").textContent = file.name;
  document.getElementById("modoPreviewSize").textContent = (file.size / 1024).toFixed(0) + " KB";
  const estWord = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.name.toLowerCase().endsWith(".docx");
  document.getElementById("modoPreviewIco").textContent = file.type.startsWith("image/") ? "🖼️" : (estWord ? "📘" : "📄");
  document.getElementById("modo-preview").style.display = "flex";
}

// ========== VIDÉO — APERÇU ET CONVERSION ==========
// Convertit n'importe quel format de lien (embed, youtu.be, watch?v=) vers le lien direct YouTube
// pour ouvrir l'app/le site YouTube directement (plus rapide qu'un iframe intégré)
function youtubeWatchUrl(url) {
  if (!url) return null;
  const m = url.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/watch?v=${m[1]}`;
  if (url.startsWith("http")) return url; // lien direct non-YouTube (mp4 etc.) : laisser tel quel
  return null;
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  // youtu.be/ID
  let m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // youtube.com/watch?v=ID
  m = url.match(/youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // youtube.com/embed/ID (déjà en embed)
  m = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  // Lien direct (mp4, etc.) → retourner tel quel
  if (url.startsWith("http")) return url;
  return null;
}

// Récupère le titre d'une vidéo YouTube via l'API publique oEmbed (gratuite, sans clé)
async function fetchYouTubeInfo(url) {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    return { title: data.title || "", author: data.author_name || "" };
  } catch(e) { return null; }
}

function previewVideo() {
  const url = document.getElementById("modo-video-url")?.value?.trim();
  if (!url) { showToast("❌ Entre un lien vidéo", "error"); return; }
  const embedUrl = getYouTubeEmbedUrl(url);
  if (!embedUrl) { showToast("❌ Lien non reconnu", "error"); return; }
  const preview = document.getElementById("modo-video-preview");
  const iframe  = document.getElementById("modo-video-iframe");
  if (preview && iframe) {
    iframe.src = embedUrl;
    preview.style.display = "block";
    showToast("✅ Aperçu chargé", "success");
  }
  // ── Description automatique : récupérer le titre YouTube et l'afficher sous le lien ──
  const descBox = document.getElementById("modo-video-desc");
  if (descBox) { descBox.style.display = "block"; descBox.innerHTML = `<div style="font-size:11px;color:var(--t2)">🔍 Récupération des infos de la vidéo...</div>`; }
  fetchYouTubeInfo(url).then(info => {
    if (!descBox) return;
    if (!info || !info.title) {
      descBox.innerHTML = `<div style="font-size:11px;color:var(--t3)">ℹ️ Impossible de récupérer automatiquement le titre de cette vidéo (lien non-YouTube ou vidéo privée).</div>`;
      return;
    }
    const safeTitle = info.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
    descBox.innerHTML = `
      <div style="background:var(--bg);border-radius:10px;padding:10px;border:1px solid var(--border)">
        <div style="font-size:9px;color:var(--t3);font-weight:800;margin-bottom:3px">🎬 TITRE DÉTECTÉ AUTOMATIQUEMENT</div>
        <div style="font-size:12px;font-weight:700;margin-bottom:6px">${info.title}</div>
        ${info.author ? `<div style="font-size:10px;color:var(--t2);margin-bottom:8px">par ${info.author}</div>` : ""}
        <button onclick="document.getElementById('modo-titre').value='${safeTitle}';showToast('✅ Titre appliqué','success')" style="background:var(--p);color:white;border:none;border-radius:8px;padding:6px 12px;font-size:11px;font-weight:700;cursor:pointer">✨ Utiliser ce titre</button>
      </div>`;
  });
}

async function publierContenu() {
  const mat    = document.getElementById("modo-mat").value;
  const classe = document.getElementById("modo-classe").value;
  const titre  = document.getElementById("modo-titre").value.trim();
  const numero = parseInt(document.getElementById("modo-numero").value);
  const premium = document.getElementById("modo-premium").checked;
  if (!mat || !classe) { showToast("❌ Choisis matière et classe", "error"); return; }
  if (!titre || !numero) { showToast("❌ Titre et numéro requis", "error"); return; }

  // ── Anti-doublons contribution normale (correspondance EXACTE de titre) ──
  const classesCiblesCheck = [classe, ...((getModoClassesSupplementaires&&getModoClassesSupplementaires())||[]).filter(c=>c!==classe)];
  if (_estDoublon(titre, mat, classesCiblesCheck.join(","))) {
    showToast(`⚠️ Doublon détecté — "${titre}" existe déjà pour cette classe/matière`, "error");
    return;
  }

  // ── Anti-doublons par similarité de titre (Clé 2 Gemini, même logique que
  // pour les élèves : rejet automatique ≥80%, file d'attente "à vérifier"
  // entre 55-80%) — décision Jean : le modérateur n'a pas de passe-droit ici. ──
  const verifDoublonModo = await verifierDoublonAvantPublicationRapide(titre, mat, classesCiblesCheck.join(","));
  if (verifDoublonModo.niveau === "doublon") {
    showToast(`⚠️ Doublon détecté (${Math.round(verifDoublonModo.score*100)}% similaire à "${(verifDoublonModo.contenuSimilaire?.titre||"").slice(0,40)}")`, "error");
    return;
  }
  if (verifDoublonModo.niveau === "zone_grise") {
    _ajouterAFileVerificationDoublons({
      titreCandidat: verifDoublonModo.titre, score: verifDoublonModo.score,
      titreSimilaire: verifDoublonModo.contenuSimilaire?.titre || "",
      idContenuSimilaire: verifDoublonModo.contenuSimilaire?.id || null,
      mat, classe: classesCiblesCheck.join(","),
      contexte: { type: "publication_modo", titre, numero },
    });
    showToast(`⏳ Mis en file de vérification — ${Math.round(verifDoublonModo.score*100)}% similaire à un contenu existant. Vérifie dans "Doublons à vérifier".`, "info");
    return;
  }

  // ── Liste des classes ciblées : classe principale + classes supplémentaires cochées ──
  const classesSupp = getModoClassesSupplementaires();
  const classesCibles = [classe, ...classesSupp.filter(c => c !== classe)];

  let contenu = "", fichierType = null, fichierNom = null, fichierUrl = null;
  let videoUrl = null;
  const description = document.getElementById("modo-video-description-manuelle")?.value?.trim() || "";

  if (modoMediaActuel === "texte") {
    contenu = document.getElementById("modo-contenu").value.trim();
    if (!contenu) { showToast("❌ Le contenu est vide","error"); return; }

  } else if (modoMediaActuel === "video") {
    // ── Mode vidéo ──
    const rawUrl = document.getElementById("modo-video-url")?.value?.trim();
    if (!rawUrl) { showToast("❌ Entre le lien de la vidéo","error"); return; }
    videoUrl = getYouTubeEmbedUrl(rawUrl);
    if (!videoUrl) { showToast("❌ Lien vidéo non reconnu","error"); return; }
    contenu = `[VIDEO:${videoUrl}]`;
    fichierType = "video";

  } else {
    // ── Mode fichier : upload UNE SEULE FOIS, réutilisé pour toutes les classes ciblées ──
    const fi = document.getElementById("modo-fichier").files[0];
    if (!fi) { showToast("❌ Choisis un fichier","error"); return; }
    const allowed = [
      "application/pdf","image/jpeg","image/png","image/jpg",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    const nomMinFi = (fi.name || "").toLowerCase();
    if (!allowed.includes(fi.type) && !nomMinFi.endsWith(".pdf") && !nomMinFi.endsWith(".docx")) {
      showToast("❌ Seuls les PDF, photos (JPG/PNG) et Word (.docx) sont acceptés","error"); return;
    }
    const _objIdTemp = Date.now();
    fichierUrl = await uploadToCloudinary(fi, _objIdTemp);
    if (!fichierUrl) {
      showToast("❌ Upload Cloudinary échoué — publication annulée. Vérifie ta connexion et réessaie.", "error");
      return; // ← BLOQUER la publication si l'URL est vide
    }
    fichierType = fi.type; fichierNom = fi.name;
    contenu = `[CLOUD: ${fichierUrl}]`;
  }

  // Mappe le type de document choisi dans le panel modérateur vers le type
  // "court" utilisé par l'app pour classer le contenu au bon endroit
  // (même mapping que pour l'import ZIP, ZIP_TYPE_VERS_TYPE_APP).
  // AVANT : tout ce qui n'était ni vidéo ni examen_officiel tombait dans "cours"
  // par défaut → une Séquentielle/La Zone/Compétence publiée ici se retrouvait
  // mélangée dans l'onglet Cours au lieu d'apparaître dans Séquentielles /
  // Travaux Dirigés.
  const MODO_TYPE_VERS_TYPE_APP = {
    cours: "cours", sequencielle: "sequencielle", examen_officiel: "examen",
    la_zone: "la_zone", competences: "competences"
  };
  const typeOnglet = (modoMediaActuel === "video") ? "video" : (MODO_TYPE_VERS_TYPE_APP[modoDocTypeActuel] || "cours");
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  const titreNorm = _normaliserTitre(titre);

  // ── Chercher une ligne EXISTANTE identique (même mat/numero/type/titre), peu importe sa classe ──
  // Si trouvée : on FUSIONNE les nouvelles classes dedans (1 seule ligne partagée, pas de copie).
  // Sinon : on crée une seule ligne neuve avec toutes les classes ciblées regroupées.
  let ligneExistante = publies.find(p =>
    p.mat === mat && p.numero === numero && p.type === typeOnglet &&
    _normaliserTitre(p.titre) === titreNorm
  );
  let ligneExistanteTurso = null;
  if (!ligneExistante && turso) {
    try {
      const r = await turso.execute({
        sql: "SELECT id, classe FROM contenu WHERE mat=? AND numero=? AND type=? AND LOWER(TRIM(titre))=LOWER(TRIM(?)) LIMIT 1",
        args: [mat, numero, typeOnglet, titre]
      });
      if (r.rows.length > 0) ligneExistanteTurso = { id: r.rows[0].id, classe: r.rows[0].classe || "" };
    } catch(e) {}
  }

  const classesExistantes = ligneExistante
    ? (ligneExistante.classe || "").split(",").map(s => s.trim()).filter(Boolean)
    : ligneExistanteTurso
      ? (ligneExistanteTurso.classe || "").split(",").map(s => s.trim()).filter(Boolean)
      : [];

  const nouvellesClasses = classesCibles.filter(c => !classesExistantes.includes(c));

  if ((ligneExistante || ligneExistanteTurso) && nouvellesClasses.length === 0) {
    showToast("⚠️ Ce contenu existe déjà pour toutes les classes sélectionnées", "error");
    return;
  }

  if (ligneExistante || ligneExistanteTurso) {
    // ── FUSION : on ajoute les nouvelles classes ET on met à jour le statut Premium
    // (BUG corrigé : avant, le statut Premium coché ici était silencieusement ignoré
    // si une ligne du même titre existait déjà — elle gardait son ancien statut,
    // souvent "gratuit" suite à un import initial) ──
    const classeFusionnee = [...classesExistantes, ...nouvellesClasses].join(",");
    const idCible = ligneExistante ? ligneExistante.id : ligneExistanteTurso.id;

    if (ligneExistante) {
      const idx = publies.findIndex(p => String(p.id) === String(ligneExistante.id));
      if (idx >= 0) { publies[idx].classe = classeFusionnee; publies[idx].premium = premium; }
    } else {
      // La ligne n'était connue que de Turso : on l'ajoute aussi en local pour cohérence
      publies.push({
        id: idCible, type: typeOnglet, typeFichier: modoDocTypeActuel,
        lycee: modoLyceeActuel, mat, classe: classeFusionnee, titre, numero, contenu,
        fichierData: null, fichierType, fichierNom, fichierUrl,
        videoUrl, premium, description, auteur: localStorage.getItem("userPhone")||"admin", date: Date.now()
      });
    }
    localStorage.setItem("contenu_publie", JSON.stringify(publies));

    if (turso) {
      try { await turso.execute({ sql: "UPDATE contenu SET classe=?, premium=? WHERE id=?", args: [classeFusionnee, premium?1:0, idCible] }); }
      catch(e) { console.warn("[LearnUpr] Fusion classe Turso :", e.message); }
    }

    showToast(`🚀 Ajouté pour ${nouvellesClasses.join(", ")} (déjà présent pour ${classesExistantes.join(", ")})`, "success");
    addNotification("🚀 Publié", `"${titre}" est maintenant disponible (${[...classesExistantes, ...nouvellesClasses].join(", ")})`, "success");

  } else {
    // ── Aucune ligne existante : créer UNE SEULE ligne neuve partagée entre toutes les classes ciblées ──
    const _nowId = Date.now();
    const classePartagee = classesCibles.join(",");
    const obj = {
      id: _nowId, type: typeOnglet, typeFichier: modoDocTypeActuel,
      lycee: modoLyceeActuel, mat, classe: classePartagee, titre, numero, contenu,
      fichierData: null, fichierType, fichierNom, fichierUrl,
      videoUrl, premium, description, auteur: localStorage.getItem("userPhone")||"admin", date: _nowId
    };
    // Si l'URL Cloudinary est présente, s'assurer qu'elle est propagée dans tous les stores
    if (fichierUrl) _propagateCloudinaryUrl(fichierUrl, fichierNom || "", obj.id);
    publies.push(obj);
    localStorage.setItem("contenu_publie", JSON.stringify(publies));

    if (turso) {
      try {
        await turso.execute({
          sql:"INSERT INTO contenu (id,type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,fichier_type,fichier_nom,lycee,premium,description,auteur,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          args:[_nowId, typeOnglet, modoDocTypeActuel, mat, classePartagee, titre, numero, contenu, fichierUrl||videoUrl||"", fichierType||"", fichierNom||"", modoLyceeActuel, premium?1:0, description, obj.auteur, _nowId]
        });
      } catch(e) {
        // Si l'insert avec id échoue (ex: conflit), on tente sans id et on met à jour le localStorage
        try {
          const r2 = await turso.execute({
            sql:"INSERT INTO contenu (type,type_fichier,mat,classe,titre,numero,contenu,fichier_url,fichier_type,fichier_nom,lycee,premium,description,auteur,date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            args:[typeOnglet, modoDocTypeActuel, mat, classePartagee, titre, numero, contenu, fichierUrl||videoUrl||"", fichierType||"", fichierNom||"", modoLyceeActuel, premium?1:0, description, obj.auteur, _nowId]
          });
          const tursoId = r2?.lastInsertRowid ?? r2?.last_insert_rowid ?? null;
          if (tursoId && String(tursoId) !== String(_nowId)) {
            const idx = publies.findIndex(p => String(p.id) === String(_nowId));
            if (idx >= 0) publies[idx].id = tursoId;
            localStorage.setItem("contenu_publie", JSON.stringify(publies));
          }
        } catch(e2) {}
      }
    }

    const msg = classesCibles.length > 1
      ? `🚀 Publié pour ${classesCibles.join(", ")} ! (1 seule ligne partagée)`
      : "🚀 Contenu publié !";
    showToast(msg, "success");
    addNotification("🚀 Publié", `"${titre}" est maintenant disponible (${classesCibles.join(", ")})`, "success");
  }

  // Reset formulaire
  document.getElementById("modo-titre").value = "";
  document.getElementById("modo-numero").value = "";
  document.getElementById("modo-contenu").value = "";
  document.getElementById("modo-fichier").value = "";
  document.getElementById("modo-preview").style.display = "none";
  document.getElementById("modoFichierLabel").textContent = "Appuie pour choisir";
  if (document.getElementById("modo-video-url")) document.getElementById("modo-video-url").value = "";
  if (document.getElementById("modo-video-preview")) document.getElementById("modo-video-preview").style.display = "none";
  if (document.getElementById("modo-video-desc")) { document.getElementById("modo-video-desc").style.display = "none"; document.getElementById("modo-video-desc").innerHTML = ""; }
  if (document.getElementById("modo-video-description-manuelle")) document.getElementById("modo-video-description-manuelle").value = "";
  // Décocher les classes supplémentaires après publication
  document.querySelectorAll(".modo-multiclasse-cb").forEach(cb => cb.checked = false);
  renderContent();
}

async function chargerContribsModo() {
  const el = document.getElementById("modoContribList");
  if (!el) return;

  let locales = JSON.parse(localStorage.getItem("contributions_locales") || "[]").filter(c => c.statut === "en_attente");

  if (turso) {
    try {
      const res = await turso.execute({ sql: "SELECT * FROM contributions WHERE statut='en_attente' ORDER BY date DESC LIMIT 30", args: [] });
      // Merger sans doublons par id
      const tursoRows = (res.rows || []).map(r => ({ ...r, id: r.id }));
      const localIds = new Set(locales.map(c => String(c.id)));
      for (const r of tursoRows) { if (!localIds.has(String(r.id))) locales.push(r); }
    } catch(e) {}
  }

  if (locales.length === 0) { el.innerHTML = `<div class="empty-state">✅ Aucune contribution en attente</div>`; return; }
  const typeLabels = { sequencielle: "📋 Séq.", cours: "📚 Cours", examen_officiel: "🏆 Officiel", la_zone: "🔥 La Zone", competences: "🎯 Compét." };
  el.innerHTML = locales.map(c => `
    <div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid ${c.doublonPotentiel ? '#f59e0b' : 'var(--border)'}">
      ${c.doublonPotentiel ? `<div style="background:#FEF3C7;color:#92400E;font-size:10px;font-weight:800;padding:5px 8px;border-radius:8px;margin-bottom:8px">⚠️ Doublon potentiel détecté — vérifie aussi l'onglet "🔍 Doublons"</div>` : ''}
      <div style="font-weight:800;font-size:13px;margin-bottom:4px">${c.titre || c.nom_fichier || "Sans titre"}</div>
      <div style="font-size:11px;color:var(--t3);margin-bottom:4px">${(c.mat||"").replace(/_/g," ")} · ${c.classe||""} · ${typeLabels[c.typeFichier || c.type_fichier] || ""}</div>
      <div style="font-size:10px;color:var(--t3);margin-bottom:8px">👤 ${c.auteur || "?"} · ${c.date ? new Date(c.date).toLocaleDateString("fr-FR") : ""}</div>
      <div style="font-size:12px;color:var(--t2);margin-bottom:12px">${c.fichierNom || c.fichier_nom ? "📎 "+(c.fichierNom||c.fichier_nom) : (c.contenu||"").substring(0,100)+"..."}</div>
      <div style="display:flex;gap:8px">
        <button onclick="validerContribModo(${c.id})" style="flex:1;background:var(--p);color:white;border:none;border-radius:10px;padding:10px;font-weight:700;font-size:12px;cursor:pointer">✅ Approuver</button>
        <button onclick="rejeterContribModo(${c.id})" style="background:var(--red);color:white;border:none;border-radius:10px;padding:10px;font-weight:700;font-size:12px;cursor:pointer">❌</button>
      </div>
    </div>`).join("");
}

async function validerContribModo(id) {
  const locales = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
  const idx = locales.findIndex(c => c.id === id);
  if (idx === -1 && turso) {
    // Valider depuis Turso directement
    try { await turso.execute({ sql: "UPDATE contributions SET statut='approuve' WHERE id=?", args: [id] }); } catch(e) {}
    showToast("✅ Approuvée !", "success");
    chargerContribsModo(); chargerContributionsEnAttente();
    return;
  }
  if (idx === -1) return;
  const c = locales[idx];
  // Anti-doublon avant publication
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  const doublon = publies.find(p =>
    _normaliserTitre(p.titre) === _normaliserTitre(c.titre) &&
    p.mat === c.mat &&
    _classeMatch(p.classe, c.classe)
  );
  if (doublon) {
    showToast("⚠️ Épreuve déjà publiée", "error");
    locales[idx].statut = "rejete";
    localStorage.setItem("contributions_locales", JSON.stringify(locales));
    chargerContribsModo(); return;
  }
  c.statut = "approuve"; locales[idx] = c;
  localStorage.setItem("contributions_locales", JSON.stringify(locales));
  // Publier automatiquement
  publies.push({ ...c, type:"examen", typeFichier: c.typeFichier || "examen_officiel", numero: publies.length+1, premium:false, id:Date.now(), fichierData:null });
  localStorage.setItem("contenu_publie", JSON.stringify(publies));

  // Turso
  if (turso) {
    try { await turso.execute({ sql: "UPDATE contributions SET statut='approuve' WHERE id=?", args: [id] }); } catch(e) {}
  }

  // Vérif compteur 10 approuvées → Premium
  const auteurPhone = c.auteur;
  let approuveesCount = locales.filter(l => l.auteur === auteurPhone && l.statut === "approuve").length;
  if (turso) {
    try {
      const r = await turso.execute({ sql: "SELECT COUNT(*) as n FROM contributions WHERE auteur=? AND statut='approuve'", args: [auteurPhone] });
      approuveesCount = r.rows[0]?.n || approuveesCount;
    } catch(e) {}
  }
  if (approuveesCount > 0 && approuveesCount % 10 === 0) {
    if (turso) { try { await turso.execute({ sql: "UPDATE users SET is_premium=1 WHERE phone=?", args: [auteurPhone] }); } catch(e) {} }
    const currentPhone = localStorage.getItem("userPhone") || "";
    if (currentPhone === auteurPhone) {
      isPremium = true; localStorage.setItem("isPremium", "true");
      showToast("🎁 10 contributions ! Premium offert !", "success");
    }
  }

  showToast("✅ Approuvée et publiée !", "success");
  addNotification("✅ Contribution approuvée", `"${c.titre}" est maintenant visible`, "success");
  chargerContribsModo(); chargerContributionsEnAttente(); renderContent();
}

function rejeterContribModo(id) {
  const locales = JSON.parse(localStorage.getItem("contributions_locales") || "[]");
  const idx = locales.findIndex(c => c.id === id);
  if (idx > -1) { locales[idx].statut = "rejete"; localStorage.setItem("contributions_locales", JSON.stringify(locales)); }
  showToast("🗑️ Contribution rejetée", "error");
  chargerContribsModo(); chargerContributionsEnAttente();
}

// ========== OUTIL DE RÉPARATION : corriger le champ "lycee" de contenus déjà publiés ==========
// Réanalyse le TITRE de chaque contenu déjà publié (le nom de fichier original
// n'est pas conservé après publication) pour détecter s'il aurait dû être
// marqué "autres lycées" — utile pour les fichiers publiés avant l'ajout de
// cette détection. Affiche d'abord la liste des changements proposés ; rien
// n'est appliqué sans validation explicite du modérateur.
let _reparationLyceeProposition = []; // [{id, titre, ancien, nouveau}]

// ========== DIAGNOSTIC : voir l'état RÉEL des données sans console ==========
function diagnostiquerExamensAutres() {
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  const candidats = publies.filter(c => (c.typeFichier === "examen_officiel" || c.type === "examen"));

  const lignes = candidats.map(c => {
    const matchClasse = _classeMatch(c.classe, activeClasse);
    const apparaitDansExamens = (c.lycee !== "autres") && matchClasse;
    return `
      <div style="background:var(--bg);border-radius:10px;padding:8px 10px;margin-bottom:6px;font-size:10px;font-family:monospace;border:1px solid ${apparaitDansExamens && c.lycee==='autres' ? 'var(--red)' : 'var(--border)'}">
        <div style="font-weight:800;font-size:11px;font-family:inherit;margin-bottom:4px">${esc(c.titre)}</div>
        id=${esc(String(c.id))}<br>
        type="<b>${esc(String(c.type))}</b>" · typeFichier="<b>${esc(String(c.typeFichier))}</b>"<br>
        lycee="<b>${esc(String(c.lycee))}</b>" (type: ${typeof c.lycee})<br>
        classe="${esc(String(c.classe))}"<br>
        classeActive="${esc(activeClasse)}" → _classeMatch = <b>${matchClasse}</b><br>
        <span style="color:${apparaitDansExamens?'var(--red)':'var(--green2)'};font-weight:800">
          ${apparaitDansExamens ? "⚠️ APPARAÎT dans Examens" : "✅ N'apparaît PAS dans Examens"}
        </span>
      </div>`;
  }).join("");

  const el = document.getElementById("modoReparationLyceeSection");
  if (!el) return;
  el.style.display = "block";
  el.innerHTML = `
    <div style="background:var(--card);border-radius:14px;padding:14px;border:1px solid var(--border);margin-bottom:10px">
      <div style="font-weight:800;font-size:13px;margin-bottom:8px">🔍 Diagnostic — ${candidats.length} épreuve(s), classe active = ${esc(activeClasse)}</div>
      <div style="max-height:400px;overflow-y:auto">${lignes || '<div style="font-size:11px;color:var(--t3)">Aucune épreuve trouvée.</div>'}</div>
      <button onclick="document.getElementById('modoReparationLyceeSection').style.display='none'" style="width:100%;margin-top:8px;background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:9px;font-weight:700;font-size:12px;cursor:pointer">Fermer</button>
    </div>`;
}

function analyserReparationLycee() {
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  _reparationLyceeProposition = [];
  for (const c of publies) {
    const ancien = c.lycee || "principal";
    const nouveau = _detecterLyceeDepuisTexte(c.titre || "");
    if (nouveau !== ancien) {
      _reparationLyceeProposition.push({ id: String(c.id).trim(), titre: c.titre || "(sans titre)", ancien, nouveau });
    }
  }
  afficherPropositionReparationLycee();
}

function afficherPropositionReparationLycee() {
  const el = document.getElementById("modoReparationLyceeSection");
  if (!el) return;
  if (!_reparationLyceeProposition.length) {
    el.innerHTML = `<div class="empty-state" style="padding:16px">✅ Aucune incohérence détectée — tous les contenus semblent déjà bien classés.</div>`;
    el.style.display = "block";
    return;
  }
  el.style.display = "block";
  el.innerHTML = `
    <div style="background:var(--card);border-radius:14px;padding:14px;border:1px solid var(--border);margin-bottom:10px">
      <div style="font-weight:800;font-size:13px;margin-bottom:8px">🔧 ${_reparationLyceeProposition.length} changement(s) proposé(s)</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px;max-height:320px;overflow-y:auto">
        ${_reparationLyceeProposition.map((p, idx) => `
          <label style="display:flex;align-items:center;gap:8px;background:var(--bg);border-radius:10px;padding:8px 10px;font-size:11px;cursor:pointer">
            <input type="checkbox" class="reparation-lycee-check" data-idx="${idx}" checked style="width:16px;height:16px;flex-shrink:0;margin:0">
            <div style="flex:1">
              <div style="font-weight:700">${p.titre}</div>
              <div style="color:var(--t3);font-size:10px">${p.ancien === "principal" ? "🏠 Principal" : "🏫 Autres"} → ${p.nouveau === "principal" ? "🏠 Principal" : "🏫 Autres"}</div>
            </div>
          </label>`).join("")}
      </div>
      <div style="display:flex;gap:6px">
        <button onclick="appliquerReparationLycee()" style="flex:1;background:linear-gradient(135deg,var(--p),var(--p2));color:white;border:none;border-radius:10px;padding:9px;font-weight:800;font-size:12px;cursor:pointer">✅ Appliquer la sélection</button>
        <button onclick="document.getElementById('modoReparationLyceeSection').style.display='none'" style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:9px 14px;font-weight:700;font-size:12px;cursor:pointer">Annuler</button>
      </div>
    </div>`;
}

async function appliquerReparationLycee() {
  const cases = [...document.querySelectorAll('.reparation-lycee-check:checked')];
  const indices = cases.map(cb => parseInt(cb.dataset.idx, 10));
  if (!indices.length) { showToast("❌ Aucune correction sélectionnée", "error"); return; }

  const aAppliquer = indices.map(i => _reparationLyceeProposition[i]);
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  for (const p of aAppliquer) {
    const item = publies.find(c => String(c.id).trim() === p.id);
    if (item) item.lycee = p.nouveau;
  }
  localStorage.setItem("contenu_publie", JSON.stringify(publies));

  let nbEchecs = 0;
  if (turso) {
    for (const p of aAppliquer) {
      try {
        let res = await turso.execute({ sql: "UPDATE contenu SET lycee=? WHERE id=?", args: [p.nouveau, p.id] });
        if (!res.rowsAffected && !isNaN(Number(p.id))) {
          res = await turso.execute({ sql: "UPDATE contenu SET lycee=? WHERE id=?", args: [p.nouveau, Number(p.id)] });
        }
        if (!res.rowsAffected) { nbEchecs++; console.warn("[LearnUpr] Réparation lycee : aucune ligne affectée pour id=", p.id); }
      } catch(e) { nbEchecs++; console.warn("[LearnUpr] Réparation lycee Turso :", e.message); }
    }
  }

  if (nbEchecs) {
    showToast(`⚠️ ${aAppliquer.length - nbEchecs} corrigé(s), ${nbEchecs} non confirmé(s) sur le serveur`, "error");
  } else {
    showToast(`✅ ${aAppliquer.length} fichier(s) corrigé(s)`, "success");
  }
  document.getElementById("modoReparationLyceeSection").style.display = "none";
  chargerContenuPublieModo();
  renderContent();
}

let modoSelectionMultiple = false; // mode sélection actif ou non pour la liste contenu publié

function toggleSelectionMultipleModo() {
  modoSelectionMultiple = !modoSelectionMultiple;
  chargerContenuPublieModo();
}

function toggleSelectionContenuModo(id) {
  // Juste pour mettre à jour le compteur/bouton, la case gère son propre état visuel
  const nbCoches = document.querySelectorAll('#modoContenuList input[type="checkbox"]:checked').length;
  const btn = document.getElementById("modoSupprSelectionBtn");
  if (btn) {
    btn.textContent = `🗑️ Supprimer (${nbCoches})`;
    btn.disabled = nbCoches === 0;
    btn.style.opacity = nbCoches === 0 ? "0.5" : "1";
  }
}

function supprimerSelectionContenuModo() {
  const cases = [...document.querySelectorAll('#modoContenuList input[type="checkbox"]:checked')];
  const ids = cases.map(cb => cb.dataset.id);
  if (!ids.length) { showToast("❌ Aucun fichier sélectionné", "error"); return; }

  _confirmAndroid(`Supprimer définitivement ces ${ids.length} fichier(s) ?`, function() {
    const idsSet = new Set(ids);

    // ── 0. Récupérer les URLs des fichiers AVANT de les retirer, pour aussi
    // les supprimer physiquement sur Cloudinary ──
    const publiesAvant = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
    const urlsFichiers = publiesAvant
      .filter(c => idsSet.has(String(c.id).trim()))
      .map(c => c.fichierUrl)
      .filter(Boolean);

    // ── 1. Supprimer du localStorage en une seule passe ──
    const publies = publiesAvant.filter(c => !idsSet.has(String(c.id).trim()));
    localStorage.setItem("contenu_publie", JSON.stringify(publies));

    // ── 2. Supprimer de Turso, un par un mais en parallèle ──
    if (turso) {
      (async () => {
        for (const sid of ids) {
          try {
            await turso.execute({ sql: "DELETE FROM contenu WHERE id=?", args: [sid] });
          } catch(e) {
            console.warn("[LearnUpr] Suppression multiple Turso :", e.message);
          }
        }
      })();
    }

    // ── 3. Supprimer les fichiers physiques sur Cloudinary, en arrière-plan ──
    (async () => {
      for (const url of urlsFichiers) await supprimerFichierCloudinary(url);
    })();

    showToast(`🗑️ ${ids.length} fichier(s) supprimé(s)`, "success");
    modoSelectionMultiple = false;
    chargerContenuPublieModo();
    renderContent();
  });
}

// Bascule manuellement le lycee d'UN fichier précis (principal <-> autres),
// utile pour les cas que l'outil de réparation automatique ne détecte pas
// (titre déjà publié sans mot-clé reconnaissable).
async function basculerLyceeContenuModo(id) {
  const sid = String(id).trim();
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  const item = publies.find(c => String(c.id).trim() === sid);
  if (!item) { showToast("❌ Fichier introuvable", "error"); return; }
  const nouveau = item.lycee === "autres" ? "principal" : "autres";
  item.lycee = nouveau;
  localStorage.setItem("contenu_publie", JSON.stringify(publies));

  let tursoOk = true;
  if (turso) {
    try {
      // Tente la mise à jour avec l'id tel quel, puis en numérique si rien n'a été touché
      // (l'id peut être stocké comme INTEGER côté Turso alors que sid est une string).
      let res = await turso.execute({ sql: "UPDATE contenu SET lycee=? WHERE id=?", args: [nouveau, sid] });
      if (!res.rowsAffected && !isNaN(Number(sid))) {
        res = await turso.execute({ sql: "UPDATE contenu SET lycee=? WHERE id=?", args: [nouveau, Number(sid)] });
      }
      if (!res.rowsAffected) {
        tursoOk = false;
        console.warn("[LearnUpr] Bascule lycee : aucune ligne Turso affectée pour id=", sid);
      }
    } catch(e) {
      tursoOk = false;
      console.warn("[LearnUpr] Bascule lycee Turso :", e.message);
    }
  }

  if (tursoOk) {
    showToast(nouveau === "autres" ? "🏫 Marqué comme Autre lycée" : "🏠 Remis au lycée principal", "success");
  } else {
    showToast("⚠️ Changé localement, mais pas confirmé sur le serveur — peut revenir en arrière", "error");
  }
  chargerContenuPublieModo();
  renderContent();
}

// Bascule le statut Premium/Gratuit d'UN contenu déjà publié — réservé à
// l'admin (le modérateur ne voit même pas le bouton, voir chargerContenuPublieModo,
// et cette vérification est refaite ici en garde-fou si jamais la fonction est
// appelée directement, par ex. depuis la console).
async function basculerPremiumContenuModo(id) {
  if (!_isAdminSession()) { showToast("⛔ Réservé à l'administrateur", "error"); return; }
  const sid = String(id).trim();
  const publies = JSON.parse(localStorage.getItem("contenu_publie") || "[]");
  const item = publies.find(c => String(c.id).trim() === sid);
  if (!item) { showToast("❌ Fichier introuvable", "error"); return; }
  const nouveau = !(item.premium === true || item.premium === 1 || item.premium === "1");
  item.premium = nouveau;
  localStorage.setItem("contenu_publie", JSON.stringify(publies));

  let tursoOk = true;
  if (turso) {
    try {
      let res = await turso.execute({ sql: "UPDATE contenu SET premium=? WHERE id=?", args: [nouveau ? 1 : 0, sid] });
      if (!res.rowsAffected && !isNaN(Number(sid))) {
        res = await turso.execute({ sql: "UPDATE contenu SET premium=? WHERE id=?", args: [nouveau ? 1 : 0, Number(sid)] });
      }
      if (!res.rowsAffected) {
        tursoOk = false;
        console.warn("[LearnUpr] Bascule premium : aucune ligne Turso affectée pour id=", sid);
      }
    } catch(e) {
      tursoOk = false;
      console.warn("[LearnUpr] Bascule premium Turso :", e.message);
    }
  }

  if (tursoOk) {
    showToast(nouveau ? "🔒 Passé en Premium" : "🆓 Passé en Gratuit", "success");
  } else {
    showToast("⚠️ Changé localement, mais pas confirmé sur le serveur — peut revenir en arrière", "error");
  }
  chargerContenuPublieModo();
  renderContent();
}

function chargerContenuPublieModo() {
  const el = document.getElementById("modoContenuList");
  if (!el) return;
  const publies = getContenuPublie();
  if (publies.length === 0) { el.innerHTML = `<div class="empty-state">📭 Aucun contenu publié</div>`; return; }

  // ── Barre d'actions : activer la sélection multiple / supprimer la sélection / réparer le classement lycée ──
  const barre = `
    <div style="display:flex;gap:6px;margin-bottom:10px;flex-wrap:wrap">
      <button onclick="toggleSelectionMultipleModo()" style="background:${modoSelectionMultiple?'var(--p)':'var(--card)'};color:${modoSelectionMultiple?'white':'var(--text)'};border:1px solid var(--border);border-radius:10px;padding:7px 12px;font-weight:800;font-size:11px;cursor:pointer">
        ${modoSelectionMultiple ? "✖️ Annuler la sélection" : "☑️ Sélectionner plusieurs"}
      </button>
      ${modoSelectionMultiple ? `
      <button id="modoSupprSelectionBtn" onclick="supprimerSelectionContenuModo()" disabled style="background:var(--red);color:white;border:none;border-radius:10px;padding:7px 12px;font-weight:800;font-size:11px;cursor:pointer;opacity:0.5">
        🗑️ Supprimer (0)
      </button>` : ""}
      <button onclick="analyserReparationLycee()" style="background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:7px 12px;font-weight:800;font-size:11px;cursor:pointer">
        🔧 Vérifier le classement Lycée
      </button>
      <button onclick="diagnostiquerExamensAutres()" style="background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:7px 12px;font-weight:800;font-size:11px;cursor:pointer">
        🔍 Diagnostic
      </button>
    </div>
    <div id="modoReparationLyceeSection" style="display:none"></div>`;

  el.innerHTML = barre + publies.slice().reverse().map(c => {
    const estVideo = !!(c.videoUrl || (c.contenu && c.contenu.startsWith("[VIDEO:")));
    const cid = String(c.id).trim();
    return `
    <div style="background:var(--card);border-radius:14px;padding:12px 14px;margin-bottom:8px;border:1px solid var(--border);display:flex;align-items:center;gap:10px">
      ${modoSelectionMultiple ? `<input type="checkbox" data-id="${cid}" onchange="toggleSelectionContenuModo('${cid}')" style="width:18px;height:18px;flex-shrink:0;margin:0">` : ""}
      <div style="flex:1">
        <div style="font-weight:800;font-size:12px">${estVideo ? "🎬 " : ""}${c.titre}</div>
        <div style="font-size:10px;color:var(--t3)">${c.type==="cours"?"📚":"🏆"} · ${(c.mat||"").replace(/_/g," ")} · ${_classeAffichage(c.classe)} · <span class="chip ${c.premium?"orange":"green"}">${c.premium?"🔒 Premium":"🆓 Gratuit"}</span>${c.lycee==="autres"?' · <span class="chip">🏫 Autres</span>':''}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0">
        ${!modoSelectionMultiple && _isAdminSession() ? `<button onclick="basculerPremiumContenuModo('${cid}')" style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer" title="${c.premium?'Passer en Gratuit':'Passer en Premium'}">${c.premium?'🆓':'🔒'}</button>` : ""}
        ${!modoSelectionMultiple ? `<button onclick="basculerLyceeContenuModo('${cid}')" style="background:var(--bg);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer" title="${c.lycee==='autres'?'Remettre au lycée principal':'Marquer comme autre lycée'}">${c.lycee==='autres'?'🏠':'🏫'}</button>` : ""}
        ${estVideo && !modoSelectionMultiple ? `<button onclick="remplacerLienVideo('${cid}')" style="background:var(--p);color:white;border:none;border-radius:8px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer" title="Remplacer le lien">✏️</button>` : ""}
        ${!modoSelectionMultiple ? `<button onclick="supprimerContenuPublie('${cid}')" style="background:var(--red);color:white;border:none;border-radius:8px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer">🗑️</button>` : ""}
      </div>
    </div>`;
  }).join("");
}

// Remplacer le lien d'une vidéo déjà publiée, sans la supprimer/recréer (garde id, classe, numéro, premium…)
function remplacerLienVideo(id) {
  const sid = String(id).trim();
  const publies = getContenuPublie();
  const idx = publies.findIndex(c => String(c.id).trim() === sid);
  if (idx === -1) { showToast("❌ Contenu introuvable", "error"); return; }
  const ancien = publies[idx];
  const ancienUrl = ancien.videoUrl || (ancien.contenu || "").replace("[VIDEO:", "").replace("]", "");

  const nouveauLien = prompt("🎬 Nouveau lien YouTube pour remplacer celui-ci :\n\nAncien lien :\n" + ancienUrl, "");
  if (!nouveauLien || !nouveauLien.trim()) return; // annulé

  const nouvelleEmbedUrl = getYouTubeEmbedUrl(nouveauLien.trim());
  if (!nouvelleEmbedUrl) { showToast("❌ Lien vidéo non reconnu", "error"); return; }

  publies[idx].videoUrl = nouvelleEmbedUrl;
  publies[idx].contenu = `[VIDEO:${nouvelleEmbedUrl}]`;
  localStorage.setItem("contenu_publie", JSON.stringify(publies));

  if (turso) {
    (async () => {
      try {
        await turso.execute({
          sql: "UPDATE contenu SET contenu=?, fichier_url=? WHERE id=?",
          args: [`[VIDEO:${nouvelleEmbedUrl}]`, nouvelleEmbedUrl, sid]
        });
      } catch(e) { console.warn("[LearnUpr] Remplacement lien vidéo Turso :", e.message); }
    })();
  }

  showToast("✅ Lien vidéo remplacé !", "success");
  chargerContenuPublieModo();
  renderContent();
}

// ========== SUPPRESSION CLOUDINARY ==========
// Calcule le SHA-1 hexadécimal d'une chaîne, requis pour signer les requêtes
// à l'API Admin Cloudinary (disponible nativement via crypto.subtle, pas de
// librairie externe nécessaire).
async function _sha1Hex(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  return [...new Uint8Array(hashBuffer)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// Supprime un fichier sur Cloudinary à partir de son URL complète.
// Retourne true si la suppression a réussi (ou si l'URL n'était pas une URL
// Cloudinary reconnaissable, pour ne jamais bloquer la suppression côté app
// même si le fichier physique ne peut pas être retrouvé).
async function supprimerFichierCloudinary(url) {
  if (!url || !url.includes("res.cloudinary.com")) return true; // rien à supprimer côté Cloudinary
  if (!CLOUDINARY_API_KEY || CLOUDINARY_API_KEY.startsWith("REMPLACER")) {
    console.warn("[LearnUpr] Clés Cloudinary non configurées, suppression du fichier physique ignorée.");
    return false;
  }
  try {
    // Format typique : https://res.cloudinary.com/{cloud}/{resource_type}/upload/v{version}/{public_id}.{ext}
    const m = url.match(/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
    if (!m) { console.warn("[LearnUpr] URL Cloudinary non reconnue pour suppression :", url); return false; }
    const resourceType = m[1];
    const publicId = m[2];

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`;
    const signature = await _sha1Hex(paramsToSign + CLOUDINARY_API_SECRET);

    const cloudName = CLOUDINARY_CLOUD_NAME || (CLOUDINARY_URL.match(/v1_1\/([^/]+)/) || [])[1] || "";
    const body = new URLSearchParams({
      public_id: publicId, timestamp: String(timestamp), api_key: CLOUDINARY_API_KEY, signature
    });
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body
    });
    const data = await res.json();
    if (data.result !== "ok" && data.result !== "not found") {
      console.warn("[LearnUpr] Suppression Cloudinary non confirmée :", data);
      return false;
    }
    return true;
  } catch (e) {
    console.warn("[LearnUpr] Erreur suppression Cloudinary :", e.message);
    return false;
  }
}

function supprimerContenuPublie(id) {
  _confirmAndroid("Supprimer ce contenu définitivement ?", function() {
  const sid = String(id).trim();

  // ── 0. Récupérer l'URL du fichier AVANT de le retirer, pour pouvoir aussi
  // le supprimer physiquement sur Cloudinary ──
  const publiesAvant = getContenuPublie();
  const item = publiesAvant.find(c => String(c.id).trim() === sid);
  const urlFichier = item?.fichierUrl || "";

  // ── 1. Supprimer du localStorage ──
  const publies = publiesAvant.filter(c => String(c.id).trim() !== sid);
  localStorage.setItem("contenu_publie", JSON.stringify(publies));

  // ── 2. Supprimer de Turso de façon asynchrone ──
  if (turso) {
    (async () => {
      try {
        await turso.execute({ sql: "DELETE FROM contenu WHERE id=?", args: [sid] });
      } catch(e) {
        console.warn("[LearnUpr] Suppression Turso :", e.message);
      }
    })();
  }

  // ── 3. Supprimer le fichier physique sur Cloudinary, en arrière-plan ──
  if (urlFichier) supprimerFichierCloudinary(urlFichier);

  showToast("🗑️ Contenu supprimé", "success");
  chargerContenuPublieModo();
  renderContent();
  }); // fin _confirmAndroid
}

// ========== VIEWEPREUVE ==========
function viewEpreuve(id) {
  // Déléguer directement à _openContenu qui gère tout correctement
  viewContenuPublie(String(id).trim());
}

// ========== SHOWTAB CORRIGÉ (loadClassement) ==========
// Mise à jour de showTab pour inclure loadClassement au profil + blocage mode examen
const _showTabOriginal = showTab;
showTab = function(tab) {
  // BUG 5 FIX: Bloquer les onglets sensibles en mode examen
  if (window.modeExamen && (tab === "quiz" || tab === "profil")) {
    showToast("🏫 Mode Examen actif — onglet non disponible", "error");
    return;
  }
  _showTabOriginal(tab);
  if (tab === "profil") {
    loadClassement();
    cltLoad();
    _demarrerRafraichissementClassement();
  } else {
    _arreterRafraichissementClassement();
  }
};

// ── Classement en temps réel : rafraîchissement automatique périodique ──
// Pas de WebSocket disponible côté client ici, donc on simule le "temps réel"
// par un polling régulier tant que l'onglet Profil (qui contient les deux
// blocs de classement) reste affiché. Le polling s'arrête dès qu'on change
// d'onglet pour ne pas consommer de batterie/données en arrière-plan.
let _classementPollInterval = null;
function _demarrerRafraichissementClassement() {
  _arreterRafraichissementClassement();
  _classementPollInterval = setInterval(() => {
    const profilVisible = document.getElementById("t-profil")?.style.display !== "none";
    if (!profilVisible || document.hidden) return;
    loadClassement();
    cltLoad();
  }, 15000); // toutes les 15 secondes
}
function _arreterRafraichissementClassement() {
  if (_classementPollInterval) { clearInterval(_classementPollInterval); _classementPollInterval = null; }
}

// ══════════════════════════════════════════════════════════════════════════
// ⚠️ ANCIEN CORRECTIF SUPPRIMÉ ("FIX #6") :
// Il y avait ici une réaffectation globale de `renderContent` qui écrasait
// SILENCIEUSEMENT la vraie fonction définie dans 00-core.js dès que ce
// fichier se chargeait. Résultat : quoi qu'on change dans renderContent/
// renderExamens (00-core.js) — mini-onglets Examens/Séquentielles, section
// Séquentielles, etc. — ce vieux code prenait toujours le dessus pour
// l'onglet "examen" et n'affichait QUE les épreuves officielles, jamais les
// séquentielles. C'était la cause racine du problème "je n'arrive pas à
// voir les séquentielles". Le bandeau de diagnostic admin qu'il affichait
// a été déplacé dans renderExamens() (00-core.js) pour ne rien perdre.
// ══════════════════════════════════════════════════════════════════════════
