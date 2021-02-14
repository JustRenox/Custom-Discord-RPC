const { remote } = require('electron');
const ipc = require("electron").ipcRenderer;


///////////////////////////////////////////////////////////
// Window button handler                                //
//////////////////////////////////////////////////////////

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

///////////////////////////////////////////////////////////
//  Getting all the relevant elements to use later on   //
//////////////////////////////////////////////////////////

//ClientID-------------------------------------------------
let client_id = $("#client_id")
//---------------------------------------------------------

//State----------------------------------------------------
let state_checkbox = $("#state_checkbox")
let state = $("#state")
//---------------------------------------------------------

//Details--------------------------------------------------
let details_checkbox = $("#details_checkbox")
let details = $("#details")
//---------------------------------------------------------

//Timestamps-----------------------------------------------
let timestamp_start_checkbox = $("#timestamp_start_checkbox")
let timestamp_start = $("#timestamp_start")

let timestamp_end_checkbox = $("#timestamp_end_checkbox")
let timestamp_end = $("#timestamp_end")
//---------------------------------------------------------

//Assets---------------------------------------------------
let assets_large_image_checkbox = $("#assets_large_image_checkbox")
let assets_large_image = $("#assets_large_image")

let assets_large_text_checkbox = $("#assets_large_text_checkbox")
let assets_large_text = $("#assets_large_text")

let assets_small_image_checkbox = $("#assets_small_image_checkbox")
let assets_small_image = $("#assets_small_image")

let assets_small_text_checkbox = $("#assets_small_text_checkbox")
let assets_small_text = $("#assets_small_text")
//---------------------------------------------------------

//Party-Size-----------------------------------------------
let party_size_checkbox = $("#party_size_checkbox")
let party_size_current = $("#party_size_current")
let party_size_maximum = $("#party_size_maximum")
//---------------------------------------------------------

//Status-Buttons-------------------------------------------
let button_one_checkbox = $("#button_one_checkbox")
let button_label_one = $("#button_label_one")
let button_url_one = $("#button_url_one")

let button_two_checkbox = $("#button_two_checkbox")
let button_label_two = $("#button_label_two")
let button_url_two = $("#button_url_two")
//---------------------------------------------------------

// //App-Controll-Buttons-------------------------------------
// let ControllButtonSetStatus = $("#ControllButtonSetStatus")
// let ControllButtonLoadStatus = $("#ControllButtonLoadStatus")
// let ControllButtonSaveStatus = $("#ControllButtonSaveStatus")
// //---------------------------------------------------------

// //Alerts---------------------------------------------------
// let divAlertError = $("#divAlertError")
// let alertBoxError = $("#alertBoxError")
// let alertErrorText = $("#alertErrorText")
// //---------------------------------------------------------

///////////////////////////////////////////////////////////
//  Handling the checkbox switches                      //
//////////////////////////////////////////////////////////

state_checkbox.click(() => {
    state.prop("disabled", (state_checkbox.is(":checked") ? false : true))
})

details_checkbox.click(() => {
    details.prop("disabled", (details_checkbox.is(":checked") ? false : true))
})

timestamp_start_checkbox.click(() => {
    timestamp_start.prop("disabled", (timestamp_start_checkbox.is(":checked") ? false : true))
})
timestamp_end_checkbox.click(() => {
    timestamp_end.prop("disabled", (timestamp_end_checkbox.is(":checked") ? false : true))
})

assets_large_image_checkbox.click(() => {
    function activatedL() {
        assets_large_image.prop("disabled", false)
        assets_large_text_checkbox.prop("disabled", false)
        assets_large_text.prop("disabled", (assets_large_text_checkbox.is(":checked") ? false : true))
    }
    function deactivatedL() {
        assets_large_image.prop("disabled", true)
        assets_large_text_checkbox.prop("disabled", true)
        assets_large_text.prop("disabled", true)
    }
    assets_large_image_checkbox.is(":checked") ? activatedL() : deactivatedL()
})
assets_large_text_checkbox.click(() => {
    assets_large_text.prop("disabled", (assets_large_text_checkbox.is(":checked") ? false : true))
})

assets_small_image_checkbox.click(() => {
    function activatedS() {
        assets_small_image.prop("disabled", false)
        assets_small_text_checkbox.prop("disabled", false)
        assets_small_text.prop("disabled", (assets_small_text_checkbox.is(":checked") ? false : true))
    }
    function deactivatedS() {
        assets_small_image.prop("disabled", true)
        assets_small_text_checkbox.prop("disabled", true)
        assets_small_text.prop("disabled", true)
    }
    assets_small_image_checkbox.is(":checked") ? activatedS() : deactivatedS()
})
assets_small_text_checkbox.click(() => {
    assets_small_text.prop("disabled", (assets_small_text_checkbox.is(":checked") ? false : true))
})

party_size_checkbox.click(() => {
    party_size_current.prop("disabled", (party_size_checkbox.is(":checked") ? false : true))
    party_size_maximum.prop("disabled", (party_size_checkbox.is(":checked") ? false : true))
})

button_one_checkbox.click(() => {
    button_label_one.prop("disabled", (button_one_checkbox.is(":checked") ? false : true))
    button_url_one.prop("disabled", (button_one_checkbox.is(":checked") ? false : true))
})
button_two_checkbox.click(() => {
    button_label_two.prop("disabled", (button_two_checkbox.is(":checked") ? false : true))
    button_url_two.prop("disabled", (button_two_checkbox.is(":checked") ? false : true))
})

