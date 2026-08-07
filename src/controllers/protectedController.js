import { AuthenticationError } from "../error.js";
import authService from "../services/authService.js";

const getProfile = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        // missing || malformed authorization header || no token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthenticationError("Access token required");
        }

        const token = authHeader.slice('Bearer '.length).trim();
        if(!token) {
            throw new AuthenticationError("Access token required");
        }
        
        const user = await authService.verifyToken(token);
        res.status(200).json(user);
    
    } catch (err) {
        next(err);
    }
}

export default {
    getProfile
}