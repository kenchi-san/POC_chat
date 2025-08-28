// Fix pour les librairies Node.js qui utilisent "global"
(window as any).global = window;

// Polyfill pour process si nécessaire
(window as any).process = {
  env: { DEBUG: undefined },
};
