import express from 'express';
import controller from '../controllers/ScreenItem';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = express.Router();

router.get('/get/:screenItemId', controller.readScreenItem);
router.get('/get', controller.readAll);
router.delete('/delete/:screenItemId', controller.deleteScreenItem);

export = router;
