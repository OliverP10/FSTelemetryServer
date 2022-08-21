"use strict";
//Setup - Server
const socketIO = require("socket.io")(3000, {
    cors: {
        origin: "*"
    }
});
//Run - Server
socketIO.on("connection", (socket) => {
    // send a message to the client
    //console.log("[INFO] Client Conected: "+socket.request.connection.remoteAddress)
    socket.on("setType", (type) => {
        if (type === "client") {
            //socket.emit("all-data", dataManager.applyToAll());
            socket.join("clients");
        }
        else if (type === "vehicle") {
            socket.join("vehicle");
            console.log("[INFO] Rover connected");
            socketIO.to("clients").emit("vehicle-connection", true);
        }
    });
    socket.on("key-frame", (data) => {
        socketIO.to("vehicle").emit("key-frame", data);
    });
    socket.on("control-frame", (data) => {
        socketIO.to("vehicle").emit("control-frame", data);
    });
    socket.on('disconnect', (data) => {
        if (!socketIO.sockets.adapter.rooms.get('vehicle')) {
            socketIO.to("clients").emit("vehicle-connection", false);
            console.log('[WARN] Rover disconnected');
        }
    });
});
