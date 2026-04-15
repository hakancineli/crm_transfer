const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;
const APP_ORIGIN = process.env.DESKTOP_APP_URL || 'https://app.proacente.com';
const DEV_URL = process.env.ELECTRON_START_URL || 'http://localhost:3000/admin';
const START_PATH = '/admin';
const ALLOWED_ORIGINS = new Set([
  APP_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function normalizeTargetUrl(target) {
  try {
    const url = new URL(target);
    if (url.pathname === '/') {
      url.pathname = START_PATH;
    }
    return url.toString();
  } catch {
    return `${APP_ORIGIN}${START_PATH}`;
  }
}

function isAllowedUrl(target) {
  try {
    const url = new URL(target);
    return ALLOWED_ORIGINS.has(url.origin);
  } catch {
    return false;
  }
}

function createWindow() {
  const iconPath = process.platform === 'win32'
    ? path.join(__dirname, '..', 'public', 'crmlogo', 'proAcentelogo-symbol.ico')
    : path.join(__dirname, '..', 'public', 'crmlogo', 'proAcentelogo-symbol.png');

  const win = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#020617',
    title: 'Pro Acente CRM',
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      spellcheck: false,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedUrl(url)) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!isAllowedUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
      return;
    }

    const parsed = new URL(url);
    if (parsed.pathname === '/') {
      event.preventDefault();
      win.loadURL(normalizeTargetUrl(url));
    }
  });

  win.loadURL(
    isDev
      ? DEV_URL
      : normalizeTargetUrl(`${APP_ORIGIN}${START_PATH}`)
  );
}

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
