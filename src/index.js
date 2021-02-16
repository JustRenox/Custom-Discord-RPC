const { app, BrowserWindow, Menu, Tray } = require('electron');
const nativeImage = require('electron').nativeImage;
const path = require('path');
const ipc = require('electron').ipcMain;
const RPC = require('discord-rpc');
let client = new RPC.Client({
  transport: 'ipc'
});
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

var logoicon = nativeImage.createFromPath(path.join(__dirname, "../assets/icons/logoicon.png"))
logoicon.setTemplateImage(true);

app.on('ready', () => {
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', () => {
      // Opening the main Window again after someone tried to open another instance
      if (mainWindow) {
        mainWindow.show()
      }
    })
  }

  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minHeight: 600,
    minWidth: 600,
    icon: logoicon,
    frame: false,
    webPreferences: {
      // devTools: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // remove the Context Menu
  mainWindow.removeMenu()

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  let tray = null
  app.whenReady().then(() => {
    tray = new Tray(logoicon)
    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Open Dashboard", click: async () => {
          mainWindow.show()
        }
      },
      {
        label: "Quit", click: async () => {
          app.isQuiting = true;
          mainWindow.destroy()
          app.quit();
        }
      }
    ])
    tray.setToolTip('BetterDiscordStatus')
    tray.setContextMenu(contextMenu)
    tray.on("click", () => {
      mainWindow.show()
    })
  })

  mainWindow.on("close", e => {
    e.preventDefault();
    mainWindow.hide();
  })

  // Preventing default behavior when all windows are closed so the process can run in the background
  app.on('window-all-closed', e => {
    e.preventDefault();
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  // In this file you can include the rest of your app's specific main process
  // code. You can also put them in separate files and import them here.

  ipc.on("getProfiles", (event, package) => {
    let profile = fs.readdirSync(path.join(app.getPath("userData") + "/profiles"))
    let returnPackage = profile.filter(file => file.endsWith('.json'))
    event.returnValue = returnPackage
  })

  ipc.on("getProfile", (event, profile_name) => {
    let package
    try {
      profile = fs.readFileSync(path.join(app.getPath("userData") + `/profiles/${profile_name}.json`), "utf8")
      package = {
        type: "success",
        message: `Successfully loaded the selected "${profile_name}"`,
        content: JSON.parse(profile)
      }
    } catch (error) {
      console.log(error)
      package = {
        type: "error",
        message: "I couldn't find the fiel you where looking for.",
        error: error
      }
    }
    event.returnValue = package
  })

});