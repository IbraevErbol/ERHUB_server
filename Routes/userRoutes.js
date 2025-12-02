import express from 'express'
import { registerUser, loginUser, profileUser, profileUpdateUser } from '../Controllers/userController.js'; 
import { verifyToken } from '../Middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser);
router.get('/profile', verifyToken, profileUser);
router.put('/profile/update', verifyToken, profileUpdateUser)


export default router;