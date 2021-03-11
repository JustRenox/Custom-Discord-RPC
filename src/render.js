const { remote, ipcRenderer, shell } = require('electron');
const ipc = require("electron").ipcRenderer;

///////////////////////////////////////////////////////////
// Initializing all tooltips                            //
//////////////////////////////////////////////////////////

let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

///////////////////////////////////////////////////////////
// Window button handler                                //
//////////////////////////////////////////////////////////

let minimize = document.querySelector("#minimize");
let maximize = document.querySelector("#maximize");
let quit = document.querySelector("#quit");

minimize.addEventListener("click", () => {
    let win = remote.BrowserWindow.getFocusedWindow();
    win.minimize();
});

maximize.addEventListener("click", () => {
    let win = remote.BrowserWindow.getFocusedWindow();
    win.setFullScreen(!win.isFullScreen());
});

quit.addEventListener("click", () => {
    let win = remote.BrowserWindow.getFocusedWindow();
    win.close();
});

///////////////////////////////////////////////////////////
//  Getting all the relevant elements to use later on   //
//////////////////////////////////////////////////////////

//ClientID-------------------------------------------------
let client_id = document.getElementById("client_id")
//---------------------------------------------------------

//State----------------------------------------------------
let state_checkbox = document.getElementById("state_checkbox")
let state = document.getElementById("state")
//---------------------------------------------------------

//Details--------------------------------------------------
let details_checkbox = document.getElementById("details_checkbox")
let details = document.getElementById("details")
//---------------------------------------------------------

//Timestamps-----------------------------------------------
let timestamp_start_checkbox = document.getElementById("timestamp_start_checkbox")
let timestamp_start = document.getElementById("timestamp_start")

let timestamp_end_checkbox = document.getElementById("timestamp_end_checkbox")
let timestamp_end = document.getElementById("timestamp_end")
//---------------------------------------------------------

//Assets---------------------------------------------------
let assets_large_image_checkbox = document.getElementById("assets_large_image_checkbox")
let assets_large_image = document.getElementById("assets_large_image")

let assets_large_text_checkbox = document.getElementById("assets_large_text_checkbox")
let assets_large_text = document.getElementById("assets_large_text")

let assets_small_image_checkbox = document.getElementById("assets_small_image_checkbox")
let assets_small_image = document.getElementById("assets_small_image")

let assets_small_text_checkbox = document.getElementById("assets_small_text_checkbox")
let assets_small_text = document.getElementById("assets_small_text")
//---------------------------------------------------------

//Party-Size-----------------------------------------------
let party_size_checkbox = document.getElementById("party_size_checkbox")
let party_size_current = document.getElementById("party_size_current")
let party_size_maximum = document.getElementById("party_size_maximum")
//---------------------------------------------------------

//Status-Buttons-------------------------------------------
let button_one_checkbox = document.getElementById("button_one_checkbox")
let button_label_one = document.getElementById("button_label_one")
let button_url_one = document.getElementById("button_url_one")

let button_two_checkbox = document.getElementById("button_two_checkbox")
let button_label_two = document.getElementById("button_label_two")
let button_url_two = document.getElementById("button_url_two")
//---------------------------------------------------------

//Status-Controll-Buttons----------------------------------
let connect_button = document.getElementById("connect_button")
let update_button = document.getElementById("update_button")
let save_button = document.getElementById("save_button")
let load_button = document.getElementById("load_button")
let disconnect_button = document.getElementById("disconnect_button")
//---------------------------------------------------------

//Help-and-User-Guidance-----------------------------------
let clickForHelp = document.getElementById("clickForHelp")
//---------------------------------------------------------

//Status-Saving-Menu---------------------------------------
let saveModal = new bootstrap.Modal(document.getElementById('savinginput'), { keyboard: false })
//---------------------------------------------------------

///////////////////////////////////////////////////////////
//  Handling the checkbox switches                      //
//////////////////////////////////////////////////////////

state_checkbox.addEventListener("click", () => {
    state.disabled = !state_checkbox.checked
})

details_checkbox.addEventListener("click", () => {
    details.disabled = !details_checkbox.checked
})

