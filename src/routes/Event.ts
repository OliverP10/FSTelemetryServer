import express from 'express';
import controller from '../controllers/Event';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = express.Router();

router.get('/get', controller.readAll);
router.get('/getFromSessionStart', controller.readAllFromSessionStart);
router.get('/getRange/:from/:to', controller.readRange);

export = router;
