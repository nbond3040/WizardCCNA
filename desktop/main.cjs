/**
 * WizardCCNA desktop shell.
 *
 * Serves the production web build (copied into ./web by scripts/prepare.cjs) from a private app:// origin, so
 * module scripts, fetch and localStorage behave exactly as they do on the web. No network access is needed.
 *
 *   npm start            run the app from source
 *   --smoke-test         load the app, check that it renders, print SMOKE OK and exit (used by CI)
 */
const { app, BrowserWindow, Menu, protocol, session, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const WEB_ROOT = path.join(__dirname, 'web');
const ORIGIN = 'app://wizardccna';
const SMOKE = process.argv.includes('--smoke-test');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
};

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

if (!SMOKE && !app.requestSingleInstanceLock()) {
  app.quit();
}

let mainWindow = null;

/* ---------------- window state ---------------- */

const stateFile = () => path.join(app.getPath('userData'), 'window-state.json');

function loadWindowState() {
  try {
    const s = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
    if (s && Number.isFinite(s.width) && Number.isFinite(s.height)) return s;
  } catch {
    /* first run */
  }
  return { width: 1360, height: 900 };
}

function saveWindowState(win) {
  try {
    const maximized = win.isMaximized();
    const b = maximized ? win.getNormalBounds() : win.getBounds();
    fs.writeFileSync(stateFile(), JSON.stringify({ ...b, maximized }));
  } catch {
    /* non-fatal */
  }
}

/* ---------------- app:// protocol ---------------- */

function registerAppProtocol() {
  protocol.handle('app', async (request) => {
    try {
      const url = new URL(request.url);
      let rel = decodeURIComponent(url.pathname);
      if (rel === '/' || rel === '') rel = '/index.html';
      let file = path.normalize(path.join(WEB_ROOT, rel));
      if (file !== WEB_ROOT && !file.startsWith(WEB_ROOT + path.sep)) return new Response('Forbidden', { status: 403 });
      let data;
      try {
        data = await fs.promises.readFile(file);
      } catch {
        // Unknown extension-less paths fall back to the app shell (the router is hash based, so this is only a safety net).
        if (path.extname(rel)) return new Response('Not found', { status: 404 });
        file = path.join(WEB_ROOT, 'index.html');
        data = await fs.promises.readFile(file);
      }
      return new Response(data, { headers: { 'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' } });
    } catch (e) {
      return new Response(String(e && e.message ? e.message : e), { status: 500 });
    }
  });
}

/* ---------------- menu ---------------- */

function buildMenu() {
  const template = [
    {
      label: 'File',
      submenu: [{ role: 'quit', label: 'Exit' }],
    },
    {
      label: 'Edit',
      submenu: [{ role: 'undo' }, { role: 'redo' }, { type: 'separator' }, { role: 'cut' }, { role: 'copy' }, { role: 'paste' }, { role: 'selectAll' }],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Actual size' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

/* ---------------- window ---------------- */

function createWindow() {
  const st = loadWindowState();
  mainWindow = new BrowserWindow({
    width: st.width,
    height: st.height,
    x: st.x,
    y: st.y,
    minWidth: 920,
    minHeight: 620,
    show: false,
    title: 'WizardCCNA',
    backgroundColor: '#f7f6f3',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      devTools: !app.isPackaged,
    },
  });
  if (st.maximized) mainWindow.maximize();
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('close', () => saveWindowState(mainWindow));
  mainWindow.on('closed', () => (mainWindow = null));

  // Keep navigation inside the app; open anything else in the default browser.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith(ORIGIN)) {
      event.preventDefault();
      if (/^https?:/i.test(url)) shell.openExternal(url);
    }
  });

  mainWindow.loadURL(`${ORIGIN}/index.html`);
  if (SMOKE) runSmokeTest(mainWindow);
}

/* ---------------- smoke test (CI) ---------------- */

function runSmokeTest(win) {
  const errors = [];
  // Result goes to stdout and, when WIZARDCCNA_SMOKE_OUT is set, to that file (GUI-subsystem exes on Windows don't always print).
  const finish = (code, message) => {
    (code === 0 ? console.log : console.error)(message);
    if (process.env.WIZARDCCNA_SMOKE_OUT) {
      try {
        fs.writeFileSync(process.env.WIZARDCCNA_SMOKE_OUT, message + '\n');
      } catch {
        /* ignore */
      }
    }
    app.exit(code);
  };
  win.webContents.on('console-message', (event) => {
    if (event.level === 'error') errors.push(String(event.message));
  });
  win.webContents.on('render-process-gone', (_e, details) => {
    finish(1, 'SMOKE FAIL: renderer gone: ' + details.reason);
  });
  const timer = setTimeout(() => {
    finish(1, 'SMOKE FAIL: timed out waiting for the app to render');
  }, 60000);
  const wait = (js, label) =>
    new Promise((resolve, reject) => {
      const t0 = Date.now();
      const tick = async () => {
        try {
          if (await win.webContents.executeJavaScript(js)) return resolve();
        } catch {
          /* page not ready yet */
        }
        if (Date.now() - t0 > 20000) return reject(new Error(`timed out waiting for ${label}`));
        setTimeout(tick, 250);
      };
      tick();
    });
  win.webContents.once('did-finish-load', async () => {
    try {
      await wait("document.body.innerText.includes('WizardCCNA') && document.querySelectorAll('a[href^=\"#/\"]').length > 4", 'the dashboard');
      const shot = process.env.WIZARDCCNA_SMOKE_SHOT; // optional: save a screenshot of the dashboard (used by CI as evidence)
      if (shot) {
        win.show();
        await new Promise((r) => setTimeout(r, 1200)); // let the first frame paint before capturing
        fs.writeFileSync(shot, (await win.webContents.capturePage()).toPNG());
      }
      await win.webContents.executeJavaScript("location.hash = '#/learn/network-models'");
      await wait("!!document.querySelector('.stage') && /1 \\/ \\d+/.test(document.body.innerText)", 'the first slide');
      await win.webContents.executeJavaScript("location.hash = '#/practice'");
      await wait("document.body.innerText.includes('Full exam simulation')", 'the practice page');
      await win.webContents.executeJavaScript("location.hash = '#/labs/lab-vlans-trunking'");
      await wait("document.body.innerText.includes('Scenario') && document.body.innerText.includes('Tasks')", 'the lab workspace');
      const persisted = await win.webContents.executeJavaScript("localStorage.setItem('smoke','1'), localStorage.getItem('smoke') === '1'");
      if (!persisted) throw new Error('localStorage is not available');
      if (errors.length) throw new Error('console errors: ' + errors.slice(0, 3).join(' | '));
      clearTimeout(timer);
      finish(0, 'SMOKE OK');
    } catch (e) {
      finish(1, 'SMOKE FAIL: ' + (e && e.message ? e.message : e));
    }
  });
}

/* ---------------- lifecycle ---------------- */

app.setAppUserModelId('com.wizardccna.app');

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  // The app is fully offline: refuse every permission prompt (camera, location, notifications, ...).
  session.defaultSession.setPermissionRequestHandler((_wc, _permission, callback) => callback(false));
  registerAppProtocol();
  buildMenu();
  createWindow();
});

app.on('window-all-closed', () => app.quit());