timestamp_start_checkbox.addEventListener("click", () => {
    timestamp_start.disabled = !timestamp_start_checkbox.checked
})
timestamp_end_checkbox.addEventListener("click", () => {
    timestamp_end.disabled = !timestamp_end_checkbox.checked
})

assets_large_image_checkbox.addEventListener("click", () => {
    function activatedL() {
        assets_large_image.disabled = false
        assets_large_text_checkbox.disabled = false
        assets_large_text.disabled = !assets_large_text_checkbox.checked
    }
    function deactivatedL() {
        assets_large_image.disabled = true
        assets_large_text_checkbox.disabled = true
        assets_large_text.disabled = true
    }
    assets_large_image_checkbox.checked ? activatedL() : deactivatedL()
})
assets_large_text_checkbox.addEventListener("click", () => {
    assets_large_text.disabled = !assets_large_text_checkbox.checked
})

assets_small_image_checkbox.addEventListener("click", () => {
    function activatedS() {
        assets_small_image.disabled = false
        assets_small_text_checkbox.disabled = false
        assets_small_text.disabled = !assets_small_text_checkbox.checked
    }
    function deactivatedS() {
        assets_small_image.disabled = true
        assets_small_text_checkbox.disabled = true
        assets_small_text.disabled = true
    }
    assets_small_image_checkbox.checked ? activatedS() : deactivatedS()
})
assets_small_text_checkbox.addEventListener("click", () => {
    assets_small_text.disabled = !assets_small_text_checkbox.checked
})

party_size_checkbox.addEventListener("click", () => {
    party_size_current.disabled = !party_size_checkbox.checked
    party_size_maximum.disabled = !party_size_checkbox.checked
})

button_one_checkbox.addEventListener("click", () => {
    button_label_one.disabled = !button_one_checkbox.checked
    button_url_one.disabled = !button_one_checkbox.checked
})
button_two_checkbox.addEventListener("click", () => {
    button_label_two.disabled = !button_two_checkbox.checked
    button_url_two.disabled = !button_two_checkbox.checked
})

///////////////////////////////////////////////////////////
//  IPC requests from Main handler                      //
//////////////////////////////////////////////////////////

ipc.on("unexpectedDisconnect", (event, message) => {
    if (message.type === "warning") {
        notify({
            type: "warning",
            message: message.message,
            delay: 5000
        })
    }
    else if (message.type === "error" && message.message) {
        notify({
            type: "error",
            message: message.message,
            delay: 5000
        })
    }
    event.returnValue = {
        "answer": "Received disconnection event and reset UI"
    }
    setTimeout(() => {
        connect_button.disabled = false
    }, 5000);
    client_id.disabled = false
    update_button.disabled = true
    disconnect_button.disabled = true
})

///////////////////////////////////////////////////////////
//  Handling the Status Buttons                         //
//////////////////////////////////////////////////////////

connect_button.addEventListener("click", () => {
    connect_button.disabled = true
    const digitreg = /^\d+$/;
    if (client_id.value === "") {
        connect_button.disabled = false
        return notify({
            type: "warning",
            message: "The ClientID must be defined to connect to Discord.",
            delay: 5000
        })
    }
    if (digitreg.test(client_id.value) === false) {
        connect_button.disabled = false
        return notify({
            type: "warning",
            message: "The ClientID can only consist of digits.",
            delay: 5000
        })
    }
    let p = {
        client_id: client_id.value
    }
    let reply = ipc.sendSync("connectRPC", p);
    if (reply.type === "error" && reply.message) {
        notify({
            type: "error",
            message: reply.message,
            delay: 5000
        })
        setTimeout(() => {
            connect_button.disabled = false
        }, 3000);
    } else if (reply.type === "success" && reply.message) {
        notify({
            type: "success",
            message: reply.message,
            delay: 3000
        })
        if (validateInputs() === true) {
            let p = {
                activity: buildActivity(),
                profile: saveProfiles()
            }
            let reply = ipc.sendSync("updateActivity", p)
            if (reply.type === "success" && reply.message) {
                notify({
                    type: "success",
                    message: reply.message,
                    delay: 3000
                })
            }
            else if (reply.type === "error" && reply.message) {
                reply.error ? console.error(reply.error) : console.warn("There was an error but no error was passed");
                notify({
                    type: "error",
                    message: reply.message,
                    delay: 5000
                })
            }
        }
        connect_button.disabled = true
        client_id.disabled = true
        update_button.disabled = false
        setTimeout(() => {
            disconnect_button.disabled = false
        }, 5000);
    }
})

