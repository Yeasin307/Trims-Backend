const { verify } = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {
        const { authorization } = req.headers;
        const token = authorization.split(' ')[1];

        if (!token) return res.json({ error: "User not logged in!" });

        const validToken = verify(token, process.env.JWT_SECRET);

        if (validToken) {
            return next();
        }
    } catch (error) {
        return res.json({ error: "error" });
    }
};

module.exports = { verifyToken };