const fs = require('fs');
module.exports = class ScreenManager {
    screensFileName;
    displayFileName;
    screens;

    constructor() {
        this.screensFileName="../server_data/screen_data.json"
        this.displayFileName="../server_data/displays_data.json"

        fs.readFile(this.screensFileName, 'utf8' , (err, data) => {
            if (err) {
                console.error(err)
                console.warn("[ERROR] Failed to load screen data")
                return
            }
            this.screens = JSON.parse(data);
            console.log("[SUCCESS] Loaded screen data");
        });
    }

    updateScreens(data, allDisplays) {
        this.saveScreen(data);
    }

    saveDisplay(displays, allDisplays) { //concurrency violation but locks dont exist in js
        for(let i=0; i<allDisplays.length;i++) {
            for(let d of displays) {
                if(allDisplays[i].id==d.id) {
                    allDisplays[i]=d
                }
                break
            }
        }

        let jsonString = JSON.stringify(allDisplays, null, "\t");
        fs.writeFile(this.displayFileName, jsonString, err => {
            if (err) {
              console.error(err)
              return
            }
        })
    }

    saveScreen(data) {
        this.screens[data.screensName] = data.screens
        let jsonString = JSON.stringify(this.screens, null, "\t");
        fs.writeFile(this.screensFileName, jsonString, err => {
            if (err) {
              console.error(err)
              return
            }
        })
    }


    


}