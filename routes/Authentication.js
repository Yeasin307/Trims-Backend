const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { Users } = require("../models");
const { verifyToken } = require("../middlewares/Auth");

const { sign } = require("jsonwebtoken");

router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        const user = await Users.findOne({
            where: {
                [Op.and]: [
                    { email: `${email}` },
                    { password: `${password}` },
                    { role_id: "admin" }
                ]
            }
        });

        if (!user) {

            res.status(401).json({ error: "User Doesn't Exist" });
        }
        else {
            const token = sign(
                { username: user.username, id: user.id },
                process.env.JWT_SECRET,
                {
                    expiresIn: '1d'
                }
            );

            res.status(200).json({
                "access_token": token,
                "user": user
            });
        }
    }
    catch (error) {
        res.status(401).json({ error: "Authentication Failed!" });
    }
});

router.post("/check-login", verifyToken, async (req, res) => {
    try {
        const { id } = req.body;

        const user = await Users.findOne({
            where: {
                id: id
            }
        });

        if (!user) {

            res.status(401).json({ error: "User Doesn't Exist" });
        }
        else {
            res.status(200).send(user);
        }
    }
    catch (error) {
        res.status(401).json({ error: "Authentication Failed!" });
    }
});

module.exports = router;