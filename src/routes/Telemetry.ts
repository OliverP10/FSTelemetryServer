import express from 'express';
import controller from '../controllers/Telemetry';

const router = express.Router();

router.get('/get', controller.readAll);

export = router;
