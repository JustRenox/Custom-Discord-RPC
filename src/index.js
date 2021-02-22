const { app, BrowserWindow, Menu, Tray, shell } = require('electron');
const nativeImage = require('electron').nativeImage;
const path = require('path');
const request = require("request");
const fs = require('fs');
const ipc = require('electron').ipcMain;
const RPC = require('discord-rpc');
let client = new RPC.Client({
  transport: 'ipc'
});
let discordApiURL = "https://discord.com/api/v8/oauth2/applications/"

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

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
    icon: path.join(__dirname, "../assets/icons/png/icon_1024x1024.png"),
    frame: false,
    webPreferences: {
      devTools: false,
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // remove the Context Menu
  mainWindow.removeMenu()

  // // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  let tray = null
  app.whenReady().then(() => {
    tray = new Tray(path.join(__dirname, "../assets/icons/png/icon_16x16.png"))
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

  function killClient() {
    try {
      client = null
      client = new RPC.Client({ transport: 'ipc' })
    } catch (error) {
      return {
        type: "error",
        message: "Unexpected error! The Discord RPC connection was closed by Discord.",
        error: error
      }
    }
    return {
      type: "error",
      message: "Unexpected error! The Discord RPC connection was closed by Discord.",
    }
  }

  function checkForImportantFiles() {
    if (!fs.existsSync(path.join(app.getPath("userData") + "/profiles"))) {
      fs.mkdirSync(path.join(app.getPath("userData") + "/profiles"))
      console.info(`Created folder: ${path.join(app.getPath("userData") + "/profiles")}`)
    }
    if (!fs.existsSync(path.join(app.getPath("userData") + "/profiles/default"))) {
      fs.mkdirSync(path.join(app.getPath("userData") + "/profiles/default"))
      console.info(`Created folder: ${path.join(app.getPath("userData") + "/profiles/default")}`)
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
      fs.writeFileSync(path.join(app.getPath("userData") + "/profiles/default/last.json"), JSON.stringify(empty_last_file))
      console.info(`Created folder: ${path.join(app.getPath("userData") + "/profiles/default/last.json")}`)
    }
  }

  checkForImportantFiles()



  ipc.on("getProfiles", (event, package) => {
    let returnPackage
    checkForImportantFiles()
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
    checkForImportantFiles()
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
        message: "Couldn't find the profile you where looking for.",
        error: error
      }
    }
    event.returnValue = package
  })

  ipc.on("saveProfile", (event, package) => {
    let savefileName = package.name
    let content = package.content
    let returnPackage = {}
    checkForImportantFiles()
    fs.writeFile(app.getPath("userData") + `/profiles/${savefileName}.json`, JSON.stringify(content), (err) => {
      if (err) {
        returnPackage = {
          type: "error",
          message: "There was an error while saving your profile. Please try again.",
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

  ipc.on("connectRPC", (event, package) => {
    request(`${discordApiURL}${package.client_id}/rpc`, function (error, res, body) {
      if (error) {
        console.log(error)
        event.returnValue = {
          type: "error",
          message: "Unexpected Error while trying to connect to the Discord RPC",
          error: error
        }
        return
      }
      body = JSON.parse(body)
      if (body.message == 'Unknown Application' || body.code == 10002) {
        anwser = {
          type: "error",
          message: "Unknown Application. Please check if you entered the right ClientID",
        }
        event.returnValue = anwser
        return
      }
      if (body.name && body.id) {
        try {
          client.login({ clientId: package.client_id })
        } catch (error) {
          killClient()
          event.returnValue = {
            type: "error",
            message: "Unexpected Error while trying to connect to the Discord RPC",
            error: error
          }
        }
        let anwser = null
        client.on("disconnected", () => {
          killClient()
          anwser = {
            type: "error",
            message: "Connection rejected. Invalid ClientID!",
          }
          event.returnValue = anwser
          return
        })
        client.on("ready", () => {
          anwser = {
            type: "success",
            message: "Successfully connected to Discord. You can now update the status!",
          }
          event.returnValue = anwser
          client.addListener("disconnected", () => {
            killClient()
            let message = {
              type: "warning",
              message: "The connection to Discord was closed!",
            }
            mainWindow.webContents.send("unexpectedDisconnect", message)
          })
          return
        })
        setTimeout(() => {
          if (anwser == null) {
            killClient()
            event.returnValue = {
              type: "error",
              message: "Connection timeout. Please try again!",
            }
          }
        }, 3000);
      }
    })
  })

  ipc.on("updateActivity", (event, package) => {
    try {
      client.request('SET_ACTIVITY', {
        pid: process.pid,
        activity: package.activity
      });
    } catch (error) {
      event.returnValue = {
        type: "error",
        message: "The Update Status request was rejected! A look into the Discord console might help.",
        error: error
      }
      return
    }
    try {
      fs.writeFile(app.getPath("userData") + `/profiles/default/last.json`, JSON.stringify(package.profile), (error) => {
        if (error) {
          returnPackage = {
            type: "error",
            message: "There was an error while saving the profile as 'Last Used Profile'",
            error: error
          }
          event.returnValue = returnPackage
        }
      })
    } catch (error) {
      returnPackage = {
        type: "error",
        message: "There was an error while saving the profile as 'Last Status'",
        error: error
      }
      event.returnValue = returnPackage
    }
    event.returnValue = {
      type: "success",
      message: "Successfully updated the Status and saved it as 'Last Status'",
    }
  })

  ipc.on("disconnectRPC", (event, package) => {

    try {
      client.destroy().then(() => {
        client = null
        client = new RPC.Client({ transport: 'ipc' })
      })
    } catch (error) {
      event.returnValue = {
        type: "error",
        message: "Unexpected error while trying to destroy the current Discord RPC client.",
        error: error
      }
      return
    }
    event.returnValue = {}
  })

  ipc.on("openFolder", (event, package) => {
    checkForImportantFiles()
    try {
      shell.openPath(path.join(app.getPath("userData") + "/profiles"))
      event.returnValue = {
        type: "success",
        message: `Successfully opened the profiles folder in your fileexplorer`
      }
    } catch (error) {
      event.returnValue = {
        type: "error",
        message: `Couldn't open the folder ${path.join(app.getPath("userData") + "/profiles")}!`,
        error: error
      }
    }
  })

});