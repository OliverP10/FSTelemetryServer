import express from 'express';
import controller from '../controllers/Telemetry';

const router = express.Router();

router.get('/get', controller.readAll);
router.get('/getFromSessionStart', controller.readAllFromSessionStart);
router.get('/getLatestFromSession/:labelName', controller.readLatestTelemetry);
router.get('/getAllUniqueFromSessionStart', controller.readAllUniqueFromSessionStart);
router.get('/getAllLabelsFromSessionStart', controller.readAllLabelsFromSessionStart);
router.get('/getRange/:from/:to', controller.readRange);

export = router;
