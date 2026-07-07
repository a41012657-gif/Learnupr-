import { defineConfig } from 'vite';

export default defineConfig({
  // main.js fait ~15 000 lignes d'un coup : on désactive juste l'avertissement
  // de taille de chunk (c'est un avertissement, pas une erreur, mais autant
  // éviter le bruit tant que le fichier n'est pas encore découpé en modules).
  build: {
    chunkSizeWarningLimit: 3000
  }
});
