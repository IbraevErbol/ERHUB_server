import express from 'express'
import { registerUser, loginUser, profileUser, profileUpdateUser } from '../Controllers/userController.js'; 
import { verifyToken } from '../Middleware/authMiddleware.js';
const router = express.Router();

router.post('/register', registerUser)
router.post('/login', loginUser);
router.get('/profile', verifyToken, profileUser);
router.put('/profile/update', verifyToken, profileUpdateUser)


// router.put('/profile', verifyToken, async (req, res) => {
//     try {
//       const { username, email, phoneNumber, gender, age } = req.body;
//       const user = await Users.findById(req.user._id);
  
//       if (!user) {
//         return res.status(404).json({ message: 'Пользователь не найден' });
//       }
  
//       if (username) user.username = username;
//       if (email) user.email = email;
//       if (phoneNumber) user.phoneNumber = phoneNumber;
//       if (gender) user.gender = gender;
//       if (age) user.age = age;
  
//       await user.save();
//       res.json({ message: 'Данные обновлены успешно', user });
//     } catch (error) {
//       res.status(500).json({ message: 'Ошибка обновления данных пользователя', error: error.message });
//     }
//   });
export default router;