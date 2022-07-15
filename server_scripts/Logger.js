const fs = require('fs');

module.exports = class Logger {
    
    constructor() {
        this.enabled = true
        
        this.fileName = "../server_data/logs/["+new Date().toLocaleString().replaceAll("/","-").replaceAll(":","-")+"] Telemetry Log.csv"
        console.log("[INFO] Created Log file")
        this.firstWrite = true
        this.columns = []
        try {
            fs.writeFile(this.fileName, '', function (err) {
                if (err) throw err;
            });
        } catch(err){
            console.log("[ERROR] Unable to create log file, logging will be disabled")
            this.enabled = false
        }
    }

    writeLog(_liveData) {
        if(!this.enabled) {
            return
        }
        try {
            if(this.firstWrite) {
                for(let key in _liveData) {
                    this.columns.push(key)
                }
                fs.appendFile(this.fileName, this.columns.toString()+"\n", function (err) {
                    if (err) throw err;
                });
                this.firstWrite = false
            } else {
                let data = new Array(this.columns.length-1)
                for(let key in _liveData) {
                    data[this.columns.indexOf(key)] = _liveData[key]
                }
                fs.appendFile(this.fileName, data.toString()+"\n", function (err) {
                    if (err) throw err;
                });
            }
        } catch(err){
            console.log("[ERROR] Unable to write to file")
        }
    }
}
