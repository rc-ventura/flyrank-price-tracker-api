


const getProfile = (req, res) => {
    res.status(200).json(req.user);
};

const getDashboard = (req, res) => {
    res.status(200).json({ message: 'Welcome to your dashboard', user: req.user });
};

const getAdminArea = (req, res) => {
    res.status(200).json({ message: 'Welcome to the admin area', user: req.user });
};

export default {
    getProfile,
    getDashboard,
    getAdminArea
};