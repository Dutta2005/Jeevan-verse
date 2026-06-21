import { Router } from 'express';
import {
  getSessions,
  createSession,
  getSession,
  deleteSession,
  sendMessage,
  uploadPrescription,
  getBehaviorInsights
} from '../controllers/chatbot.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// All routes require authentication
router.use(verifyJWT);

// Session management
router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/sessions/:sessionId', getSession);
router.delete('/sessions/:sessionId', deleteSession);

// Chat within a session
router.post('/sessions/:sessionId/message', sendMessage);

// Prescription upload
router.post('/sessions/:sessionId/upload', upload.single('prescription'), uploadPrescription);

// Behavior insights
router.get('/behavior', getBehaviorInsights);

export default router;