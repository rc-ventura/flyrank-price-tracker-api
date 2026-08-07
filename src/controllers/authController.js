import authService from "../services/authService.js";



// POST /auth/signup
const signup = async (req, res, next) => {

    try {
        const user = await authService.signup(req.body ?? {});
        res.status(201).json(user);
    } catch (err) {
        next(err);
    }
}

// POST /auth/login
const login = async (req, res, next) => {

    try {
        const user = await authService.login(req.body ?? {});
        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
}

// POST /auth/logout
const logout = async (req, res, next) => {
    try {
        await authService.logout();
        res.status(204).send();
    } catch (err) {
        next(err);
    }
}

const refresh = async (req, res, next) => {
    try {
        const token = await authService.refresh(req.body ?? {});
        res.status(200).json(token);
    } catch (err) {
        next(err);
    }
}


export default {
    signup,
    login,
    logout,
    refresh
}
