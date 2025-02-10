import { Router } from 'express';
import { getCommonConditions, processChat } from '../controllers/chatbot.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT)

// Chat routes
router.get('/conditions', getCommonConditions);
router.post('/chat', processChat);

export default router;