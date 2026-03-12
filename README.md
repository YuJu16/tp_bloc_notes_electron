# TP : Créer un Bloc-Notes avec Electron

## Informations 
- **Nom, Prénom** : Julia GARI
- **Classe** : Info B3 DEV INFO 2025-2026
- **Sujet** : Développement d'une application de traitement de texte autonome avec Electron (BrowserWindow, IPC, preload).

---

## Installation

```bash
npm install
npm init -y (pour initialiser node modules)
npm start
```

## Ce qui a été réalisé (Fonctionnalités & Barème)

Ce TP implémente l'intégralité du cahier des charges demandé, avec toutes les fonctionnalités principales (F1 à F8) ainsi que les 2 bonus.

### 1. Interface et Design (F1 & Améliorations)
- **Design premium** : Interface repensée façon "Glassmorphism" avec une barre d'outils semi-transparente, l'utilisation de typographies modernes (Google Fonts *Inter* et *JetBrains Mono*) et des icônes SVG Lucide.
- **Zone d'édition** : Un `<textarea>` en pleine page gère la saisie de texte avec une police monospace (`Consolas` / `JetBrains Mono`) et s'adapte automatiquement au thème en cours.
- **Barre de statut et outil** : Un footer indique en temps réel le nom du fichier courant, s'il y a des modifications non sauvegardées, ainsi que l'encodage (UTF-8). Un compteur de caractères se met à jour en temps réel à chaque touche pressée (F6).

### 2. Gestion des Fichiers (F2, F3 & F5)
La gestion des fichiers communique entre le rendu (`renderer.js`) et le script principal (`main.js`) via des IPC (`invoke`/`handle`).
- **Ouvrir (F2)** : Utilisation de `dialog.showOpenDialog()` pour sélectionner un fichier `.txt`. Le contenu est lu via `fs.readFileSync` et envoyé à l'éditeur.
- **Sauvegarder (F3)** : Utilisation de `dialog.showSaveDialog()` s'il s'agit d'un nouveau fichier, sinon sauvegarde directe via `fs.writeFileSync`.
- **Titre dynamique (F5)** : À chaque ouverture ou sauvegarde, le titre de la fenêtre se met à jour pour refléter le nom du fichier actuel (ex: "Bloc-Notes — notes.txt").

### 3. Intégration Native & Système (F4 & F7)
- **Menu Natif (F4)** : Construction d'un menu d'application OS-natif (`Menu.buildFromTemplate`) comportant les actions principales (Nouveau, Ouvrir, Sauvegarder, Quitter) et leurs raccourcis claviers standards (`CmdOrCtrl+N / O / S / Q`).
- **Notifications (F7)** : Lors d'une sauvegarde réussie, une notification système (`Notification` API) apparaît confirmant l'enregistrement du fichier.

### 4. Sécurité & Architecture Electron (F8)
L'application respecte les meilleures pratiques de sécurité d'Electron :
- L'`index.html` est ouvert avec `contextIsolation: true` et `nodeIntegration: false`.
- Un script de préchargement (`preload.js`) utilise le `contextBridge` pour exposer uniquement une API sécurisée (`window.api`) au fichier de rendu final (`renderer.js`). L'interface n'a aucun accès direct aux modules de Node.js ou au DOM global d'Electron.

---

## Fonctionnalités Bonus Implémentées

### Bonus 1 : Protection contre la perte de données
Lorsqu'un utilisateur modifie le texte et tente de fermer l'application (en cliquant sur la croix rouge), un événement `close` intercepte l'action dans `main.js`. Une boîte de dialogue standard (`dialog.showMessageBox`) demande confirmation avant de fermer, afin de ne pas perdre les modifications non sauvegardées.

### Bonus 2 : Thème Sombre / Clair persistant
Un bouton light/dark dans la barre d'outils permet de basculer instantanément l'interface entre un mode "Sombre" et un mode "Clair". 
- Le thème sélectionné est enregistré globalement sur l'ordinateur grâce à la dépendance `electron-store`.
- Au redémarrage de l'application, le dernier thème utilisé est mémorisé et rouvert instantanément grâce au chargement asynchrone défini dans l'`ipcMain.handle`.

---

## Problèmes rencontrés et Solutions

### Bug : Le clavier et l'interface "freezent" après une action "Nouveau" ou "Ouvrir"
* **Description** : L'utilisation de la fonction JavaScript native `confirm()` dans le processus de rendu (`renderer.js`) bloquait totalement l'interface utilisateur d'Electron (et le clavier ne répondait plus, avec un lag important).
* **Cause technique** : La fonction `confirm()` est synchrone et très mal supportée par l'architecture multi-processus d'Electron, causant le gel du thread principal de l'UI en attendant l'action de l'utilisateur.
* **Solution apportée** : Suppression du `confirm()` du navigateur et remplacement par une boîte de dialogue native du système (`dialog.showMessageBox`) exécutée depuis le script principal (`main.js`). La vérification est maintenant asynchrone et transit par l'IPC (`ipcMain.handle` / `ipcRenderer.invoke`), ce qui a totalement réglé le problème de fluidité et de clavier bloqué.


--- 

## Remarques

Se projet m'a permis de mieux comprendre le fonctionnement d'Electron et de ses différentes fonctionnalités.
J'ai pu découvrir l'architecture multi-processus d'Electron et l'importance de l'IPC pour la communication entre les processus.
(et le design de l'application :D)
