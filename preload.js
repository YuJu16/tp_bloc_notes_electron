const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    openFile: () => ipcRenderer.invoke('open-file'),
    saveFile: (content) => ipcRenderer.invoke('save-file', content),
    saveFileAs: (content) => ipcRenderer.invoke('save-file-as', content),
    setModified: (value) => ipcRenderer.send('set-modified', value),
    setTitle: (fileName) => ipcRenderer.send('set-title', fileName),
    onMenuNew: (cb) => ipcRenderer.on('menu-new', cb),
    onMenuOpen: (cb) => ipcRenderer.on('menu-open', cb),
    onMenuSave: (cb) => ipcRenderer.on('menu-save', cb),
    getTheme: () => ipcRenderer.invoke('get-theme'),
    setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
    showConfirm: (message) => ipcRenderer.invoke('show-confirm', message),
});