update_button.addEventListener("click", () => {
    if (validateInputs() === true) {
        let p = {
            activity: buildActivity(),
            profile: saveProfiles()
        }
        let reply = ipc.sendSync("updateActivity", p)
        if (reply.type === "success" && reply.message) {
            notify({
                type: "success",
                message: reply.message,
                delay: 3000
            })
        }
        else if (reply.type === "error" && reply.message) {
            reply.error ? console.error(reply.error) : console.warn("There was an error but no error was passed");
            notify({
                type: "error",
                message: reply.message,
                delay: 5000
            })
        }
    }
})

load_button.addEventListener("show.bs.dropdown", () => {
    rebuildDropdown()
    let profiles = getProfiles()
    profiles.forEach(e => {
        let profile_name = e.replace(/.json/, "")
        createNewDropdownElement(profile_name)
    });
})

save_button.addEventListener("click", () => {
    let saveFileName = document.getElementById("saving_profile").value;
    if (validateSavefileName(saveFileName) === false) {
        //Returning if the Name is invalid (Notification gets created inside the function for more specific error)
        document.getElementById("saving_profile").value = "";
        saveModal.hide();
    }
    else {
        let p = {
            name: saveFileName,
            content: saveProfiles()
        }
        let reply = ipc.sendSync("saveProfile", p);
        document.getElementById("saving_profile").value = ""
        saveModal.hide()
        if (reply.type === "success" && reply.message) {
            notify({
                type: "success",
                message: reply.message,
                delay: 3000
            })
        }
        else if (reply.type === "error" && reply.message) {
            reply.error ? console.error(reply.error) : console.warn("There was an error but no error was passed");
            notify({
                type: "error",
                message: reply.message,
                delay: 5000
            })
        }
    }
})

disconnect_button.addEventListener("click", () => {
    let p = "Requesting destruction of current client and creation of a new client."
    let reply = ipc.sendSync("disconnectRPC", p);
    if (reply.type === "error" && reply.message) {
        reply.error ? console.error(reply.error) : console.warn("An error object was supposed to be passed but did do so.");
        notify({
            type: "error",
            message: reply.message,
            delay: 5000
        })
        return;
    } else if (reply.type === "success" && reply.message) {
        notify({
            type: "success",
            message: reply.message,
            delay: 3000
        })
    }
    setTimeout(() => {
        connect_button.disabled = false
    }, 5000);
    client_id.disabled = false
    update_button.disabled = true
    disconnect_button.disabled = true
})

clickForHelp.addEventListener("click", () => {
    shell.openExternal("https://github.com/JustRenox/Custom-Discord-RPC#preparation")
})

///////////////////////////////////////////////////////////
//  Functions                                           //
//////////////////////////////////////////////////////////

function validateSavefileName(saveFileName) {
    if (/^[A-Za-z0-9]*$/.test(saveFileName) === true) {
        if (saveFileName.length >= 5) {
            if (saveFileName.length <= 32) {
                let profilenames = getProfiles()
                let duplicat = false;
                profilenames.forEach(profile_Name => {
                    profile_Name = profile_Name.replace(/.json/, "")
                    if (profile_Name.toLowerCase() === saveFileName.toLowerCase()) {
                        duplicat = true
                        return false;
                    }
                });
                if (duplicat === true) {
                    notify({
                        type: "warning",
                        message: "There is already a profile with that name!",
                        delay: 5000
                    })
                    return false;
                }
                else {
                    return true;
                }
            } else {
                notify({
                    type: "warning",
                    message: "The profile name is too long (Max. 32 Characters)! The profile was therefore not saved.",
                    delay: 5000
                })
                return false;
            }
        } else {
            notify({
                type: "warning",
                message: "The filename is too short (Min. 5 Characters)! The profile was therefore not saved.",
                delay: 5000
            })
            return false;
        }
    } else {
        notify({
            type: "warning",
            message: "Invalid character! The profile was therefore not saved.",
            delay: 5000
        })
        return false;
    }
}

