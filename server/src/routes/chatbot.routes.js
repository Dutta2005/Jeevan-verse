import { Router } from 'express';
import {processChat } from '../controllers/chatbot.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT)

// Chat routes
router.post('/chat', processChat);

export default router;