import { verifyAccessToken } from '../utils/jwt.js';
export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Access token is required' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = verifyAccessToken(token);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired access token' });
    }
};
//# sourceMappingURL=auth.middleware.js.map