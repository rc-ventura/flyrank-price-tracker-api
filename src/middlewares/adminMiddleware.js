import { ForbiddenError } from "../error.js";

// Authorization guard
const requireAdmin = (req, res, next) => {
    try {
        if (req.user?.role !== 'admin') {
            throw new ForbiddenError("Admin access required");
        }
        next();
    } catch (err) {
        next(err);
    }
}

export default requireAdmin;
