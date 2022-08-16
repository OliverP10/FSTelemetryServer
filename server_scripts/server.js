
//Setup - Server
const socketIO = require("socket.io")(3000, {
  cors: {
    origin: "*"
  }
});

const Logger = require("./Logger")
const logger = new Logger();
const DataManager = require("./DataManager");
const dataManager = new DataManager();

//Run - Server
socketIO.on("connection", (socket) => {
    // send a message to the client
    //console.log("[INFO] Client Conected: "+socket.request.connection.remoteAddress)

    socket.on("setType", (type) => {
        if(type==="client"){
            //socket.emit("all-data", dataManager.applyToAll());
            socket.join("clients")
        } else if (type === "vehicle") {
            socket.join("vehicle")
            console.log("[INFO] Rover connected")
            socketIO.to("clients").emit("vehicle-connection",true)
        }
    });
    
    socket.on("all-data", (data) => {
        socketIO.to(socket.id).emit("all-data", dataManager.applyFunctionsAll());  // performance issue as formating data each time to each client could cache FIX!!!!
    });

    socket.on("key-frame", (data) => {
        socketIO.to("vehicle").emit("key-frame",data)
    });

    socket.on("control-frame", (data) => {
        socketIO.to("vehicle").emit("control-frame",data)
    });
    
    socket.on("live-data", (data) => {
        dataManager.updateAllData(JSON.parse(data));
        socketIO.to("clients").emit("live-data", dataManager.applyFunctionsLive());
    });

    socket.on("serial-port", (data) => {
        socketIO.to("clients").emit("serial-port",data)
    });

    socket.on("log", (data) => {
        socketIO.to("clients").emit("log",data)
    });

    socket.on('disconnect', (data) => {
        if(!socketIO.sockets.adapter.rooms.get('vehicle')) {
            socketIO.to("clients").emit("vehicle-connection",false)
            console.log('[WARN] Rover disconnected');
        }
    });
});




//Very basic backend API for now has very basic sanitaition but easy to add more


//Presets for each screen
const ScreenManager = require("./ScreenManager");
const screenManager = new ScreenManager();


const express = require('express');
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const bodyParser = require('body-parser')
const fs = require('fs');
let displays = require('../server_data/displays_data.json');


//Will take the form data and push it to list and then save the list to the file.
function addDisplay(display) {
    //Not sure if I need to account for conccurency in js \_(*_*)_/
    display['id'] = displays.id;            //pushes the id onto the display object
    displays.id+=1                          //increments id for next time
    displays.displays.push(display);
    let jsonString = JSON.stringify(displays, null, "\t");
    fs.writeFile('../server_data/displays_data.json', jsonString, err => {
        if (err) {
          console.error(err);
        }
    });
}

const app = express();
app.listen(3200, () => {
    console.log('[SUCCESS] Server API is listening on port 3200');
});
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/datalabels', (req, res) => {
    res.json({
        datalabels: Object.keys(dataManager.allData).filter(label=>label!=="time_stamp"&&label!=="logs")
    });
});

app.get('/displays', (req, res) => {
    res.json(displays);
});

app.get('/screens', (req, res) => {
    res.json({
        screens: screenManager.screens
    });
});

app.get('/logs', (req, res) => {

    logger.generateLog(dataManager.allData)
    
    res.sendFile(__dirname.replace("server_scripts","")+logger.fileName.replace("../",""), {}, function (err) {
        if (err) {
            console.log("[ERROR] Unable to send logs to client")
        }
    });
});

app.post('/update',[
    //no error checking but dont think the user can brake it without custom requests
    ],(req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
      }
      screenManager.updateScreens(req.body, displays.displays)
      console.log("[INFO] Updated displays")
      return res.json({ok:true});
    },
);

//Handles post request for graphs
app.post('/create-display-graph',[
    body('type').isAlpha('en-GB',{}).withMessage('A type must be selected').withMessage('Title must be unique'),
    body('title').isAlphanumeric('en-GB',{ignore:" "}).withMessage('Title has invalid characters').custom(title => { 
        for(let display of displays.displays) {
            if (display.title == title) {
                return false
            }
        }
        return true
     }).withMessage('Title must be unique!'),
     body('colSize').isInt({min:1, max:4}).toInt().withMessage('Width must be between 1 and 4'),
     body('rowSize').isInt({min:1, max:4}).toInt().withMessage('Height must be between 1 and 4'),
     body('dataLabels').isArray().customSanitizer(datalabels => {
        let labels = []
        for (let label of datalabels){
            if (label[Object.keys(label)[0]]==true) {
                labels.push(Object.keys(label)[0])
            }
        }
        labels.push("time_stamp")
        return labels
    }).custom(datalabels => {
        if(datalabels.length==1){
            return false
        }
        return true
    }).withMessage('Label must be selected'),
    ],(req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
      }
      addDisplay(req.body)
      return res.json({ok:true});
    },
  );

  //Handles post request for guages
  app.post('/create-display-guage',[
    body('type').isAlpha('en-GB',{}).withMessage('A type must be selected'),
    body('title').isAlphanumeric('en-GB',{ignore:" -"}).withMessage('Title has invalid characters').custom(title => { 
        for(let display of displays.displays) {
            if (display.title == title) {
                return false
            }
        }
        return true
     }).withMessage('Title must be unique!'),
     body('colSize').isInt({min:1, max:4}).toInt().withMessage('Width must be between 1 and 4'),
     body('rowSize').isInt({min:1, max:4}).toInt().withMessage('Height must be between 1 and 4'),
     body('units'),     //WARNING-Not santized - find the one for exlclude '{' and '}'
     body('minValue').isInt().toInt().withMessage('Min value must be a number'),
     body('maxValue').isInt().toInt().withMessage('Max value must be a number'),
     body('majorTicks').isArray().customSanitizer(majorTicks => {
        let ticks = []
        for (let tick of majorTicks){
           ticks.push(tick.tick)
        }
        return ticks
    }).custom(majorTicks => {
        for(let item of majorTicks) {
            if (!typeof item.tick == 'number') {
                return false
            }
        }
        return true
    }).withMessage('Ticks must be numbers'),
     body('minorTicks').isInt().toInt().withMessage('Minor ticks must be a number'),
     body('highlights').isArray().custom(highlights => {
        for (let highlight of highlights) {
            if (!typeof highlight.from == 'number' || !typeof highlight.to == 'number' ){
                return false;
            }
        }
        return true
    }).withMessage('Hilights must be number and a valid colour'),
     body('dataLabels').isArray().customSanitizer(datalabels => {
        let labels = []
        for (let label of datalabels){
            if (label[Object.keys(label)[0]]==true) {
                labels.push(Object.keys(label)[0])
            }
        }
        return labels
    }).custom(datalabels => {
        if(datalabels.length==0){
            return false
        }
        return true
    }).withMessage('Label must be selected'),
    ],(req, res) => {
      // Finds the validation errors in this request and wraps them in an object with handy functions
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()});
      }

      addDisplay( reformatJson(req.body) )
      return res.json({ok:true});
    },
);

//Some of the data coming from the form needs restructuring
function reformatJson(_json) {
    const items = ["units","minValue","maxValue","majorTicks","minorTicks","highlights"]
    let newJson = {options:{}};
    for(let key in _json) {
        if(items.includes(key)) {
            newJson.options[key] = _json[key]
        } else {
            newJson[key] = _json[key]
        } 
    }
    return newJson;
}