function validateInputs() {
    function throwError(message) {
        notify({
            type: "warning",
            message: message,
            delay: 5000
        })
    }
    const digitreg = /^\d+$/;
    const urlreg = /(http|https):\/\/[a-zA-Z0-9\-.]+\.[a-zA-Z]{2,6}(\/\S*)?$/;

    if (state_checkbox.checked === true) {
        if (state.value === "") {
            throwError("The State field can't be empty.")
            return false;
        }
    }

    if (details_checkbox.checked === true) {
        if (details.value === "") {
            throwError("The Details field can't be empty.")
            return false;
        }
    }

    if (timestamp_start_checkbox.checked === true) {
        if (timestamp_start.value === "") {
            throwError("The Timestamp-Start field can't be empty.")
            return false;
        }
        if (digitreg.test(timestamp_start.value) === false) {
            throwError("The Timestamp-Start field can only contain digits.")
            return false;
        }
        if (parseInt(timestamp_start.value) > 86400000) {
            throwError("The Timestamp-Start field can only be up to 86400000ms.")
            return false;
        }
    }

    if (timestamp_end_checkbox.checked === true) {
        if (timestamp_end.value === "") {
            throwError("The Timestamp-End field can't be empty.")
            return false;
        }
        if (digitreg.test(timestamp_end.value) === false) {
            throwError("The Timestamp-End field can only contain digits.")
            return false;
        }
        if (parseInt(timestamp_end.value) > 86400000) {
            throwError("The Timestamp-End field can only be up to 86400000ms.")
            return false;
        }
    }

    if (assets_large_image_checkbox.checked === true) {
        if (assets_large_image.value === "") {
            throwError("The Large-Image field can't be empty.")
            return false;
        }
    }
    if (assets_large_text_checkbox.checked === true && assets_large_image_checkbox.checked === true) {
        if (assets_large_image.value === "") {
            throwError("The Large-Text field can't be empty.")
            return false;
        }
    }
    if (assets_small_image_checkbox.checked === true) {
        if (assets_small_image.value === "") {
            throwError("The Small-Image field can't be empty.")
            return false;
        }
    }
    if (assets_small_text_checkbox.checked === true && assets_small_image_checkbox.checked === true) {
        if (assets_small_text.value === "") {
            throwError("The Small-Text field can't be empty.")
            return false;
        }
    }

    if (party_size_checkbox.checked === true) {
        if (party_size_current.value === "") {
            throwError("The Party-Size-Current field can't be empty.")
            return false;
        }
        if (digitreg.test(party_size_current.value) === false) {
            throwError("The Party-Size-Current field can only contain digits.")
            return false;
        }
        if (parseInt(party_size_current.value) > 100000000000) {
            throwError("The Party-Size-Current can only be up to 100,000,000,000.")
            return false;
        }
        if (party_size_maximum.value === "") {
            throwError("The Party-Size-Maximum field can't be empty.")
            return false;
        }
        if (digitreg.test(party_size_maximum.value) === false) {
            throwError("The Party-Size-Maximum field can only contain digits.")
            return false;
        }
        if (parseInt(party_size_maximum.value) > 100000000000) {
            throwError("The Party-Size-Maximum can only be up to 100,000,000,000.")
            return false;
        }
    }

    if (button_one_checkbox.checked === true) {
        if (button_label_one.value === "") {
            throwError("The Button-#1-Label field can't be empty.")
            return false;
        }
        if (button_url_one.value === "") {
            throwError("The Button-#1-URL field can't be empty.")
            return false;
        }
        if (urlreg.test(button_url_one.value) === false) {
            throwError("The Button-#1-URL field can only contain a valid HTTP link.")
            return false;
        }
    }

    if (button_two_checkbox.checked === true) {
        if (button_label_two.value === "") {
            throwError("The Button-#2-Label field can't be empty.")
            return false;
        }
        if (button_url_two.value === "") {
            throwError("The Button-#2-URL field can't be empty.")
            return false;
        }
        if (urlreg.test(button_url_two.value) === false) {
            throwError("The Button-#2-URL field can only contain a valid HTTP link.")
            return false;
        }
    }

    return true;
}

