import express from 'express';
import controller from '../controllers/LabelMapping';
import { Schemas, ValidateSchema } from '../middleware/ValidateSchema';

const router = express.Router();

router.post('/create', ValidateSchema(Schemas.labelMapping.create), controller.createLabelMapping);
router.get('/get/:labelName', controller.readLabelMapping);
router.get('/get', controller.readAll);
router.patch('/update/:labelName', ValidateSchema(Schemas.labelMapping.update), controller.updateLabelMapping);
router.delete('/delete/:labelName', controller.deleteLabelMapping);

export = router;
