const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const { Op } = require("sequelize");

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

module.exports = router;