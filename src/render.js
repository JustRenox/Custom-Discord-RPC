const { remote } = require('electron');
const ipc = require("electron").ipcRenderer;

var minimize = document.querySelector("#minimize");
var maximize = document.querySelector("#maximize");
var quit = document.querySelector("#quit");

minimize.addEventListener("click", () => {
  var win = remote.BrowserWindow.getFocusedWindow();
  win.minimize();
});

maximize.addEventListener("click", () => {
  var win = remote.BrowserWindow.getFocusedWindow();
  win.setFullScreen(!win.isFullScreen());
});

quit.addEventListener("click", () => {
  var win = remote.BrowserWindow.getFocusedWindow();
  win.close();
});