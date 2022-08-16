const fs = require('fs');

module.exports = class Logger {
    
    constructor() {
        this.enabled = true
        
        this.fileName = "../server_data/logs/["+new Date().toLocaleString().replaceAll("/","-").replaceAll(":","-")+"] Telemetry Log.csv"
        console.log("[INFO] Created Log file")
        
    }

    async generateLog(_allData) {
        this.columns = []
        try {
            fs.writeFile(this.fileName, '', function (err) {
                if (err) throw err;
            });
            for(let key in _allData) {
                this.columns.push(key)
            }
            fs.appendFile(this.fileName, this.columns.toString()+"\n", function (err) {
                if (err) throw err;
            });
            

            for(let i=0; i<_allData["time_stamp"].length; i++){
                let data = new Array(this.columns.length-1)
                for(let key in _allData) {
                    data[this.columns.indexOf(key)] = _allData[key][i]
                }
                fs.appendFile(this.fileName, data.toString()+"\n", function (err) {
                    if (err) throw err;
                });
            }
        } catch(err){
            console.log("[ERROR] Unable to generate log file")
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
