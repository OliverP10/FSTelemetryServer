// const fs = require('fs');
// var clone = require('clone');
import { Logger } from 'winston';
import { DbManager } from './DbManger';
//import { DataMapping } from './interfaces/common';
import { BuildLogger } from './Logger';
import DataMapping, { IDataMapping } from './models/DataMapping';

export class DataManager {
    logger: Logger;
    dbManager: DbManager;
    dataMappings: any[];

    //fileName;

    allData = {};
    liveData = {};
    errorLog = [];

    //Loads the mappings file
    constructor(dbManager: DbManager) {
        this.logger = BuildLogger('DataManager');
        this.dbManager = dbManager;
        this.dataMappings = [];
        this.setup();

        // this.fileName = "../server_data/mappings.json";

        // fs.readFile(this.fileName, 'utf8' , (err, data) => {
        //     if (err) {
        //         console.error(err)
        //         console.warn("[ERROR] Failed to load adjustData data for data labels")
        //         return
        //     }
        //     this.mappings = JSON.parse(data);
        //     console.log("[SUCCESS] Loaded adjustData data values");
        // });
    }

    async setup() {
        const mappings = DataMapping.find();
        console.log(mappings);
    }

    // //Allows specific attributes to be updated (NOT IN USE ATM)
    // update(_form:any) {
    //     this.mappings[_form.dataLabel] =  JSON.parse(_form.config);
    //     this.writeToFile(JSON.stringify(this.mappings,null, "\t"));
    // }

    // //Allows writing to a the file with passed cotent
    // writeToFile(content) {
    //     fs.writeFile(this.fileName, content, err => {
    //         if (err) {
    //           console.error(err)
    //           return
    //         }
    //     })
    // }

    // //If the live data has a key that is not already in allData then it creates it else it pushes it to the list
    // //If the live data is missing a key that is in all data then it will push the previous value

    // updateAllData(_liveData) {
    //     this.liveData = _liveData
    //     let timeLength = this.allData["time_stamp"]?.length || 0

    //     for(let key in this.liveData) {
    //         if(this.allData.hasOwnProperty(key)){
    //             this.allData[key].push(this.liveData[key])
    //         } else {
    //             this.allData[key] = Array(timeLength).fill(0)
    //             this.allData[key].push(this.liveData[key]);
    //         }
    //     }

    //     for(let key in this.allData) {
    //         if(!this.liveData.hasOwnProperty(key) && key != 'logs') {
    //             this.allData[key].push(this.allData[key][this.allData[key].length-1])
    //         }
    //     }
    // }

    // checkErrors(_liveData) {
    //     let warnings=[]
    //     for (let key in _liveData) {
    //         if(_liveData[key]===""){
    //             warnings.push({
    //                 dataLabel: key,
    //                 type: "sensorLost",
    //                 error: "No Data"
    //             })
    //         }else if(this.mappings.hasOwnProperty(key) && typeof this.mappings[key].nominalBoundry !== 'undefined' && typeof this.mappings[key].warningBoundry !== 'undefined') {
    //             if(_liveData[key] < this.mappings[key].nominalBoundry.from || _liveData[key] > this.mappings[key].nominalBoundry.to) {
    //                 warnings.push({
    //                     dataLabel: key,
    //                     type: "nominalBound",
    //                     error: "Outside of nominal bounds of min:"+this.mappings[key].nominalBoundry.from+" max:"+this.mappings[key].nominalBoundry.to+" with value of:"+_liveData[key]
    //                 })
    //             }
    //             for(let warningBoundry of this.mappings[key].warningBoundry) {
    //                 if(_liveData[key] >= warningBoundry.from && _liveData[key] <= warningBoundry.to) {
    //                     warnings.push({
    //                         dataLabel: key,
    //                         type: "warningBound",
    //                         error: "Inside of warning bound of min: "+warningBoundry.from+" max: "+warningBoundry.to+" with value of: "+_liveData[key]
    //                     })
    //                 }
    //             }
    //         }
    //     }
    //     this.errorLog.push({[_liveData["time_stamp"]]: warnings})
    //     _liveData["errors"] = warnings;
    // }

    // //Will get passesd a function name and data
    // //it will then perform that function on the passed data and return it
    // adjustDataLabel(label,data) {
    //     if(!this.mappings.hasOwnProperty(label)||!this.mappings[label].hasOwnProperty("functionName")){
    //         return data
    //     }
    //     const functionName = this.mappings[label].functionName;
    //     const params = this.mappings[label].params

    //     switch (functionName) {
    //         case "offset":
    //             return this.offset(params,data);
    //         case "normalize":
    //             return this.normalize(params,data);
    //         case "linearConvertion":
    //             return this.linearConvertion(params,data);
    //         case "boolToInt":
    //             return this.booleanToInteger(params,data);
    //     }
    // }

    // //Will loop through each key in allData and apply the function to mapped to it in the json
    // applyFunctionsAll() {
    //     let _allData = clone(this.allData);
    //     for(let key in _allData) {
    //         if(this.mappings.hasOwnProperty(key)){
    //             for (let i = 0; i < _allData[key].length; i++) {
    //                 _allData[key][i] = this.adjustDataLabel(key,_allData[key][i])
    //             }
    //         }
    //     }
    //     return _allData;
    // }

    // //Will loop through each key in live data and apply the function mapped to it in the json
    // applyFunctionsLive() {
    //     let _liveData = clone(this.liveData)
    //     for(let key in _liveData) {
    //         _liveData[key] = this.adjustDataLabel(key,_liveData[key])
    //     }
    //     for(let key in this.allData) {
    //         if(!this.liveData.hasOwnProperty(key) && key != 'logs') {
    //             _liveData[key] = this.allData[key][this.allData[key].length-1]
    //         }
    //     }
    //     this.checkErrors(_liveData);
    //     return _liveData;
    // }

    // //Functions that can be used for now

    // //just adds onto the data value
    // offset(params,data) {
    //     return data+params.offsetBy;
    // }

    // //puts the data between 0 and 100
    // normalize(params,data) {
    //     return (((data - params.min) / (params.max - params.min)) * params.multiplier).toFixed(2);
    // }

    // //puts data between a range
    // linearConvertion(params,data) {
    //     const oldRange = params.oldMax - params.oldMin;
    //     const newRange = params.newMax - params.newMin;
    //     return (((data - params.oldMin) * newRange) / oldRange) + params.newMin;
    // }

    // booleanToInteger(params,data) {
    //     if(!isNaN(data)){
    //         return data
    //     }
    //     return (data) ? 1 : 0
    // }
}
