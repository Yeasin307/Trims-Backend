const { verify } = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    try {
        const { authorization } = req.headers;
        const token = authorization.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: "User Not Authorized!" });
        }
        else {
            const payload = verify(token, process.env.JWT_SECRET);

            if (payload) {
                next();
            }
            else {
                res.status(401).json({ error: "User Not Authorized!" });
            }
        }
    }
    catch (error) {
        res.status(401).json({ error: "error" });
    }
};

module.exports = { verifyToken };