function buildActivity() {
    let activity = {}
    if (state_checkbox.checked === true) {
        activity.state = state.value
    }
    if (details_checkbox.checked === true) {
        activity.details = details.value
    }
    if (timestamp_start_checkbox.checked === true) {
        activity.timestamps = {}
        activity.timestamps.start = Date.now() - parseInt(timestamp_start.value)
    }
    if (timestamp_end_checkbox.checked === true) {
        if (!activity.timestamps) {
            activity.timestamps = {}
        }
        activity.timestamps.end = Date.now() + parseInt(timestamp_end.value)
    }
    if (assets_large_image_checkbox.checked === true) {
        activity.assets = {}
        activity.assets.large_image = assets_large_image.value
        if (assets_large_text_checkbox.checked === true) {
            activity.assets.large_text = assets_large_text.value
        }
    }
    if (assets_small_image_checkbox.checked === true) {
        if (!activity.assets) {
            activity.assets = {}
        }
        activity.assets.small_image = assets_small_image.value
        if (assets_small_text_checkbox.checked === true) {
            activity.assets.small_text = assets_small_text.value
        }
    }
    if (party_size_checkbox.checked === true) {
        activity.party = {}
        activity.party.size = [parseInt(party_size_current.value), parseInt(party_size_maximum.value)]
    }
    if (button_one_checkbox.checked === true) {
        activity.buttons = []
        activity.buttons.push({ label: button_label_one.value, url: button_url_one.value })
    }
    if (button_two_checkbox.checked === true) {
        if (!activity.buttons) {
            activity.buttons = []
        }
        activity.buttons.push({ label: button_label_two.value, url: button_url_two.value })
    }
    return activity
}

function loadThisStatus() {
    let profile_name = this.id ? "default/last" : this.value
    let reply = ipc.sendSync("getProfile", profile_name);
    if (reply.type === "success" && reply.content) {
        loadProfile(reply.content)
        notify({
            type: "success",
            message: reply.message,
            delay: 3000
        })
    }
    else if (reply.type === "error" && reply.message) {
        reply.error ? console.error(reply.error) : console.warn("An error object was supposed to be passed but did do so.");
        notify({
            type: "error",
            message: reply.message,
            delay: 5000
        })
    }
}

