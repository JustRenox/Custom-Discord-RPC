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

//Status-Saving-Menu---------------------------------------
var saveModal = new bootstrap.Modal(document.getElementById('savinginput'), { keyboard: false })
//---------------------------------------------------------

///////////////////////////////////////////////////////////
//  Handling the checkbox switches                      //
//////////////////////////////////////////////////////////

state_checkbox.addEventListener("click", () => {
    state.disabled = state_checkbox.checked ? false : true
})

details_checkbox.addEventListener("click", () => {
    details.disabled = details_checkbox.checked ? false : true
})

timestamp_start_checkbox.addEventListener("click", () => {
    timestamp_start.disabled = timestamp_start_checkbox.checked ? false : true
})
timestamp_end_checkbox.addEventListener("click", () => {
    timestamp_end.disabled = timestamp_end_checkbox.checked ? false : true
})

assets_large_image_checkbox.addEventListener("click", () => {
    function activatedL() {
        assets_large_image.disabled = false
        assets_large_text_checkbox.disabled = false
        assets_large_text.disabled = assets_large_text_checkbox.checked ? false : true
    }
    function deactivatedL() {
        assets_large_image.disabled = true
        assets_large_text_checkbox.disabled = true
        assets_large_text.disabled = true
    }
    assets_large_image_checkbox.checked ? activatedL() : deactivatedL()
})
assets_large_text_checkbox.addEventListener("click", () => {
    assets_large_text.disabled = assets_large_text_checkbox.checked ? false : true
})

assets_small_image_checkbox.addEventListener("click", () => {
    function activatedS() {
        assets_small_image.disabled = false
        assets_small_text_checkbox.disabled = false
        assets_small_text.disabled = assets_small_text_checkbox.checked ? false : true
    }
    function deactivatedS() {
        assets_small_image.disabled = true
        assets_small_text_checkbox.disabled = true
        assets_small_text.disabled = true
    }
    assets_small_image_checkbox.checked ? activatedS() : deactivatedS()
})
assets_small_text_checkbox.addEventListener("click", () => {
    assets_small_text.disabled = assets_small_text_checkbox.checked ? false : true
})

party_size_checkbox.addEventListener("click", () => {
    party_size_current.disabled = party_size_checkbox.checked ? false : true
    party_size_maximum.disabled = party_size_checkbox.checked ? false : true
})

button_one_checkbox.addEventListener("click", () => {
    button_label_one.disabled = button_one_checkbox.checked ? false : true
    button_url_one.disabled = button_one_checkbox.checked ? false : true
})
button_two_checkbox.addEventListener("click", () => {
    button_label_two.disabled = button_two_checkbox.checked ? false : true
    button_url_two.disabled = button_two_checkbox.checked ? false : true
})

///////////////////////////////////////////////////////////
//  Handling the Status Buttons                         //
//////////////////////////////////////////////////////////

connect_button.addEventListener("click", () => {
    console.info("Connect")
})

update_button.addEventListener("click", () => {
    console.info("Update")
})

load_button.addEventListener("show.bs.dropdown", () => {
    rebuildDropdown()
    let profiles = getProfiles()
    profiles.forEach(e => {
        profile_name = e.replace(/.json/, "")
        createNewDropdownElement(profile_name)
    });
})

save_button.addEventListener("click", () => {
    savefileName = document.getElementById("saving_profile").value
    if (validateSavefileName(savefileName) == false) {
        //Returning if the Name is invalid (Notification gets created inside the function for more specific rrror)
        document.getElementById("saving_profile").value = ""
        saveModal.hide()
        return
    }
    else {
        let package = {
            name: savefileName,
            content: saveProfiles()
        }
        let reply = ipc.sendSync("saveProfile", package);
        document.getElementById("saving_profile").value = ""
        saveModal.hide()
        if (reply.type == "success" && reply.message) {
            notify({
                type: "success",
                message: reply.message,
                delay: 5000
            })
        }
        else if (reply.type == "error" && reply.message) {
            reply.error ? console.error(reply.error) : console.warn("There was an error but no error was passed");
            notify({
                type: "error",
                message: reply.message,
                delay: 10000
            })
        }
    }
})

disconnect_button.addEventListener("click", () => {
    console.info("Disconnect")
    notify({
        type: "error",
        message: "You did something wrong here",
        delay: 300000
    })
    notify({
        type: "warning",
        message: "You did something questionable here",
        delay: 300000
    })
    notify({
        type: "success",
        message: "You did something good here",
        delay: 300000
    })
})

///////////////////////////////////////////////////////////
//  Functions                                           //
//////////////////////////////////////////////////////////

