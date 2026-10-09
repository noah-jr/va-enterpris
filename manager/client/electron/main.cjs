const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    icon: path.join(__dirname, '../public/favicon.ico'),
    titleBarStyle: 'hiddenInset',
  });

  // Load the app
  const startURL = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  win.loadURL(startURL);

  if (isDev) {
    win.webContents.openDevTools();
  }

  win.on('closed', () => {
    app.quit();
  });

  // Window control listeners
  ipcMain.on('window-minimize', () => win.minimize());
  ipcMain.on('window-toggle-maximize', () => {
    if (win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  });
  ipcMain.on('window-close', () => win.close());
}

// Build standard menu for Desktop
const template = [
  {
    label: 'App',
    submenu: [
      { label: 'Sobre o VA ONEGEST', role: 'about' },
      { type: 'separator' },
      { label: 'Serviços', role: 'services' },
      { type: 'separator' },
      { label: 'Sair', role: 'quit' }
    ]
  },
  {
    label: 'Editar',
    submenu: [
      { label: 'Desfazer', role: 'undo' },
      { label: 'Refazer', role: 'redo' },
      { type: 'separator' },
      { label: 'Cortar', role: 'cut' },
      { label: 'Copiar', role: 'copy' },
      { label: 'Colar', role: 'paste' }
    ]
  },
  {
    label: 'Ver',
    submenu: [
      { label: 'Recarregar', role: 'reload' },
      { label: 'Forçar Recarregamento', role: 'forcereload' },
      { label: 'DevTools', role: 'toggledevtools' },
      { type: 'separator' },
      { label: 'Zoom In', role: 'zoomin' },
      { label: 'Zoom Out', role: 'zoomout' },
      { label: 'Reset Zoom', role: 'resetzoom' },
      { type: 'separator' },
      { label: 'Tela Cheia', role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Ajuda',
    submenu: [
      { label: 'Apoio Técnico', click: async () => { /* open browser */ } },
      { label: 'Documentação', click: async () => { /* open browser */ } }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
