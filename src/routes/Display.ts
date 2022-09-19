import express from 'express';
import controller from '../controllers/Display';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = express.Router();

router.post('/create', ValidateSchema(Schemas.display.create), controller.createDisplay);
router.get('/get/:displayId', controller.readDisplay);
router.get('/get', controller.readAll);
router.patch('/update/:displayId', ValidateSchema(Schemas.display.update), controller.updateDisplay);
router.delete('/delete/:displayId', controller.deleteDisplay);

export = router;
