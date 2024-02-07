import express from 'express';
import { ChatProfileController } from '../controllers/index.js';
import { isAuth } from '../middleware/index.js';

const router = express.Router();

//  http://localhost:3000/chat/


// chat routes
router.post('/user-search', isAuth, ChatProfileController.findUsers);
router.post('/user-details', isAuth, ChatProfileController.getUserDetails);
router.post('/get-friends', isAuth, ChatProfileController.getFreinds);
router.post('/get-chats', isAuth, ChatProfileController.getChats);
router.post('/get-upload-url', isAuth, ChatProfileController.getUploadURL);
router.post('/get-file-url', isAuth, ChatProfileController.getFileURL);
export default router;