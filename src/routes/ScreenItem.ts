import express from 'express';
import controller from '../controllers/ScreenItem';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = express.Router();

router.post('/create', ValidateSchema(Schemas.screenItem.create), controller.createScreenItem);
router.get('/get/:screenItemId', controller.readScreenItem);
router.get('/get', controller.readAll);
router.patch('/update/:screenItemId', ValidateSchema(Schemas.screenItem.update), controller.updateScreenItem);
router.delete('/delete/:screenItemId', controller.deleteScreenItem);

export = router;