function validateSavefileName(savefileName) {
    lettercheck = /^[A-Za-z0-9]*$/
    if (lettercheck.test(savefileName) == true) {
        if (savefileName.length >= 3) {
            if (savefileName.length <= 32) {
                profilenames = getProfiles()
                let duplicat
                profilenames.forEach(profile_Name => {
                    profile_Name = profile_Name.replace(/.json/, "")
                    if (profile_Name == savefileName) {
                        duplicat = true
                        return false;
                    }
                });
                if (duplicat == true) {
                    notify({
                        type: "warning",
                        message: "The is already a profile with that name!",
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
                    message: "The filename is too long (Max. 32 Characters)! The profile was not saved.",
                    delay: 5000
                })
                return false;
            }
        } else {
            notify({
                type: "warning",
                message: "The filename is too short (Min. 3 Characters)! The profile was not saved.",
                delay: 5000
            })
            return false;
        }
    } else {
        notify({
            type: "warning",
            message: "Invalid character! The profile was not saved.",
            delay: 5000
        })
        return false;
    }
}

function validateInputs() {
    return true;
}

function loadThisStatus() {
    let profile_name = this.id ? "default/last" : this.value
    let reply = ipc.sendSync("getProfile", profile_name);
    if (reply.type == "success" && reply.content) {
        loadProfile(reply.content)
        notify({
            type: "success",
            message: reply.message,
            delay: 5000
        })
    }
    else if (reply.type == "error" && reply.message) {
        reply.error ? console.error(reply.error) : console.warn("There was an error but no error object was passed");
        notify({
            type: "error",
            message: reply.message,
            delay: 10000
        })
    }
}

function loadProfile(profile) {
    let fields = document.querySelectorAll(".form-control:not([id=saving_profile])")
    fields.forEach(element => {
        element.value = ""
    })

    inputs = profile.inputs
    checkboxes = profile.checkboxes

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
    state.disabled = checkboxes.state_checkbox ? false : true
    details.disabled = checkboxes.details_checkbox ? false : true
    timestamp_start.disabled = checkboxes.timestamp_start_checkbox ? false : true
    timestamp_end.disabled = checkboxes.timestamp_end_checkbox ? false : true
    function activateLarge() {
        assets_large_image.disabled = false
        assets_large_text_checkbox.disabled = false
        assets_large_text.disabled = assets_large_text_checkbox.checked ? false : true
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
        assets_small_text.disabled = assets_small_text_checkbox.checked ? false : true
    }
    function deactivateSmall() {
        assets_small_image.disabled = true
        assets_small_text_checkbox.disabled = true
        assets_small_text.disabled = true
    }
    assets_small_image_checkbox.checked ? activateSmall() : deactivateSmall()
    party_size_current.disabled = checkboxes.party_size_checkbox ? false : true
    party_size_maximum.disabled = checkboxes.party_size_checkbox ? false : true
    button_label_one.disabled = checkboxes.button_one_checkbox ? false : true
    button_url_one.disabled = checkboxes.button_one_checkbox ? false : true
    button_label_two.disabled = checkboxes.button_two_checkbox ? false : true
    button_url_two.disabled = checkboxes.button_two_checkbox ? false : true
}

function saveProfiles() {
    let profile = {
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
    return profile
}

function rebuildDropdown() {
    let dropdown = document.getElementById("profilelist")
    dropdown.innerHTML = ""
    let list_item_a = document.createElement("li")
    let list_item_b = document.createElement("li")
    let content_a = document.createElement("a")
    let content_b = document.createElement("hr")
    content_a.innerHTML = "Last Used Profile"
    content_a.className = "dropdown-item loading_dropdown_option"
    content_a.onclick = loadThisStatus
    content_a.id = "default_Profile"
    content_b.className = "dropdown-divider"
    list_item_a.appendChild(content_a)
    dropdown.appendChild(list_item_a)
    list_item_b.appendChild(content_b)
    dropdown.appendChild(list_item_b)
}

function getProfiles() {
    let package = "Requesting list of all profiles"
    let reply = ipc.sendSync("getProfiles", package);
    if (reply.type == "error" && reply.message) {
        reply.error ? console.error(reply.error) : console.warn("There was an error but no error was passed");
        notify({
            type: "error",
            message: reply.message,
            delay: 10000
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
    if (options.type == "error" || options.type == "warning" || options.type == "success") {
        if (!options.message) return console.warn("Warning: notify() was missing the message parameter!");
        let delay = 5000
        if (options.delay) {
            delay = options.delay
        }
        let newtoast = document.createElement("div")
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
        console.log("Invalid notification type!")
        return
    }
}