const editor = document.getElementById('editor');
const btnNew = document.getElementById('btn-new');
const btnOpen = document.getElementById('btn-open');
const btnSave = document.getElementById('btn-save');
const btnTheme = document.getElementById('btn-theme');
const charCounter = document.getElementById('char-counter');
const statusFile = document.getElementById('status-file');
const statusModified = document.getElementById('status-modified');

let isModified = false;
let currentFile = null;

// Thème géré via main (electron-store)
async function initTheme() {
  const theme = await window.api.getTheme();
  if (theme === 'light') {
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
}

btnTheme.addEventListener('click', async () => {
  const isLight = document.body.classList.toggle('light');
  const newTheme = isLight ? 'light' : 'dark';
  await window.api.setTheme(newTheme);
});

function updateCounter() {
  const text = editor.value;
  const count = text.length;
  charCounter.textContent = `${count} caractère${count > 1 ? 's' : ''}`;
}

function setModified(modified) {
  isModified = modified;
  statusModified.textContent = modified ? '(Modifié)' : '';
  window.api.setModified(modified);
}

async function newFile() {
  if (isModified) {
    const confirmed = await window.api.showConfirm('Vous avez des modifications non sauvegardées. Continuer ?');
    if (!confirmed) return;
  }
  editor.value = '';
  currentFile = null;
  statusFile.textContent = 'Nouveau fichier';
  setModified(false);
  window.api.setTitle(null);
  updateCounter();
}

async function openFile() {
  if (isModified) {
    const confirmed = await window.api.showConfirm('Vous avez des modifications non sauvegardées. Continuer ?');
    if (!confirmed) return;
  }
  const result = await window.api.openFile();
  if (result) {
    editor.value = result.content;
    currentFile = result.filePath;
    statusFile.textContent = result.filePath;
    setModified(false);
    updateCounter();
  }
}

async function saveFile() {
  let fileName;
  if (currentFile) {
    fileName = await window.api.saveFile(editor.value);
  } else {
    fileName = await window.api.saveFileAs(editor.value);
  }
  
  if (fileName) {
    currentFile = true; // On n'a pas le chemin complet de retour mais on sait qu'il est set dans le main
    statusFile.textContent = fileName;
    setModified(false);
  }
}

editor.addEventListener('input', () => {
  if (!isModified) setModified(true);
  updateCounter();
});

btnNew.addEventListener('click', newFile);
btnOpen.addEventListener('click', openFile);
btnSave.addEventListener('click', saveFile);

window.api.onMenuNew(newFile);
window.api.onMenuOpen(openFile);
window.api.onMenuSave(saveFile);

initTheme();
