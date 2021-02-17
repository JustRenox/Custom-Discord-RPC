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

  function checkForImportantFiles() {
    if (!fs.existsSync(path.join(app.getPath("userData") + "/profiles"))) {
      fs.mkdirSync(path.join(app.getPath("userData") + "/profiles"))
      console.log(`Created folder: ${path.join(app.getPath("userData") + "/profiles")}`)
    }
    if (!fs.existsSync(path.join(app.getPath("userData") + "/profiles/default"))) {
      fs.mkdirSync(path.join(app.getPath("userData") + "/profiles/default"))
      console.log(`Created folder: ${path.join(app.getPath("userData") + "/profiles/default")}`)
    }
    if (!fs.existsSync(path.join(app.getPath("userData") + "/profiles/default/last.json"))) {
      let empty_last_file = {
        "inputs": {
          "client_id": "",
          "state": "",
          "details": "",
          "timestamp_start": "",
          "timestamp_end": "",
          "assets_large_image": "",
          "assets_large_text": "",
          "assets_small_image": "",
          "assets_small_text": "",
          "party_size_current": "",
          "party_size_maximum": "",
          "button_label_one": "",
          "button_url_one": "",
          "button_label_two": "",
          "button_url_two": ""
        },
        "checkboxes": {
          "state_checkbox": false,
          "details_checkbox": false,
          "timestamp_start_checkbox": false,
          "timestamp_end_checkbox": false,
          "assets_large_image_checkbox": false,
          "assets_large_text_checkbox": false,
          "assets_small_image_checkbox": false,
          "assets_small_text_checkbox": false,
          "party_size_checkbox": false,
          "button_one_checkbox": false,
          "button_two_checkbox": false
        }
      }
      fs.writeFileSync(path.join(app.getPath("userData") + "/profiles/default/last.json"),JSON.stringify(empty_last_file))
      console.log(`Created folder: ${path.join(app.getPath("userData") + "/profiles/default/last.json")}`)
    }
  }

  checkForImportantFiles()

  ipc.on("getProfiles", (event, package) => {
    let returnPackage
    try {
      let profile = fs.readdirSync(path.join(app.getPath("userData") + "/profiles"))
      content = profile.filter(file => file.endsWith('.json'))
      returnPackage = {
        type: "success",
        message: `Successfully got the profile names`,
        content: content
      }
    } catch (error) {
      returnPackage = {
        type: "error",
        message: `Couldn't find the folder ${path.join(app.getPath("userData") + "/profiles")}`,
        error: error
      }
    }
    event.returnValue = returnPackage
  })

  ipc.on("getProfile", (event, profile_name) => {
    let package
    try {
      profile = fs.readFileSync(path.join(app.getPath("userData") + `/profiles/${profile_name}.json`), "utf8")
      profile_name = profile_name == "default/last" ? "Last Profile" : profile_name
      package = {
        type: "success",
        message: `Successfully loaded the selected profile: "${profile_name}"`,
        content: JSON.parse(profile)
      }
    } catch (error) {
      package = {
        type: "error",
        message: "Couldn't find the file you where looking for.",
        error: error
      }
    }
    event.returnValue = package
  })

  ipc.on("saveProfile", (event, package) => {
    let savefileName = package.name
    let content = package.content
    let returnPackage = {}
    fs.writeFile(app.getPath("userData") + `/profiles/${savefileName}.json`, JSON.stringify(content), (err) => {
      if (err) {
        returnPackage = {
          type: "error",
          message: "There was an error while saving your Profile. Please try again.",
          error: err
        }
        event.returnValue = returnPackage
      } else {
        returnPackage = {
          type: "success",
          message: `Successfully saved the profile: "${savefileName}"`
        }
        event.returnValue = returnPackage
      }
    })
  })

});