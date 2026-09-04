// ========== PWA — MANIFEST STATIQUE + INSTALLATION ==========
// Le manifest.json est désormais un fichier statique servi à une URL stable
// (/manifest.json), condition nécessaire pour que Chrome/Android génère un
// vrai WebAPK (installation standalone plein écran) au lieu d'un simple
// raccourci. Les icônes sont aussi des fichiers PNG statiques
// (/icon-192.png, /icon-512.png), plus embarquées en base64.
(function() {
  // ── Bouton d'installation natif (Android/Chrome/Edge) ──
  // Affiché uniquement si :
  //  1) toutes les conditions techniques de l'installabilité sont remplies
  //     (le navigateur déclenche alors "beforeinstallprompt")
  //  2) l'app n'a pas déjà été installée via ce flux auparavant
  //     (persisté en localStorage pour ne pas réafficher le bouton aux
  //     visites suivantes même si le navigateur réémettait l'événement)
  let _deferredInstallPrompt = null;
  const _INSTALL_FLAG = "learnupr_pwa_installee";

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    if (localStorage.getItem(_INSTALL_FLAG) === "1") return; // déjà installée, on ne ré-affiche pas
    _deferredInstallPrompt = e;
    const btn = document.getElementById("btnInstallApp");
    if (btn) btn.style.display = "flex";
  });

  window._lancerInstallationPWA = async function() {
    if (!_deferredInstallPrompt) {
      showToast("ℹ️ Utilise le menu de ton navigateur → \"Ajouter à l'écran d'accueil\"", "info");
      return;
    }
    _deferredInstallPrompt.prompt();
    const { outcome } = await _deferredInstallPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(_INSTALL_FLAG, "1");
      showToast("✅ LearnUpr installé !", "success");
      const btn = document.getElementById("btnInstallApp");
      if (btn) btn.style.display = "none";
    }
    _deferredInstallPrompt = null;
  };

  window.addEventListener("appinstalled", () => {
    localStorage.setItem(_INSTALL_FLAG, "1");
    const btn = document.getElementById("btnInstallApp");
    if (btn) btn.style.display = "none";
    showToast("🎉 LearnUpr est maintenant installé sur ton appareil !", "success");
  });
})();
