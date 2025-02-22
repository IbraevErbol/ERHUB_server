import jwt from 'jsonwebtoken'
export const verifyToken = async(req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if(!token){
        return res
            .status(403)
            .json({message: 'Токен не предоставлен'});
    }

    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if(err){
                    reject(new Error('Неверный или истекший токен'));
                }else{
                    resolve(decoded);
                }
            });
        });

        // Проверка наличия userId в декодированном токене
        if(!decoded.userId){
            return res.status(403).json({message: 'Некорректный токен'})
        }
        req.user = { _id: decoded.userId };
        next();
    } catch (error) {
        return res.status(403).json({ message: error.message });
    }     
}
