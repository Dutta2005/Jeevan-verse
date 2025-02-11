import { Router } from 'express';
import {
    getComments,
    addComment,
    updateComment,
    deleteComment
} from '../controllers/comment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// /api/v1/comments

router.use(verifyJWT);

router.get('/post/:postId', getComments);
router.get('/comment/:parentCommentId', getComments);
router.post('/post/:postId', addComment);
router.post('/comment/:parentCommentId', addComment);
router.patch('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

export default router;