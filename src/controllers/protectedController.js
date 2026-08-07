import { AuthenticationError } from "../error.js";


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
        
        res.status(200).json({ message: "Token received — verification lands in the next stage" });
    
    
    } catch (err) {
        next(err);
    }
}

export default {
    getProfile
}