function loadProfile(profile) {
    let fields = document.querySelectorAll(".form-control:not([id=saving_profile])")
    fields.forEach(element => {
        element.value = ""
    })

    let inputs = profile.inputs
    let checkboxes = profile.checkboxes

    fields.forEach(element => {
        if (inputs[element.id]) {
            element.value = typeof inputs[element.id] ? inputs[element.id] : element.value
        }
    })

    //switching the checkboxes to the profiles settings
    state_checkbox.checked = typeof checkboxes.state_checkbox ? checkboxes.state_checkbox : state_checkbox.checked
    details_checkbox.checked = typeof checkboxes.details_checkbox ? checkboxes.details_checkbox : details_checkbox.checked
    timestamp_start_checkbox.checked = typeof checkboxes.timestamp_start_checkbox ? checkboxes.timestamp_start_checkbox : timestamp_start_checkbox.checked
    timestamp_end_checkbox.checked = typeof checkboxes.timestamp_end_checkbox ? checkboxes.timestamp_end_checkbox : timestamp_end_checkbox.checked
    assets_large_image_checkbox.checked = typeof checkboxes.assets_large_image_checkbox ? checkboxes.assets_large_image_checkbox : assets_large_image_checkbox.checked
    assets_large_text_checkbox.checked = typeof checkboxes.assets_large_text_checkbox ? checkboxes.assets_large_text_checkbox : assets_large_text_checkbox.checked
    assets_small_image_checkbox.checked = typeof checkboxes.assets_small_image_checkbox ? checkboxes.assets_small_image_checkbox : assets_small_image_checkbox.checked
    assets_small_text_checkbox.checked = typeof checkboxes.assets_small_text_checkbox ? checkboxes.assets_small_text_checkbox : assets_small_text_checkbox.checked
    party_size_checkbox.checked = typeof checkboxes.party_size_checkbox ? checkboxes.party_size_checkbox : party_size_checkbox.checked
    button_one_checkbox.checked = typeof checkboxes.button_one_checkbox ? checkboxes.button_one_checkbox : button_one_checkbox.checked
    button_two_checkbox.checked = typeof checkboxes.button_two_checkbox ? checkboxes.button_two_checkbox : button_two_checkbox.checked

    //Turning the inputs on depending on the checkbox state
    state.disabled = !checkboxes.state_checkbox
    details.disabled = !checkboxes.details_checkbox
    timestamp_start.disabled = !checkboxes.timestamp_start_checkbox
    timestamp_end.disabled = !checkboxes.timestamp_end_checkbox
    function activateLarge() {
        assets_large_image.disabled = false
        assets_large_text_checkbox.disabled = false
        assets_large_text.disabled = !assets_large_text_checkbox.checked
    }
    function deactivateLarge() {
        assets_large_image.disabled = true
        assets_large_text_checkbox.disabled = true
        assets_large_text.disabled = true
    }
    assets_large_image_checkbox.checked ? activateLarge() : deactivateLarge()
    function activateSmall() {
        assets_small_image.disabled = false
        assets_small_text_checkbox.disabled = false
        assets_small_text.disabled = !assets_small_text_checkbox.checked
    }
    function deactivateSmall() {
        assets_small_image.disabled = true
        assets_small_text_checkbox.disabled = true
        assets_small_text.disabled = true
    }
    assets_small_image_checkbox.checked ? activateSmall() : deactivateSmall()
    party_size_current.disabled = !checkboxes.party_size_checkbox
    party_size_maximum.disabled = !checkboxes.party_size_checkbox
    button_label_one.disabled = !checkboxes.button_one_checkbox
    button_url_one.disabled = !checkboxes.button_one_checkbox
    button_label_two.disabled = !checkboxes.button_two_checkbox
    button_url_two.disabled = !checkboxes.button_two_checkbox
}

function saveProfiles() {
    return {
        inputs: {
            client_id: client_id.value,
            state: state.value,
            details: details.value,
            timestamp_start: timestamp_start.value,
            timestamp_end: timestamp_end.value,
            assets_large_image: assets_large_image.value,
            assets_large_text: assets_large_text.value,
            assets_small_image: assets_small_image.value,
            assets_small_text: assets_small_text.value,
            party_size_current: party_size_current.value,
            party_size_maximum: party_size_maximum.value,
            button_label_one: button_label_one.value,
            button_url_one: button_url_one.value,
            button_label_two: button_label_two.value,
            button_url_two: button_url_two.value
        },
        checkboxes: {
            state_checkbox: state_checkbox.checked,
            details_checkbox: details_checkbox.checked,
            timestamp_start_checkbox: timestamp_start_checkbox.checked,
            timestamp_end_checkbox: timestamp_end_checkbox.checked,
            assets_large_image_checkbox: assets_large_image_checkbox.checked,
            assets_large_text_checkbox: assets_large_text_checkbox.checked,
            assets_small_image_checkbox: assets_small_image_checkbox.checked,
            assets_small_text_checkbox: assets_small_text_checkbox.checked,
            party_size_checkbox: party_size_checkbox.checked,
            button_one_checkbox: button_one_checkbox.checked,
            button_two_checkbox: button_two_checkbox.checked
        }
    }
}

function rebuildDropdown() {
    let dropdown = document.getElementById("profilelist")
    dropdown.innerHTML = ""
    let list_item_a = document.createElement("li")
    let list_item_b = document.createElement("li")
    let list_item_c = document.createElement("li")
    let content_a = document.createElement("a")
    let content_b = document.createElement("a")
    let content_c = document.createElement("hr")
    content_a.innerHTML = "Last Status"
    content_a.className = "dropdown-item loading_dropdown_option"
    content_a.onclick = loadThisStatus
    content_a.id = "default_Profile"
    content_b.innerHTML = "Open Folder"
    content_b.className = "dropdown-item"
    content_b.onclick = openFolder
    content_b.id = "default_Profile"
    content_c.className = "dropdown-divider"
    list_item_a.appendChild(content_a)
    dropdown.appendChild(list_item_a)
    list_item_b.appendChild(content_b)
    dropdown.appendChild(list_item_b)
    list_item_c.appendChild(content_c)
    dropdown.appendChild(list_item_c)
}

