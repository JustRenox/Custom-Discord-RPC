# Custom-Discord-RPC
![Here would be an example of how the Status could look like](https://media.discordapp.net/attachments/809971985580163082/814419491500195850/unknown.png)

## What is Custom-Discord-RPC
Custom-Discord-RPC is an app that allows for a better-looking Discord Status by using [Discord Rich Presence](https://discord.com/rich-presence).

The app allows you to put in your Rich Presence ClientID and all the individual options like assets and timestamps without the need to open an editor to change the values and then restart the process.

## Preparation
* Go to the [Discord Developer Portal](https://discord.com/developers/applications/) and create an application.
* Select the application and copy the ClientID of it under the "General Information" section.
* If you want to add image assets, head to the "Rich Presence" section and go to "Art Assets" and add the images there [Optional]

## Using the app
* Paste the ClientID of the application you create into the ClientID input
* You can now hit "Connect" to connect the app to Discord
* Now, you can press "Update" to update the status to the options that are on
* You can now close the window with the "close" button in the top right, and the process will run in the background. To completely close the app, you can right-click the tray icon and select the "Quit" option
* If you are happy with your status, you can either save it and simply load it the next time, or you can choose the "Last Status" option in the load menu to load the last used status
* If you want to change the ClientID, you can hit the "Disconnect" button and change the ClientID and then connect again

## Safety
At the time of writing, using something like Custom-Discord-RPC is not against Discord's Terms of Service since this is not automating your account or modifying your Discord client in any way, shape, or form.

## Others
* The image assets will take a few minutes until they are uploaded to Discord, so you might have to wait up to 15 minutes or longer. 
* If the large or small image isn't showing even though it's turned on, it's most likely because the name is wrong or it isn't in the assets of the application in the [Discord Developer Portal](https://discord.com/developers/applications/) yet.
* I managed to get the macOS version to work, but that's about everything I could do since I don't own any Apple Desktop, so if you want to contribute and create a proper macOS Version feel free to do so.

## Preview
![Here would be a preview of the status itself](https://media.discordapp.net/attachments/809971985580163082/814418690765488148/unknown.png)

![Here would be a preview of the app itself](https://media.discordapp.net/attachments/809971985580163082/814419220490092544/unknown.png)

Note: If both the Start and End Timestamp are turned on it will only show the time remaining.
