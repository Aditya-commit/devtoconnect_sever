import express from 'express';
import { viewFeedback , addFeedback } from '../controllers/feedbackController.js';

const router = express.Router();


router.get('/:id' , viewFeedback);
router.post('/add_feedback' , addFeedback)

export default router;