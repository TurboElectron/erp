'use strict'

import { app, protocol, BrowserWindow, ipcMain, shell } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
import path, {join} from "path";
import fs from "fs";
import { autoUpdater, NsisUpdater } from "electron-updater"
require('@electron/remote/main').initialize()
const isDevelopment = process.env.NODE_ENV !== 'production'
export const dbPath = isDevelopment ? join(__dirname, '../prisma/dev.db') : path.join(app.getPath('userData'), `0.1.1.db`)
console.log('isDev:::'+ isDevelopment)
if (!isDevelopment) {
  try {
    // database file does not exist, need to create
    fs.copyFileSync(join(process.resourcesPath, 'prisma/dev.db'), dbPath, fs.constants.COPYFILE_EXCL)
    console.log('New database file created')
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error(`Failed creating sqlite file.`, err)
    } else {
      console.log('Database file detected')
    }
  }
}
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])
const autoUpdaterV2 = new NsisUpdater({
  provider: 'generic',
  url: 'https://guxukai.tech/electron'
})
async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: path.join(__dirname, 'preload.js')
    },
  })
  require('@electron/remote/main').enable(win.webContents)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // console.log(path.join(
    //     __dirname,
    //     "../dist_electron/latest-mac.yml" // change path if needed
    // ))
    autoUpdater.setFeedURL('http://localhost:8080')
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
    autoUpdater.checkForUpdates();
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
    autoUpdaterV2.checkForUpdatesAndNotify();
  }
  win.once('ready-to-show', () => {
    console.log(1111)
  })
  autoUpdaterV2.on('update-available', () => {
    win.webContents.send('update_available');
  });
  autoUpdaterV2.on('update-downloaded', () => {
    win.webContents.send('update_downloaded');
  });
}
ipcMain.on('download-url', (event, args) => {
  console.log(dbPath)
})
ipcMain.on('restart_app', () => {
  console.log('restart_app')
  autoUpdaterV2.quitAndInstall();
});
ipcMain.on('open-folder', (event, args) => {
  console.log(args)
  const folderPath = path.dirname(args)
  console.log(folderPath)
  shell.openPath(folderPath)
})
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
