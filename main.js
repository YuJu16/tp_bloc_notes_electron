const { app, BrowserWindow, ipcMain, dialog, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();

let mainWindow;
let currentFilePath = null;
let isModified = false;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 900,
        height: 650,
        minWidth: 600,
        minHeight: 400,
        title: 'Bloc-Notes',
        backgroundColor: '#1e1e2e',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    mainWindow.loadFile('index.html');
    buildMenu();

    mainWindow.on('close', (e) => {
        if (isModified) {
            e.preventDefault();
            dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: ['Quitter sans sauvegarder', 'Annuler'],
                defaultId: 1,
                title: 'Modifications non sauvegardées',
                message: 'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?',
            }).then(({ response }) => {
                if (response === 0) {
                    mainWindow.destroy();
                }
            });
        }
    });
}

function buildMenu() {
    const template = [
        {
            label: 'Fichier',
            submenu: [
                {
                    label: 'Nouveau',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow.webContents.send('menu-new'),
                },
                {
                    label: 'Ouvrir',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => mainWindow.webContents.send('menu-open'),
                },
                {
                    label: 'Sauvegarder',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow.webContents.send('menu-save'),
                },
                { type: 'separator' },
                {
                    label: 'Quitter',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => app.quit(),
                },
            ],
        },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

ipcMain.handle('open-file', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
        filters: [{ name: 'Fichiers texte', extensions: ['txt'] }, { name: 'Tous les fichiers', extensions: ['*'] }],
        properties: ['openFile'],
    });

    if (canceled || filePaths.length === 0) return null;

    const filePath = filePaths[0];
    const content = fs.readFileSync(filePath, 'utf-8');
    currentFilePath = filePath;
    isModified = false;
    mainWindow.setTitle(`Bloc-Notes — ${path.basename(filePath)}`);
    return { content, filePath };
});

ipcMain.handle('save-file', async (event, content) => {
    if (!currentFilePath) {
        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            filters: [{ name: 'Fichiers texte', extensions: ['txt'] }],
            defaultPath: 'sans-titre.txt',
        });

        if (canceled || !filePath) return false;
        currentFilePath = filePath;
    }

    fs.writeFileSync(currentFilePath, content, 'utf-8');
    isModified = false;
    mainWindow.setTitle(`Bloc-Notes — ${path.basename(currentFilePath)}`);

    if (Notification.isSupported()) {
        new Notification({
            title: 'Bloc-Notes',
            body: `Fichier sauvegardé : ${path.basename(currentFilePath)}`,
        }).show();
    }

    return path.basename(currentFilePath);
});

ipcMain.handle('save-file-as', async (event, content) => {
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
        filters: [{ name: 'Fichiers texte', extensions: ['txt'] }],
        defaultPath: currentFilePath || 'sans-titre.txt',
    });

    if (canceled || !filePath) return false;

    currentFilePath = filePath;
    fs.writeFileSync(currentFilePath, content, 'utf-8');
    isModified = false;
    mainWindow.setTitle(`Bloc-Notes — ${path.basename(currentFilePath)}`);

    if (Notification.isSupported()) {
        new Notification({
            title: 'Bloc-Notes',
            body: `Fichier sauvegardé : ${path.basename(currentFilePath)}`,
        }).show();
    }

    return path.basename(currentFilePath);
});

ipcMain.on('set-modified', (event, value) => {
    isModified = value;
});

ipcMain.on('set-title', (event, fileName) => {
  if (fileName) {
    mainWindow.setTitle(`Bloc-Notes — ${fileName}`);
  } else {
    mainWindow.setTitle('Bloc-Notes');
  }
});

ipcMain.handle('show-confirm', async (event, message) => {
  const { response } = await dialog.showMessageBox(mainWindow, {
    type: 'question',
    buttons: ['Continuer', 'Annuler'],
    defaultId: 0,
    title: 'Confirmation',
    message: message,
  });
  return response === 0;
});

ipcMain.handle('get-theme', () => {
    return store.get('theme', 'dark');
});

ipcMain.handle('set-theme', (event, theme) => {
    store.set('theme', theme);
});

app.whenReady().then(() => {
    createWindow();
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
