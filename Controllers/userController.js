import Users from "../Models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const generateAccessToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export const registerUser = async (req, res) => {
    const { username, email, password, phoneNumber = "", age = null, gender = ""} = req.body;

    try {
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ error: 'Пользователь уже существует' })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Users({
            username,
            email,
            password: hashedPassword,
            phoneNumber: phoneNumber || '',  
            gender: gender || 'Male',        
            age: age || null     
        })
        await newUser.save()

        const token = generateAccessToken(newUser._id);
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Ошибка сервера', error: error.message });
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Users.findOne({ email })
        if (!user) {
            return res
                .status(404)
                .json({ error: "Пользователь не найден" })
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res
                .status(401)
                .json({ error: "Неверный пароль" })
        }

        const token = generateAccessToken(user._id)

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
}

export const profileUser = async (req, res) => {
    try {
        const user = await Users.findById(req.user._id)
        if (!user) {
            return res
                .status(404)
                .json({ message: 'Пользователь не найден' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.log('Error', error)
        res.status(500).json({ message: 'Ошибка при получении данных пользователя' })
    }
}

export const profileUpdateUser = async (req, res) => {
    const { name, profileImageUrl, phoneNumber, gender, age } = req.body;

    if (age && isNaN(age)) {
        return res.status(400).json({ message: 'Возраст должен быть числом' });
    }

    if (age && age < 18) {
        return res.status(400).json({ message: 'Возраст должен быть больше или равен 18' });
    }

    try {
        const user = await Users.findById(req.user._id);

        if (!user) {
            console.log('Пользователь не найден');
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        if (profileImageUrl) user.profileImageUrl = profileImageUrl;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (gender) user.gender = gender;
        if (age) user.age = age;
        if(name) user.username = name;

        await user.save();
        res.json({ message: 'Профиль обновлен успешно', user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Ошибка обновления профиля' });
    }
}