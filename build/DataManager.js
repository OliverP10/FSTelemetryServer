"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = void 0;
//import { DataMapping } from './interfaces/common';
const Logger_1 = require("./Logger");
const DataMapping_1 = __importDefault(require("./models/DataMapping"));
class DataManager {
    //Loads the mappings file
    constructor(dbManager) {
        //fileName;
        this.allData = {};
        this.liveData = {};
        this.errorLog = [];
        this.logger = (0, Logger_1.BuildLogger)("DataManager");
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
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            const mappings = new DataMapping_1.default({
                functionName: "test1"
            });
        });
    }
}
exports.DataManager = DataManager;
