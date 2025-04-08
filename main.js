const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    }
  });

  const indexPath = path.join(__dirname, 'build', 'index.html');
  console.log(`Loading file: ${indexPath}`);
  win.loadFile(indexPath).catch((err) => {
    console.error(`Failed to load file: ${err}`);
  });
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});