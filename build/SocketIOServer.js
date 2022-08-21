"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketIOServer = void 0;
const socket_io_1 = require("socket.io");
const common_1 = require("./common");
const Logger_1 = require("./Logger");
class SocketIOServer {
    constructor(port, dataManager) {
        this.logger = (0, Logger_1.BuildLogger)("SocketIO");
        this.port = port;
        this.socketIO = new socket_io_1.Server(this.port, {
            cors: {
                origin: "*"
            }
        });
        this.logger.info(`Server listening on port ${this.port}.`);
        this.setup();
    }
    setup() {
        this.socketIO.on("connection", (socket) => {
            socket.on("setType", (type) => {
                if (type === "client") {
                    socket.join("clients");
                }
                else if (type === "vehicle") {
                    socket.join("vehicle");
                    this.logger.info(`${common_1.vehicleType} connected`);
                    socketIO.to("clients").emit("vehicle-connection", true);
                }
            });
            socket.on("all-data", (data) => {
                //socketIO.to(socket.id).emit("all-data", dataManager.applyFunctionsAll());  // performance issue as formating data each time to each client could cache FIX!!!!
            });
            socket.on("key-frame", (data) => {
                socketIO.to("vehicle").emit("key-frame", data);
            });
            socket.on("control-frame", (data) => {
                socketIO.to("vehicle").emit("control-frame", data);
            });
            socket.on("live-data", (data) => {
                //dataManager.updateAllData(JSON.parse(data));
                //socketIO.to("clients").emit("live-data", dataManager.applyFunctionsLive());
            });
            socket.on("serial-port", (data) => {
                socketIO.to("clients").emit("serial-port", data);
            });
            socket.on("log", (data) => {
                socketIO.to("clients").emit("log", data);
            });
            socket.on('disconnect', (data) => {
                if (!socketIO.sockets.adapter.rooms.get('vehicle')) {
                    socketIO.to("clients").emit("vehicle-connection", false);
                    this.logger.warn(`${common_1.vehicleType} disconnected`);
                }
            });
        });
    }
}
exports.SocketIOServer = SocketIOServer;
