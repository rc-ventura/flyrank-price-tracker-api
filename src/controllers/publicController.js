

// GET /public/info
const getPublicInfo = async (req, res, next) => {
    try {
        const message = {"message": "Welcome stranger! This info is public."};
        res.status(200).json(message);
    } catch (err) {
        next(err);
    }
}



export default {
    getPublicInfo
}
