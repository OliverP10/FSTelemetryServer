import { Server, Socket } from 'socket.io'
import { Logger } from 'winston'
import { vehicleType } from './common'
import { DataManager } from './DataManager'
import { BuildLogger } from './Logger'

export class SocketIOServer {
    private logger: Logger
    private port: number
    private socketIO: Server

    constructor(port: number, dataManager: DataManager) {
        this.logger = BuildLogger("SocketIO")
        this.port = port
        this.socketIO = new Server(this.port, {
            cors: {
                origin: "*"
            }
        });
        this.logger.info(`Server listening on port ${this.port}.`)
        this.setup()
    }

    private setup() {
        this.socketIO.on("connection", (socket:Socket) => {
            
            socket.on("setType", (type) => {
                if(type==="client"){
                    socket.join("clients")
                } else if (type === "vehicle") {
                    socket.join("vehicle")
                    this.logger.info(`${vehicleType} connected`)
                    this.socketIO.to("clients").emit("vehicle-connection",true)
                }
            });
            
            socket.on("all-data", (data) => {
                //socketIO.to(socket.id).emit("all-data", dataManager.applyFunctionsAll());  // performance issue as formating data each time to each client could cache FIX!!!!
            });
        
            socket.on("key-frame", (data) => {
                this.socketIO.to("vehicle").emit("key-frame",data)
            });
        
            socket.on("control-frame", (data) => {
                this.socketIO.to("vehicle").emit("control-frame",data)
            });
            
            socket.on("live-data", (data) => {
                //dataManager.updateAllData(JSON.parse(data));
                //socketIO.to("clients").emit("live-data", dataManager.applyFunctionsLive());
            });
        
            socket.on("serial-port", (data) => {
                this.socketIO.to("clients").emit("serial-port",data)
            });
        
            socket.on("log", (data) => {
                this.socketIO.to("clients").emit("log",data)
            });
        
            socket.on('disconnect', (data) => {
                if(!this.socketIO.sockets.adapter.rooms.get('vehicle')) {
                    this.socketIO.to("clients").emit("vehicle-connection",false)
                    this.logger.warn(`${vehicleType} disconnected`);
                }
            });
            
        });
        
    }
}
