import express from 'express';
import controller from '../controllers/Screen';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = express.Router();

router.get('/get/:screenName', controller.readScreen);
router.get('/get', controller.readAll);
router.patch('/update/:screenName', ValidateSchema(Schemas.screen.update), controller.updateScreen);

export = router;
