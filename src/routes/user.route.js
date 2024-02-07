import express from 'express';
import { AuthController } from '../controllers/index.js';
import { issueAuthToken, verifyOTP } from '../middleware/index.js';

const router = express.Router();

//  http://localhost:3000/auth/

// mode , phone, email
router.post('/otp', AuthController.sendOtp);
router.post('/register', verifyOTP, AuthController.register, issueAuthToken);
router.post('/login', AuthController.login, issueAuthToken);
router.post('/username-avilable', AuthController.isUsernameAvilable);

export default router;