function getProfiles() {
    let p = "Requesting list of all profiles."
    let reply = ipc.sendSync("getProfiles", p);
    if (reply.type === "error" && reply.message) {
        reply.error ? console.error(reply.error) : console.warn("An error object was supposed to be passed but did do so.");
        notify({
            type: "error",
            message: reply.message,
            delay: 5000
        })
        return []
    }
    return reply.content

}

function createNewDropdownElement(profile_name) {
    let dropdown = document.getElementById("profilelist")
    let list_item = document.createElement("li")
    let content = document.createElement("a")
    content.value = profile_name
    content.innerHTML = profile_name
    content.className = "dropdown-item loading_dropdown_option"
    content.onclick = loadThisStatus
    list_item.appendChild(content)
    dropdown.appendChild(list_item)
}

function notify(options) {
    if (options.type === "error" || options.type === "warning" || options.type === "success") {
        if (!options.message) return console.warn("Warning: notify() was missing the message parameter!");
        let delay = 5000
        if (options.delay) {
            delay = options.delay
        }
        let newtoast = document.createElement("div")
        newtoast.setAttribute("class", "toast-div")
        newtoast.setAttribute("role", 'alert');
        newtoast.setAttribute('aria-live', 'assertive');
        newtoast.setAttribute('aria-atomic', 'true');

        let toastheader = document.createElement("div")
        toastheader.setAttribute("class", "toast-header")

        let toastimg = document.createElement("i")

        let toaststrong = document.createElement("strong")
        toaststrong.setAttribute("class", "me-auto")

        let toastbutton = document.createElement("button")
        toastbutton.setAttribute("class", "btn-close")
        toastbutton.setAttribute("type", "button")
        toastbutton.setAttribute("data-bs-dismiss", "toast")
        toastbutton.setAttribute("aria-label", "Close")

        let toastbody = document.createElement("div")
        toastbody.setAttribute("class", "toast-body")

        toastheader.appendChild(toastimg)
        toastheader.appendChild(toaststrong)
        toastheader.appendChild(toastbutton)

        newtoast.appendChild(toastheader)
        newtoast.appendChild(toastbody)
        document.getElementById("toast-container").appendChild(newtoast)
        let toasty = new bootstrap.Toast(newtoast, {
            autohide: false,
        })
        toasty.show()

        switch (options.type) {
            case "error":
                newtoast.className = "toast text-white notification-error"
                toastimg.className = "bi bi-x-octagon custom-icon-style"
                toaststrong.innerHTML = "Error:"
                break;
            case "warning":
                newtoast.className = "toast text-white notification-warning"
                toastimg.className = "bi bi-exclamation-triangle custom-icon-style"
                toaststrong.innerHTML = "Warning:"
                break;
            case "success":
                newtoast.className = "toast text-white notification-success"
                toastimg.className = "bi bi-check-square custom-icon-style"
                toaststrong.innerHTML = "Confirmation:"
                break;
        }

        toastbody.innerText = options.message
        setTimeout(() => {
            toasty.hide()
        }, delay);
        setTimeout(() => {
            newtoast.remove()
        }, delay + 250);
    } else {
        console.info("Invalid notification type!")
    }
}

function openFolder() {
    let p = "Request to open the Profiles Folder"
    let reply = ipc.sendSync("openFolder", p)
    if (reply.type === "success" && reply.message) {
        notify({
            type: "success",
            message: reply.message,
            delay: 3000
        })
    }
    else if (reply.type === "error" && reply.message) {
        reply.error ? console.error(reply.error) : console.warn("An error object was supposed to be passed but did do so.");
        notify({
            type: "error",
            message: reply.message,
            delay: 5000
        })
    }
}