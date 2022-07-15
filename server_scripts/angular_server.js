const express = require('express');
const app = express();

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(express.static('F:/programming/Projects/Telemetry display/UOL-Racing/dist/uol-racing'));

app.listen(4400);
console.log("Angular page running on 4400")